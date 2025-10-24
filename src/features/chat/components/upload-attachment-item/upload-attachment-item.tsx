import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
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
  } = useUploadAttachmentStore();
  const attachment = getAttachment(file.name);
  const bucketName = clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME;
  const [isZoomOpen, setIsZoomOpen] = useState(false);

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
    <>
      <div className="group relative h-40 rounded-md border bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center cursor-pointer overflow-visible hover:z-10">
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

        <div 
          className="w-full h-full flex items-center justify-center"
          onClick={() => setIsZoomOpen(true)}
        >
          <Image
            src={attachment.imageInfo.dataUrl}
            alt={imageFilename}
            width={attachment.imageInfo.width}
            height={attachment.imageInfo.height}
            className="object-contain max-h-full w-auto transition-transform duration-200 group-hover:scale-101 rounded-md"
            style={{
              width: "auto",
              height: "auto",
            }}
          />
        </div>
      </div>

      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <DialogTitle className="sr-only">{imageFilename}</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={attachment.imageInfo.dataUrl}
              alt={imageFilename}
              width={attachment.imageInfo.width}
              height={attachment.imageInfo.height}
              className="object-contain max-w-full max-h-[90vh]"
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
