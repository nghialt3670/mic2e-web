"use server";

import { auth } from "@/auth";
import { db } from "@/lib/drizzle/db";
import { type Chat } from "@/lib/drizzle/schema";
import { chats } from "@/lib/drizzle/schema";
import { withErrorHandler } from "@/utils/server/server-action-handlers";

export const createChat = withErrorHandler<void, Chat>(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return { message: "Unauthorized", code: 401 };
  }

  const chat = await db
    .insert(chats)
    .values({
      userId: session.user.id,
    })
    .returning()
    .then((rows) => rows[0]);

  return { message: "Chat created successfully", code: 200, data: chat };
});
