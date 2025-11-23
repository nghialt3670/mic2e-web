import { Button } from "@/components/ui/button";
import { Box, X } from "lucide-react";
import { InputAttachment, useInputAttachmentStore } from "../../stores/input-attachment-store";
import { useInteractionStore } from "../../stores/interaction-store";
import { useReferenceStore } from "@/stores/reference-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { FigCanvas } from "../edit/fig-canvas";
import { Canvas, FabricObject } from "fabric";
import { FC } from "react";

interface InputAttachmentItemProps {
  attachment: InputAttachment; // keep same shape you already have
}

export const InputAttachmentItem: FC<InputAttachmentItemProps> = ({ attachment }) => {
  const { removeInputAttachment, setInputAttachment } = useInputAttachmentStore();
  const { addReference, getReferences, removeReferenceById } = useReferenceStore();
  const { color, type } = useInteractionStore();
  const isMobile = useIsMobile();

  const handleRemove = () => removeInputAttachment(attachment.imageFile.name);

  const onPointAdded = (id: string, meta?: { left: number; top: number }) => {
    addReference({ value: id, label: "point", color });
  };

  const onBoxAdded = (id: string, meta?: { left: number; top: number; width: number; height: number }) => {
    addReference({ value: id, label: "box", color });
  };

  const onFigSelected = (figId: string) => {
    addReference({ value: figId, label: "image", color });
  };

  const onScribbleAdded = (id: string, meta?: { points: { x: number; y: number }[] }) => {
    addReference({ value: id, label: "scribble", color });
  };

  const onFigChanged = (figObject: Record<string, any>) => {
    setInputAttachment(attachment.imageFile.name, { ...attachment, figObject });
  };

  const onObjectRemoved = (objectId: string) => {
    removeReferenceById(objectId);
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
        interactive={true}
        color={color}
      />

      <Button size="icon" variant="outline" className="absolute top-1 right-1 h-6 w-6" onClick={handleRemove}>
        <X className="size-4" />
      </Button>
    </div>
  );
};
