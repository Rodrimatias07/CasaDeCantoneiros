(function () {
  'use strict';

  const endpoint = 'obter_galeria.php';

  function fileNameFromPath(path) {
    return String(path || '')
      .split('/')
      .pop()
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, function (letter) {
        return letter.toUpperCase();
      })
      .trim() || 'Galeria';
  }

  function categoryFromPath(path) {
    const parts = String(path || '').split('/');
    const galleryIndex = parts.indexOf('galeria');
    return galleryIndex >= 0 && parts[galleryIndex + 1] ? parts[galleryIndex + 1] : 'galeria';
  }

  function normalizeImages(paths) {
    if (!Array.isArray(paths)) {
      return [];
    }

    return paths
      .filter(function (path) {
        return typeof path === 'string' && path.trim() !== '';
      })
      .map(function (path) {
        return {
          category: categoryFromPath(path),
          src: path,
          alt: fileNameFromPath(path)
        };
      });
  }

  function fallbackItems() {
    return Array.isArray(window.galleryData) ? window.galleryData : [];
  }

  function refreshAOS() {
    if (window.AOS && typeof window.AOS.refreshHard === 'function') {
      window.AOS.refreshHard();
    } else if (window.AOS && typeof window.AOS.refresh === 'function') {
      window.AOS.refresh();
    }
  }

  function renderPreview(items) {
    const container = document.getElementById('galeria-dinamica');
    if (!container) {
      return;
    }

    const previewItems = items.slice(0, 6);
    container.innerHTML = previewItems.map(function (item, index) {
      const delay = [100, 200, 300, 400, 100, 200][index] || 100;

      return `
        <div class="col-6 col-md-6 col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="${delay}">
          <a href="${item.src}" data-fancybox="gallery" class="gallery-item">
            <img src="${item.src}" alt="${item.alt}" class="img-fluid rounded shadow-sm" loading="lazy">
          </a>
        </div>`;
    }).join('');

    refreshAOS();
  }

  function initFullGallery(items) {
    if (typeof window.GalleryBuilder === 'undefined' || !document.querySelector('#gallery-grid')) {
      return;
    }

    window.galleryData = items;
    window.GalleryBuilder.init('#gallery-grid', '#gallery-filters');
  }

  function applyGallery(items) {
    if (!items.length) {
      items = fallbackItems();
    }

    renderPreview(items);
    initFullGallery(items);
  }

  function initDynamicGallery() {
    fetch(endpoint, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Galeria PHP indisponivel');
        }

        return response.json();
      })
      .then(function (paths) {
        applyGallery(normalizeImages(paths));
      })
      .catch(function () {
        applyGallery(fallbackItems());
      });
  }

  document.addEventListener('DOMContentLoaded', initDynamicGallery);
})();
