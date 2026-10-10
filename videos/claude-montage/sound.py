"""Builds assets/soundtrack.wav for the Claude montage reel: voiceover + SFX + ducked music (cues = T in index.html)."""
import subprocess, numpy as np

SR = 48000
DUR = 46.0
VO_AT = 0.3
rng = np.random.default_rng(7)
L = np.zeros(int(SR * DUR)); R = np.zeros_like(L)

def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def place(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); sig = sig[:max(0, len(L) - i)]
    L[i:i + len(sig)] += sig * gain * np.sqrt((1 - pan) / 2)
    R[i:i + len(sig)] += sig * gain * np.sqrt((1 + pan) / 2)
def onepole(x, cut):                       # time-varying low-pass, cut in Hz (scalar or array)
    cut = np.broadcast_to(cut, x.shape)
    a = np.exp(-2 * np.pi * cut / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y
def bandnoise(n, lo, hi):                  # band-ish noise via LP difference
    w = rng.standard_normal(n); return onepole(w, hi) - onepole(w, lo)
def reverb(x, sec=1.2, mix=.25):
    ir = rng.standard_normal(int(SR * sec)) * env_exp(int(SR * sec), sec / 5)
    y = np.fft.irfft(np.fft.rfft(x, len(x) + len(ir)) * np.fft.rfft(ir, len(x) + len(ir)))[:len(x) + len(ir)]
    y /= np.max(np.abs(y)) + 1e-9
    out = np.zeros(len(y)); out[:len(x)] = x * (1 - mix); return out + y * mix * np.max(np.abs(x))

# ---- sound designs ----
def tick(f):
    n = int(.05 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * env_exp(n, .008)
def whoosh(dur, rise=True):
    n = int(dur * SR); x = np.linspace(0, 1, n)
    shape = np.sin(np.pi * x) ** 2
    cut = 300 + 5000 * (x if rise else 1 - x)
    return onepole(rng.standard_normal(n), cut) * shape * 2.2
def thump():
    n = int(.25 * SR); t = np.arange(n) / SR
    f = 90 + 80 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, .06)
def pop(f):
    n = int(.35 * SR); t = np.arange(n) / SR
    fr = f * (1 + .6 * np.exp(-t * 60))
    body = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(n, .09)
    click = rng.standard_normal(n) * env_exp(n, .002) * .4
    return reverb(body + click, .8, .2)
def glitch(dur):
    n = int(dur * SR); out = np.zeros(n); chunk = int(.028 * SR)
    for i in range(0, n, chunk):
        if rng.random() < .65:
            f = rng.choice([220, 330, 880, 1760]); t = np.arange(min(chunk, n - i)) / SR
            sq = np.sign(np.sin(2 * np.pi * f * t)) * .5 + rng.standard_normal(len(t)) * .4
            out[i:i + len(t)] = np.round(sq * 4) / 4
    return onepole(out, 6000) * .8
def riser(dur):
    n = int(dur * SR); x = np.linspace(0, 1, n)
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * x ** 2) / SR) * .35
    noise = onepole(rng.standard_normal(n), 400 + 7000 * x ** 2)
    return (tone + noise) * x ** 2.2
def impact():
    n = int(2.2 * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t * 18)) / SR) * env_exp(n, .45)
    crack = onepole(rng.standard_normal(n), 2500) * env_exp(n, .05) * 1.5
    return reverb(sub + crack, 1.8, .3)
def shimmer(dur):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for f in (2093, 2637, 3136, 4186, 5274):
        out += np.sin(2 * np.pi * f * t + rng.random() * 6) * (.5 + .5 * np.sin(2 * np.pi * (6 + rng.random() * 6) * t))
    return reverb(out * np.sin(np.pi * t / dur) ** 2 / 5, 1.2, .4)
def ding(f):
    n = int(1.6 * SR); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * m * t) * env_exp(n, d) for m, a, d in ((1, 1, .5), (2.76, .5, .25), (5.4, .25, .12)))
    return reverb(s, 1.2, .3)
def beep():
    n = int(.07 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2600 * t) * np.minimum(1, np.arange(n)[::-1] / (.01 * SR)) * np.minimum(1, np.arange(n) / 200)
