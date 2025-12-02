"use client";

import { Chat } from "@/lib/drizzle/drizzle-schema";
import { useEffect } from "react";

import { useChatStore } from "../../stores/chat-store";
import { ChatCycleList } from "./chat-cycle-list";
import { ContextDialog } from "./context-dialog";
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
    <div className="relative flex h-full w-full flex-col items-center">
      {/* Context button pinned to top-right of the chat box */}
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <div className="flex w-full max-w-5xl justify-end px-4">
          <div className="pointer-events-auto">
            <ContextDialog />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 items-start justify-center max-w-5xl overflow-y-scroll pt-10 pb-2">
        <ChatCycleList />
      </div>
      <div className="relative flex w-full max-w-5xl items-center justify-center px-4 pb-10">
        <MessageInput />
      </div>
    </div>
  );
};
