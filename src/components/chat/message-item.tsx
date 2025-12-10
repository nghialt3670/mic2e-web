import { FC } from "react";

import { MessageDetail } from "../../types";
import { MessageAttachmentList } from "./attachment-list";
import { MessageText } from "./message-text";

interface MessageItemProps {
  message: MessageDetail;
}

export const MessageItem: FC<MessageItemProps> = ({ message }) => {
  return (
    <div className="rounded-lg border p-2 size-fit">
      <MessageText text={message.text} />
      {message.attachments.length > 0 && (
        <div className="mt-2">
          <MessageAttachmentList attachments={message.attachments} />
        </div>
      )}
    </div>
  );
};
