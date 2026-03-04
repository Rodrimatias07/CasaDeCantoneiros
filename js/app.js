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
      $('.js-site-menu-toggle').off('click');

      $('.js-site-menu-toggle').click(function (e) {
        e.preventDefault();
        const $this = $(this);
        if ($('body').hasClass('menu-open')) {
          $this.removeClass('open');
          $('.js-site-navbar').fadeOut(400);
          $('body').removeClass('menu-open');
        } else {
          $this.addClass('open');
          $('.js-site-navbar').fadeIn(400);
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
     * Initialize Fast Booking Form Redirect (WhatsApp)
     */
    initBookingFastForm: function () {
      const $form = $('#booking_fast_form');
      if ($form.length) {
        $form.on('submit', function (e) {
          e.preventDefault();

          const checkin = $('#checkin_date').val() || '[Sem data de Check-in]';
          const checkout = $('#checkout_date').val() || '[Sem data de Check-out]';
          const adults = $('#booking_adults').val() || '2 Adultos';
          const children = $('#booking_children').val() || '0 Crianças';

          const message = `Olá! Gostaria de fazer uma reserva de ${checkin} a ${checkout} para ${adults} e ${children}.`;
          const whatsappUrl = `https://wa.me/351965507158?text=${encodeURIComponent(message)}`;

          window.open(whatsappUrl, '_blank');
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
      $(window).scroll(function () {
        const $win = $(window);
        if ($win.scrollTop() > 200) {
          $('.js-site-header').addClass('scrolled');
        } else {
          $('.js-site-header').removeClass('scrolled');
        }
      });
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