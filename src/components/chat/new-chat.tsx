"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { useChatStore } from "../../stores/chat-store";
import { useChatCycleStore } from "@/stores/chat-cycle-store";

export const NewChat = () => {
  const router = useRouter();
  const { setChat } = useChatStore();
  const { clearChatCycles } = useChatCycleStore();

  const handleNewChatClick = () => {
    clearChatCycles();
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
