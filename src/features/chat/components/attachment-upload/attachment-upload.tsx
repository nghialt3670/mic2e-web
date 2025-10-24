"use client";

import { Button } from "@/components/ui/button";
import { removeFilesFromSupabase } from "@/lib/supabase/supabase-utils";
import { clientEnv } from "@/utils/client/client-env";
import { Loader2Icon, UploadIcon } from "lucide-react";
import { useRef } from "react";

import { useUploadAttachmentStore } from "../../stores/upload-attachment-store";

export const AttachmentUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clearFiles, setFiles, getAttachments, clearAttachments } =
    useUploadAttachmentStore();
  const attachments = getAttachments();
  const bucketName = clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME;
  const isAllRead = attachments.every((attachment) => attachment.imageInfo);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    clearFiles();
    const files = Array.from(event.target.files || []);
    const uploadedPaths = attachments
      .map((attachment) => attachment.uploadInfo?.path)
      .filter((path): path is string => path !== undefined);
    if (uploadedPaths.length > 0) {
      await removeFilesFromSupabase(uploadedPaths, bucketName);
    }

    setFiles(files);
    clearAttachments();

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
        disabled={!isAllRead}
      >
        {isAllRead ? <UploadIcon /> : <Loader2Icon className="animate-spin" />}
      </Button>
    </>
  );
};
