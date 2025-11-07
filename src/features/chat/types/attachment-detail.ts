import { drizzleClient } from "@/lib/drizzle";

const attachmentDetail = drizzleClient.query.attachments.findFirst({
  with: {
    figUpload: true,
    imageUpload: true,
    thumbnailUpload: true,
  },
});

export type AttachmentDetail = NonNullable<Awaited<typeof attachmentDetail>>;
