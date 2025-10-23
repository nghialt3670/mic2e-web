"use client";

import { Chat } from "@/lib/drizzle/drizzle-schema";
import { useEffect } from "react";

import { useChatStore } from "../../stores/chat-store";
import { MessageInput } from "../message-input";
import { MessageList } from "../message-list";

interface ChatBoxProps {
  chat?: Partial<Chat>;
}

export const ChatBox = ({ chat }: ChatBoxProps) => {
  const { setChat } = useChatStore();

  useEffect(() => {
    setChat(chat);
  }, [chat, setChat]);

  return (
    <div className="flex flex-col items-center h-full pb-10 ">
      <MessageList />
      <div className="w-full flex justify-center items-center p-6">
        <MessageInput />
      </div>
    </div>
  );
};
