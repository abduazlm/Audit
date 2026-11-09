// «Как тепло приходит в дом» — Kerim Plastic Pipes. Timing: Whisper word starts on assets/vo.wav
// (ElevenLabs «Artspace», 0.5 s lead). Pipe colours follow the client's logo: black PE shell,
// yellow PU foam, steel core, blue stripe = water, yellow stripe = gas.
const VO = [0.5, 6.8, 12.16, 18.16, 25.58, 34.92, 44.36, 51.8];
const DURATION = 58.0;
const SC = VO.map((s, i) => [i ? s - .3 : 0, i < VO.length - 1 ? VO[i + 1] - .3 : DURATION]);
const K = {
  minus: 2.18, doma: 3.76, teplo: 4.0, otkuda: 4.92,
  tec: 8.02, nagrevayut: 9.0, otpravlyayut: 10.2, gorodu: 11.24,
  teplotrasse: 13.54, pod_zemlei: 15.02, kilometry: 16.9,
  rasteryat: 20.68, zemlya: 22.44, promerzaet: 24.44,
  ppu: 26.84, stal: 27.92, pena: 29.8, obolochka: 31.14, vnutri: 33.92,
  punkt: 36.34, podval: 36.84, batarei: 38.68, ostyvshaya: 39.6, vtoroi: 41.84, nagrev: 43.6,
  kommunik: 45.42, holodnaya: 46.8, kanaliz: 47.7, polietilen: 48.78, gaz: 50.3,
  truby: 51.8, astane: 53.48, zavod: 54.36, kerim: 54.76
};
const LABEL = 'КАК ТЕПЛО ПРИХОДИТ В ДОМ';
const HOT = '#ff4b3a', COLD = '#3aa7ff', FOAM = '#f3e3a0', STEEL = '#b9c0cc', SHELL = '#16181d', GOLD1 = '#f7d36b', GOLD2 = '#9a6a12';

