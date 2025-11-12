import { drizzleClient } from "@/lib/drizzle";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _attachmentDetail = drizzleClient.query.attachments.findFirst({
  with: {
    figUpload: true,
    imageUpload: true,
    thumbnailUpload: true,
  },
});

export type AttachmentDetail = NonNullable<
  Awaited<typeof _attachmentDetail>
>;
