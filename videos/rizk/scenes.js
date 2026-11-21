const WORDS = SUBS.flatMap(s => s.w);
function cue(sub, after = 0) { const w = WORDS.find(w => w[0] >= after && w[2].includes(sub)); return w ? w[0] : after; }
const T = { took: cue('ВЗЯЛ'), ate0: cue('СЪЕЛ'), choke: cue('ПОДАВИЛСЯ'), hosp: cue('БОЛЬНИЦЫ'), spit: cue('ВЫПЛЮНУЛ'), stop: cue('ОСТАНОВИЛАСЬ'), took2: cue('ВЗЯЛ', MK.ate), wipe: cue('ПРОТЁР', MK.ate), ate2: cue('СЪЕЛ', MK.ate),
  never: cue('НИКТО'), take: cue('ОТОБРАТЬ'), feed: cue('НАКОРМИТЬ') };
function paper(t) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.bg); g.addColorStop(1, C.bg2); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.fillStyle = 'rgba(15,74,58,.05)'; for (let i = 0; i < 18; i++) { ctx.save(); ctx.translate((i % 6) * 200 + 60, Math.floor(i / 6) * 640 + 160); ctx.rotate(Math.PI / 4); ctx.fillRect(-26, -26, 52, 52); ctx.restore(); } }
function floor(y = 1300) { ctx.fillStyle = '#e4d6bd'; ctx.fillRect(-300, y, W + 600, 900); ctx.strokeStyle = 'rgba(15,74,58,.12)'; ctx.lineWidth = 3; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(-300, y + 40 + i * 60); ctx.lineTo(W + 300, y + 40 + i * 60); ctx.stroke(); } }
function grape(x, y, r, rot = 0, glow = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); if (glow) { ctx.shadowColor = C.gold; ctx.shadowBlur = 40 * glow; }
  const g = ctx.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r); g.addColorStop(0, C.grape2); g.addColorStop(1, C.grape); circ(0, 0, r, g); ctx.shadowBlur = 0; ell(-r * .35, -r * .38, r * .22, r * .14, 'rgba(255,255,255,.55)', -.6);
  ctx.strokeStyle = '#5a7a3a'; ctx.lineWidth = r * .12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * .15, -r * 1.35); ctx.stroke(); ctx.restore(); }
function bunch(x, y, s) { for (let r = 0; r < 4; r++) for (let c = 0; c <= 3 - r; c++) grape(x + (c - (3 - r) / 2) * 50 * s, y + r * 44 * s, 26 * s); }
function guy(x, y, s, t, o = {}) {                                   // flat figure; o.col shirt, o.face skin tint, o.hands 'throat'|'mouth'|'reach'|'down', o.walk
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s); const st = o.walk ? Math.sin(t * 8) : 0, col = o.col || C.green;
  ctx.strokeStyle = '#3b3a44'; ctx.lineWidth = 24; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14, 60); ctx.lineTo(-14 - st * 22, 150); ctx.moveTo(14, 60); ctx.lineTo(14 + st * 22, 150); ctx.stroke();
  rr(-46, -70, 92, 140, 30); ctx.fillStyle = col; ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 22; ctx.beginPath(); const h = o.hands || 'down';
  if (h === 'throat') { ctx.moveTo(-40, -50); ctx.lineTo(-18, -78); ctx.moveTo(40, -50); ctx.lineTo(18, -78); } else if (h === 'mouth') { ctx.moveTo(40, -50); ctx.lineTo(30, -110); ctx.moveTo(-40, -50); ctx.lineTo(-58, 30); }
  else if (h === 'reach') { ctx.moveTo(40, -50); ctx.lineTo(70, 60); ctx.moveTo(-40, -50); ctx.lineTo(-58, 30); } else { ctx.moveTo(-40, -50); ctx.lineTo(-58 - st * 10, 30); ctx.moveTo(40, -50); ctx.lineTo(58 + st * 10, 30); } ctx.stroke();
  circ(0, -122, 50, o.face || C.skin); ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.arc(0, -136, 50, Math.PI, 0); ctx.fill();
  if (o.choke) { ctx.strokeStyle = C.ink; ctx.lineWidth = 5; [-17, 17].forEach(ex => { ctx.beginPath(); ctx.moveTo(ex - 7, -133); ctx.lineTo(ex + 7, -121); ctx.moveTo(ex + 7, -133); ctx.lineTo(ex - 7, -121); ctx.stroke(); }); ell(0, -96, 10, 14, C.ink); }
  else { ell(-17, -127, 6, 7, C.ink); ell(17, -127, 6, 7, C.ink); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); o.chew ? ell(0, -98, 9, 6 + Math.abs(Math.sin(t * 9)) * 5, C.ink) : ctx.arc(0, -108, 14, .3, Math.PI - .3); ctx.stroke(); }
  ctx.restore(); }
