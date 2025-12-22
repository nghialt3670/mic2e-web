"use client";

import { Chat } from "@/lib/drizzle/drizzle-schema";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Brain, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";

import { ChatActions } from "./chat-actions";

interface ChatItemProps {
  chat: Chat & {
    settings?: {
      llmModel: string;
    } | null;
  };
}

export const ChatItem: FC<ChatItemProps> = ({ chat }) => {
  const pathname = usePathname();
  const isActive = pathname === `/c/${chat.id}`;
  return (
    <Link href={`/c/${chat.id}`} className="block group">
      <div
        className={cn(
          "relative p-4 rounded-lg border transition-all duration-200",
          "hover:border-primary hover:bg-accent/50",
          isActive && "border-primary bg-accent",
        )}
      >
        {/* Header with title and actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MessageSquare className="size-4 text-muted-foreground flex-shrink-0" />
            <h3 className={cn("font-medium text-sm truncate")}>
              {chat.title || "New Chat"}
            </h3>
          </div>
          <div
            className="flex items-center"
            onClick={(e) => e.preventDefault()}
          >
            <ChatActions chatId={chat.id} currentTitle={chat.title} />
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(chat.updatedAt), {
              addSuffix: true,
            })}
          </span>
          {chat.settings?.llmModel && (
            <>
              <div className="flex items-center gap-1">
                <Brain className="size-3" />
                <span className="font-medium">{chat.settings.llmModel}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};
