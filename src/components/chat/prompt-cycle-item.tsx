"use client";

import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Code,
  Terminal,
  XCircle,
} from "lucide-react";
import { FC, useState } from "react";

interface PromptError {
  message: string;
  type?: string;
}

interface LlmMessage {
  role: string;
  text: string;
}

interface PromptExchange {
  prompt: LlmMessage;
  answers: LlmMessage[];
  error?: PromptError;
  code?: string;
}

interface ExecutionError {
  message: string;
  type?: string;
}

interface ContextualizedFeedback {
  text: string;
  paths?: string[];
}

interface ContextualizedMessage {
  text: string;
  paths?: string[];
}

interface ExecutionBlock {
  generated_code: string;
  processed_code: string;
  is_executed: boolean;
  feedback?: ContextualizedFeedback;
  response?: ContextualizedMessage;
  error?: ExecutionError;
  logs?: string[];
}

export interface PromptCycle {
  exchanges: PromptExchange[];
  blocks: ExecutionBlock[];
}

interface PromptCycleItemProps {
  cycle: PromptCycle;
  cycleIndex: number;
}

export const PromptCycleItem: FC<PromptCycleItemProps> = ({
  cycle,
  cycleIndex,
}) => {
  const [expandedExchanges, setExpandedExchanges] = useState<Set<string>>(
    new Set(),
  );
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

  const toggleExchange = (exchangeIdx: number) => {
    const key = `${cycleIndex}-${exchangeIdx}`;
    setExpandedExchanges((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleBlock = (blockIdx: number) => {
    const key = `${cycleIndex}-${blockIdx}`;
    setExpandedBlocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div className="mb-6 last:mb-0">
      {cycle.exchanges.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Code className="h-4 w-4" />
            LLM Exchanges
          </h4>
          {cycle.exchanges.map((exchange, exchangeIdx) => {
            const key = `${cycleIndex}-${exchangeIdx}`;
            const isExpanded = expandedExchanges.has(key);

            return (
              <div
                key={exchangeIdx}
                className="mb-3 border rounded-lg p-3 bg-background"
              >
                <button
                  onClick={() => toggleExchange(exchangeIdx)}
                  className="w-full flex items-start justify-between text-left"
                >
                  <div className="flex items-start gap-2 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 mt-1 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        Exchange {exchangeIdx + 1}
                      </div>
                      {exchange.error && (
                        <div className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <XCircle className="h-3 w-3" />
                          {exchange.error.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {exchange.answers.length} answer(s)
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Prompt:
                      </div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">
                        {exchange.prompt.text}
                      </pre>
                    </div>

                    {exchange.answers.map((answer, answerIdx) => (
                      <div key={answerIdx}>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Answer {answerIdx + 1}:
                        </div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">
                          {answer.text}
                        </pre>
                      </div>
                    ))}

                    {exchange.code && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Generated Code:
                        </div>
                        <pre className="text-xs bg-slate-900 text-slate-100 p-2 rounded overflow-x-auto">
                          {exchange.code}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cycle.blocks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Execution Blocks
          </h4>
          {cycle.blocks.map((block, blockIdx) => {
            const key = `${cycleIndex}-${blockIdx}`;
            const isExpanded = expandedBlocks.has(key);

            return (
              <div
                key={blockIdx}
                className="mb-3 border rounded-lg p-3 bg-background"
              >
                <button
                  onClick={() => toggleBlock(blockIdx)}
                  className="w-full flex items-start justify-between text-left"
                >
                  <div className="flex items-start gap-2 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 mt-1 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        Execution {blockIdx + 1}
                      </div>
                      {block.error && (
                        <div className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <XCircle className="h-3 w-3" />
                          {block.error.message}
                        </div>
                      )}
                      {!block.error && block.is_executed && (
                        <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <CheckCircle className="h-3 w-3" />
                          Executed successfully
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Generated Code:
                      </div>
                      <pre className="text-xs bg-slate-900 text-slate-100 p-2 rounded overflow-x-auto">
                        {block.generated_code}
                      </pre>
                    </div>

                    {block.processed_code !== block.generated_code && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Processed Code:
                        </div>
                        <pre className="text-xs bg-slate-900 text-slate-100 p-2 rounded overflow-x-auto">
                          {block.processed_code}
                        </pre>
                      </div>
                    )}

                    {block.logs && block.logs.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Logs:
                        </div>
                        <div className="text-xs bg-muted p-2 rounded space-y-1">
                          {block.logs.map((log, logIdx) => (
                            <div key={logIdx}>{log}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.feedback && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Feedback:
                        </div>
                        <div className="text-xs bg-muted p-2 rounded">
                          {block.feedback.text}
                        </div>
                      </div>
                    )}

                    {block.response && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Response:
                        </div>
                        <div className="text-xs bg-muted p-2 rounded">
                          {block.response.text}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

