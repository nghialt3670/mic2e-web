import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  attachments,
  chats,
  contexts,
  Cycle,
  cycles,
  cycles as cyclesTable,
  messages,
} from "@/lib/drizzle/drizzle-schema";
import {
  withAuthHandler,
  withErrorHandler,
} from "@/utils/server/server-action-handlers";
import { serverEnv } from "@/utils/server/server-env";
import { asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface CycleCompleteRequest {
  chatId: string;
}

interface Chat2EditGenerateRequest {
  message: {
    text: string;
    attachments: {
      file_id: string;
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
    }[];
  };
  cycle: Record<string, any>;
  context_file_id: string;
}

export const completeCycle = withErrorHandler(
  withAuthHandler<CycleCompleteRequest, Cycle>(async ({ chatId }) => {
    const chat = await drizzleClient.query.chats.findFirst({
      where: eq(chats.id, chatId),
    });
    if (!chat) {
      return { message: "Chat not found", code: 404 };
    }

    const allCycles = await drizzleClient.query.cycles.findMany({
      where: eq(cycles.chatId, chatId),
      orderBy: asc(cycles.createdAt),
      with: {
        request: {
          with: {
            attachments: true,
          },
        },
        context: true,
      },
    });

    const lastCycle = allCycles.at(-1);
    if (!lastCycle) {
      return { message: "No cycle found", code: 404 };
    }
    if (lastCycle.responseId) {
      return { message: "Last message already has a response", code: 400 };
    }

    const previousCycles = allCycles.slice(0, -1);
    const secondToLastCycle = previousCycles.at(-1);

    const response = await fetch(
      `${serverEnv.CHAT2EDIT_API_URL}/chat2edit/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            text: lastCycle.request.text,
            attachments: lastCycle.request.attachments.map((attachment) => ({
              file_id: attachment.fileId,
            })),
          },
          history: previousCycles.map((cycle) => cycle.jsonData),
          context_file_id: secondToLastCycle?.context?.fileId,
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
    const { message, cycle, context_file_id } =
      payload.data as Chat2EditGenerateResponse;

    if (lastCycle.contextId) {
      await drizzleClient
        .update(contexts)
        .set({ fileId: context_file_id })
        .where(eq(contexts.id, lastCycle.contextId));
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
        .where(eq(cycles.id, lastCycle.id));
    }

    const responseMessage = await drizzleClient
      .insert(messages)
      .values({
        text: message.text,
      })
      .returning()
      .then((rows) => rows[0]);

    await drizzleClient.insert(attachments).values(
      message.attachments.map((attachment) => ({
        messageId: responseMessage.id,
        fileId: attachment.file_id,
      })),
    );

    const [context] = await drizzleClient
      .insert(contexts)
      .values({
        fileId: context_file_id,
      })
      .returning()

    const [completedCycle] = await drizzleClient
      .update(cycles)
      .set({
        responseId: responseMessage.id,
        jsonData: cycle,
        contextId: context.id,
      })
      .where(eq(cycles.id, lastCycle.id))
      .returning();

    revalidatePath(`/chats/${chatId}`);
    return { message: "Cycle completed successfully", code: 200, data: completedCycle };
  }),
);
