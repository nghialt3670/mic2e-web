import { auth } from "@/auth";
import { ChatBox } from "@/features/chat/components/chat-box";
import { ChatNotFound } from "@/features/chat/components/chat-not-found";
import { db } from "@/lib/drizzle/db";
import { chats } from "@/lib/drizzle/schema";
import { and } from "drizzle-orm";
import { eq } from "drizzle-orm";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  const session = await auth();

  if (!session?.user) {
    return <ChatNotFound />;
  }

  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, session.user.id)),
  });

  if (!chat) {
    return <ChatNotFound />;
  }

  return <ChatBox chatId={chatId} />;
}
