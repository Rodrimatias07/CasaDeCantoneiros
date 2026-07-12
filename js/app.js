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
      this.initReservationSelectPickers();
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
          'format': 'dd/mm/yyyy',
          'startDate': new Date(),
          'autoclose': true
        });
        $('#checkin_date, #checkout_date').filter(function () {
          return this.type !== 'date';
        }).datepicker({
          'format': 'dd/mm/yyyy',
          'startDate': new Date(),
          'autoclose': true
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
     * Replace reservation native selects with a polished custom picker.
     * The original select remains synced for form submission.
     */
    initReservationSelectPickers: function () {
      const selects = document.querySelectorAll('form[action="enviar_reserva.php"] select#adults, form[action="enviar_reserva.php"] select#children');
      if (!selects.length) return;

      const closeAll = function (exceptPicker) {
        document.querySelectorAll('.reservation-select-picker.is-open').forEach(function (picker) {
          if (picker !== exceptPicker) {
            picker.classList.remove('is-open');
            const toggle = picker.querySelector('.reservation-select-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
          }
        });
      };

      selects.forEach(function (select) {
        if (select.dataset.enhanced === 'true') return;

        const picker = document.createElement('div');
        const toggle = document.createElement('button');
        const value = document.createElement('span');
        const arrow = document.createElement('span');
        const menu = document.createElement('div');

        select.dataset.enhanced = 'true';
        select.classList.add('enhanced-select-native');
        select.tabIndex = -1;

        picker.className = 'reservation-select-picker';
        toggle.type = 'button';
        toggle.className = 'reservation-select-toggle';
        toggle.setAttribute('aria-haspopup', 'listbox');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', select.previousElementSibling ? select.previousElementSibling.textContent.replace('*', '').trim() : 'Selecionar opção');

        value.className = 'reservation-select-value';
        arrow.className = 'reservation-select-arrow';
        menu.className = 'reservation-select-menu';
        menu.setAttribute('role', 'listbox');

        toggle.appendChild(value);
        toggle.appendChild(arrow);
        picker.appendChild(toggle);
        picker.appendChild(menu);
        select.insertAdjacentElement('afterend', picker);

        const refresh = function () {
          value.textContent = select.options[select.selectedIndex] ? select.options[select.selectedIndex].textContent : '';
          menu.querySelectorAll('.reservation-select-option').forEach(function (button) {
            const isSelected = button.dataset.value === select.value;
            button.classList.toggle('is-selected', isSelected);
            button.setAttribute('aria-selected', isSelected ? 'true' : 'false');
          });
        };

        Array.from(select.options).forEach(function (option) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'reservation-select-option';
          button.dataset.value = option.value;
          button.textContent = option.textContent;
          button.setAttribute('role', 'option');

          button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            picker.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            refresh();
          });

          menu.appendChild(button);
        });

        toggle.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          const willOpen = !picker.classList.contains('is-open');
          closeAll(picker);
          picker.classList.toggle('is-open', willOpen);
          toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        });

        select.addEventListener('change', refresh);
        refresh();
      });

      document.addEventListener('click', function () {
        closeAll();
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeAll();
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
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          const parts = value.split('-');
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        const cleaned = value.replace(',', '').trim().toLowerCase();
        const parts = cleaned.split(/\s+/);
        if (parts.length < 3) return '';

        const months = {
          'january': '01', 'fevereiro': '02', 'february': '02', 'marco': '03', 'mar\u00e7o': '03', 'march': '03',
          'abril': '04', 'april': '04', 'maio': '05', 'may': '05', 'junho': '06', 'june': '06',
          'julho': '07', 'july': '07', 'agosto': '08', 'august': '08', 'setembro': '09', 'september': '09',
          'outubro': '10', 'october': '10', 'novembro': '11', 'november': '11', 'dezembro': '12', 'december': '12'
        };

        const day = parts[0].padStart(2, '0');
        const month = months[parts[1]];
        const year = parts[2];

        return month && year ? `${day}/${month}/${year}` : '';
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
     * Enforce reservation date rules in Portuguese display format.
     */
    initReservationDateValidation: function () {
      const form = document.querySelector('form[action="enviar_reserva.php"]');
      const checkin = form ? form.querySelector('#checkin_date') : null;
      const checkout = form ? form.querySelector('#checkout_date') : null;
      const dateInputs = [checkin, checkout].filter(Boolean);

      if (!checkin && !checkout) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const formatDisplayDate = function (date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const formatIsoDate = function (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const parseDisplayDate = function (value) {
        if (!value) return null;

        const trimmed = value.trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          const isoParts = trimmed.split('-').map(Number);
          const isoDate = new Date(isoParts[0], isoParts[1] - 1, isoParts[2]);
          return Number.isNaN(isoDate.getTime()) ? null : isoDate;
        }

        const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!match) return null;

        const day = Number(match[1]);
        const month = Number(match[2]);
        const year = Number(match[3]);
        const date = new Date(year, month - 1, day);

        if (
          Number.isNaN(date.getTime()) ||
          date.getDate() !== day ||
          date.getMonth() !== month - 1 ||
          date.getFullYear() !== year
        ) {
          return null;
        }

        return date;
      };

      const addDays = function (date, days) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
        const nextDate = new Date(date.getTime());
        nextDate.setDate(nextDate.getDate() + days);
        nextDate.setHours(0, 0, 0, 0);
        return nextDate;
      };

      const compareDates = function (first, second) {
        if (!first || !second) return 0;
        const firstTime = new Date(first.getFullYear(), first.getMonth(), first.getDate()).getTime();
        const secondTime = new Date(second.getFullYear(), second.getMonth(), second.getDate()).getTime();
        return firstTime - secondTime;
      };

      const setDatepickerStart = function (input, date) {
        if (!input || !$.fn.datepicker || !(date instanceof Date)) return;

        try {
          $(input).datepicker('setStartDate', date);
        } catch (error) {
          // The field may not have a datepicker instance in some pages.
        }
      };

      const clearDatepickerField = function (input) {
        if (!input) return;

        input.value = '';
        if ($.fn.datepicker) {
          try {
            $(input).datepicker('clearDates');
          } catch (error) {
            input.value = '';
          }
        }
      };

      const normalizeTypedValue = function (input) {
        const parsed = parseDisplayDate(input.value);
        if (parsed) {
          input.value = formatDisplayDate(parsed);
        }
        return parsed;
      };

      const todayValue = formatIsoDate(today);

      document.documentElement.setAttribute('lang', 'pt-PT');

      dateInputs.forEach(function (input) {
        input.setAttribute('lang', 'pt-PT');
        input.setAttribute('inputmode', 'none');
        input.setAttribute('placeholder', 'DD/MM/AAAA');
        input.setAttribute('pattern', '\\d{2}/\\d{2}/\\d{4}');
        input.setAttribute('autocomplete', 'off');
        input.readOnly = true;
        input.min = todayValue;

        setDatepickerStart(input, today);
        if (input.value && $.fn.datepicker) {
          $(input).datepicker('update', input.value);
        }

        input.addEventListener('click', function () {
          if (input === checkout) {
            syncCheckoutMin();
          }

          if ($.fn.datepicker) {
            $(input).datepicker('show');
          }
        });
      });

      const clearInvalidCheckout = function () {
        if (!checkout) return;

        const checkoutDate = parseDisplayDate(checkout.value);
        const checkinDate = parseDisplayDate(checkin ? checkin.value : '');
        const minimumCheckout = checkinDate ? addDays(checkinDate, 1) : today;

        if (checkout.value && (!checkoutDate || compareDates(checkoutDate, minimumCheckout) < 0)) {
          clearDatepickerField(checkout);
        }
      };

      const syncCheckoutMin = function () {
        if (checkin) checkin.setCustomValidity('');
        if (checkout) checkout.setCustomValidity('');

        if (!checkin || !checkout) return;

        const checkinDate = normalizeTypedValue(checkin);

        if (checkin.value && (!checkinDate || compareDates(checkinDate, today) < 0)) {
          clearDatepickerField(checkin);
          setDatepickerStart(checkout, today);
          clearInvalidCheckout();
          return;
        }

        const nextDay = checkinDate ? addDays(checkinDate, 1) : today;
        checkout.min = formatIsoDate(nextDay);
        setDatepickerStart(checkout, nextDay);

        clearInvalidCheckout();
      };

      syncCheckoutMin();

      if (checkin) {
        checkin.addEventListener('change', syncCheckoutMin);
        if ($.fn.datepicker) {
          $(checkin).off('changeDate.reservation').on('changeDate.reservation', function () {
            syncCheckoutMin();
          });
        }
      }

      if (checkout) {
        checkout.addEventListener('change', function () {
          checkout.setCustomValidity('');
          normalizeTypedValue(checkout);
          clearInvalidCheckout();
        });
        if ($.fn.datepicker) {
          $(checkout).off('show.reservation changeDate.reservation').on('show.reservation', function () {
            syncCheckoutMin();
          }).on('changeDate.reservation', function () {
            checkout.setCustomValidity('');
            normalizeTypedValue(checkout);
            clearInvalidCheckout();
          });
        }
      }

      if (!form) return;

      form.addEventListener('submit', function (event) {
        const checkinDate = parseDisplayDate(checkin ? checkin.value : '');
        const checkoutDate = parseDisplayDate(checkout ? checkout.value : '');

        if (checkin && !checkinDate) {
          event.preventDefault();
          checkin.setCustomValidity('Escolha uma data de entrada no formato DD/MM/AAAA.');
          checkin.reportValidity();
          return;
        }

        if (checkout && !checkoutDate) {
          event.preventDefault();
          checkout.setCustomValidity('Escolha uma data de sa\u00edda no formato DD/MM/AAAA.');
          checkout.reportValidity();
          return;
        }

        if (checkinDate && compareDates(checkinDate, today) < 0) {
          event.preventDefault();
          checkin.setCustomValidity('A data de entrada n\u00e3o pode ser anterior a hoje.');
          checkin.reportValidity();
          return;
        }

        if (checkoutDate && compareDates(checkoutDate, today) < 0) {
          event.preventDefault();
          checkout.setCustomValidity('A data de sa\u00edda n\u00e3o pode ser anterior a hoje.');
          checkout.reportValidity();
          return;
        }

        if (checkinDate && checkoutDate) {
          const minimumCheckout = addDays(checkinDate, 1);

          if (compareDates(checkoutDate, minimumCheckout) < 0) {
            event.preventDefault();
            checkout.setCustomValidity('A data de sa\u00edda tem de ser pelo menos um dia depois da entrada.');
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
          // const childrenText = children === '1' ? '1 crianÃ§a' : `${children} crianÃ§as`;
          // const message = `OlÃ¡! Gostaria de fazer uma reserva de ${checkin} a ${checkout} para ${adultsText} e ${childrenText}.`;
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
