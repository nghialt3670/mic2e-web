import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FigEditor } from "@/features/edit/components/fig-editor";
import { X } from "lucide-react";
import { FC } from "react";

import { useUploadAttachmentStore } from "../../stores/upload-attachment-store";

interface UploadAttachmentDialogProps {}

export const UploadAttachmentDialog: FC<UploadAttachmentDialogProps> = ({}) => {
  const { currentAttachment, setCurrentAttachment } =
    useUploadAttachmentStore();

  return (
    <Dialog open={!!currentAttachment} onOpenChange={(open) => !open && setCurrentAttachment(undefined)}>
      <DialogContent
        className="w-[100vw] max-w-[100vw] sm:max-w-[100vw] h-[100vh] max-h-[100vh] p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Image Editor</DialogTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 rounded-full bg-white/80 hover:bg-white shadow-md"
          onClick={() => setCurrentAttachment(undefined)}
        >
          <X className="h-4 w-4" />
        </Button>
        <FigEditor />
      </DialogContent>
    </Dialog>
  );
};
