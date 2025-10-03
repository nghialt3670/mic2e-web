"use server";

import { db } from "@/lib/drizzle/db";
import { type Chat } from "@/lib/drizzle/schema";
import { chats } from "@/lib/drizzle/schema";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { getSessionUserId } from "@/utils/server/session";

export const createChat = withErrorHandler<void, Chat>(async () => {
  const userId = await getSessionUserId();

  if (!userId) {
    return { message: "Unauthorized", code: 401 };
  }

  const chat = await db
    .insert(chats)
    .values({
      userId,
    })
    .returning()
    .then((rows) => rows[0]);

  return { message: "Chat created successfully", code: 200, data: chat };
});
