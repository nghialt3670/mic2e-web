"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { useChatStore } from "../../stores/chat-store";
import { useMessageStore } from "../../stores/message-store";

export const NewChat = () => {
  const router = useRouter();
  const { setChat } = useChatStore();
  const { clearMessages } = useMessageStore();

  const handleNewChatClick = () => {
    clearMessages();
    setChat(undefined);
    router.push("/");
  };

  return (
    <Button onClick={handleNewChatClick}>
      <Plus />
      New Chat
    </Button>
  );
};
