import json
import re
import unicodedata
from pathlib import Path

from PIL import Image

VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif'}
GENERATED_VARIANT = re.compile(r'-\d{3,4}$')
ROOT_DIR = Path(__file__).resolve().parent.parent
GALLERY_ROOT = ROOT_DIR / 'images' / 'galeria'
OUTPUT_FILE = ROOT_DIR / 'js' / 'gallery-data.js'
IMAGE_PUBLIC_ROOT = 'images/galeria'


def to_title_case(text: str) -> str:
    return ' '.join(word.capitalize() for word in text.replace('-', ' ').replace('_', ' ').split())


# Descrições acessíveis e específicas para cada fotografia. Sem esta entrada,
# o script usa o nome do ficheiro como fallback.
ALT_TEXT_OVERRIDES = {
    'balanco-panoramico': 'Balanço de madeira com vista panorâmica sobre o vale',
    'cascata-no-inverno': 'Escadas de pedra junto a uma cascata no inverno',
    'paisagem-de-inverno': 'Paisagem rural coberta de neve em Vieira do Minho',
    'placa-casa-cantoneiros': 'Placa de madeira da Casa de Cantoneiros no caminho da serra',
    'rebanho-na-aldeia': 'Rebanho de vacas a atravessar a aldeia de Campos Ruivães',
    'acesso-casa-cantoneiros': 'Estrada de acesso à Casa de Cantoneiros entre árvores',
    'cascata-natural': 'Cascata natural com água cristalina na envolvente da casa',
    'churrasqueira-exterior': 'Churrasqueira exterior coberta com mesa e bancos',
    'corredor-entrada': 'Corredor de entrada com casa de banho e porta para o exterior',
    'fachada-lateral': 'Fachada lateral branca da casa com telhado de ardósia',
    'IMG_3452': 'Terraço exterior com duas cadeiras e vista para a serra',
    'IMG_3468': 'Jardim relvado com espreguiçadeiras junto ao bosque',
    'IMG_3474': 'Varanda da casa com vista para o jardim e a serra',
    'IMG_3503': 'Pátio exterior com mesa e vista para o vale',
    'IMG_4127': 'Banheira de hidromassagem exterior em pedra',
    'marco-casa-cantoneiros': 'Marco de pedra com o número 5335 à entrada da propriedade',
    'portao-entrada': 'Portão de entrada da Casa de Cantoneiros ladeado por jardim',
    'ribeiro-natural': 'Ribeiro de água cristalina entre rochas e vegetação',
    'zona-descanso-jardim': 'Zona de descanso no jardim com espreguiçadeiras à sombra',
    'casa-de-banho': 'Casa de banho moderna com base de duche em mármore',
    'cozinha': 'Cozinha equipada com ilha central e zona de refeições',
    'detalhe-toalhas': 'Toalhas dobradas sobre a cama com mensagem de boas-vindas',
    'IMG_3421': 'Sala de estar rústica com lareira de pedra',
    'IMG_3422': 'Sala de estar com sofá, mesa de jantar e janelas amplas',
    'IMG_3425': 'Sala de estar luminosa com sofá e vista para o exterior',
    'IMG_3431': 'Quarto com janela ampla e cortinados',
    'IMG_3434': 'Sala de estar rústica com pedra à vista e televisão',
    'IMG_3437': 'Quarto com cama de casal, paredes de pedra e luz quente',
    'janela-quarto': 'Janela do quarto com cortinados e vista para o jardim',
    'quarto-parede-pedra': 'Quarto com cama de casal e parede de pedra',
    'quarto': 'Quarto com cama de casal e decoração em tons neutros',
}


def build_alt_text(file_name: str) -> str:
    stem = Path(file_name).stem
    return ALT_TEXT_OVERRIDES.get(stem, to_title_case(stem))


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
