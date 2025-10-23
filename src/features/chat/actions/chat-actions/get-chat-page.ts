"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { type Chat } from "@/lib/drizzle/drizzle-schema";
import { chats } from "@/lib/drizzle/drizzle-schema";
import { Page } from "@/types/api-types";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { getSessionUserId } from "@/utils/server/session";
import { asc, count, eq } from "drizzle-orm";

interface GetChatPageRequest {
  page?: number;
  size?: number;
}

export const getChatPage = withErrorHandler<GetChatPageRequest, Page<Chat>>(
  async ({ page, size }) => {
    const userId = await getSessionUserId();

    if (!userId) {
      return { message: "Unauthorized", code: 401 };
    }

    const currentPage = Math.max(1, page ?? 1);
    const pageSize = Math.min(100, Math.max(1, size ?? 20));

    const [{ value: total = 0 } = { value: 0 }] = await drizzleClient
      .select({ value: count() })
      .from(chats)
      .where(eq(chats.userId, userId));

    const chatsData = await drizzleClient
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(asc(chats.updatedAt))
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);

    return {
      message: "Chats fetched successfully",
      code: 200,
      data: {
        items: chatsData,
        total,
        page: currentPage,
        size: pageSize,
      },
    };
  },
);
