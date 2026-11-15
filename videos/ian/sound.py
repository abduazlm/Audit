"""Builds assets/soundtrack.wav for the ian review: voice (assets/vo.wav) + dark ambient bed + cut whooshes and hits, played at SPEED."""
import subprocess, numpy as np
SR = 48000; SPEED = 1.2; DUR = 62.2; D = 0
rng = np.random.default_rng(3); N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
CUTS = [6.4, 14.1, 22.6, 32.4, 38.9, 48.6, 55.9]   # keep in sync with SHOTS in index.html
HITS = [[0.4, 0.6], [24.4, 0.9], [34.4, 0.8], [41.8, 1.0], [57.4, 0.8]]
def place(sig, t, g=1.0, pan=0.0):
    i = int(t * SR); sig = sig[:max(0, N - i)]; L[i:i + len(sig)] += sig * g * np.sqrt((1 - pan) / 2); R[i:i + len(sig)] += sig * g * np.sqrt((1 + pan) / 2)
def whoosh(d=.7):
    n = int(d * SR); w = rng.standard_normal(n); env = np.sin(np.linspace(0, np.pi, n)) ** 2
    return np.diff(np.concatenate([[0], np.convolve(w, np.ones(40) / 40, 'same')])) * env * 6
def hit():
    n = int(1.6 * SR); t = np.arange(n) / SR; f = 55 * np.exp(-t * 2) + 35
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) + rng.standard_normal(n) * np.exp(-t * 30) * .3)
# dark bed: minor drone (D) + slow low piano-like notes
t = np.arange(N) / SR; bed = np.zeros(N)
for f, g in ((73.4, .5), (110.0, .25), (87.3, .2)): bed += g * np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * .07 * t) * 2)
bed *= .5 + .5 * np.sin(2 * np.pi * t / 16) ** 2
notes = [293.7, 349.2, 440.0, 392.0, 349.2, 329.6, 293.7, 261.6]
for k, at in enumerate(np.arange(1.0, DUR - 3, 2.4)):
    f = notes[k % len(notes)]; n = int(2.4 * SR); tt = np.arange(n) / SR
    tone = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 1.6)
    i = int(at * SR); bed[i:i + n] += tone[:max(0, N - i)] * .35
bed = bed / np.max(np.abs(bed)) * .5
place(bed, 0, 1.0)
for c in CUTS: place(whoosh(), c + D - .45, .12, pan=rng.uniform(-.4, .4))
for at, g in HITS: place(hit(), at + D - .05, .5 * g)
fx = np.stack([L, R], 1); fx /= np.max(np.abs(fx)) + 1e-9
import wave
with wave.open('assets/bed.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((fx * 32000).astype('<i2').tobytes())
flt = (f"[0:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];[1:a]volume=0.35,acompressor=threshold=-24dB:ratio=3[m];"
       f"[m][v2]sidechaincompress=threshold=0.04:ratio=2.5:attack=60:release=1200[duck];[v1][duck]amix=inputs=2:normalize=0,"
       f"atempo={SPEED},loudnorm=I=-14:TP=-1.5:LRA=11")
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'assets/vo.wav', '-i', 'assets/bed.wav', '-filter_complex', flt, '-ar', '48000', 'assets/soundtrack.wav'], check=True)
print('soundtrack ok')
