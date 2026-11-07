# Scripts do projeto

Scripts auxiliares para gerar os recursos derivados do site. Todos usam Python 3 e as
dependências de `requirements.txt` (Pillow e watchdog).

## Ficheiros

- `optimize-images.py` — gera variantes responsivas AVIF e WebP (480/960/1600 px) para
  as imagens da galeria e de `images/assets-site`, mantendo os JPEG/PNG originais como
  fallback. É idempotente: ignora variantes atualizadas.
- `generate-gallery-data.py` — analisa `images/galeria/*`, lê as dimensões reais e
  escreve `js/gallery-data.js` com `src`, `alt`, `width`, `height` e as variantes
  AVIF/WebP de cada imagem.
- `generate-favicons.py` — gera o conjunto multiformato de favicons
  (`favicon.ico`, PNG 16/32, `apple-touch-icon.png` e ícones Android 192/512).
- `watch-gallery.py` — vigia `images/galeria` e regenera `js/gallery-data.js` quando
  deteta alterações.

## Instalação

```powershell
py -3 -m pip install -r requirements.txt
```

## Utilização

```powershell
# Otimizar imagens (AVIF + WebP)
py -3 scripts/optimize-images.py

# Regenerar os dados da galeria
py -3 scripts/generate-gallery-data.py

# Regerar os favicons
py -3 scripts/generate-favicons.py

# Vigiar a galeria em contínuo
py -3 scripts/watch-gallery.py
```

## Ordem recomendada após adicionar fotografias

1. Colocar os originais em `images/galeria/<categoria>/`.
2. Executar `optimize-images.py`.
3. Executar `generate-gallery-data.py`.
4. Recarregar `galeria.html` e `index.html` no browser.
