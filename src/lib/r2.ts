import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

type UploadAudioOptions = {
  buffer: Buffer;
  key: string;
  contentType?: string;
};

export async function uploadAudio({
  buffer,
  key,
  contentType = "audio/wav",
}: UploadAudioOptions): Promise<void> {
  const { error } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME)
    .upload(key, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

export async function deleteAudio(key: string): Promise<void> {
  const { error } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME)
    .remove([key]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export async function getSignedAudioUrl(key: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME)
    .createSignedUrl(key, 3600); // 1 hour

  if (error) {
    throw new Error(`Signed URL failed: ${error.message}`);
  }

  if (!data?.signedUrl) {
    throw new Error("No signed URL returned");
  }

  return data.signedUrl;
}