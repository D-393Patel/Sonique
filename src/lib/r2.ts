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

//////////////////////////////////////////////////////
// 🔧 FIX: Normalize key (handles .wav automatically)
//////////////////////////////////////////////////////
function normalizeKey(key: string): string {
  return key.endsWith(".wav") ? key : `${key}.wav`;
}

//////////////////////////////////////////////////////
// 📤 UPLOAD AUDIO
//////////////////////////////////////////////////////
export async function uploadAudio({
  buffer,
  key,
  contentType = "audio/wav",
}: UploadAudioOptions): Promise<void> {
  const finalKey = normalizeKey(key);

  const { error } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME)
    .upload(finalKey, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

//////////////////////////////////////////////////////
// 🗑️ DELETE AUDIO
//////////////////////////////////////////////////////
export async function deleteAudio(key: string): Promise<void> {
  const finalKey = normalizeKey(key);

  const { error } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME)
    .remove([finalKey]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

//////////////////////////////////////////////////////
// 🔗 GET SIGNED URL (🔥 THIS FIXES YOUR ERROR)
//////////////////////////////////////////////////////
export async function getSignedAudioUrl(key: string): Promise<string> {
  const finalKey = normalizeKey(key);

  const { data, error } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME)
    .createSignedUrl(finalKey, 3600);

  if (error) {
    throw new Error(`Signed URL failed: ${error.message}`);
  }

  if (!data?.signedUrl) {
    throw new Error("No signed URL returned");
  }

  return data.signedUrl;
}