function alarm(x, y, t) { for (let i = 0; i < 3; i++) { const a = -.8 + i * .8; ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + Math.cos(a - 1.57) * 70, y + Math.sin(a - 1.57) * 70); ctx.lineTo(x + Math.cos(a - 1.57) * (100 + Math.sin(t * 12) * 8), y + Math.sin(a - 1.57) * (100 + Math.sin(t * 12) * 8)); ctx.stroke(); } }
function airway(x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-90, -380, 180, 760, 90); ctx.fillStyle = '#f3c9bd'; ctx.fill(); rr(-40, -380, 80, 760, 40); ctx.fillStyle = '#c96f6a'; ctx.fill();
  for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-40, -300 + i * 120); ctx.lineTo(40, -300 + i * 120); ctx.stroke(); }
  grape(0, o.gy || 0, 52); if (o.blocked) { for (let i = 0; i < 3; i++) { const p = ((t * 1.2 + i / 3) % 1); ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#5bc0ff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-18, -300 + p * 220); ctx.lineTo(0, -270 + p * 220); ctx.lineTo(18, -300 + p * 220); ctx.stroke(); ctx.globalAlpha = 1; } txt('✕', 120, o.gy || 0, 90, C.red, { f: U, w: 800 }); }
  ctx.restore(); }
function ambulance(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-220, -150, 440, 170, 24); ctx.fillStyle = C.cream; ctx.fill(); ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.stroke(); rr(120, -130, 90, 80, 10); ctx.fillStyle = '#bfe3f5'; ctx.fill();
  ctx.fillStyle = C.red; ctx.fillRect(-150, -100, 24, 70); ctx.fillRect(-173, -77, 70, 24); ctx.fillRect(-220, -20, 440, 16); circ(-130, 30, 40, '#3b3a44'); circ(130, 30, 40, '#3b3a44');
  circ(-60, -170, 22, (t * 4) % 1 < .5 ? '#ff4040' : '#4080ff'); ctx.restore(); }
function hospital(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = C.cream; ctx.fillRect(-260, -480, 520, 480); ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.strokeRect(-260, -480, 520, 480);
  ctx.fillStyle = C.red; ctx.fillRect(-25, -440, 50, 130); ctx.fillRect(-65, -400, 130, 50); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { ctx.fillStyle = '#bfe3f5'; ctx.fillRect(-220 + c * 115, -270 + r * 120, 80, 80); } ctx.restore(); }
