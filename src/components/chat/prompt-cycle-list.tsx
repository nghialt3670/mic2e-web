"use client";

import { FC } from "react";

import { PromptCycle, PromptCycleItem } from "./prompt-cycle-item";

interface PromptCycleListProps {
  cycles: PromptCycle[];
}

export const PromptCycleList: FC<PromptCycleListProps> = ({ cycles }) => {
  if (!cycles || cycles.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {cycles.map((cycle, cycleIndex) => (
        <PromptCycleItem
          key={cycleIndex}
          cycle={cycle}
          cycleIndex={cycleIndex}
        />
      ))}
    </div>
  );
};
