let todasAsImagens = [];

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

function normalizarImagem(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const url = String(item.url || item.src || '').trim();
  const categoria = normalizarCategoria(item.categoria || item.category);

  if (!url || !categoria) {
    return null;
  }

  return {
    url: url,
    categoria: categoria,
    alt: item.alt || nomeFicheiro(url)
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

function atualizarAnimacoes() {
  if (window.AOS && typeof window.AOS.refreshHard === 'function') {
    window.AOS.refreshHard();
  } else if (window.AOS && typeof window.AOS.refresh === 'function') {
    window.AOS.refresh();
  }
}

function criarHtmlImagem(item) {
  const url = escaparHtml(item.url);
  const categoria = escaparHtml(item.categoria);
  const alt = escaparHtml(item.alt);

  return `
    <div class="col-6 col-md-4 col-lg-3 mb-4 filter-item ${categoria}" data-category="${categoria}">
      <a href="${url}" class="gallery-item" data-fancybox="gallery">
        <div class="gallery-overlay"><i class="fa fa-search-plus"></i></div>
        <img src="${url}" sizes="(max-width: 575px) 50vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw" loading="lazy" decoding="async" alt="${alt}" class="img-fluid">
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

  imagensFiltradas.forEach(function (item) {
    grid.insertAdjacentHTML('beforeend', criarHtmlImagem(item));
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
    const url = escaparHtml(item.url);
    const alt = escaparHtml(item.alt);

    preview.insertAdjacentHTML('beforeend', `
      <div class="col-6 col-md-6 col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="${delay}">
        <a href="${url}" data-fancybox="gallery" class="gallery-item">
          <img src="${url}" alt="${alt}" class="img-fluid rounded shadow-sm" loading="lazy" decoding="async">
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
