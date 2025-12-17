import { clearCycle, generateCycle } from "@/actions/cycle-actions";
import { withToastHandler } from "@/utils/client/action-utils";
import { RefreshCcw } from "lucide-react";

import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CycleRegenerateProps {
  cycleId: string;
}

export const CycleRegenerate = ({ cycleId }: CycleRegenerateProps) => {
  const [loading, setLoading] = useState(false);
  const handleRegenerateCycle = async () => {
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
    <Button
      variant="ghost"
      size="icon"
      className="p-1 size-fit"
      onClick={handleRegenerateCycle}
      disabled={loading}
      title="Regenerate cycle"
    >
      <RefreshCcw className={cn("size-4", loading && "animate-spin text-muted-foreground")} />
    </Button>
  );
};
