"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { Chat, ChatStatus, chats } from "@/lib/drizzle/drizzle-schema";
import {
  withAuthHandler,
  withErrorHandler,
} from "@/utils/server/handler-utils";
import { and, eq } from "drizzle-orm";

interface ChatCreateDto {
  title?: string;
}

interface ChatUpdateDto {
  chatId: string;
  title?: string;
}

interface ChatDeleteRequest {
  chatId: string;
}

export const createChat = withErrorHandler(
  withAuthHandler<ChatCreateDto, Chat>(async ({ userId, ...dto }) => {
    const [chat] = await drizzleClient
      .insert(chats)
      .values({ userId, ...dto })
      .returning();

    return {
      message: "Chat created successfully.",
      code: 200,
      data: chat,
    };
  }),
);

export const updateChat = withErrorHandler(
  withAuthHandler<ChatUpdateDto, Chat>(async ({ userId, chatId, ...dto }) => {
    const [chat] = await drizzleClient
      .update(chats)
      .set({ ...dto })
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .returning();

    return {
      message: "Chat updated successfully.",
      code: 200,
      data: chat,
    };
  }),
);

export const deleteChat = withErrorHandler(
  withAuthHandler<ChatDeleteRequest, void>(async ({ userId, chatId }) => {
    const [chat] = await drizzleClient
      .delete(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .returning();

    return {
      message: "Chat deleted successfully.",
      code: 200,
      data: undefined,
    };
  }),
);
