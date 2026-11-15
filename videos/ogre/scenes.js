function fig(x, y, s, col, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const tip = o.tip ? Math.abs(Math.sin(t * 3 + (o.ph || 0))) * 10 : 0;
  ctx.strokeStyle = col; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, 50); ctx.lineTo(-14, 120 - tip); ctx.moveTo(10, 50); ctx.lineTo(14, 120 - (10 - tip)); ctx.stroke();
  if (o.dress) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-34, -50); ctx.lineTo(34, -50); ctx.lineTo(54, 60); ctx.lineTo(-54, 60); ctx.closePath(); ctx.fill(); } else { rr(-32, -50, 64, 100, 24); ctx.fillStyle = col; ctx.fill(); }
  circ(0, -90, 38, col); ell(-12, -94, 4, o.scared ? 7 : 5, C.ink); ell(12, -94, 4, o.scared ? 7 : 5, C.ink); if (o.scared) ell(0, -70, 6, 8, C.ink);
  if (o.shh) { ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, -84); ctx.lineTo(0, -60); ctx.stroke(); }
  ctx.restore(); }
function room(t, dim = 0) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.wall); g.addColorStop(1, C.wall2); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let x = 0; x < W; x += 90) ctx.fillRect(x, 0, 4, 1250);
  ctx.fillStyle = C.floor; ctx.fillRect(-300, 1250, W + 600, 900); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 4; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-300, 1290 + i * 70); ctx.lineTo(W + 300, 1290 + i * 70); ctx.stroke(); }
  const lg = ctx.createRadialGradient(300, 700, 20, 300, 800, 700); lg.addColorStop(0, `rgba(255,207,138,${.35 - dim * .25})`); lg.addColorStop(1, 'rgba(255,207,138,0)'); ctx.fillStyle = lg; ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.strokeStyle = '#3a3346'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(300, 300); ctx.lineTo(300, 560); ctx.stroke(); ctx.fillStyle = C.lamp; ctx.beginPath(); ctx.moveTo(250, 640); ctx.lineTo(350, 640); ctx.lineTo(320, 560); ctx.lineTo(280, 560); ctx.fill(); }
function ogreShadow(x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const br = 1 + Math.sin(t * 1.4) * .03; ctx.scale(br, br); ctx.fillStyle = `rgba(4,4,10,${o.a || .85})`;
  ctx.beginPath(); ctx.ellipse(0, 0, 260, 330, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -360, 150, 130, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-120, -440); ctx.lineTo(-160, -540); ctx.lineTo(-70, -470); ctx.moveTo(120, -440); ctx.lineTo(160, -540); ctx.lineTo(70, -470); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-300, -40, 90, 260, .4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(300, -40, 90, 260, -.4, 0, Math.PI * 2); ctx.fill();
  const eye = o.angry ? C.red : C.yel; const blink = (t % 4) < .12 ? .1 : 1; ctx.shadowColor = eye; ctx.shadowBlur = 30; ell(-55, -370, 24, 14 * blink, eye); ell(55, -370, 24, 14 * blink, eye); ctx.shadowBlur = 0; ctx.restore(); }
const SHOTS = [[0, 7.0, o0], [7.0, 13.0, o1], [13.0, 20.2, o2], [20.2, 27.2, o3], [27.2, 37.9, o4], [37.9, 42.6, o5], [42.6, 49.6, o6], [49.6, DURATION, o7]];
function o0(t) { ctx.fillStyle = '#07070d'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.beginPath(); for (let x = 0; x <= W; x += 6) { const ph = ((x / W) * 3 - t * 1.2) % 1, beat = ph > .45 && ph < .55 ? Math.sin((ph - .45) * 62.8) * 160 : 0; x ? ctx.lineTo(x, 1250 - beat) : ctx.moveTo(x, 1250 - beat); } ctx.stroke();
  const k = pop(t, .3, .45); ctx.save(); ctx.translate(CX, 700); ctx.scale(k, k); txt('6 МИНУТ', 0, -60, 120, C.cream, { f: U, w: 800 }); txt('НЕ ДЫША', 0, 70, 110, C.red, { f: U, w: 800 }); ctx.restore(); }
