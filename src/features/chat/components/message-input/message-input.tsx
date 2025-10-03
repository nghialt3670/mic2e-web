import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { Send, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { createChat } from "../../actions/chat-actions/create-chat";
import { sendMessage } from "../../actions/message-actions/send-message";
import { useChatStore } from "../../stores/chat-store";
import { useMessageStore } from "../../stores/message-store";

export const MessageInput = () => {
  const [text, setText] = useState("");
  const { chat, setChat } = useChatStore();
  const { addMessage } = useMessageStore();
  const router = useRouter();

  const getChatId = async () => {
    if (chat) {
      return chat?.id;
    }
    const createdChat = await withToastHandler(createChat, {});
    if (createdChat) {
      setChat(createdChat);
      return createdChat?.id;
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text.trim()) return;
    const chatId = await getChatId();
    if (!chatId) return;
    router.push(`/chats/${chatId}`);

    const requestMessage = {
      id: uuidv4(),
      chatId,
      createdAt: new Date(),
      sender: "user",
      text,
    };

    addMessage(requestMessage);
    setText("");

    const { id, ...message } = requestMessage;

    const responseMessage = await withToastHandler(sendMessage, {
      chatId,
      message,
    });
    if (responseMessage) {
      addMessage(responseMessage);
    }
  };

  return (
    <form className="flex flex-row gap-2" onSubmit={handleSubmit}>
      <Button size="icon" variant="ghost">
        <Upload />
      </Button>
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button type="submit" disabled={!text.trim()} size="icon" variant="ghost">
        <Send />
      </Button>
    </form>
  );
};
