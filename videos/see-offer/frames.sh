#!/usr/bin/env bash
# Pre-extracts frames for the canvas renderer:
#   .frames-src/fNNNN.jpg  — the take
#   .frames-cut/fNNNN.webp — the speaker cut out (alpha from the mattes), only where scenes need it
# matte-a covers 0–7.24 s (frames 1–181), matte-b covers 8.8–11.8 s (frames 221–295).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .frames-src .frames-cut
[ -f .frames-src/f0001.jpg ] || ffmpeg -v error -i assets/source.mp4 -q:v 2 .frames-src/f%04d.jpg
cut() {  # cut START DUR MATTE START_NUMBER
  ffmpeg -v error -y -ss "$1" -t "$2" -i assets/source.mp4 -i "$3" -filter_complex \
    "[1:v]format=gray,erosion,gblur=sigma=1.2[m];[0:v][m]alphamerge,format=yuva420p" \
    -c:v libwebp -quality 85 -start_number "$4" .frames-cut/f%04d.webp
}
[ -f .frames-cut/f0050.webp ] || cut 0 7.24 assets/matte-a.mp4 1
[ -f .frames-cut/f0221.webp ] || cut 8.8 3.0 assets/matte-b.mp4 221
echo "src $(ls .frames-src | wc -l)  cut $(ls .frames-cut | wc -l)"
