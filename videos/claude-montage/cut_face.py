"""Cuts the talking-head take: removes two false starts and one slip («звукоэффекты»).
Writes assets/face-cut.mp4 (video) and assets/voice-cut.wav (voice) with 20–30 ms fades at the joins."""
import subprocess, sys
F = sys.argv[1]
KEEP = [(0.0, 16.6), (21.6, 26.15), (33.45, 42.95), (50.3, 56.4)]   # source seconds kept
v = ''.join(f'[0:v]trim={a}:{b},setpts=PTS-STARTPTS,fps=30[v{i}];' for i, (a, b) in enumerate(KEEP))
au = ''.join(f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b-a-0.03:.3f}:d=0.03[a{i}];' for i, (a, b) in enumerate(KEEP))
fc = (v + au + ''.join(f'[v{i}]' for i in range(len(KEEP))) + f'concat=n={len(KEEP)}:v=1:a=0[v];'
      + ''.join(f'[a{i}]' for i in range(len(KEEP))) + f'concat=n={len(KEEP)}:v=0:a=1[a]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', F, '-filter_complex', fc,
                '-map', '[v]', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', 'assets/face-cut.mp4',
                '-map', '[a]', '-ar', '48000', 'assets/voice-cut.wav'], check=True)
