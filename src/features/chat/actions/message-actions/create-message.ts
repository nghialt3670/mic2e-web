"use server";

import { auth } from "@/auth";
import { db } from "@/lib/drizzle/db";
import { chats, messages } from "@/lib/drizzle/schema";
import { type Message } from "@/lib/drizzle/schema";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { and, eq } from "drizzle-orm";

interface CreateMessageRequest {
  chatId: string;
  message: Omit<Message, "id" | "chatId" | "sender" | "createdAt">;
}

export const createMessage = withErrorHandler<CreateMessageRequest, Message>(
  async ({ chatId, message }) => {
    const session = await auth();
    if (!session?.user?.id) {
      return { message: "Unauthorized", code: 401 };
    }

    const sessionUserId = session.user.id;

    const chat = await db.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, sessionUserId)),
    });

    if (!chat) {
      return { message: "Chat not found", code: 404 };
    }

    const createdMessage = await db
      .insert(messages)
      .values({
        chatId,
        sender: "user",
        text: message.text,
      })
      .returning()
      .then((rows) => rows[0]);

    return {
      message: "Message created successfully",
      code: 200,
      data: createdMessage,
    };
  },
);
