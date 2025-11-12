import { useInputAttachmentStore } from "../../stores/input-attachment-store";
import { InputAttachmentItem } from "./input-attachment-item";

export const InputAttachmentList = () => {
  const { getInputAttachments } = useInputAttachmentStore();
  const attachments = getInputAttachments();

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <InputAttachmentItem attachment={attachment} />
      ))}
    </div>
  );
};
