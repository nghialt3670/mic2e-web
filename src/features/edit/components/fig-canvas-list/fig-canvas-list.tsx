import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FC, useEffect, useState } from "react";

import { FigCanvasItem } from "../fig-canvas-item";

interface FigCanvasListProps {
  currIndex: number;
  figObjects: Record<string, any>[];
}

export const FigCanvasList: FC<FigCanvasListProps> = ({
  figObjects,
  currIndex,
}) => {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api || currIndex < 0) return;

    api.scrollTo(currIndex);
  }, [api, currIndex]);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api || figObjects.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        api.scrollPrev();
      } else if (e.key === "ArrowRight") {
        api.scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [api, figObjects.length]);

  if (figObjects.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No images to display
      </div>
    );
  }

  return (
    <Carousel 
      setApi={setApi} 
      className="w-full h-full relative"
      opts={{ 
        watchDrag: false,
        loop: true,
        align: "start",
      }}
    >
      <CarouselContent className="h-full">
        {figObjects.map((obj, index) => (
          <CarouselItem key={index} className="pl-0 basis-full min-w-0 flex-shrink-0">
            <div className="h-screen w-screen">
              <FigCanvasItem figObject={obj} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {figObjects.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/80 hover:bg-white" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/80 hover:bg-white" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {current + 1} / {figObjects.length}
          </div>
        </>
      )}
    </Carousel>
  );
};
