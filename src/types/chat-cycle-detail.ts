import { drizzleClient } from "@/lib/drizzle";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _chatCycleDetail = drizzleClient.query.cycles.findFirst({
  with: {
    request: {
      with: {
        attachments: {
          with: {
            thumbnail: true,
          },
        },
      },
    },
    response: {
      with: {
        attachments: {
          with: {
            thumbnail: true,
          },
        },
      },
    },
    context: true,
  },
});

export type ChatCycleDetail = NonNullable<Awaited<typeof _chatCycleDetail>>;
