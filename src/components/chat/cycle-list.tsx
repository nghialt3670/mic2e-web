import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { cycles as cyclesTable } from "@/lib/drizzle/drizzle-schema";
import { asc, eq } from "drizzle-orm";

import { CycleItem } from "./cycle-item";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  console.log(cycles);

  return (
    <div className="flex flex-col w-full gap-6">
      {cycles.map((cycle, index) => (
        <CycleItem key={cycle.id} cycle={cycle} />
      ))}
    </div>
  );
};
