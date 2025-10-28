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
    <div className="flex flex-col justify-start items-center h-full w-full overflow-y-scroll pr-2 pl-6">
      {messages.map((message) => (
        <div className="max-w-5xl w-full" key={message.id}>
          <MessageItem message={message} />
        </div>
      ))}
    </div>
  );
};
