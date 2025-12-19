"use client";

import { Chat2EditProgressEvent } from "@/types/chat2edit-progress";
import { ChatDetails } from "@/types/chat-details";
import { createContext } from "react";

type ChatContextType = {
  chat?: ChatDetails;
  progressMessage?: string | null;
  setProgressMessage?: (message: string | null) => void;

  // WebSocket progress events keyed by cycle ID
  progressEventsByCycle?: Record<string, Chat2EditProgressEvent[]>;
  addProgressEventForCycle?: (
    cycleId: string,
    event: Chat2EditProgressEvent,
  ) => void;
  clearProgressEventsForCycle?: (cycleId: string) => void;
};

export const ChatContext = createContext<ChatContextType>({
  chat: undefined,
  progressMessage: null,
  setProgressMessage: undefined,
  progressEventsByCycle: {},
  addProgressEventForCycle: undefined,
  clearProgressEventsForCycle: undefined,
});
