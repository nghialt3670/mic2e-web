"use client";

import { ChatContext } from "@/contexts/chat-context";
import { Chat2EditProgressEvent } from "@/types/chat2edit-progress";
import { ChatCycleDetail } from "@/types/chat-cycle-detail";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { FC, useContext } from "react";

import { ContextDialog } from "./context-dialog";
import { CycleDetail } from "./cycle-detail";
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

  const liveEvents: Chat2EditProgressEvent[] =
    (progressEventsByCycle && progressEventsByCycle[cycle.id]) || [];
  const effectiveProgress =
    progressMessage || (liveEvents.length === 0
      ? "Initializing Chat2Edit… please wait"
      : "");

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
      {!failed && !response && (
        <div className="w-full flex flex-col items-start gap-2">
          {/* Progress headline (text) */}
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

          {/* Structured progress data, similar to PromptCycleItem */}
          {liveEvents.length > 0 && (
            <div className="mt-1 w-full max-w-[80%] rounded-lg border bg-muted/40 p-2">
              <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
                Live Chat2Edit progress
              </div>
              <div className="space-y-1">
                {liveEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="rounded-md bg-background border px-2 py-1.5 text-[11px]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="uppercase tracking-wide text-[10px] font-semibold text-primary">
                        {event.type}
                      </span>
                      {event.message && (
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          {event.message}
                        </span>
                      )}
                    </div>
                    {event.data && (
                      <SyntaxHighlighter
                        language="json"
                        style={oneLight}
                        customStyle={{
                          margin: 0,
                          padding: "0.5rem",
                          fontSize: "0.7rem",
                          lineHeight: "1.4",
                          background: "transparent",
                        }}
                        wrapLongLines
                      >
                        {JSON.stringify(event.data, null, 2)}
                      </SyntaxHighlighter>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
