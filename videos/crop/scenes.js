// «Барбершоп CROP: продаётся бизнес» — раскадровка-аниматик для съёмки. Timing: Whisper word starts on assets/vo.wav
// (ElevenLabs «Artspace», 0.5 s lead). Each shot = a dashed frame with a line sketch of what to film, the shooting note under it,
// the final on-screen graphics over it (titles, plates, counters) and the voice line as a subtitle.
const VO = [0.5, 5.98, 13.92, 25.44, 37.98, 45.42, 54.34, 66.26, 71.26, 81.38];
const DURATION = 89.4;
const SC = VO.map((s, i) => [i ? s - .3 : 0, i < VO.length - 1 ? VO[i + 1] - .3 : DURATION]);
const K = {
  biznes: 2.66, crop: 4.52,
  centr: 7.22, astana: 10.18, prohod: 11.48, brend: 13.16,
  masterov: 14.66, admin: 15.68, dohod: 18.1, ploshad: 21.72, mest: 24.62,
  crm: 28.68, kaspi: 30.12, vypiski: 31.62, vyruchka: 33.36, n6: 34.14, okup: 35.92,
  potok: 38.3, bez: 40.56, avtomat: 44.06,
  let2: 46.68, n10k: 49.04, reiting: 51.96, gis: 52.46,
  n11: 57.04, processy: 60.28, marketing: 61.86, ceny: 64.28,
  prichina: 66.26, masshtab: 67.4,
  kluch: 72.46, garantiya: 73.16, bonus: 76.24, soprov: 77.2, mesyaca: 80.22,
  napishite: 81.38, otchet: 85.24, prosmotr: 87.16
};
const LABEL = 'РАСКАДРОВКА · CROP';
const SHOTS = [
  ['Внутри барбершопа, у ресепшен', 'Ведущий в кадре или плавный проезд камеры к стойке. Вывеска CROP в кадре.',
   'Продаётся прибыльный и системный бизнес в центре города. Барбершоп CROP.'],
  ['Карта района + видео двора', 'Карта: анимация с пином. Двор: общий план с людьми, дрон или с рук.',
   'Мы находимся в самом центре города, в одном из самых оживлённых районов Астаны. Высокая проходимость и узнаваемый бренд.'],
  ['Рабочие моменты', '3–4 плана по 2 с: стрижка, руки мастера, администратор. Общий план зала: 6 кресел.',
   'В команде 6 мастеров и 2 администратора… Площадь 92 м², 6 рабочих мест.'],
  ['Скрины CRM, Kaspi Pay, выписки', 'Запись экрана телефона и ноутбука. Личные данные клиентов замазать.',
   'Все цифры открыты: CRM, Kaspi Pay, выписки. Выручка — 6 млн в месяц. Окупаемость — 1,5 года.'],
  ['Администратор и онлайн-запись', 'Админ работает в CRM, на телефоне приходит запись. Владельца в кадре нет.',
   'Поток клиентов стабильный. Всё работает без участия владельца.'],
  ['Клиенты и отзывы', 'Довольные клиенты в креслах, улыбка в зеркале. Запись экрана 2ГИС с рейтингом.',
   'Работает более 2 лет. Более 10 000 клиентов. Высокий рейтинг в 2ГИС.'],
  ['Сеть CROP', 'Карта города с 11 филиалами + быстрые планы вывесок других филиалов.',
   'CROP — это бренд: 11 филиалов. Процессы, маркетинг сети, выгодные закупки.'],
  ['Владелец в кадре', 'Средний план, владелец говорит в камеру. Спокойно, честно.',
   'Причина продажи — масштабирование и новые проекты.'],
  ['На улице перед вывеской CROP', 'Владелец у входа, камера медленно отъезжает, вывеска читается.',
   'Передаём под ключ. Сопровождение нового владельца 1–2 месяца.'],
  ['Финальная карточка', 'Графика: WhatsApp, номер телефона, «Финансовый отчёт и просмотр».',
   'Напишите в WhatsApp или звоните, чтобы получить финансовый отчёт и записаться на просмотр!']
];

