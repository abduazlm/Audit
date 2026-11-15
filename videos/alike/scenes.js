function person(x, y, s, col, o = {}) {                               // simple flat figure; o.kid smaller head ratio, o.bag, o.cup
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const st = o.walk ? Math.sin(o.t * 8 + (o.ph || 0)) : 0, k = o.kid ? .75 : 1;
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 24 * k; ctx.beginPath(); ctx.moveTo(-12 * k, 50); ctx.lineTo(-12 * k - st * 18, 130 * k); ctx.moveTo(12 * k, 50); ctx.lineTo(12 * k + st * 18, 130 * k); ctx.stroke();
  rr(-40 * k, -60 * k, 80 * k, 120 * k, 28 * k); ctx.fillStyle = col; ctx.fill(); circ(0, -60 * k - 46, 46, col);
  if (!o.noFace) { ell(-14, -60 * k - 50, 5, o.sad ? 2 : 6, C.ink); ell(14, -60 * k - 50, 5, o.sad ? 2 : 6, C.ink); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); o.sad ? ctx.arc(0, -60 * k - 18, 10, Math.PI + .4, -.4) : ctx.arc(0, -60 * k - 36, 10, .4, Math.PI - .4); ctx.stroke(); }
  if (o.bag) { rr(34 * k, 10, 60, 46, 6); ctx.fillStyle = '#3a3a42'; ctx.fill(); }
  if (o.cup) { rr(-80, -40, 30, 40, 6); ctx.fillStyle = C.cream; ctx.fill(); }
  ctx.restore();
}
function gray(t) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#c9c9cf'); g.addColorStop(1, '#a9a9b1'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); }
function city(t, off = 0) { for (let i = 0; i < 9; i++) { const h = 300 + hash(i) * 600, x = ((i * 140 - off) % 1260 + 1260) % 1260 - 90; ctx.fillStyle = i % 2 ? '#8e8e97' : '#7d7d86'; ctx.fillRect(x, 1250 - h, 130, h); ctx.fillStyle = 'rgba(255,255,255,.15)'; for (let r = 0; r < h / 80 - 1; r++) for (let c = 0; c < 3; c++) ctx.fillRect(x + 16 + c * 38, 1250 - h + 30 + r * 80, 22, 40); } ctx.fillStyle = '#6f6f78'; ctx.fillRect(-300, 1250, W + 600, 700); }
function sparkle(x, y, t, n = 8, col) { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + t * 1.5, r = 90 + Math.sin(t * 3 + i) * 20; circ(x + Math.cos(a) * r, y + Math.sin(a) * r, 8, col || [C.yel, C.pink, C.green, '#5bc0ff'][i % 4]); } }
function clockFace(x, y, r, t) { circ(x, y, r, C.cream); ctx.strokeStyle = C.ink; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t * 4 - 1.57) * r * .75, y + Math.sin(t * 4 - 1.57) * r * .75); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t * .3 - 1.57) * r * .5, y + Math.sin(t * .3 - 1.57) * r * .5); ctx.stroke(); }
function paperSheet(x, y, s, t, kind, prog_) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-180, -240, 360, 480, 12); ctx.fillStyle = '#fbfaf6'; ctx.fill();
  if (kind === 'art') { ctx.lineWidth = 16; ctx.lineCap = 'round'; [[C.pink, 0], [C.green, 1], [C.yel, 2], ['#5bc0ff', 3]].forEach(([c, i]) => { ctx.strokeStyle = c; ctx.beginPath(); for (let k = 0; k <= 20; k++) { const xx = -140 + k * 14, yy = -150 + i * 90 + Math.sin(k * .7 + i) * 30; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }); circ(80, -150, 40, C.yel); }
  else { ctx.fillStyle = '#7d7d86'; for (let r = 0; r < 8; r++) txt('А А А А А', 0, -190 + r * 55, 36, '#7d7d86'); }
  ctx.restore(); }
