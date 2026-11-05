let todasAsImagens = [];

const SIZES_GRELHA = '(max-width: 575px) 50vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw';
const SIZES_PREVIEW = '(max-width: 575px) 50vw, (max-width: 991px) 50vw, 33vw';

function escaparHtml(valor) {
  return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function nomeFicheiro(caminho) {
  return String(caminho || '')
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '')
    .replace(/-\d{3,4}$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, function (letra) {
      return letra.toUpperCase();
    })
    .trim() || 'Galeria';
}

function normalizarCategoria(categoria) {
  return String(categoria || '')
    .toLowerCase()
    .trim();
}

function normalizarVariantes(variantes) {
  if (!Array.isArray(variantes)) {
    return [];
  }

  return variantes
    .map(function (variante) {
      if (!variante || typeof variante !== 'object') {
        return null;
      }

      const src = String(variante.src || '').trim();
      const width = Number(variante.width);

      if (!src || !width) {
        return null;
      }

      return { src: src, width: width };
    })
    .filter(function (variante) {
      return variante !== null;
    })
    .sort(function (a, b) {
      return a.width - b.width;
    });
}

function normalizarImagem(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const url = String(item.url || item.src || '').trim();
  const categoria = normalizarCategoria(item.categoria || item.category);

  if (!url || !categoria) {
    return null;
  }

  const variantes = item.variants || item.variantes || {};

  return {
    url: url,
    categoria: categoria,
    alt: item.alt || nomeFicheiro(url),
    width: Number(item.width) || 0,
    height: Number(item.height) || 0,
    avif: normalizarVariantes(variantes.avif),
    webp: normalizarVariantes(variantes.webp)
  };
}

function normalizarLista(lista) {
  if (!Array.isArray(lista)) {
    return [];
  }

  return lista
    .map(normalizarImagem)
    .filter(function (item) {
      return item !== null;
    });
}

function construirSrcset(variantes) {
  return variantes
    .map(function (variante) {
      return escaparHtml(variante.src) + ' ' + variante.width + 'w';
    })
    .join(', ');
}

function construirFontes(item, sizes, carregamento) {
  const partes = [];
  const avifSrcset = construirSrcset(item.avif);
  const webpSrcset = construirSrcset(item.webp);

  if (avifSrcset) {
    partes.push(
      '        <source type="image/avif" srcset="' + avifSrcset + '" sizes="' + sizes + '">'
    );
  }

  if (webpSrcset) {
    partes.push(
      '        <source type="image/webp" srcset="' + webpSrcset + '" sizes="' + sizes + '">'
    );
  }

  const dimensoes = item.width && item.height
    ? ' width="' + item.width + '" height="' + item.height + '"'
    : '';

  partes.push(
    '        <img src="' + escaparHtml(item.url) + '"' + dimensoes +
    ' alt="' + escaparHtml(item.alt) + '" loading="' + carregamento +
    '" decoding="async" class="img-fluid">'
  );

  return partes.join('\n');
}

function urlAmpliada(item) {
  if (item.webp.length) {
    return item.webp[item.webp.length - 1].src;
  }

  if (item.avif.length) {
    return item.avif[item.avif.length - 1].src;
  }

  return item.url;
}

function atualizarAnimacoes() {
  if (window.AOS && typeof window.AOS.refreshHard === 'function') {
    window.AOS.refreshHard();
  } else if (window.AOS && typeof window.AOS.refresh === 'function') {
    window.AOS.refresh();
  }
}

function criarHtmlImagem(item, indice) {
  const href = escaparHtml(urlAmpliada(item));
  const categoria = escaparHtml(item.categoria);
  const alt = escaparHtml(item.alt);
  const carregamento = indice < 8 ? 'eager' : 'lazy';

  return `
    <div class="col-6 col-md-4 col-lg-3 mb-4 filter-item ${categoria}" data-category="${categoria}">
      <a href="${href}" class="gallery-item" data-fancybox="gallery" data-caption="${alt}" data-type="image">
        <div class="gallery-overlay"><i class="fa fa-search-plus"></i></div>
        <picture>
${construirFontes(item, SIZES_GRELHA, carregamento)}
        </picture>
      </a>
    </div>`;
}

function renderizarGaleria(categoria) {
  const grid = document.getElementById('galeria-grid');
  if (!grid) {
    return;
  }

  const categoriaSelecionada = normalizarCategoria(categoria || 'todos');
  const imagensFiltradas = categoriaSelecionada === 'todos'
    ? todasAsImagens
    : todasAsImagens.filter(function (item) {
      return item.categoria === categoriaSelecionada;
    });

  grid.innerHTML = '';

  if (imagensFiltradas.length === 0) {
    atualizarAnimacoes();
    return;
  }

  imagensFiltradas.forEach(function (item, indice) {
    grid.insertAdjacentHTML('beforeend', criarHtmlImagem(item, indice));
  });

  atualizarAnimacoes();
}

function renderizarPreviewGaleria() {
  const preview = document.getElementById('galeria-dinamica');
  if (!preview) {
    return;
  }

  preview.innerHTML = '';

  todasAsImagens.slice(0, 6).forEach(function (item, index) {
    const delay = [100, 200, 300, 400, 100, 200][index] || 100;
    const href = escaparHtml(urlAmpliada(item));
    const alt = escaparHtml(item.alt);

    preview.insertAdjacentHTML('beforeend', `
      <div class="col-6 col-md-6 col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="${delay}">
        <a href="${href}" data-fancybox="gallery" data-caption="${alt}" data-type="image" class="gallery-item">
          <picture>
${construirFontes(item, SIZES_PREVIEW, index < 3 ? 'eager' : 'lazy')}
          </picture>
        </a>
      </div>`);
  });

  atualizarAnimacoes();
}

function ativarBotaoFiltro(botaoAtivo) {
  const filtros = document.getElementById('gallery-filters');
  if (!filtros || !botaoAtivo) {
    return;
  }

  filtros.querySelectorAll('.filter-btn').forEach(function (botao) {
    botao.classList.remove('active');
  });

  botaoAtivo.classList.add('active');
}

function ligarBotoesFiltro() {
  const filtros = document.getElementById('gallery-filters');
  if (!filtros) {
    return;
  }

  filtros.querySelectorAll('.filter-btn').forEach(function (botao) {
    botao.addEventListener('click', function () {
      const categoria = botao.getAttribute('data-filter') || 'todos';
      ativarBotaoFiltro(botao);
      renderizarGaleria(categoria);
    });
  });
}

function aplicarDadosGaleria(lista) {
  todasAsImagens = normalizarLista(lista);
  renderizarPreviewGaleria();
  renderizarGaleria('todos');
}

function carregarGaleria() {
  ligarBotoesFiltro();
  aplicarDadosGaleria(window.galleryData || []);
}

document.addEventListener('DOMContentLoaded', carregarGaleria);
