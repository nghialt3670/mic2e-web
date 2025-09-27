import { Message } from "@/generated/prisma";

export const MessageItem = ({ message }: { message: Message }) => {
  return (
    <div>
      <div>{message.text}</div>
      <div>{message.createdAt.toLocaleString()}</div>
    </div>
  );
};
