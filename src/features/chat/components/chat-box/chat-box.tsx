"use client";

import { Chat } from "@/lib/drizzle/drizzle-schema";
import { useEffect } from "react";

import { useChatStore } from "../../stores/chat-store";
import { MessageInput } from "../message-input";
import { ChatCycleList } from "../chat-cycle-list";

interface ChatBoxProps {
  chat?: Partial<Chat>;
}

export const ChatBox = ({ chat }: ChatBoxProps) => {
  const { setChat } = useChatStore();

  useEffect(() => {
    setChat(chat);
  }, [chat, setChat]);

  return (
    <div className="flex flex-col items-center h-full">
      <ChatCycleList />
      <div className="relative w-full flex justify-center items-center max-w-5xl py-10">
        <MessageInput />
      </div>
    </div>
  );
};
