"use client";

import { useEffect } from "react";

import { getMessagePage } from "../../actions/message-actions/get-message-page";
import { useChatStore } from "../../stores/chat-store";
import { useMessageStore } from "../../stores/message-store";
import { MessageItem } from "../message-item";

export const MessageList = () => {
  const { chat } = useChatStore();
  const { page, size, messages, setMessages } = useMessageStore();

  useEffect(() => {
    const fetchMessages = async () => {
      const chatId = chat?.id;
      if (!chatId) return;
      const { data: messagePage } = await getMessagePage({
        chatId,
        page,
        size,
      });
      if (!messagePage?.items) return;
      setMessages(messagePage.items);
    };
    fetchMessages();
  }, [chat, page, size, setMessages]);

  return (
    <div className="flex flex-col gap-2 h-full w-full max-w-5xl overflow-y-scroll">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};
