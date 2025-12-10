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
import { ListChevronsUpDown } from "lucide-react";
import { FC, useState } from "react";

import { PromptCycle } from "./prompt-cycle-item";
import { PromptCycleList } from "./prompt-cycle-list";

interface CycleDetailProps {
  jsonData: any;
}

export const CycleDetail: FC<CycleDetailProps> = ({ jsonData }) => {
  const [open, setOpen] = useState(false);
  const cycles = jsonData?.cycles || ([] as PromptCycle[]);

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
          <ListChevronsUpDown className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col p-0 max-w-4xl max-h-[85vh]">
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

        <ScrollArea className="flex-1 px-6 py-4">
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
