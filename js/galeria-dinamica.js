const endpointGaleria = 'obter_galeria.php';

let todasAsImagens = [];

const imagensFallbackGaleria = [
  { url: 'images/galeria/envolvente/detalhe-2.jpg', categoria: 'envolvente' },
  { url: 'images/galeria/interior/casa-de-banho.jpg', categoria: 'interior' },
  { url: 'images/galeria/interior/cozinha.jpg', categoria: 'interior' },
  { url: 'images/galeria/interior/IMG_3421.jpeg', categoria: 'interior' },
  { url: 'images/galeria/interior/IMG_3422.jpeg', categoria: 'interior' },
  { url: 'images/galeria/interior/IMG_3425.jpeg', categoria: 'interior' },
  { url: 'images/galeria/interior/IMG_3431.jpeg', categoria: 'interior' },
  { url: 'images/galeria/interior/IMG_3434.jpeg', categoria: 'interior' },
  { url: 'images/galeria/interior/IMG_3436.jpeg', categoria: 'interior' },
  { url: 'images/galeria/interior/IMG_3437.jpeg', categoria: 'interior' },
  { url: 'images/galeria/interior/quarto.jpg', categoria: 'interior' }
];

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

  const url = String(item.url || '').trim();
  const categoria = normalizarCategoria(item.categoria);

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
        <img src="${url}" sizes="(max-width: 575px) 50vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw" loading="lazy" alt="${alt}" class="img-fluid">
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
          <img src="${url}" alt="${alt}" class="img-fluid rounded shadow-sm" loading="lazy">
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

function usarFallbackGaleria(motivo) {
  console.warn('Galeria dinamica indisponivel. A usar fallback local.', motivo);
  aplicarDadosGaleria(imagensFallbackGaleria);
}

function carregarGaleria() {
  ligarBotoesFiltro();

  fetch(endpointGaleria, { cache: 'no-store' })
    .then(function (resposta) {
      if (!resposta.ok) {
        throw new Error('Resposta invalida da galeria: ' + resposta.status);
      }

      return resposta.text();
    })
    .then(function (texto) {
      let dados;

      try {
        dados = JSON.parse(texto);
      } catch (erro) {
        usarFallbackGaleria(erro);
        return;
      }

      console.log('DADOS DA GALERIA:', dados);

      if (!Array.isArray(dados) || dados.length === 0) {
        usarFallbackGaleria('JSON recebido nao e um array ou veio vazio.');
        return;
      }

      aplicarDadosGaleria(dados);
    })
    .catch(function (erro) {
      usarFallbackGaleria(erro);
    });
}

document.addEventListener('DOMContentLoaded', carregarGaleria);
