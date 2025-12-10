"use client";

import { ChatDetails } from "@/types/chat-details";
import { createContext } from "react";

type ChatContextType = {
  chat?: ChatDetails;
};

export const ChatContext = createContext<ChatContextType>({
  chat: undefined,
});
