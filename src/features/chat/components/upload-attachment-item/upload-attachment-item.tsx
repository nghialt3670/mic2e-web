import { Button } from "@/components/ui/button";
import {
  convertFileToFigJsonFile,
  readFigJsonFileAsDataURL,
} from "@/lib/fabric";
import { removeFileFromSupabase, uploadFileToSupabase } from "@/lib/supabase";
import { clientEnv } from "@/utils/client/client-env";
import {
  getImageDimensions,
} from "@/utils/client/file-readers";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

import { useUploadAttachmentStore } from "../../stores/upload-attachment-store";

interface UploadAttachmentItemProps {
  file: File;
}

export const UploadAttachmentItem = ({ file }: UploadAttachmentItemProps) => {
  const {
    removeFile,
    getAttachment,
    removeAttachment,
    setAttachment,
    updateAttachmentUploadInfo,
  } = useUploadAttachmentStore();
  const attachment = getAttachment(file.name);
  const bucketName = clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME;

  useEffect(() => {
    const createAttachment = async () => {
      if (attachment) return;
      const figJsonFile = await convertFileToFigJsonFile(file);
      const dataUrl = await readFigJsonFileAsDataURL(figJsonFile);
      const { width, height } = await getImageDimensions(file);
      setAttachment({
        type: "fabric-image-group",
        file: figJsonFile,
        originalName: file.name,
        imageInfo: {
          dataUrl,
          width,
          height,
        },
      });
    };
    if (!attachment) {
      createAttachment();
    }
  }, [file]);

  useEffect(() => {
    const uploadAttachment = async () => {
      if (!attachment || attachment.uploadInfo) return;
      const path = `figs/${Date.now()}_${file.name}`;
      const url = await uploadFileToSupabase(attachment.file, path, bucketName);
      updateAttachmentUploadInfo(file.name, { path, url });
    };

    if (attachment && !attachment.uploadInfo) {
      uploadAttachment();
    }
  }, [attachment]);

  const handleRemoveClick = () => {
    if (!attachment) return;
    removeFile(file.name);
    removeAttachment(file.name);
    if (attachment.uploadInfo) {
      removeFileFromSupabase(attachment.uploadInfo.path, bucketName);
    }
  };

  if (!attachment?.imageInfo) {
    return null;
  }

  const imageFilename = file.name.replace(".fig.json", "");

  return (
    <div className="relative size-fit inline-block rounded-md overflow-hidden border">
      <Button
        className="absolute top-1 right-1 z-10"
        variant="ghost"
        size="icon"
        onClick={handleRemoveClick}
      >
        <XIcon />
      </Button>

      {!attachment.uploadInfo && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
      )}

      <Image
        src={attachment.imageInfo.dataUrl}
        alt={imageFilename}
        width={attachment.imageInfo.width}
        height={attachment.imageInfo.height}
        className="max-w-screen-s max-h-screen-sm object-contain"
        style={{
          width: "auto",
          height: "auto",
        }}
      />
    </div>
  );
};
