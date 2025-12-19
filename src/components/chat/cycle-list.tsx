"use client";

import { ChatContext } from "@/contexts/chat-context";
import { useContext } from "react";

import { CycleItem } from "./cycle-item";
import { CycleProgressTracker } from "./cycle-progress-tracker";

export const CycleList = () => {
  const { chat, progressMessage } = useContext(ChatContext);

  const sortedCycles =
    chat?.cycles.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    ) || [];
  const lastCycle = sortedCycles[sortedCycles.length - 1];

  return (
    <div className="flex flex-col w-full gap-6">
      {sortedCycles.map((cycle) => {
        const isLastCycle = cycle.id === lastCycle?.id;
        const isGenerating = isLastCycle && !cycle.response && !chat?.failed;

        return (
          <div key={cycle.id}>
            {isGenerating && (
              <CycleProgressTracker cycleId={cycle.id} isActive={true} />
            )}
            <CycleItem
              cycle={cycle}
              failed={!!chat?.failed}
              progressMessage={isLastCycle ? progressMessage : null}
            />
          </div>
        );
      })}
    </div>
  );
};
