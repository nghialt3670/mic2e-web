"use client";

import { clientEnv } from "@/utils/client/client-env";

interface UploadResponse {
  filename: string;
  upload_path: string;
  upload_url: string;
}

export async function uploadFileToApi(
  file: File,
  path: string,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("path", path);
  formData.append("file", file);

  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_CHAT2EDIT_API_URL}/storage/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message ?? "Failed to upload file");
  }

  return payload.data ?? payload;
}
