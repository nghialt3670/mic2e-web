import { Chat } from "@/lib/drizzle/schema";
import Link from "next/link";

export const ChatItem = ({ chat }: { chat: Chat }) => {
  const title = chat.title || "New chat";
  return (
    <Link
      href={`/chats/${chat.id}`}
      className="block rounded px-2 py-1 hover:bg-accent"
    >
      <div className="truncate text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">
        {new Date(chat.createdAt ?? Date.now()).toLocaleString()}
      </div>
    </Link>
  );
};
