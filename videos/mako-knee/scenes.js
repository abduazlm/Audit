// «Эндопротезирование колена на роботе Mako» — для dr_bulat_ (Булат Искаков, травматолог-ортопед, Астана).
// Timing: Whisper word starts on assets/vo.wav (ElevenLabs «Maxim — Premium Baritone», 0.5 s lead). Facts on screen come from the
// client's own post (20 лет, 10 000+ операций, −200 000 ₸ до 1 декабря); the Mako description is generic:
// CT-based 3D plan, the surgeon guides the arm, the system keeps the tool inside the planned boundary.
const VO = [0.5, 5.76, 15.86, 19.08, 25.52, 30.84, 38.98, 41.94, 52.46];
const DURATION = 61.8;
const SC = VO.map((s, i) => [i ? s - .3 : 0, i < VO.length - 1 ? VO[i + 1] - .3 : DURATION]);
const K = {
  shag: 1.94, vnutri: 4.54,
  hryash: 6.52, ischez: 8.18, kost: 9.32, lechenie: 11.56, endo: 14.44,
  robot: 17.58,
  snimki: 19.78, model: 23.06,
  plan: 27.0, razmer: 28.56, polozh: 29.24,
  rukoy: 31.84, sistema: 34.34, granicy: 35.96, tkani: 37.62,
  tochno: 39.88,
  bulat: 44.12, travm: 45.48, n20: 47.2, n10k: 49.18,
  skidka: 53.5, n200: 54.2, zapis: 57.3, ssylka: 58.88
};
const LABEL = 'ЭНДОПРОТЕЗИРОВАНИЕ НА MAKO';
const BONE = '#efe6d2', BONE2 = '#d6c9ad', CART = '#9fd8ff', METAL1 = '#f2f4f7', METAL2 = '#7d8794', SAFE = '#35e08a';
const docImg = new Image(); docImg.src = 'assets/doctor.jpg';

