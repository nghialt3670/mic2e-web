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
  const { mode, targetAttachmentId } = useInteractionModeStore();
  const isMobile = useIsMobile();

  const isActive = targetAttachmentId === attachment.imageFile.name && mode !== "none";

  const handleRemove = () => {
    removeInputAttachment(attachment.imageFile.name);
  };

  switch (attachment.type) {
    case "fig":
      return (
        <div 
          className={`relative group border rounded-lg overflow-hidden transition-all ${
            isActive ? "border-blue-500 border-2 shadow-lg ring-2 ring-blue-200" : "border-gray-200"
          }`}
        >
          {/* Active mode indicator badge */}
          {isActive && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md shadow-md">
              {mode === "box" && <Box className="size-3" />}
              {mode === "point" && <MousePointer2 className="size-3" />}
              {mode === "image" && <ImageIcon className="size-3" />}
              <span className="capitalize">{mode}</span>
            </div>
          )}

          <FigCanvas 
            figObject={attachment.figObject} 
            maxHeight={isMobile ? 180 : 360} 
            maxWidth={isMobile ? 240 : 480} 
            interactionMode={isActive ? mode : "none"}
            attachmentId={attachment.imageFile.name}
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
