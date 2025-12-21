"use client";

import { Chat2EditProgressEvent } from "@/types/chat2edit-progress";
import { FC, useEffect, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CycleProgressViewProps {
  events?: Chat2EditProgressEvent[];
  jsonData?: any; // jsonData.cycles format
  isComplete: boolean; // Dim when complete
}

interface ExecutionBlock {
  generated_code: string;
  processed_code?: string;
  start_time?: number;
  end_time?: number;
  error?: any;
  feedback?: any;
  response?: any;
  executed?: boolean;
  logs?: string[];
}

/**
 * Extract thinking and commands from LLM answer text
 */
function extractThinkingCommands(text: string): { thinking: string; commands: string } {
  const parts = text
    .replace(/observation:/gi, "$")
    .replace(/thinking:/gi, "$")
    .replace(/commands:/gi, "$")
    .split("$")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length < 2) {
    return { thinking: "", commands: "" };
  }

  const thinking = parts[parts.length - 2] || "";
  const commandsMatch = parts[parts.length - 1]?.match(/```python([\s\S]*?)```/);
  const commands = commandsMatch ? commandsMatch[1].trim() : "";

  return { thinking, commands };
}

/**
 * Convert timestamp from nanoseconds/milliseconds/seconds to milliseconds
 */
function normalizeTimestamp(timestamp: number | undefined | null): number | undefined {
  if (timestamp === undefined || timestamp === null) return undefined;
  if (typeof timestamp !== "number") return undefined;

  // Nanoseconds (very large numbers > 1e12)
  if (timestamp > 1e12) {
    return timestamp / 1e6; // Convert to milliseconds
  }
  // Seconds (small numbers < 1e10)
  if (timestamp < 1e10) {
    return timestamp * 1000; // Convert to milliseconds
  }
  // Already in milliseconds
  return timestamp;
}

interface ThinkingCommandsPair {
  thinking?: string;
  commands: ExecutionBlock[];
}

interface CommandItemProps {
  block: ExecutionBlock;
  duration: number;
  status: string;
  formatDuration: (seconds: number) => string;
}

