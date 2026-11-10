# Scripts do projeto

Scripts auxiliares para gerar os recursos derivados do site. Todos usam Python 3 e as
dependências de `requirements.txt` (Pillow).

Documentação principal do projeto: [`../README.md`](../README.md).

## Ficheiros

- `generate-gallery-data.py` — analisa `images/galeria/*`, lê as dimensões reais e
  escreve `js/gallery-data.js` com `src`, `alt`, `width` e `height` de cada imagem.
- `generate-favicons.py` — gera o conjunto essencial de favicons em
  `images/assets-site/icons/` (`favicon.ico`, `apple-touch-icon.png` e ícones
  Android 192/512).
- `watch-gallery.py` — vigia `images/galeria` e regenera `js/gallery-data.js` quando
  deteta alterações.

## Instalação

```powershell
py -3 -m pip install -r scripts/requirements.txt
```

## Utilização

```powershell
# Regenerar os dados da galeria
py -3 scripts/generate-gallery-data.py

# Regerar os favicons
py -3 scripts/generate-favicons.py

# Vigiar a galeria em contínuo
py -3 scripts/watch-gallery.py
```

## Ordem recomendada após adicionar fotografias

1. Colocar os originais em `images/galeria/<categoria>/`.
2. Executar `generate-gallery-data.py`.
3. Recarregar `galeria.html` e `index.html` no browser.
