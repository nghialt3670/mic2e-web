"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  Chat,
  chats,
  contexts,
  cycles,
  messages,
} from "@/lib/drizzle/drizzle-schema";
import { withAuthHandler, withErrorHandler } from "@/utils/server/action-utils";
import { and, eq, inArray } from "drizzle-orm";

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
    // Exclude userId from the update to prevent overwriting
    const { userId: _userId, ...updateData } = chat;
    
    const [updatedChat] = await drizzleClient
      .update(chats)
      .set(updateData)
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
    // First, verify the chat belongs to the user
    const chat = await drizzleClient.query.chats.findFirst({
      where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    });

    if (!chat) {
      throw new Error("Chat not found or unauthorized");
    }

    // Get all cycles for this chat to find related messages and contexts
    const chatCycles = await drizzleClient.query.cycles.findMany({
      where: eq(cycles.chatId, chatId),
    });

    // Collect all message and context IDs
    const messageIds = new Set<string>();
    const contextIds = new Set<string>();

    for (const cycle of chatCycles) {
      messageIds.add(cycle.requestId);
      if (cycle.responseId) messageIds.add(cycle.responseId);
      if (cycle.contextId) contextIds.add(cycle.contextId);
    }

    // Delete cycles first (to remove FK constraints to messages)
    if (chatCycles.length > 0) {
      await drizzleClient.delete(cycles).where(eq(cycles.chatId, chatId));
    }

    // Delete messages (CASCADE will automatically delete attachments)
    if (messageIds.size > 0) {
      await drizzleClient
        .delete(messages)
        .where(inArray(messages.id, Array.from(messageIds)));
    }

    // Delete contexts
    if (contextIds.size > 0) {
      await drizzleClient
        .delete(contexts)
        .where(inArray(contexts.id, Array.from(contextIds)));
    }

    // Delete the chat
    const [deletedChat] = await drizzleClient
      .delete(chats)
      .where(eq(chats.id, chatId))
      .returning();

    return {
      message: "Chat deleted successfully.",
      code: 200,
      data: deletedChat,
    };
  }),
);
