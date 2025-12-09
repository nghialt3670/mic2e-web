import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  Chat,
  Message,
  chats,
  cycles as cyclesTable,
  messages,
  messages as messagesTable,
} from "@/lib/drizzle/drizzle-schema";
import {
  withAuthHandler,
  withErrorHandler,
} from "@/utils/server/server-action-handlers";

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

interface GetResponseRequest {
  chatId: string;
}

export const getResponse = withErrorHandler(
  withAuthHandler<GetResponseRequest, Message>(async ({ chatId }) => {
    const response = await fetch(`${serverEnv.CHAT2EDIT_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatId }),
    });
  }),
);
