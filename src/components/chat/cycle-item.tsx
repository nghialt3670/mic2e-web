"use client";

import { MessageSkeleton } from "@/components/chat/message-skeleton";
import { ChatCycleDetail } from "@/types/chat-cycle-detail";
import { FC } from "react";

import { MessageItem } from "./message-item";
import { PromptCycle } from "./prompt-cycle-item";
import { PromptCycleList } from "./prompt-cycle-list";

interface CycleItemProps {
  cycle: ChatCycleDetail;
}

interface ChatCycleDataJson {
  cycles?: PromptCycle[];
}

export const CycleItem: FC<CycleItemProps> = ({
  cycle,
}) => {
  const { request, response, jsonData } = cycle;

  const cycles = jsonData?.cycles || [];

  return (
    <div className="flex flex-col justify-start items-center h-full w-full pr-2 pl-6 gap-2">
      <div className="max-w-5xl w-full">
        <MessageItem message={request} />
      </div>

      {cycles.length > 0 && (
        <div className="w-full flex justify-center">
          <PromptCycleList cycles={cycles} />
        </div>
      )}

      <div className="max-w-5xl w-full">
        {response ? (
          <MessageItem message={response} />
        ) : null}
      </div>
    </div>
  );
};
