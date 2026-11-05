"""Generate responsive WebP and AVIF variants for the site images.

Usage:
    py -3 scripts/optimize-images.py

The script keeps the original JPEG/PNG files as fallbacks and writes
`<name>-<width>.webp` and `<name>-<width>.avif` next to them.
It is idempotent: variants newer than the source are skipped.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, features

ROOT_DIR = Path(__file__).resolve().parent.parent
GALLERY_ROOT = ROOT_DIR / "images" / "galeria"
ASSETS_ROOT = ROOT_DIR / "images" / "assets-site"

GALLERY_WIDTHS = (480, 960, 1600)
ASSETS_WIDTHS = (480, 960, 1600)

WEBP_QUALITY = 78
AVIF_QUALITY = 58


def ensure_support() -> None:
    if not features.check("webp"):
        raise SystemExit("Pillow was built without WebP support.")
    if not features.check("avif"):
        raise SystemExit("Pillow was built without AVIF support.")


def target_widths(original_width: int, widths: tuple[int, ...]) -> list[int]:
    selected = sorted({w for w in widths if w < original_width})
    selected.append(min(original_width, max(widths)))
    return sorted(set(selected))


def convert(source: Path, widths: tuple[int, ...]) -> tuple[int, int]:
    created = 0
    skipped = 0

    with Image.open(source) as image:
        image = image.convert("RGB")
        width = image.width

        for target in target_widths(width, widths):
            height = round(image.height * target / width)
            resized = image if target == width else image.resize(
                (target, height), Image.Resampling.LANCZOS
            )

            for extension, fmt, quality in (
                ("webp", "WEBP", WEBP_QUALITY),
                ("avif", "AVIF", AVIF_QUALITY),
            ):
                destination = source.with_name(f"{source.stem}-{target}.{extension}")
                if destination.exists() and destination.stat().st_mtime >= source.stat().st_mtime:
                    skipped += 1
                    continue

                save_kwargs = {"format": fmt, "quality": quality}
                if fmt == "WEBP":
                    save_kwargs["method"] = 6
                else:
                    save_kwargs["speed"] = 6

                resized.save(destination, **save_kwargs)
                created += 1

    return created, skipped


def main() -> int:
    ensure_support()

    sources: list[tuple[Path, tuple[int, ...]]] = []
    for folder, widths in ((GALLERY_ROOT, GALLERY_WIDTHS), (ASSETS_ROOT, ASSETS_WIDTHS)):
        if not folder.exists():
            continue
        for path in sorted(folder.rglob("*")):
            if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png"}:
                if "-480" in path.stem or "-960" in path.stem or "-1600" in path.stem:
                    continue
                sources.append((path, widths))

    total_created = 0
    total_skipped = 0
    for source, widths in sources:
        created, skipped = convert(source, widths)
        total_created += created
        total_skipped += skipped

    print(f"Imagens processadas: {len(sources)}")
    print(f"Variantes criadas: {total_created}")
    print(f"Variantes atualizadas/sem alterações: {total_skipped}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
