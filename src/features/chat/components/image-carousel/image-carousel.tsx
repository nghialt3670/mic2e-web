"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { X } from "lucide-react";
import { useState } from "react";

interface ImageCarouselProps {
  images: File[];
  onRemoveImage: (index: number) => void;
}

export const ImageCarousel = ({ images, onRemoveImage }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4">
      <div className="w-full max-w-2xl mx-auto">
        <Carousel
          className="w-full"
          opts={{
            align: "start",
            slidesToScroll: 3,
          }}
          setApi={(api) => {
            if (api) {
              api.on("select", () => {
                setCurrentIndex(api.selectedScrollSnap());
              });
            }
          }}
        >
          <CarouselContent className="-ml-1">
            {images.map((image, index) => (
              <CarouselItem key={index} className="pl-1 basis-1/3">
                <div className="relative group aspect-square">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5"
                    onClick={() => onRemoveImage(index)}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 3 && (
            <>
              <CarouselPrevious className="h-6 w-6" />
              <CarouselNext className="h-6 w-6" />
            </>
          )}
        </Carousel>
        <div className="text-center text-xs text-muted-foreground mt-2">
          {images.length} image{images.length !== 1 ? 's' : ''} selected
        </div>
      </div>
    </div>
  );
};
