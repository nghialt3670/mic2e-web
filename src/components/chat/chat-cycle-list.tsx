import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { chatCycles as chatCyclesTable } from "@/lib/drizzle/drizzle-schema";
import { desc, eq } from "drizzle-orm";

import { ChatCycleItem } from "./chat-cycle-item";

export const ChatCycleList = async ({ chatId }: { chatId: string }) => {
  const chatCycles = await drizzleClient.query.chatCycles.findMany({
    where: eq(chatCyclesTable.chatId, chatId),
    orderBy: desc(chatCyclesTable.createdAt),
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

  return (
    <div className="flex flex-col w-full gap-10">
      {chatCycles.map((chatCycle, index) => (
        <ChatCycleItem key={chatCycle.id} chatCycle={chatCycle} />
      ))}
    </div>
  );
};
