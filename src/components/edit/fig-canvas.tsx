import { Skeleton } from "@/components/ui/skeleton";
import { resizeAndZoomCanvas } from "@/lib/fabric/fabric-utils";
import { to } from "await-to-js";
import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  Group,
  Path,
  Point,
  Rect,
} from "fabric";
import { AlertCircle } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";

import {
  canvasToFigCoords,
  createBox,
  createFigFrame,
  createFigFromObject,
  createPoint,
  createScribble,
  hasFigFrame,
  removeFigFrame,
} from "./fig-canvas.helper";

interface FigCanvasProps {
  color: string;
  value: Record<string, any>;
  onChange?: (value: Record<string, any>) => void;
  onPointAdded?: (point: Circle) => void;
  onBoxAdded?: (box: Rect) => void;
  onFigSelected?: (fig: Group) => void;
  onFigUnselected?: (fig: Group) => void;
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
  onFigUnselected,
  onScribbleAdded,
  maxWidth = 800,
  maxHeight = 600,
}) => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // State tracking with clear separation of concerns
  const stateRef = useRef({
    isArmedDraw: false,
    mouseDownPoint: null as Point | null,
    mouseDownTime: 0,
    isDragging: false,
    dragStarted: false,
    pathPoints: [] as Point[],
    tempObject: null as FabricObject | null,
    clickTimer: null as NodeJS.Timeout | null,
    lastClickTime: 0,
  });

  const handleFigChange = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const fig = canvas.getObjects()[0];
    if (!fig) return;
    const figObject = fig.toObject(["id"]);
    onFigObjectChange?.(figObject);
  };

  const setupInteractions = (canvas: Canvas) => {
    const state = stateRef.current;
    const fig = canvas.getObjects()[0] as Group;
    if (!fig) return;

    const DOUBLE_CLICK_THRESHOLD = 300; // ms
    const DRAG_THRESHOLD = 5; // pixels
    
    const handleDoubleClick = () => {
      // Double click: toggle frame
      if (hasFigFrame(canvas)) {
        const fig = removeFigFrame(canvas);
        onFigUnselected?.(fig);
      } else {
        const figFrame = createFigFrame(canvas, color);
        onFigSelected?.(figFrame);
      }
      handleFigChange();
      state.isArmedDraw = false;
    };
    
    const handleSingleClick = (point: Point) => {
      // Single click: create point and arm for box drawing
      const createdPoint = createPoint(point, canvas, color);
      onPointAdded?.(createdPoint);
      handleFigChange();
      state.isArmedDraw = true;
    };

    canvas.on("mouse:down", (e: any) => {
      if (!e.pointer) return;

      const now = Date.now();
      state.mouseDownPoint = e.pointer;
      state.mouseDownTime = now;
      state.isDragging = false;
      state.dragStarted = false;
      state.pathPoints = [e.pointer];

      // Cancel any pending single click timer
      if (state.clickTimer) {
        clearTimeout(state.clickTimer);
        state.clickTimer = null;
      }
    });

    canvas.on("mouse:move", (e: any) => {
      if (!e.pointer || !state.mouseDownPoint) return;

      // Calculate distance moved
      const dx = e.pointer.x - state.mouseDownPoint.x;
      const dy = e.pointer.y - state.mouseDownPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Detect drag start
      if (distance > DRAG_THRESHOLD && !state.dragStarted) {
        state.dragStarted = true;
        state.isDragging = true;
      }

      if (state.isDragging) {
        state.pathPoints.push(e.pointer);

        // Remove old preview
        if (state.tempObject) {
          fig.remove(state.tempObject);
        }

        if (state.isArmedDraw) {
          // Armed draw: show box preview
          const figStart = canvasToFigCoords(state.mouseDownPoint, canvas);
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
          // Not armed: show scribble preview
          const figPoints = state.pathPoints.map((p) =>
            canvasToFigCoords(p, canvas),
          );
          let pathString = `M ${figPoints[0].x} ${figPoints[0].y}`;

          for (let i = 1; i < figPoints.length; i++) {
            const xc = (figPoints[i].x + figPoints[i - 1].x) / 2;
            const yc = (figPoints[i].y + figPoints[i - 1].y) / 2;
            pathString += ` Q ${figPoints[i - 1].x} ${figPoints[i - 1].y} ${xc} ${yc}`;
          }

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

    canvas.on("mouse:up", (e: any) => {
      if (!e.pointer || !state.mouseDownPoint) return;

      const now = Date.now();
      const timeSinceLastClick = now - state.lastClickTime;

      // Remove preview
      if (state.tempObject) {
        fig.remove(state.tempObject);
        state.tempObject = null;
        canvas.requestRenderAll();
      }

      if (state.dragStarted) {
        // CASE 1 & 4: Drag completed (regular draw or armed draw)
        if (state.isArmedDraw) {
          // Armed draw: create box
          const box = createBox(state.mouseDownPoint, e.pointer, canvas, color);
          onBoxAdded?.(box);
          handleFigChange();
          state.isArmedDraw = false;
        } else {
          // Regular draw: create scribble
          const scribble = createScribble(state.pathPoints, canvas, color);
          onScribbleAdded?.(scribble);
          handleFigChange();
        }
        
        // Reset drag state
        state.dragStarted = false;
        state.isDragging = false;
        state.mouseDownPoint = null;
        state.pathPoints = [];
      } else {
        // CASE 2 & 3: Click without drag (single or double click)
        const clickPoint = state.mouseDownPoint;
        
        // Check if this is a double click
        if (timeSinceLastClick < DOUBLE_CLICK_THRESHOLD) {
          // Double click detected
          handleDoubleClick();
          state.lastClickTime = 0; // Reset to prevent triple-click issues
        } else {
          // Potential single click - wait to confirm it's not a double click
          state.clickTimer = setTimeout(() => {
            handleSingleClick(clickPoint);
            state.clickTimer = null;
          }, DOUBLE_CLICK_THRESHOLD);
          
          state.lastClickTime = now;
        }
        
        // Reset state
        state.mouseDownPoint = null;
        state.pathPoints = [];
      }
    });
  };

  useEffect(() => {
    const disposeCanvas = () => {
      const state = stateRef.current;
      
      if (state.clickTimer) {
        clearTimeout(state.clickTimer);
        state.clickTimer = null;
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
          <AlertCircle className="w-10 h-10 text-red-500" />
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