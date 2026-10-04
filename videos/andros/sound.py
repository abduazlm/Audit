"""Builds assets/soundtrack.wav: voiceover + synthesized SFX, synced to the timeline in index.html."""
import subprocess, numpy as np

SR = 48000
DUR = 25.4
VO_AT = 1.2
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

# ---- timeline (keep in sync with T in index.html) ----
place(norm(whoosh(.55, rise=False)), .15, .16)        # drop falls
place(norm(pop(300)), .7, .4)                          # splash into the centre
for i in range(6):                                     # berries bounce in
    place(norm(pop(500 + 90 * i)), .95 + i * .14 + .35, .13, pan=(-.5, -.3, -.6, .5, .3, .6)[i])
for tt in (1.15, 1.95, 2.65):                          # hook lines landing
    place(norm(thump()), tt + .08, .22)
place(norm(glitch(.4)), 2.7, .16)                      # «с фрукта.»
place(norm(whoosh(.5)), 3.35, .25)                     # hook exits
place(norm(riser(.55)), 3.4, .18)
for k in range(6):                                     # letters A N D R O S
    place(norm(pop(440 + 70 * k)), 3.9 + k * .1 + .05, .22, pan=-.5 + k * .2)
place(norm(impact()), 4.5, .5)                         # fruit burst
place(norm(shimmer(.9)), 4.85, .12, pan=.3)
place(norm(whoosh(.7)), 5.3, .26)                      # → dark world
for tt, f in zip((6.75, 7.35, 7.95, 8.75), (660, 784, 880, 988)):   # product tiles
    place(norm(pop(f)), tt + .05, .22); place(norm(thump()), tt + .1, .16)
place(norm(tick(2400)), 9.1, .2)
place(norm(whoosh(.6)), 11.5, .26)                     # → halal
place(norm(impact()), 12.3, .45)                       # stamp
place(norm(ding(1046)), 12.4, .14)
place(norm(whoosh(.6)), 13.1, .26)                     # → delivery
for tt in (13.4, 13.9, 14.4): place(norm(thump()), tt + .1, .16)
place(norm(whoosh(2.0)), 13.4, .12, pan=.3)            # parcel flight
place(norm(pop(1100)), 13.45, .2); place(norm(pop(1320)), 15.5, .2)
for k in range(10):                                    # tile wipe
    place(norm(tick(1500 + 180 * k)), 16.85 + k * .04, .07, pan=-.6 + k * .13)
place(norm(whoosh(.7)), 16.8, .28)
place(norm(whoosh(.6, rise=False)), 17.35, .2)
for tt in (18.95, 19.4, 20.0): place(norm(thump()), tt + .12, .2)
place(norm(pop(660)), 20.8, .3)                        # CTA button
place(norm(tick(3000)), 22.0, .3); place(norm(pop(1320)), 22.02, .15)   # tap
place(norm(ding(1046)), 23.3, .2)                      # handle
place(norm(whoosh(.7)), 23.7, .14)                     # footer bars
sfx = np.stack([L, R], 1)
sfx /= max(1.0, np.max(np.abs(sfx)) / .9)
sfx[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]

pcm = (sfx * 32767).astype('<i2').tobytes()
open('/tmp/sfx.raw', 'wb').write(pcm)
# mix: voiceover (cleaned, compressed, delayed) + SFX + music ducked under the voice,
# loudness-normalised for Instagram. Music comes from music.py.
import os
HAS_VO = os.path.exists('assets/voiceover.mp3')   # без озвучки собирается черновик: музыка + SFX
d = int(VO_AT * 1000)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error',
    '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '/tmp/sfx.raw',
    *(['-i', 'assets/voiceover.mp3'] if HAS_VO else ['-f', 'lavfi', '-t', str(DUR), '-i', 'anullsrc=r=48000:cl=mono']), '-i', 'assets/music.wav',
    '-filter_complex',
    f'[1]aresample={SR},highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,'
    f'adelay={d}|{d},pan=stereo|c0=c0|c1=c0,volume=1.6,asplit[vo][key];'
    '[2]volume=0.24[mus];'
    '[mus][key]sidechaincompress=threshold=0.015:ratio=8:attack=15:release=400:makeup=1[duck];'
    '[0]volume=0.9[fx];[vo][fx][duck]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,'
    f'atrim=0:{DUR}[out]', '-map', '[out]', '-ar', str(SR), 'assets/soundtrack.wav'], check=True)
print('assets/soundtrack.wav')
