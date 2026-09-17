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

     ĐIỀN ENDPOINT VÀO ĐÂY. Trang là static (GitHub Pages) nên không có backend;
     Formspree nhận POST JSON và chuyển tiếp về hộp thư. Lấy ID ở
     https://formspree.io/forms → dán nguyên URL dạng
     'https://formspree.io/f/xxxxxxxx' vào hằng dưới đây.

     Để rỗng thì form vẫn validate đầy đủ nhưng KHÔNG nói dối là đã gửi: nó hiện
     lời xin lỗi kèm địa chỉ thư trực tiếp. Một form nói "đã gửi" mà không gửi là
     cách đánh mất khách hàng êm ru nhất có thể.                                */
  var CONTACT_ENDPOINT = '';
  var CONTACT_FALLBACK_MAIL = 'info@vnext.co.jp';

  var form = document.getElementById('contact-form');
  var thanks = document.getElementById('contact-thanks');
  var failed = document.getElementById('form-failed');
  var submitBtn = document.getElementById('form-submit');
  var submitLabel = document.getElementById('form-submit-label');
  var trap = document.getElementById('f-website');
  var consent = document.getElementById('f-consent');
  var consentErr = document.getElementById('f-consent-err');

  /* Luật hợp lệ. `err` là KHOÁ từ điển chứ không phải câu đã dịch: câu lỗi đang
     hiện phải đổi theo khi người dùng đổi ngôn ngữ, và applyLang() làm việc đó
     qua data-i18n mà showError() gắn vào chính thẻ lỗi. */
  var RULES = [
    { id: 'company',    required: true,  max: 200,  err: 'form.err.company' },
    { id: 'department', required: false, max: 200 },
    { id: 'name',       required: true,  max: 200,  err: 'form.err.name' },
    { id: 'jobtitle',   required: false, max: 200 },
    // Hai cau khac nhau: o TRONG va o SAI DINH DANG khong phai mot loi.
    { id: 'email',      required: true,  max: 200,  err: 'form.err.emailRequired', errFormat: 'form.err.email', email: true },
    { id: 'phone',      required: false, max: 60 },
    { id: 'message',    required: true,  max: 2000, err: 'form.err.message' }
  ];

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(input, errEl, key) {
    var text = t(key);
    if (errEl) {
      errEl.setAttribute('data-i18n', key);
      errEl.textContent = text || '';
      // Thieu khoa tu dien thi GIAU o loi. Mot o do rong ben canh o nhap noi
      // rang co gi do sai ma khong noi la gi — te hon la khong hien gi ca;
      // vien do cua chinh o nhap van con, nen nguoi dung van thay dung cho.
      errEl.hidden = !text;
    }
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      // Nối CẢ nhãn 必須/任意 LẪN câu lỗi vào ô: một dòng chữ đỏ đặt cạnh ô là
      // thứ người dùng màn hình đọc không bao giờ nghe thấy nếu không nối.
      if (errEl) input.setAttribute('aria-describedby', input.id + '-badge ' + errEl.id);
    }
  }

  function clearError(input, errEl) {
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
      errEl.removeAttribute('data-i18n');
    }
    if (input) {
      input.removeAttribute('aria-invalid');
      input.setAttribute('aria-describedby', input.id + '-badge');
    }
  }

  function setPhase(phase) {
    if (!submitBtn || !submitLabel) return;
    var sending = phase === 'sending';
    submitBtn.disabled = sending;
    submitLabel.setAttribute('data-i18n', sending ? 'form.sending' : 'form.submit');
    submitLabel.textContent = t(sending ? 'form.sending' : 'form.submit') || '';
  }

  function showFailed(key) {
    if (!failed) return;
    failed.setAttribute('data-i18n', key);
    failed.textContent = (t(key) || '').replace('{mail}', CONTACT_FALLBACK_MAIL);
    failed.hidden = false;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitBtn && submitBtn.disabled) return;
      if (failed) failed.hidden = true;

      var first = null;

      for (var i = 0; i < RULES.length; i++) {
        var rule = RULES[i];
        var input = document.getElementById('f-' + rule.id);
        var errEl = document.getElementById('f-' + rule.id + '-err');
        if (!input) continue;

        var value = (input.value || '').trim();
        var key = null;

        if (rule.required && !value) key = rule.err;
        else if (value && rule.email && !EMAIL_RE.test(value)) key = rule.errFormat;
        else if (value.length > rule.max) key = 'form.err.tooLong';

        if (key) {
          showError(input, errEl, key);
          if (!first) first = input;
        } else {
          clearError(input, errEl);
        }
      }

      if (consent && !consent.checked) {
        showError(consent, consentErr, 'form.err.consent');
        if (!first) first = consent;
      } else {
        clearError(consent, consentErr);
      }

      // Không gọi mạng khi form còn lỗi: một 422 từ máy chủ nói cùng một điều mà
      // chậm hơn một vòng mạng.
      if (first) { first.focus(); return; }

      // Ô bẫy có chữ nghĩa là bot. Hiện khối cảm ơn mà KHÔNG gửi — nói ra rằng
      // đã phát hiện là dạy bot cách vượt qua lần sau.
      if (trap && trap.value) { succeed(); return; }

      var payload = {
        company: document.getElementById('f-company').value.trim(),
        department: document.getElementById('f-department').value.trim(),
        name: document.getElementById('f-name').value.trim(),
        jobtitle: document.getElementById('f-jobtitle').value.trim(),
        email: document.getElementById('f-email').value.trim(),
        phone: document.getElementById('f-phone').value.trim(),
        product: document.getElementById('f-product').value,
        message: document.getElementById('f-message').value.trim(),
        // Thứ tiếng khách ĐANG ĐỌC. Một người đọc bản tiếng Nhật mà nhận thư trả
        // lời tiếng Anh sẽ hiểu ngay rằng bản tiếng Nhật chỉ là lớp sơn.
        lang: lang
      };

      if (!CONTACT_ENDPOINT) { showFailed('form.err.noEndpoint'); return; }

      setPhase('sending');
      fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        succeed();
      }).catch(function () {
        // KHÔNG dọn form. Người vừa gõ xong sáu dòng mô tả hệ của họ mà nhận lại
        // một form trắng sẽ không gõ lại lần thứ hai.
        setPhase('editing');
        showFailed('form.err.send');
      });
    });
  }

  function succeed() {
    setPhase('editing');
    if (form) form.hidden = true;
    if (thanks) {
      thanks.hidden = false;
      // Chuyển tiêu điểm sang khối cảm ơn: người đi bằng bàn phím vừa bấm một
      // nút vừa biến mất, và nếu không dời tiêu điểm thì nó rơi về <body>.
      thanks.setAttribute('tabindex', '-1');
      thanks.focus();
    }
  }

})();
