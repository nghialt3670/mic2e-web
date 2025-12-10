import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AttachmentInput,
  useMessageInputStore,
} from "@/stores/message-input-store";
import { Circle, Group, Path, Rect } from "fabric";
import { X } from "lucide-react";
import { FC } from "react";
import { v4 } from "uuid";

import { FigCanvas } from "../edit/fig-canvas";

interface AttachmentInputItemProps {
  attachment: AttachmentInput;
}

export const AttachmentInputItem: FC<AttachmentInputItemProps> = ({
  attachment,
}) => {
  const { setAttachment, removeAttachment, addReference, removeReference } =
    useMessageInputStore();
  const isMobile = useIsMobile();

  const handleRemove = () => {
    removeAttachment(attachment);
  };

  const handleFigFileChange = (figFile: File) => {
    setAttachment({ ...attachment, file: figFile });
  };

  const handlePointAdded = (point: Circle) => {
    const reference = {
      value: v4(),
      label: "point",
      color: point.get("color"),
    };
    addReference(reference);
    point.set("reference", reference);
    attachment.canvasRef?.current?.canvas?.renderAll();
  };

  const handleBoxAdded = (box: Rect) => {
    const reference = {
      value: v4(),
      label: "box",
      color: box.get("color"),
    };
    addReference(reference);
    box.set("reference", reference);
    attachment.canvasRef?.current?.canvas?.renderAll();
  };

  const handleFigSelected = (fig: Group) => {
    const reference = {
      value: v4(),
      label: "image",
      color: fig.get("color"),
    };
    addReference(reference);
    fig.set("reference", reference);
    attachment.canvasRef?.current?.canvas?.renderAll();
  };

  const handleFigUnselected = (fig: Group) => {
    removeReference(fig.get("reference"));
    attachment.canvasRef?.current?.canvas?.renderAll();
  };

  const handleScribbleAdded = (scribble: Path) => {
    const reference = {
      value: v4(),
      label: "scribble",
      color: scribble.get("color"),
    };
    addReference(reference);
    scribble.set("reference", reference);
    attachment.canvasRef?.current?.canvas?.renderAll();
  };

  const handleObjectRemoved = (object: Circle | Rect | Path) => {
    removeReference(object.get("reference"));
    attachment.canvasRef?.current?.canvas?.renderAll();
  };

  return (
    <div className="relative group border rounded-lg overflow-hidden transition-all">
      <FigCanvas
        ref={attachment.canvasRef}
        figFile={attachment.file}
        maxHeight={isMobile ? 180 : 360}
        maxWidth={isMobile ? 240 : 480}
        onFigFileChange={handleFigFileChange}
        onPointAdded={handlePointAdded}
        onBoxAdded={handleBoxAdded}
        onFigSelected={handleFigSelected}
        onFigUnselected={handleFigUnselected}
        onScribbleAdded={handleScribbleAdded}
        onObjectRemoved={handleObjectRemoved}
      />

      <Button
        size="icon"
        variant="outline"
        className="absolute top-1 right-1 h-6 w-6"
        onClick={handleRemove}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
};