// ---------- props ----------
function snow(t, n = 70) {
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (let i = 0; i < n; i++) {
    const x = (hash(i) * W + Math.sin(t * .8 + i) * 30 + W) % W, y = (hash(i + 9) * H + t * (60 + hash(i + 4) * 90)) % H;
    ctx.beginPath(); ctx.arc(x, y, 2 + hash(i + 2) * 4, 0, 7); ctx.fill();
  }
}
function ground(y, col = '#2a1f1a') {                                    // soil below y with a snow line
  const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, col); g.addColorStop(1, '#120d0b');
  ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
  ctx.fillStyle = '#e9f1ff'; ctx.fillRect(0, y - 14, W, 18);
}
function flowDots(pts, t, col, speed = .35, n = 10) {                     // dots running along a polyline
  let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  ctx.fillStyle = col;
  for (let k = 0; k < n; k++) {
    let p = (((t * speed + k / n) % 1) + 1) % 1 * L, i = 0;
    while (i < seg.length - 1 && p > seg[i]) p -= seg[i++];
    const f = clamp(p / seg[i]); const x = lerp(pts[i][0], pts[i + 1][0], f), y = lerp(pts[i][1], pts[i + 1][1], f);
    ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
  }
}
function polyline(pts, k, col, w) {                                      // line drawn up to fraction k
  let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let rem = L * clamp(k); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 0; i < seg.length && rem > 0; i++) { const f = Math.min(1, rem / seg[i]); ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)); rem -= seg[i]; }
  ctx.stroke();
}
function radiator(x, y, s, heat) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (heat > 0) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 120); g.addColorStop(0, `rgba(255,90,60,${.45 * heat})`); g.addColorStop(1, 'rgba(255,90,60,0)'); ctx.fillStyle = g; ctx.fillRect(-120, -120, 240, 240); }
  for (let i = 0; i < 6; i++) { rr(-66 + i * 23, -40, 18, 80, 8); ctx.fillStyle = heat > 0 ? `rgb(${lerp(190, 255, heat) | 0},${lerp(196, 90, heat) | 0},${lerp(206, 70, heat) | 0})` : '#c4cad6'; ctx.fill(); }
  ctx.restore();
}
function houseCut(x, y, s, t, o = {}) {                                  // two-storey house cut open; y = ground line
  const { heat = 0, risers = 0, back = 0, punkt = 0, flow = false } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // basement
  ctx.fillStyle = '#1d222c'; ctx.fillRect(-260, 0, 520, 200);
  // walls + floors
  ctx.fillStyle = '#e8dccb'; ctx.fillRect(-260, -560, 520, 560);
  ctx.fillStyle = '#ffcf7a'; ctx.globalAlpha = .25 + .55 * heat; ctx.fillRect(-235, -535, 470, 245); ctx.fillRect(-235, -265, 470, 245); ctx.globalAlpha = 1;
  ctx.fillStyle = '#b9a58b'; ctx.fillRect(-260, -290, 520, 26);
  // roof with snow
  ctx.fillStyle = '#7a2a2a'; ctx.beginPath(); ctx.moveTo(-300, -560); ctx.lineTo(0, -800); ctx.lineTo(300, -560); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4f8ff'; ctx.beginPath(); ctx.moveTo(-300, -560); ctx.lineTo(0, -800); ctx.lineTo(300, -560); ctx.lineTo(270, -560); ctx.lineTo(0, -770); ctx.lineTo(-270, -560); ctx.closePath(); ctx.fill();
  // windows (warm)
  [[-150, -440], [150, -440], [-150, -170], [150, -170]].forEach(([wx, wy]) => { rr(wx - 55, wy - 55, 110, 110, 8); ctx.fillStyle = `rgba(255,200,90,${.5 + .5 * heat})`; ctx.fill(); ctx.strokeStyle = '#6b5a45'; ctx.lineWidth = 6; ctx.stroke(); });
  // pipes: supply up the left, return down the right of the riser shaft
  const sup = [[-60, 150], [-60, -60], [-200, -60]], sup2 = [[-60, -60], [-60, -330], [-200, -330]];
  const ret = [[200, -330], [40, -330], [40, -60], [200, -60], [40, -60], [40, 150]];
  if (risers > 0) { polyline(sup, risers * 1.6, HOT, 14); polyline(sup2, risers * 1.6 - .6, HOT, 14); }
  if (back > 0) polyline(ret, back, COLD, 14);
  radiator(-190, -80, .8, heat); radiator(-190, -350, .8, heat); radiator(190, -80, .8, heat * .9); radiator(190, -350, .8, heat * .9);
  if (flow && risers >= 1) { flowDots([[-60, 150], [-60, -330], [-200, -330]], t, '#ffd1c9', .45, 6); }
  if (flow && back >= 1) flowDots(ret.slice(2), t, '#cfeaff', .35, 6);
  if (punkt > 0) { ctx.save(); ctx.globalAlpha = punkt; rr(-120, 70, 240, 110, 14); ctx.fillStyle = '#2f6fdf'; ctx.fill(); txt('ТЕПЛОВОЙ', 0, 108, 26, WHITE); txt('ПУНКТ', 0, 142, 26, WHITE); ctx.restore(); }
  ctx.restore();
}
function chp(x, y, s, t) {                                               // heat & power plant with smoking chimneys
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let c = 0; c < 2; c++) {                                          // steam
    for (let i = 0; i < 6; i++) { const p = ((t * .35 + i / 6 + c * .3) % 1); ctx.fillStyle = `rgba(230,236,245,${.5 * (1 - p)})`;
      ctx.beginPath(); ctx.arc(-120 + c * 120 + Math.sin(p * 4 + c) * 30, -560 - p * 300, 30 + p * 60, 0, 7); ctx.fill(); }
  }
  [-120, 0].forEach((cx, c) => { ctx.fillStyle = '#d7dbe3'; ctx.beginPath(); ctx.moveTo(cx - 30, -550); ctx.lineTo(cx + 30, -550); ctx.lineTo(cx + 45, -150); ctx.lineTo(cx - 45, -150); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 4; k++) { ctx.fillStyle = RED; ctx.fillRect(cx - 33 - k * 3, -530 + k * 100, 66 + k * 6, 30); } });
  ctx.fillStyle = '#5a6476'; ctx.fillRect(-260, -260, 420, 260); ctx.fillStyle = '#4a5366'; ctx.fillRect(140, -180, 160, 180);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { ctx.fillStyle = hash(r * 6 + c + Math.floor(t * 2)) > .3 ? 'rgba(255,204,26,.8)' : 'rgba(255,255,255,.12)'; ctx.fillRect(-235 + c * 65, -235 + r * 75, 40, 40); }
  ctx.restore();
}
function thermo(x, y, s, label, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-26, -180, 52, 230, 26); ctx.fillStyle = '#e9eef6'; ctx.fill(); ctx.beginPath(); ctx.arc(0, 70, 46, 0, 7); ctx.fill();
  ctx.fillStyle = col; rr(-12, -40, 24, 110, 12); ctx.fill(); ctx.beginPath(); ctx.arc(0, 70, 34, 0, 7); ctx.fill();
  txt(label, 0, -230, 64, col); ctx.restore();
}
function pipeEnd(x, y, r, type, t = 0) {                                 // pipe seen end-on, colours from the logo
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = SHELL; ctx.fill(); ctx.strokeStyle = '#3a3f4a'; ctx.lineWidth = r * .04; ctx.stroke();
  if (type === 'ppu') {
    ctx.beginPath(); ctx.arc(0, 0, r * .9, 0, 7); ctx.fillStyle = FOAM; ctx.fill();
    const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#e4e8ee'); g.addColorStop(1, '#6d7480');
    ctx.beginPath(); ctx.arc(0, 0, r * .55, 0, 7); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r * .45, 0, 7); ctx.fillStyle = '#0b0c10'; ctx.fill();
  } else { ctx.beginPath(); ctx.arc(0, 0, r * .84, 0, 7); ctx.fillStyle = '#07080b'; ctx.fill(); }
  ctx.restore();
}
function pipeBody(x1, y1, x2, y2, r, stripe) {                           // straight black PE pipe with an optional colour stripe
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1);
  ctx.save(); ctx.translate(x1, y1); ctx.rotate(a);
  const g = ctx.createLinearGradient(0, -r, 0, r); g.addColorStop(0, '#3b4049'); g.addColorStop(.35, '#16181d'); g.addColorStop(1, '#050608');
  ctx.fillStyle = g; ctx.fillRect(0, -r, L, 2 * r);
  if (stripe) { ctx.fillStyle = stripe; ctx.fillRect(0, -r * .62, L, r * .12); }
  ctx.restore();
}
function waApp(x, y, s) {                                                // generic chat bubble with a phone (WhatsApp-green)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#25d366'; ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-40, 40); ctx.lineTo(-62, 66); ctx.lineTo(-10, 56); ctx.fill();
  ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fill(); ctx.fillStyle = '#25d366'; ctx.beginPath(); ctx.arc(0, 0, 36, 0, 7); ctx.fill();
  ctx.strokeStyle = WHITE; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 18, Math.PI * .6, Math.PI * 1.4); ctx.stroke();
  ctx.restore();
}

