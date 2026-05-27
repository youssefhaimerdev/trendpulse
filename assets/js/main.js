/* ============================================================
   TrendPulse v3 — main.js  (working search + all features)
   ============================================================ */

// ── Date ─────────────────────────────────────────────────
function initDate() {
  const el = document.getElementById('live-date');
  if (el) el.textContent = new Date().toLocaleDateString('en-US',
    { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// ── Ticker duplicate for seamless loop ───────────────────
function initTicker() {
  const t = document.querySelector('.ticker-track');
  if (t) t.innerHTML += t.innerHTML;
}

// ── Sticky nav shadow ─────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () =>
    nav.classList.toggle('scrolled', window.scrollY > 10), { passive:true });
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
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }));
}

// ── WORKING SEARCH ────────────────────────────────────────
function initSearch() {
  const openBtns = document.querySelectorAll('[data-search-open]');
  const overlay  = document.getElementById('search-overlay');
  const input    = document.getElementById('search-input');
  const closeBtn = document.getElementById('search-close');
  if (!overlay) return;

  let articles = null;
  let resultsEl = null;
  let debounceTimer = null;

  // Load articles once
  async function getArticles() {
    if (articles) return articles;
    try {
      const r = await fetch('/data/articles.json');
      articles = await r.json();
    } catch(e) { articles = []; }
    return articles;
  }

  // Render search results
  function renderResults(query) {
    if (!resultsEl) {
      resultsEl = document.createElement('div');
      resultsEl.id = 'search-results';
      overlay.querySelector('.search-box').appendChild(resultsEl);
    }
    if (!query || query.trim().length < 2) { resultsEl.innerHTML = ''; return; }
    const q = query.toLowerCase().trim();
    const hits = (articles || []).filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.excerpt||'').toLowerCase().includes(q) ||
      (a.category||'').toLowerCase().includes(q)
    );
    if (!hits.length) {
      resultsEl.innerHTML = `<p class="sr-empty">No results for "<strong>${query}</strong>" — try different keywords.</p>`;
      return;
    }
    resultsEl.innerHTML = hits.slice(0,7).map(a => `
      <a href="/articles/${a.slug}" class="sr-item">
        <div class="sr-top">
          <span class="badge ${a.categoryClass||'b-sports'}">${a.category}</span>
          <span class="sr-vol">${a.trending||''}</span>
        </div>
        <div class="sr-title">${a.title}</div>
        <div class="sr-meta">${a.readTime||''} read · ${a.views||''} views</div>
      </a>
    `).join('');
  }

  function openSearch() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input && input.focus(), 80);
    getArticles(); // prefetch
  }
  function closeSearch() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtns.forEach(b => b.addEventListener('click', openSearch));
  closeBtn && closeBtn.addEventListener('click', closeSearch);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  });

  if (input) {
    input.addEventListener('input', async () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        await getArticles();
        renderResults(input.value);
      }, 200);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const first = overlay.querySelector('.sr-item');
        if (first) first.click();
      }
    });
  }
}

// ── Scroll animations ─────────────────────────────────────
function initScrollAnim() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
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
    bar.style.transform = `scaleX(${Math.min(d.scrollTop/(d.scrollHeight-d.clientHeight)||0,1)})`;
  }, { passive:true });
}

// ── Back to top ───────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('btt');
  if (!btn) return;
  window.addEventListener('scroll', () =>
    btn.classList.toggle('show', window.scrollY > 600), { passive:true });
  btn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

// ── Social share ──────────────────────────────────────────
function initShareButtons() {
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = encodeURIComponent(location.href);
      const title = encodeURIComponent(document.title);
      const a = btn.dataset.share;
      if (a === 'twitter')
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
      else if (a === 'facebook')
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
      else if (a === 'copy') {
        navigator.clipboard.writeText(location.href).then(() => {
          const orig = btn.textContent;
          btn.textContent = '✓ Copied!';
          btn.classList.add('ok');
          setTimeout(() => { btn.textContent = orig; btn.classList.remove('ok'); }, 2000);
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
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}
function initTimeAgo() {
  document.querySelectorAll('[data-time]').forEach(el => {
    el.textContent = timeAgo(el.dataset.time);
  });
}

// ── Newsletter ────────────────────────────────────────────
function initNewsletter() {
  const form = document.getElementById('nl-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const inp = form.querySelector('input');
    const btn = form.querySelector('button');
    if (!inp.value.includes('@')) { inp.style.borderColor='var(--red)'; return; }
    btn.textContent = '✓ You\'re in!';
    inp.disabled = btn.disabled = true;
  });
}

// ── Counter animation ─────────────────────────────────────
function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.target.dataset.counted) return;
      e.target.dataset.counted = '1';
      const raw = e.target.dataset.count || '';
      const num = parseFloat(raw);
      const sfx = raw.replace(/[\d.]/g,'');
      if (!num) return;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now-start)/1100, 1);
        const v = 1-Math.pow(1-p,3);
        e.target.textContent = (num<2 ? v.toFixed(1) : Math.round(v*num)) + sfx;
        if (p<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(e.target);
    });
  }, { threshold:0.5 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
}

// ── Lazy image loader ─────────────────────────────────────
function initImages() {
  // Set directly — no async wait, browser handles load/error natively
  document.querySelectorAll('[data-bg]').forEach(el => {
    const img = new Image();
    img.onload = () => el.style.backgroundImage = `url('${el.dataset.bg}')`;
    img.src = el.dataset.bg;
  });
}

// ── Category page: load + render articles ─────────────────
function initCategoryPage() {
  const grid = document.getElementById('cat-article-grid');
  if (!grid) return;
  const category = document.body.dataset.category;
  fetch('/data/articles.json')
    .then(r => r.json())
    .then(articles => {
      const filtered = category
        ? articles.filter(a => a.category.toLowerCase() === category.toLowerCase())
        : articles;
      if (!filtered.length) {
        grid.innerHTML = '<p style="color:var(--text2);padding:2rem 0;">No articles in this category yet. Check back soon.</p>';
        return;
      }
      grid.innerHTML = filtered.map(a => `
        <article class="feat-card fade-up">
          <div class="ci ci-169 ci-${(a.categoryClass||'b-sports').replace('b-','')}"
            data-bg="${a.image||''}"></div>
          <div class="feat-body">
            <span class="badge ${a.categoryClass||'b-sports'}">${a.category}</span>
            <h3><a href="/articles/${a.slug}">${a.title}</a></h3>
            <p style="font-size:.8rem;color:var(--text2);line-height:1.6;margin:.4rem 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${a.excerpt||''}</p>
            <div class="feat-meta">
              <span data-time="${a.dateISO}">${a.date}</span>&nbsp;·&nbsp;
              <span>${a.readTime}</span>&nbsp;·&nbsp;
              <span style="color:var(--teal)">${a.trending}</span>
            </div>
          </div>
        </article>
      `).join('');
      initScrollAnim();
      initTimeAgo();
      initImages();
    })
    .catch(() => {
      grid.innerHTML = '<p style="color:var(--text2);padding:2rem 0;">Could not load articles. Please refresh.</p>';
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
  initCategoryPage();
});
