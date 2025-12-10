"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { Chat, chats } from "@/lib/drizzle/drizzle-schema";
import {
  withAuthHandler,
  withErrorHandler,
} from "@/utils/server/action-utils";
import { and, eq } from "drizzle-orm";

interface ChatCreateRequest {
  chat: Omit<Chat, "id" | "createdAt" | "updatedAt">;
}


export const createChat = withErrorHandler(
  withAuthHandler<ChatCreateRequest, Chat>(async ({ userId, chat }) => {
    const [createdChat] = await drizzleClient
      .insert(chats)
      .values({ ...chat, userId })
      .returning();

    return {
      message: "Chat created successfully.",
      code: 200,
      data: createdChat,
    };
  }),
);

interface ChatUpdateRequest {
  chatId: string;
  chat: Omit<Chat, "id" | "createdAt" | "updatedAt">;
}

export const updateChat = withErrorHandler(
  withAuthHandler<ChatUpdateRequest, Chat>(async ({ userId, chatId, chat }) => {
    const [updatedChat] = await drizzleClient
      .update(chats)
      .set({ ...chat })
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .returning();

    return {
      message: "Chat updated successfully.",
      code: 200,
      data: updatedChat,
    };
  }),
);


interface ChatDeleteRequest {
  chatId: string;
}

export const deleteChat = withErrorHandler(
  withAuthHandler<ChatDeleteRequest, Chat>(async ({ userId, chatId }) => {
    const [deletedChat] = await drizzleClient
      .delete(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .returning();

    return {
      message: "Chat deleted successfully.",
      code: 200,
      data: deletedChat,
    };
  }),
);
