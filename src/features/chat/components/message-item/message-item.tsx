import { Message, Attachment } from "@/lib/drizzle/schema";
import { ImageCarousel } from "../image-carousel";

interface MessageWithAttachments extends Partial<Message> {
  attachments?: Partial<Attachment>[];
}

export const MessageItem = ({ message }: { message: MessageWithAttachments }) => {
  const createdAt = message.createdAt
    ? new Date(message.createdAt).toLocaleString()
    : "";

  // Convert attachments to File objects for display
  const imageFiles = message.attachments?.map((attachment: Partial<Attachment>) => {
    // This is a mock conversion - in a real app you'd fetch the actual file
    const mockFile = new File([], attachment.name || 'unknown', { type: attachment.type || 'image/jpeg' });
    return mockFile;
  }) || [];

  return (
    <div className="rounded border p-2">
      <div className="text-xs text-muted-foreground mb-1">
        {message.sender}
        {createdAt ? ` • ${createdAt}` : ""}
      </div>
      {imageFiles.length > 0 && (
        <div className="mb-2">
          <ImageCarousel 
            images={imageFiles} 
            onRemoveImage={() => {}} // Read-only in message display
          />
        </div>
      )}
      <div className="whitespace-pre-wrap break-words">{message.text}</div>
    </div>
  );
};