// ---------- props ----------
// knee joint, front view. o: wear 0..1 (cartilage thins, bones close up), pain 0..1, tib/ins/fem 0..1 implant parts, wire 0..1
function knee(x, y, s, t, o = {}) {
  const { wear = 0, pain = 0, tib = 0, ins = 0, fem = 0, wire = 0 } = o;
  const gap = lerp(34, 4, wear), th = lerp(22, 3, wear);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // tibia
  ctx.fillStyle = BONE; ctx.beginPath(); ctx.moveTo(-185, 40); ctx.quadraticCurveTo(0, 22, 185, 40); ctx.quadraticCurveTo(190, 120, 80, 200); ctx.lineTo(66, 560); ctx.lineTo(-66, 560); ctx.lineTo(-80, 200); ctx.quadraticCurveTo(-190, 120, -185, 40); ctx.fill();
  ctx.fillStyle = BONE2; ctx.beginPath(); ctx.moveTo(30, 210); ctx.lineTo(66, 560); ctx.lineTo(20, 560); ctx.closePath(); ctx.fill();
  if (!tib) { rr(-178, 26, 356, th, th / 2); ctx.fillStyle = CART; ctx.globalAlpha = lerp(1, .55, wear); ctx.fill(); ctx.globalAlpha = 1; }
  // femur (moves down as the cartilage wears away)
  ctx.save(); ctx.translate(0, -gap + (fem || ins || tib ? -30 : 0));
  ctx.fillStyle = BONE; ctx.beginPath(); ctx.moveTo(-70, -560); ctx.lineTo(70, -560); ctx.lineTo(86, -230); ctx.quadraticCurveTo(200, -150, 190, -60);
  ctx.arc(95, -60, 95, 0, Math.PI); ctx.arc(-95, -60, 95, 0, Math.PI); ctx.quadraticCurveTo(-200, -150, -86, -230); ctx.closePath(); ctx.fill();
  ctx.fillStyle = BONE2; ctx.beginPath(); ctx.moveTo(24, -560); ctx.lineTo(70, -560); ctx.lineTo(86, -230); ctx.lineTo(40, -230); ctx.closePath(); ctx.fill();
  if (!fem) { ctx.strokeStyle = CART; ctx.lineWidth = th; ctx.lineCap = 'round'; ctx.globalAlpha = lerp(1, .5, wear);
    [-95, 95].forEach(cx => { ctx.beginPath(); ctx.arc(cx, -60, 95 + th / 2, .12 * Math.PI, .88 * Math.PI); ctx.stroke(); }); ctx.globalAlpha = 1;
    if (wear > .5) { ctx.strokeStyle = BG; ctx.lineWidth = th + 4; for (let i = 0; i < 5; i++) { const a = (.2 + i * .15) * Math.PI; [-95, 95].forEach((cx, j) => { ctx.globalAlpha = (wear - .5) * 2; ctx.beginPath(); ctx.arc(cx, -60, 95 + th / 2, a + j * .07, a + .05 + j * .07); ctx.stroke(); }); } ctx.globalAlpha = 1; } }
  if (fem > 0) {                                                         // femoral component: polished cap sliding on from the front
    ctx.save(); ctx.globalAlpha = clamp(fem * 2); ctx.translate(0, (1 - eOut(fem)) * 260);
    const g = ctx.createLinearGradient(-200, 0, 200, 0); g.addColorStop(0, METAL2); g.addColorStop(.35, METAL1); g.addColorStop(.7, '#c3cad3'); g.addColorStop(1, METAL2);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-205, -120); ctx.lineTo(205, -120); ctx.lineTo(205, -60); ctx.arc(98, -60, 107, 0, Math.PI); ctx.arc(-98, -60, 107, 0, Math.PI); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-110, -30, 16, 50, .3, 0, 7); ctx.fill(); ctx.restore();
  }
  ctx.restore();
  if (tib > 0) {                                                         // tibial baseplate with a stem, rising into the bone
    ctx.save(); ctx.globalAlpha = clamp(tib * 2); ctx.translate(0, (1 - eOut(tib)) * -220);
    const g = ctx.createLinearGradient(-190, 0, 190, 0); g.addColorStop(0, METAL2); g.addColorStop(.4, METAL1); g.addColorStop(1, METAL2);
    ctx.fillStyle = g; rr(-190, 22, 380, 30, 10); ctx.fill(); ctx.beginPath(); ctx.moveTo(-26, 50); ctx.lineTo(26, 50); ctx.lineTo(12, 210); ctx.lineTo(-12, 210); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  if (ins > 0) { ctx.save(); ctx.globalAlpha = clamp(ins * 2); ctx.translate((1 - eOut(ins)) * -420, 0); rr(-180, -14, 360, 38, 16); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.fillStyle = 'rgba(160,190,220,.5)'; rr(-180, 8, 360, 16, 8); ctx.fill(); ctx.restore(); }
  if (wire > 0) {                                                        // 3D-model look: scan grid over the joint
    ctx.save(); ctx.globalAlpha = wire * .55; ctx.strokeStyle = YEL; ctx.lineWidth = 2;
    for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.ellipse(0, i * 100, 200 - Math.abs(i) * 14, 26, 0, 0, 7); ctx.stroke(); }
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 55, -560); ctx.quadraticCurveTo(i * 75, 0, i * 55, 560); ctx.stroke(); }
    ctx.restore();
  }
  if (pain > 0) for (let i = 0; i < 3; i++) { const p = (t * 1.4 + i / 3) % 1; ctx.strokeStyle = `rgba(255,59,48,${(1 - p) * pain})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 20, 60 + p * 230, 0, 7); ctx.stroke(); }
  if (pain > 0) { const g = ctx.createRadialGradient(0, 20, 0, 0, 20, 200); g.addColorStop(0, `rgba(255,59,48,${.55 * pain})`); g.addColorStop(1, 'rgba(255,59,48,0)'); ctx.fillStyle = g; ctx.fillRect(-220, -200, 440, 440); }
  ctx.restore();
}
// robotic arm: base (bx,by), two links by angles a1/a2 (radians from the base, pointing up-left), returns the tool tip
function robotArm(bx, by, a1, a2, s = 1, tool = true) {
  const l1 = 430 * s, l2 = 380 * s, j1 = [bx + Math.cos(a1) * l1, by + Math.sin(a1) * l1], j2 = [j1[0] + Math.cos(a2) * l2, j1[1] + Math.sin(a2) * l2];
  ctx.save(); ctx.lineCap = 'round';
  ctx.fillStyle = '#2a2f3a'; rr(bx - 120 * s, by - 20 * s, 240 * s, 150 * s, 24 * s); ctx.fill(); ctx.fillStyle = '#e9edf3'; rr(bx - 90 * s, by - 70 * s, 180 * s, 80 * s, 30 * s); ctx.fill();
  [[bx, by - 30 * s, j1, 86], [j1[0], j1[1], j2, 66]].forEach(([x, y, to, w]) => { ctx.strokeStyle = '#f3f5f8'; ctx.lineWidth = w * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(to[0], to[1]); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = w * s * .3; ctx.beginPath(); ctx.moveTo(x, y + 8 * s); ctx.lineTo(to[0], to[1] + 8 * s); ctx.stroke(); });
  [[bx, by - 30 * s, 56], [j1[0], j1[1], 50], [j2[0], j2[1], 38]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r * s, 0, 7); ctx.fillStyle = '#20242f'; ctx.fill(); ctx.beginPath(); ctx.arc(x, y, r * s * .45, 0, 7); ctx.fillStyle = YEL; ctx.fill(); });
  let tip = j2;
  if (tool) { const a = a2 + .25; tip = [j2[0] + Math.cos(a) * 150 * s, j2[1] + Math.sin(a) * 150 * s];
    ctx.strokeStyle = '#c3cad3'; ctx.lineWidth = 16 * s; ctx.beginPath(); ctx.moveTo(j2[0], j2[1]); ctx.lineTo(tip[0], tip[1]); ctx.stroke(); ctx.beginPath(); ctx.arc(tip[0], tip[1], 12 * s, 0, 7); ctx.fillStyle = WHITE; ctx.fill(); }
  ctx.restore(); return tip;
}
function goldText(s, x, y, size, align = 'center') {
  ctx.save(); ctx.font = font(900, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = `${-size * .02}px`;
  const g = ctx.createLinearGradient(0, y - size, 0, y); g.addColorStop(0, '#f6dc9a'); g.addColorStop(.6, '#e2b866'); g.addColorStop(1, '#a8782a');
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 24; ctx.fillStyle = g; ctx.fillText(s, x, y); ctx.restore();
}

// ---------- scenes ----------
function s1(t) {                                                          // hook: what is going on inside the knee
  const [a, b] = SC[0];
  const zoom = lerp(.8, 1.0, eInOut(prog(t, a, K.vnutri + .6)));
  knee(CX, 1180, zoom, t, { wear: .9, pain: .6 + .4 * Math.sin(t * 5) ** 2 });
  for (let i = 0; i < 3; i++) { const k = pop(t, K.shag - .9 + i * .35, .3); if (k > 0) { ctx.save(); ctx.globalAlpha = clamp(k) * .9; ctx.translate(160 + i * 110, 1700 - (i % 2) * 40); ctx.rotate(-.3); ctx.fillStyle = RED; ctx.beginPath(); ctx.ellipse(0, 0, 26, 44, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(0, -62, 16, 0, 7); ctx.fill(); ctx.restore(); } }
  plate('БОЛЬ ПРИ КАЖДОМ ШАГЕ', CX, 1790, t, K.shag - .6, b, { col: RED, ink: WHITE, size: 44 });
  title([['ПОЧЕМУ БОЛИТ', WHITE, 110], ['КОЛЕНО?', YEL, 150]], t, a, b, 420);
}
function s2(t) {                                                          // arthrosis → endoprosthesis
  const [a, b] = SC[1];
  const wear = eInOut(prog(t, K.hryash - .4, K.kost + .6));
  knee(CX, 1190, .9, t, { wear, pain: prog(t, K.kost - .2, K.kost + .4) * (1 - prog(t, K.endo - .6, K.endo)) * (.6 + .4 * Math.sin(t * 6) ** 2) });
  plate('ХРЯЩ ИСЧЕЗАЕТ', 280, 880, t, K.ischez - .5, K.lechenie, { col: WHITE, size: 38 });
  plate('КОСТЬ О КОСТЬ', 800, 1500, t, K.kost, K.endo - .4, { col: RED, ink: WHITE, size: 42 });
  plate('ЛЕЧЕНИЕ НЕ ПОМОГАЕТ', CX, 1740, t, K.lechenie, K.endo - .2, { col: WHITE, size: 36 });
  plate('ЭНДОПРОТЕЗ', CX, 1740, t, K.endo - .2, b, { size: 60 });
  title([['АРТРОЗ', YEL, 160]], t, a, b, 470);
}
function s3(t) {                                                          // the Mako robot enters
  const [a, b] = SC[2];
  const k = eOut(prog(t, a, a + .9));
  ctx.save(); ctx.translate((1 - k) * 500, 0); ctx.globalAlpha = k;
  const g = ctx.createRadialGradient(560, 1150, 0, 560, 1150, 620); g.addColorStop(0, 'rgba(226,184,102,.22)'); g.addColorStop(1, 'rgba(226,184,102,0)'); ctx.fillStyle = g; ctx.fillRect(0, 500, W, 1300);
  robotArm(760, 1560, -2.2 + Math.sin(t * 1.5) * .06, -2.95 + Math.sin(t * 2.1) * .1, 1.15);
  ctx.restore();
  plate('ПОМОЩНИК ХИРУРГА', CX, 1790, t, K.robot - .6, b, { col: WHITE, size: 40 });
  title([['РОБОТ', WHITE, 130], ['MAKO', YEL, 190]], t, a, b, 430);
}
function s4(t) {                                                          // CT slices → 3D model of this very knee
  const [a, b] = SC[3];
  const m = eInOut(prog(t, K.model - .9, K.model + .2));
  if (m < 1) for (let i = 0; i < 9; i++) {                                // CT slices dropping in
    const k = eOut(prog(t, a + .2 + i * .22, a + .6 + i * .22)); if (k <= 0) continue; const y = 820 + i * 95;
    ctx.save(); ctx.globalAlpha = k * (1 - m); ctx.translate(CX, y - (1 - k) * 80);
    ctx.fillStyle = 'rgba(159,216,255,.10)'; ctx.strokeStyle = CART; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 250, 46, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(239,230,210,.85)'; ctx.beginPath(); ctx.ellipse(-60 + Math.sin(i) * 20, 0, 70 - Math.abs(i - 4) * 6, 22, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(70, 0, 50 - Math.abs(i - 4) * 5, 18, 0, 0, 7); ctx.fill(); ctx.restore();
  }
  if (m < 1 && t > a + .2) { const sy = 800 + ((t - a) * 260) % 820; ctx.fillStyle = `rgba(159,216,255,${.5 * (1 - m)})`; ctx.fillRect(220, sy, 640, 6); }
  if (m > 0) { ctx.save(); ctx.globalAlpha = m; ctx.translate(CX, 0); ctx.scale(lerp(.78, 1, .5 + .5 * Math.cos(t * 1.6)), 1); ctx.translate(-CX, 0); knee(CX, 1200, .85, t, { wear: .9, wire: 1 }); ctx.restore(); }
  plate('КТ-СНИМКИ', 250, 1740, t, K.snimki, K.model, { col: WHITE, size: 40 });
  plate('ИМЕННО ВАШЕ КОЛЕНО', CX, 1790, t, K.model + .3, b, { size: 42 });
  title([['3D-МОДЕЛЬ', YEL, 130], ['ВАШЕГО КОЛЕНА', WHITE, 90]], t, a, b, 420);
}
function s5(t) {                                                          // planning: size and position of the implant
  const [a, b] = SC[4];
  knee(CX, 1200, .85, t, { wear: .9, wire: .6 });
  const cut = eInOut(prog(t, K.plan - .2, K.plan + .7));
  ctx.save(); ctx.strokeStyle = YEL; ctx.lineWidth = 5; ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 40;
  [[1090], [1236]].forEach(([y]) => { ctx.beginPath(); ctx.moveTo(CX - 250 * cut, y); ctx.lineTo(CX + 250 * cut, y); ctx.stroke(); });
  ctx.restore();
  // ghost implant blinking where it will sit
  const gk = prog(t, K.razmer - .3, K.razmer + .3); if (gk > 0) { ctx.save(); ctx.globalAlpha = gk * (.45 + .25 * Math.sin(t * 6)); ctx.strokeStyle = YEL; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(CX - 175, 1100); ctx.lineTo(CX + 175, 1100); ctx.lineTo(CX + 175, 1150); ctx.arc(CX + 83, 1150, 91, 0, Math.PI); ctx.arc(CX - 83, 1150, 91, 0, Math.PI); ctx.closePath(); ctx.stroke(); rr(CX - 162, 1222, 324, 26, 8); ctx.stroke(); ctx.restore(); }
  // dimension arrows
  const d1 = eOut(prog(t, K.razmer, K.razmer + .4)); if (d1 > 0) { ctx.save(); ctx.globalAlpha = d1; ctx.strokeStyle = WHITE; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(CX - 170, 1400); ctx.lineTo(CX + 170, 1400); ctx.moveTo(CX - 170, 1380); ctx.lineTo(CX - 170, 1420); ctx.moveTo(CX + 170, 1380); ctx.lineTo(CX + 170, 1420); ctx.stroke(); ctx.restore(); }
  const d2 = eOut(prog(t, K.polozh, K.polozh + .4)); if (d2 > 0) { ctx.save(); ctx.globalAlpha = d2; ctx.strokeStyle = SAFE; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(CX, 760); ctx.lineTo(CX, 1640); ctx.stroke(); ctx.beginPath(); ctx.arc(CX, 1165, 120, -Math.PI / 2 - .25 * d2, -Math.PI / 2 + .25 * d2); ctx.stroke(); ctx.restore(); }
  plate('РАЗМЕР', 240, 1400, t, K.razmer, b, { size: 40 });
  plate('ПОЛОЖЕНИЕ', 830, 900, t, K.polozh, b, { col: SAFE, ink: BG, size: 40 });
  plate('ЗАРАНЕЕ, ДО ОПЕРАЦИИ', CX, 1790, t, K.plan - .5, b, { col: WHITE, size: 38 });
  title([['ПЛАН', YEL, 150], ['ОПЕРАЦИИ', WHITE, 110]], t, a, b, 420);
}
function s6(t) {                                                          // the surgeon guides the arm; the system keeps it inside the plan
  const [a, b] = SC[5];
  knee(330, 1230, .72, t, { wear: .9 });
  // planned boundary (haptic zone)
  const zk = eOut(prog(t, K.sistema - .3, K.sistema + .4)), stop = Math.max(0, Math.sin(Math.PI * clamp(prog(t, K.granicy, K.granicy + 1.0))));
  if (zk > 0) { ctx.save(); ctx.globalAlpha = zk; ctx.strokeStyle = SAFE; ctx.lineWidth = 6; ctx.setLineDash([20, 12]); ctx.lineDashOffset = -t * 50; ctx.shadowColor = SAFE; ctx.shadowBlur = 24;
    rr(140, 1130, 380, 190, 30); ctx.stroke(); ctx.fillStyle = 'rgba(53,224,138,.10)'; ctx.fill(); ctx.restore(); }
  // tool tip sweeps inside the zone and is held at its edge
  const sweep = Math.sin(t * 2.2), tx = lerp(.1, 0, 0) + sweep * .1;
  const tip = robotArm(900, 1580, -2.05 + tx * .5 - stop * .04, -2.92 + sweep * .12, .92);
  if (stop > .2) { ctx.save(); ctx.globalAlpha = stop; ctx.strokeStyle = RED; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(528, 1140); ctx.lineTo(528, 1310); ctx.stroke(); ctx.restore(); plate('СТОП', 640, 1070, t, K.granicy, K.granicy + 1.1, { col: RED, ink: WHITE, size: 44 }); }
  ctx.beginPath(); ctx.arc(tip[0], tip[1], 20 + 6 * Math.sin(t * 10), 0, 7); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.stroke();
  plate('ГРАНИЦЫ ПЛАНА', 330, 1420, t, K.granicy - .2, b, { col: SAFE, ink: BG, size: 38 });
  plate('БЕРЕЖЁТ ЗДОРОВЫЕ ТКАНИ', CX, 1790, t, K.tkani - .5, b, { col: WHITE, size: 38 });
  title([['ХИРУРГ', WHITE, 120], ['УПРАВЛЯЕТ', YEL, 120]], t, a, b, 420);
}
function s7(t) {                                                          // the implant goes exactly into place
  const [a, b] = SC[6];
  knee(CX, 1190, .95, t, { wear: 1, tib: prog(t, a + .1, a + .8), ins: prog(t, a + .6, a + 1.3), fem: prog(t, a + 1.0, a + 1.8) });
  check(CX + 260, 1010, 1.6, pop(t, K.tochno + .5, .35), SAFE);
  if (t > K.tochno + .5) for (let i = 0; i < 2; i++) { const p = ((t - K.tochno) * .8 + i / 2) % 1; ctx.strokeStyle = `rgba(226,184,102,${(1 - p) * .7})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(CX, 1190, 240 + p * 200, 0, 7); ctx.stroke(); }
  title([['ТОЧНО', YEL, 150], ['НА МЕСТО', WHITE, 120]], t, a, b, 420);
}
function s8(t) {                                                          // the surgeon
  const [a, b] = SC[7];
  const k = eOut(prog(t, a, a + .6));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 60);
  ctx.save(); rr(110, 640, 440, 820, 36); ctx.clip(); if (docImg.complete && docImg.naturalWidth) { const z = 1.04 + .04 * prog(t, a, b), w = 440 * z, h = w * docImg.naturalHeight / docImg.naturalWidth; ctx.drawImage(docImg, 110 - (w - 440) / 2, 640 - (h - 820) / 3, w, h); }
  const g = ctx.createLinearGradient(0, 1200, 0, 1460); g.addColorStop(0, 'rgba(18,13,8,0)'); g.addColorStop(1, 'rgba(18,13,8,.85)'); ctx.fillStyle = g; ctx.fillRect(110, 1200, 440, 260); ctx.restore();
  ctx.strokeStyle = YEL; ctx.lineWidth = 5; rr(110, 640, 440, 820, 36); ctx.stroke(); ctx.restore();
  const k20 = eOut(prog(t, K.n20 - .2, K.n20 + .7)), k10 = eOut(prog(t, K.n10k - .2, K.n10k + 1.0));
  if (k20 > 0) { goldText(String(Math.round(20 * k20)), 790, 840, 190); txt('ЛЕТ В ПРОФЕССИИ', 790, 890, 30, WHITE); }
  if (k10 > 0) { goldText(Math.round(10000 * k10).toLocaleString('ru-RU').replace(/ /g, ' ') + '+', 790, 1130, 110); txt('ОПЕРАЦИЙ', 790, 1180, 30, WHITE); txt('ПО ЗАМЕНЕ СУСТАВОВ', 790, 1222, 26, GREY, 'center', 800); }
  plate('ТРАВМАТОЛОГ-ОРТОПЕД', CX, 1560, t, K.travm, b, { col: WHITE, size: 40 });
  plate('РОБОТИЗИРОВАННАЯ ХИРУРГИЯ MAKO', CX, 1680, t, K.travm + .5, b, { size: 34 });
  title([['ИСКАКОВ', WHITE, 120], ['БУЛАТ', YEL, 140]], t, K.bulat - .5, b, 420);
  if (t < K.bulat - .5) title([['ОПЕРАЦИИ', WHITE, 110], ['НА MAKO', YEL, 130]], t, a, K.bulat - .5, 420);
}
function s9(t) {                                                          // offer + CTA
  const [a, b] = SC[8];
  const g = ctx.createRadialGradient(CX, 900, 0, CX, 900, 700); g.addColorStop(0, 'rgba(226,184,102,.2)'); g.addColorStop(1, 'rgba(226,184,102,0)'); ctx.fillStyle = g; ctx.fillRect(0, 300, W, 1300);
  txt('ДО 1 ДЕКАБРЯ', CX, 560, 56, WHITE);
  const kn = eOut(prog(t, K.n200 - .4, K.n200 + .9));
  if (kn > 0) goldText('−' + Math.round(200000 * kn).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₸', CX, 850, 140);
  plate('НА ОПЕРАЦИЮ НА MAKO', CX, 980, t, K.n200 + .6, b + 1, { col: WHITE, size: 46 });
  const kb = pop(t, K.zapis - .2, .5);
  if (kb > 0) { pill(CX, 1290, kb, 'ЗАПИСАТЬСЯ', YEL, BG, t);
    const tap = K.zapis + .9, tp = Math.sin(Math.PI * prog(t, tap, tap + .25)), rp = prog(t, tap + .1, tap + .7);
    if (rp > 0 && rp < 1) { ctx.strokeStyle = `rgba(255,255,255,${1 - rp})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(CX + 190, 1300, 30 + rp * 150, 0, 7); ctx.stroke(); } }
  plate('ССЫЛКА В ПРОФИЛЕ', CX, 1480, t, K.ssylka - .2, b + 1, { col: WHITE, size: 40 });
  const ku = eOut(prog(t, K.ssylka + .2, K.ssylka + .7)); if (ku > 0) { ctx.save(); ctx.globalAlpha = ku; txt('@dr_bulat_', CX, 1600, 54, YEL); txt('Булат Искаков · травматолог-ортопед · Астана', CX, 1680, 28, GREY, 'center', 800); ctx.restore(); }
}
const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8, s9];
