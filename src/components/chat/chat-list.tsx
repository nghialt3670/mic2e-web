import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { chats as chatsTable } from "@/lib/drizzle/drizzle-schema";
import { getSessionUserId } from "@/utils/server/auth-utils";
import { desc, eq } from "drizzle-orm";
import { Fragment } from "react";

import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
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

  const chats = await drizzleClient
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.userId, userId))
    .orderBy(desc(chatsTable.updatedAt));

  return (
    <ScrollArea className="h-full">
      {chats.map((chat, i) => (
        <Fragment key={chat.id}>
          <ChatItem chat={chat} />
          {i < chats.length - 1 && <Separator />}
        </Fragment>
      ))}
    </ScrollArea>
  );
};
