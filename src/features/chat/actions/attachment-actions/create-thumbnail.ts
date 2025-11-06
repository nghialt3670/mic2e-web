"use server";

import { createFigFromUrl } from "@/lib/fabric/fabric-utils";
import { CreateThumbnailData } from "../message-actions/create-message";
import { withErrorHandler } from "@/utils/server/server-action-handlers";
import { ThumbnailDetail } from "../../types/thumbnail-detail";
import { getSessionUserId } from "@/utils/server/session";
import { attachments, thumbnails } from "@/lib/drizzle/drizzle-schema";
import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { and, eq } from "drizzle-orm";

interface CreateThumbnailRequest {
    attachmentId: string;
    thumbnail: CreateThumbnailData;
}

export const createThumbnail = withErrorHandler<CreateThumbnailRequest, ThumbnailDetail>(async ({ attachmentId, thumbnail }) => {
    const userId = await getSessionUserId();
    if (!userId) {
        return { message: "Unauthorized", code: 401 };
    }
    const attachment = await drizzleClient.query.attachments.findFirst({
        where: eq(attachments.id, attachmentId),
    });
    if (!attachment) {
        return { message: "Attachment not found", code: 404 };
    }

    const createdThumbnail = await drizzleClient.insert(thumbnails).values({
        ...thumbnail,
        attachmentId,
    }).returning().then((rows) => rows[0]);

    return {
        message: "Thumbnail created successfully",
        code: 200,
        data: createdThumbnail,
    };
});