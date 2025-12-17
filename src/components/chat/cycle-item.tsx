"use client";

import { ChatCycleDetail } from "@/types/chat-cycle-detail";
import { FC, useState, useEffect } from "react";

import { CycleDetail } from "./cycle-detail";
import { CycleRegenerate } from "./cycle-regenerate";
import { MessageItem } from "./message-item";
import { ContextDialog } from "./context-dialog";
import { RetryMessage } from "./retry-message";

interface CycleItemProps {
  cycle: ChatCycleDetail;
  failed: boolean;
}

const LOADING_MESSAGES = [
  "Hang on…",
  "Processing your request…",
  "Be patient…",
  "Working on it…",
  "Almost there…",
  "Analyzing your image…",
  "Thinking…",
  "Generating response…",
  "Just a moment…",
  "Understanding your request…",
  "Preparing the magic…",
  "Computing…",
  "This won't take long…",
  "Loading…",
  "Give me a second…",
];

export const CycleItem: FC<CycleItemProps> = ({ cycle, failed }) => {
  const { request, response } = cycle;
  const jsonData = cycle.jsonData as any;

  const [loadingMessage, setLoadingMessage] = useState(() => {
    return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
  });

  useEffect(() => {
    // Change loading message every 3 seconds
    const interval = setInterval(() => {
      setLoadingMessage(
        LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
      );
    }, 5000);

    return () => clearInterval(interval);
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
        <div className="flex flex-col gap-2">
          <div className="w-full flex justify-start">
            <RetryMessage cycleId={cycle.id} />
          </div>
          <div className="flex items-start gap-1">
            {jsonData && <CycleDetail jsonData={jsonData} />}
            {cycle.context && <ContextDialog context={cycle.context} />}
          </div>
        </div>
      )}
      {!failed && !response && (
        <div className="w-full flex justify-start">
          <div
            className="p-1 w-fit max-w-[80%] border bg-muted animate-pulse overflow-hidden rounded-lg px-3"
          >
            <div className="text text-muted-foreground flex items-center gap-2" style={{ fontStyle: 'italic' }}>
              <span className="inline-flex h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" />
              {loadingMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
