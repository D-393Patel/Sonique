"use client";

import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { useTRPC } from "@/trpc/client";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AudioLines, AudioWaveform, Clock } from "lucide-react";
import Link from "next/link";

export function SettingsPanelHistory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: generations } = useSuspenseQuery(
    trpc.generations.getAll.queryOptions()
  );

  // ✅ DELETE MUTATION
  const deleteMutation = useMutation(
    trpc.generations.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.generations.getAll.queryKey(),
        });
      },
    })
  );

  if (!generations.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8">
        <div className="relative flex w-25 items-center justify-center">
          <div className="absolute left-0 -rotate-30 rounded-full bg-muted p-3">
            <AudioLines className="size-4 text-muted-foreground" />
          </div>

          <div className="relative z-10 rounded-full bg-foreground p-3">
            <AudioWaveform className="size-4 text-background" />
          </div>

          <div className="absolute right-0 rotate-30 rounded-full bg-muted p-3">
            <Clock className="size-4 text-muted-foreground" />
          </div>
        </div>

        <p className="font-semibold tracking-tight text-foreground">
          No generations yet
        </p>

        <p className="max-w-48 text-center text-xs text-muted-foreground">
          Generate some audio and it will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {generations.map((generation) => (
        <div
          key={generation.id}
          className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted"
        >
          {/* CLICKABLE CONTENT */}
          <Link
            href={`/text-to-speech/${generation.id}`}
            className="flex flex-1 items-center gap-3 min-w-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-sm font-medium text-foreground">
                {generation.text}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <VoiceAvatar
                  seed={generation.voiceId ?? generation.voiceName}
                  name={generation.voiceName}
                  className="shrink-0"
                />
                <span>{generation.voiceName}</span>
                <span>&middot;</span>
                <span>
                  {formatDistanceToNow(
                    new Date(generation.createdAt),
                    { addSuffix: true }
                  )}
                </span>
              </div>
            </div>
          </Link>

          {/* DELETE BUTTON */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const confirmDelete = confirm("Delete this audio?");
              if (!confirmDelete) return;

              deleteMutation.mutate({ id: generation.id });
            }}
            className="ml-2 text-xs text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}