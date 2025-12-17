"use client";

// API endpoints now go through Next.js server API routes
const FILES_ENDPOINT = "/api/storage/files";

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const options = { method: "POST", body: formData };
  const response = await fetch(FILES_ENDPOINT, options);

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  const payload = await response.json();
  return payload["file_id"];
}

export async function downloadFile(fileId: string): Promise<File> {
  const response = await fetch(`${FILES_ENDPOINT}/${fileId}`);

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

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

  if (!response.ok) {
    throw new Error(`Failed to replace file: ${response.statusText}`);
  }

  const payload = await response.json();
  return payload["file_id"];
}

export async function deleteFile(fileId: string): Promise<string> {
  const options = { method: "DELETE" };
  const response = await fetch(`${FILES_ENDPOINT}/${fileId}`, options);

  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }

  const payload = await response.json();
  return payload["file_id"];
}
