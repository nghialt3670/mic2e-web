"use client";

import { FC, useEffect, useRef } from "react";
import { Canvas, Circle, FabricImage, Group, Path, Rect, Text as FabricText } from "fabric";

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

const getFabricType = (value: any): string | null => {
  if (!value || typeof value !== "object") return null;
  const t = (value as any).type;
  return typeof t === "string" ? t.toLowerCase() : null;
};

const isFabricLike = (value: any): boolean => {
  const t = getFabricType(value);
  return !!t && ["image", "group", "rect", "circle", "ellipse", "path"].includes(t);
};

export const ContextCanvas: FC<ContextCanvasProps> = ({
  entries,
  height = 360,
}) => {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    const element = canvasElementRef.current;
    if (!element) return;

    if (!fabricCanvasRef.current) {
      fabricCanvasRef.current = new Canvas(element, {
        selection: false,
      });
    }
    const canvas = fabricCanvasRef.current;

    const container = element.parentElement;
    const width = container?.clientWidth ?? 800;
    canvas.setDimensions({ width, height });
    canvas.clear();

    const toFabricObject = async (value: any): Promise<any | null> => {
      const t = getFabricType(value);
      if (!t) return null;

      if (t === "group") {
        return await Group.fromObject(value as any);
      }

      if (t === "image") {
        return await FabricImage.fromObject(value as any);
      }

      if (t === "rect") {
        return await Rect.fromObject(value as any);
      }

      if (t === "circle") {
        return await Circle.fromObject(value as any);
      }

      if (t === "path") {
        return await Path.fromObject(value as any);
      }

      // Fallback: wrap any single object into a group so we can position it
      const wrapper = {
        type: "group",
        version: (value as any).version,
        left: 0,
        top: 0,
        objects: [value],
      };
      return await Group.fromObject(wrapper as any);
    };

    const render = async () => {
      let x = 20;
      let y = 20;
      const marginX = 40;
      const marginY = 40;
      let rowMaxHeight = 0;

      for (const { key, value } of entries) {
        if (isFabricLike(value)) {
          const obj = await toFabricObject(value as any);
          if (!obj) continue;

          const bounds = obj.getBoundingRect(true);
          const slotWidth = (canvas.getWidth() ?? 800) / 3 - marginX;
          const maxWidth = Math.max(1, slotWidth);
          const scale = Math.min(1, maxWidth / Math.max(1, bounds.width));

          obj.scale(scale);
          obj.set({
            left: x,
            top: y + 18,
          });

          const label = new FabricText(String(key), {
            left: x,
            top: y,
            fontSize: 12,
            fill: "#020617",
            fontFamily: "monospace",
          });

          canvas.add(label);
          canvas.add(obj);

          rowMaxHeight = Math.max(
            rowMaxHeight,
            (bounds.height || 0) * scale + 24,
          );
        } else if (isPrimitive(value)) {
          const label = new FabricText(
            `${String(key)}: ${String(value)}`.slice(0, 60),
            {
              left: x,
              top: y,
              fontSize: 12,
              fill: "#020617",
              fontFamily: "monospace",
            },
          );
          canvas.add(label);
          rowMaxHeight = Math.max(rowMaxHeight, 20);
        }

        x += (canvas.getWidth() ?? width) / 3 + marginX;
        if (x + (canvas.getWidth() ?? width) / 3 > (canvas.getWidth() ?? width)) {
          x = 20;
          y += rowMaxHeight + marginY;
          rowMaxHeight = 0;
        }
      }

      canvas.renderAll();
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
