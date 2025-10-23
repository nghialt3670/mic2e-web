import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { Send, WandSparkles } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { createChat } from "../../actions/chat-actions/create-chat";
import { getResponse } from "../../actions/chat-actions/get-response";
import { createMessage } from "../../actions/message-actions/create-message";
import { useChatStore } from "../../stores/chat-store";
import { useMessageStore } from "../../stores/message-store";
import { AttachmentUpload } from "../attachment-upload";
import { UploadAttachmentList } from "../upload-attachment-list";
import { useAttachmentStore } from "../../stores/attachment-store";

export const MessageInput = () => {
  const [text, setText] = useState("");
  const { chat, setChat, addChat } = useChatStore();
  const { addMessage } = useMessageStore();
  const { filenameToUrlMap, filenameToPathMap, setAttachments } = useAttachmentStore();

  const isAllUploaded = Object.keys(filenameToPathMap).every((filename) => filenameToPathMap[filename] in filenameToUrlMap);
  const disableSubmit = !text.trim() || !isAllUploaded;
  const attachmentUrls = Object.values(filenameToUrlMap);

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

    if (!text.trim() && attachmentUrls.length === 0) return;

    const chatId = await getChatId();
    if (!chatId) return;

    history.replaceState(null, "", `/chats/${chatId}`);

    const requestMessage = {
      id: uuidv4(),
      chatId,
      createdAt: new Date(),
      sender: "user",
      text,
    };

    const createdMessage = await withToastHandler(createMessage, {
      chatId,
      message: requestMessage,
      attachmentUrls,
    });
    if (createdMessage) {
      addMessage(createdMessage);
      setText("");
      setAttachments([]);
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
  };

  return (
    <div className="relative w-full max-w-5xl mr-4">
      <UploadAttachmentList />
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
            disabled={disableSubmit}
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
