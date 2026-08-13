/**
 * Deo Gratias Catalog — Frontend Application
 * Deep-black luxury theme with animations and micro-interactions.
 */

(function () {
  'use strict';

  // ── DOM References ────────────────────────────────────────────────────
  const grid = document.getElementById('catalog-grid');
  const emptyState = document.getElementById('empty-state');
  const skeletonGrid = document.getElementById('skeleton-grid');
  const countEl = document.getElementById('catalog-count');
  const toolbar = document.getElementById('toolbar');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const filterRow = document.getElementById('filter-row');
  const btnClearFilters = document.getElementById('btn-clear-filters');
  const btnRefresh = document.getElementById('btn-refresh');
  const btnUpload = document.getElementById('btn-upload');
  const btnPDF = document.getElementById('btn-pdf');
  const btnTheme = document.getElementById('btn-theme');
  const btnViewGrid = document.getElementById('btn-view-grid');
  const btnViewList = document.getElementById('btn-view-list');
  const pdfOverlay = document.getElementById('pdf-overlay');
  const toast = document.getElementById('toast');
  const toastText = toast.querySelector('.toast-text');
  const toastClose = document.getElementById('toast-close');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxName = document.getElementById('lightbox-name');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxHints = document.getElementById('lightbox-hints');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const uploadOverlay = document.getElementById('upload-overlay');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const uploadPreview = document.getElementById('upload-preview');
  const btnUploadCancel = document.getElementById('btn-upload-cancel');
  const btnUploadConfirm = document.getElementById('btn-upload-confirm');
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');
  const customCursor = document.getElementById('custom-cursor');
  const catalogTitle = document.getElementById('catalog-title');
  const scrollIndicator = document.getElementById('scroll-indicator');
  const btnSelectMode = document.getElementById('btn-select-mode');
  const pdfSettingsOverlay = document.getElementById('pdf-settings-overlay');
  const btnPdfSettingsCancel = document.getElementById('btn-pdf-settings-cancel');
  const btnPdfSettingsGenerate = document.getElementById('btn-pdf-settings-generate');
  const pdfExportAllCount = document.getElementById('pdf-export-all-count');
  const pdfExportSelectedCount = document.getElementById('pdf-export-selected-count');
  const pdfExportFilteredCount = document.getElementById('pdf-export-filtered-count');
  const pdfColumns = document.getElementById('pdf-columns');
  const pdfPerPage = document.getElementById('pdf-per-page');
  const pdfFormat = document.getElementById('pdf-format');
  const pdfMarginTop = document.getElementById('pdf-margin-top');
  const pdfMarginRight = document.getElementById('pdf-margin-right');
  const pdfMarginBottom = document.getElementById('pdf-margin-bottom');
  const pdfMarginLeft = document.getElementById('pdf-margin-left');

  let images = [];
  let filteredImages = [];
  const activeFilters = { collection: '', category: '', material: '', gemstone: '' };
  let lightboxIndex = -1;
  let viewMode = 'grid';
  let selectionMode = false;
  const selectedFiles = new Set();
  let favoriteFiles = new Set();

  // ── Pagination ─────────────────────────────────────────────────────
  let currentPage = 1;
  let totalPages = 1;
  const PER_PAGE = 12;

  // ── Focus Trap ─────────────────────────────────────────────────────
  function trapFocus(modal) {
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    modal._focusTrapHandler = handler;
    modal.addEventListener('keydown', handler);
    first.focus();
  }

  function releaseFocus(modal) {
    if (modal._focusTrapHandler) {
      modal.removeEventListener('keydown', modal._focusTrapHandler);
      modal._focusTrapHandler = null;
    }
  }

  // ── Image Error Handler ────────────────────────────────────────────
  window.handleImageError = function (img) {
    img.style.display = 'none';
    const wrap = img.parentElement;
    if (wrap && !wrap.querySelector('.product-image-error')) {
      const errDiv = document.createElement('div');
      errDiv.className = 'product-image-error';
      errDiv.setAttribute('role', 'img');
      errDiv.setAttribute('aria-label', 'Imagen no disponible');
      errDiv.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Imagen no disponible</span>
      `;
      wrap.appendChild(errDiv);
    }
  };

  // ── Favorites ────────────────────────────────────────────────────────
  async function loadFavorites() {
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      favoriteFiles = new Set(data.favorites || []);
    } catch {
      /* ignore */
    }
  }

  async function toggleFavorite(filename) {
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      favoriteFiles = new Set(data.favorites || []);
      document.querySelectorAll(`[data-filename="${filename}"]`).forEach((card) => {
        card.classList.toggle('favorited', favoriteFiles.has(filename));
      });
    } catch {
      /* ignore */
    }
  }

  // ── Hero Letter Reveal (#10) ──────────────────────────────────────────
  function initHeroLetters() {
    const text = catalogTitle.textContent;
    catalogTitle.innerHTML = text
      .split('')
      .map(
        (ch, i) =>
          `<span class="letter" style="animation-delay:${0.4 + i * 0.04}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
      )
      .join('');
  }
  initHeroLetters();

  // ── Theme (#1, #22) ──────────────────────────────────────────────────
  function initTheme() {
    const saved = localStorage.getItem('deo-gratias-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('deo-gratias-theme', next);
      setTimeout(() => document.body.classList.remove('theme-transitioning'), 200);
    }, 150);
  }

  btnTheme.addEventListener('click', toggleTheme);
  initTheme();

  // ── Toast (#20) ──────────────────────────────────────────────────────
  let toastTimer;
  function showToast(msg, isError = false) {
    toastText.textContent = msg;
    toast.className = 'toast show' + (isError ? ' error' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.className = 'toast';
    }, 4000);
  }
  toastClose.addEventListener('click', () => {
    toast.className = 'toast';
    clearTimeout(toastTimer);
  });

  // ── Scroll Progress (#24) ────────────────────────────────────────────
  const heroEl = document.querySelector('.catalog-hero');

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';

    // Hero parallax
    if (heroEl && scrollTop < window.innerHeight) {
      heroEl.style.transform = `translateY(${scrollTop * 0.3}px)`;
      heroEl.style.opacity = Math.max(0, 1 - scrollTop / (window.innerHeight * 0.8));
    }
  }

  // ── Back to Top (#16) ────────────────────────────────────────────────
  const backToTopProgress = backToTop.querySelector('.back-to-top-progress');
  const CIRCUMFERENCE = 2 * Math.PI * 20; // r=20

  function updateBackToTop() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    if (backToTopProgress) {
      backToTopProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    }

    if (scrollTop > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Scroll Indicator Hide ────────────────────────────────────────────
  function updateScrollIndicator() {
    if (window.scrollY > 100) {
      scrollIndicator.style.opacity = '0';
    } else {
      scrollIndicator.style.opacity = '';
    }
  }

  window.addEventListener(
    'scroll',
    () => {
      updateScrollProgress();
      updateBackToTop();
      updateScrollIndicator();
    },
    { passive: true }
  );

  // ── Custom Cursor (#19) ──────────────────────────────────────────────
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      customCursor.style.left = e.clientX + 'px';
      customCursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.product-card');
      if (card) {
        customCursor.classList.add('visible');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.product-card');
      if (card && !card.contains(e.relatedTarget)) {
        customCursor.classList.remove('visible');
      }
    });
  }

  // ── Magnetic Buttons (#7) ────────────────────────────────────────────
  if (!isTouchDevice) {
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ── Image Tilt on Hover (#8) ─────────────────────────────────────────
  if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const wrap = card.querySelector('.product-image-wrap');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      wrap.style.transform = `perspective(600px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;
    });

    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const wrap = card.querySelector('.product-image-wrap');
      if (wrap) wrap.style.transform = '';
    });
  }

  // ── Animated Counter (#11) ───────────────────────────────────────────
  function animateCounter(el, from, to, duration) {
    const start = performance.now();
    const diff = to - from;
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent =
        Math.round(from + diff * eased) +
        ' pieza' +
        (Math.round(from + diff * eased) !== 1 ? 's' : '') +
        ' en la coleccion';
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── Skeleton (#13) ───────────────────────────────────────────────────
  function showSkeleton() {
    skeletonGrid.hidden = false;
    grid.hidden = true;
    emptyState.hidden = true;
  }

  function hideSkeleton() {
    skeletonGrid.hidden = true;
    grid.hidden = false;
  }

  // ── Fetch Images ─────────────────────────────────────────────────────
  let allImages = [];

  async function loadCatalog() {
    showSkeleton();
    toolbar.hidden = true;
    countEl.textContent = '';

    try {
      await loadFavorites();
      const res = await fetch('/api/images?limit=200');
      const data = await res.json();
      allImages = data.images || [];
      images = allImages;

      hideSkeleton();

      if (images.length === 0) {
        emptyState.hidden = false;
        grid.hidden = true;
        return;
      }

      toolbar.hidden = false;
      buildFilters();
      currentPage = 1;
      applyFiltersAndSort();
    } catch {
      hideSkeleton();
      emptyState.hidden = false;
      grid.hidden = true;
      showToast('Error al cargar el catalogo', true);
    }
  }

  // ── Build Filters ────────────────────────────────────────────────────
  function buildFilters() {
    const collections = [...new Set(images.map((i) => i.collection).filter(Boolean))].sort();
    const categories = [...new Set(images.map((i) => i.category).filter(Boolean))].sort();
    const materials = [...new Set(images.map((i) => i.material).filter(Boolean))].sort();
    const gemstones = [...new Set(images.map((i) => i.gemstone).filter(Boolean))].sort();

    const groups = [
      { key: 'collection', values: collections },
      { key: 'category', values: categories },
      { key: 'material', values: materials },
      { key: 'gemstone', values: gemstones },
    ];

    filterRow.innerHTML = groups
      .filter((g) => g.values.length > 0)
      .map(
        (g) =>
          `<div class="filter-group">${g.values
            .map((v) => {
              const count = images.filter((i) => i[g.key] === v).length;
              return `<button class="filter-chip" data-key="${g.key}" data-value="${v}" aria-pressed="false">${v}<span class="filter-count">${count}</span></button>`;
            })
            .join('')}</div>`
      )
      .join('');

    filterRow.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.key;
        const value = chip.dataset.value;
        if (activeFilters[key] === value) {
          activeFilters[key] = '';
          chip.classList.remove('active');
          chip.setAttribute('aria-pressed', 'false');
        } else {
          filterRow
            .querySelectorAll(`.filter-chip[data-key="${key}"]`)
            .forEach((c) => {
              c.classList.remove('active');
              c.setAttribute('aria-pressed', 'false');
            });
          activeFilters[key] = value;
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
        }
        updateClearButton();
        applyFiltersAndSort();
      });
    });
  }

  function updateClearButton() {
    const hasActive = Object.values(activeFilters).some(Boolean);
    btnClearFilters.hidden = !hasActive;
  }

  btnClearFilters.addEventListener('click', () => {
    Object.keys(activeFilters).forEach((k) => (activeFilters[k] = ''));
    filterRow.querySelectorAll('.filter-chip').forEach((c) => {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    updateClearButton();
    applyFiltersAndSort();
  });

  // ── Apply Filters & Sort ─────────────────────────────────────────────
  function applyFiltersAndSort() {
    const query = searchInput.value.toLowerCase().trim();

    filteredImages = images.filter((img) => {
      if (query) {
        const searchable = [
          img.name,
          img.description,
          img.collection,
          img.category,
          img.material,
          img.gemstone,
        ]
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      if (activeFilters.collection && img.collection !== activeFilters.collection) return false;
      if (activeFilters.category && img.category !== activeFilters.category) return false;
      if (activeFilters.material && img.material !== activeFilters.material) return false;
      if (activeFilters.gemstone && img.gemstone !== activeFilters.gemstone) return false;
      return true;
    });

    const [sortKey, sortDir] = sortSelect.value.split('-');
    filteredImages.sort((a, b) => {
      if (sortKey === 'name') {
        const cmp = a.name.localeCompare(b.name);
        return sortDir === 'desc' ? -cmp : cmp;
      }
      if (sortKey === 'collection') {
        return (a.collection || 'zzz').localeCompare(b.collection || 'zzz');
      }
      if (sortKey === 'price') {
        const pa = parseFloat(a.price) || 0;
        const pb = parseFloat(b.price) || 0;
        return sortDir === 'desc' ? pb - pa : pa - pb;
      }
      if (sortKey === 'order') {
        return (a.order ?? 9999) - (b.order ?? 9999);
      }
      return 0;
    });

    // Animated counter
    const prevCount = parseInt(countEl.textContent) || 0;
    animateCounter(countEl, prevCount, filteredImages.length, 400);

    if (activeFilters.collection) {
      viewMode = 'collection';
    } else if (viewMode === 'collection' && !activeFilters.collection) {
      viewMode = 'grid';
    }

    // Pagination
    totalPages = Math.ceil(filteredImages.length / PER_PAGE);
    if (currentPage > totalPages) currentPage = 1;

    renderGrid();
    renderPagination();
    updateSelectionCounts();
  }

  function goToPage(page) {
    currentPage = Math.max(1, Math.min(page, totalPages));
    renderGrid();
    renderPagination();
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    const start = (currentPage - 1) * PER_PAGE + 1;
    const end = Math.min(currentPage * PER_PAGE, filteredImages.length);

    let html = `<span class="pagination-info">Mostrando ${start}-${end} de ${filteredImages.length}</span>`;
    html += '<div class="pagination-controls">';

    // Previous
    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        html += '<span class="pagination-dots">...</span>';
      }
    }

    // Next
    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;

    html += '</div>';
    container.innerHTML = html;

    // Event listeners
    container.querySelectorAll('.pagination-btn:not([disabled])').forEach((btn) => {
      btn.addEventListener('click', () => goToPage(parseInt(btn.dataset.page, 10)));
    });
  }

  // ── Render Grid ──────────────────────────────────────────────────────
  function renderGrid() {
    if (viewMode === 'collection' && activeFilters.collection) {
      renderCollectionView();
    } else {
      renderGridView();
    }
  }

  function renderGridView() {
    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const pageImages = filteredImages.slice(start, end);

    grid.innerHTML = pageImages.map((img, idx) => buildCardHTML(img, start + idx)).join('');
    attachCardListeners();
    observeCards();
  }

  function renderCollectionView() {
    const groups = {};
    filteredImages.forEach((img, idx) => {
      const key = img.collection || 'Sin categorizar';
      if (!groups[key]) groups[key] = [];
      groups[key].push({ img, idx });
    });

    grid.innerHTML = Object.entries(groups)
      .map(
        ([name, items]) => `
        <div class="collection-section">
          <div class="collection-header">
            <span class="collection-title">${name}</span>
            <span class="collection-line"></span>
            <span class="collection-count">${items.length} pieza${items.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="catalog-grid">
            ${items.map(({ img, idx }) => buildCardHTML(img, idx)).join('')}
          </div>
        </div>`
      )
      .join('');

    attachCardListeners();
    observeCards();
  }

  const WHATSAPP_PHONE = '50688830657';

  function whatsappUrl(productName, productId) {
    const productLink = `${window.location.origin}/producto/${encodeURIComponent(productId)}`;
    const msg = encodeURIComponent(`Hola, vi esta pieza en el sitio web y me interesa comprarla: ${productName}\n${productLink}`);
    return `https://wa.me/${WHATSAPP_PHONE}?text=${msg}`;
  }

  function buildCardHTML(img, idx) {
    const thumbSrc = img.thumbUrl || img.url;
    const isFav = favoriteFiles.has(img.id);
    const productUrl = `/producto/${encodeURIComponent(img.id)}`;
    const imageCount = img.images ? img.images.length : 1;
    return `
      <a href="${productUrl}" class="product-card-link">
        <div class="product-card${isFav ? ' favorited' : ''}" data-index="${idx}" data-id="${img.id}" data-url="${productUrl}">
          <div class="product-select" aria-label="Seleccionar ${img.name}"></div>
          <button class="product-fav" aria-label="Alternar favorito" data-fav="${img.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          ${imageCount > 1 ? `<span class="product-image-count">${imageCount} fotos</span>` : ''}
          <a class="product-whatsapp" href="${whatsappUrl(img.name, img.id)}" target="_blank" rel="noopener" title="Consultar por WhatsApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <div class="product-image-wrap">
            <img
              src="${thumbSrc}"
              alt="${img.name}"
              loading="lazy"
              decoding="async"
              onerror="handleImageError(this)"
            />
          </div>
          <div class="product-info">
            <h2 class="product-name">${img.name}</h2>
            <div class="product-divider"></div>
            ${buildCardMeta(img)}
          </div>
        </div>
      </a>`;
  }

  function buildCardMeta(img) {
    const parts = [];
    if (img.collection) parts.push(`<span class="product-tag">${img.collection}</span>`);
    if (img.category) parts.push(`<span class="product-tag">${img.category}</span>`);
    if (img.material) parts.push(`<span class="product-tag">${img.material}</span>`);
    if (img.gemstone) parts.push(`<span class="product-tag">${img.gemstone}</span>`);
    if (parts.length === 0) return '';
    return `<div class="product-meta">${parts.join('')}</div>`;
  }

  // ── Intersection Observer — Scroll Reveal (#6) + Blur-Up (#14) ──────
  function observeCards() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.classList.remove('card-hidden');
            // Blur-up image load
            const img = entry.target.querySelector('img');
            if (img && !img.classList.contains('loaded')) {
              if (img.complete) {
                img.classList.add('loaded');
              } else {
                img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
                img.addEventListener(
                  'error',
                  () => {
                    // Use global error handler to display consistent placeholder
                    window.handleImageError(img);
                  },
                  { once: true }
                );
              }
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    grid.querySelectorAll('.product-card').forEach((card) => {
      card.classList.add('card-hidden');
      observer.observe(card);
    });
  }

  // ── Card Listeners ───────────────────────────────────────────────────
  function attachCardListeners() {
    grid.querySelectorAll('.product-card').forEach((card) => {
      const selectHandle = card.querySelector('.product-select');
      const favBtn = card.querySelector('.product-fav');

      card.setAttribute('tabindex', '0');

      card.addEventListener('click', (e) => {
        if (selectionMode) return;
        if (e.target.closest('.product-whatsapp')) return;
        const idx = parseInt(card.dataset.index, 10);
        if (!isNaN(idx)) {
          e.preventDefault();
          e.stopPropagation();
          openLightbox(idx);
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !selectionMode) {
          const idx = parseInt(card.dataset.index, 10);
          if (!isNaN(idx)) {
            e.preventDefault();
            openLightbox(idx);
          }
        }
      });

      if (selectHandle) {
        selectHandle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFileSelection(card.dataset.id);
        });
      }

      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(favBtn.dataset.fav);
        });
      }

      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragend', handleDragEnd);
      card.addEventListener('dragover', handleDragOver);
      card.addEventListener('dragenter', handleDragEnter);
      card.addEventListener('dragleave', handleDragLeave);
      card.addEventListener('drop', handleDrop);
    });
  }

  // ── Drag & Drop ──────────────────────────────────────────────────────
  let dragSrcEl = null;

  function handleDragStart(e) {
    dragSrcEl = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.filename);
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    grid.querySelectorAll('.product-card').forEach((c) => c.classList.remove('drag-over'));
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    if (this !== dragSrcEl) this.classList.add('drag-over');
  }

  function handleDragLeave() {
    this.classList.remove('drag-over');
  }

  async function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    if (dragSrcEl === this) return;

    const fromFilename = e.dataTransfer.getData('text/plain');
    const toFilename = this.dataset.filename;
    const fromImg = images.find((i) => i.filename === fromFilename);
    const toImg = images.find((i) => i.filename === toFilename);
    if (!fromImg || !toImg) return;

    const fromOrder = fromImg.order ?? 9999;
    const toOrder = toImg.order ?? 9999;
    fromImg.order = toOrder;
    toImg.order = fromOrder;

    try {
      await fetch('/api/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders: [
            { filename: fromFilename, order: toOrder },
            { filename: toFilename, order: fromOrder },
          ],
        }),
      });
      applyFiltersAndSort();
      showToast('Orden actualizado');
    } catch {
      showToast('Error al guardar el orden', true);
    }
  }

  // ── Lightbox with Crossfade (#9, #21) ───────────────────────────────
  const lightboxWhatsapp = document.getElementById('lightbox-whatsapp');

  function updateLightboxCounter() {
    if (lightboxCounter && filteredImages.length > 1) {
      lightboxCounter.textContent = `${lightboxIndex + 1} / ${filteredImages.length}`;
      lightboxCounter.style.display = '';
    } else if (lightboxCounter) {
      lightboxCounter.style.display = 'none';
    }
  }

  function openLightbox(index) {
    lightboxIndex = index;
    const img = filteredImages[index];
    if (!img) return;

    lightbox.hidden = false;
    lightboxImg.src = img.thumbUrl || img.url;
    lightboxImg.alt = img.name;
    lightboxName.textContent = img.name;
    lightboxDesc.textContent = img.description || '';
    lightboxWhatsapp.href = whatsappUrl(img.name, img.id);

    lightboxPrev.style.display = filteredImages.length > 1 ? '' : 'none';
    lightboxNext.style.display = filteredImages.length > 1 ? '' : 'none';
    updateLightboxCounter();
    document.body.style.overflow = 'hidden';
    trapFocus(lightbox);

    // Track view
    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: img.filename }),
    }).catch(() => {});

    // Show hints then fade
    lightboxHints.style.opacity = '';
    lightboxHints.style.animation = 'none';
    void lightboxHints.offsetHeight;
    lightboxHints.style.animation = '';
  }

  function closeLightbox() {
    releaseFocus(lightbox);
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    const img = filteredImages[lightboxIndex];
    if (!img) return;

    // Crossfade transition
    lightboxImg.classList.add('transitioning');
    setTimeout(() => {
      lightboxIndex += dir;
      if (lightboxIndex < 0) lightboxIndex = filteredImages.length - 1;
      if (lightboxIndex >= filteredImages.length) lightboxIndex = 0;
      const next = filteredImages[lightboxIndex];
      lightboxImg.src = next.thumbUrl || next.url;
      lightboxImg.alt = next.name;
      lightboxName.textContent = next.name;
      lightboxDesc.textContent = next.description || '';
      lightboxImg.classList.remove('transitioning');
      updateLightboxCounter();
    }, 250);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext.addEventListener('click', () => navigateLightbox(1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // ── Upload ────────────────────────────────────────────────────────────
  let pendingFiles = [];

  function openUpload() {
    uploadOverlay.hidden = false;
    pendingFiles = [];
    uploadPreview.hidden = true;
    uploadPreview.innerHTML = '';
    btnUploadConfirm.disabled = true;
    document.body.style.overflow = 'hidden';
    trapFocus(uploadOverlay);
  }

  function closeUpload() {
    releaseFocus(uploadOverlay);
    uploadOverlay.hidden = true;
    document.body.style.overflow = '';
    fileInput.value = '';
  }

  function handleFiles(files) {
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const accepted = Array.from(files).filter((f) => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      return validExts.includes(ext);
    });

    if (accepted.length === 0) {
      showToast('Tipo de archivo no soportado', true);
      return;
    }

    pendingFiles = accepted;
    uploadPreview.innerHTML = accepted
      .map(
        (f) =>
          `<div class="upload-preview-item"><img src="${URL.createObjectURL(f)}" alt="${f.name}" /></div>`
      )
      .join('');
    uploadPreview.hidden = false;
    btnUploadConfirm.disabled = false;
  }

  async function uploadFiles() {
    if (pendingFiles.length === 0) return;
    btnUploadConfirm.disabled = true;
    let successCount = 0;

    for (const file of pendingFiles) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await fetch('/api/images', { method: 'POST', body: formData });
        if (res.ok) successCount++;
      } catch {
        // skip
      }
    }

    closeUpload();
    if (successCount > 0) {
      showToast(
        `${successCount} imagen${successCount > 1 ? 's' : ''} subida${successCount > 1 ? 's' : ''}`
      );
      loadCatalog();
    } else {
      showToast('Error al subir', true);
    }
  }

  btnUpload.addEventListener('click', openUpload);
  btnUploadCancel.addEventListener('click', closeUpload);
  btnUploadConfirm.addEventListener('click', uploadFiles);
  uploadOverlay.addEventListener('click', (e) => {
    if (e.target === uploadOverlay) closeUpload();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', () => handleFiles(fileInput.files));

  // ── View Toggle (#18) ────────────────────────────────────────────────
  btnViewGrid.addEventListener('click', () => {
    viewMode = 'grid';
    btnViewGrid.classList.add('active');
    btnViewList.classList.remove('active');
    grid.classList.remove('list-view');
    renderGrid();
  });

  btnViewList.addEventListener('click', () => {
    viewMode = 'list';
    btnViewList.classList.add('active');
    btnViewGrid.classList.remove('active');
    grid.classList.add('list-view');
    renderGrid();
  });

  // ── Selection Mode ──────────────────────────────────────────────────
  function toggleSelectionMode() {
    selectionMode = !selectionMode;
    btnSelectMode.classList.toggle('active', selectionMode);
    document.querySelectorAll('.product-card').forEach((card) => {
      card.classList.toggle('selectable', selectionMode);
    });
    if (!selectionMode) {
      selectedFiles.clear();
      document
        .querySelectorAll('.product-card.selected')
        .forEach((c) => c.classList.remove('selected'));
    }
    updateSelectionCounts();
  }

  function toggleFileSelection(filename) {
    if (selectedFiles.has(filename)) {
      selectedFiles.delete(filename);
    } else {
      selectedFiles.add(filename);
    }
    const card = grid.querySelector(`[data-id="${filename}"]`);
    if (card) card.classList.toggle('selected', selectedFiles.has(filename));
    updateSelectionCounts();
  }

  function updateSelectionCounts() {
    if (pdfExportAllCount) pdfExportAllCount.textContent = images.length;
    if (pdfExportSelectedCount) pdfExportSelectedCount.textContent = selectedFiles.size;
    if (pdfExportFilteredCount) pdfExportFilteredCount.textContent = filteredImages.length;
  }

  // ── PDF Settings Modal ─────────────────────────────────────────────
  function openPdfSettings() {
    updateSelectionCounts();
    pdfSettingsOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    trapFocus(pdfSettingsOverlay);
  }

  function closePdfSettings() {
    releaseFocus(pdfSettingsOverlay);
    pdfSettingsOverlay.hidden = true;
    document.body.style.overflow = '';
  }

  function getSelectedTemplate() {
    const active = pdfSettingsOverlay.querySelector('.template-btn.active');
    return active ? active.dataset.template : 'catalog';
  }

  function getExportScope() {
    const checked = pdfSettingsOverlay.querySelector('input[name="pdf-export"]:checked');
    return checked ? checked.value : 'all';
  }

  function getPdfOptions() {
    return {
      template: getSelectedTemplate(),
      columns: parseInt(pdfColumns.value, 10),
      perPage: parseInt(pdfPerPage.value, 10),
      format: pdfFormat.value,
      margins: {
        top: parseInt(pdfMarginTop.value, 10),
        right: parseInt(pdfMarginRight.value, 10),
        bottom: parseInt(pdfMarginBottom.value, 10),
        left: parseInt(pdfMarginLeft.value, 10),
      },
      exportScope: getExportScope(),
      selectedFilenames: Array.from(selectedFiles),
    };
  }

  async function doGeneratePDF(options) {
    if (images.length === 0) {
      showToast('No hay imagenes para incluir en el PDF', true);
      return;
    }

    btnPDF.disabled = true;
    pdfOverlay.hidden = false;

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {}),
      });
      const data = await res.json();

      if (data.success && data.downloadUrl) {
        showToast('PDF generado exitosamente');
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = 'deo-gratias-catalog.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        showToast(data.error || 'La generacion de PDF fallo', true);
      }
    } catch {
      showToast('La generacion de PDF fallo', true);
    } finally {
      btnPDF.disabled = false;
      pdfOverlay.hidden = true;
    }
  }

  // ── Keyboard Shortcuts (#21) ─────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (!lightbox.hidden) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    }
    if (!uploadOverlay.hidden && e.key === 'Escape') closeUpload();
  });

  // ── Event Listeners ──────────────────────────────────────────────────
  btnRefresh.addEventListener('click', loadCatalog);
  btnPDF.addEventListener('click', openPdfSettings);
  btnSelectMode.addEventListener('click', toggleSelectionMode);
  btnPdfSettingsCancel.addEventListener('click', closePdfSettings);
  btnPdfSettingsGenerate.addEventListener('click', () => {
    closePdfSettings();
    doGeneratePDF(getPdfOptions());
  });
  pdfSettingsOverlay.addEventListener('click', (e) => {
    if (e.target === pdfSettingsOverlay) closePdfSettings();
  });
  pdfSettingsOverlay.querySelectorAll('.template-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      pdfSettingsOverlay
        .querySelectorAll('.template-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  let searchTrackTimer;
  const searchClear = document.getElementById('search-clear');

  function updateSearchClear() {
    searchClear.hidden = searchInput.value.length === 0;
  }

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    updateSearchClear();
    applyFiltersAndSort();
    searchInput.focus();
  });

  searchInput.addEventListener('input', () => {
    updateSearchClear();
    applyFiltersAndSort();
    clearTimeout(searchTrackTimer);
    searchTrackTimer = setTimeout(() => {
      const q = searchInput.value.trim();
      if (q.length >= 2) {
        fetch('/api/analytics/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        }).catch(() => {});
      }
    }, 1000);
  });
  sortSelect.addEventListener('change', applyFiltersAndSort);

  // ── Initial Load ─────────────────────────────────────────────────────
  loadCatalog();
})();
