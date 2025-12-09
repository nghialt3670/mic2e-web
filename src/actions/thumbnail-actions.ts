import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  Thumbnail,
  thumbnails as thumbnailsTable,
} from "@/lib/drizzle/drizzle-schema";

export const createThumbnails = async (
  thumbnails: Omit<Thumbnail, "id" | "createdAt" | "updatedAt">[],
) => {
  return await drizzleClient
    .insert(thumbnailsTable)
    .values(thumbnails)
    .returning();
};
