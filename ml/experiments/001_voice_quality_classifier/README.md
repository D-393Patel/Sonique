# Experiment 001: Voice Quality Classifier

Goal: train a small PyTorch baseline that predicts whether a generated or
uploaded voice sample is usable for Sonique.

This is intentionally modest: it gives the project a real model-training
artifact without pretending to solve full TTS quality assessment in one pass.

## Labels

Create a CSV with:

```csv
path,label
samples/good_001.wav,good
samples/noisy_001.wav,bad
```

Recommended negative samples:

- clipped audio,
- low-volume audio,
- recordings shorter than 10 seconds,
- high-noise microphone input,
- corrupted or silent WAV files.

## Run

```bash
pip install -r ml/requirements-ml.txt
python ml/experiments/001_voice_quality_classifier/train.py --data ml/experiments/001_voice_quality_classifier/labels.csv
```

## Metrics To Report

- validation accuracy,
- false accept rate for bad audio,
- false reject rate for good audio,
- confusion matrix,
- examples of failure cases.
