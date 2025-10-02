"use client";

import { useEffect } from "react";

import { getMessages } from "../../actions/message-actions/get-messages";
import useChatStore from "../../stores/chat-store";
import { MessageItem } from "../message-item";

export const MessageList = () => {
  const { chatId, messages, setMessages } = useChatStore();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      const { data: messages } = await getMessages({ chatId });
      if (!messages || messages.length === 0) return;
      setMessages(messages);
    };
    fetchMessages();
  }, [chatId, setMessages]);

  return (
    <div className="flex flex-col gap-2 h-full">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};
