/* v-ai.jp — interactions
   Chuyển động theo ngân sách vnext-ui/effects.md:
   150–350ms, easing spring, stagger 60ms ≤ 6 phần tử/cụm,
   không animation lặp trên nội dung, tôn trọng prefers-reduced-motion. */

(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- i18n: 日本語 / English / Tiếng Việt ---------- */
  var DICT = window.I18N || {};
  var LANGS = ['ja', 'en', 'vi'];
  var langBox = document.getElementById('lang-switch');
  var langBtn = document.getElementById('lang-btn');
  var langMenu = document.getElementById('lang-menu');
  var langCode = document.getElementById('lang-code');
  var lang = 'ja';

  function closeLangMenu() {
    if (!langMenu || !langBtn) return;
    langMenu.hidden = true;
    langBtn.setAttribute('aria-expanded', 'false');
  }

  function t(key) {
    var pack = DICT[lang] || {};
    return Object.prototype.hasOwnProperty.call(pack, key) ? pack[key] : null;
  }

  function applyLang(next) {
    if (LANGS.indexOf(next) === -1 || !DICT[next]) return;
    lang = next;
    document.documentElement.lang = next;

    function each(attr, fn) {
      var nodes = document.querySelectorAll('[' + attr + ']');
      Array.prototype.forEach.call(nodes, function (el) {
        var v = t(el.getAttribute(attr));
        if (v !== null) fn(el, v);
      });
    }

    each('data-i18n', function (el, v) { el.textContent = v; });
    each('data-i18n-html', function (el, v) { el.innerHTML = v; });
    each('data-i18n-ph', function (el, v) { el.setAttribute('placeholder', v); });
    each('data-i18n-alt', function (el, v) { el.setAttribute('alt', v); });
    each('data-i18n-aria', function (el, v) { el.setAttribute('aria-label', v); });
    each('data-i18n-content', function (el, v) { el.setAttribute('content', v); });

    if (langMenu) {
      Array.prototype.forEach.call(langMenu.querySelectorAll('button[data-lang]'), function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-lang') === next ? 'true' : 'false');
      });
    }
    if (langCode) langCode.textContent = next.toUpperCase();

    // nhãn nút menu phụ thuộc trạng thái đóng/mở nên đặt lại ở đây
    var tg = document.getElementById('nav-toggle');
    if (tg) {
      var open = document.body.classList.contains('nav-open');
      tg.setAttribute('aria-label', t(open ? 'nav.aria.close' : 'nav.aria.open') || '');
    }

    try { localStorage.setItem('v-ai-lang', next); } catch (e) { /* chế độ riêng tư */ }

    equalizeCards();
  }

  /* ---------- Cân chiều cao 3 card ----------
     Độ dài chữ đổi theo ngôn ngữ, nên đo thật rồi gán thay vì đoán số dòng.
     Chỉ chạy khi 3 card nằm ngang; xếp dọc thì trả về tự nhiên. */
  var CARD_ROWS = ['.card__lead', '.card__en', '.card__desc'];

  function equalizeCards() {
    var cards = document.querySelectorAll('.products .card');
    if (!cards.length) return;

    CARD_ROWS.forEach(function (sel) {
      var nodes = [];
      Array.prototype.forEach.call(cards, function (c) {
        var el = c.querySelector(sel);
        if (el) { el.style.minHeight = ''; nodes.push(el); }
      });
      if (window.innerWidth < 981 || !nodes.length) return;

      var tallest = 0;
      nodes.forEach(function (el) { tallest = Math.max(tallest, el.getBoundingClientRect().height); });
      nodes.forEach(function (el) { el.style.minHeight = Math.ceil(tallest) + 'px'; });
    });
  }

  equalizeCards();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(equalizeCards);

  var eqTimer;
  window.addEventListener('resize', function () {
    clearTimeout(eqTimer);
    eqTimer = setTimeout(equalizeCards, 120);
  });

  (function initLang() {
    var saved = null;
    try { saved = localStorage.getItem('v-ai-lang'); } catch (e) { /* bỏ qua */ }

    if (!saved) {
      var nav = (navigator.language || 'ja').toLowerCase();
      saved = nav.indexOf('vi') === 0 ? 'vi' : nav.indexOf('en') === 0 ? 'en' : 'ja';
    }
    // luôn chạy một lượt, kể cả tiếng Nhật: các thuộc tính như alt lấy từ từ điển
    applyLang(saved);

    if (langBtn && langMenu) {
      langBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = langMenu.hidden;
        langMenu.hidden = !open;
        langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      langMenu.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-lang]');
        if (!btn) return;
        applyLang(btn.getAttribute('data-lang'));
        closeLangMenu();
        langBtn.focus();
      });

      document.addEventListener('click', function (e) {
        if (!langMenu.hidden && !langBox.contains(e.target)) closeLangMenu();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLangMenu();
      });
    }
  })();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  function closeNav() {
    document.body.classList.remove('nav-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', t('nav.aria.open') || '');
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', t(open ? 'nav.aria.close' : 'nav.aria.open') || '');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- Bộ chọn ngôn ngữ: header rộng ↔ trong menu khi hẹp ---------- */
  if (langBox && nav) {
    var actions = document.querySelector('.header__actions');
    var anchor = document.querySelector('.btn-contact');
    var narrow = window.matchMedia('(max-width: 980px)');

    var placeLang = function (mq) {
      if (mq.matches) {
        if (langBox.parentNode !== nav) nav.appendChild(langBox);
      } else if (langBox.parentNode !== actions) {
        actions.insertBefore(langBox, anchor);
      }
    };

    placeLang(narrow);
    if (narrow.addEventListener) narrow.addEventListener('change', placeLang);
    else narrow.addListener(placeLang);
  }

  /* ---------- Header nâng nhẹ + mục điều hướng đang xem ----------
     Gộp vào một vòng scroll duy nhất, chặn bằng rAF.               */
  var header = document.querySelector('.site-header');
  var links = nav ? nav.querySelectorAll('a[href^="#"]') : [];
  var spied = [];

  Array.prototype.forEach.call(links, function (a) {
    var el = document.querySelector(a.getAttribute('href'));
    if (el) spied.push({ link: a, el: el });
  });

  function syncOnScroll() {
    var y = window.scrollY;

    if (header) header.classList.toggle('is-scrolled', y > 8);

    // mục cuối cùng có đỉnh đã vượt qua mép dưới header
    var current = null;
    for (var i = 0; i < spied.length; i++) {
      if (spied[i].el.getBoundingClientRect().top <= 100) current = spied[i];
    }
    for (var j = 0; j < spied.length; j++) {
      spied[j].link.classList.toggle('is-active', spied[j] === current);
    }
  }

  if (header || spied.length) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        syncOnScroll();
        ticking = false;
      });
    }, { passive: true });
    syncOnScroll();
  }

  /* ---------- Vào màn: slide-up + stagger theo cụm ---------- */
  var targets = document.querySelectorAll('.reveal');

  // stagger đếm lại từ đầu ở mỗi cụm, tối đa 6 bậc
  var seen = new Map();
  Array.prototype.forEach.call(targets, function (el) {
    var group = el.parentNode;
    var i = seen.get(group) || 0;
    el.style.setProperty('--i', Math.min(i, 5));
    seen.set(group, i + 1);
  });

  function revealAll() {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  }

  if (reduced || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------- Contact form ----------
     送信先は未定。バックエンド（メール送信API / フォームサービス）が決まったら
     この handler を fetch('/api/contact', …) に差し替えてください。            */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var required = form.querySelectorAll('[required]');
      for (var i = 0; i < required.length; i++) {
        if (!required[i].value.trim() || (required[i].type === 'email' && !required[i].checkValidity())) {
          status.textContent = t('form.err') || '';
          status.style.color = '#c2410c';
          required[i].focus();
          return;
        }
      }

      status.style.color = '';
      status.textContent = t('form.todo') || '';
    });
  }
})();
