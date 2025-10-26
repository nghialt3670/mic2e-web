import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AttachmentDetail } from "../../types";
import Image from "next/image";
import { FC, useState } from "react";
import { AttachmentEditor } from "@/features/edit/components/attachment-editor";

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
            alt={attachment.thumbnail.url}
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
        <DialogContent className="w-[100vw] max-w-[100vw] sm:max-w-[100vw] h-[100vh] max-h-[100vh] p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">{attachment.url}</DialogTitle>
          <AttachmentEditor attachment={attachment} onClose={() => setIsZoomOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
