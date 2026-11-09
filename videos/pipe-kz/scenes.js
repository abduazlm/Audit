// «Полиэтилен құбыр қалай жасалады» — Kerim Plastic Pipes, Kazakh. Timing: pauses + Whisper (kk) word starts on assets/vo.wav
// (ElevenLabs «Adi», 0.5 s lead). Generic PE pipe extrusion line: granules → hopper → extruder → die → vacuum tank & cooling →
// stripe & marking → haul-off → cutter / coiler. Pipe colours follow the client's logo.
const VO = [0.5, 5.9, 8.76, 17.34, 21.0, 27.2, 32.53, 39.73];
const DURATION = 45.6;
const SC = VO.map((s, i) => [i ? s - .3 : 0, i < VO.length - 1 ? VO[i + 1] - .3 : DURATION]);
const K = {
  granules: 4.04, bastalady: 4.74, bunker: 7.16,
  buranda: 9.48, itep: 10.78, n200: 11.78, balkyp: 14.7, massa: 15.82,
  kalyp: 18.4, pishin: 19.7,
  diametr: 23.3, salkyn: 26.0,
  zholak: 27.6, tanba: 28.18, kok: 29.42, sary: 30.88,
  tartady: 34.4, keskish: 35.24, kesedi: 37.16, oram: 38.26,
  astana: 40.76, kerim: 41.46
};
const LABEL = 'ҚҰБЫР ҚАЛАЙ ЖАСАЛАДЫ';
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

function pellet(x, y, r, col = '#e9edf3') { ctx.beginPath(); ctx.ellipse(x, y, r, r * .78, 0, 0, 7); ctx.fillStyle = col; ctx.fill(); }
function hopper(x, y, s) {                                               // funnel feeding the extruder
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#8e96a3'; ctx.beginPath(); ctx.moveTo(-170, -260); ctx.lineTo(170, -260); ctx.lineTo(50, 0); ctx.lineTo(-50, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6d7480'; ctx.fillRect(-50, 0, 100, 90); ctx.fillStyle = '#b9c0cc'; ctx.fillRect(-180, -280, 360, 30);
  ctx.restore();
}
function hotPipe(x1, x2, y, r, heat) {                                   // pipe whose colour cools from orange (heat 1) to black
  const g = ctx.createLinearGradient(x1, 0, x2, 0);
  heat.forEach(([p, h]) => g.addColorStop(p, `rgb(${lerp(22, 255, h) | 0},${lerp(24, 120, h) | 0},${lerp(29, 30, h) | 0})`));
  ctx.fillStyle = g; ctx.fillRect(x1, y - r, x2 - x1, 2 * r);
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x1, y - r * .7, x2 - x1, r * .18);
}

