import { useMessageInputStore } from "@/stores/message-input-store";

import { AttachmentInputItem } from "./attachment-input-item";

export const AttachmentInputList = () => {
  const { getAttachments } = useMessageInputStore();
  const attachments = getAttachments();

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <AttachmentInputItem
          key={attachment.file.name}
          attachment={attachment}
        />
      ))}
    </div>
  );
};
