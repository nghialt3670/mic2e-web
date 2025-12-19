import { drizzleClient } from "@/lib/drizzle";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _chatDetails = drizzleClient.query.chats.findFirst({
  with: {
    cycles: {
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
    },
  },
});

export type ChatDetails = NonNullable<Awaited<typeof _chatDetails>>;
