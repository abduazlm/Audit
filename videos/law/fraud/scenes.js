// «Интернет-мошенничество: первые 24 часа» — timing: Whisper word starts on assets/vo.wav (ElevenLabs «Artspace», 0.5 s lead)
const VO = [0.5, 6.0, 16.22, 24.14, 31.78, 38.66, 47.68, 54.06, 62.74];
const DURATION = 70.3;
const SC = VO.map((s, i) => [i ? s - .3 : 0, i < VO.length - 1 ? VO[i + 1] - .3 : DURATION]);
const K = {
  bank: 1.4, nol: 4.3,
  zvonok: 6.0, ssylka: 8.24, kod: 10.26, raznye: 12.32, dengi: 14.78,
  cepochke: 18.14, vremeni: 20.46, dognat: 22.74,
  bank2: 27.0, zablok: 27.42, soobshite: 28.94,
  zayavlenie: 33.86, osnova: 35.6,
  skrin: 41.54, nomera: 42.96, ssylki: 43.64, cheki: 44.42, nichego: 45.74,
  forma: 50.76, antifrod: 51.72,
  zayavleniya: 56.4, dvizhenie: 57.6, vozvrat: 59.34,
  zayavku: 64.92, konsult: 66.1, razberem: 67.4
};
const LABEL = 'ЮРИДИЧЕСКАЯ ПОМОЩЬ';

