"""Cuts assets/footage.mp4 (the «сегодня» part) from the client's montage assets/source-montage.mp4.
Each shot is sized to land on its voiceover cue; the fridge/drinks shot (source 30.2–33.0 s) is
excluded at the client's request."""
import subprocess

START = 19.0                                   # T.glitch in index.html
SEG = [  # (source in, source out, shot)          lands at
    (6.0, 7.0, 'neon sign «Жан, я в компах»'),   # 19.0  «А сегодня»
    (8.65, 10.1, 'blue hall'),                   # 20.0  «НС Кибер 12» + logo
    (0.0, 1.5, 'MOBA player'),                   # 21.45 «Киберспортивный клуб в Астане»
    (17.05, 17.65, 'PC fans'),                   # 22.95 «Топовое железо»
    (19.9, 20.45, 'keyboard'),                   # 23.55
    (11.65, 13.15, 'yellow hall'),               # 24.1  «Premium-зал и буткемпы»
    (33.1, 34.65, 'CS players'),                 # 25.6  «Открыто круглосуточно»
    (22.75, 25.2, 'console on the sofa'),        # 27.15 «Приходи на Байтурсынова, 67»
    (25.75, 27.85, 'lounge'),                    # 29.6  «Бронь — в WhatsApp»
    (28.7, 29.7, 'bean bags'),                   # 31.7
]
for a, b, _ in SEG:
    assert not (a < 33.0 and b > 30.2), 'fridge shot must not be used'
fc = ''.join(f'[0:v]trim={a}:{b},setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,'
             f'crop=1080:1920,fps=30[s{i}];' for i, (a, b, _) in enumerate(SEG))
fc += ''.join(f'[s{i}]' for i in range(len(SEG))) + f'concat=n={len(SEG)}:v=1:a=0[v]'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'assets/source-montage.mp4', '-filter_complex', fc,
                '-map', '[v]', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-an', 'assets/footage.mp4'], check=True)
t, cuts = START, []
for a, b, _ in SEG: cuts.append(round(t, 2)); t += b - a
print('cuts', cuts, 'end', round(t, 2))
