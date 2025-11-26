"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { FC, useState } from "react";

import { PromptCycle, PromptCycleItem } from "./prompt-cycle-item";

interface PromptCycleListProps {
  cycles: PromptCycle[];
}

export const PromptCycleList: FC<PromptCycleListProps> = ({ cycles }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!cycles || cycles.length === 0) {
    return null;
  }

  const totalExchanges = cycles.reduce(
    (sum, cycle) => sum + cycle.exchanges.length,
    0,
  );
  const totalBlocks = cycles.reduce(
    (sum, cycle) => sum + cycle.blocks.length,
    0,
  );
  const hasErrors = cycles.some(
    (cycle) =>
      cycle.exchanges.some((ex) => ex.error) ||
      cycle.blocks.some((block) => block.error),
  );

  return (
    <div className="w-full max-w-5xl my-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between p-4 h-auto hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 transition-transform" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform" />
              )}
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">
                Processing Details ({totalExchanges} exchanges, {totalBlocks}{" "}
                executions)
              </span>
            </div>
            {hasErrors ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="border border-t-0 rounded-b-lg bg-muted/30 overflow-hidden transition-all duration-300">
          <div className="p-4 space-y-4">
            {cycles.map((cycle, cycleIndex) => (
              <PromptCycleItem
                key={cycleIndex}
                cycle={cycle}
                cycleIndex={cycleIndex}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
