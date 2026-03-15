"use client";

// ❌ Missing dependency
// import { useSuspenseQuery } from "@tanstack/react-query";

// ❌ Missing module
// import { useTRPC } from "@/trpc/client";

import { TextInputPanel } from "@/features/text-to-speech/components/text-input-panel";
import { VoicePreviewPlaceholder } from "@/features/text-to-speech/components/voice-preview-placeholder";
import { SettingsPanel } from "@/features/text-to-speech/components/settings-panel";
import {
  TextToSpeechForm,
  defaultTTSValues,
  type TTSFormValues
} from "@/features/text-to-speech/components/text-to-speech-form";

// ❌ Missing module
// import { TTSVoicesProvider } from "../contexts/tts-voices-context";

export function TextToSpeechView({
  initialValues,
}: {
  initialValues?: Partial<TTSFormValues>;
}) {

  // ❌ Missing module
  // const trpc = useTRPC();

  // ❌ Missing dependency
  /*
  const {
    data: voices,
  } = useSuspenseQuery(trpc.voices.getAll.queryOptions());
  */

  // Temporary placeholders to avoid errors
  const customVoices: unknown[] = [];
  const systemVoices: unknown[] = [];

  const allVoices = [...customVoices, ...systemVoices];

  const fallbackVoiceId = (allVoices[0] as { id?: string })?.id ?? "";

  const resolvedVoiceId =
    initialValues?.voiceId &&
    allVoices.some((v) => (v as { id?: string }).id === initialValues.voiceId)
      ? initialValues.voiceId
      : fallbackVoiceId;

  const defaultValues: TTSFormValues = {
    ...defaultTTSValues,
    ...initialValues,
    voiceId: resolvedVoiceId,
  };

  return (
    <>
      {/* ❌ Provider commented because context missing */}
      {/*
      <TTSVoicesProvider value={{ customVoices, systemVoices, allVoices }}>
      */}

      <TextToSpeechForm defaultValues={defaultValues}>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col">
            <TextInputPanel />
            <VoicePreviewPlaceholder />
          </div>
          <SettingsPanel />
        </div>
      </TextToSpeechForm>

      {/* </TTSVoicesProvider> */}
    </>
  );
}
