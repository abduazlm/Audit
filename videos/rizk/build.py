"""Builds assets/vo.wav (cut of the ustaz's voice), assets/cut.json and index.html (head.part + scenes.js + tail.part).
Run from videos/rizk: python3 build.py  — source video path and whisper JSON are given below."""
import json, re, subprocess
SRC = '/root/.claude/uploads/a9716668-77ad-55bb-b82f-8bdd02636603/a1233174-VID_20261121_205946_266.mp4'
WJ = '/tmp/claude-0/-home-user-Audit/a9716668-77ad-55bb-b82f-8bdd02636603/scratchpad/story/a.json'
W = json.load(open(WJ))
words = [(w['start'], w['end'], w['word'].strip()) for s in W['segments'] for w in s['words']]
# (first word start, last word start, id) in the source; each piece runs to the END of its last word
SEG = [(73.96, 79.06, 'hook'), (8.58, 11.96, 'eat'), (12.66, 13.70, 'block'), (21.72, 22.12, 'amb1'), (25.42, 26.54, 'amb2'), (32.32, 33.06, 'blue'), (39.66, 41.32, 'trach'),
       (45.64, 50.04, 'spit'), (54.24, 57.44, 'roll'), (62.42, 67.66, 'ate'), (79.86, 82.06, 'throat'), (89.24, 91.72, 'unexp'), (102.88, 106.30, 'path'), (127.64, 133.98, 'final')]
fix = {'риск,': 'ризк,', 'риск': 'ризк', 'Алла': 'Аллах', 'Супханалта': 'Субханаху', 'Аля': 'ва Таала', 'предписала': 'предписал', 'трахиотомии,': 'трахеотомии,', 'предоплено,': 'предписано,',
       'виноградку,': 'виноградинку,', 'скорую': 'скорой', 'протер': 'протёр', 'зайдет': 'зайдёт', 'все': 'всё', 'остановилась': 'остановилась.', 'довезли': 'довезли.', 'становится,': 'становится.',
       'выплюнул,': 'выплюнул!', 'пути,': 'пути.', 'если': 'Если', 'человек': 'человек'}
GAP = .26; t = .5; parts = []; out = []; marks = {}
for i, (fa, la, k) in enumerate(SEG):
    sel = [w for w in words if fa - .01 <= w[0] <= la + .01]; a = fa - .06; b = sel[-1][1] + .08
    marks[k] = round(t, 2)
    for (s, e, w) in sel: out.append([round(t + s - a, 2), round(t + e - a, 2), fix.get(w, w)])
    parts.append((a, b, t)); t += (b - a) + (.7 if i == 0 else GAP)
dur = round(t + 1.0, 2)
fl = [f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b - a - 0.05:.3f}:d=0.05,adelay={int(st * 1000)}|{int(st * 1000)}[s{i}]" for i, (a, b, st) in enumerate(parts)]
fl.append(''.join(f'[s{i}]' for i in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0,apad=whole_dur={dur}[o]")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', SRC, '-filter_complex', ';'.join(fl), '-map', '[o]', '-ac', '1', '-ar', '48000', 'assets/vo.wav'], check=True)
json.dump({'words': out, 'marks': marks, 'duration': dur}, open('assets/cut.json', 'w'), ensure_ascii=False)
ws = []
for a, b, w in out:
    if w.startswith('-') and ws: ws[-1][1] = b; ws[-1][2] += w; continue
    ws.append([a, b, w])
chunks = []; cur = []
for w in ws:
    cur.append(w)
    if len(cur) >= 3 or re.search(r'[.,:?!—–»]$', w[2]): chunks.append(cur); cur = []
if cur: chunks.append(cur)
subs = [{'a': c[0][0], 'b': c[-1][1], 'w': [[x[0], x[1], x[2].upper()] for x in c]} for c in chunks]
h = open('head.part', encoding='utf-8').read()
h = re.sub(r'const DURATION = .*?;\n', f'const DURATION = {dur};\n', h)
h = re.sub(r'const SUBS = .*?;\n', 'const SUBS = ' + json.dumps(subs, ensure_ascii=False) + ';\n', h)
h = re.sub(r'const MK = .*?;\n', 'const MK = ' + json.dumps(marks) + ';\n', h)
open('head.part', 'w', encoding='utf-8').write(h)
open('index.html', 'w', encoding='utf-8').write(h + open('scenes.js', encoding='utf-8').read() + open('tail.part', encoding='utf-8').read())
s = open('sound.py').read(); s = re.sub(r'DUR = [\d.]+', f'DUR = {dur}', s)
s = re.sub(r'CUTS = \[.*\]', 'CUTS = ' + json.dumps([marks[k] for k in list(marks)[1:]]), s); open('sound.py', 'w').write(s)
print('dur', dur, marks)
