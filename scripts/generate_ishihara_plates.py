from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT_DIR = Path('public/ishihara')
SIZE = 2048
CENTER = SIZE // 2
RADIUS = 920
DOT_COUNT = 420

# Plate definition: (normal, deficient, mode)
# Matches the quick 12-plate sequence used in the web app.
PLATES = [
    ('26', '', 'vanish'),
    ('6', '', 'vanish'),
    ('13', '', 'vanish'),
    ('8', '', 'vanish'),
    ('45', '', 'vanish'),
    ('7', '', 'vanish'),
    ('16', '', 'vanish'),
    ('5', '', 'vanish'),
    ('15', '', 'vanish'),
    ('29', '', 'vanish'),
    ('12', '', 'control'),
    ('8', '', 'vanish'),
]

BG_COLORS = ['#d69a68', '#e3b07f', '#cf8651', '#dea171', '#e7b98d', '#c97c47']
FG_NORMAL = ['#45af7c', '#69bd84', '#56b48a', '#83c27d', '#6fbf95']
FG_DEF = ['#a9869c', '#b190a5', '#9f7f94', '#b59bac', '#977088']
FG_BOTH = ['#95ba76', '#a7c67d', '#9ebf84', '#8cb06f']


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        'C:/Windows/Fonts/arialbd.ttf',
        'C:/Windows/Fonts/segoeuib.ttf',
        'C:/Windows/Fonts/calibrib.ttf',
    ]
    for c in candidates:
        p = Path(c)
        if p.exists():
            return ImageFont.truetype(str(p), size=size)
    return ImageFont.load_default()


def create_text_mask(text: str, seed: int) -> Image.Image:
    mask = Image.new('L', (SIZE, SIZE), 0)
    if not text:
        return mask

    draw = ImageDraw.Draw(mask)

    # Adaptive font size for 1-2 digits
    font_size = 760 if len(text) == 1 else 640
    font = load_font(font_size)

    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    rng = random.Random(seed)
    ox = rng.randint(-70, 70)
    oy = rng.randint(-40, 60)

    x = CENTER - tw // 2 + ox
    y = CENTER - th // 2 + oy

    draw.text((x, y), text, fill=255, font=font)

    # Softened edges for natural dotted boundaries
    mask = mask.filter(ImageFilter.GaussianBlur(radius=3.5))
    return mask


def in_circle(x: float, y: float) -> bool:
    dx = x - CENTER
    dy = y - CENTER
    return dx * dx + dy * dy <= RADIUS * RADIUS


def sample(mask: Image.Image, x: float, y: float, threshold: int = 140) -> bool:
    px = int(max(0, min(SIZE - 1, x)))
    py = int(max(0, min(SIZE - 1, y)))
    return mask.getpixel((px, py)) >= threshold


def pick(rng: random.Random, palette: list[str]) -> tuple[int, int, int]:
    v = palette[rng.randrange(len(palette))]
    return tuple(int(v[i : i + 2], 16) for i in (1, 3, 5))


def make_plate(index: int, normal: str, deficient: str, mode: str) -> None:
    rng = random.Random(12345 + index * 991)

    img = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    normal_mask = create_text_mask(normal, seed=index * 17 + 3)
    deficient_mask = create_text_mask(deficient, seed=index * 19 + 7) if deficient else Image.new('L', (SIZE, SIZE), 0)

    for _ in range(DOT_COUNT):
        t = rng.random() * 2 * math.pi
        rr = math.sqrt(rng.random()) * RADIUS
        x = CENTER + math.cos(t) * rr
        y = CENTER + math.sin(t) * rr

        if not in_circle(x, y):
            continue

        r = rng.uniform(8, 33)

        n = sample(normal_mask, x, y)
        d = sample(deficient_mask, x, y)

        if mode == 'control':
            color = pick(rng, FG_NORMAL if n else BG_COLORS)
        elif mode == 'transform':
            if n and d:
                color = pick(rng, FG_BOTH)
            elif n:
                color = pick(rng, FG_NORMAL)
            elif d:
                color = pick(rng, FG_DEF)
            else:
                color = pick(rng, BG_COLORS)
        else:
            color = pick(rng, FG_NORMAL if n else BG_COLORS)

        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)

    circle_mask = Image.new('L', (SIZE, SIZE), 0)
    cm = ImageDraw.Draw(circle_mask)
    cm.ellipse((CENTER - RADIUS, CENTER - RADIUS, CENTER + RADIUS, CENTER + RADIUS), fill=255)
    white_bg = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
    final = Image.composite(img, white_bg, circle_mask)

    out = OUT_DIR / f'plate-{index:02d}.png'
    final.save(out, optimize=True)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for i, (n, d, m) in enumerate(PLATES, start=1):
        make_plate(i, n, d, m)
    print(f'Generated {len(PLATES)} plates in {OUT_DIR}')


if __name__ == '__main__':
    main()
