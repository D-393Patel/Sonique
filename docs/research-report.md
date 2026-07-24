# Sonique Research Report

## Problem Framing

Sonique explores controllable text-to-speech and custom voice cloning for
creator, support, and identity-style voice workflows. The research question is:
how can a production TTS system be evaluated and improved for naturalness,
robustness, latency, and cost under real user inputs?

## Baseline System

The current baseline uses a Chatterbox TTS service behind a Next.js and tRPC
application. Users select or upload a voice, generate speech from text, and the
system stores generated audio and metadata in PostgreSQL and Supabase Storage.

## Benchmark Design

The first benchmark suite is in `ml/evals/prompts.jsonl`. It covers:

- clean short prompts,
- punctuation-heavy text,
- code-switched Hindi-English text,
- long-form narration,
- identity-verification style prompts,
- abbreviations, numbers, dates, and domain-specific terms.

The evaluation runner records:

- latency,
- failure rate,
- audio duration,
- output file size,
- loudness,
- clipping ratio.

## Synthetic Data

`ml/data/generate_synthetic_prompts.py` expands seed prompts into noisy variants
for robustness testing. It introduces prefixes, suffixes, uppercase variants,
domain references, and lightweight code-switching.

## Model Development Baseline

`ml/experiments/001_voice_quality_classifier` provides a PyTorch baseline for
classifying uploaded or generated audio as usable or unusable. The baseline uses
simple audio features such as duration, sample rate, amplitude statistics, and
clipping ratio. This is a deliberately small first experiment that can be
extended with learned audio embeddings.

## Failure Modes To Investigate

- pronunciation errors on names, abbreviations, and mixed-language prompts,
- poor pacing on long-form text,
- clipping or low loudness on generated audio,
- speaker drift between reference voice and generated voice,
- timeout or high latency under long prompts,
- bad custom voice samples passing upload validation.

## Next Experiments

- Add Whisper transcription and word error rate for intelligibility.
- Add speaker embedding similarity for voice-clone consistency.
- Train the quality classifier on real accepted and rejected voice uploads.
- Compare default sampling settings against lower-latency or higher-stability
  settings.
- Add experiment tracking tables for benchmark runs and prompt-level results.

## Production Instrumentation

The application now stores generation metadata including prompt length,
provider, model version, latency, audio duration, output size, and estimated
character-based cost. These fields support monitoring, debugging, and continuous
evaluation after deployment.
