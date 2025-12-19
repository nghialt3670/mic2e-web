import { clearCycle, generateCycle } from "@/actions/cycle-actions";
import { cn } from "@/lib/utils";
import { withToastHandler } from "@/utils/client/action-utils";
import { RefreshCcw } from "lucide-react";
import { FC, useState } from "react";

import { Button } from "../ui/button";

interface RetryMessageProps {
  cycleId: string;
}

export const RetryMessage: FC<RetryMessageProps> = ({ cycleId }) => {
  const [loading, setLoading] = useState(false);
  const handleRetryClick = async () => {
    setLoading(true);

    // Clear cycle first (cleanup) - UI will update after this
    setTimeout(async () => {
      await withToastHandler(clearCycle, {
        cycleId,
      });

      // Generate cycle after clearing - UI will update after this too
      setTimeout(async () => {
        await withToastHandler(generateCycle, {
          cycleId,
        });
        setLoading(false);
      }, 100);
    }, 100);
  };
  return (
    <div className="flex flex-row items-center justify-start gap-1 bg-muted p-1 rounded-lg">
      <div className="w-full flex justify-start px-1.5">
        <span className="text-muted-foreground">
          Failed to generate response. Please try again.
        </span>
      </div>
      <Button
        className="p-1 size-fit"
        variant="outline"
        size="icon"
        onClick={handleRetryClick}
        disabled={loading}
      >
        <RefreshCcw
          className={cn(
            "size-3",
            loading && "animate-spin text-muted-foreground",
          )}
        />
      </Button>
    </div>
  );
};
