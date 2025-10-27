"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  Thumbnail,
  attachments,
  chats,
  messages,
} from "@/lib/drizzle/drizzle-schema";
import { type Attachment, type Message } from "@/lib/drizzle/drizzle-schema";
import { Page } from "@/types/api-types";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { getSessionUserId } from "@/utils/server/session";
import { and, asc, count, eq } from "drizzle-orm";

import { MessageDetail } from "../../types";

interface GetMessagePageRequest {
  chatId: string;
  page?: number;
  size?: number;
}

export const getMessagePage = withErrorHandler<
  GetMessagePageRequest,
  Page<MessageDetail>
>(async ({ chatId, page, size }) => {
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

  const currentPage = Math.max(1, page ?? 1);
  const pageSize = Math.min(100, Math.max(1, size ?? 20));

  const [{ value: total = 0 } = { value: 0 }] = await drizzleClient
    .select({ value: count() })
    .from(messages)
    .where(eq(messages.chatId, chatId));

  const messagesDetails: MessageDetail[] =
    await drizzleClient.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      orderBy: asc(messages.createdAt),
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
      with: {
        attachments: {
          with: {
            thumbnail: true,
          },
        },
      },
    });

  console.log(messagesDetails);

  return {
    message: "Messages fetched successfully",
    code: 200,
    data: {
      items: messagesDetails,
      total,
      page: currentPage,
      size: pageSize,
    },
  };
});
