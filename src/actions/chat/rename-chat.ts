"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { type Chat, chats } from "@/lib/drizzle/drizzle-schema";
import {
  withAuthHandler,
  withErrorHandler,
} from "@/utils/server/server-action-handlers";
import { eq } from "drizzle-orm";

interface RenameChatRequest {
  chatId: string;
  title: string;
}

export const renameChat = withErrorHandler(
  withAuthHandler<RenameChatRequest, Chat>(
    async ({ userId, chatId, title }) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        return { message: "Title cannot be empty", code: 400 };
      }

      const chat = await drizzleClient.query.chats.findFirst({
        where: eq(chats.id, chatId),
      });

      if (!chat) {
        return { message: "Chat not found", code: 404 };
      }

      if (chat.userId !== userId) {
        return { message: "Unauthorized", code: 401 };
      }

      const [updatedChat] = await drizzleClient
        .update(chats)
        .set({
          title: trimmedTitle,
          updatedAt: new Date(),
        })
        .where(eq(chats.id, chatId))
        .returning();

      return {
        message: "Chat renamed successfully",
        code: 200,
        data: updatedChat,
      };
    },
  ),
);
