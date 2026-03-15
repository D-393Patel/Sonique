import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

import {
  PrismaClient,
  type VoiceCategory,
} from "../src/generated/prisma/client";

import { CANONICAL_SYSTEM_VOICE_NAMES } from "../src/features/voices/data/voice-scoping";

const SYSTEM_VOICES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "system-voices",
);

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_BUCKET_NAME: z.string().min(1),
});

const env = envSchema.parse(process.env);

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

interface VoiceMetadata {
  description: string;
  category: VoiceCategory;
  language: string;
}

const systemVoiceMetadata: Record<string, VoiceMetadata> = {
  Aaron: {
    description: "Soothing and calm, like a self-help audiobook narrator",
    category: "AUDIOBOOK",
    language: "en-US",
  },
  Abigail: {
    description: "Friendly and conversational with a warm, approachable tone",
    category: "CONVERSATIONAL",
    language: "en-GB",
  },
  Anaya: {
    description: "Polite and professional, suited for customer service",
    category: "CUSTOMER_SERVICE",
    language: "en-IN",
  },
  Andy: {
    description: "Versatile and clear, a reliable all-purpose narrator",
    category: "GENERAL",
    language: "en-US",
  },
  Archer: {
    description: "Laid-back and reflective with a steady storytelling pace",
    category: "NARRATIVE",
    language: "en-US",
  },
  Brian: {
    description: "Professional and helpful with a clear customer support tone",
    category: "CUSTOMER_SERVICE",
    language: "en-US",
  },
  Chloe: {
    description: "Bright and bubbly with a cheerful personality",
    category: "CORPORATE",
    language: "en-AU",
  },
  Dylan: {
    description: "Thoughtful and intimate, like a late-night conversation",
    category: "GENERAL",
    language: "en-US",
  },
  Emmanuel: {
    description: "Nasally and quirky cartoon-like quality",
    category: "CHARACTERS",
    language: "en-US",
  },
  Ethan: {
    description: "Polished and warm studio-quality delivery",
    category: "VOICEOVER",
    language: "en-US",
  },
  Evelyn: {
    description: "Warm Southern charm with heartfelt tone",
    category: "CONVERSATIONAL",
    language: "en-US",
  },
  Gavin: {
    description: "Calm and reassuring meditation style",
    category: "MEDITATION",
    language: "en-US",
  },
  Gordon: {
    description: "Encouraging motivational voice",
    category: "MOTIVATIONAL",
    language: "en-US",
  },
  Ivan: {
    description: "Deep cinematic movie-character presence",
    category: "CHARACTERS",
    language: "ru-RU",
  },
  Laura: {
    description: "Authentic conversational Midwestern tone",
    category: "CONVERSATIONAL",
    language: "en-US",
  },
  Lucy: {
    description: "Direct professional phone manner",
    category: "CUSTOMER_SERVICE",
    language: "en-US",
  },
  Madison: {
    description: "Energetic podcast style voice",
    category: "PODCAST",
    language: "en-US",
  },
  Marisol: {
    description: "Confident persuasive advertising voice",
    category: "ADVERTISING",
    language: "en-US",
  },
  Meera: {
    description: "Friendly clear service-oriented tone",
    category: "CUSTOMER_SERVICE",
    language: "en-IN",
  },
  Walter: {
    description: "Old raspy wise grandfather tone",
    category: "NARRATIVE",
    language: "en-US",
  },
};

async function readSystemVoiceAudio(name: string) {
  const filePath = path.join(SYSTEM_VOICES_DIR, `${name}.wav`);
  const buffer = Buffer.from(await fs.readFile(filePath));
  return { buffer, contentType: "audio/wav" };
}

async function uploadSystemVoiceAudio({
  key,
  buffer,
  contentType,
}: {
  key: string;
  buffer: Buffer;
  contentType: string;
}) {
  const { error } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME)
    .upload(key, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
}

async function seedSystemVoice(name: string) {
  const { buffer, contentType } = await readSystemVoiceAudio(name);

  const existingSystemVoice = await prisma.voice.findFirst({
    where: {
      variant: "SYSTEM",
      name,
    },
    select: { id: true },
  });

  if (existingSystemVoice) {
    const storageKey = `voices/system/${existingSystemVoice.id}`;
    const meta = systemVoiceMetadata[name];

    await uploadSystemVoiceAudio({
      key: storageKey,
      buffer,
      contentType,
    });

    await prisma.voice.update({
      where: { id: existingSystemVoice.id },
      data: {
        r2ObjectKey: storageKey,
        ...(meta && {
          description: meta.description,
          category: meta.category,
          language: meta.language,
        }),
      },
    });

    return;
  }

  const meta = systemVoiceMetadata[name];

  const voice = await prisma.voice.create({
    data: {
      name,
      variant: "SYSTEM",
      orgId: null,
      ...(meta && {
        description: meta.description,
        category: meta.category,
        language: meta.language,
      }),
    },
    select: { id: true },
  });

  const storageKey = `voices/system/${voice.id}`;

  try {
    await uploadSystemVoiceAudio({
      key: storageKey,
      buffer,
      contentType,
    });

    await prisma.voice.update({
      where: { id: voice.id },
      data: {
        r2ObjectKey: storageKey,
      },
    });
  } catch (error) {
    await prisma.voice
      .delete({
        where: { id: voice.id },
      })
      .catch(() => {});

    throw error;
  }
}

async function main() {
  console.log(
    `Seeding ${CANONICAL_SYSTEM_VOICE_NAMES.length} system voices...`,
  );

  for (const name of CANONICAL_SYSTEM_VOICE_NAMES) {
    console.log(`- ${name}`);
    await seedSystemVoice(name);
  }

  console.log("System voice seed completed.");
}

main()
  .catch((error) => {
    console.error("Failed to seed system voices:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });