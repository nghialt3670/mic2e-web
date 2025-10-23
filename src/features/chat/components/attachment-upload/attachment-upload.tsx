"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { useAttachmentStore } from "../../stores/attachment-store";
import { removeFileFromSupabase, uploadFileToSupabase } from "@/lib/supabase/supabase-utils";

export const AttachmentUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { filenameToFileMap, filenameToPathMap, filenameToUrlMap, setAttachments, updateAttachmentUrl } = useAttachmentStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    Object.keys(filenameToFileMap).forEach((filename) => {
      const path = filenameToPathMap[filename];
      const url = filenameToUrlMap[filename];
      if (url) {
        removeFileFromSupabase(path);
      }
    });

    setAttachments(files);

    Object.keys(filenameToFileMap).forEach(async (filename) => {
      const file = filenameToFileMap[filename];
      const path = filenameToPathMap[filename];
      const url = filenameToUrlMap[filename];
      if (!url) {
        const uploadedUrl = await uploadFileToSupabase(file, path);
        if (uploadedUrl) {
          updateAttachmentUrl(filename, uploadedUrl);
        }
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
