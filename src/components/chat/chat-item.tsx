"use client";

import { Chat } from "@/lib/drizzle/drizzle-schema";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

import { Badge } from "../ui/badge";
import { ChatDelete } from "./chat-delete";

interface ChatItemProps {
  chat: Chat;
  isActive?: boolean;
}

export const ChatItem: FC<ChatItemProps> = ({ chat, isActive = false }) => {
  return (
    <Link href={`/chats/${chat.id}`} className="block group">
      <div
        className={cn(
          "relative p-4 rounded-lg border transition-all duration-200",
          "hover:border-primary hover:bg-accent/50",
          isActive && "border-primary bg-accent"
        )}
      >
        {/* Header with title and delete button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MessageSquare className="size-4 text-muted-foreground flex-shrink-0" />
            <h3
              className={cn(
                "font-medium text-sm truncate",
                chat.failed && "text-destructive"
              )}
            >
              {chat.title || "New Chat"}
            </h3>
          </div>
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.preventDefault()}
          >
            <ChatDelete chatId={chat.id} />
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(chat.updatedAt), {
              addSuffix: true,
            })}
          </span>
          {chat.failed && (
            <>
              <span>•</span>
              <Badge variant="destructive" className="h-5 text-xs">
                <AlertCircle className="size-3 mr-1" />
                Failed
              </Badge>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};
