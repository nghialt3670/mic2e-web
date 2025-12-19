import { Chat } from "@/lib/drizzle/drizzle-schema";
import { ChatDetails } from "@/types/chat-details";

import { ChatBoxClient } from "./chat-box-client";
import { CycleList } from "./cycle-list";

interface ChatBoxProps {
  chat?: ChatDetails;
}

export const ChatBox = ({ chat }: ChatBoxProps) => {
  return <ChatBoxClient chat={chat}>{chat && <CycleList />}</ChatBoxClient>;
};
