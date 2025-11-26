"use client";

import { Chat } from "@/lib/drizzle/drizzle-schema";
import { useEffect } from "react";

import { useChatStore } from "../../stores/chat-store";
import { ChatCycleList } from "./chat-cycle-list";
import { MessageInput } from "./message-input";

interface ChatBoxProps {
  chat?: Partial<Chat>;
}

export const ChatBox = ({ chat }: ChatBoxProps) => {
  const { setChat } = useChatStore();

  useEffect(() => {
    setChat(chat);
  }, [chat, setChat]);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex w-full flex-1 items-start justify-center max-w-5xl overflow-y-scroll py-4">
        <ChatCycleList />
      </div>
      <div className="relative flex w-full max-w-5xl items-center justify-center px-4 pb-10">
        <MessageInput />
      </div>
    </div>
  );
};
