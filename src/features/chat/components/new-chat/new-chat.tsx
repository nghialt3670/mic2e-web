"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import useChatStore from "../../stores/message-store";

export const NewChat = () => {
  const router = useRouter();
  const { clearMessages, setChatId } = useChatStore();

  const handleNewChatClick = () => {
    clearMessages();
    setChatId(undefined);
    router.push("/");
  };

  return (
    <Button onClick={handleNewChatClick}>
      <Plus />
      New Chat
    </Button>
  );
};
