import { FC, useState } from "react";
import { MessageText } from "./message-text";
import { withToastHandler } from "@/utils/client/action-utils";
import { generateCycle } from "@/actions/cycle-actions";
import { Button } from "../ui/button";

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
    <div className="flex flex-col gap-1">
      <div className="w-full flex justify-start">
        <MessageText text="Failed to generate response. Please try again." />
      </div>
      <div className="mt-2">
        <Button variant="outline" size="sm" onClick={handleRetryClick} disabled={loading}>Retry</Button>
      </div>
    </div>
  );
};