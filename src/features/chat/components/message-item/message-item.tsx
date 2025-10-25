import { Attachment, Message, Thumbnail } from "@/lib/drizzle/drizzle-schema";

import { MessageAttachmentList } from "../message-attachment-list";

interface AttachmentWithThumbnail extends Attachment {
  thumbnail?: Thumbnail;
}

interface MessageWithAttachments extends Message {
  attachments?: AttachmentWithThumbnail[];
}

export const MessageItem = ({
  message,
}: {
  message: MessageWithAttachments;
}) => {
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
