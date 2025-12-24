"use client";

import { ChatContext } from "@/contexts/chat-context";
import { Chat2EditProgressEvent } from "@/types/chat2edit-progress";
import { ChatDetails } from "@/types/chat-details";
import { useCallback, useState } from "react";

import { MessageInput } from "./message-input";

interface ChatBoxClientProps {
  chat?: ChatDetails;
  children: React.ReactNode;
}

export const ChatBoxClient = ({ chat, children }: ChatBoxClientProps) => {
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [progressEventsByCycle, setProgressEventsByCycle] = useState<
    Record<string, Chat2EditProgressEvent[]>
  >({});

  const addProgressEventForCycle = useCallback(
    (cycleId: string, event: Chat2EditProgressEvent) => {
      setProgressEventsByCycle((prev) => {
        const existing = prev[cycleId] || [];
        return {
          ...prev,
          [cycleId]: [...existing, event],
        };
      });
    },
    [],
  );

  const clearProgressEventsForCycle = useCallback((cycleId: string) => {
    setProgressEventsByCycle((prev) => {
      if (!prev[cycleId]) return prev;
      // Remove the entry for this cycleId
      const { [cycleId]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chat,
        progressMessage,
        setProgressMessage,
        hideProgressAndActions: false,
        progressEventsByCycle,
        addProgressEventForCycle,
        clearProgressEventsForCycle,
      }}
    >
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
