"use server";

import { db } from "@/lib/drizzle/db";
import { chats, messages } from "@/lib/drizzle/schema";
import { type Message } from "@/lib/drizzle/schema";
import { Page } from "@/types/api-types";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { getSessionUserId } from "@/utils/server/session";
import { and, asc, count, eq } from "drizzle-orm";

interface GetMessagePageRequest {
  chatId: string;
  page?: number;
  size?: number;
}

export const getMessagePage = withErrorHandler<
  GetMessagePageRequest,
  Page<Message>
>(async ({ chatId, page, size }) => {
  const userId = await getSessionUserId();
  if (!userId) {
    return { message: "Unauthorized", code: 401 };
  }

  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
  });
  if (!chat) {
    return { message: "Chat not found", code: 404 };
  }

  const currentPage = Math.max(1, page ?? 1);
  const pageSize = Math.min(100, Math.max(1, size ?? 20));

  const [{ value: total = 0 } = { value: 0 }] = await db
    .select({ value: count() })
    .from(messages)
    .where(eq(messages.chatId, chatId));

  const messagesData = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.createdAt))
    .limit(pageSize)
    .offset((currentPage - 1) * pageSize);

  return {
    message: "Messages fetched successfully",
    code: 200,
    data: {
      items: messagesData,
      total,
      page: currentPage,
      size: pageSize,
    },
  };
});
