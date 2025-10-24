import { supabaseClient } from "@/lib/supabase/supabase-client";
import { clientEnv } from "@/utils/client/client-env";

export async function uploadFileToSupabase(
  file: File,
  path: string,
  bucketName: string,
): Promise<string> {
  const { error } = await supabaseClient.storage
    .from(bucketName)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(`Upload file failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabaseClient.storage.from(bucketName).getPublicUrl(path);
  return publicUrl;
}

export async function removeFileFromSupabase(
  path: string,
  bucketName: string,
): Promise<void> {
  const { error } = await supabaseClient.storage
    .from(bucketName)
    .remove([path]);
  if (error) throw new Error(`Remove file failed: ${error.message}`);
}

export async function removeFilesFromSupabase(
  paths: string[],
  bucketName: string,
): Promise<void> {
  const { error } = await supabaseClient.storage
    .from(bucketName)
    .remove(paths);
  if (error) throw new Error(`Remove files failed: ${error.message}`);
}