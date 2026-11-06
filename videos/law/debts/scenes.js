// «Восстановление платёжеспособности: долги по графику до 5 лет» — timing from assets/vo-timing.json (Piper «Руслан»)
const VO = [0.5, 7.17, 14.57, 22.61, 32.12, 37.06, 44.16, 51.18, 58.59];
const DURATION = 67.09;
const SC = VO.map((s, i) => [i ? s - .3 : 0, i < VO.length - 1 ? VO[i + 1] - .3 : DURATION]);
const K = {
  kredity: .6, mikro: 1.26, kollektory: 2.5, kom: 4.66, nechem: 6.02,
  vyhod: 7.3, zakon: 10.02,
  tri: 15.48, vnesud: 16.58, sud: 18.1, vosst: 19.64,
  rassrochka: 25.14, n5: 27.86, ne_bankr: 29.06, grafiku: 31.0,
  uslovie: 32.5, dohod: 33.48, platit: 35.4,
  reshenie: 37.26, plan: 39.3, srok: 42.98,
  primer: 44.06, n125: 46.08, rassr2: 49.04, n5b: 49.88,
  kreditory: 51.28, otkazat: 53.42, podgotovit: 55.46,
  ponyat: 58.94, zayavku: 61.94, konsult: 63.2, schitaem: 64.32
};
const LABEL = 'ЮРИДИЧЕСКАЯ ПОМОЩЬ';

