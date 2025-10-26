import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { Send, WandSparkles } from "lucide-react";
import { useState } from "react";

import { createChat } from "../../actions/chat-actions/create-chat";
import { getResponse } from "../../actions/chat-actions/get-response";
import { createMessage, CreateMessageData, CreateMessageRequest } from "../../actions/message-actions/create-message";
import { useChatStore } from "../../stores/chat-store";
import { useMessageStore } from "../../stores/message-store";
import { useUploadAttachmentStore } from "../../stores/upload-attachment-store";
import { AttachmentUpload } from "../attachment-upload";
import { UploadAttachmentList } from "../upload-attachment-list";
import { usePathname } from "next/navigation";
import { CreateAttachmentData } from "../../actions/message-actions/create-message";

export const MessageInput = () => {
  const pathname = usePathname();
  const [text, setText] = useState("");
  const { chat, setChat, addChat } = useChatStore();
  const { addMessage } = useMessageStore();
  const {
    clearFiles,
    clearAttachments,
    getAttachments,
    isAllRead,
    isAllUploaded,
    isAllThumbnailed,
  } = useUploadAttachmentStore();

  const attachments = getAttachments();
  const canSubmit =
    text.trim() && isAllRead() && isAllUploaded() && isAllThumbnailed();

  const getChatId = async () => {
    if (chat) {
      return chat?.id;
    }
    const createdChat = await withToastHandler(createChat, {});
    if (createdChat) {
      setChat(createdChat);
      addChat(createdChat);
      return createdChat?.id;
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text.trim()) return;

    const chatId = await getChatId();
    if (!chatId) return;

    const createAttachmentDtos: CreateAttachmentData[] = attachments.map((attachment) => ({
      url: attachment.uploadInfo?.url || "",
      thumbnail: attachment.thumbnailInfo ? {
        url: attachment.thumbnailInfo.url,
        width: attachment.thumbnailInfo.width,
        height: attachment.thumbnailInfo.height,
      } : undefined,
    }));

    const createMessageData: CreateMessageData = {
      text,
      attachments: createAttachmentDtos,
    };

    const createMessageRequest: CreateMessageRequest = {
      chatId,
      message: createMessageData,
    };

    const createdMessage = await withToastHandler(createMessage, createMessageRequest);
    if (createdMessage) {
      addMessage(createdMessage);
      setText("");
      clearFiles();
      clearAttachments();
    }

    const responseMessage = await withToastHandler(getResponse, {
      chatId,
    });
    if (responseMessage) {
      addMessage(responseMessage);
      setChat({
        id: chatId,
        title: responseMessage.text,
        updatedAt: new Date(),
      });
    }
    if (!pathname.includes(`/chats/${chatId}`)) {
      history.replaceState(null, "", `/chats/${chatId}`);
    }
  };

  return (
    <div className="relative w-full max-w-5xl">
      {isAllRead() && <UploadAttachmentList />}
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="pr-28 pl-24 h-12 text-base"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              type="button"
            >
              <WandSparkles className="h-5 w-5" />
            </Button>
            <AttachmentUpload />
          </div>
          <Button
            type="submit"
            disabled={!canSubmit}
            size="icon"
            variant="ghost"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
