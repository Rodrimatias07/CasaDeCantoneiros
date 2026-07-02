(function () {
  'use strict';

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderStars(value) {
    var rating = Math.round(Math.max(0, Math.min(5, Number(value) || 0)));
    var stars = [];
    for (var i = 1; i <= 5; i += 1) {
      stars.push(i <= rating ? '<span class="fa fa-star"></span>' : '<span class="fa fa-star-o"></span>');
    }
    return stars.join('');
  }

  function setStatus(text) {
    var statusEl = document.getElementById('google-reviews-loading');
    if (statusEl) {
      statusEl.innerHTML = '<div class="col-12 text-center text-muted">' + escapeHtml(text) + '</div>';
    }
  }

  var fallbackReviews = [
    {
      author_name: 'Hóspede da Casa',
      rating: 5,
      relative_time_description: 'Avaliação recente',
      text: 'Casa acolhedora, bem cuidada e perfeita para descansar em família.'
    },
    {
      author_name: 'Visitante',
      rating: 5,
      relative_time_description: 'Avaliação recente',
      text: 'Espaço tranquilo, confortável e com uma envolvente rural muito bonita.'
    },
    {
      author_name: 'Reserva direta',
      rating: 5,
      relative_time_description: 'Avaliação recente',
      text: 'Boa localização para desligar da rotina e aproveitar a natureza.'
    }
  ];

  function hideStatus() {
    var statusEl = document.getElementById('google-reviews-loading');
    if (statusEl) {
      statusEl.style.display = 'none';
    }
  }

  function renderReview(review) {
    var avatar = '';
    if (review.profile_photo_url) {
      avatar = '<img src="' + escapeHtml(review.profile_photo_url) + '" alt="' + escapeHtml(review.author_name) + '" class="author-img mr-3">';
    } else {
      avatar = '<span class="fa fa-user-circle text-gold fa-2x mr-3"></span>';
    }

    return '' +
      '<div class="col-md-6 col-lg-4 mb-4" data-aos="fade-up">' +
      '  <div class="testimonial-card">' +
      '    <div class="quote-icon mb-3"><span class="fa fa-quote-left text-gold"></span></div>' +
      '    <p class="testimonial-content mb-4">"' + escapeHtml(review.text) + '"</p>' +
      '    <div class="testimonial-author d-flex align-items-center">' +
      avatar +
      '      <div>' +
      '        <h4 class="h6 mb-0">' + escapeHtml(review.author_name) + '</h4>' +
      '        <div class="star-rating">' + renderStars(review.rating) + '</div>' +
      '        <small class="text-muted">' + escapeHtml(review.relative_time_description || '') + '</small>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>';
  }

  function renderPlaceSummary(place) {
    var summaryEl = document.getElementById('google-reviews-summary');
    if (!summaryEl || !place) {
      return;
    }

    var ratingText = place.rating ? place.rating.toFixed(1) + ' / 5' : 'Sem avaliação média';
    var reviewsCount = place.user_ratings_total ? '· ' + place.user_ratings_total + ' avaliações' : '';
    summaryEl.innerHTML = '<strong>' + escapeHtml(place.name || 'Casa de Cantoneiros') + '</strong> ' +
      '<span class="text-gold">' + escapeHtml(ratingText) + '</span> ' +
      '<span class="text-muted">' + escapeHtml(reviewsCount) + '</span>';
  }

  function renderReviews(place, maxReviews) {
    var container = document.getElementById('google-reviews');
    if (!container) {
      return;
    }

    if (!place || !Array.isArray(place.reviews) || place.reviews.length === 0) {
      container.innerHTML = '<div class="col-12 text-center text-muted">Nenhum comentário disponível no Google Maps.</div>';
      return;
    }

    var reviews = place.reviews.slice(0, maxReviews);
    container.innerHTML = reviews.map(renderReview).join('');
  }

  function renderFallbackReviews() {
    var summaryEl = document.getElementById('google-reviews-summary');
    var container = document.getElementById('google-reviews');

    hideStatus();

    if (summaryEl) {
      summaryEl.innerHTML = '<strong>Casa de Cantoneiros</strong> <span class="text-muted">Testemunhos de hóspedes</span>';
    }

    if (container) {
      container.innerHTML = fallbackReviews.map(renderReview).join('');
    }
  }

  function fetchPlaceDetails(placeId, maxReviews) {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      throw new Error('Google Maps JavaScript API não carregada');
    }

    var service = new google.maps.places.PlacesService(document.createElement('div'));
    return new Promise(function (resolve, reject) {
      service.getDetails({
        placeId: placeId,
        fields: ['name', 'rating', 'user_ratings_total', 'reviews']
      }, function (placeResult, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          reject(new Error('PlacesService erro: ' + status));
          return;
        }
        hideStatus();
        renderPlaceSummary(placeResult);
        renderReviews(placeResult, maxReviews);
        resolve(placeResult);
      });
    });
  }

  function init() {
    var config = window.googleMapsReviewsConfig || {};
    var apiKey = config.apiKey || '';
    var placeId = config.placeId || '';
    var maxReviews = Number(config.maxReviews) || 3;

    window.setTimeout(function () {
      var hasReviews = document.querySelectorAll('#google-reviews .testimonial-card').length > 0;
      var loadingEl = document.getElementById('google-reviews-loading');
      if (!hasReviews && loadingEl && loadingEl.style.display !== 'none') {
        renderFallbackReviews();
      }
    }, 2500);

    if (!apiKey) {
      renderFallbackReviews();
      return;
    }

    if (!placeId) {
      setStatus('Configure googleMapsReviewsConfig.placeId em index.html.');
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      renderFallbackReviews();
      return;
    }

    fetchPlaceDetails(placeId, maxReviews).catch(function (err) {
      console.error(err);
      renderFallbackReviews();
    });
  }

  function onReady(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  onReady(init);
})();
