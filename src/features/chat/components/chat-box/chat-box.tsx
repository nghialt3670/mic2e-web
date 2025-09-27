"use client";

import { useEffect } from "react";

import useChatStore from "../../stores/chat-store";
import { MessageInput } from "../message-input";
import { MessageList } from "../message-list";

interface ChatBoxProps {
  chatId?: string;
}

export const ChatBox = ({ chatId }: ChatBoxProps) => {
  const { setChatId } = useChatStore();

  useEffect(() => {
    setChatId(chatId);
  }, [chatId, setChatId]);

  return (
    <div className="flex flex-col h-full p-4">
      <MessageList />
      <MessageInput />
    </div>
  );
};
