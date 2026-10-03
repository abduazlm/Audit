# Pipeline details & gotchas

## Rendering
- Playwright is installed globally: `PW_PATH=$(npm root -g)/playwright node render.mjs ...`. Never run
  `playwright install`; Chromium is at `/opt/pw-browsers`.
- `render.mjs` serves the folder over a tiny local HTTP server (fonts don't load from `file://`) and
  launches Chromium with `--no-proxy-server` (otherwise the sandbox proxy breaks `127.0.0.1`).
- It waits for `window.READY` (logo decoded + fonts loaded) before the first frame. Any new asset must
  be awaited there, or early frames render with fallback fonts.
- Capture mode (`?capture`) sizes the canvas CSS to its pixel size — without it, screenshots come out
  at the preview size (this once produced a 1280×720 "1080p" file).
- `fonts.css` URLs are relative to the CSS file (`url(Montserrat-latin.woff2)`), not to the page.
- Stills are named by JS number formatting: `t=15` → `vertical-15.png`, not `15.0`.
- Canvas throws on negative `arc` radius — clamp with `Math.max(0, r)` when animating radii.

## Animation conventions
- Everything is a pure function of `t`: `prog(t, a, b)` → 0..1, eased with `eOut`, `eInOut`, `eBack`,
  `eExpo`. No state between frames, so any frame can be rendered alone and seeking works.
- Layout uses `U = min(W,H)/1080` and `VERTICAL`; `fit(text, weight, max, family, maxW)` shrinks text
  to fit. Vertical safe area: keep text inside ~8% side margins; Instagram UI covers the bottom ~15%
  and top ~8% — keep CTAs above the bottom bars.
- Draw order matters (painter's algorithm): background → scene → overlays → fades. A full-screen
  background drawn after a scene hides it.
- Rack focus: `ctx.filter = 'blur(Npx)'` inside a `save()/restore()` block.
- Letters filled with a moving pattern: draw the pattern on an offscreen canvas, then
  `globalCompositeOperation = 'destination-in'` with the logo slice.

## Voice
- `scripts/vo_cues.sh` thresholds: -38 dB / 0.12 s works for clean TTS; raise to -45 dB to find the
  real tail, lower min pause to split comma groups. Real microphone recordings may need -32 dB and
  a denoise (`afftdn`) in the VO chain.
- faster-whisper installs via pip but Hugging Face downloads are blocked by the sandbox proxy.

## Sound
- `sound.py` building blocks: `tick`, `whoosh(dur, rise)`, `thump`, `pop(freq)`, `glitch`, `riser`,
  `impact`, `shimmer`, `ding`, `beep`, `shutter`; `place(sig, t, gain, pan)`. Keep SFX gains 0.1–0.35
  so they sit under the voice.
- Mix chain: VO → highpass 80 Hz → compressor → delay `T.vo` → stereo; music `volume=0.24` →
  `sidechaincompress` keyed by the VO; `amix` → `loudnorm I=-14 TP=-1.5`.
- Check balance by measuring VO alone vs ducked music alone with `ebur128` (use `anullsink` for the
  unused branch): aim for ≥10 LU gap.
- `music.py`: change `DROP` to the logo/impact time so a downbeat lands on it; `DUR` = video length.
  Progression Am9–Fmaj7–C–G6; sections: intro pad (<2.9 s), build (kick+bass), half-bar gap before
  the drop, groove (kick, clap, hats, offbeat bass, plucks, pumping pad), clap roll into the CTA wipe,
  final chord at `END_GROOVE`.
