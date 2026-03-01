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