import { Button } from "@/components/ui/button";
import { FigCanvas } from "@/features/edit/components/fig-canvas/fig-canvas";
import { useIsMobile } from "@/hooks/use-mobile";
import { Box, Image as ImageIcon, MousePointer2, X } from "lucide-react";

import {
  InputAttachment,
  useInputAttachmentStore,
} from "../../stores/input-attachment-store";
import { Canvas, Group, Rect, Circle, TPointerEvent, TPointerEventInfo, FabricImage } from "fabric";
import { useInteractionStore } from "../../stores/interaction-store";

interface InputAttachmentItemProps {
  attachment: InputAttachment;
}

export const InputAttachmentItem = ({
  attachment,
}: InputAttachmentItemProps) => {
  const { removeInputAttachment, setInputAttachment } = useInputAttachmentStore();
  const { getCurrentReference, addReference } = useInteractionStore();
  const isMobile = useIsMobile();
  const { type, color } = getCurrentReference();

  const isInteractive = type !== "none";

  const handleRemove = () => {
    removeInputAttachment(attachment.imageFile.name);
  };
  
  const handleMouseDown = (canvas: Canvas, event: TPointerEventInfo<TPointerEvent>) => {
    const fig = canvas.getObjects()[0] as Group;
    if (type === "point") {
      const point = new Circle({
        left: event.scenePoint.x,
        top: event.scenePoint.y,
        radius: 5 / canvas.getZoom(),
        fill: color,
        originX: "center",
        originY: "center",
      });
      fig.add(point);
      addReference();
      canvas.renderAll();
    } else if (type === "image") {
      const image = fig.getObjects()[0] as FabricImage;
      const strokeWidth = Math.ceil(5 / canvas.getZoom());
      const rect = new Rect({
        left: 0,
        top: 0,
        width: image.width  - strokeWidth,
        height: image.height - strokeWidth,
        fill: "transparent",
        stroke: color,
        strokeWidth: strokeWidth,
        rx: 12,
        ry: 12,
        selectable: false,
      });
      fig.add(rect);
      addReference();
      canvas.renderAll();
    }
  };

  const handleMouseUp = (canvas: Canvas, event1: TPointerEventInfo<TPointerEvent>, event2: TPointerEventInfo<TPointerEvent>) => {
    if (type !== "box") return;
    const rect = new Rect({
      left: event1.scenePoint.x,
      top: event1.scenePoint.y,
      width: event2.scenePoint.x - event1.scenePoint.x,
      height: event2.scenePoint.y - event1.scenePoint.y,
      fill: "transparent",
      stroke: color,
      strokeWidth: 5 / canvas.getZoom(),
    });
    const fig = canvas.getObjects()[0] as Group;
    fig.add(rect);
    canvas.renderAll();
    addReference();
  };

  const handleFigObjectChange = (figObject: Record<string, any>) => {
    // console.log(figObject);
    // setInputAttachment(attachment.imageFile.name, {
    //   ...attachment,
    //   figObject,
    // });
  };

  switch (attachment.type) {
    case "fig":
      return (
        <div
          className={`relative group border rounded-lg overflow-hidden transition-all ${
            isInteractive
              ? "border-blue-300 border-dashed hover:border-blue-400"
              : "border-gray-200"
          }`}
        >
          {/* Interactive mode indicator badge */}
          {isInteractive && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-blue-500/90 text-white text-xs font-medium rounded-md shadow-md">
              {type === "box" && <Box className="size-3" />}
              {type === "point" && <MousePointer2 className="size-3" />}
              {type === "image" && <ImageIcon className="size-3" />}
              <span className="capitalize">Draw {type}</span>
            </div>
          )}

          <FigCanvas
            value={attachment.figObject}
            onChange={handleFigObjectChange}
            maxHeight={isMobile ? 180 : 360}
            maxWidth={isMobile ? 240 : 480}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          />

          <Button
            size="icon"
            variant="outline"
            className="absolute top-1 right-1 h-6 w-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-in-out"
            onClick={handleRemove}
          >
            <X className="size-4" />
          </Button>
        </div>
      );
    default:
      return null;
  }
};
