import { Skeleton } from "@/components/ui/skeleton";
import {
  createFigFileFromFigObject,
  createFigFromFigObject,
  createFigObjectFromFigFile,
  resizeAndZoomCanvas,
} from "@/lib/fabric/fabric-utils";
import { getNextColor } from "@/utils/client/color-utils";
import { to } from "await-to-js";
import { Canvas, Circle, FabricObject, Group, Path, Point, Rect } from "fabric";
import { AlertCircle } from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  canvasToFigCoords,
  createBox,
  createFigFrame,
  createPoint,
  createScribble,
  hasFigFrame,
  removeFigFrame,
} from "./fig-canvas.helper";

interface FigCanvasProps {
  figFile: File;
  onPointAdded?: (point: Circle) => void;
  onBoxAdded?: (box: Rect) => void;
  onFigFileChange?: (figFile: File) => void;
  onFigSelected?: (fig: Group) => void;
  onFigUnselected?: (fig: Group) => void;
  onScribbleAdded?: (scribble: Path) => void;
  onObjectRemoved?: (object: Circle | Rect | Path) => void;
  maxWidth?: number;
  maxHeight?: number;
}

export interface FigCanvasRef {
  canvas: Canvas | null;
  updateFigFile: () => Promise<void>;
}

const FigCanvasComponent = forwardRef<FigCanvasRef, FigCanvasProps>(
  (
    {
      figFile,
      onFigFileChange,
      onPointAdded,
      onBoxAdded,
      onFigSelected,
      onFigUnselected,
      onScribbleAdded,
      maxWidth = 800,
      maxHeight = 600,
    },
    ref: ForwardedRef<FigCanvasRef>,
  ) => {
    const canvasElementRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<Canvas | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const lastEmittedSignatureRef = useRef<string | null>(null);
    const lastLoadedSignatureRef = useRef<string | null>(null);
    const currentColorRef = useRef<string>("#000000");
    const figDataUrlRef = useRef<string>("");

    const figSignature = (file?: File | null) =>
      file ? `${file.name}-${file.size}-${file.lastModified}` : null;

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
      pendingArmPoint: null as Point | null, // Track which point armed the draw
    });

    const updateNextColor = async () => {
      if (figDataUrlRef.current) {
        const nextColor = await getNextColor(figDataUrlRef.current);
        currentColorRef.current = nextColor;
      }
    };

    const handleFigChange = async () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const fig = canvas.getObjects()[0];
      if (!fig) return;
      const figObject = fig.toObject(["id", "ephemeral", "reference", "color"]);
      const newfigFile = await createFigFileFromFigObject(
        figObject,
        figFile.name,
      );
      lastEmittedSignatureRef.current = figSignature(newfigFile);
      onFigFileChange?.(newfigFile);
    };

    // Expose canvas and updateFigFile method via ref
    useImperativeHandle(
      ref,
      () => ({
        canvas: fabricCanvasRef.current,
        updateFigFile: handleFigChange,
      }),
      [isLoading, figFile, handleFigChange],
    ); // Update when loading state changes (canvas ready)

    const setupInteractions = (canvas: Canvas) => {
      const state = stateRef.current;
      const fig = canvas.getObjects()[0] as Group;
      if (!fig) return;

      const DOUBLE_CLICK_THRESHOLD = 300; // ms
      const DRAG_THRESHOLD = 5; // pixels

      const handleDoubleClick = async () => {
        // Double click: toggle frame
        if (hasFigFrame(canvas)) {
          const fig = removeFigFrame(canvas);
          onFigUnselected?.(fig);
        } else {
          const figFrame = createFigFrame(canvas, currentColorRef.current);
          onFigSelected?.(figFrame);
          await updateNextColor();
        }
        handleFigChange();
        state.isArmedDraw = false;
      };

      const handleSingleClick = async (point: Point) => {
        // Single click: create point (arming already happened immediately on click)
        const createdPoint = createPoint(
          point,
          canvas,
          currentColorRef.current,
        );
        onPointAdded?.(createdPoint);
        await updateNextColor();
        handleFigChange();
      };

      canvas.on("mouse:down", (e: any) => {
        if (!e.pointer) return;

        const now = Date.now();
        state.mouseDownPoint = e.pointer;
        state.mouseDownTime = now;
        state.isDragging = false;
        state.dragStarted = false;
        state.pathPoints = [e.pointer];

        // Check if this mouse down is on the same point that armed the draw
        const isContinuingFromArmedClick =
          state.pendingArmPoint &&
          Math.abs(e.pointer.x - state.pendingArmPoint.x) < 5 &&
          Math.abs(e.pointer.y - state.pendingArmPoint.y) < 5;

        // If this is a new mouse down (not continuing from armed click), disarm
        if (state.isArmedDraw && !isContinuingFromArmedClick) {
          state.isArmedDraw = false;
          state.pendingArmPoint = null;
        }

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
              stroke: currentColorRef.current,
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
              stroke: currentColorRef.current,
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
            // Armed draw: create box and disarm
            const box = createBox(
              state.mouseDownPoint,
              e.pointer,
              canvas,
              currentColorRef.current,
            );
            onBoxAdded?.(box);
            updateNextColor();
            handleFigChange();
            state.isArmedDraw = false; // Disarm after creating box
            state.pendingArmPoint = null;
          } else {
            // Regular draw: create scribble
            const scribble = createScribble(
              state.pathPoints,
              canvas,
              currentColorRef.current,
            );
            onScribbleAdded?.(scribble);
            updateNextColor();
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
            // Double click detected - disarm and toggle frame
            state.isArmedDraw = false;
            state.pendingArmPoint = null;
            handleDoubleClick();
            state.lastClickTime = 0; // Reset to prevent triple-click issues
          } else {
            // Potential single click - arm immediately but delay point creation
            state.isArmedDraw = true;
            state.pendingArmPoint = clickPoint; // Remember where the arm happened

            state.clickTimer = setTimeout(() => {
              // Only create the point if not cancelled by double-click
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
      const loadCanvas = async () => {
        if (!canvasElementRef.current) return;

        const incomingSignature = figSignature(figFile);

        // Skip if this is our own change
        if (
          incomingSignature &&
          incomingSignature === lastEmittedSignatureRef.current
        ) {
          lastLoadedSignatureRef.current = incomingSignature;
          return;
        }

        setIsLoading(true);

        const [figObjectError, figObject] = await to(
          createFigObjectFromFigFile(figFile),
        );
        if (figObjectError) {
          console.error("Error creating fig object:", figObjectError);
          setIsError(true);
          setIsLoading(false);
          return;
        }

        const [figError, fig] = await to(createFigFromFigObject(figObject));
        if (figError) {
          console.error("Error creating fig:", figError);
          setIsError(true);
          setIsLoading(false);
          return;
        }

        // Dispose old canvas before creating new one
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        }

        const fabricCanvas = new Canvas(canvasElementRef.current);
        fabricCanvas.selection = false; // Disable selection box
        fabricCanvasRef.current = fabricCanvas;
        fabricCanvas.add(fig);
        resizeAndZoomCanvas(fabricCanvas, maxWidth, maxHeight);
        fabricCanvas.requestRenderAll();

        // Get data URL from rendered canvas for color generation
        figDataUrlRef.current = fabricCanvas.toDataURL();

        // Initialize first color from canvas
        const initialColor = await getNextColor(figDataUrlRef.current);
        currentColorRef.current = initialColor;

        setupInteractions(fabricCanvas);
        setIsLoading(false);
        lastLoadedSignatureRef.current = incomingSignature;
      };

      if (canvasElementRef.current) {
        loadCanvas();
      }

      // Cleanup function only for unmounting
      return () => {
        const state = stateRef.current;

        if (state.clickTimer) {
          clearTimeout(state.clickTimer);
          state.clickTimer = null;
        }

        // Only dispose on unmount, not on every render
        // Disposal during updates is handled in loadCanvas
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [figFile, maxWidth, maxHeight]);

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
  },
);

FigCanvasComponent.displayName = "FigCanvas";

export const FigCanvas = FigCanvasComponent;
