import { FC } from "react";

import { MessageDetail } from "../../types";
import { MessageAttachmentList } from "./message-attachment-list";

interface MessageItemProps {
  message: MessageDetail;
}

export const MessageItem: FC<MessageItemProps> = ({ message }) => {
  return (
    <div
      className={`rounded-lg border px-2 py-1 mx-4 my-2 size-fit rounded-tl-none`}
    >
      <span className="whitespace-pre-wrap break-words">{message.text}</span>
      {message.attachments.length > 0 && (
        <div className="mt-2">
          <MessageAttachmentList attachments={message.attachments} />
        </div>
      )}
    </div>
  );
};
