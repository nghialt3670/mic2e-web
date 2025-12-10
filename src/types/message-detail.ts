import { drizzleClient } from "@/lib/drizzle";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _messageDetail = drizzleClient.query.messages.findFirst({
  with: {
    attachments: {
      with: {
        thumbnail: true,
      },
    },
  },
});

export type MessageDetail = NonNullable<Awaited<typeof _messageDetail>>;