def shutter():
    n = int(.25 * SR); t = np.arange(n) / SR
    c1 = onepole(rng.standard_normal(n), 4000) * env_exp(n, .012)
    c2 = np.roll(c1 * .7, int(.06 * SR)); c2[:int(.06 * SR)] = 0
    return reverb(c1 + c2, .4, .15)
def norm(x): return x / (np.max(np.abs(x)) + 1e-9)

def keys(dur, rate=16):                                  # soft typing
    n = int(dur * SR); out = np.zeros(n); k = 0
    while True:
        i = int((k / rate + rng.random() * .025) * SR)
        if i >= n: break
        c = onepole(rng.standard_normal(int(.025 * SR)), 2500 + rng.random() * 2000) * env_exp(int(.025 * SR), .004)
        out[i:i + len(c)] += c[:n - i] * (.6 + .4 * rng.random()); k += 1
    return out

# ---- timeline (keep in sync with T in index.html; the page exposes it as window.TIMELINE) ----
for k in range(6):                                      # timeline clips ticking past
    place(norm(tick(1700 + 140 * k)), .3 + k * .32, .05, pan=-.4 + k * .16)
for at in (2.75, 5.45, 7.75, 12.82, 19.76, 24.8, 32.22, 36.3):   # scene changes
    place(norm(whoosh(.45)), at - .15, .16)
place(norm(impact()), 5.52, .35)                        # «3 шага»
for i, tt in enumerate((5.69, 5.89, 6.09)):             # step markers
    place(norm(pop(520 + 130 * i)), tt, .14)
place(norm(pop(880)), 9.72, .22)                        # «МОНТАЖ» sent
place(norm(ding(1046)), 11.68, .16)                     # file received
place(norm(pop(1180)), 12.0, .14)                       # БЕСПЛАТНО badge
for tt in (15.18, 16.32, 17.42):                        # clicks on the path
    place(norm(tick(3000)), tt - .02, .22)
place(norm(whoosh(.5)), 17.5, .12)                      # zip flies in
place(norm(ding(1318)), 18.85, .14)                     # skill enabled
place(norm(pop(700)), 21.12, .18)                       # video attached
place(norm(keys(1.85)), 22.61, .09)                     # typing the prompt
place(norm(pop(990)), 24.55, .16)                       # sent
place(norm(riser(1.6)), 25.1, .1)                       # render progress
for i, tt in enumerate((27.84, 28.39, 29.24, 30.9, 31.49)):   # checklist
    place(norm(pop(760 + 70 * i)), tt, .13, pan=.3)
for tt in (33.59, 35.16):                               # edit requests + replies
    place(norm(pop(900)), tt, .16); place(norm(ding(1568)), tt + .9, .08)
for i in range(5):                                      # brand swatches
    place(norm(pop(600 + 90 * i)), 38.57 + i * .12, .09)
place(norm(impact()), 39.43, .25)                       # ИНДИВИДУАЛЬНЫЙ stamp
place(norm(shimmer(.9)), 42.0, .1, pan=.2)              # «личный монтажёр»
place(norm(ding(1046)), 43.6, .16)                      # CTA
sfx = np.stack([L, R], 1)
sfx /= max(1.0, np.max(np.abs(sfx)) / .9)
sfx[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]

pcm = (sfx * 32767).astype('<i2').tobytes()
open('/tmp/sfx.raw', 'wb').write(pcm)
# mix: voiceover (cleaned, compressed, delayed) + SFX + music ducked under the voice,
# loudness-normalised for Instagram. Music comes from music.py.
d = int(VO_AT * 1000)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error',
    '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '/tmp/sfx.raw',
    '-i', 'assets/voiceover.mp3', '-i', 'assets/music.wav',
    '-filter_complex',
    f'[1]aresample={SR},highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,'
    f'adelay={d}|{d},pan=stereo|c0=c0|c1=c0,volume=1.6,asplit[vo][key];'
    '[2]volume=0.32[mus];'
    '[mus][key]sidechaincompress=threshold=0.015:ratio=8:attack=15:release=400:makeup=1[duck];'
    '[0]volume=0.9[fx];[vo][fx][duck]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,'
    f'atrim=0:{DUR}[out]', '-map', '[out]', '-ar', str(SR), 'assets/soundtrack.wav'], check=True)
print('assets/soundtrack.wav')
