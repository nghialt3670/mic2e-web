"use client";

import { MessageSkeleton } from "@/components/chat/message-skeleton";
import { useEffect } from "react";

import { getChatCyclePage } from "../../actions/chat-cycle";
import { useChatCycleStore } from "../../stores/chat-cycle-store";
import { useChatStore } from "../../stores/chat-store";
import { ChatCycleItem } from "./chat-cycle-item";

export const ChatCycleList = () => {
  const { chat } = useChatStore();
  const { page, size, chatCycles, setChatCycles } = useChatCycleStore();

  useEffect(() => {
    const fetchChatCycles = async () => {
      const chatId = chat?.id;
      if (!chatId) return;
      const { data: chatCyclePage } = await getChatCyclePage({
        chatId,
        page,
        size,
      });
      if (!chatCyclePage?.items) return;
      setChatCycles(chatCyclePage.items);
    };
    fetchChatCycles();
  }, [chat, page, size, setChatCycles]);

  const isResponding = chat?.status === "responding";
  const lastIndex = chatCycles.length - 1;

  return (
    <div className="flex flex-col justify-start items-center h-full w-full overflow-y-scroll pr-2 pl-6">
      {chatCycles.map((chatCycle, index) => (
        <div className="max-w-5xl w-full" key={chatCycle.id}>
          <ChatCycleItem
            chatCycle={chatCycle}
            showResponseSkeleton={
              isResponding && index === lastIndex && !chatCycle.responseMessage
            }
          />
        </div>
      ))}

      {isResponding && chatCycles.length === 0 && (
        <div className="max-w-5xl w-full">
          <MessageSkeleton />
        </div>
      )}
    </div>
  );
};