function s1(t) {                                                          // the debt snowball
  const [a, b] = SC[0];
  const r = lerp(90, 300, eInOut(prog(t, a + .2, K.nechem)));
  snowball(CX, 1150, r, t);
  [['КРЕДИТ', K.kredity], ['МИКРОЗАЙМ', K.mikro], ['ПЕНИ', K.kom - .4], ['ШТРАФ', K.kom]].forEach(([s, at], i) => {
    const k = eOut(prog(t, at, at + .4)); if (k <= 0) return; const ang = t * .9 + i * Math.PI / 2, rad = r + 90;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(CX + Math.cos(ang) * rad, 1150 + Math.sin(ang) * rad * .8); ctx.rotate(Math.sin(ang) * .2);
    rr(-100, -34, 200, 68, 12); ctx.fillStyle = i < 2 ? WHITE : '#ffe1df'; ctx.fill(); txt(s, 0, 3, 28, i < 2 ? INK : RED); ctx.restore();
  });
  const kc = pop(t, K.kollektory - .2, .4);
  if (kc > 0) { const sh = Math.sin(t * 40) * 4 * (Math.sin(t * 3) > 0 ? 1 : 0); phone(880 + sh, 760, .42 * kc, () => { txt('КОЛЛЕКТОР', 0, -40, 34, RED); txt('входящий…', 0, 20, 26, INK, 'center', 700); }); }
  plate('ПЛАТИТЬ НЕЧЕМ', CX, 1640, t, K.nechem - .3, b, { col: RED, ink: WHITE, size: 50 });
  title([['ДОЛГИ', WHITE, 120], ['РАСТУТ?', RED, 130]], t, a, b, 420);
}
function s2(t) {                                                          // there is a law for this
  const [a, b] = SC[1];
  lawBook(CX, 1120, 1.4, eInOut(prog(t, a + .4, K.zakon)));
  plate('ЗАКОН РК', CX, 1450, t, K.zakon - .3, b, { size: 56 });
  plate('О ВОССТАНОВЛЕНИИ ПЛАТЁЖЕСПОСОБНОСТИ И БАНКРОТСТВЕ ГРАЖДАН', CX, 1570, t, K.zakon + .3, b, { col: WHITE, size: 24 });
  title([['ВЫХОД', WHITE, 120], ['ЕСТЬ', YEL, 140]], t, a, b, 420);
}
function s3(t) {                                                          // three procedures, the third one is ours
  const [a, b] = SC[2];
  const items = [['ВНЕСУДЕБНОЕ БАНКРОТСТВО', K.vnesud], ['СУДЕБНОЕ БАНКРОТСТВО', K.sud], ['ВОССТАНОВЛЕНИЕ ПЛАТЁЖЕСПОСОБНОСТИ', K.vosst]];
  items.forEach(([s, at], i) => {
    const k = eOut(prog(t, at - .3, at + .1)); if (k <= 0) return; const y = 880 + i * 230, hot = i === 2 && t > K.vosst + .3, dim = i < 2 && t > K.vosst + .3;
    ctx.save(); ctx.globalAlpha = k * (dim ? .45 : 1); ctx.translate((1 - k) * 80, 0);
    if (hot) { ctx.shadowColor = YEL; ctx.shadowBlur = 40; }
    rr(110, y - 90, 860, 180, 26); ctx.fillStyle = hot ? YEL : BG2; ctx.fill(); ctx.shadowBlur = 0;
    txt(String(i + 1), 180, y + 4, 70, hot ? BG : YEL);
    let sz = 40; ctx.font = font(900, sz); while (ctx.measureText(s).width > 640) { sz -= 2; ctx.font = font(900, sz); }
    txt(s, 250, y + 4, sz, hot ? BG : WHITE, 'left'); ctx.restore();
  });
  title([['ТРИ', WHITE, 120], ['ПУТИ', YEL, 130]], t, a, b, 420);
}
function s4(t) {                                                          // instalments through the court, up to 5 years
  const [a, b] = SC[3];
  const fill = prog(t, K.rassrochka, K.grafiku + .6) * 60;
  for (let i = 0; i < 60; i++) {
    const r = Math.floor(i / 12), c = i % 12, x = 150 + c * 71, y = 860 + r * 92, k = clamp(fill - i);
    rr(x, y, 58, 70, 10); ctx.fillStyle = k > 0 ? `rgba(255,204,26,${.25 + .75 * k})` : 'rgba(255,255,255,.08)'; ctx.fill();
    if (c === 0) txt(`${r + 1} год`, 110, y + 35, 22, GREY, 'right', 800);
  }
  plate('ДО 5 ЛЕТ', CX, 1390, t, K.n5 - .2, b, { size: 64 });
  plate('ЭТО НЕ БАНКРОТСТВО', CX, 1530, t, K.ne_bankr, b, { col: WHITE, size: 40 });
  plate('ВЫ ПЛАТИТЕ ПО ГРАФИКУ', CX, 1650, t, K.grafiku - .4, b, { col: GREEN, ink: WHITE, size: 40 });
  title([['РАССРОЧКА', YEL, 120], ['ЧЕРЕЗ СУД', WHITE, 100]], t, a, b, 420);
}
function s5(t) {                                                          // the condition: stable income
  const [a, b] = SC[4];
  // salary coins drop into equal monthly bars
  for (let i = 0; i < 6; i++) {
    const x = 220 + i * 128, k = eOut(prog(t, K.dohod + i * .2, K.dohod + .4 + i * .2));
    rr(x - 40, 1350 - 260 * k, 80, 260 * k, 12); ctx.fillStyle = i % 2 ? YEL : '#ffd84d'; ctx.fill();
    txt(['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН'][i], x, 1390, 24, GREY, 'center', 800);
  }
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(150, 1360, 780, 4);
  if (t > K.dohod - .3) for (let i = 0; i < 6; i++) { const p = ((t - K.dohod) * .8 + i / 6) % 1; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * p); ctx.beginPath(); ctx.arc(220 + i * 128, lerp(820, 1080, p), 20, 0, 7); ctx.fillStyle = GREEN; ctx.fill(); txt('₸', 220 + i * 128, lerp(820, 1080, p) + 1, 22, WHITE); ctx.restore(); }
  plate('СТАБИЛЬНЫЙ ДОХОД', CX, 1540, t, K.dohod, b, { col: GREEN, ink: WHITE, size: 50 });
  plate('ПЛАТИТЬ ПО ПЛАНУ', CX, 1660, t, K.platit - .3, b, { col: WHITE, size: 40 });
  title([['ГЛАВНОЕ', WHITE, 120], ['УСЛОВИЕ', YEL, 120]], t, a, b, 420);
}
function s6(t) {                                                          // court decision → payment plan in time
  const [a, b] = SC[5];
  const hit = Math.max(0, Math.sin(Math.PI * prog(t, K.reshenie - .2, K.reshenie + .2)));
  gavel(300, 1080, 1.0, -.6 + hit * .6 + (t > K.reshenie + .2 ? .6 : 0) * 0);
  if (t > K.reshenie && t < K.reshenie + .5) { const p = prog(t, K.reshenie, K.reshenie + .5); ctx.strokeStyle = `rgba(255,204,26,${1 - p})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(250, 1170, 40 + p * 140, Math.PI, 0); ctx.stroke(); }
  paper(760, 1150, 1.15, 'ПЛАН', t, K.plan - .3, { rot: .04 });
  check(860, 1300, 1.1, pop(t, K.srok - .4, .3));
  const kc = pop(t, K.srok - .6, .4); if (kc > 0) clock(300, 1440, .8 * kc, t, YEL);
  plate('В УСТАНОВЛЕННЫЙ СРОК', CX, 1680, t, K.srok - .5, b, { size: 44 });
  title([['ПЛАН', YEL, 140], ['ПЛАТЕЖЕЙ', WHITE, 110]], t, a, b, 420);
}
function s7(t) {                                                          // real case: 12.5M tenge over 5 years
  const [a, b] = SC[6];
  const m = eOut(prog(t, K.n125 - .3, K.n125 + 1.0));
  ctx.save(); ctx.textAlign = 'center'; ctx.font = font(900, 120); ctx.fillStyle = YEL; ctx.shadowColor = 'rgba(255,204,26,.4)'; ctx.shadowBlur = 30;
  ctx.fillText(Math.round(12500000 * m).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₸', CX, 860); ctx.restore();
  // the snowball melts into five equal yearly bars
  const melt = eInOut(prog(t, K.rassr2 - .3, K.n5b + .6));
  if (melt < 1) { ctx.save(); ctx.globalAlpha = 1 - melt; snowball(CX, 1180, lerp(220, 40, melt), t); ctx.restore(); }
  for (let i = 0; i < 5; i++) { const k = eOut(prog(t, K.rassr2 + i * .15, K.rassr2 + .4 + i * .15)); if (k <= 0) continue;
    const x = 240 + i * 150; rr(x - 50, 1400 - 220 * k, 100, 220 * k, 12); ctx.fillStyle = YEL; ctx.fill(); txt(`${i + 1} год`, x, 1440, 26, WHITE, 'center', 800); }
  plate('ПРИМЕР ИЗ РЕАЛЬНОГО ДЕЛА', CX, 1600, t, K.primer, b, { col: WHITE, size: 36 });
  title([['12,5 МЛН ₸', YEL, 120], ['→ 5 ЛЕТ', WHITE, 110]], t, a, b, 420);
}
function s8(t) {                                                          // creditors may object, court may refuse
  const [a, b] = SC[7];
  for (let i = 0; i < 3; i++) { const k = pop(t, K.kreditory - .3 + i * .15, .4); if (k <= 0) continue;
    const x = 220 + i * 170; ctx.save(); ctx.globalAlpha = clamp(k); person(x, 1050, .6 * clamp(k, 0, 1.2), { col: '#52463b', bob: Math.sin(t * 3 + i) * 5 }); ctx.restore();
    xmark(x, 900, 1, pop(t, K.otkazat - .3 + i * .1, .3)); }
  const kl = pop(t, K.podgotovit - .6, .45);
  if (kl > 0) { ctx.save(); ctx.globalAlpha = clamp(kl); person(820, 1050, .8 * clamp(kl, 0, 1.2), { col: '#1e3a8a', head: '#3c5a8c', bob: Math.sin(t * 2) * 4 }); ctx.restore();
    paper(820, 1400, .7 * clamp(kl), 'РАСЧЁТЫ', t, K.podgotovit); }
  plate('СУД МОЖЕТ ОТКАЗАТЬ', 380, 1350, t, K.otkazat, b, { col: RED, ink: WHITE, size: 36 });
  plate('ВАЖНА ПОДГОТОВКА', CX, 1700, t, K.podgotovit, b, { size: 44 });
  title([['КРЕДИТОРЫ', RED, 110], ['ПРОТИВ', WHITE, 110]], t, a, b, 420);
}
function s9(t) {                                                          // CTA: free consultation
  const [a, b] = SC[8];
  cta(t, a, b, 'ПОСЧИТАЕМ ВАШ СЛУЧАЙ', K.konsult);
  const kc = pop(t, K.schitaem - .2, .4);
  if (kc > 0) { ctx.save(); ctx.translate(CX, 1640); ctx.scale(kc, kc); rr(-90, -120, 180, 240, 20); ctx.fillStyle = '#c9ced8'; ctx.fill(); rr(-70, -100, 140, 60, 8); ctx.fillStyle = '#1d2230'; ctx.fill();
    txt(String(Math.floor(t * 7) % 10 * 111111 % 999999).padStart(6, '0'), 0, -70, 30, GREEN);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { rr(-70 + c * 50, -20 + r * 45, 40, 36, 8); ctx.fillStyle = (r + c) % 4 ? '#eef1f6' : YEL; ctx.fill(); }
    ctx.restore(); }
}
const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8, s9];
