import { auth } from "@/auth";
import { ChatBox } from "@/features/chat/components/chat-box";
import { ChatNotFound } from "@/features/chat/components/chat-not-found";
import { db } from "@/lib/drizzle/db";
import { chats } from "@/lib/drizzle/schema";
import { getSessionUserId } from "@/utils/server/session";
import { and } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  const userId = await getSessionUserId();

  if (!userId) {
    return redirect("/login");
  }

  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
  });

  if (!chat) {
    return <ChatNotFound />;
  }

  return <ChatBox chat={chat} />;
}
