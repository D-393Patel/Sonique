from __future__ import annotations

import argparse
import csv
import json
import os
import statistics
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from metrics import compute_wav_metrics


DEFAULT_TTS_PARAMS = {
    "temperature": 0.8,
    "top_p": 0.95,
    "top_k": 1000,
    "repetition_penalty": 1.2,
    "norm_loudness": True,
}


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run Sonique TTS quality and latency evaluation prompts.",
    )
    parser.add_argument("--prompts", default="ml/evals/prompts.jsonl")
    parser.add_argument("--out-dir", default="ml/evals/runs/latest")
    parser.add_argument("--api-url", default=os.getenv("CHATTERBOX_API_URL"))
    parser.add_argument("--api-key", default=os.getenv("CHATTERBOX_API_KEY"))
    parser.add_argument("--voice-key", default=os.getenv("SONIQUE_EVAL_VOICE_KEY"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    prompts_path = Path(args.prompts)
    out_dir = Path(args.out_dir)
    audio_dir = out_dir / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    rows = []
    for prompt in load_jsonl(prompts_path):
        row = evaluate_prompt(
            prompt=prompt,
            audio_dir=audio_dir,
            api_url=args.api_url,
            api_key=args.api_key,
            voice_key=args.voice_key,
            dry_run=args.dry_run,
        )
        rows.append(row)
        print(f"{row['id']}: {row['status']} ({row['latency_ms']} ms)")

    write_csv(out_dir / "results.csv", rows)
    write_markdown_report(out_dir / "report.md", rows)


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as file:
        return [json.loads(line) for line in file if line.strip()]


def evaluate_prompt(
    *,
    prompt: dict[str, Any],
    audio_dir: Path,
    api_url: str | None,
    api_key: str | None,
    voice_key: str | None,
    dry_run: bool,
) -> dict[str, Any]:
    started = time.perf_counter()
    base = {
        "id": prompt["id"],
        "category": prompt["category"],
        "text_length": len(prompt["text"]),
        "status": "skipped" if dry_run else "failed",
        "latency_ms": 0,
        "duration_seconds": "",
        "loudness_dbfs": "",
        "clipping_ratio": "",
        "file_size_bytes": "",
        "error": "",
    }

    if dry_run:
        return base | {"status": "dry_run"}

    if not api_url or not api_key or not voice_key:
        return base | {
            "error": "CHATTERBOX_API_URL, CHATTERBOX_API_KEY, and SONIQUE_EVAL_VOICE_KEY are required",
        }

    request = urllib.request.Request(
        url=f"{api_url.rstrip('/')}/generate",
        data=json.dumps(
            {
                **DEFAULT_TTS_PARAMS,
                "prompt": prompt["text"],
                "voice_key": voice_key,
            },
        ).encode("utf-8"),
        headers={
            "content-type": "application/json",
            "x-api-key": api_key,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            audio_bytes = response.read()
    except (urllib.error.URLError, TimeoutError) as error:
        return base | {
            "latency_ms": elapsed_ms(started),
            "error": str(error),
        }

    audio_path = audio_dir / f"{prompt['id']}.wav"
    audio_path.write_bytes(audio_bytes)
    metrics = compute_wav_metrics(audio_path)

    return base | {
        "status": "ok",
        "latency_ms": elapsed_ms(started),
        "duration_seconds": round(metrics.duration_seconds, 3),
        "loudness_dbfs": round(metrics.loudness_dbfs, 2),
        "clipping_ratio": round(metrics.clipping_ratio, 6),
        "file_size_bytes": metrics.file_size_bytes,
    }


def elapsed_ms(started: float) -> int:
    return round((time.perf_counter() - started) * 1000)


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    if not rows:
        return

    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_markdown_report(path: Path, rows: list[dict[str, Any]]) -> None:
    ok_rows = [row for row in rows if row["status"] == "ok"]
    latencies = [int(row["latency_ms"]) for row in ok_rows]
    failure_rate = 1 - (len(ok_rows) / len(rows)) if rows else 0

    lines = [
        "# Sonique TTS Evaluation Report",
        "",
        f"- Prompts: {len(rows)}",
        f"- Successful generations: {len(ok_rows)}",
        f"- Failure rate: {failure_rate:.2%}",
    ]

    if latencies:
        lines.extend(
            [
                f"- Latency p50: {percentile(latencies, 50)} ms",
                f"- Latency p90: {percentile(latencies, 90)} ms",
                f"- Mean latency: {round(statistics.mean(latencies))} ms",
            ],
        )

    lines.extend(["", "## Results", ""])
    lines.append("| Prompt | Category | Status | Latency ms | Duration s | Loudness dBFS | Clipping |")
    lines.append("| --- | --- | --- | ---: | ---: | ---: | ---: |")
    for row in rows:
        lines.append(
            f"| {row['id']} | {row['category']} | {row['status']} | {row['latency_ms']} | "
            f"{row['duration_seconds']} | {row['loudness_dbfs']} | {row['clipping_ratio']} |",
        )

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def percentile(values: list[int], p: int) -> int:
    sorted_values = sorted(values)
    index = round((len(sorted_values) - 1) * (p / 100))
    return sorted_values[index]


if __name__ == "__main__":
    main()
