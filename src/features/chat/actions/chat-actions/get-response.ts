"use server";

import { db } from "@/lib/drizzle/db";
import { chats, messages } from "@/lib/drizzle/schema";
import { type Message } from "@/lib/drizzle/schema";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { getSessionUserId } from "@/utils/server/session";
import { and, eq } from "drizzle-orm";

interface GetResponseRequest {
  chatId: string;
}

export const getResponse = withErrorHandler<GetResponseRequest, Message>(
  async ({ chatId }) => {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return { message: "Unauthorized", code: 401 };
    }

    const chat = await db.query.chats.findFirst({
      where: and(
        eq(chats.id, chatId),
        eq(chats.userId, sessionUserId),
      ),
    });

    if (!chat) {
      return { message: "Chat not found", code: 404 };
    }

    const mockResponseMessage = {
      text: "Hello, how can I help you today?",
    };

    const createdMessage = await db
      .insert(messages)
      .values({
        chatId,
        sender: "assistant",
        text: mockResponseMessage.text,
      })
      .returning()
      .then((rows) => rows[0]);

    return {
      message: "Response fetched successfully",
      code: 200,
      data: createdMessage,
    };
  },
);
