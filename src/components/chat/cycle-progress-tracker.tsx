"use client";

import { saveGenerationResult } from "@/actions/cycle-actions";
import { ChatContext } from "@/contexts/chat-context";
import { useChat2EditProgress } from "@/hooks/use-chat2edit-progress";
import { withToastHandler } from "@/utils/client/action-utils";
import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";

interface CycleProgressTrackerProps {
  cycleId: string;
  isActive: boolean; // Only track progress for the most recent cycle
}

export const CycleProgressTracker = ({
  cycleId,
  isActive,
}: CycleProgressTrackerProps) => {
  const {
    setProgressMessage,
    addProgressEventForCycle,
    clearProgressEventsForCycle,
  } = useContext(ChatContext);
  const router = useRouter();

  const handleProgress = useCallback(
    (event: any) => {
      console.log("Progress event:", event);
      if (isActive && event.message) {
        setProgressMessage?.(event.message);
      }

      if (isActive && addProgressEventForCycle) {
        addProgressEventForCycle(cycleId, event);
      }
    },
    [isActive, setProgressMessage, addProgressEventForCycle, cycleId],
  );

  const handleComplete = useCallback(
    async (result: any) => {
      console.log("Generation complete:", result);
      if (!isActive) return;

      if (setProgressMessage) {
        setProgressMessage(null);
      }

      if (clearProgressEventsForCycle) {
        clearProgressEventsForCycle(cycleId);
      }

      // Save the result to the database
      try {
        await withToastHandler(saveGenerationResult, {
          cycleId,
          result,
        });
      } catch (error) {
        console.error("Failed to save generation result:", error);
      }

      // Refresh the UI
      router.refresh();
    },
    [
      isActive,
      setProgressMessage,
      clearProgressEventsForCycle,
      cycleId,
      router,
    ],
  );

  const handleError = useCallback(
    (error: string) => {
      console.error("Generation error:", error);
      if (!isActive) return;

      if (setProgressMessage) {
        setProgressMessage(null);
      }

      if (clearProgressEventsForCycle) {
        clearProgressEventsForCycle(cycleId);
      }
      router.refresh();
    },
    [
      isActive,
      setProgressMessage,
      clearProgressEventsForCycle,
      cycleId,
      router,
    ],
  );

  useChat2EditProgress({
    cycleId,
    onProgress: handleProgress,
    onComplete: handleComplete,
    onError: handleError,
  });

  return null; // This is a headless component
};