function s1(t) {                                                          // «Вам пишет “банк”. Через три минуты на счету ноль.»
  const [a, b] = SC[0];
  const bal = Math.round(lerp(450000, 0, eInOut(prog(t, K.nol - 1.2, K.nol + .2))));
  phone(CX, 1130, 1.25, () => {
    txt('БАЛАНС', 0, -150, 26, GREY, 'center', 800);
    txt(bal.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₸', 0, -95, 50, bal ? INK : RED);
    const kn = pop(t, K.bank - .6, .4);
    if (kn > 0) { ctx.save(); ctx.translate(0, -215 + (1 - clamp(kn)) * -60); ctx.globalAlpha = clamp(kn);
      rr(-120, -40, 240, 80, 16); ctx.fillStyle = WHITE; ctx.fill(); ctx.strokeStyle = '#d0d5e0'; ctx.lineWidth = 2; ctx.stroke();
      txt('СЛУЖБА БЕЗОПАСНОСТИ', 0, -14, 16, RED); txt('Подтвердите код из СМС', 0, 14, 16, INK, 'center', 700); ctx.restore(); }
    for (let i = 0; i < 4; i++) { const k = eOut(prog(t, K.nol - 1 + i * .25, K.nol - .7 + i * .25)); if (k <= 0) continue;
      ctx.save(); ctx.globalAlpha = k; rr(-110, -10 + i * 64, 220, 50, 12); ctx.fillStyle = '#ffe1df'; ctx.fill(); txt('− перевод', -30, 15 + i * 64, 20, RED, 'center', 800); ctx.restore(); }
  });
  if (t > K.nol) { const fl = .5 + .5 * Math.sin(t * 14); ctx.save(); ctx.globalAlpha = .08 * fl; ctx.fillStyle = RED; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  plate('0 ₸', 860, 1500, t, K.nol, b, { col: RED, ink: WHITE, size: 64, rot: .05 });
  title([['3 МИНУТЫ', WHITE, 120], ['И НОЛЬ', RED, 130]], t, a, b, 420);
}
function s2(t) {                                                          // call, link, SMS code
  const [a, b] = SC[1];
  const cards = [['ЗВОНОК', '«служба безопасности»', K.zvonok, 'call'], ['ССЫЛКА', '«получите выплату»', K.ssylka, 'link'], ['КОД ИЗ СМС', '«назовите код»', K.kod, 'sms']];
  cards.forEach(([h, s, at, ic], i) => {
    const k = pop(t, at - .2, .4); if (k <= 0) return; const y = 860 + i * 230, sh = Math.sin(t * 3 + i) * 4;
    ctx.save(); ctx.translate(CX, y + sh); ctx.scale(k, k); rr(-420, -90, 840, 180, 28); ctx.fillStyle = BG2; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(-330, 0, 56, 0, 7); ctx.fillStyle = RED; ctx.fill();
    ctx.fillStyle = WHITE; ctx.strokeStyle = WHITE; ctx.lineWidth = 8; ctx.lineCap = 'round';
    if (ic === 'call') { ctx.beginPath(); ctx.arc(-330, 0, 26, Math.PI * .75, Math.PI * 1.75); ctx.stroke(); }
    if (ic === 'link') { ctx.beginPath(); ctx.ellipse(-345, 8, 18, 10, -.7, 0, 7); ctx.ellipse(-315, -8, 18, 10, -.7, 0, 7); ctx.stroke(); }
    if (ic === 'sms') txt('***', -330, 6, 34, WHITE);
    txt(h, -240, -24, 46, WHITE, 'left'); txt(s, -240, 32, 30, GREY, 'left', 800);
    ctx.restore();
  });
  plate('МОШЕННИЧЕСТВО', CX, 1620, t, K.raznye, b, { col: RED, ink: WHITE, size: 56, rot: -.03 });
  title([['СХЕМЫ', WHITE, 120], ['РАЗНЫЕ', YEL, 120]], t, a, b, 420);
}
function s3(t) {                                                          // money runs through a chain of cards
  const [a, b] = SC[2];
  const P = [[180, 900], [430, 1060], [650, 920], [860, 1100], [640, 1320], [380, 1440]];
  P.forEach(([x, y], i) => { const k = pop(t, a + .15 + i * .15, .35); if (k > 0) bankCard(x, y, .8 * k, (hash(i) - .5) * .3, ['#3a4152', '#4a3b52', '#3b5247', '#52463b', '#2f3a5a', '#5a2f3a'][i]); });
  if (t > K.cepochke - .5) for (let i = 0; i < 8; i++) {
    const p = (((t - K.cepochke) * .5 + i / 8) % 1 + 1) % 1, n = p * (P.length - 1), j = Math.floor(n), f = n - j;
    if (j >= P.length - 1) continue;
    const x = lerp(P[j][0], P[j + 1][0], f), y = lerp(P[j][1], P[j + 1][1], f);
    ctx.beginPath(); ctx.arc(x, y - 30, 18, 0, 7); ctx.fillStyle = YEL; ctx.fill(); txt('₸', x, y - 29, 22, BG);
  }
  const kc = pop(t, K.vremeni - .3, .4); if (kc > 0) clock(890, 680, .9 * kc, t);
  plate('КАЖДАЯ МИНУТА ВАЖНА', CX, 1680, t, K.vremeni, b, { col: RED, ink: WHITE, size: 44 });
  title([['ДЕНЬГИ', WHITE, 120], ['УБЕГАЮТ', RED, 120]], t, a, b, 420);
}
function stepBadge(n, t, a) {
  const k = pop(t, a + .1, .4); if (k <= 0) return;
  ctx.save(); ctx.translate(CX, 640); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fillStyle = YEL; ctx.fill(); txt(String(n), 0, 6, 80, BG); ctx.restore();
}
function s4(t) {                                                          // step 1: the bank
  const [a, b] = SC[3];
  stepBadge(1, t, a);
  phone(250, 1150, .75, () => { txt('ЗВОНОК В БАНК', 0, -60, 26, INK); for (let i = 0; i < 3; i++) { const p = (t * 1.2 + i / 3) % 1; ctx.strokeStyle = `rgba(46,204,113,${1 - p})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 60, 30 + p * 80, 0, 7); ctx.stroke(); } });
  bankBuilding(800, 1110, 1.0);
  arrow(400, 1100, 600, 1100, eInOut(prog(t, K.bank2 - .4, K.bank2 + .2)), YEL, 10);
  const kl = pop(t, K.zablok - .1, .4);
  if (kl > 0) { bankCard(CX, 1450, .9 * kl, 0, '#3a4152'); ctx.save(); ctx.translate(CX + 70, 1420); ctx.scale(kl, kl); ctx.strokeStyle = YEL; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, -26, 28, Math.PI, 0); ctx.stroke(); rr(-44, -26, 88, 66, 10); ctx.fillStyle = YEL; ctx.fill(); ctx.restore(); }
  plate('БЛОКИРОВКА КАРТЫ', CX, 1630, t, K.zablok, b, { size: 44 });
  plate('СООБЩИТЕ О МОШЕННИЧЕСТВЕ', CX, 1740, t, K.soobshite, b, { col: WHITE, size: 34 });
  title([['ШАГ 1', YEL, 90], ['БАНК', WHITE, 130]], t, a, b, 400);
}
function s5(t) {                                                          // step 2: police report
  const [a, b] = SC[4];
  stepBadge(2, t, a);
  paper(400, 1180, 1.25, 'ЗАЯВЛЕНИЕ', t, K.zayavlenie - .2, { rot: -.04 });
  stamp(430, 1330, 1, prog(t, K.osnova, K.osnova + .35), 'ПРИНЯТО');
  const kp = pop(t, a + .4, .45); if (kp > 0) { ctx.save(); ctx.globalAlpha = clamp(kp); person(830, 1150, .85 * clamp(kp, 0, 1.2), { col: '#2f6fdf', head: '#3c5a8c', badge: true, bob: Math.sin(t * 3) * 5 }); ctx.restore(); }
  plate('ОСНОВА ДЛЯ ВСЕХ ДЕЙСТВИЙ', CX, 1680, t, K.osnova, b, { size: 40 });
  title([['ШАГ 2', YEL, 90], ['ПОЛИЦИЯ', WHITE, 130]], t, a, b, 400);
}
function s6(t) {                                                          // step 3: keep the evidence
  const [a, b] = SC[5];
  stepBadge(3, t, a);
  folder(CX, 1250, 1.3);
  const items = [['СКРИНШОТЫ', K.skrin], ['НОМЕРА', K.nomera], ['ССЫЛКИ', K.ssylki], ['ЧЕКИ', K.cheki]];
  items.forEach(([s, at], i) => {
    const p = eInOut(prog(t, at - .2, at + .5)); if (p <= 0) return;
    const x0 = [160, 920, 160, 920][i], y0 = [820, 820, 1000, 1000][i], x1 = CX - 125 + (i % 2) * 250, y1 = 1110 + Math.floor(i / 2) * 64;
    ctx.save(); ctx.translate(lerp(x0, x1, p), lerp(y0, y1, p) - Math.sin(p * Math.PI) * 80); ctx.rotate((i - 1.5) * .1);
    rr(-110, -40, 220, 80, 12); ctx.fillStyle = WHITE; ctx.fill(); txt(s, 0, 4, 28, INK); ctx.restore();
  });
  plate('НИЧЕГО НЕ УДАЛЯЙТЕ', CX, 1640, t, K.nichego, b, { col: RED, ink: WHITE, size: 50 });
  title([['ШАГ 3', YEL, 90], ['ДОКАЗАТЕЛЬСТВА', WHITE, 110]], t, a, b, 400);
}
function s7(t) {                                                          // step 4: anti-fraud centre form
  const [a, b] = SC[6];
  stepBadge(4, t, a);
  const kw = eOut(prog(t, a + .3, a + .8));
  ctx.save(); ctx.globalAlpha = kw; rr(140, 820, 800, 640, 26); ctx.fillStyle = '#eef1f6'; ctx.fill(); ctx.fillStyle = '#d0d5e0'; rr(140, 820, 800, 70, 26); ctx.fill();
  [[190, '#ff5f57'], [230, '#febc2e'], [270, '#28c840']].forEach(([x, c]) => { ctx.beginPath(); ctx.arc(x, 855, 12, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  txt('Обращение', 200, 950, 38, INK, 'left');
  ['ФИО', 'Телефон', 'Что произошло'].forEach((s, i) => {
    const k = eOut(prog(t, K.forma - .6 + i * .4, K.forma - .2 + i * .4));
    rr(200, 1000 + i * 120, 680, 80, 14); ctx.fillStyle = WHITE; ctx.fill(); ctx.strokeStyle = '#c4cad6'; ctx.lineWidth = 3; ctx.stroke();
    txt(s, 230, 1040 + i * 120, 26, GREY, 'left', 700); if (k > 0) { ctx.fillStyle = '#9aa3b5'; rr(470, 1030 + i * 120, 360 * k, 18, 9); ctx.fill(); }
  });
  ctx.restore();
  shieldT(860, 820, 1.1, pop(t, K.antifrod - .2, .45), 'АНТИФРОД');
  check(CX, 1560, 1.6, pop(t, K.antifrod + .8, .35));
  plate('НАЦИОНАЛЬНЫЙ БАНК', CX, 1700, t, K.antifrod, b, { col: WHITE, size: 36 });
  title([['ШАГ 4', YEL, 90], ['АНТИФРОД-ЦЕНТР', WHITE, 100]], t, a, b, 400);
}
function s8(t) {                                                          // why a lawyer
  const [a, b] = SC[7];
  const ks = pop(t, a + .3, .5); if (ks > 0) scales(CX, 1060, .95 * ks, t);
  [['ЗАЯВЛЕНИЯ', K.zayavleniya], ['ДВИЖЕНИЕ ДЕЛА', K.dvizhenie], ['ВОЗВРАТ, ГДЕ ВОЗМОЖНО', K.vozvrat]].forEach(([s, at], i) => {
    plate(s, CX, 1420 + i * 120, t, at - .2, b, { col: i === 2 ? YEL : WHITE, size: 40 });
    check(CX - 330 - (i === 2 ? 40 : 0), 1420 + i * 120, .9, pop(t, at, .3));
  });
  if (t > K.vozvrat) for (let i = 0; i < 4; i++) { const p = ((t - K.vozvrat) * .6 + i / 4) % 1; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * p); ctx.beginPath(); ctx.arc(lerp(980, 640, p), 1040 - Math.sin(p * Math.PI) * 120, 18, 0, 7); ctx.fillStyle = YEL; ctx.fill(); ctx.restore(); }
  title([['ЗАЧЕМ', WHITE, 120], ['ЮРИСТ', YEL, 130]], t, a, b, 420);
}
function s9(t) {                                                          // CTA: free consultation
  const [a, b] = SC[8];
  cta(t, a, b, 'РАЗБЕРЁМ ВАШУ СИТУАЦИЮ', K.konsult);
  const kp = pop(t, a + .3, .5); if (kp > 0) shieldT(CX, 1640, 1.2, kp, '');
  if (kp > 0) check(CX, 1640, 1.3, kp, YEL);
}
const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8, s9];
