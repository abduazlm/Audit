"""Заголовки для говорящей головы (Reels 1080×1920) — скилл Алексея Гвоздарева (@alexgvozdarev).

    python titles.py plan.json              рендер: исходник + заголовки → output из плана (звук исходника сохраняется)
    python titles.py plan.json --sheet      контакт-лист: по 3 кадра каждого заголовка → <output>_sheet.jpg (проверить до рендера)
    python titles.py plan.json --only 1,3   рендерить только эти заголовки (номера по порядку в плане, с 1)
    python titles.py plan.json --fast       без моушн-блюра (в 3 раза быстрее, для черновика)
    python titles.py --list                 стили и их настройки

plan.json:
    {"input": "talk.mp4", "output": "talk_titles.mp4",
     "titles": [{"style": "grain",   "t0": 0.0, "t1": 2.4, "word": "ЗАГОЛОВКИ"},
                {"style": "archive", "t0": 4.1, "t1": 9.0, "line1": "Дизайн", "line2": "свежий", "label": "STUDIO"},
                {"style": "button",  "t0": 12.0, "t1": 17.5, "line1": "Все", "pin": "мои", "line2": "Правила"},
                {"style": "ransom",  "t0": 20.0, "t1": 23.0, "lines": ["ТВОЙ", "БРЕНД"]}]}

Время t0/t1 — секунды ИСХОДНИКА. Исходник любого размера приводится к 1080×1920, 30 к/с (обрезка по центру).
Зависимости: pip install "rembg[cpu]" opencv-python-headless playwright   + ffmpeg в PATH
             + Google Chrome (или: python -m playwright install chromium).
"""
import base64
import io
import json
import os
import random
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 30
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.normpath(os.path.join(HERE, '..', 'fonts'))
HTML = os.path.join(HERE, 'titles.html')

STYLES = {
    'archive': 'T2 «Дизайн архив»: каллиграфическая заглавная + жирный гротеск, квадрат→стрелка, подпись, ®, рукописная буква во 2-й строке. '
               'line1, line2, label, small:[2 строки], big, small_at, big_at, hand (номер буквы line2 или false), top, width, color, chest_y',
    'button': 'T3 «Пуговка»: 1-я строка контуром, 2-я с антиквенной заглавной, маленький овал-пуговка со словом сцепляет строки, DIN-строки печатаются. '
              'line1, pin, line2, pin_at, line2_at, small, big, small_at, big_at, top, width, color, chest_y',
    'grain': 'Слово из зерна: капсом за головой, буквы собираются из пыли. word, y (430), size (300, ужмётся по ширине), font ("cond"|"sans"), color',
    'ransom': 'Буквы-вырезки: бумажный фон, человек вырезан, слова из журнальных букв. lines:[1–2 коротких слова], ys:[420,590], step (0.12)',
}

# ─────────────────────────────── плавности и помощники ───────────────────────────────


def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def eio(x):
    x = clamp(x)
    return 4 * x * x * x if x < .5 else 1 - (-2 * x + 2) ** 3 / 2


def under_person(base, rgba, m):
    """слой ЗА человеком: рисуется на фоне, человек остаётся спереди"""
    a = rgba[..., 3:4].astype(np.float32) / 255. * (1 - m[..., None])
    return base * (1 - a) + rgba[..., :3].astype(np.float32) * a


def over(base, rgba, x=0, y=0):
    h, w = rgba.shape[:2]
    x0, y0, x1, y1 = max(0, x), max(0, y), min(base.shape[1], x + w), min(base.shape[0], y + h)
    if x0 >= x1 or y0 >= y1:
        return base
    sub = rgba[y0 - y:y1 - y, x0 - x:x1 - x].astype(np.float32)
    a = sub[..., 3:4] / 255.
    base[y0:y1, x0:x1] = base[y0:y1, x0:x1] * (1 - a) + sub[..., :3] * a
    return base


