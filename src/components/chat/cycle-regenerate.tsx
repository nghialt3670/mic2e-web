import { generateCycle } from "@/actions/cycle-actions";
import { withToastHandler } from "@/utils/client/action-utils";
import { RefreshCcw } from "lucide-react";

import { Button } from "../ui/button";

interface CycleRegenerateProps {
  cycleId: string;
}

export const CycleRegenerate = ({ cycleId }: CycleRegenerateProps) => {
  const handleRegenerateCycle = async () => {
    await withToastHandler(generateCycle, {
      cycleId,
    });
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="p-1 size-fit"
      onClick={handleRegenerateCycle}
    >
      <RefreshCcw className="size-3" />
    </Button>
  );
};
