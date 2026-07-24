# Sonique ML Engineering Relevance Roadmap

This roadmap is tailored for Machine Learning Engineer Intern roles that value
research, PyTorch/Hugging Face, model evaluation, fine-tuning, and production
ownership. Sonique is already a strong AI product; the goal is to make the
repository show model-building depth, not only API integration.

## Current Strengths

- End-to-end AI product with authentication, teams, billing, storage, and deploy.
- Voice cloning and text-to-speech workflow with custom voice upload.
- Production-minded backend using Next.js, tRPC, Prisma, PostgreSQL, Supabase
  Storage, Sentry, and Vercel deployment.
- Real user-facing constraints: latency, file validation, storage reliability,
  access control, and paid usage tracking.

## Main Gap For ML Research Roles

The current repository looks mostly like an AI SaaS that calls an external TTS
service. For research-first ML internships, this must be expanded with visible
evidence of:

- model training or adaptation,
- PyTorch/Hugging Face usage,
- evaluation benchmarks,
- experiment tracking,
- failure analysis,
- latency, memory, and cost measurement.

## Highest Impact Additions

### 1. TTS Evaluation Harness

Build an offline benchmark runner that generates audio for a fixed prompt suite
and computes objective quality, latency, and robustness metrics.

Suggested folder:

```text
ml/
  evals/
    prompts.jsonl
    run_tts_eval.py
    metrics.py
    report.md
```

Metrics to include:

- latency p50, p90, p99,
- generation failure rate,
- audio duration vs text length,
- loudness normalization,
- clipping percentage,
- signal-to-noise proxy,
- speaker similarity if reference voice embeddings are available,
- word error rate using Whisper transcription for intelligibility.

Why this helps:

This maps directly to the JD keywords: evaluation harnesses, noisy inputs,
failure investigation, latency, robustness, and measurable improvement.

### 2. Fine-Tuning Or Adaptation Notebook

Add a small PyTorch/Hugging Face experiment that fine-tunes or adapts an
open-weight speech model on a small curated dataset.

Possible directions:

- speaker verification model fine-tuning,
- emotion or voice-style classifier,
- audio quality classifier,
- TTS prompt-quality ranker,
- LoRA/PEFT experiment on a lightweight audio or language model.

Suggested folder:

```text
ml/
  experiments/
    001_voice_quality_classifier/
      train.py
      dataset.md
      config.yaml
      results.md
```

Why this helps:

The JD explicitly says they prefer candidates who train, debug, and evaluate
models, not just consume AI APIs.

### 3. Synthetic Data Generation

Create scripts to generate noisy and adversarial TTS test cases.

Examples:

- mixed Hindi-English text,
- abbreviations and numbers,
- punctuation-heavy prompts,
- long-form audiobook text,
- noisy uploaded voice samples,
- short, clipped, or low-volume audio,
- prompt sets designed to trigger pronunciation failures.

Suggested output:

```text
ml/data/tts_eval_prompts.jsonl
ml/data/audio_augmentations.md
```

Why this helps:

This directly matches synthetic data generation, data augmentation, adversarial
evaluation, and real-world robustness.

### 4. Research Report

Write a short paper-style report inside the repo.

Suggested file:

```text
docs/research-report.md
```

Recommended structure:

- Problem framing
- Baseline system
- Literature review
- Dataset and benchmark design
- Experiments
- Metrics
- Failure analysis
- Improvements
- Production tradeoffs
- Future work

Why this helps:

The role asks for people who read papers, reproduce ideas, design experiments,
and own the full lifecycle.

### 5. Model Observability In The App

Store generation metadata in the database and expose a simple admin dashboard.

Useful fields:

- model/provider version,
- prompt length,
- voice id,
- latency milliseconds,
- audio duration,
- file size,
- error category,
- retry count,
- estimated cost.

Why this helps:

It turns Sonique into an evaluation-driven production AI system, which is much
closer to the internship description.

## Best Resume Positioning

Use Sonique as:

> AI voice generation platform with custom voice cloning, evaluation-driven TTS
> benchmarking, and production deployment.

Strong bullet examples:

- Built an end-to-end AI voice platform for text-to-speech and custom voice
  cloning using Next.js, tRPC, PostgreSQL, Supabase Storage, and Vercel.
- Designed a TTS evaluation harness measuring latency, failure rate, loudness,
  clipping, intelligibility, and prompt robustness across noisy real-world
  inputs.
- Added synthetic prompt and audio augmentation suites to test multilingual,
  punctuation-heavy, long-form, and low-quality voice inputs.
- Prototyped PyTorch/Hugging Face experiments for voice quality classification
  and model adaptation, documenting baselines, failure modes, and improvements.
- Instrumented production generation flows with latency, cost, and quality
  metadata for continuous model improvement.

## Priority Order

1. Add the evaluation harness and prompt dataset.
2. Add a research report with baseline results and failure analysis.
3. Add one small PyTorch/Hugging Face training experiment.
4. Add generation metadata tracking in Prisma and the app.
5. Add screenshots, demo audio, and benchmark tables to the README.

This order gives the fastest jump in relevance because it attacks the biggest
concern first: proving that the project is not only an API wrapper.
