"use client";

import {
  BookOpen,
  Smile,
  Mic,
  Languages,
  Clapperboard,
  Gamepad2,
  Podcast,
  Brain,
  Shuffle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useState } from "react";

import type { LucideIcon } from "lucide-react";

type Suggestion = {
  label: string;
  prompt: string;
  icon: LucideIcon;
  category: "Creative" | "Fun" | "Professional";
};

const PROMPT_SUGGESTIONS: Suggestion[] = [
  {
    label: "Narrate a story",
    prompt:
      "In a village tucked between mist-covered mountains, there lived an old clockmaker whose clocks never told the right time — but they always told the truth...",
    icon: BookOpen,
    category: "Creative",
  },
  {
    label: "Tell a silly joke",
    prompt:
      "Why don't scientists trust atoms? Because they make up everything...",
    icon: Smile,
    category: "Fun",
  },
  {
    label: "Record an advertisement",
    prompt:
      "Introducing BrightBean Coffee — the smoothest roast you'll ever taste...",
    icon: Mic,
    category: "Professional",
  },
  {
    label: "Speak in different languages",
    prompt:
      "Hello and welcome! Bonjour, Hola, Guten Tag, Ciao...",
    icon: Languages,
    category: "Creative",
  },
  {
    label: "Dramatic movie scene",
    prompt:
      "The rain hammered against the window as she turned to face him...",
    icon: Clapperboard,
    category: "Creative",
  },
  {
    label: "Game character",
    prompt:
      "Listen up, adventurer. The realm of Ashenvale is crumbling...",
    icon: Gamepad2,
    category: "Fun",
  },
  {
    label: "Podcast intro",
    prompt:
      "Hey everyone, welcome back to another episode...",
    icon: Podcast,
    category: "Professional",
  },
  {
    label: "Meditation guide",
    prompt:
      "Close your eyes and take a deep breath in...",
    icon: Brain,
    category: "Professional",
  },
];

export function PromptSuggestions({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  const [items, setItems] = useState(PROMPT_SUGGESTIONS);

  // 🔀 Shuffle suggestions
  const shuffle = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Get started with
        </p>

        <button
          onClick={shuffle}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <Shuffle className="size-3.5" />
          Shuffle
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {items.map((suggestion) => (
          <Badge
            key={suggestion.label}
            variant="outline"
            className="cursor-pointer gap-1.5 py-1 px-2.5 text-xs rounded-md 
                       hover:bg-accent hover:scale-105 transition-all duration-150"
            onClick={() => onSelect(suggestion.prompt)}
            title={suggestion.prompt} // 👈 preview on hover
          >
            <suggestion.icon className="size-3.5 shrink-0" />
            {suggestion.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}