// ---------- storyboard chrome ----------
const FX = 70, FY = 620, FW = 940, FH = 820;
function frame(t, n) {                                                   // dashed shot frame + label + shooting note
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 4; ctx.setLineDash([22, 14]); ctx.lineDashOffset = -t * 20;
  rr(FX, FY, FW, FH, 28); ctx.stroke(); ctx.restore();
  ctx.save(); rr(FX + 24, FY + 24, 210, 56, 14); ctx.fillStyle = YEL; ctx.fill(); txt(`КАДР ${n + 1}/${SHOTS.length}`, FX + 129, FY + 54, 30, BG); ctx.restore();
  ctx.save(); txt(SHOTS[n][0].toUpperCase(), FX + 260, FY + 54, 28, WHITE, 'left'); ctx.restore();
  wrap('СНЯТЬ: ' + SHOTS[n][1], CX, FY + FH + 44, 28, GREY, 900, 800);
}
function wrap(s, x, y, size, col, maxW, w = 800) {                        // centred text, word-wrapped
  ctx.font = font(w, size); const words = s.split(' '); const lines = []; let cur = '';
  words.forEach(wd => { const tst = cur ? cur + ' ' + wd : wd; if (ctx.measureText(tst).width > maxW) { lines.push(cur); cur = wd; } else cur = tst; }); lines.push(cur);
  lines.forEach((l, i) => txt(l, x, y + i * size * 1.3, size, col, 'center', w));
  return lines.length;
}
function subtitle(n) {                                                   // the voice line under the frame
  ctx.save(); rr(70, 1620, 940, 190, 22); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill();
  txt('ОЗВУЧКА', 110, 1652, 22, YEL, 'left', 800); wrap(SHOTS[n][2], CX, 1700, 32, WHITE, 860, 800); ctx.restore();
}
const LINE = 'rgba(255,255,255,.8)';
function ln(pts, w = 5) { ctx.strokeStyle = LINE; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach(p => ctx.lineTo(...p)); ctx.stroke(); }
function circ(x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } else { ctx.strokeStyle = LINE; ctx.lineWidth = 5; ctx.stroke(); } }
function stick(x, y, s, t, seed = 0) {                                   // line-art person
  const b = Math.sin(t * 3 + seed) * 4; circ(x, y - 120 * s + b, 34 * s); ln([[x, y - 86 * s + b], [x, y + 20 * s]]);
  ln([[x - 60 * s, y - 40 * s + b], [x, y - 60 * s + b], [x + 60 * s, y - 40 * s + b]]); ln([[x - 40 * s, y + 110 * s], [x, y + 20 * s], [x + 40 * s, y + 110 * s]]);
}
function cropSign(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-150, -60, 300, 120, 14); ctx.fillStyle = '#0b0b0d'; ctx.fill(); ctx.strokeStyle = YEL; ctx.lineWidth = 5; ctx.stroke();
  ctx.font = `900 84px "Playfair Display", Georgia, serif`; ctx.fillStyle = WHITE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CROP', 0, 6); ctx.restore();
}
function chair(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-60, -170, 120, 90, 14); ctx.strokeStyle = LINE; ctx.lineWidth = 5; ctx.stroke(); rr(-70, -80, 140, 40, 10); ctx.stroke();
  ln([[0, -40], [0, 40]]); ln([[-50, 40], [50, 40]]); rr(-80, -330, 160, 130, 10); ctx.stroke(); ctx.restore();
}
function counter(v, x, y, size, col, suffix = '') { ctx.save(); ctx.font = font(900, size); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 20; ctx.fillText(Math.round(v).toLocaleString('ru-RU').replace(/ /g, ' ') + suffix, x, y); ctx.restore(); }

