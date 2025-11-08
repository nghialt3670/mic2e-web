import { InputAttachment, useInputAttachmentStore } from "../../stores/input-attachment-store";
import { FigCanvas } from "@/features/edit/components/fig-canvas/fig-canvas";
import { Button } from "@/components/ui/button";
import { Box, MousePointer2, Image as ImageIcon, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInteractionModeStore } from "../../stores/interaction-mode-store";

interface InputAttachmentItemProps {
  attachment: InputAttachment;
}

export const InputAttachmentItem = ({
  attachment,
}: InputAttachmentItemProps) => {
  const { removeInputAttachment } = useInputAttachmentStore();
  const { mode, activeTagId, activeTagColor, clearMode } = useInteractionModeStore();
  const isMobile = useIsMobile();

  const isInteractive = mode !== "none"; // Any canvas is interactive when mode is active

  const handleRemove = () => {
    removeInputAttachment(attachment.imageFile.name);
  };

  const handleAnnotationComplete = () => {
    clearMode();
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
              {mode === "box" && <Box className="size-3" />}
              {mode === "point" && <MousePointer2 className="size-3" />}
              {mode === "image" && <ImageIcon className="size-3" />}
              <span className="capitalize">Draw {mode}</span>
            </div>
          )}

          <FigCanvas 
            figObject={attachment.figObject} 
            maxHeight={isMobile ? 180 : 360} 
            maxWidth={isMobile ? 240 : 480} 
            interactionMode={isInteractive ? mode : "none"}
            attachmentId={attachment.imageFile.name}
            activeTagId={isInteractive ? activeTagId : null}
            activeTagColor={isInteractive ? activeTagColor : null}
            onAnnotationComplete={handleAnnotationComplete}
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
