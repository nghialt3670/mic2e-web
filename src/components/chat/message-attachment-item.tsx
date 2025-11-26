import { useState } from "react";
import Image from "next/image";
import { FC, useEffect } from "react";

import { createImageFileFromFigObject } from "@/lib/fabric";
import { uploadFileToSupabase } from "@/lib/supabase/supabase-utils";
import { clientEnv } from "@/utils/client/client-env";
import { createImageThumbnail } from "@/utils/client/image";
import type { AttachmentDetail } from "../../types";

interface MessageAttachmentItemProps {
  attachment: AttachmentDetail;
}

export const MessageAttachmentItem: FC<MessageAttachmentItemProps> = ({
  attachment,
}) => {
  const [thumbnail, setThumbnail] = useState(attachment.thumbnailUpload);

  useEffect(() => {
    const ensureThumbnail = async () => {
      if (attachment.thumbnailUpload?.url) {
        setThumbnail(attachment.thumbnailUpload);
        return;
      }

      if (attachment.type !== "fig" || !attachment.figUpload?.url) {
        return;
      }

      try {
        const response = await fetch(attachment.figUpload.url);
        if (!response.ok) return;
        const figJson = await response.json();
        const imageFile = await createImageFileFromFigObject(figJson);
        const {
          file: thumbnailFile,
          width,
          height,
        } = await createImageThumbnail(imageFile);

        const bucketName = clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME;
        const thumbnailPath = `thumbnails/${attachment.figUpload.filename}.jpeg`;
        const thumbnailUrl = await uploadFileToSupabase(
          thumbnailFile,
          thumbnailPath,
          bucketName,
        );

        setThumbnail({
          id: attachment.thumbnailUploadId ?? attachment.figUploadId ?? "",
          filename: attachment.figUpload.filename,
          path: thumbnailPath,
          url: thumbnailUrl,
          width,
          height,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
      } catch (error) {
        console.error("Failed to create thumbnail", error);
      }
    };

    ensureThumbnail();
  }, [attachment]);

  if (attachment.type !== "fig" || !thumbnail?.url) {
    return null;
  }

  const { filename, url, width, height } = thumbnail;

  return (
    <Image
      src={url}
      alt={filename}
      width={width}
      height={height}
      className="object-contain h-full w-auto transition-transform duration-500 group-hover:scale-101 rounded-md"
      unoptimized
    />
  );
};
