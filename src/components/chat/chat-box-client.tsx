"use client";

import { ChatContext } from "@/contexts/chat-context";
import { ChatDetails } from "@/types/chat-details";

import { MessageInput } from "./message-input";

interface ChatBoxClientProps {
  chat?: ChatDetails;
  children: React.ReactNode;
}

export const ChatBoxClient = ({ chat, children }: ChatBoxClientProps) => {
  return (
    <ChatContext.Provider value={{ chat }}>
      <div className="relative flex h-full w-full flex-col">
        {/* Scrollbar on the edge of the page */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl py-2 px-4">{children}</div>
        </div>

        <div className="relative w-full">
          <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-2">
            <MessageInput />
          </div>
        </div>
      </div>
    </ChatContext.Provider>
  );
};
