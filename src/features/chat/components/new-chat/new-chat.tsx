"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import useChatStore from "../../stores/chat-store";

export const NewChat = () => {
  const router = useRouter();
  const { clearMessages } = useChatStore();
  const handleNewChatClick = () => {
    clearMessages();
    router.push("/");
  };

  return (
    <Button onClick={handleNewChatClick}>
      <Plus />
      New Chat
    </Button>
  );
};
