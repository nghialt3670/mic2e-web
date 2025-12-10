"use server";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  Thumbnail,
  thumbnails as thumbnailsTable,
} from "@/lib/drizzle/drizzle-schema";
import { withAuthHandler, withErrorHandler } from "@/utils/server/action-utils";

export interface ThumbnailCreateRequest {
  thumbnail: Omit<Thumbnail, "id" | "createdAt" | "updatedAt">;
}

export const createThumbnail = withErrorHandler(
  withAuthHandler<ThumbnailCreateRequest, Thumbnail>(async ({ thumbnail }) => {
    console.log("thumbnail", thumbnail)
    const [createdThumbnail] = await drizzleClient
      .insert(thumbnailsTable)
      .values({ ...thumbnail })
      .returning();

    return {
      message: "Thumbnail created successfully.",
      code: 200,
      data: createdThumbnail,
    };
  }),
);
