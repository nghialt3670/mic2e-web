"use client";

import { ChatCycleDetail } from "@/types/chat-cycle-detail";
import { FC } from "react";

import { CycleDetail } from "./cycle-detail";
import { CycleRegenerate } from "./cycle-regenerate";
import { MessageItem } from "./message-item";
import { ContextDialog } from "./context-dialog";

interface CycleItemProps {
  cycle: ChatCycleDetail;
}

export const CycleItem: FC<CycleItemProps> = ({ cycle }) => {
  const { request, response } = cycle;
  const jsonData = cycle.jsonData as any;
  console.log(jsonData);

  return (
    <div className="flex flex-col h-full w-full pr-2 pl-6 gap-6">
      <div className="w-full flex justify-end">
        <MessageItem message={request} type="request" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="w-full flex justify-start">
          {response && <MessageItem message={response} type="response" />}
        </div>
        <div className="flex items-start gap-1">
          <CycleRegenerate cycleId={cycle.id} />
          {jsonData && <CycleDetail jsonData={jsonData} />}
          {cycle.context && <ContextDialog context={cycle.context} />}
        </div>
      </div>
    </div>
  );
};
