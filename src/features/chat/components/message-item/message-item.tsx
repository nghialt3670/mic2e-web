import { FC } from "react";

import { MessageDetail } from "../../types";
import { MessageAttachmentList } from "../message-attachment-list";

interface MessageItemProps {
  message: MessageDetail;
}

export const MessageItem: FC<MessageItemProps> = ({ message }) => {
  return (
    <div className="rounded-lg border p-2 size-fit">
      <span className="whitespace-pre-wrap break-words">{message.text}</span>
      <div className="mt-2">
        <MessageAttachmentList attachments={message.attachments} />
      </div>
    </div>
  );
};
