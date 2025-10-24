import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useUploadAttachmentStore } from "../../stores/upload-attachment-store";
import { UploadAttachmentItem } from "../upload-attachment-item";

export const UploadAttachmentList = () => {
  const { files } = useUploadAttachmentStore();

  const numVisibleItems = Math.min(3, files.length);
  const basis =
  numVisibleItems === 1
    ? "basis-full"
    : numVisibleItems === 2
    ? "basis-1/2"
    : "basis-1/3";


  return (
    <Carousel>
      <CarouselContent>
        {files.map((file) => (
          <CarouselItem key={file.name} className={`flex justify-center ${basis}`}>
            <UploadAttachmentItem
              key={file.name}
              file={file}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
        {files.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
    </Carousel>
  );
};