const SHOTS = [[0, 5.1, a0], [5.1, 14.0, a1], [14.0, 24.7, a2], [24.7, 31.8, a3], [31.8, 38.9, a4], [38.9, 45.6, a5], [45.6, 55.2, a6], [55.2, DURATION, a7]];
function a0(t) { gray(t); person(CX - 140, 1200, 2.2, C.grey2, { t }); person(CX + 170, 1290, 1.7, C.kid, { kid: 1, t }); sparkle(CX + 170, 1060, t);
  const k = pop(t, .3, .45); ctx.save(); ctx.translate(CX, 520); ctx.scale(k, k); txt('8 МИНУТ', 0, -50, 110, C.ink, { f: U, w: 800 }); txt('БЕЗ СЛОВ', 0, 70, 90, C.kid, { f: U, w: 800 }); ctx.restore(); }
function a1(t) { gray(t); person(330, 1250, 2.2, C.dad, { t, bag: 1, cup: t > 9.5, sad: 1 }); person(780, 1320, 1.8, C.kid, { kid: 1, t }); sparkle(780, 1070, t);
  label('ОТЕЦ', 330, 1600 - 60, t, 5.3, C.dad, C.cream, 40); label('УСТАВШИЙ', 330, 520, t, 7.9, C.cream, C.ink, 36); label('СЫН', 780, 1600 - 60, t, 10.8, C.kid, C.ink, 40); label('ЯРКИЙ', 780, 520, t, 11.3, C.yel, C.ink, 40); }
function a2(t) { gray(t); city(t, (t - 14) * 60); if (t < 17.9) { clockFace(CX, 700, 170, t * 3); label('КАЖДОЕ УТРО', CX, 420, t, 14.3, C.ink, C.cream, 44); }
  for (let i = 0; i < 7; i++) person(((i * 170 + (t - 14) * 120) % 1360) - 140, 1350 + (i % 2) * 30, 1.2, C.grey, { t, walk: 1, ph: i, bag: 1, noFace: 1 });
  if (t > 17.9) { person(CX - 100, 1380, 1.4, C.dad, { t, walk: 1, bag: 1, sad: 1 }); person(CX + 90, 1440, 1.1, C.kid, { kid: 1, t, walk: 1, ph: 1 }); }
  if (t > 19.1) label('РАБОТА', 300, 520, t, 19.1, C.cream, C.ink, 40); if (t > 20.6) label('ШКОЛА', 780, 520, t, 20.6, C.cream, C.ink, 40); if (t > 23.9) label('ВСЕ СЕРЫЕ', CX, 660, t, 23.9, C.ink, C.cream, 48); }
function a3(t) { gray(t); ctx.fillStyle = '#8e8e97'; rr(140, 1150, 800, 60, 10); ctx.fill(); const cross = prog(t, 30.1, 30.9);
  paperSheet(CX, 820, 1.15, t, cross < 1 ? 'art' : 'rows'); if (cross > 0 && cross < 1) { ctx.strokeStyle = C.red; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(CX - 200, 560); ctx.lineTo(CX - 200 + 400 * cross, 560 + 520 * cross); ctx.stroke(); }
  person(CX, 1500, 1.3, C.kid, { kid: 1, t, sad: t > 30.9 }); label('«КАК НАДО»', CX, 400, t, 27.3, C.red, C.cream, 46); }
function a4(t) { gray(t); ctx.fillStyle = '#8e8e97'; rr(560, 1080, 460, 40, 8); ctx.fill(); for (let i = 0; i < 9; i++) { rr(620 + (i % 2) * 12, 1060 - i * 34, 320, 30, 4); ctx.fillStyle = i % 2 ? '#ecebe6' : '#dddcd5'; ctx.fill(); }
  person(780, 1360, 1.6, C.dad, { t, sad: 1 }); person(300, 1400, 1.3, C.kid, { kid: 1, t, sad: t > 36 }); ctx.save(); ctx.translate(300, 1000 - Math.sin(t * 3) * 10); paperSheet(0, 0, .45, t, 'art'); ctx.restore();
  label('ПОКАЗАТЬ СВОЁ', 300, 760, t, 33.0, C.kid, C.ink, 34); if (t > 35.2) label('НЕКОГДА', 780, 600, t, 35.3, C.cream, C.ink, 40); if (t > 38) { const k = pop(t, 38.04, .4); ctx.save(); ctx.translate(650, 470); ctx.scale(k, k); txt('«ПОТОМ»', 0, 0, 80, C.red, { f: U, w: 800 }); ctx.restore(); } }
