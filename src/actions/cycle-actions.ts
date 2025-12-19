"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  Cycle,
  attachments,
  chats,
  contexts,
  cycles,
  messages,
} from "@/lib/drizzle/drizzle-schema";
import logger from "@/lib/logger";
import { withAuthHandler, withErrorHandler } from "@/utils/server/action-utils";
import { serverEnv } from "@/utils/server/env-utils";
import { to } from "await-to-js";
import { and, asc, eq, gt, inArray, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface CycleCompleteRequest {
  cycleId: string;
}

interface LlmConfig {
  provider: "openai" | "google";
  api_key?: string;
  model: string;
  params?: Record<string, any>;
}

interface Chat2EditConfig {
  max_prompt_cycles?: number;
  max_llm_exchanges?: number;
}

interface Chat2EditGenerateRequest {
  llm_config?: LlmConfig;
  chat2edit_config?: Chat2EditConfig;
  message: {
    text: string;
    attachments: {
      file_id: string;
      filename: string;
    }[];
  };
  history: Record<string, any>[];
  context_file_id?: string;
}

interface Chat2EditGenerateResponse {
  message?: {
    text: string;
    attachments: {
      file_id: string;
      filename: string;
    }[];
  };
  cycle: Record<string, any>;
  context_file_id: string;
}

interface Chat2EditProgressEvent {
  type:
    | "request"
    | "prompt"
    | "answer"
    | "extract"
    | "execute"
    | "complete"
    | "error";
  message?: string;
  data?: Record<string, any>;
}

/**
 * Maps frontend LLM model names to backend provider and model
 */
function mapLlmModelToConfig(llmModel: string): LlmConfig {
  // Map model name to provider and actual model name
  const modelMap: Record<
    string,
    { provider: "openai" | "google"; model: string }
  > = {
    "gpt-3.5-turbo": { provider: "openai", model: "gpt-3.5-turbo" },
    "gemini-2.5-flash": { provider: "google", model: "gemini-2.5-flash" },
  };

  const mapping = modelMap[llmModel];

  if (!mapping) {
    // Default to Google's gemini-2.5-flash if model not found
    console.warn(
      `Unknown LLM model: ${llmModel}, defaulting to gemini-2.5-flash`,
    );
    return {
      provider: "google",
      model: "gemini-2.5-flash",
      params: {},
    };
  }

  return {
    provider: mapping.provider,
    model: mapping.model,
    params: {},
  };
}

interface CycleCreateRequest {
  chatId: string;
  requestId: string;
}

export const createCycle = withErrorHandler(
  withAuthHandler<CycleCreateRequest, Cycle>(async ({ chatId, requestId }) => {
    const [createdCycle] = await drizzleClient
      .insert(cycles)
      .values({
        chatId,
        requestId,
      })
      .returning();

    revalidatePath(`/c/${chatId}`);
    return {
      message: "Cycle created successfully",
      code: 200,
      data: createdCycle,
    };
  }),
);

export const clearCycle = withErrorHandler(
  withAuthHandler<CycleCompleteRequest, Cycle>(async ({ cycleId }) => {
    const cycle = await drizzleClient.query.cycles.findFirst({
      where: eq(cycles.id, cycleId),
    });
    if (!cycle) {
      return {
        message: "Cycle not found",
        code: 404,
        data: undefined as any,
      };
    }

    // Delete cycles created after the current one (revert functionality)
    // Use a safer approach: query for cycles to delete first, then delete by ID
    const cyclesToDelete = await drizzleClient.query.cycles.findMany({
      where: and(
        eq(cycles.chatId, cycle.chatId),
        gt(cycles.createdAt, cycle.createdAt),
      ),
      with: { context: true },
    });

    // Collect message IDs, context IDs, context file IDs, and attachment file IDs to delete
    const messageIdsToDelete = new Set<string>();
    const contextIdsToDelete = new Set<string>();
    const contextFileIdsToDelete = new Set<string>();
    const attachmentFileIdsToDelete = new Set<string>();

    for (const cycleToDelete of cyclesToDelete) {
      if (cycleToDelete.responseId)
        messageIdsToDelete.add(cycleToDelete.responseId);
      if (cycleToDelete.contextId) {
        contextIdsToDelete.add(cycleToDelete.contextId);
        if (cycleToDelete.context?.fileId) {
          contextFileIdsToDelete.add(cycleToDelete.context.fileId);
        }
      }
    }

    // Also collect message and context IDs from the current cycle (except request)
    if (cycle.responseId) messageIdsToDelete.add(cycle.responseId);
    if (cycle.contextId) {
      contextIdsToDelete.add(cycle.contextId);
      // Get the context to retrieve its fileId
      const currentContext = await drizzleClient.query.contexts.findFirst({
        where: eq(contexts.id, cycle.contextId),
      });
      if (currentContext?.fileId) {
        contextFileIdsToDelete.add(currentContext.fileId);
      }
    }

    // Get all attachments from messages to be deleted
    if (messageIdsToDelete.size > 0) {
      const attachmentsToDelete =
        await drizzleClient.query.attachments.findMany({
          where: inArray(attachments.messageId, Array.from(messageIdsToDelete)),
        });
      for (const attachment of attachmentsToDelete) {
        attachmentFileIdsToDelete.add(attachment.fileId);
      }
    }

    // Reset the current cycle FIRST: remove response, context, and jsonData, keep only request
    // This removes foreign key references so we can safely delete messages and contexts
    await drizzleClient
      .update(cycles)
      .set({
        responseId: null,
        contextId: null,
        jsonData: null,
      })
      .where(eq(cycles.id, cycleId));

    // Only delete if there are cycles to delete, and explicitly exclude current cycle
    if (cyclesToDelete.length > 0) {
      const idsToDelete = cyclesToDelete
        .map((c) => c.id)
        .filter((id) => id !== cycleId); // Safety check: never delete the current cycle

      if (idsToDelete.length > 0) {
        await drizzleClient
          .delete(cycles)
          .where(inArray(cycles.id, idsToDelete));
      }
    }

    // Delete orphaned messages (CASCADE will automatically delete attachments)
    if (messageIdsToDelete.size > 0) {
      await drizzleClient
        .delete(messages)
        .where(inArray(messages.id, Array.from(messageIdsToDelete)));
    }

    // Delete orphaned contexts
    if (contextIdsToDelete.size > 0) {
      await drizzleClient
        .delete(contexts)
        .where(inArray(contexts.id, Array.from(contextIdsToDelete)));
    }

    // Delete context files from storage
    if (contextFileIdsToDelete.size > 0) {
      const deletePromises = Array.from(contextFileIdsToDelete).map((fileId) =>
        fetch(`${serverEnv.STORAGE_API_HOST}/files/${fileId}`, {
          method: "DELETE",
        }).catch((error) => {
          logger.error(
            "CycleActions",
            `Failed to delete context file ${fileId}`,
            error,
          );
        }),
      );
      await Promise.all(deletePromises);
    }

    // Delete attachment files from storage
    if (attachmentFileIdsToDelete.size > 0) {
      const deletePromises = Array.from(attachmentFileIdsToDelete).map(
        (fileId) =>
          fetch(`${serverEnv.STORAGE_API_HOST}/files/${fileId}`, {
            method: "DELETE",
          }).catch((error) => {
            logger.error(
              "CycleActions",
              `Failed to delete attachment file ${fileId}`,
              error,
            );
          }),
      );
      await Promise.all(deletePromises);
    }

    // Get the cleared cycle to return
    const clearedCycle = await drizzleClient.query.cycles.findFirst({
      where: eq(cycles.id, cycleId),
    });

    revalidatePath(`/c/${cycle.chatId}`);
    return {
      message: "Cycle cleared successfully",
      code: 200,
      data: clearedCycle,
    };
  }),
);

export const generateCycle = withErrorHandler(
  withAuthHandler<CycleCompleteRequest, Cycle>(async ({ cycleId }) => {
    const cycle = await drizzleClient.query.cycles.findFirst({
      where: eq(cycles.id, cycleId),
      with: { request: { with: { attachments: true } } },
    });
    if (!cycle) {
      return {
        message: "Cycle not found",
        code: 404,
        data: undefined as any,
      };
    }

    const chat = await drizzleClient.query.chats.findFirst({
      where: eq(chats.id, cycle.chatId),
      with: { settings: true },
    });
    if (!chat) {
      return {
        message: "Chat not found",
        code: 404,
        data: undefined as any,
      };
    }

    // Get LLM config from chat settings snapshot
    const llmConfig = chat.settings
      ? mapLlmModelToConfig(chat.settings.llmModel)
      : {
          provider: "google" as const,
          model: "gemini-2.0-flash-exp",
          params: {},
        };

    // Default Chat2Edit config
    const chat2editConfig: Chat2EditConfig = {
      max_prompt_cycles: 5,
      max_llm_exchanges: 2,
    };

    const prevCycles = await drizzleClient.query.cycles.findMany({
      where: and(
        eq(cycles.chatId, cycle.chatId),
        lt(cycles.createdAt, cycle.createdAt),
      ),
      orderBy: asc(cycles.createdAt),
      with: { context: true },
    });

    // Set chat as generating (not failed) at the start
    await drizzleClient
      .update(chats)
      .set({ failed: false })
      .where(eq(chats.id, cycle.chatId));

    // Trigger generation with progress tracking (fire and forget)
    const [error, response] = await to(
      fetch(`${serverEnv.AGENT_API_URL}/chat2edit/generate/${cycleId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          llm_config: llmConfig,
          chat2edit_config: chat2editConfig,
          message: {
            text: cycle.request.text,
            attachments: cycle.request.attachments.map((attachment) => ({
              file_id: attachment.fileId,
              filename: attachment.filename,
            })),
          },
          history: prevCycles.map((cycle) => cycle.jsonData),
          context_file_id: prevCycles.at(-1)?.context?.fileId || undefined,
        } as Chat2EditGenerateRequest),
      }),
    );

    if (error || !response?.ok) {
      logger.error("CycleActions", "Failed to start generation", error);

      await drizzleClient
        .update(chats)
        .set({ failed: true })
        .where(eq(chats.id, cycle.chatId));

      revalidatePath(`/c/${cycle.chatId}`);

      return {
        message: "Failed to start generation",
        code: response?.status || 500,
        data: undefined as any,
      };
    }

    // Return immediately - the frontend will connect to WebSocket for progress
    return {
      message: "Generation started",
      code: 200,
      data: cycle,
    };
  }),
);

interface SaveGenerationResultRequest {
  cycleId: string;
  result: Chat2EditGenerateResponse;
}

export const saveGenerationResult = withErrorHandler(
  withAuthHandler<SaveGenerationResultRequest, Cycle>(
    async ({ cycleId, result }) => {
      const cycle = await drizzleClient.query.cycles.findFirst({
        where: eq(cycles.id, cycleId),
      });
      if (!cycle) {
        return {
          message: "Cycle not found",
          code: 404,
          data: undefined as any,
        };
      }

      const { message, cycle: cycleJsonData, context_file_id } = result;

      if (cycle.contextId) {
        await drizzleClient
          .update(contexts)
          .set({ fileId: context_file_id })
          .where(eq(contexts.id, cycle.contextId));
      } else {
        const context = await drizzleClient
          .insert(contexts)
          .values({
            fileId: context_file_id,
          })
          .returning()
          .then((rows) => rows[0]);
        await drizzleClient
          .update(cycles)
          .set({ contextId: context.id })
          .where(eq(cycles.id, cycle.id));
      }

      if (message) {
        const responseMessage = await drizzleClient
          .insert(messages)
          .values({
            text: message.text,
          })
          .returning()
          .then((rows) => rows[0]);

        if (message.attachments.length > 0) {
          await drizzleClient.insert(attachments).values(
            message.attachments.map((attachment) => ({
              messageId: responseMessage.id,
              fileId: attachment.file_id,
              filename: attachment.filename,
            })),
          );
        }

        await drizzleClient
          .update(cycles)
          .set({ responseId: responseMessage.id })
          .where(eq(cycles.id, cycle.id));

        await drizzleClient
          .update(chats)
          .set({ failed: false })
          .where(eq(chats.id, cycle.chatId));
      } else {
        await drizzleClient
          .update(chats)
          .set({ failed: true })
          .where(eq(chats.id, cycle.chatId));
      }

      const [completedCycle] = await drizzleClient
        .update(cycles)
        .set({
          jsonData: cycleJsonData,
        })
        .where(eq(cycles.id, cycle.id))
        .returning();

      revalidatePath(`/c/${cycle.chatId}`);
      return {
        message: "Cycle saved successfully",
        code: 200,
        data: completedCycle,
      };
    },
  ),
);

export const generateCycleStream = withErrorHandler(
  withAuthHandler<CycleCompleteRequest, Cycle>(async ({ cycleId }) => {
    const cycle = await drizzleClient.query.cycles.findFirst({
      where: eq(cycles.id, cycleId),
      with: { request: { with: { attachments: true } } },
    });
    if (!cycle) {
      return {
        message: "Cycle not found",
        code: 404,
        data: undefined as any,
      };
    }

    const chat = await drizzleClient.query.chats.findFirst({
      where: eq(chats.id, cycle.chatId),
      with: { settings: true },
    });
    if (!chat) {
      return {
        message: "Chat not found",
        code: 404,
        data: undefined as any,
      };
    }

    // Get LLM config from chat settings snapshot
    const llmConfig = chat.settings
      ? mapLlmModelToConfig(chat.settings.llmModel)
      : {
          provider: "google" as const,
          model: "gemini-2.0-flash-exp",
          params: {},
        };

    // Default Chat2Edit config
    const chat2editConfig: Chat2EditConfig = {
      max_prompt_cycles: 5,
      max_llm_exchanges: 2,
    };

    const prevCycles = await drizzleClient.query.cycles.findMany({
      where: and(
        eq(cycles.chatId, cycle.chatId),
        lt(cycles.createdAt, cycle.createdAt),
      ),
      orderBy: asc(cycles.createdAt),
      with: { context: true },
    });

    // Set chat as generating (not failed) at the start
    await drizzleClient
      .update(chats)
      .set({ failed: false })
      .where(eq(chats.id, cycle.chatId));

    // Create abort controller with timeout (5 minutes)
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 5 * 60 * 1000);

    const [error, response] = await to(
      fetch(`${serverEnv.AGENT_API_URL}/chat2edit/generate/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          llm_config: llmConfig,
          chat2edit_config: chat2editConfig,
          message: {
            text: cycle.request.text,
            attachments: cycle.request.attachments.map((attachment) => ({
              file_id: attachment.fileId,
              filename: attachment.filename,
            })),
          },
          history: prevCycles.map((cycle) => cycle.jsonData),
          context_file_id: prevCycles.at(-1)?.context?.fileId || undefined,
        } as Chat2EditGenerateRequest),
        signal: abortController.signal,
      }),
    );

    clearTimeout(timeoutId);

    if (error || !response?.ok) {
      const isTimeout = error?.name === "AbortError";
      logger.error(
        "CycleActions",
        isTimeout
          ? "Generate cycle stream timed out"
          : "Failed to generate cycle stream",
        error,
      );

      await drizzleClient
        .update(chats)
        .set({ failed: true })
        .where(eq(chats.id, cycle.chatId));

      revalidatePath(`/c/${cycle.chatId}`);

      return {
        message: isTimeout ? "Request timed out" : "Failed to generate cycle",
        code: response?.status || 500,
        data: undefined as any,
      };
    }

    // Parse SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalResult: Chat2EditGenerateResponse | null = null;

    if (!reader) {
      await drizzleClient
        .update(chats)
        .set({ failed: true })
        .where(eq(chats.id, cycle.chatId));

      return {
        message: "Failed to read stream",
        code: 500,
        data: undefined as any,
      };
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const eventData = line.slice(6);
            const event = JSON.parse(eventData) as Chat2EditProgressEvent;

            if (event.type === "complete" && event.data) {
              finalResult = event.data as Chat2EditGenerateResponse;
            } else if (event.type === "error") {
              throw new Error(event.message || "Unknown error");
            }
            // Progress events are ignored on server side, they will be handled by client
          }
        }
      }
    } catch (e) {
      logger.error("CycleActions", "Error reading stream", e);
      await drizzleClient
        .update(chats)
        .set({ failed: true })
        .where(eq(chats.id, cycle.chatId));

      return {
        message: "Error processing stream",
        code: 500,
        data: undefined as any,
      };
    }

    if (!finalResult) {
      await drizzleClient
        .update(chats)
        .set({ failed: true })
        .where(eq(chats.id, cycle.chatId));

      return {
        message: "Stream did not complete successfully",
        code: 500,
        data: undefined as any,
      };
    }

    const { message, cycle: cycleJsonData, context_file_id } = finalResult;

    if (cycle.contextId) {
      await drizzleClient
        .update(contexts)
        .set({ fileId: context_file_id })
        .where(eq(contexts.id, cycle.contextId));
    } else {
      const context = await drizzleClient
        .insert(contexts)
        .values({
          fileId: context_file_id,
        })
        .returning()
        .then((rows) => rows[0]);
      await drizzleClient
        .update(cycles)
        .set({ contextId: context.id })
        .where(eq(cycles.id, cycle.id));
    }

    if (message) {
      const responseMessage = await drizzleClient
        .insert(messages)
        .values({
          text: message.text,
        })
        .returning()
        .then((rows) => rows[0]);

      if (message.attachments.length > 0) {
        await drizzleClient.insert(attachments).values(
          message.attachments.map((attachment) => ({
            messageId: responseMessage.id,
            fileId: attachment.file_id,
            filename: attachment.filename,
          })),
        );
      }

      await drizzleClient
        .update(cycles)
        .set({ responseId: responseMessage.id })
        .where(eq(cycles.id, cycle.id));

      await drizzleClient
        .update(chats)
        .set({ failed: false })
        .where(eq(chats.id, cycle.chatId));
    } else {
      await drizzleClient
        .update(chats)
        .set({ failed: true })
        .where(eq(chats.id, cycle.chatId));
    }

    const [completedCycle] = await drizzleClient
      .update(cycles)
      .set({
        jsonData: cycleJsonData,
      })
      .where(eq(cycles.id, cycle.id))
      .returning();

    revalidatePath(`/c/${cycle.chatId}`);
    return {
      message: "Cycle completed successfully",
      code: 200,
      data: completedCycle,
    };
  }),
);
