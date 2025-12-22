"use client";

import { ChatContext } from "@/contexts/chat-context";
import { ChatCycleDetail } from "@/types/chat-cycle-detail";
import { FC, useContext } from "react";

import { ContextDialog } from "./context-dialog";
import { CycleDetail } from "./cycle-detail";
import { CycleProgressView } from "./cycle-progress-view";
import { CycleRegenerate } from "./cycle-regenerate";
import { MessageItem } from "./message-item";
import { RetryMessage } from "./retry-message";

interface CycleItemProps {
  cycle: ChatCycleDetail;
  failed: boolean;
  progressMessage?: string | null;
}

export const CycleItem: FC<CycleItemProps> = ({
  cycle,
  failed,
  progressMessage,
}) => {
  const { progressEventsByCycle } = useContext(ChatContext);
  const { request, response } = cycle;
  const jsonData = cycle.jsonData as any;

  const liveEvents =
    (progressEventsByCycle && progressEventsByCycle[cycle.id]) || [];
  const effectiveProgress = progressMessage || "";

  // Show progress if we have live events OR jsonData with cycles OR if we're still generating (no response yet)
  const hasProgress =
    liveEvents.length > 0 || (jsonData?.cycles && jsonData.cycles.length > 0);
  const isGenerating = !response && !failed;

  console.log(JSON.stringify(jsonData, null, 2));

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="w-full flex justify-end">
        <MessageItem message={request} type="request" />
      </div>
      
      {/* Show progress view before response (when generating or after completion) */}
      {(hasProgress || isGenerating) && (
        <div className="w-full flex justify-start">
          <CycleProgressView
            events={liveEvents}
            jsonData={jsonData}
            isComplete={!!response}
          />
        </div>
      )}

      {response && (
        <div className="flex flex-col gap-2">
          <div className="w-full flex justify-start">
            <MessageItem message={response} type="response" />
          </div>
          <div className="flex items-start gap-1">
            <CycleRegenerate cycleId={cycle.id} />
            {jsonData && <CycleDetail cycleId={cycle.id} jsonData={jsonData} />}
            {cycle.context && <ContextDialog context={cycle.context} />}
          </div>
        </div>
      )}
      {failed && (
        <div className="flex flex-col gap-2">
          <div className="w-full flex justify-start">
            <RetryMessage cycleId={cycle.id} />
          </div>
          <div className="flex items-start gap-1">
            {jsonData && <CycleDetail cycleId={cycle.id} jsonData={jsonData} />}
            {cycle.context && <ContextDialog context={cycle.context} />}
          </div>
        </div>
      )}
      {!failed && !response && !hasProgress && (
        <div className="w-full flex flex-col items-start gap-2">
          {/* Loading placeholder - only show when no progress available */}
          {effectiveProgress && (
            <div className="p-1 w-fit max-w-[80%] border bg-muted animate-pulse overflow-hidden rounded-lg px-3">
              <div
                className="text text-muted-foreground flex items-center gap-2"
                style={{ fontStyle: "italic" }}
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" />
                {effectiveProgress}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