function a5(t) { gray(t); ctx.fillStyle = '#7d7d86'; ctx.fillRect(-300, 1250, W + 600, 700); const fade = prog(t, 41.8, 45.0);
  ctx.fillStyle = '#5a4a3a'; rr(CX - 260, 1180, 520, 34, 8); ctx.fill(); ctx.fillRect(CX - 230, 1214, 20, 120); ctx.fillRect(CX + 210, 1214, 20, 120);
  person(CX, 1210, 1.3, mixHex(C.kid, '#9a9aa2', fade), { kid: 1, t, sad: 1 }); if (fade < .6) sparkle(CX, 980, t, 6);
  label('ОДИН', CX, 520, t, 41.7, C.cream, C.ink, 46); if (t > 43.5) label('ЦВЕТ ПОЧТИ ПОГАС', CX, 640, t, 43.6, C.ink, C.cream, 44); }
function mixHex(a, b, p) { const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16)); return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], p)).toString(16).padStart(2, '0')).join(''); }
function a6(t) { const c = eOut(prog(t, 50.6, 52.6)); gray(t); city(t, 0);
  if (t < 47.8) for (let i = 0; i < 10; i++) { const p = prog(t, 46.4, 47.8), a = i / 10 * 6.28; ctx.save(); ctx.translate(CX - 120 + Math.cos(a) * 500 * p, 1000 - Math.sin(a) * 400 * p - 300 * p); ctx.rotate(p * 6 + i); rr(-60, -80, 120, 160, 6); ctx.fillStyle = '#fbfaf6'; ctx.fill(); ctx.restore(); }
  for (let i = 0; i < 6; i++) person(i * 190 + 40, 1420 + (i % 2) * 30, 1.0, C.grey, { t, noFace: 1 });
  person(CX - 120, 1300, 1.8, mixHex('#7d8aa0', C.dad, c), { t }); person(CX + 130, 1360, 1.4, C.kid, { kid: 1, t });
  if (t > 48) { ctx.save(); ctx.translate(CX + 10, 1020); ctx.rotate(-.1); paperSheet(0, 0, .4, t, 'art'); ctx.restore(); }
  if (c > 0) { sparkle(CX, 1050, t, 14); ctx.save(); ctx.globalAlpha = c * .35; const g = ctx.createRadialGradient(CX, 1150, 50, CX, 1150, 700); g.addColorStop(0, '#ffd23f'); g.addColorStop(1, 'rgba(255,210,63,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  label('БРОСАЕТ БУМАГИ', CX, 420, t, 46.4, C.ink, C.cream, 42); if (t > 51) label('СНОВА ЦВЕТНЫЕ', CX, 560, t, 51.3, C.kid, C.ink, 48); }
function a7(t) { gray(t); person(CX - 120, 1350, 1.6, C.dad, { t }); person(CX + 120, 1410, 1.3, C.kid, { kid: 1, t }); sparkle(CX, 1100, t, 12);
  const k = pop(t, 56.4, .5); ctx.save(); ctx.translate(CX, 600); ctx.scale(k, k); txt('ALIKE', 0, 0, 200, C.kid, { f: U, w: 800 }); ctx.restore();
  label('Д. МАРТИНЕС ЛАРА · Р. КАНО МЕНДЕС · 2015', CX, 780, t, 56.9, C.ink, C.cream, 28); label('ПОСМОТРИТЕ С ДЕТЬМИ', CX, 880, t, 57.7, C.yel, C.ink, 40); }
function header(t) { ctx.fillStyle = 'rgba(30,30,36,.88)'; ctx.fillRect(0, 0, W, 250); txt('МУЛЬТФИЛЬМ, КОТОРЫЙ', CX, 118, 50, C.cream, { f: U, w: 800 }); txt('НУЖЕН КАЖДОМУ РОДИТЕЛЮ', CX, 188, 46, C.kid, { f: U, w: 800 }); }
