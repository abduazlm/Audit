"""Synthesizes assets/music.wav for the NS12 reel: 8-bit chiptune through the 90s/2000s/2010s,
then a modern groove whose first downbeat lands on the NS12 logo (19.9 s)."""
import numpy as np, wave

SR = 48000
DUR = 35.0
BPM = 120; BEAT = 60 / BPM; BAR = 4 * BEAT
DROP = 19.9
T0 = DROP - np.ceil(DROP / BAR) * BAR     # first bar line at or before 0 s
N = int(SR * DUR)
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)

def at(t): return int(round(t * SR))
def add(sig, t, g=1.0, pan=0.0):
    i = at(t)
    if i < 0: sig, i = sig[-i:], 0
    sig = sig[:max(0, N - i)]
    L[i:i + len(sig)] += sig * g * np.sqrt((1 - pan) / 2)
    R[i:i + len(sig)] += sig * g * np.sqrt((1 + pan) / 2)
def lp(x, cut):                           # FFT low-pass with a soft knee
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / cut) ** 4), len(x))
def hp(x, cut): return x - lp(x, cut)
def env(n, a, d):                         # attack/exp-decay envelope
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def adsr(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, n, maxh=60, detune=0.0):
    t = np.arange(n) / SR; out = np.zeros(n); ph = rng.random() * 6.28
    for k in range(1, maxh + 1):
        if f * k > 9000: break
        out += np.sin(2 * np.pi * f * (1 + detune) * k * t + ph * k) / k
    return out * .6

# ---- instruments ----
def kick():
    n = at(.45); t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .16) + rng.standard_normal(n) * np.exp(-t / .003) * .25
def clap():
    n = at(.35); x = np.zeros(n)
    for d in (0, .011, .022):
        i = at(d); m = n - i; x[i:] += rng.standard_normal(m) * np.exp(-np.arange(m) / SR / (.012 if d < .02 else .09))
    return hp(lp(x, 4500), 900)
def hat(open_=False):
    n = at(.25 if open_ else .06)
    return hp(rng.standard_normal(n), 7000) * env(n, .001, .07 if open_ else .014)
def bass(m, dur):
    n = at(dur); f = midi(m)
    x = lp(saw(f, n, 20), 420) + np.sin(2 * np.pi * f * np.arange(n) / SR) * .6
    return x * adsr(n, .005, .04)
def pad(chord, dur, cut):
    n = at(dur); x = np.zeros(n)
    for m in chord:
        for dt in (-.004, 0, .005):
            x += saw(midi(m), n, 40, dt)
    return lp(x, cut) * adsr(n, .25, .4) / len(chord)
def pluck(m):
    n = at(.4); f = midi(m); t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * t) + .4 * np.sin(4 * np.pi * f * t) + .2 * saw(f, n, 8))
    return lp(x, 3500) * env(n, .002, .12)

# Am9 – Fmaj7 – C(add9) – G6, one chord per bar
PROG = [([57, 60, 64, 67, 71], 45), ([53, 57, 60, 64, 67], 41), ([48, 55, 60, 62, 64], 48), ([55, 59, 62, 64, 67], 43)]
ARP = [[69, 72, 76, 79], [65, 69, 72, 76], [67, 72, 74, 79], [67, 71, 74, 76]]

def square(f, n, duty=.5):
    t = np.arange(n) / SR; ph = (t * f) % 1
    return np.where(ph < duty, 1.0, -1.0) * .35
def chip(m, dur, duty=.5):
    n = at(dur); return lp(square(midi(m), n, duty), 6000) * adsr(n, .003, .03)
def chipnoise(dur):
    n = at(dur); return np.round(rng.standard_normal(n) * 2) / 2 * env(n, .001, .03)

bars = int((DUR - T0) / BAR) + 1
END_GROOVE = DROP + 6 * BAR                # 31.9 s: final chord under the CTA
RETRO_END = 18.95                           # glitch into the present day
pad_bus = np.zeros(N)
for b in range(bars):
    bt = T0 + b * BAR
    if bt >= DUR: break
    chord, root = PROG[b % 4]
    if bt + BAR <= RETRO_END + 1e-6 or bt < RETRO_END:
        # chiptune: 16th arpeggio (lead), pulse bass on 8ths, noise hats; layers grow era by era
        for s16 in range(16):
            tt = bt + s16 * BEAT / 4
            if tt < .6 or tt >= RETRO_END - .05: continue
            era = 0 if tt < 9.35 else 1 if tt < 14.25 else 2
            note = ARP[b % 4][s16 % 4] + (12 if era == 2 and s16 % 8 >= 4 else 0)
            add(chip(note, BEAT / 4 * .8, .25 if era == 0 else .125), tt, .42 + .05 * era, (-.3, .3)[s16 % 2])
            if s16 % 2 == 0 and tt > 3.55: add(chip(root - 12, BEAT / 2 * .7, .5), tt, .5)
            if tt > 3.55 and s16 % 4 == 2: add(chipnoise(.05), tt, .18)
            if era >= 1 and s16 % 8 == 0: add(kick(), tt, .45 + .15 * era)
            if era == 2 and s16 % 8 == 4: add(clap(), tt, .18)
        continue
    final = bt >= END_GROOVE - 1e-6
    p = pad(chord, BAR + (1.2 if final else .3), 2600)
    if final: p *= np.exp(-np.arange(len(p)) / SR / .55)
    i = at(bt); p = p[:max(0, N - i)]; pad_bus[i:i + len(p)] += p
    if final: continue
    for k in range(4):
        tb = bt + k * BEAT
        add(kick(), tb, .9)
        if k in (1, 3): add(clap(), tb, .32)
        add(hat(True), tb + BEAT / 2, .10, .3)
        for s4 in range(4): add(hat(), tb + s4 * BEAT / 4, .05 + .03 * (s4 % 2), -.3)
        add(bass(root, BEAT / 2 * .9), tb + BEAT / 2, .6)
    for s8 in range(8):
        add(pluck(ARP[b % 4][(s8 * 3) % 4]), bt + s8 * BEAT / 2, .1, (-.5, .5)[s8 % 2])

t = np.arange(N) / SR
ph = ((t - T0) % BEAT) / BEAT
pump = 1 - .55 * np.exp(-ph * 9)
L += pad_bus * pump * .5; R += pad_bus * pump * .5
mix = np.stack([L, R], 1)
mix[-at(1.0):] *= np.linspace(1, 0, at(1.0))[:, None]
mix /= np.max(np.abs(mix)) / .9
with wave.open('assets/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('assets/music.wav')