// ---------- shots ----------
function s1(t) {                                                          // reception, «ПРОДАЁТСЯ»
  const [a, b] = SC[0]; frame(t, 0);
  ln([[200, 1300], [880, 1300]]); rr(260, 1150, 560, 150, 16); ctx.strokeStyle = LINE; ctx.lineWidth = 5; ctx.stroke();
  stick(540, 1100, .9, t); cropSign(CX, 860, 1.1);
  const ks = pop(t, a + .2, .45);
  if (ks > 0) { ctx.save(); ctx.translate(CX, 1020); ctx.rotate(-.12); ctx.scale(ks, ks); ctx.strokeStyle = RED; ctx.lineWidth = 10; rr(-300, -70, 600, 140, 18); ctx.stroke(); txt('ПРОДАЁТСЯ', 0, 6, 92, RED); ctx.restore(); }
  title([['БИЗНЕС', WHITE, 120], ['В ЦЕНТРЕ ГОРОДА', YEL, 96]], t, a, b, 420);
  subtitle(0);
}
function s2(t) {                                                          // map with a pulsing pin, courtyard
  const [a, b] = SC[1]; frame(t, 1);
  ctx.save(); ctx.beginPath(); rr(FX + 10, FY + 100, FW - 20, FH - 110, 20); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 14; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(FX, FY + 140 + i * 110 + Math.sin(i) * 30); ctx.lineTo(FX + FW, FY + 180 + i * 100); ctx.stroke(); ctx.beginPath(); ctx.moveTo(FX + 90 + i * 140, FY); ctx.lineTo(FX + 60 + i * 150, FY + FH); ctx.stroke(); }
  ctx.restore();
  const pk = pop(t, K.centr - .3, .45); if (pk > 0) { ctx.save(); ctx.translate(CX, 1020); ctx.scale(pk, pk);
    for (let i = 0; i < 3; i++) { const p = (t * .8 + i / 3) % 1; ctx.strokeStyle = `rgba(255,204,26,${1 - p})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 40, 30 + p * 160, 0, 7); ctx.stroke(); }
    ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, -40, 50, Math.PI, 0); ctx.lineTo(0, 40); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, -40, 20, 0, 7); ctx.fillStyle = WHITE; ctx.fill(); ctx.restore(); }
  plate('ЦЕНТР АСТАНЫ', CX, 1180, t, K.astana - .3, b, { size: 44 });
  plate('ВЫСОКАЯ ПРОХОДИМОСТЬ', CX, 1300, t, K.prohod, b, { col: WHITE, size: 36 });
  title([['САМЫЙ', WHITE, 110], ['ЦЕНТР', YEL, 140]], t, a, b, 420);
  subtitle(1);
}
function s3(t) {                                                          // team & space: 6 masters, 2 admins, 92 m², 6 seats
  const [a, b] = SC[2]; frame(t, 2);
  for (let i = 0; i < 3; i++) chair(260 + i * 280, 1280, .8);
  for (let i = 0; i < 3; i++) stick(340 + i * 280, 1180, .55, t, i);
  const k6 = eOut(prog(t, K.masterov - .2, K.masterov + .6)), k2 = eOut(prog(t, K.admin - .2, K.admin + .5));
  if (k6 > 0) counter(6 * k6, 300, 880, 160, YEL); if (k6 > 0) txt('МАСТЕРОВ', 300, 920, 34, WHITE);
  if (k2 > 0) counter(2 * k2, 780, 880, 160, YEL); if (k2 > 0) txt('АДМИНИСТРАТОРА', 780, 920, 34, WHITE);
  plate('92 м²', 330, 1380, t, K.ploshad, b, { size: 56 });
  plate('6 РАБОЧИХ МЕСТ', 760, 1380, t, K.mest - .2, b, { col: WHITE, size: 40 });
  title([['СИЛЬНАЯ', WHITE, 110], ['КОМАНДА', YEL, 120]], t, a, b, 420);
  subtitle(2);
}
function s4(t) {                                                          // numbers: revenue counter, payback
  const [a, b] = SC[3]; frame(t, 3);
  ['CRM', 'KASPI PAY', 'ВЫПИСКИ'].forEach((s, i) => { const at = [K.crm, K.kaspi, K.vypiski][i], k = pop(t, at - .3, .4); if (k <= 0) return;
    ctx.save(); ctx.translate(230 + i * 310, 820); ctx.scale(k, k); rr(-120, -60, 240, 120, 18); ctx.strokeStyle = LINE; ctx.lineWidth = 5; ctx.stroke(); txt(s, 0, 2, 32, WHITE); ctx.restore(); check(320 + i * 310, 770, .8, pop(t, at, .3)); });
  const kv = eOut(prog(t, K.n6 - .3, K.n6 + 1.2));
  if (kv > 0) { counter(6000000 * kv, CX, 1100, 120, YEL, ' ₸'); txt('СРЕДНЕМЕСЯЧНАЯ ВЫРУЧКА', CX, 1150, 32, WHITE); }
  // payback bar fills to 1.5 years
  const kp = eInOut(prog(t, K.okup - .2, K.okup + 1.2));
  if (kp > 0) { rr(160, 1260, 760, 40, 20); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill(); rr(160, 1260, 760 * kp, 40, 20); ctx.fillStyle = GREEN; ctx.fill();
    txt('ОКУПАЕМОСТЬ 1,5 ГОДА', CX, 1350, 40, WHITE); }
  title([['ЦИФРЫ', WHITE, 120], ['ОТКРЫТЫ', YEL, 120]], t, a, b, 420);
  subtitle(3);
}
function s5(t) {                                                          // runs without the owner
  const [a, b] = SC[4]; frame(t, 4);
  stick(330, 1200, .9, t); rr(400, 1050, 260, 170, 12); ctx.strokeStyle = LINE; ctx.lineWidth = 5; ctx.stroke(); ln([[380, 1230], [680, 1230]]);
  // booking notifications popping on a phone
  ctx.save(); rr(740, 860, 200, 380, 26); ctx.strokeStyle = LINE; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
  for (let i = 0; i < 4; i++) { const k = eOut(prog(t, a + .4 + i * .7, a + .7 + i * .7)); if (k <= 0) continue; ctx.save(); ctx.globalAlpha = k; rr(755, 900 + i * 76, 170, 60, 12); ctx.fillStyle = 'rgba(46,204,113,.85)'; ctx.fill(); txt('ЗАПИСЬ', 840, 931 + i * 76, 24, WHITE); ctx.restore(); }
  const ko = pop(t, K.bez - .2, .45); if (ko > 0) { ctx.save(); ctx.translate(250, 860); ctx.scale(ko, ko); circ(0, 0, 70); txt('ВЛАДЕЛЕЦ', 0, 110, 24, GREY); ctx.strokeStyle = RED; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-60, -60); ctx.lineTo(60, 60); ctx.stroke(); ctx.restore(); }
  plate('ПОЛНОСТЬЮ АВТОМАТИЗИРОВАН', CX, 1380, t, K.avtomat - .3, b, { size: 38 });
  title([['РАБОТАЕТ', WHITE, 110], ['БЕЗ ВЛАДЕЛЬЦА', YEL, 104]], t, a, b, 420);
  subtitle(4);
}
function s6(t) {                                                          // 2+ years, 10 000+ clients, 2GIS rating
  const [a, b] = SC[5]; frame(t, 5);
  const kc = eOut(prog(t, K.n10k - .3, K.n10k + 1.2)); if (kc > 0) { counter(10000 * kc, CX, 960, 140, YEL, '+'); txt('ДОВОЛЬНЫХ КЛИЕНТОВ', CX, 1010, 34, WHITE); }
  plate('БОЛЕЕ 2 ЛЕТ', 300, 820, t, K.let2 - .3, b, { col: WHITE, size: 38 });
  for (let i = 0; i < 5; i++) { const k = pop(t, K.gis - .2 + i * .1, .3); if (k <= 0) continue; ctx.save(); ctx.translate(310 + i * 115, 1200); ctx.scale(k, k); ctx.fillStyle = YEL; ctx.beginPath();
    for (let j = 0; j < 10; j++) { const an = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 22 : 50; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fill(); ctx.restore(); }
  plate('РЕЙТИНГ 2ГИС: [ваша оценка]', CX, 1330, t, K.gis + .3, b, { col: GREEN, ink: WHITE, size: 34 });
  title([['10 000+', YEL, 130], ['КЛИЕНТОВ', WHITE, 110]], t, a, b, 420);
  subtitle(5);
}
function s7(t) {                                                          // the CROP network: 11 branches
  const [a, b] = SC[6]; frame(t, 6);
  for (let i = 0; i < 11; i++) { const k = pop(t, K.n11 - .5 + i * .08, .3); if (k <= 0) continue; const x = 180 + hash(i + 3) * 720, y = 760 + hash(i + 8) * 480;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = i === 0 ? RED : YEL; ctx.beginPath(); ctx.arc(0, -22, 26, Math.PI, 0); ctx.lineTo(0, 22); ctx.closePath(); ctx.fill(); ctx.restore(); }
  [['ГОТОВЫЕ ПРОЦЕССЫ', K.processy], ['МАРКЕТИНГ СЕТИ', K.marketing], ['ВЫГОДНЫЕ ЗАКУПКИ', K.ceny]].forEach(([s, at], i) => plate(s, CX, 1300 + i * 0, t, at - .2, i < 2 ? [K.marketing, K.ceny][i] - .2 : b, { col: WHITE, size: 36 }));
  title([['11', YEL, 150], ['ФИЛИАЛОВ CROP', WHITE, 96]], t, a, b, 420);
  subtitle(6);
}
function s8(t) {                                                          // reason for sale: the owner to camera
  const [a, b] = SC[7]; frame(t, 7);
  stick(CX, 1200, 1.4, t);
  for (let i = 0; i < 3; i++) { const p = (t * .9 + i / 3) % 1; ctx.strokeStyle = `rgba(255,255,255,${.6 * (1 - p)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(CX + 80, 1010, 40 + p * 60, -.6, .6); ctx.stroke(); }
  plate('МАСШТАБИРОВАНИЕ', CX, 1380, t, K.masshtab - .2, b, { size: 44 });
  title([['ПРИЧИНА', WHITE, 120], ['ПРОДАЖИ', YEL, 120]], t, a, b, 420);
  subtitle(7);
}
function s9(t) {                                                          // outside, in front of the CROP sign: turnkey + support
  const [a, b] = SC[8]; frame(t, 8);
  rr(200, 840, 680, 480, 10); ctx.strokeStyle = LINE; ctx.lineWidth = 5; ctx.stroke(); rr(470, 1080, 140, 240, 8); ctx.stroke();
  cropSign(CX, 930, 1.0); stick(330, 1250, .7, t);
  plate('ПОД КЛЮЧ', 720, 1220, t, K.kluch - .2, b, { size: 50 });
  plate('СОПРОВОЖДЕНИЕ 1–2 МЕСЯЦА', CX, 1380, t, K.soprov, b, { col: WHITE, size: 36 });
  title([['ПЕРЕДАЁМ', WHITE, 120], ['ПОД КЛЮЧ', YEL, 120]], t, a, b, 420);
  subtitle(8);
}
function s10(t) {                                                         // CTA card
  const [a, b] = SC[9]; frame(t, 9);
  cropSign(CX, 840, 1.3);
  const kw = pop(t, K.napishite - .2, .45); if (kw > 0) { ctx.save(); ctx.translate(CX, 1060); ctx.scale(kw, kw); rr(-380, -70, 760, 140, 70); ctx.fillStyle = '#25d366'; ctx.fill(); txt('WHATSAPP · [НОМЕР]', 0, 4, 48, WHITE); ctx.restore(); }
  plate('ФИНАНСОВЫЙ ОТЧЁТ', CX, 1230, t, K.otchet - .2, b + 1, { col: WHITE, size: 34 });
  plate('ЗАПИСЬ НА ПРОСМОТР', CX, 1340, t, K.prosmotr - .4, b + 1, { size: 34 });
  title([['ПИШИТЕ', WHITE, 120], ['ПРЯМО СЕЙЧАС', YEL, 110]], t, a, b + 1, 420);
  subtitle(9);
}
const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10];
