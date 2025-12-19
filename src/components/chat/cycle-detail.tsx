"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatContext } from "@/contexts/chat-context";
import { Chat2EditProgressEvent } from "@/types/chat2edit-progress";
import { ListChevronsUpDown } from "lucide-react";
import { FC, useContext, useState } from "react";

import { PromptCycle } from "./prompt-cycle-item";
import { PromptCycleList } from "./prompt-cycle-list";

interface CycleDetailProps {
  cycleId: string;
  jsonData: any;
}

export const CycleDetail: FC<CycleDetailProps> = ({ cycleId, jsonData }) => {
  const { progressEventsByCycle } = useContext(ChatContext);
  const [open, setOpen] = useState(false);
  const cycles = jsonData?.cycles || ([] as PromptCycle[]);
  const liveEvents: Chat2EditProgressEvent[] =
    (progressEventsByCycle && progressEventsByCycle[cycleId]) || [];

  const hasCycles = cycles && cycles.length > 0;
  const cycleCount = cycles?.length || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          disabled={!hasCycles}
          className="p-1 size-fit"
          title="View cycle details"
        >
          <ListChevronsUpDown className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col p-0 overflow-hidden"
        style={{
          width: "60vw",
          height: "90vh",
          maxWidth: "60vw",
          maxHeight: "90vh",
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-3 border-b flex flex-row items-center justify-between gap-4">
          <div>
            <DialogTitle className="text-base">Prompt Cycles</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Inspect the LLM exchanges and code execution blocks for this
              cycle.
            </p>
          </div>
          <Badge variant={hasCycles ? "outline" : "secondary"}>
            {hasCycles ? `${cycleCount} cycles` : "No cycles"}
          </Badge>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 h-full max-h-full">
          {/* Live WebSocket progress events (current session) */}
          {liveEvents.length > 0 && (
            <div className="mb-4 rounded-md border bg-muted/30 p-3">
              <div className="mb-2 text-xs font-semibold text-muted-foreground">
                Live Chat2Edit progress (this session)
              </div>
              <div className="space-y-1 text-xs">
                {liveEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 rounded-md bg-background/80 px-2 py-1"
                  >
                    <span className="inline-flex h-1.5 w-1.5 mt-1 rounded-full bg-primary" />
                    <div>
                      <span className="font-medium uppercase text-[10px] tracking-wide text-primary">
                        {event.type}
                      </span>
                      {event.message && (
                        <span className="ml-2 text-[11px] text-muted-foreground">
                          {event.message}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stored Chat2Edit cycles (from backend jsonData) */}
          {hasCycles ? (
            <PromptCycleList cycles={cycles} />
          ) : (
            <div className="p-6 text-sm text-muted-foreground text-center">
              No prompt cycles available for this chat cycle yet.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
