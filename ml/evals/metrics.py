from __future__ import annotations

import audioop
import contextlib
import math
import wave
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class AudioMetrics:
    duration_seconds: float
    sample_rate_hz: int
    channels: int
    sample_width_bytes: int
    rms: float
    peak: int
    clipping_ratio: float
    loudness_dbfs: float
    file_size_bytes: int


def compute_wav_metrics(path: str | Path) -> AudioMetrics:
    wav_path = Path(path)

    with contextlib.closing(wave.open(str(wav_path), "rb")) as wav_file:
        channels = wav_file.getnchannels()
        sample_width = wav_file.getsampwidth()
        sample_rate = wav_file.getframerate()
        frame_count = wav_file.getnframes()
        frames = wav_file.readframes(frame_count)

    duration_seconds = frame_count / sample_rate if sample_rate else 0.0
    rms = float(audioop.rms(frames, sample_width)) if frames else 0.0
    peak = audioop.max(frames, sample_width) if frames else 0
    max_amplitude = float(2 ** (8 * sample_width - 1) - 1)
    loudness_dbfs = 20 * math.log10(max(rms, 1.0) / max_amplitude)
    clipping_ratio = _clipping_ratio(frames, sample_width, max_amplitude)

    return AudioMetrics(
        duration_seconds=duration_seconds,
        sample_rate_hz=sample_rate,
        channels=channels,
        sample_width_bytes=sample_width,
        rms=rms,
        peak=peak,
        clipping_ratio=clipping_ratio,
        loudness_dbfs=loudness_dbfs,
        file_size_bytes=wav_path.stat().st_size,
    )


def _clipping_ratio(frames: bytes, sample_width: int, max_amplitude: float) -> float:
    if not frames:
        return 0.0

    clipped = 0
    total = 0
    threshold = int(max_amplitude * 0.995)

    for index in range(0, len(frames), sample_width):
        sample = int.from_bytes(
            frames[index : index + sample_width],
            byteorder="little",
            signed=True,
        )
        total += 1
        if abs(sample) >= threshold:
            clipped += 1

    return clipped / total if total else 0.0
