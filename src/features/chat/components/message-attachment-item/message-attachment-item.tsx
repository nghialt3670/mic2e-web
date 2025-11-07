import Image from "next/image";
import { FC } from "react";

import { AttachmentDetail } from "../../types";

interface MessageAttachmentItemProps {
  attachment: AttachmentDetail;
}

export const MessageAttachmentItem: FC<MessageAttachmentItemProps> = ({
  attachment,
}) => {
  switch (attachment.type) {
    case "fig":
      if (!attachment.thumbnailUpload?.url) {
        return null;
      }

      const { filename, url, width, height } = attachment.thumbnailUpload;

      return <Image
        src={url}
        alt={filename}
        width={width}
        height={height}
        className="object-contain h-full w-auto transition-transform duration-500 group-hover:scale-101 rounded-md"
        unoptimized
      />;
    default:
      return null;
  }
};
