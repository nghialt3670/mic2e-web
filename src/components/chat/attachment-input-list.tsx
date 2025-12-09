import { useMessageInputStore } from "@/stores/message-input-store";

import { InputAttachmentItem } from "./attachment-input-item";

export const InputAttachmentList = () => {
  const { getAttachments } = useMessageInputStore();
  const attachments = getAttachments();

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <InputAttachmentItem
          key={attachment.file.name}
          attachment={attachment}
        />
      ))}
    </div>
  );
};
