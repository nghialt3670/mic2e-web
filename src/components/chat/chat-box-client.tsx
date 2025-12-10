"use client";

import { ChatContext } from "@/contexts/chat-context";
import { Chat } from "@/lib/drizzle/drizzle-schema";

import { MessageInput } from "./message-input";

interface ChatBoxClientProps {
  chat?: Chat;
  children: React.ReactNode;
}

export const ChatBoxClient = ({ chat, children }: ChatBoxClientProps) => {
  return (
    <ChatContext.Provider value={{ chat }}>
      <div className="relative flex h-full w-full flex-col items-center">
        <div className="flex w-full flex-1 items-start justify-center max-w-5xl overflow-y-scroll pt-3 pb-2">
          {children}
        </div>
        <div className="relative flex w-full max-w-5xl items-center justify-center px-4 pb-10">
          <MessageInput />
        </div>
      </div>
    </ChatContext.Provider>
  );
};
