(function ($) {
  'use strict';

  const App = {
    init: function () {
      this.renderComponents();
    },

    /**
     * Render Header and Footer components synchronously (Fix for local file:// protocol)
     */
    /**
     * Render Header and Footer components asynchronously
     */
    renderComponents: function () {
      const self = this;

      const loadHeader = new Promise((resolve, reject) => {
        $('#cabecalho-container').load('components/cabecalho.html', function (response, status, xhr) {
          if (status == "error") {
            console.error("Error loading header:", xhr.status, xhr.statusText);
            reject(xhr);
          } else {
            resolve();
          }
        });
      });

      const loadFooter = new Promise((resolve, reject) => {
        $('#rodape-container').load('components/rodape.html', function (response, status, xhr) {
          if (status == "error") {
            console.error("Error loading footer:", xhr.status, xhr.statusText);
            reject(xhr);
          } else {
            resolve();
          }
        });
      });

      Promise.all([loadHeader, loadFooter])
        .then(() => {
          // Initialize dependent functions immediately after loading
          self.initMenuToggle();
          self.initDropdownHover();
          self.initStickyHeader();
          self.setActiveMenuItem();
          self.initFooterYear();
          self.initGoToTop(); // Potentially relies on footer elements
        })
        .catch(error => {
          console.error("Failed to load components", error);
        });

      // Initialize independent components (those not in header/footer)
      this.initAOS();
      this.initHomeSlider();
      this.initCarousels();
      this.initStellar();
      this.initSmoothScroll();
      this.initDatePickers();
      this.initGuestPickers();
      this.initReservationPrefill();
      this.initReservationDateValidation();
      this.initBookingFastForm();
      this.initCookieConsent();
    },

    /**
     * Set the active menu item based on current URL
     */
    setActiveMenuItem: function () {
      const path = window.location.pathname;
      const page = path.split("/").pop();

      $('.site-navbar .menu li').removeClass('active');

      $('.site-navbar .menu li a').each(function () {
        const href = $(this).attr('href');
        if (href === page || (page === '' && href === 'index.html')) {
          $(this).parent().addClass('active');
        }
      });
    },

    /**
     * Initialize the mobile menu toggle functionality
     */
    initMenuToggle: function () {
      // Unbind first to prevent multiple events if re-initialized
      $('.js-site-menu-toggle').off('click keydown');

      $('.js-site-menu-toggle').on('click keydown', function (e) {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') {
          return;
        }
        e.preventDefault();
        const $this = $(this);
        if ($('body').hasClass('menu-open')) {
          $this.removeClass('open');
          $this.attr('aria-expanded', 'false');
          $('body').removeClass('menu-open');
        } else {
          $this.addClass('open');
          $this.attr('aria-expanded', 'true');
          $('body').addClass('menu-open');
        }
      });
    },

    /**
     * Initialize dropdown hover effects for navigation
     */
    initDropdownHover: function () {
      $('nav .dropdown').hover(function () {
        const $this = $(this);
        $this.addClass('show');
        $this.find('> a').attr('aria-expanded', true);
        $this.find('.dropdown-menu').addClass('show');
      }, function () {
        const $this = $(this);
        $this.removeClass('show');
        $this.find('> a').attr('aria-expanded', false);
        $this.find('.dropdown-menu').removeClass('show');
      });
    },

    /**
     * Initialize Animate On Scroll (AOS from animacoes.js) library
     */
    initAOS: function () {
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 1000
        });
      }
    },

    /**
     * Initialize the main home slider (requires carrossel.js)
     */
    initHomeSlider: function () {
      $('.home-slider').owlCarousel({
        loop: true,
        autoplay: true,
        margin: 10,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        nav: true,
        autoplayHoverPause: true,
        items: 1,
        autoheight: true,
        navText: ["<span class='ion-chevron-left'></span>", "<span class='ion-chevron-right'></span>"],
        responsive: {
          0: { items: 1, nav: false },
          600: { items: 1, nav: false },
          1000: { items: 1, nav: true }
        }
      });
    },

    /**
     * Initialize other carousels used in the application
     */
    initCarousels: function () {
      $('.js-carousel-1').owlCarousel({
        loop: true,
        autoplay: true,
        stagePadding: 7,
        margin: 20,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        nav: true,
        autoplayHoverPause: true,
        items: 3,
        navText: ["<span class='ion-chevron-left'></span>", "<span class='ion-chevron-right'></span>"],
        responsive: {
          0: { items: 1, nav: false },
          600: { items: 2, nav: false },
          1000: { items: 3, nav: true, loop: false }
        }
      });

      $('.js-carousel-2').owlCarousel({
        loop: true,
        autoplay: true,
        stagePadding: 7,
        margin: 20,
        nav: true,
        autoplayHoverPause: true,
        autoHeight: true,
        items: 3,
        navText: ["<span class='ion-chevron-left'></span>", "<span class='ion-chevron-right'></span>"],
        responsive: {
          0: { items: 1, nav: false },
          600: { items: 2, nav: false },
          1000: { items: 3, dots: true, nav: true, loop: false }
        }
      });
    },

    /**
     * Initialize Parallax effects (requires parallax.js)
     */
    initStellar: function () {
      if (typeof $.fn.stellar === 'function') {
        $(window).stellar({
          responsive: false,
          parallaxBackgrounds: true,
          parallaxElements: true,
          horizontalScrolling: false,
          hideDistantElements: false,
          scrollProperty: 'scroll'
        });
      }
    },

    /**
     * Initialize smooth scrolling for anchor links
     */
    initSmoothScroll: function () {
      $('a.smoothscroll[href^="#"]').click(function (e) {
        e.preventDefault();
        const target = this.hash;
        const $target = $(target);

        if ($target.length) {
          $('html, body').stop().animate({
            scrollTop: $target.offset().top
          }, 500, 'swing', function () {
            window.location.hash = target;
          });
        }
      });
    },

    /**
     * Initialize Date/Time pickers (requires calendario.js / relogio.js) with Portuguese localization settings if needed
     */
    initDatePickers: function () {
      if ($.fn.datepicker) {
        $('#m_date').datepicker({
          'format': 'm/d/yyyy',
          'startDate': new Date(),
          'autoclose': true
        });
        $('#checkin_date, #checkout_date').filter(function () {
          return this.type !== 'date';
        }).datepicker({
          'format': 'd MM, yyyy', // Format: 10 Outubro, 2026
          'startDate': new Date(),
          'autoclose': true,
          // If we wanted to localize to PT completely we would add language options here
        });
      }
      if ($.fn.timepicker) {
        $('#m_time').timepicker();
      }
    },

    /**
     * Premium guest quantity pickers synced with the hidden select fields.
     */
    initGuestPickers: function () {
      $('.guest-picker').each(function () {
        const $picker = $(this);
        const $select = $('#' + $picker.data('target'));
        const $toggle = $picker.find('.guest-picker-toggle');
        const $value = $picker.find('.guest-picker-value');

        if (!$select.length) return;

        $value.text($select.val());
        $picker.toggleClass('is-empty', $select.val() === '0');
        $picker.find('.guest-picker-menu button').removeClass('selected');
        $picker.find(`.guest-picker-menu button[data-value="${$select.val()}"]`).addClass('selected');

        $toggle.off('click').on('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          $('.guest-picker').not($picker).removeClass('open').find('.guest-picker-toggle').attr('aria-expanded', 'false');
          $picker.toggleClass('open');
          $toggle.attr('aria-expanded', $picker.hasClass('open') ? 'true' : 'false');
        });

        $picker.find('.guest-picker-menu button').off('click').on('click', function (e) {
          e.preventDefault();
          const selectedValue = $(this).data('value').toString();
          $select.val(selectedValue).trigger('change');
          $value.text(selectedValue);
          $picker.toggleClass('is-empty', selectedValue === '0');
          $picker.find('.guest-picker-menu button').removeClass('selected');
          $(this).addClass('selected');
          $picker.removeClass('open');
          $toggle.attr('aria-expanded', 'false');
        });
      });

      $(document).off('click.guestPickers').on('click.guestPickers', function () {
        $('.guest-picker').removeClass('open').find('.guest-picker-toggle').attr('aria-expanded', 'false');
      });
    },

    /**
     * Prefill the full reservation form from the quick booking bar.
     */
    initReservationPrefill: function () {
      const params = new URLSearchParams(window.location.search);
      if (!params.toString()) return;

      const parseBookingDate = function (value) {
        if (!value) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

        const cleaned = value.replace(',', '').trim().toLowerCase();
        const parts = cleaned.split(/\s+/);
        if (parts.length < 3) return '';

        const months = {
          january: '01', fevereiro: '02', february: '02', marco: '03', março: '03', march: '03',
          abril: '04', april: '04', maio: '05', may: '05', junho: '06', june: '06',
          julho: '07', july: '07', agosto: '08', august: '08', setembro: '09', september: '09',
          outubro: '10', october: '10', novembro: '11', november: '11', dezembro: '12', december: '12'
        };

        const day = parts[0].padStart(2, '0');
        const month = months[parts[1]];
        const year = parts[2];

        return month && year ? `${year}-${month}-${day}` : '';
      };

      const setSelectByPrefix = function ($select, value) {
        if (!$select.length || value === null) return;
        const normalized = value.toString().replace('+', '');
        const $option = $select.find('option').filter(function () {
          return $(this).text().trim().indexOf(normalized) === 0 || $(this).val() === normalized;
        }).first();

        if ($option.length) {
          $select.val($option.val());
        }
      };

      $('#checkin_date').val(parseBookingDate(params.get('checkin')));
      $('#checkout_date').val(parseBookingDate(params.get('checkout')));
      setSelectByPrefix($('#adults'), params.get('adults'));
      setSelectByPrefix($('#children'), params.get('children'));
    },

    /**
     * Enforce native date input rules for the reservation form.
     * Keeps mobile on a single native calendar and blocks invalid stays.
     */
    initReservationDateValidation: function () {
      const checkin = document.querySelector('input[type="date"]#checkin_date');
      const checkout = document.querySelector('input[type="date"]#checkout_date');

      if (!checkin && !checkout) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const formatDate = function (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const addDays = function (value, days) {
        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) return '';
        date.setDate(date.getDate() + days);
        return formatDate(date);
      };

      const todayValue = formatDate(today);

      if (checkin) {
        checkin.min = todayValue;
      }

      if (checkout) {
        checkout.min = checkin && checkin.value ? addDays(checkin.value, 1) : todayValue;
      }

      const syncCheckoutMin = function () {
        if (checkin) checkin.setCustomValidity('');
        if (checkout) checkout.setCustomValidity('');

        if (!checkin || !checkout) return;

        if (checkin.value && checkin.value < todayValue) {
          checkin.value = '';
        }

        const nextDay = checkin.value ? addDays(checkin.value, 1) : todayValue;
        checkout.min = nextDay;

        if (checkout.value && checkout.value < nextDay) {
          checkout.value = '';
        }
      };

      syncCheckoutMin();

      if (checkin) {
        checkin.addEventListener('change', syncCheckoutMin);
        checkin.addEventListener('input', syncCheckoutMin);
      }

      if (checkout) {
        checkout.addEventListener('change', function () {
          checkout.setCustomValidity('');
        });
        checkout.addEventListener('input', function () {
          checkout.setCustomValidity('');
        });
      }

      const form = checkin ? checkin.closest('form') : checkout.closest('form');
      if (!form) return;

      form.addEventListener('submit', function (event) {
        if (checkin && checkin.value && checkin.value < todayValue) {
          event.preventDefault();
          checkin.setCustomValidity('A data de entrada não pode ser anterior a hoje.');
          checkin.reportValidity();
          return;
        }

        if (checkout && checkout.value && checkout.value < todayValue) {
          event.preventDefault();
          checkout.setCustomValidity('A data de saída não pode ser anterior a hoje.');
          checkout.reportValidity();
          return;
        }

        if (checkin && checkout && checkin.value && checkout.value) {
          const minimumCheckout = addDays(checkin.value, 1);

          if (checkout.value < minimumCheckout) {
            event.preventDefault();
            checkout.setCustomValidity('A data de saída tem de ser pelo menos um dia depois da entrada.');
            checkout.reportValidity();
            return;
          }
        }

        if (checkin) checkin.setCustomValidity('');
        if (checkout) checkout.setCustomValidity('');
      });
    },

    /**
     * Initialize Fast Booking Form Redirect
     */
    initBookingFastForm: function () {
      const $form = $('#booking_fast_form');
      if ($form.length) {
        $form.on('submit', function (e) {
          e.preventDefault();

          const checkin = $('#checkin_date').val() || '[Sem data de Check-in]';
          const checkout = $('#checkout_date').val() || '[Sem data de Check-out]';
          const adults = $('#booking_adults').val() || '0';
          const children = $('#booking_children').val() || '0';

          // WhatsApp direct flow kept as fallback if the client wants it again later.
          // const adultsText = adults === '1' ? '1 adulto' : `${adults} adultos`;
          // const childrenText = children === '1' ? '1 criança' : `${children} crianças`;
          // const message = `Olá! Gostaria de fazer uma reserva de ${checkin} a ${checkout} para ${adultsText} e ${childrenText}.`;
          // const whatsappUrl = `https://wa.me/351965507158?text=${encodeURIComponent(message)}`;
          // window.open(whatsappUrl, '_blank');

          const params = new URLSearchParams({
            checkin: checkin,
            checkout: checkout,
            adults: adults,
            children: children
          });

          window.location.href = `reservas.html?${params.toString()}#next`;
        });
      }
    },

    /**
     * Handle sticky header behavior on scroll
     */
    initStickyHeader: function () {
      const updateHeaderState = function () {
        const $win = $(window);
        if ($win.scrollTop() > 8) {
          $('.js-site-header').addClass('scrolled');
        } else {
          $('.js-site-header').removeClass('scrolled');
        }
      };

      $(window).off('scroll.stickyHeader resize.stickyHeader');
      $(window).on('scroll.stickyHeader resize.stickyHeader', updateHeaderState);
      updateHeaderState();
    },

    /**
     * "Back to Top" button functionality
     */
    initGoToTop: function () {
      $('.js-gotop').on('click', function (event) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: $('html').offset().top
        }, 500, 'easeInOutExpo');
        return false;
      });

      $(window).scroll(function () {
        const $win = $(window);
        if ($win.scrollTop() > 200) {
          $('.js-top').addClass('active');
        } else {
          $('.js-top').removeClass('active');
        }
      });
    },

    /**
     * Set the current year in the footer
     */
    initFooterYear: function () {
      const yearElement = document.getElementById('ano-atual');
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
      }
    },

    /**
     * Cookie consent bottom sheet with localStorage persistence.
     */
    initCookieConsent: function () {
      const banner = document.getElementById('cookie-banner');
      if (!banner) return;

      const storageKey = 'cookie_consent';

      const readConsent = function () {
        try {
          return localStorage.getItem(storageKey);
        } catch (error) {
          return null;
        }
      };

      const saveConsent = function (choice) {
        try {
          localStorage.setItem(storageKey, JSON.stringify({
            choice: choice,
            savedAt: new Date().toISOString()
          }));
        } catch (error) {
          // Browsers can block localStorage in private modes; the banner still closes for this session.
        }
      };

      const showBanner = function () {
        banner.style.display = 'block';
        window.setTimeout(function () {
          banner.classList.add('is-visible');
          banner.setAttribute('aria-hidden', 'false');
        }, 20);
      };

      const hideBanner = function () {
        banner.classList.remove('is-visible');
        banner.setAttribute('aria-hidden', 'true');
        window.setTimeout(function () {
          banner.style.display = 'none';
        }, 280);
      };

      if (readConsent()) {
        banner.style.display = 'none';
        return;
      }

      banner.querySelectorAll('[data-cookie-choice]').forEach(function (button) {
        button.addEventListener('click', function () {
          saveConsent(button.getAttribute('data-cookie-choice'));
          hideBanner();
        });
      });

      window.setTimeout(showBanner, 500);
    }
  };

  // Initialize App when DOM is ready
  $(document).ready(function () {
    App.init();
  });

})(jQuery);
