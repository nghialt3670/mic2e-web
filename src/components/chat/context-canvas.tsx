"use client";

import { FC, useEffect, useRef } from "react";

interface ContextCanvasEntry {
  key: string;
  value: unknown;
}

interface ContextCanvasProps {
  entries: ContextCanvasEntry[];
  height?: number;
}

const isPrimitive = (value: any): boolean =>
  value === null || ["string", "number", "boolean"].includes(typeof value);

const getImageSrc = (value: any): string | null => {
  if (!value || typeof value !== "object") return null;
  const v: any = value;

  if (typeof v.type === "string" && v.type.toLowerCase() === "image" && v.src) {
    return String(v.src);
  }

  if (typeof v.type === "string" && v.type.toLowerCase() === "group" && Array.isArray(v.objects)) {
    const img = v.objects.find(
      (o: any) => typeof o?.type === "string" && o.type.toLowerCase() === "image" && o.src,
    );
    return img ? String(img.src) : null;
  }

  return null;
};

export const ContextCanvas: FC<ContextCanvasProps> = ({
  entries,
  height = 360,
}) => {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const element = canvasElementRef.current;
    if (!element) return;

    const ctx = element.getContext("2d");
    if (!ctx) return;

    const container = element.parentElement;
    const width = container?.clientWidth ?? 800;
    element.width = width;
    element.height = height;

    ctx.clearRect(0, 0, width, height);

    const render = async () => {
      let x = 20;
      let y = 20;
      const marginX = 40;
      const marginY = 40;
      const slotWidth = width / 3 - marginX;
      const slotHeight = 100;

      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      for (const { key, value } of entries) {
        const label = String(key);
        ctx.fillStyle = "#e5e7eb";
        ctx.fillText(label, x, y);

        const src = getImageSrc(value);
        if (src) {
          await new Promise<void>((resolve) => {
            const img = new window.Image();
            img.onload = () => {
              const scale = Math.min(
                slotWidth / img.width,
                (slotHeight / img.height) || 1,
              );
              const drawWidth = img.width * scale;
              const drawHeight = img.height * scale;
              ctx.drawImage(img, x, y + 16, drawWidth, drawHeight);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = src;
          });
        } else if (isPrimitive(value)) {
          ctx.fillStyle = "#9ca3af";
          const text = String(value);
          ctx.fillText(text.slice(0, 40), x, y + 16);
        } else {
          ctx.fillStyle = "#4b5563";
          ctx.fillText("[object]", x, y + 16);
        }

        y += slotHeight + marginY;
        if (y + slotHeight > height) {
          y = 20;
          x += slotWidth + marginX;
        }
      }
    };

    void render();
  }, [entries, height]);

  if (!entries.length) {
    return null;
  }

  return (
    <div className="w-full rounded-md border bg-muted/40 overflow-hidden">
      <canvas ref={canvasElementRef} className="w-full block" />
    </div>
  );
};

