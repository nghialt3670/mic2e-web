"use server";

import { auth } from "@/auth";
import { db } from "@/lib/drizzle/db";
import { chats, messages } from "@/lib/drizzle/schema";
import { type Message } from "@/lib/drizzle/schema";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { and, eq } from "drizzle-orm";

interface GetMessagesRequest {
  chatId: string;
  limit?: number;
  cursor?: string;
}

export const getMessages = withErrorHandler<GetMessagesRequest, Message[]>(
  async ({ chatId, limit = 10, cursor }) => {
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

    const messagesData = await db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      orderBy: messages.createdAt,
      limit: limit,
    });

    return {
      message: "Messages fetched successfully",
      code: 200,
      data: messagesData,
    };
  },
);
