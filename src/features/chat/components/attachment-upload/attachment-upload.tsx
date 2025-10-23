"use client";

import { Button } from "@/components/ui/button";
import {
  removeFileFromSupabase,
  uploadFileToSupabase,
} from "@/lib/supabase/supabase-utils";
import { clientEnv } from "@/utils/client/client-env";
import { Upload } from "lucide-react";
import { useRef } from "react";

import { useAttachmentStore } from "../../stores/attachment-store";

export const AttachmentUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    filenameToFileMap,
    filenameToPathMap,
    filenameToUrlMap,
    setAttachments,
    updateAttachmentUrl,
  } = useAttachmentStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    Object.keys(filenameToFileMap).forEach((filename) => {
      const path = filenameToPathMap[filename];
      const url = filenameToUrlMap[filename];
      if (url) {
        removeFileFromSupabase(
          path,
          clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME,
        );
      }
    });

    setAttachments(files);

    files.forEach(async (file) => {
      const path = `${Date.now()}.${file.name}`;
      const uploadedUrl = await uploadFileToSupabase(
        file,
        path,
        clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME,
      );
      if (uploadedUrl) {
        updateAttachmentUrl(file.name, uploadedUrl);
      }
    });

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
        <Upload />
      </Button>
    </>
  );
};
