"use client";

import { Button } from "@/components/ui/button";
import { removeFilesFromSupabase } from "@/lib/supabase/supabase-utils";
import { clientEnv } from "@/utils/client/client-env";
import { Loader2Icon, UploadIcon } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import {
  MAXIMUM_FILE_SIZE,
  MAXIMUM_NUMBER_OF_FILES,
  SUPPORTED_FILE_TYPES,
} from "../../constants";
import { useUploadAttachmentStore } from "../../stores/upload-attachment-store";

export const AttachmentUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clearFiles, setFiles, getAttachments, clearAttachments, isAllRead } =
    useUploadAttachmentStore();
  const attachments = getAttachments();
  const bucketName = clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME;
  const isReading = !isAllRead();

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
    clearFiles();
    clearAttachments();
    const files = Array.from(event.target.files || []);

    if (!validateFiles(files)) {
      return;
    }

    const uploadedPaths = attachments
      .map((attachment) => attachment.uploadInfo?.path)
      .filter((path): path is string => path !== undefined);
    if (uploadedPaths.length > 0) {
      await removeFilesFromSupabase(uploadedPaths, bucketName);
    }

    setFiles(files);

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
        disabled={isReading}
      >
        {isReading ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
      </Button>
    </>
  );
};
