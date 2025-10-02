import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { Send, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { createChat } from "../../actions/chat-actions/create-chat";
import { sendMessage } from "../../actions/message-actions/send-message";
import useChatStore from "../../stores/chat-store";

export const MessageInput = () => {
  const [text, setText] = useState("");
  const { chatId, setChatId, addMessage } = useChatStore();
  const router = useRouter();

  const getChatId = async () => {
    if (chatId) {
      return chatId;
    }
    const chat = await withToastHandler(createChat, {});
    if (chat) {
      setChatId(chat?.id);
      return chat?.id;
    }
    return "";
  };

  const handleSendClick = async () => {
    if (!text.trim()) return;
    const chatId = await getChatId();
    router.push(`/chats/${chatId}`);

    const requestMessage = {
      id: uuidv4(),
      chatId,
      createdAt: new Date(),
      sender: "user",
      text,
    };

    addMessage(requestMessage);

    const { id, ...message } = requestMessage;

    const responseMessage = await withToastHandler(sendMessage, {
      chatId,
      message,
    });
    if (responseMessage) {
      addMessage(responseMessage);
    }
    setText("");
  };

  return (
    <div className="flex flex-row gap-2">
      <Button size="icon" variant="ghost">
        <Upload />
      </Button>
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button size="icon" variant="ghost" onClick={handleSendClick}>
        <Send />
      </Button>
    </div>
  );
};
