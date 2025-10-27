"use client";

import { Chat } from "@/lib/drizzle/drizzle-schema";
import { useEffect } from "react";

import { useChatStore } from "../../stores/chat-store";
import { MessageInput } from "../message-input";
import { MessageList } from "../message-list";
import { useUploadAttachmentStore } from "../../stores/upload-attachment-store";
import { UploadAttachmentList } from "../upload-attachment-list";

interface ChatBoxProps {
  chat?: Partial<Chat>;
}

export const ChatBox = ({ chat }: ChatBoxProps) => {
  const { setChat } = useChatStore();
  const { isAllRead } = useUploadAttachmentStore();

  useEffect(() => {
    setChat(chat);
  }, [chat, setChat]);

  return (
    <div className="flex flex-col items-center h-full">
      <MessageList />
      <div className="relative w-full flex justify-center items-center max-w-5xl py-10">
        {isAllRead() && (
          <div className="absolute top-[-100%] w-full px-4">
            <UploadAttachmentList />
          </div>
        )}
        <div className="w-full px-4">
          <MessageInput />
        </div>
      </div>
    </div>
  );
};