// ---------- scenes ----------
function s1(t) {                                                          // hook: the pipe falls apart into granules
  const [a, b] = SC[0];
  const br = eInOut(prog(t, K.granules - .4, K.granules + .8));
  if (br < 1) { ctx.save(); ctx.globalAlpha = 1 - br; pipeBody(160, 1100, 920, 1100, 120, null); pipeEnd(160, 1100, 120, 'pe'); ctx.restore(); }
  if (br > 0) for (let i = 0; i < 90; i++) {
    const x0 = 160 + hash(i) * 760, y0 = 1100 + (hash(i + 3) - .5) * 220, x1 = 140 + hash(i + 7) * 800, y1 = 1380 + hash(i + 9) * 260;
    pellet(lerp(x0, x1, br), lerp(y0, y1, br) - Math.sin(br * Math.PI) * 200 * hash(i + 2), 12, i % 5 ? '#5a6070' : '#e9edf3');
  }
  plate('ТҮЙІРШІКТЕР', CX, 1720, t, K.bastalady - .3, b, { size: 46 });
  title([['ҚҰБЫР', WHITE, 130], ['ҚАЛАЙ ЖАСАЛАДЫ?', YEL, 100]], t, a, b, 420);
}
function s2(t) {                                                          // granules pour into the hopper
  const [a, b] = SC[1];
  hopper(CX, 1300, 1.3 * pop(t, a + .1, .45));
  for (let i = 0; i < 40; i++) { const p = ((t * .8 + hash(i)) % 1); pellet(CX - 120 + hash(i + 4) * 240 + Math.sin(p * 6 + i) * 10, 640 + p * 340, 12, i % 4 ? '#5a6070' : '#e9edf3'); }
  for (let i = 0; i < 26; i++) pellet(CX - 150 + (i % 13) * 24, 1000 - Math.floor(i / 13) * 20 + Math.sin(t * 3 + i) * 2, 12, i % 4 ? '#5a6070' : '#e9edf3');
  plate('ПОЛИЭТИЛЕН', 260, 1560, t, a + .3, b, { col: WHITE, size: 40 });
  plate('БУНКЕР', 820, 1560, t, K.bunker - .3, b, { size: 44 });
  title([['ПОЛИЭТИЛЕН', WHITE, 100], ['ТҮЙІРШІКТЕРІ', YEL, 100]], t, a, b, 420);
}
function s3(t) {                                                          // extruder: the screw pushes and heats to ~200 °C, granules melt
  const [a, b] = SC[2];
  const x1 = 110, x2 = 970, y = 1080, r = 110;
  ctx.fillStyle = '#5a6476'; rr(x1 - 20, y - r - 20, x2 - x1 + 40, 2 * r + 40, 24); ctx.fill();
  ctx.fillStyle = '#20242f'; ctx.fillRect(x1, y - r, x2 - x1, 2 * r);
  const heat = eOut(prog(t, K.n200 - .6, K.balkyp + .6));
  for (let i = 0; i < 5; i++) { const hx = 230 + i * 160; ctx.fillStyle = `rgb(${lerp(110, 255, heat) | 0},${lerp(116, 70, heat) | 0},${lerp(128, 50, heat) | 0})`; ctx.fillRect(hx - 50, y - r - 34, 100, 2 * r + 68); }
  // the melt fills the barrel from the right as the granules soften
  const mf = eOut(prog(t, K.balkyp - .4, K.massa + .4));
  const g = ctx.createLinearGradient(x1, 0, x2, 0); g.addColorStop(0, 'rgba(255,120,30,0)'); g.addColorStop(clamp(1 - mf * .8), 'rgba(255,120,30,.15)'); g.addColorStop(1, `rgba(255,140,40,${.4 + .5 * mf})`);
  ctx.fillStyle = g; ctx.fillRect(x1, y - r, x2 - x1, 2 * r);
  for (let i = 0; i < 18; i++) { const p = ((t * .35 + i / 18) % 1), x = x1 + 30 + p * (x2 - x1 - 60); if (p > 1 - mf * .8) continue; pellet(x, y + (hash(i) - .5) * 120, 11, i % 4 ? '#3a3f4a' : '#e9edf3'); }
  // rotating screw: flights drift along the shaft
  ctx.save(); ctx.beginPath(); ctx.rect(x1, y - r, x2 - x1, 2 * r); ctx.clip();
  ctx.fillStyle = '#c4cad6'; ctx.fillRect(x1, y - 22, x2 - x1, 44);
  const off = (t * 140) % 90; ctx.strokeStyle = '#d7dbe3'; ctx.lineWidth = 16;
  for (let x = x1 - 90 + off; x < x2 + 90; x += 90) { ctx.beginPath(); ctx.moveTo(x - 40, y - r + 6); ctx.lineTo(x + 40, y + r - 6); ctx.stroke(); }
  ctx.restore();
  hopper(x1 + 90, y - r - 20, .45);
  const kt = pop(t, K.n200 - .3, .45); if (kt > 0) thermo(880, 1560, .8 * kt, '≈200°', HOT);
  plate('БҰРАНДА', 330, 1330, t, K.buranda, b, { col: WHITE, size: 38 });
  plate('БАЛҚЫМА', 330, 1470, t, K.balkyp, b, { col: HOT, ink: WHITE, size: 44 });
  title([['ЭКСТРУДЕР', YEL, 130]], t, a, b, 460);
}
function s4(t) {                                                          // the melt goes through the die and takes the pipe shape
  const [a, b] = SC[3];
  const y = 1120, grow = eOut(prog(t, a + .2, K.pishin + .6));
  ctx.fillStyle = '#5a6476'; rr(80, y - 200, 200, 400, 24); ctx.fill(); ctx.fillStyle = '#8e96a3'; rr(250, y - 150, 90, 300, 18); ctx.fill();
  hotPipe(330, 330 + 650 * grow, y, 120, [[0, 1], [1, .85]]);
  ctx.save(); ctx.translate(330 + 650 * grow, y); ctx.scale(.35, 1); ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fillStyle = '#ff8a2a'; ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fillStyle = '#20242f'; ctx.fill(); ctx.restore();
  // end-on ring forming
  const kr = pop(t, K.pishin - .3, .45); if (kr > 0) { ctx.save(); ctx.translate(CX, 1560); ctx.scale(kr, kr); ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fillStyle = '#ff8a2a'; ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 86, 0, 7); ctx.fillStyle = BG; ctx.fill(); ctx.restore(); }
  plate('ҚАЛЫП', 180, 860, t, K.kalyp - .3, b, { size: 44 });
  title([['ҚҰБЫР', WHITE, 120], ['ПІШІНІН АЛАДЫ', YEL, 100]], t, a, b, 420);
}
function s5(t) {                                                          // vacuum tank sets the diameter, water cools the pipe
  const [a, b] = SC[4];
  const y = 1120, cool = eInOut(prog(t, K.salkyn - 1.2, K.salkyn + .8));
  hotPipe(0, W, y, 110, [[0, 1], [.3, 1 - cool * .4], [.7, .8 - cool * .8], [1, .6 - cool * .6]]);
  ctx.fillStyle = 'rgba(58,167,255,.28)'; rr(260, y - 220, 560, 440, 30); ctx.fill(); ctx.strokeStyle = '#9ed3ff'; ctx.lineWidth = 6; ctx.stroke();
  for (let i = 0; i < 24; i++) { const p = ((t * .9 + hash(i)) % 1); ctx.fillStyle = `rgba(200,235,255,${.8 * (1 - p)})`; ctx.beginPath(); ctx.arc(280 + hash(i + 2) * 520, y + 200 - p * 400, 5 + hash(i + 5) * 7, 0, 7); ctx.fill(); }
  const kd = eOut(prog(t, K.diametr - .3, K.diametr + .3)); if (kd > 0) { ctx.save(); ctx.globalAlpha = kd; ctx.strokeStyle = YEL; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(900, y - 110); ctx.lineTo(900, y + 110); ctx.stroke();
    [[y - 110, 1], [y + 110, -1]].forEach(([yy, d]) => { ctx.beginPath(); ctx.moveTo(880, yy + d * 20); ctx.lineTo(900, yy); ctx.lineTo(920, yy + d * 20); ctx.stroke(); }); ctx.restore(); }
  plate('ВАКУУМ ВАННАСЫ', 540, 840, t, a + .3, b, { col: COLD, ink: WHITE, size: 40 });
  plate('ДИАМЕТР', 900, 1400, t, K.diametr, b, { size: 40 });
  plate('СУМЕН САЛҚЫНДАТУ', CX, 1600, t, K.salkyn - .3, b, { col: WHITE, size: 40 });
  title([['ВАКУУМ', WHITE, 120], ['ЖӘНЕ СУ', COLD, 120]], t, a, b, 420);
}
function s6(t) {                                                          // stripes & marking: blue = water, yellow = gas
  const [a, b] = SC[5];
  const ks = eInOut(prog(t, K.kok - .3, K.kok + .7)), ky = eInOut(prog(t, K.sary - .3, K.sary + .7));
  pipeBody(0, 980, W, 980, 100, null); ctx.fillStyle = COLD; ctx.fillRect(0, 980 - 62, W * ks, 12);
  pipeBody(0, 1300, W, 1300, 100, null); ctx.fillStyle = YEL; ctx.fillRect(0, 1300 - 62, W * ky, 12);
  // print head writes a running marking on the first pipe
  const kp = eOut(prog(t, K.tanba - .3, K.tanba + .2));
  if (kp > 0) { ctx.save(); ctx.globalAlpha = kp; ctx.fillStyle = '#8e96a3'; rr(560, 810, 140, 70, 10); ctx.fill(); ctx.fillStyle = YEL; ctx.fillRect(620, 880, 20, 20);
    ctx.beginPath(); ctx.rect(0, 990, 640, 60); ctx.clip(); ctx.font = font(800, 30); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const sh = (t - K.tanba) * 160; for (let i = 0; i < 4; i++) ctx.fillText('KERIM PLASTIC PIPES · ПЭ', 640 + sh - i * 520, 1020); ctx.restore(); }
  plate('КӨК — СУ', 260, 1120, t, K.kok, b, { col: COLD, ink: WHITE, size: 44 });
  plate('САРЫ — ГАЗ', 260, 1450, t, K.sary, b, { col: YEL, ink: BG, size: 44 });
  title([['ЖОЛАҚ', WHITE, 120], ['ЖӘНЕ ТАҢБА', YEL, 110]], t, a, b, 420);
}
function s7(t) {                                                          // haul-off, cutter, coil
  const [a, b] = SC[6];
  const y = 1050, run = (t * 120) % 60;
  pipeBody(0, y, W, y, 80, COLD);
  // caterpillar tracks above and below the pipe
  [-1, 1].forEach(sd => { ctx.fillStyle = '#3a3f4a'; rr(160, y + sd * 80 - (sd < 0 ? 60 : 0), 360, 60, 30); ctx.fill();
    ctx.fillStyle = '#c4cad6'; for (let x = 170 - run; x < 520; x += 60) if (x > 170) ctx.fillRect(x, y + sd * 80 - (sd < 0 ? 40 : -20) - 8, 30, 16); });
  // cutter blade drops on «кеседі»
  const cut = Math.sin(Math.PI * clamp(prog(t, K.kesedi - .2, K.kesedi + .4)));
  ctx.fillStyle = '#d7dbe3'; ctx.save(); ctx.translate(720, y - 220 + cut * 150); ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fill(); ctx.fillStyle = '#6d7480'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, 7); ctx.fill(); ctx.restore();
  if (t > K.kesedi + .1) { const sl = eOut(prog(t, K.kesedi + .1, K.kesedi + 1)); ctx.fillStyle = BG; ctx.fillRect(716 + sl * 40, y - 90, 8 + sl * 4, 180); }
  // coil spinning
  const kc = pop(t, K.oram - .3, .45); if (kc > 0) { ctx.save(); ctx.translate(CX, 1480); ctx.scale(kc, kc); ctx.rotate(t * 1.5);
    for (let i = 0; i < 5; i++) { ctx.strokeStyle = i % 2 ? '#1c1f26' : '#2a2f3a'; ctx.lineWidth = 34; ctx.beginPath(); ctx.arc(0, 0, 90 + i * 34, 0, 7); ctx.stroke(); }
    ctx.strokeStyle = COLD; ctx.lineWidth = 4; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(0, 0, 90 + i * 34, 0, 1.2); ctx.stroke(); } ctx.restore(); }
  plate('ТАРТҚЫШ', 340, 860, t, a + .3, b, { col: WHITE, size: 38 });
  plate('КЕСКІШ', 720, 760, t, K.keskish, b, { size: 40 });
  plate('ОРАМ', 900, 1700, t, K.oram, b, { col: WHITE, size: 40 });
  title([['КЕСУ', WHITE, 120], ['ЖӘНЕ ОРАУ', YEL, 110]], t, a, b, 420);
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
  plate('АСТАНАДАҒЫ ЗАУЫТ', CX, 1590, t, K.astana, b + 1, { col: WHITE, size: 38 });
  const kw = pop(t, K.kerim + .9, .45); if (kw > 0) { waApp(CX - 360, 1730, .8 * kw); ctx.save(); ctx.globalAlpha = clamp(kw); txt('WHATSAPP-ҚА ЖАЗЫҢЫЗ', CX + 40, 1730, 44, WHITE); ctx.restore(); }
}
const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8];
