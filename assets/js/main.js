/* ============================================================
   TrendPulse v2 — main.js
   ============================================================ */

// ── Date display ──────────────────────────────────────────
function initDate() {
  const el = document.getElementById('live-date');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-US',
    { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// ── Ticker: duplicate for seamless loop ───────────────────
function initTicker() {
  const t = document.querySelector('.ticker-track');
  if (t) t.innerHTML += t.innerHTML;
}

// ── Sticky nav shadow ─────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ── Mobile menu ───────────────────────────────────────────
function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mob-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    btn.setAttribute('aria-expanded', open);
  });

  // close on link click
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    })
  );
}

// ── Search overlay ────────────────────────────────────────
function initSearch() {
  const openBtns = document.querySelectorAll('[data-search-open]');
  const overlay  = document.getElementById('search-overlay');
  const input    = document.getElementById('search-input');
  const closeBtn = document.getElementById('search-close');
  if (!overlay) return;

  function openSearch() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input && input.focus(), 100);
  }
  function closeSearch() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtns.forEach(b => b.addEventListener('click', openSearch));
  closeBtn && closeBtn.addEventListener('click', closeSearch);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
}

// ── Scroll animations ─────────────────────────────────────
function initScrollAnim() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
}

// ── Reading progress bar ──────────────────────────────────
function initReadProgress() {
  const bar = document.getElementById('read-prog');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const d = document.documentElement;
    bar.style.transform = `scaleX(${Math.min(d.scrollTop / (d.scrollHeight - d.clientHeight), 1)})`;
  }, { passive: true });
}

// ── Back to top ───────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('btt');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Social share ──────────────────────────────────────────
function initShareButtons() {
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.share;
      const url    = encodeURIComponent(location.href);
      const title  = encodeURIComponent(document.title);

      if (action === 'twitter')
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
      else if (action === 'facebook')
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
      else if (action === 'copy') {
        navigator.clipboard.writeText(location.href).then(() => {
          btn.textContent = '✓ Copied!';
          btn.classList.add('ok');
          setTimeout(() => {
            btn.textContent = '🔗 Copy Link';
            btn.classList.remove('ok');
          }, 2000);
        });
      }
    });
  });
}

// ── Time-ago labels ───────────────────────────────────────
function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 2)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function initTimeAgo() {
  document.querySelectorAll('[data-time]').forEach(el => {
    el.textContent = timeAgo(el.dataset.time);
  });
}

// ── Newsletter submit ─────────────────────────────────────
function initNewsletter() {
  const form = document.getElementById('nl-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const btn   = form.querySelector('button');
    if (!input.value.includes('@')) {
      input.style.borderColor = 'var(--red)';
      return;
    }
    btn.textContent = '✓ You\'re in!';
    btn.style.background = 'var(--teal)';
    input.disabled = true;
    btn.disabled = true;
  });
}

// ── Trending card counter (count-up on scroll) ────────────
function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.target.dataset.counted) return;
      e.target.dataset.counted = '1';
      const raw    = e.target.dataset.count || '';
      const num    = parseFloat(raw);
      const suffix = raw.replace(/[\d.]/g, '');
      if (!num) return;
      const start = performance.now();
      const dur   = 1100;
      const tick  = now => {
        const p = Math.min((now - start) / dur, 1);
        const v = 1 - Math.pow(1 - p, 3);
        e.target.textContent = (num < 2 ? v.toFixed(1) : Math.round(v * num)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
}

// ── Image lazy load / error fallback ─────────────────────
function initImages() {
  document.querySelectorAll('[data-bg]').forEach(el => {
    const img = new Image();
    img.onload  = () => { el.style.backgroundImage = `url('${el.dataset.bg}')`; };
    img.onerror = () => { /* keep CSS gradient fallback */ };
    img.src = el.dataset.bg;
  });
}

// ── Init all ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDate();
  initTicker();
  initNavScroll();
  initMobileMenu();
  initSearch();
  initScrollAnim();
  initReadProgress();
  initBackToTop();
  initShareButtons();
  initTimeAgo();
  initNewsletter();
  initCounters();
  initImages();
});
