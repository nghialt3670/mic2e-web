import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AttachmentDetail } from "../../types";
import Image from "next/image";
import { FC, useState } from "react";

interface MessageAttachmentItemProps {
  attachment: AttachmentDetail;
}

export const MessageAttachmentItem: FC<MessageAttachmentItemProps> = ({ attachment }) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  if (!attachment.thumbnail || !attachment.url) {
    return null;
  }

  return (
    <>
      <div className="group relative h-40 rounded-md border bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center cursor-pointer overflow-visible hover:z-10">
        <div
          className="w-full h-full flex items-center justify-center"
          onClick={() => setIsZoomOpen(true)}
        >
          <Image
            src={attachment.thumbnail.url}
            alt={attachment.url}
            width={attachment.thumbnail.width}
            height={attachment.thumbnail.height}
            className="object-contain max-h-full w-auto transition-all duration-500 group-hover:scale-102 rounded-md"
            style={{
              width: "auto",
              height: "auto",
            }}
          />
        </div>
      </div>

      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] size-fit p-0 overflow-hidden">
          <DialogTitle className="sr-only">{attachment.url}</DialogTitle>
          <div className="relative flex items-center justify-center">
            <Image
              src={attachment.thumbnail.url}
              alt={attachment.url}
              width={attachment.thumbnail.width}
              height={attachment.thumbnail.height}
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
