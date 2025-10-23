import { Message, Attachment } from "@/lib/drizzle/drizzle-schema";
import { ImageCarousel } from "../image-carousel";

interface MessageWithAttachments extends Partial<Message> {
  attachments?: Partial<Attachment>[];
}

export const MessageItem = ({ message }: { message: MessageWithAttachments }) => {
  const createdAt = message.createdAt
    ? new Date(message.createdAt).toLocaleString()
    : "";

  // Convert attachments to File objects for display using the URL
  const imageFiles = message.attachments?.map((attachment: Partial<Attachment>) => {
    // Create a mock File object with the URL for display
    const mockFile = new File([], attachment.name || 'unknown', { type: attachment.type || 'image/jpeg' });
    // Add the URL as a property for the ImageCarousel to use
    (mockFile as any).url = attachment.url;
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