// ---------- scenes ----------
function s1(t) {                                                          // winter −30, warm at home
  const [a, b] = SC[0];
  ground(1560); snow(t);
  houseCut(CX + 60, 1560, 1.0, t, { heat: eOut(prog(t, K.doma, K.teplo + .6)) });
  const kt = pop(t, K.minus - .3, .45); if (kt > 0) thermo(170, 1200, .9 * kt, '−30°', COLD);
  plate('ТЕПЛО', CX + 60, 1680, t, K.teplo, b, { col: HOT, ink: WHITE, size: 50 });
  title([['ОТКУДА', WHITE, 120], ['ТЕПЛО?', HOT, 140]], t, a, b, 420);
}
function s2(t) {                                                          // it all starts at the heat & power plant
  const [a, b] = SC[1];
  ground(1500); snow(t, 40);
  chp(330, 1500, .85 * pop(t, a + .1, .5), t);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#1b2130'; const hgt = 180 + hash(i + 30) * 260; ctx.fillRect(640 + i * 75, 1500 - hgt, 66, hgt); }
  const k = eInOut(prog(t, K.otpravlyayut - .3, K.gorodu + .4));
  polyline([[440, 1480], [1100, 1480]], k, HOT, 18);
  if (k >= 1) flowDots([[440, 1480], [1100, 1480]], t, '#ffd1c9', .5, 8);
  plate('ТЭЦ', 330, 1600, t, K.tec, b, { size: 56 });
  plate('НАГРЕВ ВОДЫ', 760, 1620, t, K.nagrevayut, b, { col: HOT, ink: WHITE, size: 40 });
  title([['ВСЁ НАЧИНАЕТСЯ', WHITE, 96], ['НА ТЭЦ', HOT, 130]], t, a, b, 420);
}
function s3(t) {                                                          // camera goes underground: the heating main runs for kilometres
  const [a, b] = SC[2];
  const cam = eInOut(prog(t, a, a + 1.2)) * 520;                        // the view sinks below the surface
  ctx.save(); ctx.translate(0, -cam + 520);
  for (let i = 0; i < 12; i++) { const hgt = 150 + hash(i + 50) * 320; ctx.fillStyle = '#1b2130'; ctx.fillRect(i * 95, 900 - hgt, 80, hgt);
    for (let w = 0; w < 4; w++) { ctx.fillStyle = hash(i * 7 + w) > .5 ? 'rgba(255,204,26,.6)' : 'rgba(255,255,255,.08)'; ctx.fillRect(i * 95 + 15, 900 - hgt + 25 + w * 50, 20, 20); } }
  ground(900, '#3a2a1f');
  for (let l = 0; l < 4; l++) { ctx.fillStyle = `rgba(0,0,0,${.08 + l * .05})`; ctx.fillRect(0, 1000 + l * 220, W, 4); }
  ctx.restore();
  const py = 1300, k = eInOut(prog(t, K.teplotrasse - .4, K.pod_zemlei + .6));
  pipeBody(0, py, W * k, py, 46, null); ctx.fillStyle = HOT; ctx.fillRect(0, py - 10, W * k, 20);
  if (k >= 1) flowDots([[0, py], [W, py]], t, '#ffd1c9', .45, 9);
  if (t > K.kilometry - .3) for (let i = 0; i < 3; i++) { const kk = pop(t, K.kilometry - .2 + i * .2, .3); if (kk <= 0) continue;
    const x = 220 + i * 320 - ((t - K.kilometry) * 60) % 320; ctx.save(); ctx.globalAlpha = clamp(kk); ctx.fillStyle = WHITE; ctx.fillRect(x - 2, py + 60, 4, 50); txt(`${i + 1} км`, x, py + 140, 36, WHITE); ctx.restore(); }
  plate('ТЕПЛОТРАССА', CX, 1060, t, K.teplotrasse, b, { col: HOT, ink: WHITE, size: 50 });
  plate('ИНОГДА — КИЛОМЕТРЫ', CX, 1600, t, K.kilometry, b, { size: 40 });
  title([['ПОД', WHITE, 120], ['ЗЕМЛЁЙ', HOT, 130]], t, a, b, 420);
}
function s4(t) {                                                          // bare pipe: the cold ground steals the heat
  const [a, b] = SC[3];
  ground(700, '#2b2420');
  const frost = prog(t, K.zemlya, K.promerzaet + .6);
  if (frost > 0) for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(190,225,255,${.5 * frost})`; const x = hash(i) * W, y = 760 + hash(i + 3) * 1000; ctx.save(); ctx.translate(x, y); ctx.rotate(i);
    for (let r = 0; r < 3; r++) { ctx.rotate(Math.PI / 3); ctx.fillRect(-12, -2, 24, 4); } ctx.restore(); }
  const py = 1180, cool = prog(t, K.rasteryat - .5, K.promerzaet + .4);
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, HOT); g.addColorStop(clamp(1 - cool * .9), HOT); g.addColorStop(1, COLD);
  ctx.fillStyle = '#8e96a3'; ctx.fillRect(0, py - 90, W, 180); ctx.fillStyle = g; ctx.fillRect(0, py - 66, W, 132);
  flowDots([[0, py], [W, py]], t, 'rgba(255,255,255,.7)', .4, 9);
  if (t > K.rasteryat - .5) for (let i = 0; i < 8; i++) { const p = ((t - K.rasteryat) * .7 + i / 8) % 1, x = 80 + (i % 4) * 300, up = i < 4 ? -1 : 1;
    ctx.strokeStyle = `rgba(58,167,255,${(1 - p) * .9})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x, py + up * (110 + p * 220), 50 + p * 60, up < 0 ? Math.PI * 1.15 : Math.PI * .15, up < 0 ? Math.PI * 1.85 : Math.PI * .85); ctx.stroke(); }
  const kt = pop(t, K.rasteryat, .4); if (kt > 0) thermo(900, 1660, .7 * kt, `${Math.round(lerp(90, 40, cool))}°`, cool > .5 ? COLD : HOT);
  plate('ТЕПЛО УХОДИТ', 300, 1560, t, K.rasteryat, b, { col: HOT, ink: WHITE, size: 44 });
  plate('ЗЕМЛЯ ПРОМЕРЗАЕТ', 330, 1700, t, K.promerzaet - .3, b, { col: COLD, ink: WHITE, size: 40 });
  title([['НЕ РАСТЕРЯТЬ', WHITE, 110], ['ТЕПЛО', HOT, 140]], t, a, b, 420);
}
function s5(t) {                                                          // PPU pipe assembles layer by layer
  const [a, b] = SC[4];
  const cx = CX, cy = 1120, R = 330;
  const shellK = eOut(prog(t, K.obolochka - .3, K.obolochka + .2)), foamK = eOut(prog(t, K.pena - .3, K.pena + .2)), steelK = eOut(prog(t, K.stal - .3, K.stal + .2));
  if (shellK > 0) { ctx.beginPath(); ctx.arc(cx, cy, R * shellK, 0, 7); ctx.fillStyle = SHELL; ctx.fill(); ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 14; ctx.stroke(); }
  if (foamK > 0) { ctx.beginPath(); ctx.arc(cx, cy, R * .9 * foamK, 0, 7); ctx.fillStyle = FOAM; ctx.fill();
    ctx.fillStyle = 'rgba(180,160,90,.35)'; for (let i = 0; i < 40; i++) { const an = hash(i) * 6.28, d = R * (.6 + .28 * hash(i + 1)) * foamK; ctx.beginPath(); ctx.arc(cx + Math.cos(an) * d, cy + Math.sin(an) * d, 5, 0, 7); ctx.fill(); } }
  if (steelK > 0) { const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R); g.addColorStop(0, '#eef1f5'); g.addColorStop(1, '#6d7480'); ctx.beginPath(); ctx.arc(cx, cy, R * .56 * steelK, 0, 7); ctx.fillStyle = g; ctx.fill(); }
  const water = pop(t, K.ppu - .2, .4); if (water > 0) { ctx.beginPath(); ctx.arc(cx, cy, R * .46 * clamp(water), 0, 7); ctx.fillStyle = HOT; ctx.fill(); }
  // heat stays inside: glow pulses inside, cold waves bounce off the shell
  if (t > K.vnutri - .4) { const p = .5 + .5 * Math.sin(t * 5); const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * .46); gl.addColorStop(0, `rgba(255,220,180,${.6 * p})`); gl.addColorStop(1, 'rgba(255,75,58,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy, R * .46, 0, 7); ctx.fill();
    for (let i = 0; i < 6; i++) { const q = ((t - K.vnutri) * .8 + i / 6) % 1, an = i * Math.PI / 3; ctx.strokeStyle = `rgba(58,167,255,${(1 - q) * .8})`; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(cx + Math.cos(an) * (R + 160 - q * 140), cy + Math.sin(an) * (R + 160 - q * 140), 40, an + Math.PI * .7, an + Math.PI * 1.3); ctx.stroke(); } }
  const lab = (s, at, ang, rr0) => { const k = eOut(prog(t, at, at + .3)); if (k <= 0) return; const x1 = cx + Math.cos(ang) * rr0, y1 = cy + Math.sin(ang) * rr0, x2 = cx + Math.cos(ang) * (R + 120), y2 = cy + Math.sin(ang) * (R + 120);
    ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = WHITE; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
    plate(s, x2 + (Math.cos(ang) > 0 ? 40 : -40), y2, t, at, b, { col: WHITE, size: 32 }); };
  lab('СТАЛЬ', K.stal + .1, -2.4, R * .5); lab('ППУ', K.pena + .1, -.7, R * .75); lab('ОБОЛОЧКА', K.obolochka + .1, .8, R * .97);
  plate('ТЕПЛО ОСТАЁТСЯ ВНУТРИ', CX, 1680, t, K.vnutri - .3, b, { col: HOT, ink: WHITE, size: 44 });
  title([['ППУ-ТРУБА', YEL, 130]], t, a, b, 460);
}
function s6(t) {                                                          // heat point in the basement → radiators → return
  const [a, b] = SC[5];
  ground(1460); snow(t, 30);
  houseCut(CX, 1460, 1.15, t, { punkt: eOut(prog(t, K.punkt - .3, K.punkt + .2)), risers: prog(t, K.punkt + .2, K.batarei + .4), heat: prog(t, K.batarei - .2, K.batarei + .6),
    back: prog(t, K.ostyvshaya - .2, K.vtoroi + .4), flow: true });
  const loop = eInOut(prog(t, K.vtoroi, K.nagrev + .3));                  // return goes back «на нагрев»
  if (loop > 0) { polyline([[CX + 46, 1640], [CX + 46, 1760], [-20, 1760]], loop, COLD, 14); polyline([[-20, 1700], [CX - 69, 1700], [CX - 69, 1640]], loop, HOT, 14); }
  plate('НА НАГРЕВ', 900, 1720, t, K.nagrev - .2, b, { col: COLD, ink: WHITE, size: 34 });
  title([['ДО БАТАРЕЙ', HOT, 110], ['И ОБРАТНО', COLD, 110]], t, a, b, 420);
}
function s7(t) {                                                          // other utilities next to the heating main
  const [a, b] = SC[6];
  ground(1000); snow(t, 20);
  houseCut(CX, 1000, .45, t, { heat: 1 });
  const rows = [['ОТОПЛЕНИЕ — ППУ', 1180, null, HOT, a], ['ХОЛОДНАЯ ВОДА — ПЭ', 1340, COLD, null, K.holodnaya], ['КАНАЛИЗАЦИЯ — ПЭ', 1500, '#8d6e63', null, K.kanaliz], ['ГАЗ', 1660, YEL, null, K.gaz]];
  rows.forEach(([lab, y, stripe, core, at], i) => {
    const k = eInOut(prog(t, at - .2, at + .5)), dim = i === 0 ? .5 : 1; if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = dim; pipeBody(0, y, W * k, y, 44, stripe); if (core) { ctx.fillStyle = core; ctx.fillRect(0, y - 8, W * k, 16); } ctx.restore();
    if (i > 0 && t > at) { const gl = .5 + .5 * Math.sin(t * 6); ctx.strokeStyle = `rgba(255,255,255,${.25 * gl})`; ctx.lineWidth = 6; ctx.strokeRect(-10, y - 54, W + 20, 108); }
    plate(lab, i === 0 ? 290 : 760, y - 70, t, at + .1, b, { col: i === 0 ? WHITE : (stripe === YEL ? YEL : WHITE), size: 30 });
  });
  plate('ПОЛИЭТИЛЕНОВЫЕ ТРУБЫ', CX, 1790, t, K.polietilen, b, { size: 34 });
  title([['РЯДОМ —', WHITE, 100], ['ДРУГИЕ СЕТИ', YEL, 110]], t, a, b, 420);
}
function s8(t) {                                                          // logo (redrawn after the client's logo) + WhatsApp
  const [a, b] = SC[7];
  const k = eOut(prog(t, a, a + .8));
  ctx.save(); ctx.translate(0, (1 - k) * 80); ctx.globalAlpha = k;
  pipeBody(320, 760, 1180, 560, 150, null); pipeEnd(320, 760, 150, 'ppu');
  pipeBody(560, 900, 1180, 760, 105, COLD); pipeEnd(560, 900, 105, 'pe');
  pipeBody(760, 1010, 1180, 920, 78, YEL); pipeEnd(760, 1010, 78, 'pe');
  ctx.restore();
  ['KERIM', 'PLASTIC', 'PIPES'].forEach((w, i) => {
    const kk = eOut(prog(t, K.kerim - .4 + i * .18, K.kerim + i * .18)); if (kk <= 0) return;
    ctx.save(); ctx.globalAlpha = kk; ctx.translate(CX, 1250 + i * 125 + (1 - kk) * 30);
    ctx.font = `900 130px "Playfair Display", Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const g = ctx.createLinearGradient(0, -110, 0, 10); g.addColorStop(0, GOLD1); g.addColorStop(.55, '#d9a531'); g.addColorStop(1, GOLD2);
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; ctx.fillStyle = g; ctx.fillText(w, 0, 0);
    const sh = ((t * .6) % 1.6) - .3; ctx.globalCompositeOperation = 'source-atop'; const g2 = ctx.createLinearGradient(-400 + sh * 800, 0, -250 + sh * 800, 0);
    g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(.5, 'rgba(255,255,240,.55)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g2; ctx.fillText(w, 0, 0);
    ctx.restore();
  });
  plate('ЗАВОД В АСТАНЕ', CX, 1590, t, K.astane, b + 1, { col: WHITE, size: 38 });
  const kw = pop(t, K.kerim + .9, .45); if (kw > 0) { waApp(CX - 330, 1730, .8 * kw); ctx.save(); ctx.globalAlpha = clamp(kw); txt('ПИШИТЕ В WHATSAPP', CX + 40, 1730, 44, WHITE); ctx.restore(); }
}
const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8];
