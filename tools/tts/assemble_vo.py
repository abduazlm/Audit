"""Voice a scene-per-line script with Piper and lay the clips out on one track.
usage (from a video project folder): python3 ../../tools/tts/assemble_vo.py vo.txt [voice=ruslan]
Writes assets/vo.wav and assets/vo-timing.json ({"scenes": [start...], "total": s, "words": [[word, start]...]}),
then prints each scene's words with their start times, for filling VO / K in index.html."""
import json, os, subprocess, sys
txt, voice = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'ruslan')
LEAD, GAP, TAIL = 0.5, 0.7, 1.4
model = os.path.expanduser(f'~/.cache/piper/ru_RU-{voice}-medium.onnx')
os.makedirs('assets/vo', exist_ok=True)
t, starts, parts = LEAD, [], []
for n, line in enumerate([l.strip() for l in open(txt, encoding='utf-8') if l.strip()], 1):
    f = f'assets/vo/s{n:02d}'
    subprocess.run(['python3', '-m', 'piper', '-m', model, '--length-scale', '1.05', '--sentence-silence', '0.3', '-f', f + '.raw.wav'],
                   input=line.encode(), check=True, capture_output=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f + '.raw.wav', '-af', 'highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=120',
                    '-ar', '48000', '-ac', '1', f + '.wav'], check=True)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f + '.wav']))
    starts.append(round(t, 2)); parts.append((f + '.wav', t)); t += d + GAP
total = round(t - GAP + TAIL, 2)
ins, flt = [], []
for i, (f, st) in enumerate(parts):
    ins += ['-i', f]; flt.append(f'[{i}]adelay={int(st * 1000)}[a{i}]')
flt.append(''.join(f'[a{i}]' for i in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,apad,atrim=0:{total}[o]')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(flt), '-map', '[o]', '-ar', '48000', 'assets/vo.wav'], check=True)
subprocess.run(['whisper', 'assets/vo.wav', '--model', 'small', '--language', 'ru', '--word_timestamps', 'True', '--output_format', 'json', '--output_dir', 'assets/vo'], capture_output=True)
d = json.load(open('assets/vo/vo.json'))
words = [[w['word'].strip(), round(w['start'], 2)] for s in d['segments'] for w in s['words']]
json.dump({'scenes': starts, 'total': total, 'words': words}, open('assets/vo-timing.json', 'w'), ensure_ascii=False)
print('scenes', starts, 'total', total)
for i, st in enumerate(starts):
    en = starts[i + 1] if i + 1 < len(starts) else total
    print(i + 1, ' '.join(f'{w}@{x}' for w, x in words if st - .2 <= x < en - .3))
