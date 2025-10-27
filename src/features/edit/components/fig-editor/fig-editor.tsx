import { useUploadAttachmentStore } from "@/features/chat/stores/upload-attachment-store";
import { FC } from "react";

import { useFigStore } from "../../stores/fig-store";
import { FigCanvasList } from "../fig-canvas-list";

interface FigEditorProps {}

export const FigEditor: FC<FigEditorProps> = ({}) => {
  const { currentAttachment, getAttachments } = useUploadAttachmentStore();
  const attachments = getAttachments();
  const { getFigObject } = useFigStore();
  
  // Get figObjects in the same order as attachments
  const figObjects = attachments
    .map((attachment) => getFigObject(attachment.originalFile.name))
    .filter(Boolean);
    
  const currIndex = attachments.findIndex(
    (attachment) =>
      attachment.originalFile.name === currentAttachment?.originalFile.name,
  );
  
  return (
    <div className="flex flex-col w-full h-full">
      <FigCanvasList currIndex={currIndex} figObjects={figObjects} />
    </div>
  );
};
