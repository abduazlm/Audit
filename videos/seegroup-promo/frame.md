---
version: alpha
name: SEE Group — Frame (video / frame layer)
description: >
  Brand-true video system for SEE Group (video production agency, seegroup.studio),
  derived from the client's Brandbook. Institutional Green ground, Metallics Gold as
  the "here's what's included" accent, Carmine Red reserved for the single urgency
  beat (the 24-hour guarantee). Montserrat (free stand-in for the brandbook's paid
  Samsung Sharp Sans) carries all display type. Checkerboard motif from the brandbook
  patterns page appears only as a restrained decorative, never as a busy background.
unit: the frame — 1080×1920 (9:16), vertical social

colors:
  ground: "#0D3A2C"
  ground-2: "#104434"
  ink: "#F4F1E9"
  gold: "#A37E2D"
  gold-bright: "#C99A3A"
  carmine: "#A20404"
  carmine-bright: "#E11414"
  gray: "#545454"

typography:
  kicker: { fontFamily: "Montserrat", cqw: 4.2, weight: 600, tracking: "0.14em", upper: true }
  headline: { fontFamily: "Montserrat", cqw: 11, weight: 800, lineHeight: 1.02 }
  headline-lg: { fontFamily: "Montserrat", cqw: 13.5, weight: 800, lineHeight: 0.98 }
  benefit-item: { fontFamily: "Montserrat", cqw: 8.5, weight: 700, lineHeight: 1.1 }
  guarantee: { fontFamily: "Montserrat", cqw: 12.5, weight: 800, lineHeight: 1.0 }
  logo-lockup: { fontFamily: "Montserrat", cqw: 10, weight: 700 }

spacing:
  edge: "8cqw"
  gap-md: "4cqw"

components:
  checker-corner:
    cells: "3×3, {colors.gold} / {colors.ground-2} alternating, ~4cqw each"
    placement: "one corner only (top-right hook, bottom-left outro), low-key"
    description: "Single restrained brandbook-pattern accent — never a full-bleed field."
  benefit-card:
    background: "{colors.ground-2}"
    border: "1px solid rgba(163,126,45,0.35)"
    accent: "{colors.gold} numeral badge, top-left"
    description: "One included-service tile; three self-assemble in the Benefits beat."
  urgency-flash:
    background: "{colors.carmine} full-bleed pulse, ~120ms in / hold / fade"
    typography: "{typography.guarantee} in {colors.ink}"
    description: "The ONE carmine moment in the whole film — the 24-hour beat. Never reused elsewhere."
  logo-lockup:
    mark: "seeGroup wordmark, {colors.ink} on {colors.ground}"
    description: "Brandbook wordmark, white-on-green variant, centered, held on final frame."
---

# SEE Group — Frame (video / frame layer)

## Overview

Dark, confident, agency-premium — the brandbook's own "избранный / стратегичный /
совершенный" character read at video scale. **Institutional Green is the only ground
color for the whole film** — no scene changes background hue. **Gold is the "what's
included" voice** (numerals, item accents, the offer itself). **Carmine is rationed to
exactly one beat** — the 24-hour guarantee — so its arrival reads as urgency, not
decoration. Type is Montserrat at heavy weights (700–800); it is not a brand-approved
substitute for Samsung Sharp Sans, only the nearest free geometric grotesk — flag this
choice if the client later confirms a Samsung Sharp Sans license.

**Key characteristics:**

- **One background across all four frames** — Institutional Green (`ground`/`ground-2`),
  never swapped for a scene change.
- **Gold = inclusion**, used only on the three benefit items and their numerals.
- **Carmine = the single urgency flash**, used only on "24 часа" — never elsewhere.
- **Montserrat 700–800 only** — no italics, no light weights; hierarchy by size.
- **Checkerboard motif** appears once per bookend frame (hook corner, outro corner) at
  low opacity — texture, not a pattern field.
- **No faces, no stock photography** — motion graphics / kinetic typography only.

## Colors

