import { cn } from "@/lib/utils";
import { FC } from "react";

import { MessageDetail } from "../../types";
import { MessageAttachmentList } from "./attachment-list";
import { MessageText } from "./message-text";

interface MessageItemProps {
  message: MessageDetail;
  type: "request" | "response";
}

export const MessageItem: FC<MessageItemProps> = ({ message, type }) => {
  return (
    <div
      className={cn(
        "p-1 w-fit max-w-[80%] border overflow-hidden rounded-lg",
        type === "request" ? "ml-auto" : "bg-muted",
      )}
    >
      {message.attachments.length > 0 && (
        <div className={cn("mb-2", type === "request" && "flex justify-end")}>
          <MessageAttachmentList attachments={message.attachments} />
        </div>
      )}
      <div className={cn("block px-1.5", type === "request" && "text-right")}>
        <MessageText text={message.text} />
      </div>
    </div>
  );
};
