"""Builds assets/soundtrack.wav: voiceover + synthesized SFX, synced to the timeline in index.html."""
import subprocess, numpy as np

SR = 48000
DUR = 15.5
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
def norm(x): return x / (np.max(np.abs(x)) + 1e-9)

# ---- timeline (keep in sync with T in index.html) ----
for k in range(9):                                     # checker tiles popping in
    place(norm(tick(1800 + 260 * k)), k * .065, .10, pan=-.6 + k * .15)
place(norm(whoosh(.7, rise=False)), .95, .30)          # tiles flip away
for i, tt in enumerate((1.15, 1.4, 1.65, 1.9)):        # hook lines landing
    place(norm(thump()), tt + .08, .22)
place(norm(glitch(.4)), 2.75, .16)                     # «не работает?»
place(norm(whoosh(.5)), 3.15, .25)                     # hook exits
for tt, f in ((3.6, 523), (4.56, 659), (5.47, 784)):   # s · e · e
    place(norm(pop(f)), tt + .05, .30)
place(norm(whoosh(.8)), 6.05, .28)                     # letters fly together
place(norm(riser(.9)), 6.05, .18)
place(norm(impact()), 6.93, .55)                       # «SEE Group»
place(norm(shimmer(.9)), 7.3, .12, pan=.3)             # logo shine
for i, tt in enumerate((7.8, 8.5, 9.25, 10.05)):       # services pills
    place(norm(pop(880 + 110 * i)), tt + .03, .14, pan=(-.4, .4, -.2, .2)[i])
place(norm(whoosh(.6)), 10.85, .12)                    # mission
place(norm(ding(1046)), 12.3, .22)                     # @seegroup.kz
place(norm(whoosh(.7)), 12.7, .16)                     # footer bars
sfx = np.stack([L, R], 1)
sfx /= max(1.0, np.max(np.abs(sfx)) / .9)
sfx[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]

pcm = (sfx * 32767).astype('<i2').tobytes()
open('/tmp/sfx.raw', 'wb').write(pcm)
# mix: voiceover (cleaned, compressed, delayed) + SFX, loudness-normalised for Instagram
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error',
    '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '/tmp/sfx.raw',
    '-i', 'assets/voiceover.mp3',
    '-filter_complex',
    f'[1]aresample={SR},highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,'
    f'adelay={int(VO_AT * 1000)}|{int(VO_AT * 1000)},pan=stereo|c0=c0|c1=c0,volume=1.6[vo];'
    '[0]volume=0.9[fx];[vo][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,'
    f'atrim=0:{DUR}[out]', '-map', '[out]', '-ar', str(SR), 'assets/soundtrack.wav'], check=True)
print('assets/soundtrack.wav')
