import { FC } from "react";

import { MessageDetail } from "../../types";
import { MessageAttachmentList } from "../message-attachment-list";

interface MessageItemProps {
  message: MessageDetail;
}

export const MessageItem: FC<MessageItemProps> = ({ message }) => {
  return (
    <div className={`rounded-lg border px-2 py-1 size-fit rounded-tl-none ${message.sender === 'user' ? '' : 'bg-slate-100'}`}>
      <span className="whitespace-pre-wrap break-words">{message.text}</span>
      {message.attachments.length > 0 && (
        <div className="mt-2">
          <MessageAttachmentList attachments={message.attachments} />
        </div>
      )}
    </div>
  );
};