`{colors.ground}`/`{colors.ground-2}` are the only background tones — a two-step tint of
the same green, used for subtle depth (card vs. base), never a second hue. `{colors.ink}`
(warm off-white, not pure `#fff`) carries all body/display type on green. `{colors.gold}`
marks inclusion (benefit numerals, item accents). `{colors.carmine}` is reserved
entirely for the guarantee beat's flash/pulse — spending it anywhere else voids its
urgency. `{colors.gray}` is unused in this cut (kept from the brandbook for future
print/collateral reuse only).

## Typography

Montserrat at 700–800 weight only, sized in `cqw` off the 1080×1920 frame. Hierarchy is
size: `headline-lg` (hook promise) > `guarantee` (the punch line) > `headline`
(benefit-card title) > `benefit-item` (list copy) > `kicker` (small caps labels, e.g.
"SEE GROUP" mark or "ВКЛЮЧЕНО"). No serif pairing — the brand voice is grotesk-only.

## Frame Treatments

### 1 · Hook (promise · blueprint: kinetic-type-beats)

**Ground** `ground`, checker-corner top-right at 12% opacity. **Focal** "10 продающих
роликов" builds in two beats (numeral pops first, oversized, gold; "продающих роликов на
проф оборудование" completes below in ink) — outcome-first per story-spine, no agency
jargon. **Chrome** small `kicker` "SEE GROUP" top-left, low-key. **Accent** gold on the
numeral only. **Silence** generous — one statement, nothing else competing.

### 2 · Benefits (what's included · blueprint: grid-card-assemble)

**Ground** `ground-2`, no pattern (let the cards carry texture). **Focal** two
`benefit-card` tiles cascade in top-to-bottom, each with a gold numeral badge ("2",
"3" — numeral 1 was the hook) and one line of `benefit-item` copy: "Сами напишем
сценарий" / "Подберём локацию и моделей." **Accent** gold numerals + card hairline only.
**Silence** moderate — two cards, generous gaps, no filler.

### 3 · Guarantee (the punch · blueprint: kinetic-type-beats)

**Ground** `ground` holds through a beat of "И самое главное…" in `kicker`/`headline`
scale (ink, unhurried) — then the **one** `urgency-flash`: full-bleed carmine pulse
under "24 часа" at `guarantee` scale, followed by "вы можете не платить" settling back
onto the green ground in ink. **Accent** carmine — spent here only. **Silence** the
flash is loud; the settle line after it is calm, giving the promise room to land.

### 4 · Brand Outro (blueprint: logo-assemble-lockup)

**Ground** `ground`, checker-corner bottom-left at 12% opacity (mirrors the hook
corner, bookending the film). **Focal** the `logo-lockup` (seeGroup wordmark,
ink-on-green) settles center from a soft assemble, held to the last frame — no tagline
copy; the wordmark is the sign-off.

## Composition Rules

### Do

- Keep Institutional Green as the *only* background across every frame.
- Spend carmine exactly once, on the 24-hour beat, at full saturation.
- Use gold only where something is being included/offered (benefit numerals/accents).
- Keep Montserrat at 700–800; size carries hierarchy, not weight variation.
- Bookend the checkerboard motif (hook + outro corners only) — never a repeating field.

### Don't

- Don't tint any frame's background toward gold or carmine — they are accents, not grounds.
- Don't reuse the carmine flash on any other line — it must stay a single event.
- Don't add a second typeface, italics, or a light weight.
- Don't add faces, stock photography, or a busy full-bleed checker pattern.

## Numerals & Claims (hard rule)

"10 продающих роликов" and "24 часа" are the client's own claims from the voiceover —
render them verbatim; do not invent additional statistics, client logos, or proof points
not present in the brief.

## Known Gaps

- Samsung Sharp Sans (brandbook's primary display face) requires a myfonts.com license
  not confirmed for this run — Montserrat substitutes. Swap back if licensed.
- Brandbook's full 4-color checkerboard (green/gold/carmine/gray) is intentionally
  narrowed to a 2-color gold/green corner accent here — the full pattern would compete
  with the carmine urgency beat's exclusivity.
