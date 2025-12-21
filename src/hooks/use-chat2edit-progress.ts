"use client";

import { clientEnv } from "@/utils/client/env-utils";
import { useEffect, useRef, useState } from "react";

export interface Chat2EditProgressEvent {
  type:
    | "request"
    | "prompt"
    | "answer"
    | "extract"
    | "execute"
    | "complete"
    | "error";
  message?: string;
  data?: Record<string, any>;
}

interface UseChat2EditProgressOptions {
  cycleId: string;
  onProgress?: (event: Chat2EditProgressEvent) => void;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function useChat2EditProgress({
  cycleId,
  onProgress,
  onComplete,
  onError,
}: UseChat2EditProgressOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const lastEventCountRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!cycleId) return;

    let isCancelled = false;

    const url = `${clientEnv.NEXT_PUBLIC_BASE_PATH}/api/agent/chat2edit/progress/${cycleId}`;

    const poll = async () => {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        const events = (json?.data || []) as Chat2EditProgressEvent[];

        if (isCancelled) return;

        // First successful poll -> mark as "connected"
        if (!isConnectedRef.current) {
          isConnectedRef.current = true;
          setIsConnected(true);
        }

        // Determine new events since last poll
        const previousCount = lastEventCountRef.current;
        if (events.length > previousCount) {
          const newEvents = events.slice(previousCount);
          lastEventCountRef.current = events.length;

          for (const event of newEvents) {
            // Update progress message
            if (event.message) {
              setProgressMessage(event.message);
            }

            // Notify caller
            onProgress?.(event);

            if (event.type === "complete") {
              onComplete?.(event.data);
              // Stop polling after completion
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              setIsConnected(false);
              return;
            }

            if (event.type === "error") {
              onError?.(event.message || "Unknown error");
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              setIsConnected(false);
              return;
            }
          }
        }
      } catch (err: any) {
        console.error(`Polling error for cycle ${cycleId}:`, err);
        onError?.("Failed to fetch progress");
      }
    };

    // Initial poll immediately
    poll();

    // Then poll periodically - reduced interval for faster updates
    intervalRef.current = setInterval(poll, 300);

    // Cleanup on unmount or cycleId change
    return () => {
      isCancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastEventCountRef.current = 0;
      isConnectedRef.current = false;
      setIsConnected(false);
    };
  }, [cycleId, onProgress, onComplete, onError]);

  return {
    isConnected,
    progressMessage,
  };
}
