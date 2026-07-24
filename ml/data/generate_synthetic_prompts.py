from __future__ import annotations

import argparse
import json
import random
from pathlib import Path


NOISY_PREFIXES = [
    "uh, ",
    "please read clearly: ",
    "verification phrase - ",
    "",
]

NOISY_SUFFIXES = [
    " Repeat once if needed.",
    " Time: 09:30 AM.",
    " Ref ID: HV-2047.",
    "",
]

CODE_SWITCH_REPLACEMENTS = {
    "today": "aaj",
    "request": "request",
    "payment": "payment",
    "document": "document",
    "next step": "next step kya hai",
}


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate noisy and multilingual Sonique evaluation prompts.",
    )
    parser.add_argument("--input", default="ml/data/seed_prompts.jsonl")
    parser.add_argument("--output", default="ml/evals/synthetic_prompts.jsonl")
    parser.add_argument("--variants", type=int, default=4)
    parser.add_argument("--seed", type=int, default=393)
    args = parser.parse_args()

    random.seed(args.seed)
    seeds = load_jsonl(Path(args.input))
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    for item in seeds:
        for index in range(args.variants):
            rows.append(
                {
                    "id": f"{item['domain']}_{index + 1}",
                    "category": "synthetic",
                    "source_domain": item["domain"],
                    "text": augment_text(item["text"]),
                },
            )

    with output_path.open("w", encoding="utf-8") as file:
        for row in rows:
            file.write(json.dumps(row, ensure_ascii=True) + "\n")

    print(f"Wrote {len(rows)} prompts to {output_path}")


def load_jsonl(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8") as file:
        return [json.loads(line) for line in file if line.strip()]


def augment_text(text: str) -> str:
    augmented = text
    for source, target in CODE_SWITCH_REPLACEMENTS.items():
        if source in augmented and random.random() < 0.5:
            augmented = augmented.replace(source, target)

    if random.random() < 0.5:
        augmented = augmented.upper() if random.random() < 0.25 else augmented

    return f"{random.choice(NOISY_PREFIXES)}{augmented}{random.choice(NOISY_SUFFIXES)}"