function monitor(x, y, t, fast) { ctx.save(); ctx.translate(x, y); rr(-170, -110, 340, 220, 20); ctx.fillStyle = '#14231d'; ctx.fill(); ctx.strokeStyle = '#3ddc97'; ctx.lineWidth = 6; ctx.beginPath();
  for (let i = 0; i <= 60; i++) { const xx = -150 + i * 5, ph = ((i / 60) * (fast ? 4 : 2) - t * (fast ? 2.4 : 1.2)) % 1, yy = (ph + 1) % 1 > .45 && (ph + 1) % 1 < .55 ? -70 * Math.sin(((ph + 1) % 1 - .45) * 31.4) : 0; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.restore(); }
function hookText(t) { if (t < T.ate0 - .2) { label('ЭТА ВИНОГРАДИНА', CX, 420, t, .5, C.green, C.cream, 48); label('ЧУТЬ НЕ УБИЛА ЧЕЛОВЕКА', CX, 530, t, 1.3, C.red, C.cream, 44); }
  else { label('…А ПОТОМ ЕЁ СЪЕЛ', CX, 420, t, T.ate0 - .2, C.green, C.cream, 48); label('ДРУГОЙ', CX, 540, t, T.ate0, C.red, C.cream, 60); } }
const SHOTS = [[0, MK.eat, s0], [MK.eat, MK.block, s1], [MK.block, MK.amb1, s2], [MK.amb1, MK.blue, s3], [MK.blue, MK.trach, s4], [MK.trach, MK.spit, s5], [MK.spit, MK.roll, s6], [MK.roll, MK.ate, s7],
  [MK.ate, MK.rule, s8], [MK.rule, MK.throat, s9], [MK.throat, MK.unexp, s10], [MK.unexp, MK.path, s11], [MK.path, MK.final, s12], [MK.final, DURATION, s13]];
function s0(t) { paper(t); floor(); const p = eOut(prog(t, .2, 2.4)), gx = lerp(-60, 600, p), gy = 1290 - Math.abs(Math.sin(p * 9)) * 60 * (1 - p);
  const up = prog(t, T.took, T.took + .8); if (t < T.took + .1) grape(gx, gy, 46, p * 14); else { const hx = lerp(600, 760, up), hy = lerp(1290, 900, up); grape(hx, hy, 46); }
  if (t > T.took - 1) { const reach = 1 - Math.abs(prog(t, T.took - 1, T.took) - 1); guy(lerp(1150, 820, prog(t, T.took - 1.2, T.took - .3)), 1150, 1.4, t, { col: C.gold, hands: t > T.ate0 - .5 ? 'mouth' : 'reach', chew: t > T.ate0 }); }
  hookText(t); }
function s1(t) { paper(t); floor(1350); ctx.fillStyle = '#8a6a4a'; rr(80, 1180, 520, 40, 10); ctx.fill(); ctx.fillRect(110, 1220, 24, 140); ctx.fillRect(550, 1220, 24, 140); bunch(330, 1090, 1.1);
  const ch = t > T.choke; guy(760, 1180, 1.6, t, { hands: ch ? 'throat' : 'mouth', chew: !ch, choke: ch }); if (ch) alarm(760, 920, t);
  label('ЕЛ ВИНОГРАД', CX, 420, t, MK.eat + .2, C.green, C.cream, 46); if (ch) label('И ПОДАВИЛСЯ', CX, 540, t, T.choke, C.red, C.cream, 50); }
function s2(t) { paper(t); airway(CX, 1000, 1.05, t, { gy: 40, blocked: 1 }); label('ДЫХАТЕЛЬНЫЕ ПУТИ', CX, 420, t, MK.block + .2, C.red, C.cream, 44); }
function s3(t) { paper(t); floor(1380); if (t < T.hosp - .3) { ambulance(lerp(-300, 640, eOut(prog(t, MK.amb1, MK.amb1 + 1.4))), 1340, 1.4, t); label('СКОРАЯ', CX, 420, t, MK.amb1 + .1, C.red, C.cream, 52); }
  else { hospital(CX, 1380, 1.4); ambulance(lerp(300, 260, prog(t, T.hosp, MK.blue)), 1360, .8, t); label('БОЛЬНИЦА', CX, 420, t, T.hosp - .3, C.green, C.cream, 52); } }
function s4(t) { paper(t); const b = eOut(prog(t, MK.blue, MK.blue + 1.2)); guy(CX, 1250, 1.9, t, { hands: 'throat', choke: 1, face: mixC(C.skin, C.blue, b) }); monitor(CX, 560, t, 1); label('СИНЕЕТ', CX, 1600 - 140, t, MK.blue + .3, C.blue, C.ink, 50); }
function mixC(a, b, p) { const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16)); return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], p)).toString(16).padStart(2, '0')).join(''); }
function s5(t) { paper(t); monitor(CX, 640, t, 1); guy(CX - 160, 1300, 1.4, t, { hands: 'throat', choke: 1, face: C.blue }); guy(CX + 220, 1260, 1.5, t, { col: '#ffffff', flip: 1 });
  ctx.save(); ctx.translate(CX + 120, 1080); ctx.rotate(-.6 + Math.sin(t * 2) * .05); ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(90, -10); ctx.lineTo(0, 14); ctx.fill(); ctx.fillStyle = C.green; ctx.fillRect(-80, -4, 80, 18); ctx.restore();
  label('ДОШЛО ДО ТРАХЕОТОМИИ', CX, 420, t, MK.trach + .3, C.red, C.cream, 42); }