def shadow_of(rgba, a=.5, blur=12, dy=5):
    """мягкая тень под слоем (читаемость белого текста на светлой стене)"""
    al = cv2.GaussianBlur(rgba[..., 3].astype(np.float32) * a, (0, 0), blur)
    sh = np.zeros_like(rgba)
    sh[..., 3] = np.clip(np.roll(al, dy, 0), 0, 255)
    return sh

# ─────────────────────────────── человек ───────────────────────────────


class Person:
    """маска человека (rembg), сглажена по времени; считается только на кадрах с заголовками"""

    def __init__(self, model='u2net_human_seg', work=640):
        self.model, self.work = model, work
        self.session = None
        self.prev_m, self.prev_i = None, -10

    def mask(self, rgb, i):
        if self.session is None:
            from rembg import new_session
            self.session = new_session(self.model)
        from rembg import remove
        s = self.work / max(W, H)
        small = Image.fromarray(rgb).resize((int(W * s), int(H * s)), Image.BILINEAR)
        m = np.asarray(remove(small, session=self.session, only_mask=True), np.float32) / 255.
        m = np.clip((m - .35) / .3, 0, 1)
        m = m * m * (3 - 2 * m)
        if self.prev_m is not None and i - self.prev_i == 1:
            k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))    # предмет за спиной не «вспыхивает» в маске на 1 кадр
            m = np.minimum(m, cv2.dilate(self.prev_m, k))
            prev = np.minimum(self.prev_m, cv2.dilate(m, np.ones((5, 5), np.uint8)))
            m = .3 * prev + .7 * m
        self.prev_m, self.prev_i = m, i
        m = cv2.resize(m, (W, H), interpolation=cv2.INTER_CUBIC)
        return cv2.GaussianBlur(np.clip(m, 0, 1), (0, 0), 1.4)

    @staticmethod
    def chest_y(m):
        """где на кадре грудь: ниже подбородка, на одежде. Сюда встают мелкие строки заголовка"""
        mk = m > .5
        rows = np.where(mk.any(1))[0]
        if not len(rows):
            return 1300
        top = int(rows[0])
        wid = np.array([mk[y].sum() for y in range(top, min(H, top + 900))], np.float32)
        head = float(np.median(wid[80:260])) if len(wid) > 260 else float(wid.max())
        sh = np.where(wid > head * 1.7)[0]                       # плечи: силуэт резко шире головы
        shoulders = top + int(sh[0]) if len(sh) else top + int(1.6 * head)
        return int(clamp(shoulders + .45 * head, 1000, 1650))

# ─────────────────────────────── шрифты ───────────────────────────────


BUNDLED = {'script': ('GreatVibes-Regular.ttf', 'normal', '400'), 'sans': ('Inter.ttf', 'normal', '100 900'),
           'sans_i': ('Inter-Italic.ttf', 'italic', '100 900'), 'serif': ('PlayfairDisplay-Italic.ttf', 'italic', '400 900'),
           'cond': ('RobotoCondensed.ttf', 'normal', '100 900')}
FAMILY = {'script': 'TScript', 'sans': 'TSans', 'sans_i': 'TSans', 'serif': 'TSerif', 'cond': 'TCond'}


def font_css(over_fonts):
    """встроить шрифты в страницу. "fonts": {"sans": "путь.ttf"} — свой файл, {"sans": "system:Helvetica Neue"} — системный"""
    css, names = [], {}
    for k, (fn, style, wt) in BUNDLED.items():
        o = over_fonts.get(k.replace('_i', ''))
        if o and o.startswith('system:'):
            names[k.replace('_i', '')] = o[7:]
            continue
        path = o if o else os.path.join(FONTS, fn)
        if o:
            style, wt = ('italic' if k in ('serif', 'sans_i') else 'normal'), '100 900'
        data = base64.b64encode(open(path, 'rb').read()).decode()
        css.append(f'@font-face{{font-family:"{FAMILY[k]}";src:url(data:font/ttf;base64,{data});font-style:{style};font-weight:{wt}}}')
    return '\n'.join(css), names