function o1(t) { room(t); const s = eOut(prog(t, 10.4, 11.4)); if (s > 0) { ctx.save(); ctx.globalAlpha = s; ogreShadow(780, 820, 1.1 * (.7 + .3 * s), t); ctx.restore(); }
  fig(330, 1250, 1.6, C.mom, t, { dress: 1, scared: t > 10.6 }); fig(470, 1330, 1.1, C.child, t, { scared: t > 10.6 }); label('МАМА И РЕБЁНОК', 400, 1580 - 60, t, 7.4, C.mom, C.ink, 34); if (t > 11.9) label('ОГР', 780, 420, t, 12.0, C.red, C.cream, 56); }
function o2(t) { room(t, .3); ogreShadow(860, 760, .8, t, { a: .55 }); const x = lerp(140, 640, prog(t, 13.2, 20)); fig(x, 1250, 1.5, C.mom, t, { dress: 1, tip: 1, shh: t > 15.3 }); fig(x + 140, 1320, 1.05, C.child, t, { tip: 1, ph: 1 });
  label('НА ЦЫПОЧКАХ', CX, 420, t, 13.6, C.cream, C.ink, 44); if (t > 15.3) label('ТССС…', CX, 540, t, 15.4, C.yel, C.ink, 44);
  if (t > 17.4) { const p = prog(t, 17.5, 19.0); for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(226,68,58,${(1 - p) * .9})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + 70, 1400, 40 + i * 50 + p * 120, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } label('СКРИП', x + 70, 1520, t, 17.5, C.red, C.cream, 38); } }
function o3(t) { const sh = t > 25.4 ? Math.max(0, 1 - (t - 25.4) / 1.6) : 0; ctx.save(); ctx.translate(Math.sin(t * 70) * 26 * sh, Math.cos(t * 55) * 18 * sh); room(t, .5); ogreShadow(CX, 820, 1.25 + sh * .15, t, { angry: t > 24.5 });
  for (let i = 0; i < 3; i++) { const fall = prog(t, 25.6 + i * .2, 26.2 + i * .2); rr(140 + i * 300, 360 + fall * 900, 120, 90, 6); ctx.fillStyle = ['#5a4a6a', '#6a5a3a', '#3a4a6a'][i]; ctx.fill(); }
  fig(250, 1350, 1.3, C.mom, t, { dress: 1, scared: 1 }); fig(360, 1410, .9, C.child, t, { scared: 1 }); ctx.restore();
  label('КАЖДЫЙ ШАГ — ПОД ЕГО НАСТРОЕНИЕ', CX, 420, t, 20.5, C.cream, C.ink, 34); if (t > 25.4) label('ДРОЖИТ ВЕСЬ ДОМ', CX, 540, t, 25.5, C.red, C.cream, 46); }
function o4(t) { ctx.fillStyle = '#0b0f1c'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 50; i++) circ(hash(i) * W, hash(i + 50) * 700, 2, 'rgba(255,255,255,.4)');
  ctx.fillStyle = '#1f2436'; ctx.fillRect(140, 680, 800, 880); for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) { const lit = hash(r * 6 + c + 3) > .3, x = 180 + c * 125, y = 720 + r * 105; ctx.fillStyle = lit ? 'rgba(255,207,138,.85)' : '#2a3048'; ctx.fillRect(x, y, 80, 70);
    if (lit && hash(r * 6 + c + 11) > .7 && t > 34.6) { ctx.fillStyle = 'rgba(10,10,20,.8)'; ctx.beginPath(); ctx.ellipse(x + 40, y + 50, 26, 34, 0, 0, Math.PI * 2); ctx.fill(); circ(x + 40, y + 14, 14, 'rgba(10,10,20,.8)'); } }
  label('ЭТО НЕ СКАЗКА', CX, 420, t, 27.6, C.cream, C.ink, 48); if (t > 33.2) label('МНОГИЕ СЕМЬИ', CX, 520, t, 33.2, C.yel, C.ink, 40); if (t > 34.6) label('ЗА ЗАКРЫТЫМИ ДВЕРЯМИ', CX, 620, t, 34.6, C.red, C.cream, 40); }
