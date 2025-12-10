import { FC } from "react";

import { MessageDetail } from "../../types";
import { MessageAttachmentList } from "./attachment-list";
import { MessageText } from "./message-text";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: MessageDetail;
  type: "request" | "response";
}

export const MessageItem: FC<MessageItemProps> = ({ message, type }) => {
  return (
    <div
      className={cn(
        "p-3 w-fit max-w-[80%] border overflow-hidden",
        type === "request"
          ? "ml-auto"
          : "bg-muted"
      )}
      style={{
        borderRadius:
          type === "request"
            ? "0.5rem 0rem 0.5rem 0.5rem"
            : "0rem 0.5rem 0.5rem 0.5rem",
      }}
    >
      <div className={cn("block", type === "request" && "text-right")}>
        <MessageText text={message.text} />
      </div>
      {message.attachments.length > 0 && (
        <div className={cn("mt-2", type === "request" && "flex justify-end")}>
          <MessageAttachmentList attachments={message.attachments} />
        </div>
      )}
    </div>
  );
};
