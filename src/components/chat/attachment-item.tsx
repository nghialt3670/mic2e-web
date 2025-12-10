"use client";

import { updateAttachmentThumbnail } from "@/actions/attachment-actions";
import { createThumbnail } from "@/actions/thumbnail-actions";
import {
  createFigObjectFromFigFile,
  createImageFileFromFigObject,
} from "@/lib/fabric";
import { downloadFile, uploadFile } from "@/lib/storage";
import { withToastHandler } from "@/utils/client/action-utils";
import { clientEnv } from "@/utils/client/env-utils";
import { createImageThumbnail } from "@/utils/client/image-utils";
import Image from "next/image";
import { createRef, FC, useEffect, useState } from "react";

import type { AttachmentDetail } from "../../types";
import { useMessageInputStore } from "@/stores/message-input-store";
import { FigCanvasRef } from "../edit/fig-canvas";

interface AttachmentItemProps {
  attachment: AttachmentDetail;
}

export const AttachmentItem: FC<AttachmentItemProps> = ({ attachment }) => {
  const [thumbnail, setThumbnail] = useState(attachment.thumbnail);
  const { addAttachment } = useMessageInputStore();

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
        const figBlob = await response.blob();
        const figFile = new File([figBlob], attachment.filename, {
          type: "application/json",
        });
        const figObject = await createFigObjectFromFigFile(figFile);
        const imageFile = await createImageFileFromFigObject(figObject);
        const {
          file: thumbnailFile,
          width,
          height,
        } = await createImageThumbnail(imageFile);
        const thumbnailFileId = await uploadFile(thumbnailFile);
        const createdThumbnail = await withToastHandler(createThumbnail, {
          thumbnail: {
            fileId: thumbnailFileId,
            width,
            height,
          },
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

  const handleImageClick = async () => {
    const figFile = await downloadFile(attachment.fileId);
    addAttachment({ file: figFile, canvasRef: createRef<FigCanvasRef>() });
  }

  return (
    <Image
      src={`${clientEnv.NEXT_PUBLIC_STORAGE_API_HOST}/files/${fileId}`}
      alt={attachment.filename}
      width={width}
      height={height}
      className="object-contain h-full w-auto transition-transform duration-500 group-hover:scale-101 rounded-md"
      unoptimized
      onClick={handleImageClick}
    />
  );
};
