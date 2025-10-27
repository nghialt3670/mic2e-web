import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AttachmentEditor } from "@/features/edit/components/message-attachment-editor";
import Image from "next/image";
import { FC, useState } from "react";

import { AttachmentDetail } from "../../types";

interface MessageAttachmentItemProps {
  attachment: AttachmentDetail;
}

export const MessageAttachmentItem: FC<MessageAttachmentItemProps> = ({
  attachment,
}) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  if (!attachment.thumbnail || !attachment.url) {
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
            src={attachment.thumbnail.url}
            alt={attachment.thumbnail.url}
            width={attachment.thumbnail.width}
            height={attachment.thumbnail.height}
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
          <DialogTitle className="sr-only">{attachment.url}</DialogTitle>
          <AttachmentEditor
            attachment={attachment}
            onClose={() => setIsZoomOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