const CommandItem: FC<CommandItemProps> = ({
  block,
  duration,
  status,
  formatDuration,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRunning = status === "running";

  const isNotExecuted = status === "not_executed";

  return (
    <div
      className={`relative group cursor-pointer ${
        status === "error"
          ? "text-destructive"
          : status === "feedback"
            ? "text-yellow-600"
            : status === "completed"
              ? "text-green-600"
              : isNotExecuted
                ? "text-muted-foreground/50 opacity-60"
                : "text-muted-foreground"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Command with duration at end */}
      <div className="flex items-start gap-2">
        {/* Command code with glow fade animation when running, dimmed/strikethrough when not executed */}
        <div
          className={`flex-1 min-w-0 ${
            isRunning ? "glowing-code" : ""
          } ${
            isNotExecuted
              ? "opacity-50 line-through"
              : ""
          }`}
          style={
            isRunning
              ? {
                  position: "relative",
                }
              : undefined
          }
        >
          <div className="overflow-x-auto">
            <SyntaxHighlighter
              language="python"
              style={oneLight}
              customStyle={{
                margin: 0,
                padding: 0,
                fontSize: "0.7rem",
                lineHeight: "1.4",
                background: "transparent",
                whiteSpace: "pre",
              }}
              wrapLongLines={false}
            >
              {block.generated_code}
            </SyntaxHighlighter>
          </div>
        </div>
        {/* Duration badge at end - only show for executed commands */}
        {(status === "completed" || status === "running" || block.executed === true) && (
          <span className="text-[10px] font-mono text-muted-foreground/70 mt-0.5 shrink-0">
            {(() => {
              // Calculate duration directly from block timestamps
              let calculatedDuration = duration;
              
              // For completed blocks, calculate from start_time and end_time
              if (calculatedDuration === 0 && block.start_time && block.end_time) {
                if (
                  typeof block.start_time === "number" &&
                  typeof block.end_time === "number" &&
                  block.end_time > block.start_time
                ) {
                  calculatedDuration = Math.floor(
                    (block.end_time - block.start_time) / 1000
                  );
                }
              }
              
              // For running blocks, calculate from start_time to now
              if (calculatedDuration === 0 && block.start_time && !block.end_time) {
                if (typeof block.start_time === "number") {
                  calculatedDuration = Math.floor((Date.now() - block.start_time) / 1000);
                }
              }
              
              // For completed blocks without timestamps but with executed=true, show 0s
              if (calculatedDuration === 0 && (status === "completed" || block.executed === true)) {
                return "[0s]";
              }
              
              // For running blocks, show duration or "..."
              if (status === "running") {
                return calculatedDuration > 0
                  ? `[${formatDuration(calculatedDuration)}]`
                  : "[...]";
              }
              
              // For completed blocks with duration
              return calculatedDuration > 0
                ? `[${formatDuration(calculatedDuration)}]`
                : "[0s]";
            })()}
          </span>
        )}
      </div>

      {/* Expandable error/feedback section */}
      {(block.error || block.feedback) && isExpanded && (
        <div className="mt-2 ml-0 pl-0 border-l-2 border-muted-foreground/20 pl-3">
          {block.error && (
            <div className="text-[10px] text-destructive whitespace-pre-wrap mb-2">
              <span className="font-semibold">Error:</span>{" "}
              {typeof block.error === "string"
                ? block.error
                : block.error?.message ||
                  (typeof block.error === "object"
                    ? JSON.stringify(block.error, null, 2)
                    : String(block.error))}
            </div>
          )}
          {block.feedback && !block.error && (
            <div className="text-[10px] text-yellow-600 whitespace-pre-wrap">
              <span className="font-semibold">Feedback:</span>{" "}
              {typeof block.feedback === "string"
                ? block.feedback
                : block.feedback?.text ||
                  (typeof block.feedback === "object"
                    ? JSON.stringify(block.feedback, null, 2)
                    : String(block.feedback))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const CycleProgressView: FC<CycleProgressViewProps> = ({
  events = [],
  jsonData,
  isComplete,
}) => {
  const [elapsedTimes, setElapsedTimes] = useState<Map<string, number>>(new Map());

  // Process jsonData or events into thinking-commands pairs
  const thinkingCommandsPairs = useMemo(() => {
    const pairs: ThinkingCommandsPair[] = [];

    if (jsonData?.cycles) {
      // Process jsonData structure directly
      for (const cycle of jsonData.cycles) {
        // Extract thinking from exchanges - only take the last one
        const thinkingItems: string[] = [];
        const exchanges = cycle.exchanges || [];
        if (exchanges.length > 0) {
          // Get the last exchange
          const lastExchange = exchanges[exchanges.length - 1];
          if (lastExchange.answer?.text) {
            const { thinking } = extractThinkingCommands(lastExchange.answer.text);
            if (thinking) {
              thinkingItems.push(thinking);
            }
          }
        }

        // Process blocks directly from cycle.blocks
        // Mark blocks as not executed if they come after a block with feedback/error
        const blocks: ExecutionBlock[] = [];
        let hasStoppedExecution = false; // Track if execution stopped due to feedback/error
        
        for (const block of cycle.blocks || []) {
          const code = block.generated_code || block.processed_code || "";
          if (!code) continue;

          // Check if this block has feedback or error (execution stopped here)
          const hasFeedbackOrError = block.feedback || block.error;
          
          // If execution stopped at a previous block, mark subsequent blocks as not executed
          const isExecuted = hasStoppedExecution 
            ? false 
            : (block.executed !== undefined ? block.executed : true);

          blocks.push({
            generated_code: code,
            processed_code: block.processed_code,
            start_time: normalizeTimestamp(block.start_time),
            end_time: normalizeTimestamp(block.end_time),
            executed: isExecuted,
            error: block.error,
            feedback: block.feedback,
            response: block.response,
            logs: block.logs,
          });

          // If this block has feedback/error, mark that execution stopped
          if (hasFeedbackOrError) {
            hasStoppedExecution = true;
          }
        }

        // Sort blocks: executed blocks (with start_time) first, then non-executed
        // Within executed blocks, sort by start_time
        blocks.sort((a, b) => {
          const aHasTime = a.start_time !== undefined && a.start_time !== null;
          const bHasTime = b.start_time !== undefined && b.start_time !== null;

          // If both have timestamps, sort by start_time
          if (aHasTime && bHasTime) {
            return (a.start_time || 0) - (b.start_time || 0);
          }
          // If only a has timestamp, a comes first
          if (aHasTime && !bHasTime) {
            return -1;
          }
          // If only b has timestamp, b comes first
          if (!aHasTime && bHasTime) {
            return 1;
          }
          // Neither has timestamp, maintain original order
          return 0;
        });

        // Create pairs: each thinking followed by its commands
        // For now, all blocks go with the last thinking
        if (thinkingItems.length > 0) {
          for (let i = 0; i < thinkingItems.length; i++) {
            pairs.push({
              thinking: thinkingItems[i],
              commands: i === thinkingItems.length - 1 ? blocks : [],
            });
          }
        } else if (blocks.length > 0) {
          pairs.push({
            commands: blocks,
          });
        }
      }
    } else if (events.length > 0) {
      // Process live events in order to interleave thinking and commands
      // Track blocks by their unique key to merge updates
      const blocksMap = new Map<string, ExecutionBlock>();
      let currentPair: ThinkingCommandsPair | null = null;

      // Track seen thinking to avoid duplicates within the same cycle
      const seenThinking = new Set<string>();
      
      // Process events in chronological order
      for (const event of events) {
        if (event.type === "answer") {
          // Process ALL answer events to preserve thinking from all cycles
          if (event?.data?.text) {
            const { thinking } = extractThinkingCommands(event.data.text);
            if (thinking) {
              // Only create new pair if this thinking hasn't been seen before
              // This prevents duplicates when the same answer event is processed multiple times
              if (!seenThinking.has(thinking)) {
                seenThinking.add(thinking);
                // Save previous pair if exists
                if (currentPair) {
                  pairs.push(currentPair);
                }
                // Start new pair with thinking from this answer event
                currentPair = {
                  thinking,
                  commands: [],
                };
              }
            }
          }
        } else if (event.type === "execute") {
          // Process execute events and add to current pair
          if (!event.data) continue;
          const blockData = event.data as any;
          const code = blockData.generated_code || blockData.processed_code || "";
          if (!code) continue;

          // Create unique key: code + start_time (if available)
          const startTime = normalizeTimestamp(blockData.start_time);
          const blockKey = startTime
            ? `${code}::${startTime}`
            : `${code}::${blocksMap.size}`; // Fallback for blocks without start_time

          // Get existing block or create new one
          let block = blocksMap.get(blockKey);
          if (!block) {
            block = {
              generated_code: code,
              processed_code: blockData.processed_code,
              start_time: startTime,
              end_time: normalizeTimestamp(blockData.end_time),
              executed: blockData.executed,
              error: blockData.error,
              feedback: blockData.feedback,
              response: blockData.response,
              logs: blockData.logs,
            };
            blocksMap.set(blockKey, block);
          } else {
            // Merge updates into existing block
            if (blockData.processed_code) {
              block.processed_code = blockData.processed_code;
            }
            if (startTime !== undefined) {
              block.start_time = startTime;
            }
            if (blockData.end_time !== undefined && blockData.end_time !== null) {
              block.end_time = normalizeTimestamp(blockData.end_time);
            }
            if (blockData.executed !== undefined) {
              block.executed = blockData.executed;
            }
            if (blockData.error !== undefined && blockData.error !== null) {
              block.error = blockData.error;
            }
            if (blockData.feedback !== undefined && blockData.feedback !== null) {
              block.feedback = blockData.feedback;
            }
            if (blockData.response !== undefined && blockData.response !== null) {
              block.response = blockData.response;
            }
            if (blockData.logs !== undefined) {
              block.logs = blockData.logs;
            }
          }

          // Add block to current pair (or create new pair if no thinking yet)
          if (!currentPair) {
            currentPair = {
              commands: [],
            };
          }
          
          // Check if block already exists in current pair (avoid duplicates)
          const existsInPair = currentPair.commands.some(
            (b) =>
              b.generated_code === block.generated_code &&
              b.start_time === block.start_time
          );
          
          if (!existsInPair) {
            currentPair.commands.push(block);
          } else {
            // Update existing block in pair
            const existingIdx = currentPair.commands.findIndex(
              (b) =>
                b.generated_code === block.generated_code &&
                b.start_time === block.start_time
            );
            if (existingIdx >= 0) {
              currentPair.commands[existingIdx] = block;
            }
          }
        }
      }

      // Add the last pair if exists
      if (currentPair) {
        // Sort commands in the pair: executed blocks first, then non-executed
        currentPair.commands.sort((a, b) => {
          const aHasTime = a.start_time !== undefined && a.start_time !== null;
          const bHasTime = b.start_time !== undefined && b.start_time !== null;

          if (aHasTime && bHasTime) {
            return (a.start_time || 0) - (b.start_time || 0);
          }
          if (aHasTime && !bHasTime) {
            return -1;
          }
          if (!aHasTime && bHasTime) {
            return 1;
          }
          return 0;
        });
        pairs.push(currentPair);
      }
    }

    return pairs;
  }, [events, jsonData]);

  // Calculate elapsed times for all blocks
  useEffect(() => {
    const calculateTimes = () => {
      const times = new Map<string, number>();
      const now = Date.now();

      thinkingCommandsPairs.forEach((pair) => {
        pair.commands.forEach((block, idx) => {
          const blockId = `${block.generated_code}::${block.start_time || idx}`;

          if (block.start_time && !block.end_time) {
            // Running block
            if (typeof block.start_time === "number") {
              const elapsed = Math.floor((now - block.start_time) / 1000);
              if (elapsed > 0) {
                times.set(blockId, elapsed);
              }
            }
          } else if (block.start_time && block.end_time) {
            // Completed block - always calculate duration
            if (
              typeof block.start_time === "number" &&
              typeof block.end_time === "number" &&
              block.end_time > block.start_time
            ) {
              const elapsed = Math.floor((block.end_time - block.start_time) / 1000);
              // Always set duration, even if 0 (for very fast executions)
              times.set(blockId, Math.max(elapsed, 0));
            }
          } else if (block.executed === true) {
            // Executed block without timestamps - set to 0
            times.set(blockId, 0);
          }
        });
      });

      return times;
    };

    // Check if we have any running blocks
    const hasRunningBlocks = thinkingCommandsPairs.some((pair) =>
      pair.commands.some((block) => block.start_time && !block.end_time)
    );

    if (!hasRunningBlocks) {
      // No running blocks - calculate once
      setElapsedTimes(calculateTimes());
      return;
    }

    // Has running blocks - update periodically
    const interval = setInterval(() => {
      setElapsedTimes(calculateTimes());
    }, 100);

    return () => clearInterval(interval);
  }, [thinkingCommandsPairs]);

  const getBlockStatus = (block: ExecutionBlock) => {
    if (block.error) return "error";
    if (block.feedback) return "feedback";
    // If has end_time, it's completed
    if (block.end_time) return "completed";
    // If has start_time but no end_time, it's running
    if (block.start_time && !block.end_time) return "running";
    // If executed is true (even without timestamps), consider it completed
    // This handles jsonData blocks that have executed=true but might not have end_time
    if (block.executed === true) return "completed";
    // If executed is explicitly false, it's not executed
    if (block.executed === false) return "not_executed";
    // If no execution info and no timestamps, it's pending/not executed
    if (!block.start_time && !block.end_time && block.executed === undefined) {
      return "not_executed";
    }
    return "pending";
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getBlockDuration = (block: ExecutionBlock, blockId: string): number => {
    // Try to get from elapsedTimes first
    const elapsed = elapsedTimes.get(blockId);
    if (elapsed !== undefined && elapsed > 0) {
      return elapsed;
    }

    // Calculate from timestamps (for completed blocks)
    if (block.start_time && block.end_time) {
      if (
        typeof block.start_time === "number" &&
        typeof block.end_time === "number" &&
        block.end_time > block.start_time
      ) {
        const duration = Math.floor((block.end_time - block.start_time) / 1000);
        return duration > 0 ? duration : 0;
      }
    }

    // For running blocks, calculate from start_time to now
    if (block.start_time && !block.end_time) {
      if (typeof block.start_time === "number") {
        const now = Date.now();
        const duration = Math.floor((now - block.start_time) / 1000);
        return duration > 0 ? duration : 0;
      }
    }

    return 0;
  };

  // Check if there are any running commands
  const hasRunningCommands = (() => {
    for (const pair of thinkingCommandsPairs) {
      for (const block of pair.commands) {
        const status = getBlockStatus(block);
        if (status === "running") {
          return true;
        }
      }
    }
    return false;
  })();

  // Show component if we have any pairs OR if we're polling (not complete)
  // Show loading even when no events yet (initial polling state)
  const shouldShow = thinkingCommandsPairs.length > 0 || !isComplete;
  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={`w-full max-w-[80%] flex flex-col gap-1 ${
        isComplete ? "opacity-60" : ""
      } transition-opacity`}
    >
      {/* Interleaved Thinking -> Commands sections */}
      {thinkingCommandsPairs.map((pair, pairIdx) => (
        <div key={pairIdx} className="flex flex-col gap-1">
          {/* Thinking Section - bare text */}
          {pair.thinking && (
            <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {pair.thinking}
            </div>
          )}

          {/* Commands Section - bare text with glow effect for executing */}
          {pair.commands.length > 0 && (
            <div className="flex flex-col gap-1">
              {pair.commands.map((block, idx) => {
                const status = getBlockStatus(block);
                const blockId = `${block.generated_code}::${block.start_time || idx}`;
                const duration = getBlockDuration(block, blockId);

                return (
                  <CommandItem
                    key={blockId}
                    block={block}
                    duration={duration}
                    status={status}
                    formatDuration={formatDuration}
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}
      
      {/* Show loading dots when polling but no commands are executing or no events yet */}
      {!isComplete && !hasRunningCommands && (
        <div className="flex items-center gap-1 text-muted-foreground text-xs py-1">
          <span className="inline-flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "0s" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "0.2s" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "0.4s" }} />
          </span>
        </div>
      )}
    </div>
  );
};
