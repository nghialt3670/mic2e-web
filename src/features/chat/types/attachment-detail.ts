import { Attachment, Thumbnail } from "@/lib/drizzle/drizzle-schema";

export interface AttachmentDetail extends Attachment {
  thumbnail?: Thumbnail;
}