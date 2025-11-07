"use client";

import { Button } from "@/components/ui/button";
import { createFigObjectFromImageFile } from "@/lib/fabric/fabric-utils";
import { UploadIcon } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import {
  MAXIMUM_FILE_SIZE,
  MAXIMUM_NUMBER_OF_FILES,
  SUPPORTED_FILE_TYPES,
} from "../../constants";
import {
  InputAttachment,
  useInputAttachmentStore,
} from "../../stores/input-attachment-store";

export const AttachmentInput = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clearInputAttachments, setInputAttachments } =
    useInputAttachmentStore();

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
    clearInputAttachments();

    const files = Array.from(event.target.files || []);
    if (!validateFiles(files)) {
      return;
    }

    const keys = files.map((file) => file.name);
    const attachments: InputAttachment[] = await Promise.all(
      files.map(async (file) => ({
        type: "fig",
        figObject: await createFigObjectFromImageFile(file),
        imageFile: file,
      })),
    );
    setInputAttachments(keys, attachments);

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
