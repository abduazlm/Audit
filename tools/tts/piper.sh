#!/usr/bin/env bash
# Free offline Russian voice-over with Piper (no account, no API key).
# usage: tools/tts/piper.sh TEXT_FILE OUT.wav [VOICE] [SPEED]
#   VOICE: ruslan (default) | dmitri | irina | denis      SPEED: length scale, >1 slower (default 1.08)
# The model (~63 MB) is downloaded once to ~/.cache/piper. Output: 48 kHz mono, cleaned and at -16 LUFS.
set -euo pipefail
TXT=$1 OUT=$2 VOICE=${3:-ruslan} SPEED=${4:-1.08}
python3 -c "import piper" 2>/dev/null || pip install -q piper-tts
M=~/.cache/piper/ru_RU-$VOICE-medium; mkdir -p ~/.cache/piper
for e in onnx onnx.json; do
  [ -s "$M.$e" ] || curl -sSL -o "$M.$e" "https://huggingface.co/rhasspy/piper-voices/resolve/main/ru/ru_RU/$VOICE/medium/ru_RU-$VOICE-medium.$e"
done
TMP=$(mktemp --suffix .wav)
python3 -m piper -m "$M.onnx" --length-scale "$SPEED" --sentence-silence 0.35 -f "$TMP" < "$TXT"
ffmpeg -loglevel error -y -i "$TMP" -af "highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5" -ar 48000 "$OUT"
rm -f "$TMP"; echo "$OUT"
