from __future__ import annotations

import argparse
import csv
import random
import wave
from dataclasses import dataclass
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset


LABELS = {"bad": 0, "good": 1}


@dataclass(frozen=True)
class AudioExample:
    path: Path
    label: int


class VoiceQualityDataset(Dataset[tuple[torch.Tensor, torch.Tensor]]):
    def __init__(self, examples: list[AudioExample]):
        self.examples = examples

    def __len__(self) -> int:
        return len(self.examples)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor]:
        example = self.examples[index]
        features = extract_features(example.path)
        label = torch.tensor(example.label, dtype=torch.long)
        return features, label


class QualityClassifier(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(6, 32),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(32, 2),
        )

    def forward(self, features: torch.Tensor) -> torch.Tensor:
        return self.net(features)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train a voice quality baseline.")
    parser.add_argument("--data", required=True)
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--seed", type=int, default=393)
    args = parser.parse_args()

    random.seed(args.seed)
    torch.manual_seed(args.seed)

    examples = load_examples(Path(args.data))
    random.shuffle(examples)
    split = max(1, int(len(examples) * 0.8))
    train_examples = examples[:split]
    val_examples = examples[split:] or examples[:]

    train_loader = DataLoader(
        VoiceQualityDataset(train_examples),
        batch_size=args.batch_size,
        shuffle=True,
    )
    val_loader = DataLoader(
        VoiceQualityDataset(val_examples),
        batch_size=args.batch_size,
    )

    model = QualityClassifier()
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
    loss_fn = nn.CrossEntropyLoss()

    for epoch in range(args.epochs):
        model.train()
        for features, labels in train_loader:
            optimizer.zero_grad()
            loss = loss_fn(model(features), labels)
            loss.backward()
            optimizer.step()

        accuracy = evaluate(model, val_loader)
        print(f"epoch={epoch + 1} val_accuracy={accuracy:.3f}")


def load_examples(path: Path) -> list[AudioExample]:
    with path.open("r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return [
            AudioExample(path=Path(row["path"]), label=LABELS[row["label"]])
            for row in reader
        ]


def extract_features(path: Path) -> torch.Tensor:
    with wave.open(str(path), "rb") as wav_file:
        channels = wav_file.getnchannels()
        sample_width = wav_file.getsampwidth()
        sample_rate = wav_file.getframerate()
        frame_count = wav_file.getnframes()
        frames = wav_file.readframes(frame_count)

    samples = torch.tensor(
        [
            int.from_bytes(
                frames[index : index + sample_width],
                byteorder="little",
                signed=True,
            )
            for index in range(0, len(frames), sample_width)
        ],
        dtype=torch.float32,
    )
    if samples.numel() == 0:
        samples = torch.zeros(1)

    max_amplitude = float(2 ** (8 * sample_width - 1) - 1)
    normalized = samples / max_amplitude
    duration = frame_count / sample_rate if sample_rate else 0.0
    clipping = (normalized.abs() > 0.995).float().mean()

    return torch.tensor(
        [
            duration,
            float(sample_rate) / 48000,
            float(channels),
            normalized.abs().mean().item(),
            normalized.std().item(),
            clipping.item(),
        ],
        dtype=torch.float32,
    )


def evaluate(model: nn.Module, loader: DataLoader) -> float:
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for features, labels in loader:
            predictions = model(features).argmax(dim=1)
            correct += int((predictions == labels).sum())
            total += labels.numel()

    return correct / total if total else 0.0


if __name__ == "__main__":
    main()
