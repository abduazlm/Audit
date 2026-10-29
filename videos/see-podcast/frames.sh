#!/usr/bin/env bash
# Pre-extracts frames for the canvas renderer:
#   .frames-src/fNNNN.jpg  — the take
#   .frames-cut/fNNNN.webp — the speaker cut out (alpha from the mattes), only where scenes need it
# matte-a covers 0–3.8 s (frames 1–95), matte-b covers 4.9–9.5 s (frames 124–238).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .frames-src .frames-cut
[ -f .frames-src/f0001.jpg ] || ffmpeg -v error -i assets/source.mp4 -q:v 2 .frames-src/f%04d.jpg
cut() {  # cut START DUR MATTE START_NUMBER
  ffmpeg -v error -y -ss "$1" -t "$2" -i assets/source.mp4 -i "$3" -filter_complex \
    "[1:v]format=gray,erosion,gblur=sigma=1.2[m];[0:v][m]alphamerge,format=yuva420p" \
    -c:v libwebp -quality 85 -start_number "$4" .frames-cut/f%04d.webp
}
[ -f .frames-cut/f0050.webp ] || cut 0 3.8 assets/matte-a.mp4 1
[ -f .frames-cut/f0150.webp ] || cut 4.9 4.6 assets/matte-b.mp4 124
echo "src $(ls .frames-src | wc -l)  cut $(ls .frames-cut | wc -l)"
