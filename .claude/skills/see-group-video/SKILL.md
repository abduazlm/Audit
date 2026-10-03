---
name: see-group-video
description: Produce branded animated videos (Instagram Reels 9:16, also 16:9) for SEE Group — the Kazakhstan creative video-marketing agency (seegroup.kz) — or for its clients, from a voiceover file to a finished MP4 with synced kinetic typography, logo animation, SFX and music. Use this skill whenever the user asks for a ролик, Reels, анимация, моушн, интро, заставка, промо-видео, анимированный логотип, «видео для инсты» for SEE Group or a client brand, sends a voiceover/озвучка to cut a video to, asks to add SFX or music to such a video, or wants to change scenes, timing, text or colors of an existing SEE Group video — even if they don't say "skill" or name the tools.
---

# SEE Group animated video

Makes short brand videos entirely in code: a deterministic `<canvas>` animation (`index.html`,
`renderFrame(t)`), rendered frame-by-frame with headless Chromium into ffmpeg, with a soundtrack of
the client's voiceover + synthesized SFX + a synthesized music bed (no licensed audio, so Instagram
won't mute it). A finished, approved reel built this way lives in `template/` — start every new
video from a copy of it; it already solves fonts, logo tinting, VO sync, ducking and rendering.

The user is a marketer, not a developer: talk in Russian, plain words, show results (video + stills),
never ask them to run commands.

## Files

- `template/index.html` — the animation. Top: params, palette `C`, easing helpers, logo slicing.
  Then the **timeline object `T`** (all scene timings in seconds) and one function per scene.
- `template/sound.py` — SFX synthesis + final mix (VO + SFX + ducked music → `assets/soundtrack.wav`).
- `template/music.py` — 120 BPM deep-house bed whose bar grid lands a drop on the logo moment.
- `template/render.mjs` — `node render.mjs vertical out.mp4` (or `horizontal`); muxes the soundtrack.
  `STILLS=1.5,4,9 STILL_DIR=dir node render.mjs vertical /dev/null` renders PNG stills only.
- `scripts/vo_cues.sh voice.mp3` — lists speech segments (start–end) by pause detection.
- `references/brand.md` — brandbook: colors, fonts, logo, metaphor, approved copy, services. **Read it
  before writing any on-screen text or choosing colors.**
- `references/pipeline.md` — technical details and gotchas (read when something breaks or when
  building a scene type not in the template).

## Workflow

1. **Set up a project folder.** Copy `template/` to `videos/<short-slug>/` at the repo root
   (`see-group-video/` is the original reel — don't overwrite it unless asked to edit it).
   Put the voiceover in `assets/voiceover.mp3`.

2. **No voiceover yet?** Write the script first. ~2.5–2.8 words/second for a calm Russian read; a
   Reel is 15–25 s. Structure that worked: hook question → brand metaphor/proof → «Это — SEE Group» →
   what we are → what we do (lead with the offer the viewer must not miss) → CTA. Give it as a table
   (phrase ↔ what's on screen) plus plain text to read, and recording tips (quiet room, one file,
   ~0.5 s pauses between blocks, «SEE Group» = «Си Груп»). Then wait for the file.

3. **Map the voice.** Run `scripts/vo_cues.sh assets/voiceover.mp3`. Match segments to the script's
   phrases (a TTS read gives clean pauses; one segment ≈ one phrase or comma-group). Speech recognition
   models usually can't be downloaded in this sandbox — pause detection is the reliable path. Inside a
   long segment, place list items proportionally to their syllable counts.

4. **Retime `T`.** Timeline time = VO time + `T.vo` (default 1.2 s lead-in for the opening visual).
   Make each visual beat land *on its word* (start an entrance 0.05–0.15 s before the word). Leave
   ~1.5 s after the last word so the handle/CTA can be read. Update the cue comment above `T`, and
   update `DUR`/timings in `sound.py` and `DUR` in `music.py` to match `T.end`.

5. **Adapt scenes and copy.** Edit scene functions for the new message; keep the brand system from
   `references/brand.md`. Each scene is a pure function of `t`, so changes stay local.

6. **Check stills before rendering.** Render 5–8 stills at key moments (entrances, transitions, final
   frame), combine them into one contact sheet with ffmpeg `hstack`, and look at it. Check: text
   fits the safe area, nothing overlaps, the layout fills the 9:16 frame (content crammed into the
   top half is a common miss), transitions don't flash an empty frame.

7. **Sound.** `python3 music.py && python3 sound.py`. Retime SFX `place(...)` calls to `T`
   (whoosh on transitions, pops on entrances, impact on the logo, click/ding on CTA). Music sits
   ~10 LU under the voice and is sidechain-ducked; the final mix is loudnormed to −14 LUFS.

8. **Render & deliver.** `PW_PATH=$(npm root -g)/playwright node render.mjs vertical <name>.mp4`
   (~1–2 min). Verify with ffprobe (1080×1920, video and audio durations equal), send the MP4 with
   SendUserFile, commit + push. Default deliverable is **9:16 only** unless 16:9 is requested.

9. **Report** in Russian: what's on screen and when, what you assumed (wording you invented, site URL,
   etc.), and 2–3 concrete options for the next tweak.

## Feedback the user has given (keep honoring it)

- No flat red backdrop behind big elements — red is an *accent* (CTA button, «не работает?»).
- The opening checkerboard + logo plate was rejected; the camera-viewfinder opening (REC, timecode,
  AF square locking, hook racking into focus) was approved.
- Don't show the logo at the very start — it is the payoff at «SEE Group».
- Messaging must not read as "personal brand only": production and SMM for companies come first,
  personal brand last.
- Videos should sell: end with directions + a clear CTA («Написать в Direct», @seegroup.kz).
- Music: original/synthesized (copyright-safe), quiet under the voice.

## Client brands

For a client video, replace `references/brand.md` facts with the client's brandbook (extract the logo
from their PDF with `pdfimages -png`; if it's a raster with an alpha `smask`, turn the mask into a
white RGBA logo with ffmpeg `geq=r=255:g=255:b=255:a='r(X,Y)'`, then find glyph boundaries by column
coverage to animate letters separately). Use Google Fonts stand-ins when brand fonts are paid, and
say so.
