"use client";

import { Chat } from "@/lib/drizzle/schema";
import { useEffect } from "react";

import useChatStore from "../../stores/chat-store";
import { MessageInput } from "../message-input";
import { MessageList } from "../message-list";

interface ChatBoxProps {
  chat?: Partial<Chat>;
}

export const ChatBox = ({ chat }: ChatBoxProps) => {
  const { setChat } = useChatStore();

  useEffect(() => {
    setChat(chat);
    console.log(chat);
  }, [chat, setChat]);

  return (
    <div className="flex flex-col h-full p-4">
      <MessageList />
      <MessageInput />
    </div>
  );
};
