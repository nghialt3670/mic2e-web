"use client";

import { useEffect } from "react";

import { getChatPage } from "../../actions/chat-actions/get-chat-page";
import useChatStore from "../../stores/chat-store";
import { ChatItem } from "../chat-item";

export const ChatList = () => {
  const { page, size, chats, setChats } = useChatStore();

  useEffect(() => {
    const fetch = async () => {
      const { data: chatPage } = await getChatPage({ page, size });
      if (chatPage) setChats(chatPage.items);
    };
    fetch();
  }, [page, size, setChats]);

  if (chats.length === 0) {
    return (
      <div className="px-2 py-1 text-sm text-muted-foreground">No chats</div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {chats.map((chat) => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
};
