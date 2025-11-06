import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AttachmentEditor } from "@/features/edit/components/message-attachment-editor";
import Image from "next/image";
import { FC, useEffect, useState } from "react";

import { AttachmentDetail } from "../../types";
import { createImageThumbnail } from "@/utils/client/image";
import { createFigFromUrl, createImageFileFromFig } from "@/lib/fabric/fabric-utils";
import { uploadFileToSupabase } from "@/lib/supabase/supabase-utils";
import { clientEnv } from "@/utils/client/client-env";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { createThumbnail } from "../../actions/attachment-actions/create-thumbnail";

interface MessageAttachmentItemProps {
  attachment: AttachmentDetail;
}

export const MessageAttachmentItem: FC<MessageAttachmentItemProps> = ({
  attachment,
}) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const bucketName = clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME;
  const [localAttachment, setLocalAttachment] = useState<AttachmentDetail>(attachment);

  useEffect(() => {
    const thumbnailAttachment = async () => {
      const fig = await createFigFromUrl(attachment.url);
      const file = await createImageFileFromFig(fig);
      const thumbnail = await createImageThumbnail(file);
      const timestamp = Date.now();
      const path = `thumbnails/${timestamp}_${attachment.originalFilename}.jpeg`;
      const url = await uploadFileToSupabase(thumbnail.file, path, bucketName);
      const createdThumbnail = await withToastHandler(createThumbnail, {
        attachmentId: attachment.id,
        thumbnail: {
          url,
          width: thumbnail.width,
          height: thumbnail.height,
        },
      });
      setLocalAttachment({
        ...attachment,
        thumbnail: createdThumbnail,
      });
    };
    if (!attachment.thumbnail) {
      thumbnailAttachment();
    }
  }, [attachment]);

  if (!localAttachment.thumbnail || !localAttachment.url) {
    return null;
  }

  return (
    <>
      <div className="group relative h-128 rounded-md border bg-gray-50 flex items-center justify-center cursor-pointer hover:z-10">
        <div
          className="flex items-center justify-center"
          onClick={() => setIsZoomOpen(true)}
          style={{
            height: "100%",
            width: "auto",
          }}
        >
          <Image
            src={localAttachment.thumbnail.url}
            alt={localAttachment.thumbnail.url}
            width={localAttachment.thumbnail.width}
            height={localAttachment.thumbnail.height}
            className="object-contain h-full w-auto transition-transform duration-500 group-hover:scale-101 rounded-md"
            unoptimized
          />
        </div>
      </div>
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent
          className="w-[100vw] max-w-[100vw] sm:max-w-[100vw] h-[100vh] max-h-[100vh] p-0"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{localAttachment.url}</DialogTitle>
          <AttachmentEditor
            attachment={localAttachment}
            onClose={() => setIsZoomOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
