"use client";

import { ContextCanvas } from "@/components/chat/context-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Context } from "@/lib/drizzle/drizzle-schema";
import { Container, FileJson, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ContextValue = unknown;

interface ParsedEntry {
  key: string;
  value: ContextValue;
}

interface ContextDialogProps {
  context: Context
}

export const ContextDialog = ({ context }: ContextDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<ParsedEntry[]>([]);

  const contextUrl = `/api/storage/files/${context?.fileId ?? ""}`;

  const handleFetch = async () => {
    if (!contextUrl) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(contextUrl);
      if (!response.ok) {
        throw new Error(`Failed to load context (${response.status})`);
      }
      const json = (await response.json()) as Record<string, ContextValue>;

      const parsed: ParsedEntry[] = Object.entries(json).map(
        ([key, value]) => ({
          key,
          value,
        }),
      );

      setEntries(parsed);
    } catch (err: any) {
      console.error("Failed to fetch context", err);
      setError(err?.message ?? "Failed to load context");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && contextUrl && entries.length === 0 && !loading && !error) {
      void handleFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contextUrl]);

  const hasContext = !!contextUrl;

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => a.key.localeCompare(b.key)),
    [entries],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          disabled={!hasContext}
          className="p-1 size-fit"
          title="View execution context"
        >
          <Container className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b flex flex-row items-center justify-between gap-4">
          <div>
            <DialogTitle className="text-base">Execution context</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Inspect the variables the model is working with. Visual objects
              are rendered on a canvas when possible.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={hasContext ? "outline" : "destructive"}>
              {hasContext ? "Context loaded" : "No context yet"}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              disabled={!hasContext || loading}
              onClick={handleFetch}
            >
              <RefreshCw
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-0">
          {entries.length > 0 ? (
            <div className="px-4 pt-3 pb-2 border-b bg-muted/30">
              <p className="text-xs font-medium mb-2 text-muted-foreground">
                Visual overview
              </p>
              <ContextCanvas entries={sortedEntries} height={320} />
            </div>
          ) : null}

          {error ? (
            <div className="p-4 text-sm text-destructive bg-destructive/5 border-b">
              {error}
            </div>
          ) : null}

          {loading && !entries.length ? (
            <div className="p-6 text-sm text-muted-foreground">
              Loading context…
            </div>
          ) : null}

          {!loading && !error && !entries.length ? (
            <div className="p-6 text-sm text-muted-foreground">
              No context variables available yet for this chat.
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
