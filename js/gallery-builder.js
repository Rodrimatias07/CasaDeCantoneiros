(function () {
  'use strict';

  function toTitleCase(text) {
    return text
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, function (match) {
        return match.toUpperCase();
      })
      .trim();
  }

  function buildGalleryItem(item) {
    const imgSrc = item.thumb || item.src || '';
    const srcset = item.srcset ? ` srcset="${item.srcset}"` : '';
    return `
      <div class="col-6 col-md-4 col-lg-3 mb-4 filter-item ${item.category}" data-category="${item.category}">
        <a href="${item.src}" class="gallery-item" data-fancybox="gallery">
          <div class="gallery-overlay"><i class="fa fa-search-plus"></i></div>
          <img src="${imgSrc}"${srcset} sizes="(max-width: 575px) 50vw, (max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw" loading="lazy" alt="${item.alt}" class="img-fluid">
        </a>
      </div>`;
  }

  function filterItems(items, filterValue) {
    if (filterValue === 'all') {
      return items;
    }
    return items.filter(item => item.category === filterValue);
  }

  function refreshAOS() {
    if (window.AOS && typeof window.AOS.refreshHard === 'function') {
      window.AOS.refreshHard();
    } else if (window.AOS && typeof window.AOS.refresh === 'function') {
      window.AOS.refresh();
    }
  }

  function buildFiltersFromItems(items) {
    const categories = Array.from(new Set(items.map(item => item.category)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));

    return [
      { value: 'all', label: 'Todos' },
      ...categories.map(category => ({ value: category, label: toTitleCase(category) }))
    ];
  }

  window.GalleryBuilder = {
    init: function (gridSelector, filtersSelector) {
      this.grid = document.querySelector(gridSelector);
      this.filtersContainer = document.querySelector(filtersSelector);
      this.items = Array.isArray(window.galleryData) ? window.galleryData : [];
      this.filters = Array.isArray(window.galleryFilters) && window.galleryFilters.length
        ? window.galleryFilters
        : buildFiltersFromItems(this.items);
      this.currentFilter = 'all';

      if (!this.grid) {
        console.warn('GalleryBuilder: grid selector not found:', gridSelector);
        return;
      }

      this.renderFilters();
      this.renderItems();
      this.bindFilterEvents();
    },

    renderFilters: function () {
      if (!this.filtersContainer) {
        return;
      }

      const buttons = this.filtersContainer.querySelectorAll('.filter-btn');
      buttons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-filter') === this.currentFilter);
      });
    },

    renderItems: function () {
      const filteredItems = filterItems(this.items, this.currentFilter);

      this.grid.innerHTML = '';

      if (!filteredItems.length) {
        this.grid.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Nenhuma imagem encontrada.</p></div>';
        refreshAOS();
        return;
      }

      filteredItems.forEach(item => {
        this.grid.insertAdjacentHTML('beforeend', buildGalleryItem(item));
      });

      refreshAOS();
    },

    bindFilterEvents: function () {
      if (!this.filtersContainer) {
        return;
      }

      const buttons = this.filtersContainer.querySelectorAll('.filter-btn');
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const filterValue = button.getAttribute('data-filter');
          if (!filterValue) {
            return;
          }

          buttons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          this.currentFilter = filterValue;
          this.renderItems();
        });
      });
    }
  };
})();
