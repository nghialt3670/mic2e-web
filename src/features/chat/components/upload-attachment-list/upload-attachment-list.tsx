import { useUploadAttachmentStore } from "../../stores/upload-attachment-store";
import { UploadAttachmentItem } from "../upload-attachment-item";

export const UploadAttachmentList = () => {
  const { files } = useUploadAttachmentStore();

  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {files.map((file) => (
        <UploadAttachmentItem
          key={file.name}
          file={file}
        />
      ))}
    </div>
  );
};
