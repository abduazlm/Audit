---
name: motion-reels
description: Анимационные ролики 9:16 кодом (canvas → Chromium → ffmpeg) с озвучкой, субтитрами/кинетической типографикой, плоскими персонажами, музыкой и SFX — маркетинговые кейсы, ролики для школы, подкаст-нарезки. Используй, когда нужно сделать «анимационный ролик», «рилс с анимацией», озвучить и подогнать анимацию под голос (ElevenLabs/Piper), поставить скорость 1.1, перенастроить готовый ролик под новую озвучку или повторить стиль серии «Маркетинговые кейсы», Kaliyev School, SEE Group.
---

# Motion reels (code-built 9:16 videos)

Everything is a pure function of time: `renderFrame(t)` in one `index.html`, rendered frame by frame
(`node render.mjs out.mp4`, Playwright from `$(npm root -g)/playwright`) and piped to ffmpeg with `assets/soundtrack.wav`.
Working examples to copy from (each is a complete project): `videos/mcd-monopoly`, `videos/mcd-part2`, `videos/apple-1997`
(dark flat-vector cases), `videos/kaliyev-kids` (brand-coloured kids' school reel with illustrated characters),
`videos/see-offer` and `videos/see-podcast` (kinetic type over a real take with a person cut-out), `.claude/skills/see-group-video/template`.

## Workflow
1. **Script** → short scenes (one phrase of ≤4 words on screen per scene, numbers always on screen). Verify facts of real stories (search, cite sources; never invent offers/prices).
2. **Voice.** Best: ElevenLabs text-to-speech made by the user. Give them the text with audio tags (`[serious]`, `[whispers]`, `[curious]`, `[short pause]`, `[long pause]`) and, if asked, stress marks (U+0301 after the vowel). Spell brands phonetically in Cyrillic. Free fallback: `tools/tts/piper.sh TEXT OUT.wav ruslan` (offline, robotic). No ElevenLabs API key unless the user adds `ELEVENLABS_API_KEY` to the environment secrets (never ask for keys in chat).
3. **Transcribe** the voice with `whisper … --model small --language ru --word_timestamps True` → word starts. Two stories in one file: split at the long silence (`silencedetect`).
4. **Timing in `index.html`:** `VO` = scene start times (voice start + 0.5 s lead), `K` = key-word cue times, `DURATION`. Scenes are `[VO[i]-0.3, VO[i+1]-0.3]`. Retiming to a new voice = replace `VO`, `K`, `DURATION` and the matching times in `sound.py` (timeline) and `music.py` (`DUR`, `END`).
5. **Audio:** `python3 music.py` (procedural bed, no licensed audio) then `python3 sound.py` (voice + soft SFX + music → `assets/soundtrack.wav`, loudnorm −14 LUFS). Music must not pump: compress the music bus first, duck gently (ratio 2.5, release ≥1 s), music ~10–13 LU under the voice.
6. **Speed 1.1:** `SPEED` in `render.mjs` (frame time × 1.1) and `atempo=1.1` in `sound.py`; scene times in the HTML stay in "voice time".
7. **Check:** contact sheet of stills before the full render (`STILLS=… STILL_DIR=… node render.mjs /dev/null`), then ffprobe duration and ebur128 loudness. Fix text overlaps by moving y positions, not by shrinking fonts.
8. Commit and push; send the MP4.

## Animation vocabulary (all in the example projects)
- **Words:** pop-in (scale 1.25→1 + 10 px blur, ease-out, ~0.2 s), fade/shrink out; styles: heavy caps (Montserrat 900 / Inter Tight 900), serif italic or calligraphy link words (Playfair / Great Vibes), small spaced caps labels; red-orange glow on key words (kept soft for legibility), red strike-through that draws itself, label **plates** (rounded chips with pop-in).
- **Scene changes:** fade-in with a 1.06→1 zoom, short yellow/orange flash, light-leak wash; chrome (series label, `NN / total`, thin progress line).
- **Backgrounds:** drifting grid + dust + vignette (dark cases), navy gradient with faint node network (school), white card with leaf shadows (questions), fire/smoke blobs.
- **Motion graphics:** number counters ($0 → $24 000 000), line charts that draw, arrows that draw, calendar flip (1989 → 2001), checklist with ✓/✕ badges, progress bar + rocket, hourglass, sound-wave bars, board-game ring with a moving token, mail envelopes between nodes, spotlight, handcuffs/bars, glitch + scanlines cliffhanger.
- **Characters:** flat vector `person()` silhouettes (badge, hold ticket/check/envelope), `kid()`/`adult()` with blinking eyes and talking mouth, sponge-with-face, brain network from the logo.
- **On a real take:** push-in zoom, dark text band under the type, person cut-out (DeepLabV3 + guided filter, `matte.py`) so headline sits behind the speaker.
- **Sound:** whoosh on scene change, soft pop per key word, ding on money, thump/glitch on reveals, ticks on checklist, final chord.

## Related skills in this repo
`see-group-video` (SEE Group brand reels), `gvozdarev-12-effects` (12 talking-head effects), `gvozdarev-titles` (4 designer title styles),
`reels-montage-lite` (cut, subtitles: 5 presets Кино / Чистый Apple / Экспертный крем / Жирные / Минимал).

## Gotchas
Fonts via local `@font-face` (woff2/ttf, Cyrillic subsets) and `READY` awaits them; Piper mangles brands and stresses; Whisper's first-word start is unreliable after a long silence (use silencedetect); don't push large MP4s in the foreground (use background + check `git status -sb`).
