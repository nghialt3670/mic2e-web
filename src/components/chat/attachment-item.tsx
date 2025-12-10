"use client";

import { updateAttachmentThumbnail } from "@/actions/attachment-actions";
import { createThumbnail } from "@/actions/thumbnail-actions";
import { createImageFileFromFigObject } from "@/lib/fabric";
import { uploadFile } from "@/lib/storage";
import { withToastHandler } from "@/utils/client/action-utils";
import { clientEnv } from "@/utils/client/env-utils";
import { createImageThumbnail } from "@/utils/client/image-utils";
import Image from "next/image";
import { FC, useEffect, useState } from "react";

import type { AttachmentDetail } from "../../types";

interface AttachmentItemProps {
  attachment: AttachmentDetail;
}

export const AttachmentItem: FC<AttachmentItemProps> = ({ attachment }) => {
  const [thumbnail, setThumbnail] = useState(attachment.thumbnail);

  useEffect(() => {
    const ensureThumbnail = async () => {
      if (attachment.thumbnail?.fileId) {
        setThumbnail(attachment.thumbnail);
        return;
      }

      try {
        // Build full URL from relative path for fetching
        const attachmentFileUrl = `${clientEnv.NEXT_PUBLIC_STORAGE_API_HOST}/files/${attachment.fileId}`;
        const response = await fetch(attachmentFileUrl);
        if (!response.ok) return;
        const figObject = await response.json();
        const imageFile = await createImageFileFromFigObject(figObject);
        const {
          file: thumbnailFile,
          width,
          height,
        } = await createImageThumbnail(imageFile);
        const thumbnailFileId = await uploadFile(thumbnailFile);
        const createdThumbnail = await withToastHandler(createThumbnail, {
          fileId: thumbnailFileId,
          width,
          height,
        });
        await withToastHandler(updateAttachmentThumbnail, {
          attachmentId: attachment.id,
          thumbnailId: createdThumbnail.id,
        });

        setThumbnail(createdThumbnail);
      } catch (error) {
        console.error("Failed to create thumbnail", error);
      }
    };

    ensureThumbnail();
  }, [attachment]);

  if (!thumbnail) {
    return null;
  }

  const { fileId, width, height } = thumbnail;

  return (
    <Image
      src={`${clientEnv.NEXT_PUBLIC_STORAGE_API_HOST}/files/${fileId}`}
      alt={attachment.filename}
      width={width}
      height={height}
      className="object-contain h-full w-auto transition-transform duration-500 group-hover:scale-101 rounded-md"
      unoptimized
    />
  );
};
