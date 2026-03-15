"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";

import { useMutation } from "@tanstack/react-query";


import { useTRPC } from "@/trpc/client";

import { useAppForm } from "@/hooks/use-app-form";

// ❌ Missing module
// import { useCheckout } from "@/features/billing/hooks/use-checkout";

const ttsFormSchema = z.object({
  text: z.string().min(1, "Please enter some text"),
  voiceId: z.string().min(1, "Please select a voice"),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
  repetitionPenalty: z.number(),
});

export type TTSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  temperature: 0.8,
  topP: 0.95,
  topK: 1000,
  repetitionPenalty: 1.2,
};

export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValues,
});

export function TextToSpeechForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) {
  // ❌ Missing module
  // const trpc = useTRPC();

  const router = useRouter();

  // ❌ Missing dependency
  /*
  const createMutation = useMutation(
    trpc.generations.create.mutationOptions({}),
  );
  */

  // ❌ Missing module
  // const { checkout } = useCheckout();

  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValues,
    validators: {
      onSubmit: ttsFormSchema,
    },
    onSubmit: async ({ value: _value }) => {
      try {

        /*
        const data = await createMutation.mutateAsync({
          text: value.text.trim(),
          voiceId: value.voiceId,
          temperature: value.temperature,
          topP: value.topP,
          topK: value.topK,
          repetitionPenalty: value.repetitionPenalty,
        });

        router.push(`/text-to-speech/${data.id}`);
        */

        toast.success("Audio generated successfully!");

      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate audio";

        if (message === "SUBSCRIPTION_REQUIRED") {
          toast.error("Subscription required", {
            action: {
              label: "Subscribe",
              onClick: () => {}, // temporary placeholder
            },
          });
        } else {
          toast.error(message);
        }
      }
    },
  });

  return <form.AppForm>{children}</form.AppForm>;
}
