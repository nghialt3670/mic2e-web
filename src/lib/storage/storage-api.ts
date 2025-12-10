"use client";

import { clientEnv } from "@/utils/client/env-utils";

const FILES_ENDPOINT = `${clientEnv.NEXT_PUBLIC_STORAGE_API_HOST}/files`;

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const options = { method: "POST", body: formData };
  const response = await fetch(FILES_ENDPOINT, options);

  const payload = await response.json();
  return payload.data["file_id"];
}

export async function downloadFile(fileId: string): Promise<File> {
  const response = await fetch(`${FILES_ENDPOINT}/${fileId}`);
  const blob = await response.blob();
  const filename = response.headers
    .get("Content-Disposition")
    ?.split("filename=")[1];
  return new File([blob], filename ?? fileId, { type: blob.type });
}

export async function replaceFile(fileId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const options = { method: "PUT", body: formData };
  const response = await fetch(`${FILES_ENDPOINT}/${fileId}`, options);

  const payload = await response.json();
  return payload.data["file_id"];
}

export async function deleteFile(fileId: string): Promise<string> {
  const options = { method: "DELETE" };
  const response = await fetch(`${FILES_ENDPOINT}/${fileId}`, options);

  const payload = await response.json();
  return payload.data["file_id"];
}
