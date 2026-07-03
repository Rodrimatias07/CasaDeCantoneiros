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
      this.initBookingFastForm();
      this.initFormSubmitAJAX();
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
          'autoclose': true
        });
        $('#checkin_date, #checkout_date').datepicker({
          'format': 'd MM, yyyy', // Format: 10 Outubro, 2026
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
     * Handle Formspree.io forms with AJAX to prevent redirect and show success message
     */
    initFormSubmitAJAX: function () {
      $('form[action^="https://formspree.io"]').on('submit', function (e) {
        e.preventDefault();
        const $form = $(this);
        let actionUrl = $form.attr('action');

        const $btn = $form.find('button[type="submit"]');
        const originalBtnHtml = $btn.html();

        $btn.html('<i class="fa fa-spinner fa-spin"></i> A ENVIAR...').prop('disabled', true);

        // Convert form data to object for JSON payload
        const formData = new FormData($form[0]);
        const dataObj = {};
        formData.forEach((value, key) => dataObj[key] = value);

        fetch(actionUrl, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(dataObj)
        })
          .then(response => {
            if (!response.ok) {
              return response.json().then(data => { throw new Error(data.error || "Erro ao enviar") });
            }
            return response.json();
          })
          .then(data => {
            $btn.html('<i class="fa fa-check"></i> ENVIADO COM SUCESSO').css('background-color', '#28a745').css('color', '#fff').css('border-color', '#28a745');
            $form[0].reset();

            // Show success message
            if ($form.find('.form-message').length === 0) {
              $form.prepend('<div class="alert alert-success form-message" style="background-color: #d4edda; color: #155724; padding: 15px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #c3e6cb; font-size: 15px;"><strong>Enviado com sucesso!</strong> A sua mensagem foi enviada. Entraremos em contacto brevemente.</div>');
            }

            setTimeout(() => {
              $btn.html(originalBtnHtml).prop('disabled', false).css('background-color', '').css('color', '').css('border-color', '');
              $form.find('.form-message').fadeOut(function () { $(this).remove(); });
            }, 8000);
          })
          .catch(error => {
            $btn.html('<i class="fa fa-exclamation-triangle"></i> ERRO AO ENVIAR').css('background-color', '#dc3545').css('color', '#fff').css('border-color', '#dc3545');

            if ($form.find('.form-message').length === 0) {
              $form.prepend('<div class="alert alert-danger form-message" style="background-color: #f8d7da; color: #721c24; padding: 15px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #f5c6cb; font-size: 15px;">Ocorreu um erro ao enviar a sua mensagem. Por favor, tente novamente diretamente para o nosso email ou telefone.</div>');
            }

            setTimeout(() => {
              $btn.html(originalBtnHtml).prop('disabled', false).css('background-color', '').css('color', '').css('border-color', '');
              $form.find('.form-message').fadeOut(function () { $(this).remove(); });
            }, 6000);
          });
      });
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
    }
  };

  // Initialize App when DOM is ready
  $(document).ready(function () {
    App.init();
  });

})(jQuery);
