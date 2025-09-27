import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { Send, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createChat } from "../../actions/chat-actions";
import { sendMessage } from "../../actions/message-actions";
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
    const chatId = await getChatId();
    window.history.pushState({}, "", `/chats/${chatId}`);

    addMessage({
      id: "",
      chatId,
      createdAt: new Date(),
      sender: "user",
      text,
    });

    const message = await withToastHandler(sendMessage, {
      chatId,
      message: { text },
    });
    if (message) {
      addMessage(message);
    }
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
