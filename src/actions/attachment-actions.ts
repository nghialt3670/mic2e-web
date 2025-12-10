"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  Attachment,
  Thumbnail,
  attachments as attachmentsTable,
  thumbnails as thumbnailsTable,
} from "@/lib/drizzle/drizzle-schema";
import { withAuthHandler, withErrorHandler } from "@/utils/server/action-utils";
import { eq } from "drizzle-orm";

export interface ThumbnailCreateRequest {
  fileId: string;
  width: number;
  height: number;
}

export interface AttachmentCreateRequest {
  fileId: string;
  filename: string;
  thumbnail: ThumbnailCreateRequest;
}

export interface AttachmentsCreateRequest {
  messageId: string;
  attachments: AttachmentCreateRequest[];
}

export const createAttachments = withErrorHandler(
  withAuthHandler<AttachmentsCreateRequest, Attachment[]>(
    async ({ messageId, attachments }) => {
      const createdThumbnails = await drizzleClient
        .insert(thumbnailsTable)
        .values(attachments.map((attachment) => attachment.thumbnail))
        .returning();
      const thumbnailIds = createdThumbnails.map((thumbnail) => thumbnail.id);

      const createdAttachments = await drizzleClient
        .insert(attachmentsTable)
        .values(
          attachments.map((attachment, index) => ({
            messageId,
            ...attachment,
            thumbnailId: thumbnailIds[index],
          })),
        )
        .returning();

      return {
        message: "Attachments created successfully.",
        code: 200,
        data: createdAttachments,
      };
    },
  ),
);

export interface UpdateAttachmentThumbnailRequest {
  attachmentId: string;
  thumbnailId: string;
}

export const updateAttachmentThumbnail = withErrorHandler(
  withAuthHandler<UpdateAttachmentThumbnailRequest, Attachment>(
    async ({ attachmentId, thumbnailId }) => {
      const [updatedAttachment] = await drizzleClient
        .update(attachmentsTable)
        .set({ thumbnailId })
        .where(eq(attachmentsTable.id, attachmentId))
        .returning();

      return {
        message: "Attachment thumbnail updated successfully.",
        code: 200,
        data: updatedAttachment,
      };
    },
  ),
);
