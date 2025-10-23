import { supabaseClient  } from "@/lib/supabase/supabase-client";
import { clientEnv } from "@/utils/client/client-env";


  export async function uploadFileToSupabase(file: File, path: string): Promise<string> {
    const bucketName = clientEnv.NEXT_PUBLIC_FILE_BUCKET_NAME;
    const { error } = await supabaseClient.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
  
    if (error) throw new Error(`Upload file failed: ${error.message}`);
  
    const { data: { publicUrl } } = supabaseClient.storage.from(bucketName).getPublicUrl(path);
    return publicUrl;
  }

export async function removeFileFromSupabase(path: string): Promise<void> {
  const bucketName = clientEnv.NEXT_PUBLIC_FILE_BUCKET_NAME;
  const { error } = await supabaseClient.storage.from(bucketName).remove([path]);
  if (error) throw new Error(`Remove file failed: ${error.message}`);
}

