"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  Ban,
  CheckCircle,
  CircleCheck,
  CircleDot,
  Copy,
  Play,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { FC, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

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
  answer: LlmMessage;
  error?: PromptError;
  code?: string;
}

interface ExecutionError {
  message: string;
  type?: string;
}

interface Feedback {
  text: string;
  attachments?: string[];
}

interface Message {
  text: string;
  attachments?: string[];
}

interface ExecutionBlock {
  generated_code: string;
  processed_code: string;
  executed: boolean;
  feedback?: Feedback;
  response?: Message;
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
  const [isOpen, setIsOpen] = useState(false);
  const [expandedExchanges, setExpandedExchanges] = useState<Set<string>>(
    new Set(),
  );
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

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

  const hasErrors =
    cycle.exchanges.some((ex) => ex.error) ||
    cycle.blocks.some((block) => block.error);

  const hasFeedback = cycle.blocks.some((block) => block.feedback);
  const hasResponse = cycle.blocks.some((block) => block.response);

  return (
    <div className="border rounded-lg bg-background">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-shrink-0"
          >
            <RefreshCcw className="size-4" />
          </motion.div>
          <span className="font-medium text-sm">
            Prompt Cycle {cycleIndex + 1}
          </span>
        </div>
        {hasErrors && <XCircle className="h-4 w-4 text-destructive" />}
        {hasFeedback && <CircleDot className="h-4 w-4 text-yellow-600" />}
        {hasResponse && <CircleCheck className="h-4 w-4 text-green-600" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t bg-muted/30 overflow-hidden"
          >
            <div className="p-3 pb-0">
              {cycle.exchanges.length > 0 && (
                <div>
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
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="mt-1 flex-shrink-0"
                            >
                              <ArrowLeftRight className="size-4" />
                            </motion.div>
                            <div className="flex-1 flex flex-row justify-between items-center">
                              <div className="text-sm font-medium">
                                LLM Exchange {exchangeIdx + 1}
                              </div>
                              {exchange.error ? (
                                <div className="text-xs text-destructive flex items-center gap-1 mt-1">
                                  <XCircle className="size-4 text-destructive" />
                                </div>
                              ) : exchange.code ? (
                                <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                  <CheckCircle className="size-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <CircleDot className="size-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 space-y-3">
                                <div className="relative rounded-lg border bg-white overflow-hidden">
                                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                                    <span className="text-xs text-gray-500 font-medium">
                                      Prompt
                                    </span>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(
                                          exchange.prompt.text,
                                          "Prompt",
                                        )
                                      }
                                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                  <div className="p-3 text-xs whitespace-pre-wrap leading-relaxed">
                                    {exchange.prompt.text}
                                  </div>
                                </div>

                                {exchange.answer && (
                                  <div className="relative rounded-lg border bg-white overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                                      <span className="text-xs text-gray-500 font-medium">
                                        Answer
                                      </span>
                                      <button
                                        onClick={() =>
                                          copyToClipboard(
                                            exchange.answer.text,
                                            "Answer",
                                          )
                                        }
                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    <div className="p-3 text-xs whitespace-pre-wrap leading-relaxed">
                                      {exchange.answer.text}
                                    </div>
                                  </div>
                                )}

                                {exchange.error && (
                                  <div className="relative rounded-lg border border-destructive/50 bg-destructive/5 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-destructive/20 bg-destructive/10">
                                      <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-destructive" />
                                        <span className="text-xs text-destructive font-medium">
                                          Error
                                          {exchange.error.type && (
                                            <span className="ml-2 text-xs text-destructive/70 font-normal">
                                              ({exchange.error.type})
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          if (exchange.error) {
                                            copyToClipboard(
                                              exchange.error.message,
                                              "Error message",
                                            );
                                          }
                                        }}
                                        className="flex items-center gap-1.5 text-xs text-destructive/70 hover:text-destructive transition-colors"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    <div className="p-3 text-xs whitespace-pre-wrap leading-relaxed text-destructive">
                                      {exchange.error?.message}
                                    </div>
                                  </div>
                                )}

                                {exchange.code && (
                                  <div className="relative rounded-lg border bg-white overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                                      <span className="text-xs text-gray-500 font-medium">
                                        code
                                      </span>
                                      <button
                                        onClick={() =>
                                          copyToClipboard(
                                            exchange.code!,
                                            "Generated code",
                                          )
                                        }
                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    <SyntaxHighlighter
                                      language="python"
                                      style={oneLight}
                                      customStyle={{
                                        margin: 0,
                                        padding: "1rem",
                                        fontSize: "0.75rem",
                                        lineHeight: "1.5",
                                        background: "transparent",
                                      }}
                                      wrapLines
                                      wrapLongLines
                                    >
                                      {exchange.code}
                                    </SyntaxHighlighter>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}

              {cycle.blocks.length > 0 && (
                <div>
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
                          className="w-full flex flex-row items-start justify-between text-left"
                        >
                          <div className="flex items-start gap-2 flex-1">
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="mt-1 flex-shrink-0"
                            >
                              <Play className="size-4" />
                            </motion.div>
                            <div className="flex-1 flex flex-row justify-between items-center">
                              <div className="text-sm font-medium">
                                Execution Block {blockIdx + 1}
                              </div>
                              {!block.executed && (
                                <Ban className="size-4 text-muted-foreground" />
                              )}
                              {block.executed &&
                                !block.feedback &&
                                !block.error && (
                                  <CircleCheck className="size-4 text-green-600" />
                                )}
                              {block.feedback && (
                                <CircleDot className="size-4 text-yellow-600" />
                              )}
                              {block.error && (
                                <XCircle className="size-4 text-destructive" />
                              )}
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 space-y-4">
                                <div className="relative rounded-lg border bg-white overflow-hidden">
                                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                                    <span className="text-xs text-gray-500 font-medium">
                                      generated_code
                                    </span>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(
                                          block.generated_code,
                                          "Generated code",
                                        )
                                      }
                                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                  <SyntaxHighlighter
                                    language="python"
                                    style={oneLight}
                                    customStyle={{
                                      margin: 0,
                                      padding: "1rem",
                                      fontSize: "0.75rem",
                                      lineHeight: "1.5",
                                      background: "transparent",
                                    }}
                                    wrapLines
                                    wrapLongLines
                                  >
                                    {block.generated_code}
                                  </SyntaxHighlighter>
                                </div>

                                {block.processed_code !==
                                  block.generated_code && (
                                  <div className="relative rounded-lg border bg-white overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                                      <span className="text-xs text-gray-500 font-medium">
                                        processed_code
                                      </span>
                                      <button
                                        onClick={() =>
                                          copyToClipboard(
                                            block.processed_code,
                                            "Processed code",
                                          )
                                        }
                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    <SyntaxHighlighter
                                      language="python"
                                      style={oneLight}
                                      customStyle={{
                                        margin: 0,
                                        padding: "1rem",
                                        fontSize: "0.75rem",
                                        lineHeight: "1.5",
                                        background: "transparent",
                                      }}
                                      wrapLines
                                      wrapLongLines
                                    >
                                      {block.processed_code}
                                    </SyntaxHighlighter>
                                  </div>
                                )}

                                {block.logs && block.logs.length > 0 && (
                                  <div className="bg-muted/50 p-3 rounded-lg border text-xs font-mono space-y-1 max-h-48 overflow-y-auto text-foreground">
                                    {block.logs.map((log, logIdx) => (
                                      <div key={logIdx}>{log}</div>
                                    ))}
                                  </div>
                                )}

                                {block.feedback && (
                                  <div className="relative rounded-lg border bg-white overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                                      <span className="text-xs text-gray-500 font-medium">
                                        feedback
                                      </span>
                                      <button
                                        onClick={() =>
                                          copyToClipboard(
                                            JSON.stringify(
                                              block.feedback,
                                              null,
                                              2,
                                            ),
                                            "Feedback JSON",
                                          )
                                        }
                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    <SyntaxHighlighter
                                      language="json"
                                      style={oneLight}
                                      customStyle={{
                                        margin: 0,
                                        padding: "1rem",
                                        fontSize: "0.75rem",
                                        lineHeight: "1.5",
                                        background: "transparent",
                                      }}
                                      wrapLines
                                      wrapLongLines
                                    >
                                      {JSON.stringify(block.feedback, null, 2)}
                                    </SyntaxHighlighter>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
