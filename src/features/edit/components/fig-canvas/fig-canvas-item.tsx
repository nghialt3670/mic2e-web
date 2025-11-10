import { Skeleton } from "@/components/ui/skeleton";
import { calculateZoomToFit } from "@/lib/fabric/fabric-utils";
import { Canvas, FabricImage, Group } from "fabric";
import { FC } from "react";
import { useEffect, useRef, useState } from "react";

interface FigCanvasItemProps {
  figObject: Record<string, any>;
}

export const FigCanvasItem: FC<FigCanvasItemProps> = ({ figObject }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCanvas = async () => {
      if (!canvasRef.current || !containerRef.current) return;

      setIsLoading(true);

      try {
        const fig = await Group.fromObject(figObject);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        }
        const fabricCanvas = new Canvas(canvasRef.current);
        fabricCanvasRef.current = fabricCanvas;
        fabricCanvas.add(fig);
        fabricCanvas.renderAll();

        // Set initial canvas dimensions and zoom
        const figObjects = fig.getObjects();
        if (figObjects.length > 0) {
          const image = figObjects[0] as FabricImage;
          const imageWidth = image.getScaledWidth();
          const imageHeight = image.getScaledHeight();
          const containerWidth = 800;
          const containerHeight = 600;
          const zoom = calculateZoomToFit(
            imageWidth,
            imageHeight,
            containerWidth,
            containerHeight,
          );

          fabricCanvas.setDimensions({
            width: imageWidth * zoom,
            height: imageHeight * zoom,
          });
          fabricCanvas.setZoom(zoom);
          fabricCanvas.renderAll();
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading canvas:", error);
        setIsLoading(false);
      }
    };

    if (canvasRef.current && containerRef.current) {
      loadCanvas();
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [figObject]);

  useEffect(() => {
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
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef.current, containerRef.current]);

  return (
    <div className="w-full h-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <Skeleton className="w-full h-full" />
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
  );
};