FONT_DIRS = ['/System/Library/Fonts/Supplemental', '/System/Library/Fonts', '/Library/Fonts', os.path.expanduser('~/Library/Fonts'),
             'C:/Windows/Fonts', os.path.expanduser('~/AppData/Local/Microsoft/Windows/Fonts'),
             '/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/truetype/msttcorefonts']
CHIP_FONTS = [   # журнальные буквы: системные шрифты, если нет — встроенные
    (['Georgia Bold.ttf', 'georgiab.ttf'], ('PlayfairDisplay-Italic.ttf', 'Bold Italic')),
    (['Impact.ttf', 'impact.ttf'], ('RobotoCondensed.ttf', 'Black')),
    (['Arial Black.ttf', 'ariblk.ttf'], ('Inter.ttf', 'Black')),
    (['Courier New Bold.ttf', 'courbd.ttf'], ('RobotoCondensed.ttf', 'Bold')),
    (['Times New Roman Bold.ttf', 'timesbd.ttf'], ('PlayfairDisplay-Italic.ttf', 'Black Italic')),
]
_cf = {}


def chip_font(k, size):
    key = (k, size)
    if key not in _cf:
        names, (fb, inst) = CHIP_FONTS[k]
        path = next((os.path.join(d, n) for n in names for d in FONT_DIRS if os.path.exists(os.path.join(d, n))), None)
        if path:
            f = ImageFont.truetype(path, size)
        else:
            f = ImageFont.truetype(os.path.join(FONTS, fb), size)
            try:
                f.set_variation_by_name(inst)
            except Exception:
                pass
        _cf[key] = f
    return _cf[key]

# ─────────────────────────────── буквы-вырезки (Python) ───────────────────────────────


_paper = [None]


