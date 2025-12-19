import { ChatBox } from "@/components/chat/chat-box";
import { ChatNotFound } from "@/components/chat/chat-not-found";
import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { chats } from "@/lib/drizzle/drizzle-schema";
import { getSessionUserId } from "@/utils/server/auth-utils";
import { and } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) {
    return redirect("/login");
  }

  const { chatId } = await params;

  const chat = await drizzleClient.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    with: {
      cycles: {
        with: {
          request: {
            with: {
              attachments: {
                with: {
                  thumbnail: true,
                },
              },
            },
          },
          response: {
            with: {
              attachments: {
                with: {
                  thumbnail: true,
                },
              },
            },
          },
          context: true,
        },
      },
    },
  });

  if (!chat) {
    return <ChatNotFound />;
  }

  return <ChatBox chat={chat} />;
}
