import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { chats as chatsTable } from "@/lib/drizzle/drizzle-schema";
import { getSessionUserId } from "@/utils/server/auth-utils";
import { desc, eq } from "drizzle-orm";

import { ScrollArea } from "../ui/scroll-area";
import { ChatItem } from "./chat-item";

export const ChatList = async () => {
  const userId = await getSessionUserId();

  if (!userId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <p className="text-sm text-muted-foreground">
          Login to enable chat history
        </p>
      </div>
    );
  }

  const chats = await drizzleClient.query.chats.findMany({
    where: eq(chatsTable.userId, userId),
    orderBy: [desc(chatsTable.updatedAt)],
    with: {
      settings: true,
    },
  });

  return (
    <ScrollArea className="h-full">
      {chats.map((chat) => (
        <div key={chat.id} className="my-1">
          <ChatItem chat={chat} />
        </div>
      ))}
    </ScrollArea>
  );
};
