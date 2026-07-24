import { parseBuffer } from "music-metadata";

const CENTS_PER_THOUSAND_CHARACTERS = 30;

export async function getGeneratedAudioMetadata(buffer: Buffer) {
  try {
    const metadata = await parseBuffer(buffer, { mimeType: "audio/wav" }, {
      duration: true,
    });

    return {
      audioDurationSec: metadata.format.duration ?? null,
      audioSizeBytes: buffer.byteLength,
    };
  } catch {
    return {
      audioDurationSec: null,
      audioSizeBytes: buffer.byteLength,
    };
  }
}

export function estimateGenerationCostCents(text: string) {
  return (text.length / 1000) * CENTS_PER_THOUSAND_CHARACTERS;
}
