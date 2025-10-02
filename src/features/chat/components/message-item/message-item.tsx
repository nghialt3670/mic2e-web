import { Message } from "@/lib/drizzle/schema";

export const MessageItem = ({ message }: { message: Partial<Message> }) => {
  const createdAt = message.createdAt
    ? new Date(message.createdAt).toLocaleString()
    : "";

  return (
    <div className="rounded border p-2">
      <div className="text-xs text-muted-foreground mb-1">
        {message.sender}
        {createdAt ? ` • ${createdAt}` : ""}
      </div>
      <div className="whitespace-pre-wrap break-words">{message.text}</div>
    </div>
  );
};