def paper_bg():
    if _paper[0] is None:
        im = Image.new('RGB', (W, H), (243, 239, 229))
        d = ImageDraw.Draw(im)
        for x in range(0, W, 46):
            d.line((x, 0, x, H), fill=(196, 214, 228), width=2)
        for y in range(0, H, 46):
            d.line((0, y, W, y), fill=(196, 214, 228), width=2)
        rnd = random.Random(2)
        top = [(x, 760 + rnd.uniform(-14, 14) + x * .06) for x in range(-20, W + 40, 26)]
        bot = [(x, 980 + rnd.uniform(-14, 14) + x * .06) for x in range(W + 40, -40, -26)]
        d.polygon(top + bot, fill=(250, 222, 92))                         # полоса маркера
        pts = [(x + rnd.uniform(-10, 10), y + rnd.uniform(-10, 10)) for x, y in [(-20, 1380), (420, 1340), (460, 1700), (-20, 1760)]]
        d.polygon(pts, fill=(196, 160, 112))                              # обрывок крафта
        arr = np.asarray(im).astype(np.float32)
        noise = np.random.default_rng(1).normal(0, 6, (H // 2, W // 2)).astype(np.float32)
        _paper[0] = np.clip(arr + cv2.resize(cv2.GaussianBlur(noise, (0, 0), 1.2), (W, H))[..., None], 0, 255)
    return _paper[0]


RANSOM = [((244, 240, 230), (20, 20, 20), 0), ((255, 214, 90), (20, 20, 20), 1), ((22, 22, 24), (255, 255, 255), 2),
          ((40, 70, 190), (255, 255, 255), 3), ((255, 255, 255), (220, 40, 40), 4), ((236, 226, 205), (30, 30, 30), 1)]
_chips = {}


def chip(ch, i, scale=1.0):
    k = (ch, i, scale)
    if k not in _chips:
        rnd = random.Random(i * 31 + ord(ch))
        bg, fg, fk = RANSOM[(i * 5 + ord(ch)) % len(RANSOM)]
        f = chip_font(fk, int(rnd.choice([118, 130, 142]) * scale))
        l, t, r, b = f.getbbox(ch)
        pw, ph = r - l + rnd.randint(22, 36), b - t + rnd.randint(22, 36)
        im = Image.new('RGBA', (pw + 20, ph + 20), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        pts = [(10 + rnd.uniform(-4, 4), 10 + rnd.uniform(-4, 4)), (10 + pw + rnd.uniform(-4, 4), 10 + rnd.uniform(-4, 4)),
               (10 + pw + rnd.uniform(-4, 4), 10 + ph + rnd.uniform(-4, 4)), (10 + rnd.uniform(-4, 4), 10 + ph + rnd.uniform(-4, 4))]
        d.polygon(pts, fill=bg + (255,))
        d.text((10 + (pw - (r - l)) / 2 - l, 10 + (ph - (b - t)) / 2 - t), ch, font=f, fill=fg + (255,))
        _chips[k] = np.asarray(im.rotate(rnd.uniform(-9, 9), Image.BICUBIC, expand=True))
    return _chips[k]


def ransom(fr, m, t, u, d, o):
    out = paper_bg().copy()
    mk = (m > .5).astype(np.uint8)
    border = cv2.GaussianBlur(cv2.dilate(mk, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))).astype(np.float32), (0, 0), 1.2)
    sh = cv2.GaussianBlur(np.roll(np.roll(border, 14, 0), 8, 1), (0, 0), 10)[..., None] * .35
    out = out * (1 - sh)
    out = out * (1 - border[..., None]) + 255 * border[..., None]           # белая кромка «вырезано ножницами»
    mm = cv2.GaussianBlur(m, (0, 0), 1.0)[..., None]
    out = out * (1 - mm) + fr.astype(np.float32) * mm
    rnd = random.Random(int(t * 12))                                         # стоп-моушн дрожь 12 к/с
    lines = o.get('lines', ['ТВОЙ', 'ТЕКСТ'])
    ys = o.get('ys', [420, 590][:len(lines)] if len(lines) > 1 else [470])
    n_on = int((u - .12) / o.get('step', .12))
    k = 0
    for li, word in enumerate(lines):
        chips = [chip(c, j + li * 10) for j, c in enumerate(word) if c != ' ']
        tw = sum(c.shape[1] - 18 for c in chips)
        sc = min(1.0, 1000 / max(1, tw))
        if sc < 1:
            chips = [chip(c, j + li * 10, round(sc, 2)) for j, c in enumerate(word) if c != ' ']
            tw = sum(c.shape[1] - 18 for c in chips)
        x = W / 2 - tw / 2
        for c in chips:
            if k < n_on:
                jx, jy = rnd.randint(-3, 3), rnd.randint(-3, 3)
                over(out, shadow_of(c, .45, 6, 6), int(x + jx + 3), int(ys[li] - c.shape[0] / 2 + jy))
                over(out, c, int(x + jx), int(ys[li] - c.shape[0] / 2 + jy))
            x += c.shape[1] - 18
            k += 1
    if u < .2:                                                              # вход: бумага наезжает снизу рваным краем
        p = eio(u / .2)
        edge = H - p * (H + 120)
        out = torn(out, fr, edge, below_is_video=False)
    if u > d - .22:                                                         # выход: рваный край уезжает вверх
        p = eio((u - (d - .22)) / .22)
        edge = H - p * (H + 120)
        out = torn(out, fr, edge, below_is_video=True)
    return out


def torn(out, fr, edge, below_is_video):
    ctrl = np.random.default_rng(4).normal(0, 18, W // 30 + 2)
    ey = edge + np.interp(np.arange(W), np.arange(len(ctrl)) * 30, ctrl)
    yy = np.arange(H)[:, None]
    below = (yy > ey[None, :]).astype(np.float32)[..., None]
    fringe = ((yy > ey[None, :] - 16) & (yy <= ey[None, :])).astype(np.float32)[..., None]
    vid = fr.astype(np.float32)
    out = out * (1 - below) + vid * below if below_is_video else vid * (1 - below) + out * below
    if below_is_video:
        return out * (1 - fringe) + 248 * fringe
    fr2 = ((yy > ey[None, :]) & (yy <= ey[None, :] + 16)).astype(np.float32)[..., None]
    return out * (1 - fr2) + 248 * fr2

# ─────────────────────────────── HTML-заголовки (Chromium) ───────────────────────────────


HAND = 'енвоиаср'           # рукописной лучше всего выглядят буквы без длинных выносных


def to_cfg(e, chest):
    """настройки из plan.json → параметры анимации на странице"""
    d = e['t1'] - e['t0']
    c = {'style': e['style'], 'ink': e.get('color', '#FFFFFF'), 'front': e.get('chest_color', '#F6F6F6'), 'T0': 0.0, 'T1': d - .45}
    small, big = e.get('small') or [], e.get('big') or ''
    if isinstance(small, str):
        small = [small]
    c['TB'] = e.get('small_at', min(1.3, d * .3))
    c['TC'] = e.get('big_at', c['TB'] + .9)
    if 'top' in e:
        c['top'] = e['top']
    if 'width' in e:
        c['w'] = e['width']
    for k in ('gap2', 'kern', 'tracking'):          # тонкая подстройка вёрстки
        if k in e:
            c[k] = e[k]
    if e['style'] == 'archive':
        l1, l2 = e['line1'], e.get('line2', '')
        c.update(cap=l1[0], l1=l1[1:], lab=e.get('label', ''), b1=small[0] if small else '', b2=small[1] if len(small) > 1 else '', b3=big)
        hi = e.get('hand', 'auto')
        if hi == 'auto':
            hi = next((i for ch in HAND for i in range(1, len(l2) - 1) if l2[i].lower() == ch), False)
        if hi is False or hi is None or len(l2) < 3:
            c.update(l2a=l2, sc='', l2b='')
        else:
            c.update(l2a=l2[:hi], sc=l2[hi], l2b=l2[hi + 1:])
        c['b1y'] = chest
    elif e['style'] == 'button':
        l2 = e.get('line2', '')
        c.update(l1=e['line1'], e=e.get('pin', ''), cap=l2[:1], l2=l2[1:], f1=small[0] if small else '', f2=big)
        c['TR'] = e.get('line2_at', .36)
        c['TE'] = e.get('pin_at', c['TR'] + .3)
        c['fy'] = chest
    elif e['style'] == 'grain':
        c.update(word=e['word'], y=e.get('y', 430), font=e.get('font', 'cond'), ink=e.get('color', '#f2f2f2'))
        if 'size' in e:
            c['size'] = e['size']
    return c


class Browser:
    def __init__(self, fonts):
        from playwright.sync_api import sync_playwright
        self.pw = sync_playwright().start()
        try:
            self.b = self.pw.chromium.launch(channel='chrome')            # установленный Google Chrome
        except Exception:
            try:
                self.b = self.pw.chromium.launch()                        # или Chromium от Playwright
            except Exception:
                sys.exit('[titles] нет браузера: поставьте Google Chrome или выполните  python -m playwright install chromium')
        self.p = self.b.new_page(viewport={'width': 2 * W, 'height': H}, device_scale_factor=1)
        self.p.goto('file:///' + HTML.replace('\\', '/').lstrip('/'))
        css, names = font_css(fonts)
        self.p.add_style_tag(content=css)
        if names:
            self.p.evaluate('n => Object.assign(F, n)', names)
        self.cur = None

    def setup(self, cfg):
        if self.cur != id(cfg):
            self.p.evaluate('c => setup(c)', cfg)
            self.cur = id(cfg)

    def layers(self, t, sub):
        """кадр заголовка в момент t: (за человеком, перед ним), с моушн-блюром из sub подкадров"""
        acc = None
        for k in range(sub):
            self.p.evaluate('t => seek(t)', t + k / (sub * FPS))
            a = np.asarray(Image.open(io.BytesIO(self.p.screenshot(omit_background=True))).convert('RGBA'), np.float32)
            a[..., :3] *= a[..., 3:4] / 255                          # премультипликация: края не темнеют
            acc = a if acc is None else acc + a
        acc /= sub
        al = acc[..., 3:4]
        rgb = np.where(al > 0, acc[..., :3] * 255 / np.maximum(al, 1e-3), 0)
        img = np.concatenate([rgb, al], 2).clip(0, 255).astype(np.uint8)
        return img[:, :W], img[:, W:]

    def close(self):
        self.b.close()
        self.pw.stop()

# ─────────────────────────────── сборка кадра ───────────────────────────────


def compose(fr, m, back, front, e):
    out = fr.astype(np.float32)
    sh = e.get('shadow', .55)
    if back[..., 3].any():
        if e.get('behind', True):
            if sh:
                out = under_person(out, shadow_of(back, sh, 14, 5), m)
            out = under_person(out, back, m)
        else:
            if sh:
                out = over(out, shadow_of(back, sh, 14, 5))
            out = over(out, back)
    if front[..., 3].any():
        out = over(out, shadow_of(front, .5, 10, 4))
        out = over(out, front)
    return out


VF = f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},format=rgb24'


def probe_dur(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).strip())


