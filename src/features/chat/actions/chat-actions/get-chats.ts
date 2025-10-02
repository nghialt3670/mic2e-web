"use server";

import { auth } from "@/auth";
import { db } from "@/lib/drizzle/db";
import { type Chat } from "@/lib/drizzle/schema";
import { chats } from "@/lib/drizzle/schema";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { desc, eq } from "drizzle-orm";

export const getChats = withErrorHandler<void, Chat[]>(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return { message: "Unauthorized", code: 401 };
  }

  const chatsData = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, session.user.id))
    .orderBy(desc(chats.updatedAt))
    .then((rows) => rows);

  return { message: "Chats fetched successfully", code: 200, data: chatsData };
});
