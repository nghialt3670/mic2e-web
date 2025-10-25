import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  convertFileToFigJsonFile,
  readFigJsonFileAsDataURL,
} from "@/lib/fabric";
import { removeFileFromSupabase, uploadFileToSupabase } from "@/lib/supabase";
import { clientEnv } from "@/utils/client/client-env";
import { getImageDimensions } from "@/utils/client/file-readers";
import { createImageThumbnail } from "@/utils/client/image";
import { AlertCircle, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
    updateAttachmentThumbnailInfo,
  } = useUploadAttachmentStore();
  const attachment = getAttachment(file.name);
  const bucketName = clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME;
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    const readAttachment = async () => {
      if (attachment?.readInfo) return;
      const figJsonFile = await convertFileToFigJsonFile(file);
      const dataUrl = await readFigJsonFileAsDataURL(figJsonFile);
      const { width, height } = await getImageDimensions(file);
      setAttachment({
        type: "fabric-image-group",
        file: figJsonFile,
        originalFile: file,
        readInfo: {
          dataUrl,
          width,
          height,
        },
      });
    };
    if (!attachment) {
      readAttachment();
    }
  }, [file]);

  useEffect(() => {
    const uploadAttachment = async () => {
      if (!attachment || attachment.uploadInfo) return;
      try {
        const timestamp = Date.now();

        // Upload the fabric JSON file
        const path = `figs/${timestamp}_${attachment.file.name}`;
        const url = await uploadFileToSupabase(
          attachment.file,
          path,
          bucketName,
        );

        updateAttachmentUploadInfo(attachment.originalFile.name, {
          path,
          url,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        updateAttachmentUploadInfo(attachment.originalFile.name, {
          path: "",
          url: "",
          error: errorMessage,
        });
      }
    };

    if (attachment && !attachment.uploadInfo) {
      uploadAttachment();
    }
  }, [attachment]);

  useEffect(() => {
    const thumbnailAttachment = async () => {
      if (!attachment || attachment.thumbnailInfo) return;
      const thumbnail = await createImageThumbnail(attachment.originalFile);
      const timestamp = Date.now();
      const path = `thumbnails/${timestamp}_${attachment.originalFile.name}`;
      const url = await uploadFileToSupabase(thumbnail.file, path, bucketName);
      updateAttachmentThumbnailInfo(attachment.originalFile.name, {
        path,
        url,
        width: thumbnail.width,
        height: thumbnail.height,
      });
    };
    if (attachment && !attachment.thumbnailInfo) {
      thumbnailAttachment();
    }
  }, [attachment]);

  const handleRemoveClick = () => {
    if (!attachment) return;
    removeFile(attachment.originalFile.name);
    removeAttachment(attachment.originalFile.name);
    if (attachment.uploadInfo) {
      removeFileFromSupabase(attachment.uploadInfo.path, bucketName);
    }
  };

  if (!attachment?.readInfo) {
    return null;
  }

  const hasError =
    !!attachment.uploadInfo?.error || !!attachment.thumbnailInfo?.error;

  return (
    <>
      <div
        className={`group relative h-40 rounded-md border bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center cursor-pointer overflow-visible hover:z-10 ${hasError ? "border-red-400 hover:border-red-500" : ""}`}
      >
        <Button
          className="absolute top-1 right-1 z-10 bg-white/80 hover:bg-white size-6 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveClick();
          }}
        >
          <XIcon className="h-4 w-4" />
        </Button>

        {!attachment.uploadInfo && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 z-[5]" />
        )}

        {attachment.uploadInfo?.error && (
          <div
            className="absolute inset-0 m-auto z-10 text-red-400 p-2 size-fit"
            title={attachment.uploadInfo.error}
          >
            <AlertCircle size={64} />
          </div>
        )}

        <div
          className="w-full h-full flex items-center justify-center"
          onClick={() => setIsZoomOpen(true)}
        >
          <Image
            src={attachment.readInfo.dataUrl}
            alt={attachment.originalFile.name}
            width={attachment.readInfo.width}
            height={attachment.readInfo.height}
            className={`object-contain max-h-full w-auto transition-all duration-500 group-hover:scale-102 rounded-md ${hasError ? "opacity-50" : ""}`}
            style={{
              width: "auto",
              height: "auto",
            }}
          />
        </div>
      </div>

      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] size-fit p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {attachment.originalFile.name}
          </DialogTitle>
          <div className="relative flex items-center justify-center">
            <Image
              src={attachment.readInfo.dataUrl}
              alt={attachment.originalFile.name}
              width={attachment.readInfo.width}
              height={attachment.readInfo.height}
              className="object-contain max-w-full max-h-full"
              style={{
                width: "auto",
                height: "auto",
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
