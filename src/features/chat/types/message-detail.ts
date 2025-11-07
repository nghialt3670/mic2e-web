import { drizzleClient } from "@/lib/drizzle";

const messageDetail = drizzleClient.query.messages.findFirst({
  with: {
    attachments: {
      with: {
        figUpload: true,
        imageUpload: true,
        thumbnailUpload: true,
      },
    },
  },
});

export type MessageDetail = NonNullable<Awaited<typeof messageDetail>>;
