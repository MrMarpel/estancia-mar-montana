/* ============================================================
   ESTANCIA MAR Y MONTAÑA · main.js
   Scroll effects · Mobile nav · Form · Year
============================================================ */

(function () {
  'use strict';

  /* ── Year in footer ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Header scroll behaviour ── */
  const header = document.getElementById('site-header');

  // FIX REFLOW: Read scrollY once outside the handler to avoid
  // forced reflow on init. Use requestAnimationFrame to batch
  // style writes and never mix read+write in the same frame.
  let lastScrolled = null;
  function onScroll() {
    requestAnimationFrame(() => {
      const scrolled = window.scrollY > 60;
      if (scrolled === lastScrolled) return; // skip if state unchanged
      lastScrolled = scrolled;
      if (scrolled) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  // Init: read scrollY once, write class once — no reflow loop
  lastScrolled = window.scrollY > 60;
  if (lastScrolled) header.classList.add('scrolled');

  /* ── Mobile menu toggle ── */
  const menuBtn   = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-menu');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuBtn.classList.toggle('active', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });

    // Close on nav link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Smooth active nav link on scroll ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.main-nav a, .mobile-nav a');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // FIX REFLOW: batch all classList changes in one rAF
          requestAnimationFrame(() => {
            navLinks.forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + entry.target.id) {
                link.classList.add('active');
              }
            });
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach(s => observer.observe(s));

  /* ── Reveal on scroll ── */
  const revealEls = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // FIX REFLOW: write class inside rAF to avoid layout thrashing
          requestAnimationFrame(() => {
            entry.target.classList.add('visible');
          });
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Gallery lightbox (simple) ── */
  const galleryItems = document.querySelectorAll('.gallery-item img');
  if (galleryItems.length) {
    // Build overlay
    const overlay = document.createElement('div');
    overlay.id = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Galería de imágenes');
    overlay.style.cssText = `
      display:none; position:fixed; inset:0; z-index:1000;
      background:rgba(15,25,40,.95); align-items:center; justify-content:center;
      cursor:zoom-out;
    `;
    const lbImg = document.createElement('img');
    lbImg.style.cssText = 'max-width:90vw; max-height:88vh; object-fit:contain; border-radius:8px; box-shadow:0 20px 60px rgba(0,0,0,.5);';
    const lbClose = document.createElement('button');
    lbClose.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    lbClose.setAttribute('aria-label', 'Cerrar');
    lbClose.style.cssText = `
      position:absolute; top:1.5rem; right:1.5rem;
      background:rgba(255,255,255,.12); border:none; border-radius:50%;
      width:44px; height:44px; color:white; font-size:1.1rem;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      transition:.25s;
    `;
    lbClose.onmouseenter = () => lbClose.style.background = 'rgba(255,255,255,.22)';
    lbClose.onmouseleave = () => lbClose.style.background = 'rgba(255,255,255,.12)';
    overlay.appendChild(lbImg);
    overlay.appendChild(lbClose);
    document.body.appendChild(overlay);

    function openLightbox(src, alt) {
      lbImg.src = src.replace(/w=\d+/, 'w=1400');
      lbImg.alt = alt || '';
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
    galleryItems.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
    lbClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ── Date input booking bar: min today ── */
  const today = new Date().toISOString().split('T')[0];
  const bookIn  = document.getElementById('booking-llegada');
  const bookOut = document.getElementById('booking-salida');
  if (bookIn) {
    bookIn.value = today;
    bookIn.min   = today;
    bookIn.addEventListener('change', () => {
      if (bookOut) {
        bookOut.min = bookIn.value;
        if (bookOut.value && bookOut.value < bookIn.value) bookOut.value = bookIn.value;
      }
    });
  }
  if (bookOut) {
    bookOut.value = today;
    bookOut.min   = today;
  }

  /* ── Cookie banner ── */
  const COOKIE_KEY = 'cookie_consent';

  function getCookieConsent() {
    try { return localStorage.getItem(COOKIE_KEY); } catch(e) { return null; }
  }
  function setCookieConsent(value) {
    try { localStorage.setItem(COOKIE_KEY, value); } catch(e) {}
  }

  const banner         = document.getElementById('cookie-banner');
  const btnAccept      = document.getElementById('cookie-accept');
  const btnReject      = document.getElementById('cookie-reject');
  const policyLink     = document.getElementById('cookie-policy-link');
  const modal          = document.getElementById('cookie-policy-modal');
  const modalClose     = document.getElementById('cookie-modal-close');
  const modalAccept    = document.getElementById('cookie-modal-accept');
  const btnReset       = document.getElementById('cookie-reset');

  function showBanner() {
    if (banner) { banner.hidden = false; }
  }
  function hideBanner() {
    if (banner) { banner.hidden = true; }
  }
  function openModal() {
    if (modal) { modal.hidden = false; document.body.style.overflow = 'hidden'; }
  }
  function closeModal() {
    if (modal) { modal.hidden = true; document.body.style.overflow = ''; }
  }

  // Show banner only if consent not yet given
  if (!getCookieConsent()) {
    // Small delay so it doesn't flash immediately
    setTimeout(showBanner, 800);
  }

  if (btnAccept) {
    btnAccept.addEventListener('click', () => {
      setCookieConsent('accepted');
      hideBanner();
    });
  }
  if (btnReject) {
    btnReject.addEventListener('click', () => {
      setCookieConsent('rejected');
      hideBanner();
    });
  }
  if (policyLink) {
    policyLink.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalAccept) {
    modalAccept.addEventListener('click', () => {
      setCookieConsent('accepted');
      hideBanner();
      closeModal();
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      try { localStorage.removeItem(COOKIE_KEY); } catch(e) {}
      closeModal();
      setTimeout(showBanner, 300);
    });
  }
  // Close modal on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  /* ── Booking bar → Airbnb con fechas ── */
  const bookingCta = document.getElementById('booking-cta');
  if (bookingCta && bookIn && bookOut) {
    bookingCta.addEventListener('click', function (e) {
      e.preventDefault();

      const checkIn  = bookIn.value;
      const checkOut = bookOut.value;
      const adults   = document.getElementById('booking-viajeros').value;

      const url = new URL('https://www.airbnb.es/rooms/1462335158547780452');
      if (checkIn)  url.searchParams.set('check_in',  checkIn);
      if (checkOut) url.searchParams.set('check_out', checkOut);
      url.searchParams.set('adults', adults);

      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    });
  }

  /* ── Language switcher ── */
  (function () {
    var ANCHOR_MAP = {
      es: { inicio:'inicio', apartamento:'apartamento', galeria:'galeria', ubicacion:'ubicacion', precios:'precios', resenas:'resenas', faq:'faq', contacto:'contacto', normas:'normas' },
      en: { inicio:'inicio', apartamento:'apartamento', galeria:'galeria', ubicacion:'ubicacion', precios:'precios', resenas:'resenas', faq:'faq', contacto:'contacto', normas:'normas' },
      fr: { inicio:'inicio', apartamento:'apartamento', galeria:'galeria', ubicacion:'ubicacion', precios:'precios', resenas:'resenas', faq:'faq', contacto:'contacto', normas:'normas' }
    };

    function getCurrentLang() {
      var parts = window.location.pathname.split('/').filter(Boolean);
      return parts[0] || 'es';
    }

    function translateHash(hash, fromLang, toLang) {
      if (!hash) return '';
      var anchor = hash.replace('#', '');
      var fromMap = ANCHOR_MAP[fromLang];
      if (!fromMap) return hash;
      var key = Object.keys(fromMap).find(function (k) { return fromMap[k] === anchor; });
      if (!key) return hash;
      var toMap = ANCHOR_MAP[toLang];
      return toMap && toMap[key] ? '#' + toMap[key] : hash;
    }

    function buildUrl(targetLang) {
      var currentLang = getCurrentLang();
      var hash        = window.location.hash;
      var newHash     = translateHash(hash, currentLang, targetLang);
      var newPath     = window.location.pathname.replace(
        '/' + currentLang + '/',
        '/' + targetLang + '/'
      );
      return newPath + window.location.search + newHash;
    }

    function handleLangClick(e) {
      e.preventDefault();
      var targetLang  = this.getAttribute('data-lang');
      var currentLang = getCurrentLang();
      if (targetLang === currentLang) return;
      window.location.href = buildUrl(targetLang);
    }

    var switcher = document.getElementById('lang-switcher');
    if (switcher) {
      var btn      = switcher.querySelector('.lang-btn');
      var dropdown = switcher.querySelector('.lang-dropdown');

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = switcher.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });

      document.addEventListener('click', function () {
        switcher.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          switcher.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });

      dropdown.querySelectorAll('.lang-option').forEach(function (link) {
        link.addEventListener('click', handleLangClick.bind(link));
      });
    }

    document.querySelectorAll('.mobile-lang [data-lang]').forEach(function (link) {
      link.addEventListener('click', handleLangClick.bind(link));
    });
  })();

})();
