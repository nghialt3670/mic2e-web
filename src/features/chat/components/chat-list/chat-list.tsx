"use client";

import { useEffect, useState } from "react";

import { withToastHandler } from "@/utils/client/client-action-handlers";
import { getChats } from "../../actions/chat-actions/get-chats";
import { Chat } from "@/lib/drizzle/schema";
import { ChatItem } from "../chat-item";

export const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await withToastHandler(getChats, undefined);
      if (data) setChats(data);
    };
    fetch();
  }, []);

  if (chats.length === 0) {
    return <div className="px-2 py-1 text-sm text-muted-foreground">No chats</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      {chats.map((chat) => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
};