import { drizzleClient } from "@/lib/drizzle";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _chatCycleDetail = drizzleClient.query.chatCycles.findFirst({
  with: {
    requestMessage: {
      with: {
        attachments: {
          with: {
            figUpload: true,
            imageUpload: true,
            thumbnailUpload: true,
          },
        },
      },
    },
    responseMessage: {
      with: {
        attachments: {
          with: {
            figUpload: true,
            imageUpload: true,
            thumbnailUpload: true,
          },
        },
      },
    },
  },
});

export type ChatCycleDetail = NonNullable<
  Awaited<typeof _chatCycleDetail>
>;
