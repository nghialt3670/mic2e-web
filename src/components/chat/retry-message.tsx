import { FC, useState } from "react";
import { withToastHandler } from "@/utils/client/action-utils";
import { generateCycle } from "@/actions/cycle-actions";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";

interface RetryMessageProps {
  cycleId: string;
}

export const RetryMessage: FC<RetryMessageProps> = ({ cycleId }) => {
  const [loading, setLoading] = useState(false);
  const handleRetryClick = async () => {
    setLoading(true);
    await withToastHandler(generateCycle, {
      cycleId,
    });
    setLoading(false);
  };
  return (
    <div className="flex flex-row items-center justify-start gap-1 bg-muted p-1 rounded-lg">
      <div className="w-full flex justify-start px-1.5">
        <span className="text-muted-foreground">Failed to generate response. Please try again.</span>
      </div>
      <Button className="p-1 size-fit" variant="outline" size="icon" onClick={handleRetryClick} disabled={loading}>
        <RefreshCcw className={cn("size-3", loading && "animate-spin text-muted-foreground")} />
      </Button>
    </div>
  );
};