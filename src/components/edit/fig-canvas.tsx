import { Skeleton } from "@/components/ui/skeleton";
import {
  resizeAndZoomCanvas,
} from "@/lib/fabric/fabric-utils";
import { to } from "await-to-js";
import {
  Canvas,
  Circle,
  Rect,
  Path,
  Point,
  FabricObject,
  Group,
  FabricImage,
} from "fabric";
import { AlertCircleIcon } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import { canvasToFigCoords, createBox, createFigFrame, createPoint, createScribble, createFigFromObject } from "./fig-canvas.helper";

interface FigCanvasProps {
  color: string;
  value: Record<string, any>;
  onChange?: (value: Record<string, any>) => void;
  onPointAdded?: (point: Circle) => void;
  onBoxAdded?: (box: Rect) => void;
  onFigSelected?: (fig: Group) => void;
  onScribbleAdded?: (scribble: Path) => void;
  onObjectRemoved?: (object: Circle | Rect | Path) => void;
  maxWidth?: number;
  maxHeight?: number;
}

export const FigCanvas: FC<FigCanvasProps> = ({
  color,
  value: figObject,
  onChange: onFigObjectChange,
  onPointAdded,
  onBoxAdded,
  onFigSelected,
  onScribbleAdded,
  maxWidth = 800,
  maxHeight = 600,
}) => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Interaction state
  const interactionStateRef = useRef({
    isDrawing: false,
    isArmedDraw: false,
    startPoint: null as Point | null,
    pathPoints: [] as Point[],
    tempObject: null as FabricObject | null,
    lastClickTime: 0,
    hasMoved: false,
    singleClickTimeout: null as NodeJS.Timeout | null,
  });

  const handleFigChange = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const fig = canvas.getObjects()[0];
    if (!fig) return;
    const figObject = fig.toObject(["id"]);
    onFigObjectChange?.(figObject);
  };

  // Setup interaction handlers
  const setupInteractions = (canvas: Canvas) => {
    const state = interactionStateRef.current;
    const fig = canvas.getObjects()[0] as Group;
    if (!fig) return;

    // Mouse down handler
    canvas.on("mouse:down", (e: any) => {
      if (!e.pointer) return;
      
      const now = Date.now();
      const timeSinceLastClick = now - state.lastClickTime;
      
      // Clear any pending single click timeout
      if (state.singleClickTimeout) {
        clearTimeout(state.singleClickTimeout);
        state.singleClickTimeout = null;
      }
      
      // Check for double click (within 300ms) - but only if not armed
      if (timeSinceLastClick < 300 && timeSinceLastClick > 0 && !state.isArmedDraw) {
        state.lastClickTime = 0;
        state.startPoint = null;
        state.hasMoved = false;
        state.isArmedDraw = false;
        
        // Double click: create canvas-sized box
        const figFrame = createFigFrame(canvas, color);
        onFigSelected?.(figFrame);
        handleFigChange();
        return;
      }
      
      // Start tracking for potential draw
      state.startPoint = e.pointer;
      state.pathPoints = [e.pointer];
      state.lastClickTime = now;
      state.hasMoved = false;
      state.isDrawing = false;
      
      // Don't reset isArmedDraw here - it might already be armed from previous click
    });

    // Mouse move handler
    canvas.on("mouse:move", (e: any) => {
      if (!e.pointer || !state.startPoint) return;
      
      const dx = e.pointer.x - state.startPoint.x;
      const dy = e.pointer.y - state.startPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If moved more than 5 pixels, it's a drag
      if (distance > 5 && !state.hasMoved) {
        state.hasMoved = true;
        state.isDrawing = true;
        
        // Clear single click timeout since we're now dragging
        if (state.singleClickTimeout) {
          clearTimeout(state.singleClickTimeout);
          state.singleClickTimeout = null;
        }
      }
      
      if (state.isDrawing) {
        state.pathPoints.push(e.pointer);
        
        // Visual feedback: draw temporary path
        if (state.tempObject) {
          fig.remove(state.tempObject);
        }
        
        if (state.isArmedDraw) {
          // Armed draw: show box preview
          const figStart = canvasToFigCoords(state.startPoint, canvas);
          const figEnd = canvasToFigCoords(e.pointer, canvas);
          
          const left = Math.min(figStart.x, figEnd.x);
          const top = Math.min(figStart.y, figEnd.y);
          const width = Math.abs(figEnd.x - figStart.x);
          const height = Math.abs(figEnd.y - figStart.y);
          const zoom = canvas.getZoom();
          state.tempObject = new Rect({
            left,
            top,
            width,
            height,
            fill: "transparent",
            stroke: color,
            strokeWidth: 5 / zoom,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
          });
          fig.add(state.tempObject);
        } else {
          // Direct draw: show scribble preview with smooth brush effect
          const figPoints = state.pathPoints.map(p => canvasToFigCoords(p, canvas));
          let pathString = `M ${figPoints[0].x} ${figPoints[0].y}`;
          
          // Use quadratic curves for smoother lines
          for (let i = 1; i < figPoints.length; i++) {
            const xc = (figPoints[i].x + figPoints[i - 1].x) / 2;
            const yc = (figPoints[i].y + figPoints[i - 1].y) / 2;
            pathString += ` Q ${figPoints[i - 1].x} ${figPoints[i - 1].y} ${xc} ${yc}`;
          }
          
          // Add the last point
          if (figPoints.length > 1) {
            const lastPoint = figPoints[figPoints.length - 1];
            pathString += ` L ${lastPoint.x} ${lastPoint.y}`;
          }
          
          const zoom = canvas.getZoom();
          state.tempObject = new Path(pathString, {
            stroke: color,
            strokeWidth: 10 / zoom,
            fill: "",
            strokeLineCap: "round",
            strokeLineJoin: "round",
            selectable: false,
            evented: false,
          });
          fig.add(state.tempObject);
        }
        
        canvas.requestRenderAll();
      }
    });

    // Mouse up handler
    canvas.on("mouse:up", (e: any) => {
      if (!e.pointer) return;
      
      // Remove temporary object
      if (state.tempObject) {
        fig.remove(state.tempObject);
        state.tempObject = null;
        canvas.requestRenderAll();
      }
      
      if (state.isDrawing && state.hasMoved) {
        // Drawing action completed
        if (state.isArmedDraw && state.startPoint) {
          // Armed draw: create box
          const box = createBox(state.startPoint, e.pointer, canvas, color);
          onBoxAdded?.(box);
          handleFigChange();
          state.isArmedDraw = false; // Disarm after creating box
        } else if (state.pathPoints.length >= 2) {
          // Direct draw: create scribble
          const scribble = createScribble(state.pathPoints, canvas, color);
          onScribbleAdded?.(scribble);
          handleFigChange();
        }
        
        // Reset state
        state.isDrawing = false;
        state.startPoint = null;
        state.pathPoints = [];
        state.hasMoved = false;
      } else if (state.startPoint && !state.hasMoved && !state.isDrawing) {
        // Single click without drag - schedule point creation and arming
        const clickPoint = state.startPoint;
        
        state.singleClickTimeout = setTimeout(() => {
          // Only create point if we didn't start a new interaction
          if (state.startPoint === clickPoint && !state.hasMoved && state.lastClickTime > 0) {
            const point = createPoint(clickPoint, canvas, color);
            onPointAdded?.(point);
            handleFigChange();
            state.isArmedDraw = true;
          }
          state.singleClickTimeout = null;
        }, 310); // Slightly longer than double-click timeout
      }
    });
  };

  useEffect(() => {
    const disposeCanvas = () => {
      const state = interactionStateRef.current;
      
      // Clear any pending timeout
      if (state.singleClickTimeout) {
        clearTimeout(state.singleClickTimeout);
        state.singleClickTimeout = null;
      }
      
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
      
      // Setup interaction handlers
      setupInteractions(fabricCanvas);
      
      fabricCanvas.requestRenderAll();
      setIsLoading(false);
    };

    if (canvasElementRef.current) {
      loadCanvas();
    }

    return disposeCanvas;
  }, [figObject, maxWidth, maxHeight]);

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