import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageInput } from "@/features/chat/components/message-input";
import { AttachmentDetail } from "@/features/chat/types";
import { createFigFromUrl } from "@/lib/fabric/fabric-utils";
import { to } from "await-to-js";
import { Canvas, FabricImage, Group } from "fabric";
import {
  Circle,
  Download,
  Eraser,
  Layers,
  MousePointer2,
  Pencil,
  Redo2,
  Settings,
  Square,
  Type,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AttachmentEditorProps {
  attachment: AttachmentDetail;
  onClose?: () => void;
}

const calculateZoomToFit = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
): number => {
  const widthRatio = containerWidth / imageWidth;
  const heightRatio = containerHeight / imageHeight;
  return Math.min(widthRatio, heightRatio);
};

export const AttachmentEditor: React.FC<AttachmentEditorProps> = ({
  attachment,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        containerHeight,
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
        containerHeight,
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

  return (
    <div className="flex flex-col w-full h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white flex-shrink-0 border-b">
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
          <Button
            size="icon"
            variant="ghost"
            title="Layers"
            className="h-9 w-9"
          >
            <Layers className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Settings"
            className="h-9 w-9"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Download"
            className="h-9 w-9"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-slate-100 relative min-h-0">
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
          <div
            className="bg-white shadow-sm"
            style={{
              display: isLoading ? "none" : "block",
            }}
          >
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* Message Input Section */}
      <div className="bg-white p-4 pb-10 flex-shrink-0 border-t">
        <div className="flex items-center justify-center">
          <MessageInput />
        </div>
      </div>
    </div>
  );
};
