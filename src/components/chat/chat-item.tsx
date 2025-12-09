"use client";

import { Chat } from "@/lib/drizzle/drizzle-schema";
import { format } from "date-fns";
import Link from "next/link";
import { FC } from "react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "../ui/item";
import { ChatDelete } from "./chat-delete";

interface ChatItemProps {
  chat: Chat;
}

export const ChatItem: FC<ChatItemProps> = ({ chat }) => {
  return (
    <Item>
      <ItemHeader className="flex flex-col gap-1">
        <ItemTitle>
          <Link
            href={`/chats/${chat.id}`}
            className="overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {chat.title}
          </Link>
        </ItemTitle>
      </ItemHeader>
      <ItemContent>
        <div className="flex flex-col gap-1">
          <span>{format(chat.createdAt, "MM/dd/yyyy HH:mm")}</span>
          <span>{format(chat.updatedAt, "MM/dd/yyyy HH:mm")}</span>
        </div>
      </ItemContent>
      <ItemFooter>
        <ItemActions>
          <ChatDelete chatId={chat.id} />
        </ItemActions>
      </ItemFooter>
    </Item>
  );
};
