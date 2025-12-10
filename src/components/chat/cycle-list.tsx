import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import { cycles as cyclesTable } from "@/lib/drizzle/drizzle-schema";
import { asc, eq } from "drizzle-orm";

import { CycleItem } from "./cycle-item";
import { ChatContext } from "@/contexts/chat-context";
import { useContext } from "react";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const CycleList = () => {
  const { chat } = useContext(ChatContext);

  return (
    <div className="flex flex-col w-full gap-6">
      {chat?.cycles.map((cycle) => (
        <CycleItem key={cycle.id} cycle={cycle} />
      ))}
    </div>
  );
};
