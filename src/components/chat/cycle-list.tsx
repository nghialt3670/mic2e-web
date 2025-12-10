import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { cycles as cyclesTable } from "@/lib/drizzle/drizzle-schema";
import { asc, desc, eq } from "drizzle-orm";

import { CycleItem } from "./cycle-item";

export const CycleList = async ({ chatId }: { chatId: string }) => {
  const cycles = await drizzleClient.query.cycles.findMany({
    where: eq(cyclesTable.chatId, chatId),
    orderBy: asc(cyclesTable.createdAt),
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
    },
  });

  return (
    <div className="flex flex-col w-full gap-10">
      {cycles.map((cycle, index) => (
        <CycleItem key={cycle.id} cycle={cycle} />
      ))}
    </div>
  );
};