function s6(t) { paper(t); floor(); const out = t > T.spit, p = prog(t, T.spit, T.spit + 1.6); guy(CX - 120, 1180, 1.6, t, { hands: out ? 'down' : 'throat', choke: !out, face: out ? C.skin : C.blue });
  if (!out) { for (let i = 0; i < 2; i++) { const pr = Math.abs(Math.sin(t * 5 + i)); ctx.fillStyle = C.cream; rr(CX + 10 + pr * 20, 1000 + i * 50, 120, 40, 20); ctx.fill(); ctx.strokeStyle = C.green; ctx.lineWidth = 4; ctx.stroke(); } label('МАССАЖ', CX, 420, t, MK.spit + .3, C.green, C.cream, 48); }
  else { grape(lerp(CX - 120, 980, p), 960 - Math.sin(p * Math.PI) * 420 + p * 330, 44, p * 10); label('ВЫПЛЮНУЛ!', CX, 420, t, T.spit, C.red, C.cream, 60); } }
function s7(t) { paper(t); floor(1250); ctx.fillStyle = 'rgba(15,74,58,.08)'; for (let i = 0; i < 5; i++) ctx.fillRect(i * 260, 500, 140, 750);
  const p = eOut(prog(t, MK.roll, T.stop)), x = lerp(-60, 720, p), y = 1240 - Math.abs(Math.sin(p * 12)) * 70 * (1 - p); grape(x, y, 44, p * 18);
  for (let i = 1; i < 6; i++) { const q = Math.max(0, p - i * .04); ctx.globalAlpha = .15; grape(lerp(-60, 720, q), 1240, 44); ctx.globalAlpha = 1; }
  label('ПОКАТИЛАСЬ…', CX, 420, t, MK.roll + .3, C.green, C.cream, 50); if (t > T.stop) label('И ОСТАНОВИЛАСЬ', CX, 540, t, T.stop, C.gold, C.cream, 46); }
function s8(t) { paper(t); floor(1250); const pick = prog(t, T.took2, T.took2 + .6), wipe = t > T.wipe && t < T.ate2 - .1, ate = t > T.ate2;
  if (t < T.took2 + .3) grape(720, 1240, 44); guy(lerp(1150, 820, eOut(prog(t, MK.ate, T.took2))), 1100, 1.5, t, { col: C.gold, walk: t < T.took2, hands: ate ? 'mouth' : pick > 0 ? 'reach' : 'down', chew: ate });
  if (pick > 0 && !ate) grape(lerp(720, 870, pick) + (wipe ? Math.sin(t * 30) * 10 : 0), lerp(1240, 1090, pick), 40);
  label('ПРОХОЖИЙ', CX, 420, t, MK.ate + .1, C.gold, C.cream, 48); if (wipe) label('ПРОТЁР', CX, 540, t, T.wipe, C.green, C.cream, 44); if (ate) label('И СЪЕЛ', CX, 540, t, T.ate2, C.red, C.cream, 54); }
function s9(t) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0f4a3a'); g.addColorStop(1, '#0a3328'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  grape(CX, 1250, 110, 0, .8 + Math.sin(t * 2) * .2); txt('ЕСЛИ АЛЛАХ', CX, 520, 70, C.cream, { f: U, w: 800 }); txt('ПРЕДПИСАЛ ТЕБЕ', CX, 610, 70, C.cream, { f: U, w: 800 }); const k = pop(t, MK.rule + 1.6, .4); ctx.save(); ctx.translate(CX, 740); ctx.scale(k, k); txt('РИЗК', 0, 0, 130, C.yel, { f: U, w: 800 }); ctx.restore();
  if (t > T.never) label('НИКТО ЕГО НЕ ОТБЕРЁТ', CX, 900, t, T.never, C.red, C.cream, 46); }
