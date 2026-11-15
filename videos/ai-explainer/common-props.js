// ---------- props shared by the legal reels (inlined into each index.html by build.py) ----------
const INK = '#0c0e14';
function xmark(x, y, s, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
  ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fillStyle = RED; ctx.fill(); ctx.strokeStyle = WHITE; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-13, -13); ctx.lineTo(13, 13); ctx.moveTo(13, -13); ctx.lineTo(-13, 13); ctx.stroke(); ctx.restore(); }
function check(x, y, s, k, col = GREEN) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
  ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = WHITE; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-14, 1); ctx.lineTo(-4, 12); ctx.lineTo(15, -11); ctx.stroke(); ctx.restore(); }
function txt(s, x, y, size, col, align = 'center', w = 900) {
  ctx.font = font(w, size); ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
}
function phone(x, y, s, draw) {                                          // smartphone; draw() paints the screen (origin = screen centre)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-150, -290, 300, 580, 44); ctx.fillStyle = '#20242f'; ctx.fill();
  rr(-134, -262, 268, 524, 30); ctx.fillStyle = '#eef1f6'; ctx.fill();
  ctx.save(); rr(-134, -262, 268, 524, 30); ctx.clip(); if (draw) draw(); ctx.restore();
  rr(-40, -280, 80, 12, 6); ctx.fillStyle = '#20242f'; ctx.fill();
  ctx.restore();
}
function bankCard(x, y, s, rot, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 20; rr(-120, -76, 240, 152, 16); ctx.fillStyle = col; ctx.fill(); ctx.shadowBlur = 0;
  rr(-92, -30, 44, 34, 6); ctx.fillStyle = YEL; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 4; i++) rr(-92 + i * 48, 30, 38, 10, 5), ctx.fill();
  ctx.restore();
}
function paper(x, y, s, title, t, a, o = {}) {                            // document whose lines write themselves from time a
  const { lines = 6, w = 300, h = 400, rot = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 24; rr(-w / 2, -h / 2, w, h, 14); ctx.fillStyle = '#f6f7fb'; ctx.fill(); ctx.shadowBlur = 0;
  txt(title, 0, -h / 2 + 50, 30, INK);
  for (let i = 0; i < lines; i++) {
    const k = eOut(prog(t, a + i * .18, a + .3 + i * .18)); if (k <= 0) continue;
    const lw = (w - 80) * (i % 3 === 2 ? .6 : .9);
    rr(-w / 2 + 40, -h / 2 + 100 + i * 42, lw * k, 12, 6); ctx.fillStyle = '#b9c0cf'; ctx.fill();
  }
  ctx.restore();
}
function stamp(x, y, s, k, text) {
  if (k <= 0) return; const sc = lerp(1.8, 1, eOut(clamp(k)));
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.18); ctx.scale(s * sc, s * sc); ctx.globalAlpha = clamp(k * 2);
  ctx.strokeStyle = RED; ctx.lineWidth = 8; rr(-130, -50, 260, 100, 16); ctx.stroke(); txt(text, 0, 4, 40, RED);
  ctx.restore();
}
function folder(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#c9932e'; rr(-200, -150, 160, 50, 14); ctx.fill(); rr(-200, -120, 400, 270, 20); ctx.fill();
  ctx.fillStyle = '#f2b63d'; rr(-200, -70, 400, 220, 20); ctx.fill();
  ctx.restore();
}
function scales(x, y, s, t) {                                            // scales of justice, gently balancing
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = YEL; ctx.strokeStyle = YEL; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.fillRect(-8, -170, 16, 330); rr(-110, 150, 220, 30, 12); ctx.fill(); ctx.beginPath(); ctx.arc(0, -180, 18, 0, 7); ctx.fill();
  const a = Math.sin(t * 1.6) * .12; ctx.save(); ctx.translate(0, -150); ctx.rotate(a);
  ctx.beginPath(); ctx.moveTo(-220, 0); ctx.lineTo(220, 0); ctx.stroke();
  [-1, 1].forEach(sx => { ctx.save(); ctx.translate(sx * 210, 0); ctx.rotate(-a); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, 120); ctx.moveTo(0, 0); ctx.lineTo(60, 120); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 125, 80, 22, 0, 0, Math.PI); ctx.fill(); ctx.restore(); });
  ctx.restore(); ctx.restore();
}
function bankBuilding(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#c9ced8';
  ctx.beginPath(); ctx.moveTo(-170, -80); ctx.lineTo(0, -170); ctx.lineTo(170, -80); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 5; i++) ctx.fillRect(-140 + i * 64, -60, 30, 180); ctx.fillRect(-170, 120, 340, 30);
  txt('БАНК', 0, -105, 32, BG); ctx.restore();
}
function clock(x, y, s, t, col = RED) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fillStyle = BG2; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.stroke();
  ctx.lineCap = 'round'; ctx.strokeStyle = WHITE; ctx.lineWidth = 8;
  ctx.save(); ctx.rotate(t * 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -66); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.rotate(t * .35); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -42); ctx.stroke(); ctx.restore();
  ctx.restore();
}
function gavel(x, y, s, ang) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-130, 90, 260, 40, 12); ctx.fillStyle = '#7a4a24'; ctx.fill();
  ctx.save(); ctx.translate(90, 60); ctx.rotate(ang);
  rr(-200, -12, 200, 24, 10); ctx.fillStyle = '#a0672f'; ctx.fill(); rr(-250, -50, 90, 100, 18); ctx.fillStyle = '#7a4a24'; ctx.fill();
  ctx.restore(); ctx.restore();
}
function lawBook(x, y, s, open) {                                        // book that opens (open 0..1) with light rays
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (open > 0) { ctx.save(); ctx.globalAlpha = open * .5; ctx.fillStyle = YEL;
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(0, -20); const a = -Math.PI / 2 + (i - 3) * .22; ctx.lineTo(Math.cos(a - .05) * 420, Math.sin(a - .05) * 420); ctx.lineTo(Math.cos(a + .05) * 420, Math.sin(a + .05) * 420); ctx.fill(); }
    ctx.restore(); }
  const w = 220 * lerp(.5, 1, open);
  [-1, 1].forEach(sx => { ctx.save(); ctx.scale(sx, 1); ctx.beginPath(); ctx.moveTo(0, -120); ctx.quadraticCurveTo(w * .5, -140, w, -110); ctx.lineTo(w, 130); ctx.quadraticCurveTo(w * .5, 100, 0, 120); ctx.closePath();
    ctx.fillStyle = sx < 0 ? '#e9ecf3' : '#f6f7fb'; ctx.fill(); ctx.fillStyle = '#b9c0cf'; for (let i = 0; i < 5; i++) ctx.fillRect(30, -60 + i * 36, (w - 60) * open, 8); ctx.restore(); });
  ctx.fillStyle = '#7a2a2a'; rr(-12, -125, 24, 255, 8); ctx.fill();
  ctx.restore();
}
function snowball(x, y, r, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * .8);
  const g = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#a9bcd6');
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'rgba(80,100,140,.25)'; for (let i = 0; i < 9; i++) { const a = hash(i) * 6.28, d = r * .6 * hash(i + 2); ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r * .08, 0, 7); ctx.fill(); }
  ctx.restore();
}
function pill(x, y, s, text, col, ink, t) {                              // CTA button with a soft pulse
  const p = 1 + .03 * Math.sin(t * 5);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * p, s * p);
  ctx.font = font(900, 54); const w = ctx.measureText(text).width + 120;
  ctx.shadowColor = col; ctx.shadowBlur = 40; rr(-w / 2, -70, w, 140, 70); ctx.fillStyle = col; ctx.fill(); ctx.shadowBlur = 0;
  txt(text, 0, 4, 54, ink); ctx.restore();
}
function shieldT(x, y, s, k, text, col = '#1e3a8a') {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
  ctx.fillStyle = col; ctx.strokeStyle = YEL; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -90); ctx.lineTo(75, -65); ctx.quadraticCurveTo(75, 40, 0, 95); ctx.quadraticCurveTo(-75, 40, -75, -65); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore(); if (text) { ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k); txt(text, 0, 4, 26, WHITE); ctx.restore(); }
}
// final scene: free consultation call to action (same in both reels)
function cta(t, a, b, sub, tap) {
  const kb = pop(t, a + .4, .5);
  if (kb > 0) pill(CX, 1120, kb, 'ОСТАВИТЬ ЗАЯВКУ', YEL, BG, t);
  const tp = Math.sin(Math.PI * prog(t, tap, tap + .25)), rp = prog(t, tap + .1, tap + .7);
  if (rp > 0 && rp < 1) { ctx.strokeStyle = `rgba(255,255,255,${1 - rp})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(CX + 300, 1130, 30 + rp * 150, 0, 7); ctx.stroke(); }
  if (t > tap - .4) { ctx.save(); ctx.translate(CX + 320, 1215 - tp * 30); ctx.fillStyle = '#c99a6b'; rr(-30, -10, 60, 120, 28); ctx.fill(); rr(-16, -60, 32, 70, 16); ctx.fill(); ctx.restore(); }
  plate(sub, CX, 1360, t, a + 1.2, b + 1, { col: WHITE, size: 38 });
  title([['БЕСПЛАТНАЯ', YEL, 120], ['КОНСУЛЬТАЦИЯ', WHITE, 100]], t, a, b + 1, 470);
}
