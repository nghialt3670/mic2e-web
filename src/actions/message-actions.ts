"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  Message,
  cycles as cyclesTable,
  messages as messagesTable,
} from "@/lib/drizzle/drizzle-schema";
import { withAuthHandler, withErrorHandler } from "@/utils/server/action-utils";

interface MessageCreateRequest {
  chatId: string;
  message: Omit<Message, "id" | "createdAt" | "updatedAt">;
}

export const createMessage = withErrorHandler(
  withAuthHandler<MessageCreateRequest, Message>(
    async ({ chatId, message }) => {
      const createdMessage = await drizzleClient
        .insert(messagesTable)
        .values([message])
        .returning()
        .then((rows) => rows[0]);

      await drizzleClient
        .insert(cyclesTable)
        .values({
          chatId: chatId,
          requestId: createdMessage.id,
        })
        .returning()
        .then((rows) => rows[0]);

      return {
        message: "Message created successfully.",
        code: 200,
        data: createdMessage,
      };
    },
  ),
);