def grab(path, t):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{max(0, t):.3f}', '-i', path, '-frames:v', '1', '-vf', VF,
                          '-f', 'rawvideo', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W, 3) if len(raw) == W * H * 3 else None


def prepare(plan, base):
    rel = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
    plan['input'] = rel(plan['input'])
    plan['output'] = rel(plan.get('output', os.path.splitext(plan['input'])[0] + '_titles.mp4'))
    for n, e in enumerate(plan['titles'], 1):
        e['_n'] = n
        assert e.get('style') in STYLES, f"заголовок {n}: нет стиля «{e.get('style')}». Есть: {', '.join(STYLES)}"
        assert e['t1'] > e['t0'] + .5, f'заголовок {n}: t1 должно быть больше t0 хотя бы на 0.5 с'
        need = {'archive': 'line1', 'button': 'line1', 'grain': 'word', 'ransom': 'lines'}[e['style']]
        assert e.get(need), f'заголовок {n} ({e["style"]}): нужно поле "{need}"'
    plan['titles'].sort(key=lambda e: e['t0'])
    for a, b in zip(plan['titles'], plan['titles'][1:]):
        assert b['t0'] >= a['t1'], f'заголовки {a["_n"]} и {b["_n"]} пересекаются по времени'
    for s in plan.get('sounds', []):
        s['file'] = rel(s['file'])
    return plan


