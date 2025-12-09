import { Chat } from "@/lib/drizzle/drizzle-schema";
import { createContext } from "react";

type ChatContextType = {
  chat?: Chat;
};

export const ChatContext = createContext<ChatContextType>({
  chat: undefined,
});
