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
import { withAuthHandler, withErrorHandler } from "@/utils/server/action-utils";
import { serverEnv } from "@/utils/server/env-utils";
import { and, asc, eq, gt, inArray, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface CycleCompleteRequest {
  cycleId: string;
}

interface Chat2EditGenerateRequest {
  message: {
    text: string;
    attachments: {
      file_id: string;
      filename: string;
    }[];
  };
  history: Record<string, any>[];
  context_file_id: string;
}

interface Chat2EditGenerateResponse {
  message: {
    text: string;
    attachments: {
      file_id: string;
      filename: string;
    }[];
  };
  cycle: Record<string, any>;
  context_file_id: string;
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

    revalidatePath(`/chats/${chatId}`);
    return {
      message: "Cycle created successfully",
      code: 200,
      data: createdCycle,
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
    });
    if (!chat) {
      return {
        message: "Chat not found",
        code: 404,
        data: undefined as any,
      };
    }

    const prevCycles = await drizzleClient.query.cycles.findMany({
      where: and(
        eq(cycles.chatId, cycle.chatId),
        lt(cycles.createdAt, cycle.createdAt),
      ),
      orderBy: asc(cycles.createdAt),
      with: { context: true },
    });

    // Delete cycles created after the current one (revert functionality)
    // Use a safer approach: query for cycles to delete first, then delete by ID
    const cyclesToDelete = await drizzleClient.query.cycles.findMany({
      where: and(
        eq(cycles.chatId, cycle.chatId),
        gt(cycles.createdAt, cycle.createdAt),
      ),
      columns: { id: true },
    });

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

    const response = await fetch(
      `${serverEnv.AGENT_API_HOST}/chat2edit/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            text: cycle.request.text,
            attachments: cycle.request.attachments.map((attachment) => ({
              file_id: attachment.fileId,
              filename: attachment.filename,
            })),
          },
          history: prevCycles.map((cycle) => cycle.jsonData),
          context_file_id: prevCycles.at(-1)?.context?.fileId,
        } as Chat2EditGenerateRequest),
      },
    );

    if (!response.ok) {
      await drizzleClient
        .update(chats)
        .set({ failed: true })
        .where(eq(chats.id, cycle.chatId));

      revalidatePath(`/chats/${cycle.chatId}`);

      return {
        message: "Failed to generate cycle",
        code: response.status,
        data: undefined as any, // Required by ApiResponse
      };
    }

    const payload = await response.json();
    const {
      message,
      cycle: cycleJsonData,
      context_file_id,
    } = payload.data as Chat2EditGenerateResponse;

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

    const [completedCycle] = await drizzleClient
      .update(cycles)
      .set({
        responseId: responseMessage.id,
        jsonData: cycleJsonData,
      })
      .where(eq(cycles.id, cycle.id))
      .returning();

    revalidatePath(`/chats/${cycle.chatId}`);
    return {
      message: "Cycle completed successfully",
      code: 200,
      data: completedCycle,
    };
  }),
);
