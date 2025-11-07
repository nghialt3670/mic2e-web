"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { chatCycles, chats } from "@/lib/drizzle/drizzle-schema";
import { Page } from "@/types/api-types";
import {
  withAuthHandler,
  withErrorHandler,
} from "@/utils/server/server-action-handlers";
import { and, asc, count, eq } from "drizzle-orm";

import { ChatCycleDetail } from "../../types";

interface GetChatCyclePageRequest {
  chatId: string;
  page?: number;
  size?: number;
}

export const getChatCyclePage = withErrorHandler(
  withAuthHandler<GetChatCyclePageRequest, Page<ChatCycleDetail>>(
    async ({ userId, chatId, page, size }) => {
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
        .from(chatCycles)
        .where(eq(chatCycles.chatId, chatId));

      const chatCycleDetails: ChatCycleDetail[] =
        await drizzleClient.query.chatCycles.findMany({
          where: eq(chatCycles.chatId, chatId),
          orderBy: asc(chatCycles.createdAt),
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          with: {
            requestMessage: {
              with: {
                attachments: {
                  with: {
                    figUpload: true,
                    imageUpload: true,
                    thumbnailUpload: true,
                  },
                },
              },
            },
            responseMessage: {
              with: {
                attachments: {
                  with: {
                    figUpload: true,
                    imageUpload: true,
                    thumbnailUpload: true,
                  },
                },
              },
            },
          },
        });

      return {
        message: "Chat cycles fetched successfully",
        code: 200,
        data: {
          items: chatCycleDetails,
          total,
          page: currentPage,
          size: pageSize,
        },
      };
    },
  ),
);
