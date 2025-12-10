"use client";

import { FigCanvasRef } from "@/components/edit/fig-canvas";
import { Button } from "@/components/ui/button";
import {
  MAXIMUM_FILE_SIZE,
  MAXIMUM_NUMBER_OF_FILES,
  SUPPORTED_FILE_TYPES,
} from "@/constants/upload-constants";
import { createFigFileFromImageFile } from "@/lib/fabric/fabric-utils";
import { useMessageInputStore } from "@/stores/message-input-store";
import { UploadIcon } from "lucide-react";
import { createRef, useRef } from "react";
import { toast } from "sonner";

export const AttachmentInput = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setAttachments, clearAttachments } = useMessageInputStore();

  const validateFiles = (files: File[]) => {
    if (files.length > MAXIMUM_NUMBER_OF_FILES) {
      toast.error("Maximum number of files exceeded");
      return false;
    }
    if (files.some((file) => file.size > MAXIMUM_FILE_SIZE)) {
      toast.error("Maximum file size exceeded");
      return false;
    }
    if (!files.every((file) => SUPPORTED_FILE_TYPES.includes(file.type))) {
      toast.error("Unsupported file type");
      return false;
    }
    return true;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (!validateFiles(files)) {
      return;
    }

    clearAttachments();
    const figFiles = await Promise.all(files.map(createFigFileFromImageFile));
    const attachments = figFiles.map((file) => ({
      file,
      canvasRef: createRef<FigCanvasRef>(),
    }));
    setAttachments(attachments);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        size="icon"
        variant="ghost"
        onClick={handleClick}
        type="button"
        className="h-8 w-8"
      >
        <UploadIcon />
      </Button>
    </>
  );
};
