"""Synthesizes assets/music.wav — a 96 BPM documentary bed for the Apple 1997 case reel: minor and tense
through the crisis, switches to a major progression at the turnaround (iMac, 58.7 s) and ends on a chord."""
import numpy as np, wave

SR = 48000
DUR = 71.0
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT
START = 0.3                               # groove starts with the voice
T0 = START - BAR                          # one soft pickup bar before the video starts
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

# Am – F – Dm – E, one chord per bar (minor, suspense)
PROG = [([57, 60, 64, 69], 45), ([53, 57, 60, 65], 41), ([50, 53, 57, 62], 38), ([52, 56, 59, 64], 40)]
ARP = [[69, 72, 76, 72], [65, 69, 72, 69], [62, 65, 69, 65], [64, 68, 71, 68]]
END = 69.9                                # final chord
TURN = 53.0                               # iMac: minor → major
MAJ = [([60, 64, 67, 72], 48), ([55, 59, 62, 67], 43), ([57, 60, 64, 69], 45), ([53, 57, 60, 65], 41)]
MAJ_ARP = [[72, 76, 79, 76], [67, 71, 74, 71], [69, 72, 76, 72], [65, 69, 72, 69]]
def marimba(m):
    n = at(.5); f = midi(m); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / .03)) * env(n, .002, .16)
def snap():
    n = at(.12); return hp(rng.standard_normal(n), 2500) * env(n, .001, .02)
def shaker():
    n = at(.08); return hp(rng.standard_normal(n), 6000) * env(n, .01, .025)

bars = int((DUR - T0) / BAR) + 1
for b in range(bars):
    bt = T0 + b * BAR
    if bt >= DUR: break
    chord, root = (MAJ if bt >= TURN - .01 else PROG)[b % 4]
    arp = (MAJ_ARP if bt >= TURN - .01 else ARP)[b % 4]
    final = bt >= END - BAR * .5
    if final:
        add(pad([48, 55, 60, 64], DUR - END, 1800) * np.exp(-np.arange(at(DUR - END)) / SR / .9), END, .5)
        break
    add(pad(chord, BAR + .3, 1400 if bt < START else 2000), bt, .32)
    for k in range(4):
        tb = bt + k * BEAT
        groove = tb >= START - 1e-6
        if groove:
            add(kick() * .7, tb, .55)
            if k in (1, 3): add(snap(), tb, .22, .2)
            add(bass(root, BEAT * .45), tb, .32)
            add(bass(root + 12 if k % 2 else root, BEAT * .3), tb + BEAT / 2, .18)
        for s in range(4): add(shaker(), tb + s * BEAT / 4, .05 + .04 * (s % 2) if groove else .02, -.4)
    for s in range(8):
        add(marimba(arp[(s * 3 + b) % 4]), bt + s * BEAT / 2, .11 if bt >= START else .06, (-.4, .4)[s % 2])

mix = np.stack([L, R], 1)
mix /= np.max(np.abs(mix)) / .9
with wave.open('assets/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('assets/music.wav')
