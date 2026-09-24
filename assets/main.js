document.addEventListener('DOMContentLoaded', () => {
  // style-hover dynamic hover effect support
  document.querySelectorAll('[style-hover]').forEach((el) => {
    const defaultStyle = el.getAttribute('style') || '';
    const hoverStyle = el.getAttribute('style-hover') || '';

    // Parse hover style declarations
    const hoverRules = hoverStyle.split(';').map(s => s.trim()).filter(Boolean);
    const hoverMap = {};
    hoverRules.forEach(rule => {
      const idx = rule.indexOf(':');
      if (idx > -1) {
        const prop = rule.slice(0, idx).trim();
        const val = rule.slice(idx + 1).trim();
        hoverMap[prop] = val;
      }
    });

    el.addEventListener('mouseenter', () => {
      Object.keys(hoverMap).forEach(prop => {
        el.style.setProperty(prop, hoverMap[prop]);
      });
    });

    el.addEventListener('mouseleave', () => {
      el.setAttribute('style', defaultStyle);
    });
  });

  // Animation and Counter Engine
  const runAnimations = (el) => {
    // Activate all data-anim elements
    el.querySelectorAll('[data-anim]').forEach((a) => {
      a.style.animationPlayState = 'running';
    });

    // Run all data-count counters
    el.querySelectorAll('[data-count]').forEach((c) => {
      if (c.dataset.counted === 'true') return;
      c.dataset.counted = 'true';

      const target = parseFloat(c.dataset.count);
      const dec = parseInt(c.dataset.dec || '0', 10);
      const pre = c.dataset.prefix || '';
      const duration = 1400;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        // Cubic ease out
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = target * ease;
        c.textContent = pre + current.toFixed(dec);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          c.textContent = pre + target.toFixed(dec);
        }
      };

      requestAnimationFrame(step);
    });
  };

  const targets = [...document.querySelectorAll('[data-play], #products, [data-hero]')];

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runAnimations(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach((t) => observer.observe(t));
  } else {
    targets.forEach(runAnimations);
  }
});

// .reveal: slide-in on scroll (without this, the contact form and company info stay hidden)
document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.reveal');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px' });

  els.forEach((el) => io.observe(el));
});

// SVG (SMIL) loops in the product shots: pause while off-screen, never run under reduced motion
document.addEventListener('DOMContentLoaded', () => {
  const svgs = [...document.querySelectorAll('svg')].filter((s) => s.querySelector('animate, animateMotion'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    svgs.forEach((s) => s.pauseAnimations());
    return;
  }
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? e.target.unpauseAnimations() : e.target.pauseAnimations()));
  });
  svgs.forEach((s) => io.observe(s));
});


/* Contact form: validation + submit (restored from the previous main.js).
   Static site on GitHub Pages, so there is no backend. Paste a Formspree URL
   ('https://formspree.io/f/xxxxxxxx') into CONTACT_ENDPOINT. While it is empty
   the form still validates, but never claims to have sent: it shows the
   fallback mail address instead. */
document.addEventListener('DOMContentLoaded', () => {
  const CONTACT_ENDPOINT = '';
  const CONTACT_FALLBACK_MAIL = 'info@vnext.co.jp';

  const lang = document.documentElement.lang || 'ja';
  const dict = (window.I18N && window.I18N[lang]) || {};
  const t = (key) => (Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : null);

  const $ = (id) => document.getElementById(id);
  const form = $('contact-form');
  if (!form) return;
  const thanks = $('contact-thanks');
  const failed = $('form-failed');
  const submitBtn = $('form-submit');
  const submitLabel = $('form-submit-label');
  const trap = $('f-website');
  const consent = $('f-consent');
  const consentErr = $('f-consent-err');

  const RULES = [
    { id: 'company', required: true, max: 200, err: 'form.err.company' },
    { id: 'department', required: false, max: 200 },
    { id: 'name', required: true, max: 200, err: 'form.err.name' },
    { id: 'jobtitle', required: false, max: 200 },
    { id: 'email', required: true, max: 200, err: 'form.err.emailRequired', errFormat: 'form.err.email', email: true },
    { id: 'phone', required: false, max: 60 },
    { id: 'message', required: true, max: 2000, err: 'form.err.message' }
  ];
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showError = (input, errEl, key) => {
    const text = t(key);
    if (errEl) {
      errEl.textContent = text || '';
      errEl.hidden = !text;
    }
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      if (errEl) input.setAttribute('aria-describedby', `${input.id}-badge ${errEl.id}`);
    }
  };

  const clearError = (input, errEl) => {
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    if (input) {
      input.removeAttribute('aria-invalid');
      input.setAttribute('aria-describedby', `${input.id}-badge`);
    }
  };

  const setPhase = (phase) => {
    if (!submitBtn || !submitLabel) return;
    const sending = phase === 'sending';
    submitBtn.disabled = sending;
    submitLabel.textContent = t(sending ? 'form.sending' : 'form.submit') || submitLabel.textContent;
  };

  const showFailed = (key) => {
    if (!failed) return;
    failed.textContent = (t(key) || '').replace('{mail}', CONTACT_FALLBACK_MAIL);
    failed.hidden = false;
  };

  const succeed = () => {
    setPhase('editing');
    form.hidden = true;
    if (thanks) {
      thanks.hidden = false;
      thanks.setAttribute('tabindex', '-1');
      thanks.focus();
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn && submitBtn.disabled) return;
    if (failed) failed.hidden = true;

    let first = null;
    RULES.forEach((rule) => {
      const input = $(`f-${rule.id}`);
      const errEl = $(`f-${rule.id}-err`);
      if (!input) return;
      const value = (input.value || '').trim();
      let key = null;
      if (rule.required && !value) key = rule.err;
      else if (value && rule.email && !EMAIL_RE.test(value)) key = rule.errFormat;
      else if (value.length > rule.max) key = 'form.err.tooLong';

      if (key) {
        showError(input, errEl, key);
        if (!first) first = input;
      } else {
        clearError(input, errEl);
      }
    });

    if (consent && !consent.checked) {
      showError(consent, consentErr, 'form.err.consent');
      if (!first) first = consent;
    } else {
      clearError(consent, consentErr);
    }

    if (first) { first.focus(); return; }

    // Honeypot filled: act as if sent, never tell the bot
    if (trap && trap.value) { succeed(); return; }

    const val = (id) => $(`f-${id}`).value.trim();
    const payload = {
      company: val('company'),
      department: val('department'),
      name: val('name'),
      jobtitle: val('jobtitle'),
      email: val('email'),
      phone: val('phone'),
      product: $('f-product').value,
      message: val('message'),
      lang
    };

    if (!CONTACT_ENDPOINT) { showFailed('form.err.noEndpoint'); return; }

    setPhase('sending');
    fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      succeed();
    }).catch(() => {
      // Keep what the user typed
      setPhase('editing');
      showFailed('form.err.send');
    });
  });
});

// Product cards: soft spotlight that follows the pointer (CSS vars only, no layout work)
document.querySelectorAll('.pcard').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});
