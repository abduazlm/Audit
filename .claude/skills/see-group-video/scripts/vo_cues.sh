#!/usr/bin/env bash
# Print speech segments of a voiceover (start–end, seconds) by detecting pauses.
# usage: vo_cues.sh voice.mp3 [noise_dB=-38] [min_pause_s=0.12]
set -euo pipefail
f=$1; n=${2:--38}; d=${3:-0.12}
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
echo "duration: $dur s"
ffmpeg -hide_banner -i "$f" -af "silencedetect=n=${n}dB:d=${d}" -f null - 2>&1 \
 | grep -oE "silence_(start|end): [0-9.]+" | awk -v dur="$dur" '
   BEGIN { s = 0; i = 1 }
   /silence_start/ { e = $2; if (e - s > 0.05) printf "%2d. speech %6.2f – %6.2f  (%.2f s)\n", i++, s, e, e - s }
   /silence_end/   { s = $2 }
   END { if (dur - s > 0.05) printf "%2d. speech %6.2f – %6.2f  (%.2f s)\n", i, s, dur, dur - s }'
