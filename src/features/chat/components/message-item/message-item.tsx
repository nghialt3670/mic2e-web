import { MessageAttachmentList } from "../message-attachment-list";
import { MessageDetail } from "../../types";
import { FC } from "react";

interface MessageItemProps {
  message: MessageDetail;
}

export const MessageItem: FC<MessageItemProps> = ({ message }) => {
  const createdAt = message.createdAt
    ? new Date(message.createdAt).toLocaleString()
    : "";

  return (
    <div className="rounded border p-2">
      <div className="text-xs text-muted-foreground mb-1">
        {message.sender}
        {createdAt ? ` • ${createdAt}` : ""}
      </div>
      {message.attachments && message.attachments.length > 0 && (
        <div className="mb-2">
          <MessageAttachmentList attachments={message.attachments} />
        </div>
      )}
      <div className="whitespace-pre-wrap break-words">{message.text}</div>
    </div>
  );
};
