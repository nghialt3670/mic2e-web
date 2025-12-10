import { Chat } from "@/lib/drizzle/drizzle-schema";

import { ChatBoxClient } from "./chat-box-client";
import { CycleList } from "./cycle-list";

interface ChatBoxProps {
  chat?: Chat;
}

export const ChatBox = ({ chat }: ChatBoxProps) => {
  return (
    <ChatBoxClient chat={chat}>
      {chat && <CycleList chatId={chat.id} />}
    </ChatBoxClient>
  );
};
