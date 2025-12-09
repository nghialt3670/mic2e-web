"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export const ChatNew = () => {
  const router = useRouter();

  const handleChatNewClick = () => {
    router.push("/");
  };

  return (
    <Button variant="ghost" onClick={handleChatNewClick}>
      <Plus />
      New Chat
    </Button>
  );
};
