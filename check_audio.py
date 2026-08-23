import os
import wave
import contextlib

# Check mp3 durations using a small script
from pathlib import Path

audio_dir = Path("demo_media/audio")
for f in sorted(audio_dir.glob("*.mp3")):
    size = f.stat().st_size
    print(f"{f.name}: {size} bytes")
