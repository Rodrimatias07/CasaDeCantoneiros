import json
import re
import unicodedata
from pathlib import Path

from PIL import Image

VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
GENERATED_VARIANT = re.compile(r'-\d{3,4}$')
ROOT_DIR = Path(__file__).resolve().parent.parent
GALLERY_ROOT = ROOT_DIR / 'images' / 'galeria'
OUTPUT_FILE = ROOT_DIR / 'js' / 'gallery-data.js'
IMAGE_PUBLIC_ROOT = 'images/galeria'


def to_title_case(text: str) -> str:
    return ' '.join(word.capitalize() for word in text.replace('-', ' ').replace('_', ' ').split())


def build_alt_text(file_name: str) -> str:
    return to_title_case(Path(file_name).stem)


def slugify(text: str) -> str:
    normalized = unicodedata.normalize('NFKD', text)
    ascii_text = normalized.encode('ascii', 'ignore').decode('ascii')
    ascii_text = ascii_text.lower().strip()
    ascii_text = re.sub(r'[\s_]+', '-', ascii_text)
    ascii_text = re.sub(r'[^a-z0-9-]', '', ascii_text)
    ascii_text = re.sub(r'-{2,}', '-', ascii_text)
    return ascii_text


def get_category_folders() -> list[str]:
    if not GALLERY_ROOT.exists():
        raise FileNotFoundError(f'Pasta de galeria não encontrada: {GALLERY_ROOT}')

    return sorted(
        [entry.name for entry in GALLERY_ROOT.iterdir() if entry.is_dir()],
        key=lambda folder: folder.casefold()
    )


def build_variants(source: Path, extension: str) -> list[dict[str, object]]:
    variants = []
    for candidate in sorted(source.parent.glob(f'{source.stem}-*.{extension}')):
        match = re.search(r'-(\d{3,4})$', candidate.stem)
        if not match:
            continue
        variants.append({
            'src': f'{IMAGE_PUBLIC_ROOT}/{source.parent.name}/{candidate.name}',
            'width': int(match.group(1)),
        })
    return sorted(variants, key=lambda item: item['width'])


def get_images_from_category(category: str) -> list[dict[str, object]]:
    category_path = GALLERY_ROOT / category
    category_slug = slugify(category)
    images = [
        entry for entry in category_path.iterdir()
        if entry.is_file()
        and entry.suffix.lower() in VALID_EXTENSIONS
        and not GENERATED_VARIANT.search(entry.stem)
    ]

    result = []
    for image in sorted(images, key=lambda entry: entry.name.casefold()):
        with Image.open(image) as opened:
            width, height = opened.size

        result.append({
            'category': category_slug,
            'src': f'{IMAGE_PUBLIC_ROOT}/{category}/{image.name}',
            'alt': build_alt_text(image.name),
            'width': width,
            'height': height,
            'variants': {
                'avif': build_variants(image, 'avif'),
                'webp': build_variants(image, 'webp'),
            },
        })

    return result


def main() -> None:
    categories = get_category_folders()
    images = []
    for category in categories:
        images.extend(get_images_from_category(category))

    OUTPUT_FILE.write_text(
        'window.galleryData = ' + json.dumps(images, ensure_ascii=False, indent=2) + ';\n',
        encoding='utf-8'
    )
    print(f'Gerado {OUTPUT_FILE} com {len(images)} imagens e {len(categories)} categorias.')


if __name__ == '__main__':
    main()
