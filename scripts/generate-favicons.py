"""Generate the multi-format favicon set from the Casa de Cantoneiros mark.

Usage:
    py -3 scripts/generate-favicons.py

Outputs (project root):
    favicon.ico, favicon-16x16.png, favicon-32x32.png,
    apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT_DIR = Path(__file__).resolve().parent.parent

BG = (24, 35, 27, 255)        # #18231b
GOLD = (183, 139, 74, 255)    # #b78b4a
CREAM = (246, 243, 238, 255)  # #f6f3ee

SUPERSAMPLE = 8


def scale_points(points: list[tuple[float, float]], size: int, factor: int) -> list[tuple[float, float]]:
    ratio = size / 64.0 * factor
    return [(x * ratio, y * ratio) for x, y in points]


def draw_mark(size: int, *, rounded: bool = True) -> Image.Image:
    big = size * SUPERSAMPLE
    image = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    if rounded:
        radius = round(big * 14 / 64)
        draw.rounded_rectangle((0, 0, big - 1, big - 1), radius=radius, fill=BG)
    else:
        draw.rectangle((0, 0, big - 1, big - 1), fill=BG)

    stroke = max(1, round(big * 5 / 64))
    roof = scale_points([(14, 33.5), (32, 18), (50, 33.5)], size, SUPERSAMPLE)
    draw.line(roof, fill=GOLD, width=stroke, joint="curve")
    for point in (roof[0], roof[-1]):
        r = stroke / 2
        draw.ellipse((point[0] - r, point[1] - r, point[0] + r, point[1] + r), fill=GOLD)

    body = scale_points([(19, 32.5), (45, 49.5)], size, SUPERSAMPLE)
    draw.rectangle((body[0][0], body[0][1], body[1][0], body[1][1]), fill=CREAM)

    for left, right in ((23, 30), (35, 42)):
        window = scale_points([(left, 36), (right, 49)], size, SUPERSAMPLE)
        draw.rectangle(
            (window[0][0], window[0][1], window[1][0], window[1][1]),
            fill=BG,
        )

    base = scale_points([(18, 53), (46, 53)], size, SUPERSAMPLE)
    draw.line(base, fill=GOLD, width=max(1, round(big * 4 / 64)), joint="curve")

    return image.resize((size, size), Image.Resampling.LANCZOS)


def save_png(size: int, path: Path, *, rounded: bool = True) -> None:
    draw_mark(size, rounded=rounded).save(path, format="PNG", optimize=True)


def main() -> int:
    save_png(16, ROOT_DIR / "favicon-16x16.png")
    save_png(32, ROOT_DIR / "favicon-32x32.png")
    save_png(180, ROOT_DIR / "apple-touch-icon.png", rounded=False)
    save_png(192, ROOT_DIR / "android-chrome-192x192.png")
    save_png(512, ROOT_DIR / "android-chrome-512x512.png")

    ico_sizes = [16, 32, 48]
    icons = [draw_mark(size) for size in ico_sizes]
    icons[-1].save(
        ROOT_DIR / "favicon.ico",
        format="ICO",
        sizes=[(size, size) for size in ico_sizes],
        append_images=icons[:-1],
    )

    print("Favicons gerados: ico + 16/32/180/192/512 PNG")
    return 0


if __name__ == "__main__":
    sys.exit(main())
