# Sonique ML Experiments

This folder contains research and evaluation artifacts that make Sonique more
than an API-first AI application.

## TTS Evaluation Harness

Run a dry evaluation to verify the harness and generate a report without
calling the TTS API:

```bash
python ml/evals/run_tts_eval.py --dry-run
```

Run against the Chatterbox API:

```bash
$env:CHATTERBOX_API_URL="https://your-chatterbox-api.example.com"
$env:CHATTERBOX_API_KEY="..."
$env:SONIQUE_EVAL_VOICE_KEY="voices/system/example.wav"
python ml/evals/run_tts_eval.py
```

The harness writes:

- `ml/evals/runs/latest/results.csv`
- `ml/evals/runs/latest/report.md`
- generated audio files under `ml/evals/runs/latest/audio`

The prompt suite covers clean text, multilingual text, punctuation-heavy text,
long-form narration, abbreviations, and identity-verification style prompts.

## Synthetic Prompt Generation

```bash
python ml/data/generate_synthetic_prompts.py
```

This creates `ml/evals/synthetic_prompts.jsonl` with noisy and code-switched
variants for robustness testing.

## PyTorch Baseline

`ml/experiments/001_voice_quality_classifier` contains a small PyTorch training
baseline for classifying voice samples as usable or unusable. It is designed as
a first model-development artifact to document training, validation metrics, and
failure cases.