function o5(t) { ctx.fillStyle = '#e8eef5'; ctx.fillRect(0, 0, CX, H); ctx.fillStyle = '#0b0a14'; ctx.fillRect(CX, 0, CX, H);
  rr(110, 760, 320, 560, 12); ctx.fillStyle = '#9a6a4a'; ctx.fill(); circ(390, 1050, 14, C.yel); for (let i = 0; i < 4; i++) { circ(150 + i * 80, 1380, 22, ['#ff6fa8', '#ffd23f', '#ff9f43', '#c86fd6'][i]); ctx.fillStyle = '#3fbf6b'; ctx.fillRect(146 + i * 80, 1400, 8, 60); }
  txt('СНАРУЖИ', CX / 2, 520, 50, C.ink, { f: U, w: 800 }); txt('ВСЁ НОРМАЛЬНО', CX / 2, 600, 34, '#3a3a46');
  if (t > 40.4) { ogreShadow(CX + 270, 1100, .6, t, { a: .95, angry: 1 }); fig(CX + 120, 1400, .9, C.mom, t, { dress: 1, scared: 1 }); txt('ВНУТРИ', CX * 1.5, 520, 50, C.cream, { f: U, w: 800 }); txt('СТРАХ', CX * 1.5, 610, 60, C.red, { f: U, w: 800 }); } }
function o6(t) { ctx.fillStyle = '#07070d'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = .5; ogreShadow(CX, 1000, 1.2, t); ctx.restore();
  label('ЧЕМ ЗАКОНЧИЛОСЬ?', CX, 420, t, 42.9, C.red, C.cream, 48); txt('СМОТРИТЕ САМИ', CX, 540, 54, C.cream, { f: U, w: 800 });
  const k = pop(t, 46.6, .5); ctx.save(); ctx.translate(CX, 1180); ctx.scale(k, k); txt('THE OGRE', 0, 0, 120, C.yel, { f: U, w: 800 }); ctx.restore(); label('СТУДИЯ ZEILT', CX, 1310, t, 47.9, C.cream, C.ink, 34); }
function o7(t) { const g = ctx.createRadialGradient(CX, 900, 50, CX, 900, 1200); g.addColorStop(0, '#3a2a20'); g.addColorStop(1, '#120c0a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const lg = ctx.createRadialGradient(CX, 900, 20, CX, 900, 600); lg.addColorStop(0, 'rgba(255,184,107,.45)'); lg.addColorStop(1, 'rgba(255,184,107,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  txt('ВЫ НЕ ОДНИ', CX, 520, 84, C.cream, { f: U, w: 800 }); if (t > 53.2) { const k = pop(t, 53.3, .5); ctx.save(); ctx.translate(CX, 860); ctx.scale(k, k); txt('150', 0, 0, 280, C.warm, { f: U, w: 800 }); ctx.restore(); txt('ТЕЛЕФОН ДОВЕРИЯ', CX, 1060, 44, C.cream, { f: U, w: 800 }); }
  if (t > 55.9) label('КРУГЛОСУТОЧНО · БЕСПЛАТНО', CX, 1180, t, 56.0, C.warm, C.ink, 36); if (t > 56.8) txt('ЭКСТРЕННО — 102', CX, 1290, 38, 'rgba(244,234,216,.8)', { f: U, w: 800 }); }
function header(t) { ctx.fillStyle = 'rgba(7,7,13,.88)'; ctx.fillRect(0, 0, W, 250); txt('МУЛЬТФИЛЬМ, ПОСЛЕ КОТОРОГО', CX, 118, 44, C.cream, { f: U, w: 800 }); txt('ХОЧЕТСЯ МОЛЧАТЬ', CX, 188, 54, C.red, { f: U, w: 800 }); }
