/* =============================================================
   Pt. Yugal Acharya  —  shared site script
   ONE file for every page. No jQuery, no CDN, no build step.
   Does: active menu link, mobile menu, sticky header shadow,
   scroll animations (reads data-aos), number counters,
   sticky call bar, back-to-top, photo lightbox, form helpers.
   ============================================================= */
(function () {
  'use strict';

  var PHONE = '+919928139485';
  var WA = 'https://wa.me/919928139485?text=' +
    encodeURIComponent('Namaste Acharya ji, I want to book a consultation.');

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. current year in the footer ------------------ */
  function stampYear() {
    $$('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- 2. highlight the page we are on ---------------- */
  /* <body data-page="about">  +  <a data-nav="about">          */
  function markActive() {
    var page = document.body.getAttribute('data-page');
    if (!page) return;
    $$('a[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === page) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  /* ---------- 3. mobile menu --------------------------------- */
  function mobileMenu() {
    var btn = $('.nav-toggle');
    var nav = $('#mainNav');
    if (!btn || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains('is-open'));
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100) setOpen(false);
    });
  }

  /* ---------- 4. shadow under header after scrolling --------- */
  function stickyHeader() {
    var head = $('.site-header');
    if (!head) return;
    var on = false;
    function check() {
      var should = window.pageYOffset > 12;
      if (should !== on) { on = should; head.classList.toggle('is-stuck', should); }
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
  }

  /* ---------- 5. scroll animations (uses data-aos) ----------- */
  function reveal() {
    var items = $$('[data-aos]');
    if (!items.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var wait = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
        setTimeout(function () { el.classList.add('is-in'); }, Math.min(wait, 700));
        io.unobserve(el);            /* animate once, never again */
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. counting numbers (25+, 10K+ ...) ------------ */
  function counters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target + suffix; return; }
      var start = null, dur = 1400;
      function step(now) {
        if (!start) start = now;
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 7. sticky Call / WhatsApp bar (mobile) --------- */
  function callBar() {
    if ($('.callbar')) return;
    var bar = document.createElement('div');
    bar.className = 'callbar';
    bar.innerHTML =
      '<a class="cb-call" href="tel:' + PHONE + '">' +
      '<i class="fas fa-phone-alt" aria-hidden="true"></i> Call Now</a>' +
      '<a class="cb-wa" href="' + WA + '" target="_blank" rel="noopener">' +
      '<i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp</a>';
    document.body.appendChild(bar);
  }

  /* ---------- 8. back to top button -------------------------- */
  function toTop() {
    var btn = document.createElement('button');
    btn.className = 'to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(btn);
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-on', window.pageYOffset > 600);
    }, { passive: true });
  }

  /* ---------- 9. photo lightbox (honors gallery) ------------- */
  function lightbox() {
    var shots = $$('.shot');
    if (!shots.length) return;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Close">&times;</button>' +
      '<div><img alt=""><div class="lightbox-cap"></div></div>';
    document.body.appendChild(box);
    var img = $('img', box), cap = $('.lightbox-cap', box);

    function open(src, text) {
      img.src = src; img.alt = text || '';
      cap.textContent = text || '';
      box.classList.add('is-open');
      $('.lightbox-close', box).focus();
    }
    function close() { box.classList.remove('is-open'); img.removeAttribute('src'); }

    shots.forEach(function (fig) {
      var i = $('img', fig);
      if (!i) return;
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('role', 'button');
      function fire() {
        var c = $('figcaption', fig);
        open(i.getAttribute('data-full') || i.src, c ? c.textContent.trim() : i.alt);
      }
      fig.addEventListener('click', fire);
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
      });
    });
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lightbox-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------- 10. small helpers for the contact forms --------- */
  /* The forms post to Google Sheets with mode:"no-cors", so the
     browser can NEVER know if it really saved. That is why we
     always show a WhatsApp backup link after sending.           */
  window.SiteUI = {
    phone: PHONE,
    waBase: 'https://wa.me/919928139485?text=',
    waLink: function (text) {
      return this.waBase + encodeURIComponent(text || 'Namaste Acharya ji');
    },
    isBot: function (form) {
      var hp = form.querySelector('input.hp');
      return !!(hp && hp.value);
    },
    lock: function (form, on) {
      form.setAttribute('data-busy', on ? '1' : '0');
    },
    msg: function (box, html) {
      if (!box) return;
      box.innerHTML = html;
      box.classList.add('is-on');
      box.setAttribute('role', 'status');
      box.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  /* ---------- start everything ------------------------------- */
  function init() {
    stampYear();
    markActive();
    mobileMenu();
    stickyHeader();
    reveal();
    counters();
    callBar();
    toTop();
    lightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
