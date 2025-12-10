"use client";

import { CycleItem } from "./cycle-item";
import { ChatContext } from "@/contexts/chat-context";
import { useContext } from "react";

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
