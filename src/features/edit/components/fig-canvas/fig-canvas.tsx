import { Skeleton } from "@/components/ui/skeleton";
import { calculateZoomToFit } from "@/lib/fabric/fabric-utils";
import { to } from "await-to-js";
import { Canvas, FabricImage, Group, Rect, Circle } from "fabric";
import { AlertCircleIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAnnotationStore } from "@/features/chat/stores/annotation-store";

export type InteractionMode = "none" | "box" | "point" | "image";

interface FigCanvasProps {
  figObject: Record<string, any>;
  maxHeight?: number;
  maxWidth?: number;
  interactionMode?: InteractionMode;
  attachmentId?: string;
  activeTagId?: string | null;
  activeTagColor?: string | null;
  onAnnotationComplete?: () => void;
}

export const FigCanvas = ({
  figObject,
  maxHeight,
  maxWidth,
  interactionMode = "none",
  attachmentId,
  activeTagId = null,
  activeTagColor = null,
  onAnnotationComplete,
}: FigCanvasProps) => {
  const fabricCanvasRef = useRef<Canvas>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { addAnnotation, getAnnotationsByAttachment, annotations } = useAnnotationStore();

  const resizeAndZoom = useCallback((canvas: Canvas) => {
    const objects = canvas.getObjects();
    
    if (!objects || objects.length === 0) {
      return;
    }
    
    const fig = objects[0] as Group;
    const figObjects = fig.getObjects();
    
    if (!figObjects || figObjects.length === 0) {
      return;
    }
    
    const image = figObjects[0] as FabricImage;
    const imageWidth = image.getScaledWidth();
    const imageHeight = image.getScaledHeight();

    let zoom = 1;
    
    if (maxHeight || maxWidth) {
      // Calculate zoom based on max constraints
      const containerWidth = maxWidth || imageWidth;
      const containerHeight = maxHeight || imageHeight;
      zoom = calculateZoomToFit(imageWidth, imageHeight, containerWidth, containerHeight);
    } else if (containerRef.current) {
      // Use container dimensions if no max constraints
      zoom = calculateZoomToFit(
        imageWidth,
        imageHeight,
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
      );
    }
    
    canvas.setDimensions({
      width: imageWidth * zoom,
      height: imageHeight * zoom,
    });
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [maxHeight, maxWidth]);

  // Handle mouse events for interactive drawing using native DOM events
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || interactionMode === "none" || isLoading) {
      return;
    }

    const canvasElement = canvas.getElement();
    let currentDrawingObject: Rect | Circle | null = null;
    let currentStartPoint: { x: number; y: number } | null = null;
    let currentIsDrawing = false;

    const getCanvasPointer = (e: MouseEvent): { x: number; y: number } => {
      const rect = canvasElement.getBoundingClientRect();
      const zoom = canvas.getZoom();
      return {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      
      if (!activeTagId || !activeTagColor || !attachmentId) return;
      
      const pointer = getCanvasPointer(e);
      currentIsDrawing = true;
      currentStartPoint = { x: pointer.x, y: pointer.y };

      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      if (interactionMode === "box") {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: hexToRgba(activeTagColor, 0.2),
          stroke: activeTagColor,
          strokeWidth: 2 / canvas.getZoom(),
          selectable: false,
          evented: false,
          objectCaching: false,
          data: { annotationId: activeTagId },
        });
        canvas.add(rect);
        canvas.renderAll();
        currentDrawingObject = rect;
      } else if (interactionMode === "point") {
        const circle = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 5 / canvas.getZoom(),
          fill: activeTagColor,
          stroke: "#ffffff",
          strokeWidth: 2 / canvas.getZoom(),
          selectable: false,
          evented: false,
          originX: "center",
          originY: "center",
          objectCaching: false,
          data: { annotationId: activeTagId },
        });
        canvas.add(circle);
        canvas.renderAll();
        currentIsDrawing = false;

        // Save point annotation
        addAnnotation({
          id: activeTagId,
          type: "point",
          color: activeTagColor,
          data: {
            x: pointer.x,
            y: pointer.y,
          },
          attachmentId,
        });

        // Notify completion
        if (onAnnotationComplete) {
          onAnnotationComplete();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!currentIsDrawing || !currentStartPoint || interactionMode !== "box" || !currentDrawingObject) return;

      const pointer = getCanvasPointer(e);
      const width = pointer.x - currentStartPoint.x;
      const height = pointer.y - currentStartPoint.y;

      currentDrawingObject.set({
        width: Math.abs(width),
        height: Math.abs(height),
        left: width < 0 ? pointer.x : currentStartPoint.x,
        top: height < 0 ? pointer.y : currentStartPoint.y,
      });
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (currentIsDrawing && interactionMode === "box" && currentDrawingObject && currentStartPoint && activeTagId && activeTagColor && attachmentId) {
        const rect = currentDrawingObject as Rect;
        // Save box annotation
        addAnnotation({
          id: activeTagId,
          type: "box",
          color: activeTagColor,
          data: {
            x: rect.left || 0,
            y: rect.top || 0,
            width: rect.width || 0,
            height: rect.height || 0,
          },
          attachmentId,
        });
        currentIsDrawing = false;
        currentStartPoint = null;
        currentDrawingObject = null;

        // Notify completion
        if (onAnnotationComplete) {
          onAnnotationComplete();
        }
      }
    };

    // Set cursor style based on interaction mode
    if (interactionMode === "box") {
      canvasElement.style.cursor = "crosshair";
    } else if (interactionMode === "point") {
      canvasElement.style.cursor = "pointer";
    } else if (interactionMode === "image") {
      canvasElement.style.cursor = "cell";
    }

    canvasElement.addEventListener('mousedown', handleMouseDown);
    canvasElement.addEventListener('mousemove', handleMouseMove);
    canvasElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvasElement.removeEventListener('mousedown', handleMouseDown);
      canvasElement.removeEventListener('mousemove', handleMouseMove);
      canvasElement.removeEventListener('mouseup', handleMouseUp);
      canvasElement.style.cursor = "default";
    };
  }, [interactionMode, isLoading, activeTagId, activeTagColor, attachmentId, addAnnotation]);

  // Render annotations on canvas when they change
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !attachmentId || isLoading) return;

    const currentAnnotations = getAnnotationsByAttachment(attachmentId);
    
    // Remove all annotation objects
    canvas.getObjects().forEach((obj) => {
      const data = (obj as any).data;
      if (data && data.annotationId) {
        canvas.remove(obj);
      }
    });

    // Render all annotations
    currentAnnotations.forEach((annotation) => {
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      if (annotation.type === "box") {
        const rect = new Rect({
          left: annotation.data.x,
          top: annotation.data.y,
          width: annotation.data.width || 0,
          height: annotation.data.height || 0,
          fill: hexToRgba(annotation.color, 0.2),
          stroke: annotation.color,
          strokeWidth: 2 / canvas.getZoom(),
          selectable: false,
          evented: false,
          objectCaching: false,
          data: { annotationId: annotation.id },
        });
        canvas.add(rect);
      } else if (annotation.type === "point") {
        const circle = new Circle({
          left: annotation.data.x,
          top: annotation.data.y,
          radius: 5 / canvas.getZoom(),
          fill: annotation.color,
          stroke: "#ffffff",
          strokeWidth: 2 / canvas.getZoom(),
          selectable: false,
          evented: false,
          originX: "center",
          originY: "center",
          objectCaching: false,
          data: { annotationId: annotation.id },
        });
        canvas.add(circle);
      }
    });

    canvas.renderAll();
  }, [annotations, attachmentId, isLoading, getAnnotationsByAttachment]);

  useEffect(() => {
    let isCancelled = false;

    const disposeCanvas = () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };

    const loadCanvas = async () => {
      if (!canvasElementRef.current) return;

      disposeCanvas();
      setIsLoading(true);
      setIsError(false);

      const [error, fig] = await to(Group.fromObject(figObject));
      
      if (isCancelled) return;
      
      if (error) {
        setIsError(true);
        setIsLoading(false);
        return;
      }
      
      // Make fig non-selectable but keep evented so canvas events fire
      fig.selectable = false;
      fig.hasControls = false;
      fig.hasBorders = false;
      fig.lockMovementX = true;
      fig.lockMovementY = true;
      fig.hoverCursor = 'default';
      
      fig.getObjects().forEach((obj) => {
        obj.selectable = false;
        obj.hasControls = false;
        obj.hasBorders = false;
        obj.lockMovementX = true;
        obj.lockMovementY = true;
        obj.hoverCursor = 'default';
      });

      const fabricCanvas = new Canvas(canvasElementRef.current, {
        selection: false,
        hoverCursor: 'default',
        moveCursor: 'default',
        enablePointerEvents: true,
        skipTargetFind: false,
      });
      fabricCanvasRef.current = fabricCanvas;
      fabricCanvas.add(fig);

      resizeAndZoom(fabricCanvas);
      
      setIsLoading(false);
    };

    if (canvasElementRef.current) {
      loadCanvas();
    }

    return () => {
      isCancelled = true;
      disposeCanvas();
    };
  }, [figObject, resizeAndZoom]);

  useEffect(() => {
    const handleResize = () => {
      if (fabricCanvasRef.current && containerRef.current && !maxHeight && !maxWidth) {
        resizeAndZoom(fabricCanvasRef.current);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [maxHeight, maxWidth, resizeAndZoom]);

  // Re-calculate canvas size when maxHeight or maxWidth changes
  useEffect(() => {
    if (fabricCanvasRef.current && !isLoading) {
      resizeAndZoom(fabricCanvasRef.current);
    }
  }, [maxHeight, maxWidth, isLoading, resizeAndZoom]);

  return (
    <div
      ref={containerRef}
      className={maxHeight || maxWidth ? "flex items-center justify-center" : "w-full h-full flex items-center justify-center"}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <Skeleton className="w-20 h-20" />
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <AlertCircleIcon className="w-10 h-10 text-red-500" />
        </div>
      )}
      <canvas 
        ref={canvasElementRef}
        style={{
          display: isLoading || isError ? "none" : "block",
          touchAction: "none",
          userSelect: "none",
        }}
      />
    </div>
  );
};
