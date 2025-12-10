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
import { and, asc, eq, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface CycleCompleteRequest {
  chatId: string;
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

export const completeCycle = withErrorHandler(
  withAuthHandler<CycleCompleteRequest, Cycle>(async ({ chatId, cycleId }) => {
    const chat = await drizzleClient.query.chats.findFirst({
      where: eq(chats.id, chatId),
    });
    if (!chat) {
      return { message: "Chat not found", code: 404 };
    }

    const cycle = await drizzleClient.query.cycles.findFirst({
      where: eq(cycles.id, cycleId),
      with: { request: { with: { attachments: true } } },
    });
    if (!cycle) {
      return { message: "Cycle not found", code: 404 };
    }

    const prevCycles = await drizzleClient.query.cycles.findMany({
      where: and(
        eq(cycles.chatId, chatId),
        lt(cycles.createdAt, cycle.createdAt),
      ),
      orderBy: asc(cycles.createdAt),
      with: { context: true },
    });

    const response = await fetch(
      `${serverEnv.CHAT2EDIT_API_URL}/chat2edit/generate`,
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
        .where(eq(chats.id, chatId));
      return { message: "Failed to complete cycle", code: response.status };
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

    const [context] = await drizzleClient
      .insert(contexts)
      .values({
        fileId: context_file_id,
      })
      .returning();

    const [completedCycle] = await drizzleClient
      .update(cycles)
      .set({
        responseId: responseMessage.id,
        jsonData: cycleJsonData,
        contextId: context.id,
      })
      .where(eq(cycles.id, cycle.id))
      .returning();

    revalidatePath(`/chats/${chatId}`);
    return {
      message: "Cycle completed successfully",
      code: 200,
      data: completedCycle,
    };
  }),
);
