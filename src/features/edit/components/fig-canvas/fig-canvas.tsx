import { Skeleton } from "@/components/ui/skeleton";
import {
  createFigFromObject,
  resizeAndZoomCanvas,
} from "@/lib/fabric/fabric-utils";
import { to } from "await-to-js";
import {
  Canvas,
  Group,
  TPointerEvent,
  TPointerEventInfo,
} from "fabric";
import { AlertCircleIcon } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";

interface FigCanvasProps {
  value: Record<string, any>;
  onChange?: (value: Record<string, any>) => void;
  onMouseDown?: (
    canvas: Canvas,
    event: TPointerEventInfo<TPointerEvent>,
  ) => void;
  onMouseUp?: (
    canvas: Canvas,
    event1: TPointerEventInfo<TPointerEvent>,
    event2: TPointerEventInfo<TPointerEvent>,
  ) => void;
  onMouseMove?: (
    canvas: Canvas,
    event: TPointerEventInfo<TPointerEvent>,
  ) => void;
  maxWidth?: number;
  maxHeight?: number;
}

export const FigCanvas: FC<FigCanvasProps> = ({
  value: figObject,
  onChange: onFigObjectChange,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  maxWidth = 800,
  maxHeight = 600,
}) => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const mouseDownEventRef = useRef<TPointerEventInfo<TPointerEvent> | null>(
    null,
  );
  const mouseUpEventRef = useRef<TPointerEventInfo<TPointerEvent> | null>(null);

  useEffect(() => {
    const disposeCanvas = () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };

    const loadCanvas = async () => {
      if (!canvasElementRef.current) return;
      setIsLoading(true);

      const [error, fig] = await to(createFigFromObject(figObject));
      if (error) {
        console.error("Error creating fig:", error);
        setIsError(true);
        setIsLoading(false);
        return;
      }

      disposeCanvas();
      const fabricCanvas = new Canvas(canvasElementRef.current);
      fabricCanvas.selection = true;
      fabricCanvasRef.current = fabricCanvas;
      fabricCanvas.add(fig);
      resizeAndZoomCanvas(fabricCanvas, maxWidth, maxHeight);
      fabricCanvas.renderAll();
      setIsLoading(false);
    };

    if (canvasElementRef.current) {
      loadCanvas();
    }

    return disposeCanvas;
  }, [figObject, maxWidth, maxHeight]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    resizeAndZoomCanvas(fabricCanvasRef.current, maxWidth, maxHeight);
  }, [maxWidth, maxHeight]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (event: TPointerEventInfo<TPointerEvent>) => {
      mouseDownEventRef.current = event;
      onMouseDown?.(canvas, event);
    };

    const handleMouseUp = (event: TPointerEventInfo<TPointerEvent>) => {
      mouseUpEventRef.current = event;
      onMouseUp?.(canvas, event, mouseDownEventRef.current ?? event);
      const fig = canvas.getObjects()[0] as Group;
      onFigObjectChange?.(fig.toObject());
    };

    const handleMouseMove = (event: TPointerEventInfo<TPointerEvent>) => {
      onMouseMove?.(canvas, event);
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("mouse:move", handleMouseMove);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("mouse:move", handleMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFigObjectChange]);

  return (
    <div className="w-full h-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <AlertCircleIcon className="w-10 h-10 text-red-500" />
        </div>
      )}
      <div
        className="bg-white shadow-sm"
        style={{
          display: isLoading ? "none" : "block",
        }}
      >
        <canvas ref={canvasElementRef} />
      </div>
    </div>
  );
};
