import { removeFileFromSupabase } from "@/lib/supabase/supabase-utils";
import { clientEnv } from "@/utils/client/client-env";

import { useAttachmentStore } from "../../stores/attachment-store";
import { UploadAttachmentItem } from "../upload-attachment-item";

export const UploadAttachmentList = () => {
  const { filenameToFileMap, filenameToPathMap, removeAttachment } =
    useAttachmentStore();

  const handleRemoveAttachment = (filename: string) => {
    const path = filenameToPathMap[filename];
    if (path) {
      removeFileFromSupabase(
        path,
        clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME,
      );
    }
    removeAttachment(filename);
  };

  return (
    <div className="flex flex-col gap-2">
      {Object.values(filenameToFileMap).map((file) => (
        <UploadAttachmentItem
          key={file.name}
          file={file}
          onRemove={handleRemoveAttachment}
        />
      ))}
    </div>
  );
};