class Renderer:
    def __init__(self, plan, sub):
        self.plan, self.sub = plan, sub
        self.person = Person(plan.get('mask_model', 'u2net_human_seg'))
        self.browser = None
        self.chest, self.cfg = {}, {}

    def frame(self, fr, i, e):
        t = i / FPS
        m = self.person.mask(fr, i)
        if e['style'] == 'ransom':
            return ransom(fr, m, t, t - e['t0'], e['t1'] - e['t0'], e)
        n = e['_n']
        if n not in self.cfg:
            if n not in self.chest:
                self.chest[n] = e.get('chest_y') or Person.chest_y(m)
            self.cfg[n] = to_cfg(e, self.chest[n])
        if self.browser is None:
            self.browser = Browser(self.plan.get('fonts', {}))
        self.browser.setup(self.cfg[n])
        back, front = self.browser.layers(t - e['t0'], self.sub)
        return compose(fr, m, back, front, e)

    def close(self):
        if self.browser:
            self.browser.close()


def active(plan, t, only):
    return next((e for e in plan['titles'] if e['t0'] <= t < e['t1'] and (not only or e['_n'] in only)), None)


def render(plan, only, sub):
    src, dst = plan['input'], plan['output']
    r = Renderer(plan, sub)
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', VF, '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
    tmp = dst + '.video.mp4'
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', tmp], stdin=subprocess.PIPE)
    n, sz, total = 0, W * H * 3, int(probe_dur(src) * FPS)
    try:
        while True:
            buf = dec.stdout.read(sz)
            if len(buf) < sz:
                break
            fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
            e = active(plan, n / FPS, only)
            out = fr if e is None else np.clip(r.frame(fr, n, e) + .5, 0, 255).astype(np.uint8)
            enc.stdin.write(out.tobytes())
            n += 1
            if n % 15 == 0:
                print(f'\r[titles] {n}/{total} кадров', end='', flush=True)
    finally:
        r.close()
        enc.stdin.close()
        enc.wait()
        dec.wait()
    mux(src, tmp, dst, plan.get('sounds', []))
    os.remove(tmp)
    print(f'\n[titles] готово: {dst}')


