import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { Send, WandSparkles } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { createChat } from "../../actions/chat-actions/create-chat";
import { useChatStore } from "../../stores/chat-store";
import { useMessageStore } from "../../stores/message-store";
import { createMessage } from "../../actions/message-actions/create-message";
import { getResponse } from "../../actions/chat-actions/get-response";
import { FileUpload } from "../file-upload";
import { ImageCarousel } from "../image-carousel";

export const MessageInput = () => {
  const [text, setText] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const { chat, setChat, addChat } = useChatStore();
  const { addMessage } = useMessageStore();

  const handleFilesSelected = (files: File[]) => {
    setSelectedImages(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

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

    if (!text.trim() && selectedImages.length === 0) return;

    const chatId = await getChatId();
    if (!chatId) return;

    history.replaceState(null, "", `/chats/${chatId}`);

    const requestMessage = {
      id: uuidv4(),
      chatId,
      createdAt: new Date(),
      sender: "user",
      text,
      attachments: selectedImages.map(file => ({
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        createdAt: new Date(),
        messageId: uuidv4(),
      })),
    };

    const createdMessage = await withToastHandler(createMessage, {
      chatId,
      message: requestMessage,
    });
    if (createdMessage) {
      addMessage(createdMessage);
      setText("");
      setSelectedImages([]);
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
    <div className="relative w-full max-w-5xl">
      {selectedImages.length > 0 && (
        <ImageCarousel 
          images={selectedImages} 
          onRemoveImage={handleRemoveImage} 
        />
      )}
      <form className="flex flex-row gap-2 w-full" onSubmit={handleSubmit}>
        <Button size="icon" variant="ghost">
          <WandSparkles />
        </Button>
        <FileUpload 
          onFilesSelected={handleFilesSelected}
          disabled={false}
        />
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <Button 
          type="submit" 
          disabled={!text.trim() && selectedImages.length === 0} 
          size="icon" 
          variant="ghost"
        >
          <Send />
        </Button>
      </form>
    </div>
  );
};
