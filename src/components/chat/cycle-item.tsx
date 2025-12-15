"use client";

import { ChatCycleDetail } from "@/types/chat-cycle-detail";
import { FC, useMemo } from "react";

import { CycleDetail } from "./cycle-detail";
import { CycleRegenerate } from "./cycle-regenerate";
import { MessageItem } from "./message-item";
import { ContextDialog } from "./context-dialog";
import { RetryMessage } from "./retry-message";
import { MessageText } from "./message-text";
import { Skeleton } from "../ui/skeleton";

interface CycleItemProps {
  cycle: ChatCycleDetail;
  failed: boolean;
}

export const CycleItem: FC<CycleItemProps> = ({ cycle, failed }) => {
  const { request, response } = cycle;
  const jsonData = cycle.jsonData as any;
  console.log(jsonData);

  const loadingMessage = useMemo(() => {
    const messages = [
      "Hang on…",
      "Processing your request…",
      "Be patient…",
      "Working on it…",
      "Almost there…",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="w-full flex justify-end">
        <MessageItem message={request} type="request" />
      </div>
      {response && (
        <div className="flex flex-col gap-2">
          <div className="w-full flex justify-start">
            <MessageItem message={response} type="response" />
          </div>
          <div className="flex items-start gap-1">
            <CycleRegenerate cycleId={cycle.id} />
            {jsonData && <CycleDetail jsonData={jsonData} />}
            {cycle.context && <ContextDialog context={cycle.context} />}
          </div>
        </div>
      )}
      {failed && (
        <div className="w-full flex justify-start">
          <RetryMessage cycleId={cycle.id} />
        </div>
      )}
      {!failed && !response && (
        <div className="w-full flex justify-start">
          <div
            className="p-3 w-fit max-w-[80%] border bg-muted animate-pulse overflow-hidden"
            style={{ borderRadius: "0rem 0.5rem 0.5rem 0.5rem" }}
          >
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" />
              {loadingMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