def mux(src, video, dst, sounds):
    """видео + звук исходника + звуки заголовков (тихо, по времени)"""
    has_a = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', src],
                           capture_output=True, text=True).stdout.strip() != ''
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', video, '-i', src]
    for s in sounds:
        cmd += ['-i', s['file']]
    if not sounds:
        cmd += ['-map', '0:v', '-map', '1:a?', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k']
    else:
        parts, mix = [], (['[1:a]'] if has_a else [])
        for k, s in enumerate(sounds):
            ms = int(max(0, s['t']) * 1000)
            parts.append(f'[{k + 2}:a]aresample=48000,volume={s.get("db", -18)}dB,adelay={ms}|{ms}[s{k}]')
            mix.append(f'[s{k}]')
        parts.append(f'{"".join(mix)}amix=inputs={len(mix)}:normalize=0:duration=first[a]')
        cmd += ['-filter_complex', ';'.join(parts), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k']
    subprocess.run(cmd + ['-shortest', '-movflags', '+faststart', dst], check=True)


def sheet(plan, only, sub):
    """по 3 кадра каждого заголовка — быстрый просмотр до полного рендера"""
    r = Renderer(plan, sub)
    ts = [e for e in plan['titles'] if not only or e['_n'] in only]
    tw, th, cols = 270, 480, 3
    im = Image.new('RGB', (cols * tw + (cols + 1) * 8, len(ts) * (th + 40) + 8), (24, 24, 26))
    dr = ImageDraw.Draw(im)
    try:
        for row, e in enumerate(ts):
            d = e['t1'] - e['t0']
            for col, k in enumerate((.3, .62, .9)):
                i = int(round((e['t0'] + d * k) * FPS))
                fr = grab(plan['input'], i / FPS)
                if fr is None:
                    continue
                r.person.prev_m = None
                out = np.clip(r.frame(fr, i, e) + .5, 0, 255).astype(np.uint8)
                x, y = 8 + col * (tw + 8), 8 + row * (th + 40)
                im.paste(Image.fromarray(out).resize((tw, th), Image.LANCZOS), (x, y + 32))
                dr.text((x, y + 6), f"{e['_n']}. {e['style']}  {i / FPS:.2f}s", fill=(255, 214, 90), font=chip_font(2, 20))
    finally:
        r.close()
    p = os.path.splitext(plan['output'])[0] + '_sheet.jpg'
    im.save(p, quality=88)
    print(f'[titles] контакт-лист: {p}')


def main(argv):
    if not argv or argv[0] in ('-h', '--help'):
        print(__doc__)
        return
    if argv[0] == '--list':
        for k, v in STYLES.items():
            print(f'  {k:8} {v}\n')
        return
    path = argv[0]
    plan = prepare(json.load(open(path, encoding='utf-8')), os.path.dirname(os.path.abspath(path)))
    only = {int(x) for x in argv[argv.index('--only') + 1].split(',')} if '--only' in argv else None
    sub = 1 if '--fast' in argv else 3
    (sheet if '--sheet' in argv else render)(plan, only, sub)


if __name__ == '__main__':
    main(sys.argv[1:])
