import { Button } from "@/components/ui/button";
import { Box, X } from "lucide-react";
import { InputAttachment, useInputAttachmentStore } from "../../stores/input-attachment-store";
import { useInteractionStore } from "../../stores/interaction-store";
import { useReferenceStore } from "@/stores/reference-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { FigCanvas } from "../edit/fig-canvas";
import { Canvas, Circle, FabricObject, Group, Path, Rect } from "fabric";
import { FC } from "react";
import stringToColor from "string-to-color";
import { v4 } from "uuid";

interface InputAttachmentItemProps {
  attachment: InputAttachment; // keep same shape you already have
}

export const InputAttachmentItem: FC<InputAttachmentItemProps> = ({ attachment }) => {
  const { removeInputAttachment, setInputAttachment } = useInputAttachmentStore();
  const { addReference, removeReferenceById } = useReferenceStore();
  const { color, setColor } = useInteractionStore();
  const isMobile = useIsMobile();

  const handleRemove = () => removeInputAttachment(attachment.imageFile.name);

  const onPointAdded = (point: Circle) => {
    addReference({ value: point.get("id"), label: "point", color, figId: attachment.figObject.id });
    setColor(stringToColor(v4()));
  };

  const onBoxAdded = (box: Rect) => {
    addReference({ value: box.get("id"), label: "box", color, figId: attachment.figObject.id });
    setColor(stringToColor(v4()));
  };

  const onFigSelected = (fig: Group) => {
    addReference({ value: fig.get("id"), label: "image", color, figId: attachment.figObject.id });
    setColor(stringToColor(v4()));
  }

  const onScribbleAdded = (scribble: Path) => {
    addReference({ value: scribble.get("id"), label: "scribble", color, figId: attachment.figObject.id });
    setColor(stringToColor(v4()));
  };

  const onFigChanged = (figObject: Record<string, any>) => {
    setInputAttachment(attachment.imageFile.name, { ...attachment, figObject });
  };

  const onObjectRemoved = (object: Circle | Rect | Path) => {
    removeReferenceById(object.get("id"));
  };

  if (attachment.type !== "fig") return null;

  return (
    <div className="relative group border rounded-lg overflow-hidden transition-all">
      <FigCanvas
        value={attachment.figObject}
        maxHeight={isMobile ? 180 : 360}
        maxWidth={isMobile ? 240 : 480}
        onChange={onFigChanged}
        onPointAdded={onPointAdded}
        onBoxAdded={onBoxAdded}
        onFigSelected={onFigSelected}
        onScribbleAdded={onScribbleAdded}
        onObjectRemoved={onObjectRemoved}
        color={color}
      />

      <Button size="icon" variant="outline" className="absolute top-1 right-1 h-6 w-6" onClick={handleRemove}>
        <X className="size-4" />
      </Button>
    </div>
  );
};
