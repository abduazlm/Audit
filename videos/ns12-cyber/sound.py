"""Builds assets/soundtrack.wav for the NS12 reel: synthesized SFX + music (no voiceover), synced to T in index.html."""
import subprocess, numpy as np

SR = 48000
DUR = 32.7
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

def crt_on():                                           # degauss thump + 15.7 kHz whine
    n = int(1.2 * SR); t = np.arange(n) / SR
    thump_ = np.sin(2 * np.pi * np.cumsum(60 + 40 * np.exp(-t * 20)) / SR) * env_exp(n, .12)
    buzz = onepole(rng.standard_normal(n), 300) * env_exp(n, .25) * 2
    whine = np.sin(2 * np.pi * 15700 * t) * .05 * np.minimum(1, t / .2)
    return thump_ + buzz + whine
def keys(dur, rate=14):                                  # mechanical keyboard typing
    n = int(dur * SR); out = np.zeros(n); k = 0
    while True:
        i = int((k / rate + rng.random() * .03) * SR)
        if i >= n: break
        c = onepole(rng.standard_normal(int(.03 * SR)), 3000 + rng.random() * 2000) * env_exp(int(.03 * SR), .004)
        out[i:i + len(c)] += c[:n - i] * (.6 + .4 * rng.random()); k += 1
    return out
def modem(dur):                                          # dial-up handshake: tones + screech
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    seg = [(0, .25, (1209, 697)), (.3, .55, (1336, 770)), (.6, 1.0, (2100,)), (1.0, dur, (980, 1180, 2400))]
    for a0, a1, fs in seg:
        m = (t >= a0) & (t < a1)
        for f in fs: out[m] += np.sin(2 * np.pi * f * t[m] + (np.sin(2 * np.pi * 30 * t[m]) * 3 if a0 >= 1 else 0))
    out += rng.standard_normal(n) * .3 * (t > 1.0)
    return out * np.minimum(1, (dur - t) / .1)

# ---- timeline (keep in sync with T in index.html) ----
place(norm(crt_on()), .1, .35)                          # CRT powers on
place(norm(keys(.7)), .3, .12)                          # DOS lines typing
place(norm(modem(1.4)), 1.1, .05)                       # dial-up under the hook
place(norm(keys(1.0, 18)), 1.1, .08)
place(norm(whoosh(.4, rise=False)), 2.65, .2)           # CRT power-off
for at in (3.0, 10.0, 14.3):                            # era switches
    place(norm(glitch(.3)), at - .12, .12)
    place(norm(whoosh(.5)), at - .2, .2)
for tt in (4.3, 6.15, 7.7, 11.35, 12.35, 15.55, 17.45):  # captions
    place(norm(tick(2200)), tt, .1)
place(norm(riser(1.2)), 17.85, .18)                     # into the present
place(norm(glitch(.6)), 18.9, .18)
place(norm(impact()), 19.93, .6)                        # NS12 logo
place(norm(shimmer(.8)), 20.45, .12, pan=.3)            # chrome sheen
for i, tt in enumerate((22.9, 23.2, 23.5, 24.05, 25.55)):  # spec rows
    place(norm(whoosh(.3)), tt - .05, .1, pan=.5)
    place(norm(pop(700 + 90 * i)), tt + .1, .12)
place(norm(whoosh(.6)), 26.7, .2)                       # CTA
place(norm(pop(660)), 29.6, .3)                         # WhatsApp button
place(norm(ding(1046)), 30.3, .2)                       # @nscyber12
sfx = np.stack([L, R], 1)
sfx /= max(1.0, np.max(np.abs(sfx)) / .9)
sfx[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]

pcm = (sfx * 32767).astype('<i2').tobytes()
open('/tmp/sfx.raw', 'wb').write(pcm)
# voiceover (cleaned, compressed, delayed) + SFX + music ducked under the voice → −14 LUFS
d = 1000                                                # T.vo
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error',
    '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '/tmp/sfx.raw',
    '-i', 'assets/voiceover.mp3', '-i', 'assets/music.wav',
    '-filter_complex',
    f'[1]aresample={SR},highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,'
    f'adelay={d}|{d},pan=stereo|c0=c0|c1=c0,volume=1.6,asplit[vo][key];'
    '[2]volume=0.45[mus];'
    '[mus][key]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=400:makeup=1[duck];'
    '[0]volume=0.8[fx];[vo][fx][duck]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,'
    f'atrim=0:{DUR}[out]', '-map', '[out]', '-ar', str(SR), 'assets/soundtrack.wav'], check=True)
print('assets/soundtrack.wav')
