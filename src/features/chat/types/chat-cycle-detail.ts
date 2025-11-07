import { drizzleClient } from "@/lib/drizzle";

const chatCycleDetail = drizzleClient.query.chatCycles.findFirst({
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

export type ChatCycleDetail = NonNullable<Awaited<typeof chatCycleDetail>>;
