import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, Group } from "fabric";
import { AttachmentDetail } from "@/features/chat/types";
import { createFigFromUrl } from "@/lib/fabric/fabric-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { to } from "await-to-js";
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Pencil,
  Eraser,
  ZoomIn,
  ZoomOut,
  Download,
  Undo2,
  Redo2,
  Layers,
  Settings,
  X,
} from "lucide-react";
import { MessageInput } from "@/features/chat/components/message-input";

interface AttachmentEditorProps {
  attachment: AttachmentDetail;
  onClose?: () => void;
}

/**
 * Calculate zoom factor to fit image within available space
 * @param imageWidth - Width of the image
 * @param imageHeight - Height of the image
 * @param containerWidth - Available container width
 * @param containerHeight - Available container height
 * @param padding - Padding to leave around the image (default: 40px)
 * @returns Zoom factor to apply to the canvas
 */
const calculateZoomToFit = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
): number => {

  const widthRatio = containerWidth / imageWidth;
  const heightRatio = containerHeight / imageHeight;

  // Use the smaller ratio to ensure the entire image fits
  return Math.min(widthRatio, heightRatio, 1); // Don't zoom in beyond 100%
};

type Tool = "select" | "rectangle" | "circle" | "text" | "draw" | "erase";

export const AttachmentEditor: React.FC<AttachmentEditorProps> = ({ attachment, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // 🧹 Dispose previous canvas before creating a new one
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }

    let cancelled = false;

    const loadFig = async () => {
      setIsLoading(true);
      const [error, fig] = await to(createFigFromUrl(attachment.url));
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      if (cancelled || !canvasRef.current || !containerRef.current) return;

      const image = fig.getObjects()[0] as FabricImage;
      const imageWidth = image.getScaledWidth();
      const imageHeight = image.getScaledHeight();

      // Get container dimensions
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      // Calculate zoom to fit
      const calculatedZoom = calculateZoomToFit(
        imageWidth,
        imageHeight,
        containerWidth,
        containerHeight
      );

      const fabricCanvas = new Canvas(canvasRef.current);
      fabricCanvasRef.current = fabricCanvas;

      fabricCanvas.add(fig);
      fabricCanvas.setDimensions({
        width: imageWidth * calculatedZoom,
        height: imageHeight * calculatedZoom,
      });
      fabricCanvas.setZoom(calculatedZoom);
      fabricCanvas.renderAll();
      
      setZoom(calculatedZoom);
      setCanvasSize({ width: imageWidth, height: imageHeight });
      setIsLoading(false);
    };

    loadFig();

    // Handle window resize
    const handleResize = () => {
      if (!fabricCanvasRef.current || !containerRef.current) return;

      const canvas = fabricCanvasRef.current;
      const objects = canvas.getObjects();
      if (objects.length === 0) return;

      const fig = objects[0] as Group;
      const figObjects = fig.getObjects();
      if (figObjects.length === 0) return;

      const image = figObjects[0] as FabricImage;
      const imageWidth = image.getScaledWidth();
      const imageHeight = image.getScaledHeight();

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const zoom = calculateZoomToFit(
        imageWidth,
        imageHeight,
        containerWidth,
        containerHeight
      );

      canvas.setDimensions({
        width: imageWidth * zoom,
        height: imageHeight * zoom,
      });
      canvas.setZoom(zoom);
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [attachment]);

  const handleZoomIn = () => {
    if (!fabricCanvasRef.current) return;
    const newZoom = Math.min(zoom * 1.2, 5);
    fabricCanvasRef.current.setZoom(newZoom);
    fabricCanvasRef.current.setDimensions({
      width: canvasSize.width * newZoom,
      height: canvasSize.height * newZoom,
    });
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    if (!fabricCanvasRef.current) return;
    const newZoom = Math.max(zoom / 1.2, 0.1);
    fabricCanvasRef.current.setZoom(newZoom);
    fabricCanvasRef.current.setDimensions({
      width: canvasSize.width * newZoom,
      height: canvasSize.height * newZoom,
    });
    setZoom(newZoom);
  };

  const handleZoomFit = () => {
    if (!fabricCanvasRef.current || !containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const newZoom = calculateZoomToFit(
      canvasSize.width,
      canvasSize.height,
      containerWidth,
      containerHeight
    );
    fabricCanvasRef.current.setZoom(newZoom);
    fabricCanvasRef.current.setDimensions({
      width: canvasSize.width * newZoom,
      height: canvasSize.height * newZoom,
    });
    setZoom(newZoom);
  };

  const tools = [
    { id: "select" as Tool, icon: MousePointer2, label: "Select" },
    { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
    { id: "circle" as Tool, icon: Circle, label: "Circle" },
    { id: "text" as Tool, icon: Type, label: "Text" },
    { id: "draw" as Tool, icon: Pencil, label: "Draw" },
    { id: "erase" as Tool, icon: Eraser, label: "Erase" },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-slate-100">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 flex-shrink-0">
        {/* Close Button */}
        {onClose && (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              title="Close"
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}
      
        {/* Right Side Actions */}
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" title="Layers" className="h-9 w-9">
            <Layers className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Settings" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Download" className="h-9 w-9">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

       {/* Canvas Area */}
       <div 
         className="flex-1 overflow-auto bg-slate-100 relative min-h-0"
       >
         <div
           ref={containerRef}
           className="flex items-center justify-center w-full h-full"
         >
           {isLoading && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
               <Skeleton className="w-[600px] h-[400px]" />
             </div>
           )}
           {error && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
               <div className="text-red-500">Error: {error}</div>
             </div>
           )}
           <div className="bg-white p-1 shadow-sm" style={{ 
             display: isLoading ? 'none' : 'block'
           }}>
             <canvas ref={canvasRef} />
           </div>
         </div>
       </div>

       {/* Message Input Section */}
       <div className="bg-slate-100 p-4 flex-shrink-0">
         <div className="flex items-center justify-center">
           <MessageInput />
         </div>
       </div>

       {/* Status Bar */}
       <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-t text-xs text-slate-600 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>Tool: {activeTool}</span>
          {canvasSize.width > 0 && (
            <span>
              Canvas: {canvasSize.width} × {canvasSize.height}px
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Ready</span>
        </div>
       </div>
    </div>
  );
};
