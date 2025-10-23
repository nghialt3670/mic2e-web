"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { attachments, chats, messages } from "@/lib/drizzle/drizzle-schema";
import { type Message } from "@/lib/drizzle/drizzle-schema";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { getSessionUserId } from "@/utils/server/session";
import { and, eq } from "drizzle-orm";

interface CreateMessageRequest {
  chatId: string;
  message: Omit<Message, "id" | "chatId" | "sender" | "createdAt">;
  attachmentUrls?: string[];
}

export const createMessage = withErrorHandler<CreateMessageRequest, Message>(
  async ({ chatId, message, attachmentUrls = [] }) => {
    const userId = await getSessionUserId();
    if (!userId) {
      return { message: "Unauthorized", code: 401 };
    }

    const chat = await drizzleClient.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    });
    if (!chat) {
      return { message: "Chat not found", code: 404 };
    }

    const createdMessage = await drizzleClient
      .insert(messages)
      .values({
        chatId,
        sender: "user",
        text: message.text,
      })
      .returning()
      .then((rows) => rows[0]);

    // Create attachments if any URLs provided
    if (attachmentUrls.length > 0) {
      const attachmentData = attachmentUrls.map((url) => ({
        messageId: createdMessage.id,
        url: url,
      }));

      await drizzleClient.insert(attachments).values(attachmentData);
    }

    await drizzleClient
      .update(chats)
      .set({
        title: message.text,
        updatedAt: new Date(),
      })
      .where(eq(chats.id, chatId));

    return {
      message: "Message created successfully",
      code: 200,
      data: createdMessage,
    };
  },
);