function s10(t) { paper(t); airway(CX - 180, 1050, .9, t, { gy: 0, blocked: 1 }); ctx.save(); ctx.translate(CX + 230, 980); circ(0, 0, 120, C.red); ctx.fillStyle = C.cream; ctx.fillRect(-80, -20, 160, 40); ctx.restore();
  label('НЕ ТВОЁ — НЕ ПРОЙДЁТ', CX, 420, t, MK.throat + .3, C.red, C.cream, 46); }
const ROUTE = [[180, 760, 'ЕЛ'], [800, 760, 'СКОРАЯ'], [800, 1120, 'БОЛЬНИЦА'], [180, 1120, 'ПОЛ'], [CX, 1450, 'ПРОХОЖИЙ']];
function route(t, p) { ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.setLineDash([22, 16]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...ROUTE[0]); const n = ROUTE.length - 1;
  for (let i = 1; i <= n && i - 1 < p * n; i++) { const f = clamp(p * n - (i - 1)); ctx.lineTo(lerp(ROUTE[i - 1][0], ROUTE[i][0], f), lerp(ROUTE[i - 1][1], ROUTE[i][1], f)); } ctx.stroke(); ctx.setLineDash([]);
  ROUTE.forEach(([x, y, s], i) => { if (p * n >= i - .05) { circ(x, y, 46, i === n ? C.gold : C.green); label(s, x, y + 90, t, 0, C.cream, C.ink, 28); } });
  const q = clamp(p) * n, i = Math.min(n - 1, Math.floor(q)), f = q - i; grape(lerp(ROUTE[i][0], ROUTE[i + 1][0], f), lerp(ROUTE[i][1], ROUTE[i + 1][1], f) - 60, 34); }
function s11(t) { paper(t); route(t, eInOut(prog(t, MK.unexp + .2, MK.path)) * .6); label('ОТТУДА, ОТКУДА НЕ ЖДЁШЬ', CX, 420, t, MK.unexp + .4, C.green, C.cream, 44); }
function s12(t) { paper(t); route(t, lerp(.6, 1, eInOut(prog(t, MK.path, T.feed)))); label('ТАКОЙ ПУТЬ —', CX, 420, t, MK.path + .2, C.green, C.cream, 46); if (t > T.feed) label('ЧТОБЫ НАКОРМИТЬ ЕГО', CX, 530, t, T.feed, C.red, C.cream, 46); }
function s13(t) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0f4a3a'); g.addColorStop(1, '#0a3328'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); grape(CX, 1250, 90, 0, 1);
  txt('ТО, ЧТО ПРЕДПИСАНО', CX, 560, 66, C.cream, { f: U, w: 800 }); txt('ТЕБЕ —', CX, 650, 66, C.cream, { f: U, w: 800 }); if (t > MK.final + 4) { const k = pop(t, MK.final + 4.2, .45); ctx.save(); ctx.translate(CX, 800); ctx.scale(k, k); txt('ТЕБЯ НЕ МИНУЕТ', 0, 0, 82, C.yel, { f: U, w: 800 }); ctx.restore(); } }
function header(t) { ctx.fillStyle = C.green; ctx.fillRect(0, 0, W, 250); ctx.fillStyle = C.gold; ctx.fillRect(0, 250, W, 6);
  ctx.save(); ctx.font = font(800, 66, U); ctx.textBaseline = 'middle'; const w1 = ctx.measureText('ТВОЙ ').width, w2 = ctx.measureText('РИЗК').width, x0 = CX - (w1 + w2) / 2; ctx.textAlign = 'left'; ctx.fillStyle = C.cream; ctx.fillText('ТВОЙ ', x0, 105); rr(x0 + w1 - 10, 62, w2 + 20, 86, 10); ctx.fillStyle = C.yel; ctx.fill(); ctx.fillStyle = C.ink; ctx.fillText('РИЗК', x0 + w1, 105);
  const w3 = ctx.measureText('НАЙДЁТ ').width, w4 = ctx.measureText('ТЕБЯ').width, x1 = CX - (w3 + w4) / 2; ctx.fillStyle = C.cream; ctx.fillText('НАЙДЁТ ', x1, 195); rr(x1 + w3 - 10, 152, w4 + 20, 86, 10); ctx.fillStyle = C.red; ctx.fill(); ctx.fillStyle = C.cream; ctx.fillText('ТЕБЯ', x1 + w3, 195); ctx.restore(); }
