(function () {
  'use strict';

  // ── Auth ─────────────────────────────────────────────────────────
  let authToken = localStorage.getItem('dg-admin-token');

  function getAuthHeaders() {
    return authToken ? { Authorization: 'Basic ' + authToken } : {};
  }

  function showLogin() {
    document.getElementById('main-content').hidden = true;
    document.getElementById('login-overlay').hidden = false;
  }

  function hideLogin() {
    document.getElementById('main-content').hidden = false;
    document.getElementById('login-overlay').hidden = true;
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('login-user').value;
      const pass = document.getElementById('login-pass').value;
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: user, password: pass }),
        });
        const data = await res.json();
        if (data.success && data.token) {
          authToken = data.token;
          localStorage.setItem('dg-admin-token', authToken);
          hideLogin();
          loadProducts();
          loadCollections();
        } else {
          document.getElementById('login-error').textContent = 'Credenciales invalidas';
          document.getElementById('login-error').hidden = false;
        }
      } catch {
        document.getElementById('login-error').textContent = 'Error de conexion';
        document.getElementById('login-error').hidden = false;
      }
    });
  }

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('dg-admin-token');
    authToken = null;
    showLogin();
  });

  // ── DOM ─────────────────────────────────────────────────────────
  const tabs = document.querySelectorAll('.admin-tab');
  const tabContents = document.querySelectorAll('.admin-tab-content');
  const productList = document.getElementById('admin-product-list');
  const collectionList = document.getElementById('admin-collection-list');
  const adminSearch = document.getElementById('admin-search');
  const adminCount = document.getElementById('admin-count');
  const productModal = document.getElementById('product-modal');
  const collectionModal = document.getElementById('collection-modal');
  const productForm = document.getElementById('product-form');
  const collectionForm = document.getElementById('collection-form');
  const toast = document.getElementById('toast');
  const toastText = toast.querySelector('.toast-text');

  let allProducts = [];
  let allCollections = {};

  // ── Theme ───────────────────────────────────────────────────────
  const btnTheme = document.getElementById('btn-theme');
  const savedTheme = localStorage.getItem('dg-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  btnTheme.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dg-theme', next);
  });

  // ── Toast ───────────────────────────────────────────────────────
  function showToast(msg) {
    toastText.textContent = msg;
    toast.hidden = false;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.hidden = true;
    }, 3000);
  }
  document.getElementById('toast-close').addEventListener('click', () => {
    toast.hidden = true;
  });

  // ── Tabs ────────────────────────────────────────────────────────
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ── Load Products ───────────────────────────────────────────────
  async function loadProducts() {
    try {
      const res = await fetch('/api/images?limit=200', { headers: getAuthHeaders() });
      const data = await res.json();
      allProducts = data.images || [];
      renderProducts(allProducts);
    } catch {
      showToast('Error al cargar productos');
    }
  }

  function renderProducts(products) {
    adminCount.textContent = products.length + ' productos';
    productList.innerHTML = products
      .map(
        (p) => `
      <div class="admin-product-row" data-id="${p.id}">
        <img class="admin-product-thumb" src="${p.thumbUrl}" alt="${p.name}" loading="lazy" />
        <div class="admin-product-info">
          <div class="admin-product-name">${p.name}</div>
          <div class="admin-product-filename">${p.id}</div>
        </div>
        <div class="admin-product-meta ${p.category ? 'has-value' : ''}">${p.category || '—'}</div>
        <div class="admin-product-meta ${p.material ? 'has-value' : ''}">${p.material || '—'}</div>
        <div class="admin-product-meta ${p.price ? 'has-value' : ''}">${p.price || '—'}</div>
        <div class="admin-product-actions">
          <button class="btn-edit" title="Editar" data-id="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      </div>
    `
      )
      .join('');

    productList.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => openProductModal(btn.dataset.id));
    });
  }

  // ── Search ──────────────────────────────────────────────────────
  adminSearch.addEventListener('input', () => {
    const q = adminSearch.value.toLowerCase();
    const filtered = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.material || '').toLowerCase().includes(q)
    );
    renderProducts(filtered);
  });

  // ── Product Modal ───────────────────────────────────────────────
  function openProductModal(id) {
    const product = allProducts.find((p) => p.id === id);
    if (!product) return;

    document.getElementById('modal-product-title').textContent = 'Editar: ' + product.name;
    document.getElementById('form-filename').value = product.id;
    document.getElementById('form-name').value = product.name;
    document.getElementById('form-description').value = product.description || '';
    document.getElementById('form-price').value = product.price || '';
    document.getElementById('form-category').value = product.category || '';
    document.getElementById('form-collection').value = product.collection || '';
    document.getElementById('form-material').value = product.material || '';
    document.getElementById('form-gemstone').value = product.gemstone || '';
    document.getElementById('form-order').value = product.order ?? 9999;

    populateCollectionDropdown();
    productModal.hidden = false;
  }

  function populateCollectionDropdown() {
    const select = document.getElementById('form-collection');
    const current = select.value;
    select.innerHTML = '<option value="">Sin coleccion</option>';
    for (const [slug, col] of Object.entries(allCollections)) {
      const opt = document.createElement('option');
      opt.value = slug;
      opt.textContent = col.name;
      select.appendChild(opt);
    }
    select.value = current;
  }

  document.getElementById('modal-close').addEventListener('click', () => {
    productModal.hidden = true;
  });
  document.getElementById('form-cancel').addEventListener('click', () => {
    productModal.hidden = true;
  });

  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) productModal.hidden = true;
  });

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const filename = document.getElementById('form-filename').value;
    const body = {
      name: document.getElementById('form-name').value,
      description: document.getElementById('form-description').value,
      price: document.getElementById('form-price').value,
      category: document.getElementById('form-category').value,
      collection: document.getElementById('form-collection').value,
      material: document.getElementById('form-material').value,
      gemstone: document.getElementById('form-gemstone').value,
      order: parseInt(document.getElementById('form-order').value, 10) || 9999,
    };

    try {
      const res = await fetch('/api/products/' + encodeURIComponent(filename), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast('Producto guardado');
      productModal.hidden = true;
      loadProducts();
    } catch {
      showToast('Error al guardar');
    }
  });

  // ── Load Collections ────────────────────────────────────────────
  async function loadCollections() {
    try {
      const res = await fetch('/api/collections', { headers: getAuthHeaders() });
      const data = await res.json();
      allCollections = data.collections || {};
      renderCollections();
    } catch {
      showToast('Error al cargar colecciones');
    }
  }

  function renderCollections() {
    const entries = Object.entries(allCollections).sort(
      (a, b) => (a[1].order ?? 9999) - (b[1].order ?? 9999)
    );
    collectionList.innerHTML =
      entries.length === 0
        ? '<p style="color:var(--text-secondary);padding:1rem;">No hay colecciones creadas.</p>'
        : entries
            .map(
              ([slug, col]) => `
        <div class="admin-collection-row" data-slug="${slug}">
          <div class="admin-collection-name">${col.name}</div>
          <div class="admin-collection-meta">${col.parent || '—'}</div>
          <div class="admin-collection-meta">${col.order ?? 9999}</div>
          <div class="admin-collection-actions">
            <button class="btn-edit-col" title="Editar" data-slug="${slug}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-delete-col" title="Eliminar" data-slug="${slug}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `
            )
            .join('');

    collectionList.querySelectorAll('.btn-edit-col').forEach((btn) => {
      btn.addEventListener('click', () => openCollectionModal(btn.dataset.slug));
    });
    collectionList.querySelectorAll('.btn-delete-col').forEach((btn) => {
      btn.addEventListener('click', () => deleteCollection(btn.dataset.slug));
    });
  }

  // ── Collection Modal ────────────────────────────────────────────
  function openCollectionModal(slug) {
    const col = slug ? allCollections[slug] : null;
    document.getElementById('modal-collection-title').textContent = col
      ? 'Editar Coleccion'
      : 'Nueva Coleccion';
    document.getElementById('col-form-slug').value = slug || '';
    document.getElementById('col-form-name').value = col ? col.name : '';
    document.getElementById('col-form-description').value = col ? col.description || '' : '';
    document.getElementById('col-form-order').value = col ? (col.order ?? 9999) : 9999;

    const parentSelect = document.getElementById('col-form-parent');
    parentSelect.innerHTML = '<option value="">Ninguna (raiz)</option>';
    for (const [s, c] of Object.entries(allCollections)) {
      if (s === slug) continue;
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = c.name;
      parentSelect.appendChild(opt);
    }
    parentSelect.value = col ? col.parent || '' : '';

    collectionModal.hidden = false;
  }

  document
    .getElementById('btn-add-collection')
    .addEventListener('click', () => openCollectionModal(null));
  document.getElementById('collection-modal-close').addEventListener('click', () => {
    collectionModal.hidden = true;
  });
  document.getElementById('col-form-cancel').addEventListener('click', () => {
    collectionModal.hidden = true;
  });

  collectionModal.addEventListener('click', (e) => {
    if (e.target === collectionModal) collectionModal.hidden = true;
  });

  collectionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const slug = document.getElementById('col-form-slug').value;
    const body = {
      name: document.getElementById('col-form-name').value,
      description: document.getElementById('col-form-description').value,
      parent: document.getElementById('col-form-parent').value,
      order: parseInt(document.getElementById('col-form-order').value, 10) || 9999,
    };

    try {
      const method = slug ? 'PUT' : 'POST';
      const url = slug ? '/api/collections/' + encodeURIComponent(slug) : '/api/collections';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast(slug ? 'Coleccion actualizada' : 'Coleccion creada');
      collectionModal.hidden = true;
      loadCollections();
    } catch {
      showToast('Error al guardar coleccion');
    }
  });

  async function deleteCollection(slug) {
    if (!confirm('Eliminar esta coleccion?')) return;
    try {
      await fetch('/api/collections/' + encodeURIComponent(slug), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      showToast('Coleccion eliminada');
      loadCollections();
    } catch {
      showToast('Error al eliminar');
    }
  }

  // ── Duplicates Detection ───────────────────────────────────────
  const btnScanDuplicates = document.getElementById('btn-scan-duplicates');
  const duplicatesStatus = document.getElementById('duplicates-status');
  const duplicatesList = document.getElementById('duplicates-list');
  const duplicatesCount = document.getElementById('duplicates-count');

  btnScanDuplicates.addEventListener('click', scanDuplicates);

  async function scanDuplicates() {
    duplicatesStatus.hidden = false;
    duplicatesList.innerHTML = '';
    duplicatesCount.textContent = '';
    btnScanDuplicates.disabled = true;

    try {
      const res = await fetch('/api/duplicates', { headers: getAuthHeaders() });
      const data = await res.json();

      duplicatesStatus.hidden = true;
      btnScanDuplicates.disabled = false;

      if (!data.duplicates || data.duplicates.length === 0) {
        duplicatesList.innerHTML =
          '<p class="duplicates-empty">No se encontraron imagenes similares.</p>';
        duplicatesCount.textContent = '0 grupos';
        return;
      }

      duplicatesCount.textContent =
        data.duplicates.length + ' grupo' + (data.duplicates.length > 1 ? 's' : '');
      renderDuplicates(data.duplicates);
    } catch {
      duplicatesStatus.hidden = true;
      btnScanDuplicates.disabled = false;
      showToast('Error al escanear duplicados');
    }
  }

  function renderDuplicates(groups) {
    duplicatesList.innerHTML = groups
      .map(
        (group, i) => `
        <div class="duplicate-group">
          <div class="duplicate-header">
            <span class="duplicate-similarity">${group.similarity}% similar</span>
            <span class="duplicate-count">${group.images.length} imagenes</span>
          </div>
          <div class="duplicate-images">
            ${group.images
              .map(
                (img) => `
              <div class="duplicate-image-card">
                <img src="${img.url}" alt="${img.name}" loading="lazy" />
                <span class="duplicate-image-name">${img.name}</span>
              </div>`
              )
              .join('')}
          </div>
        </div>`
      )
      .join('');
  }

  // ── Scroll Progress ─────────────────────────────────────────────
  const scrollProgress = document.getElementById('scroll-progress');
  window.addEventListener(
    'scroll',
    () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    },
    { passive: true }
  );

  // ── Init ────────────────────────────────────────────────────────
  loadProducts();
  loadCollections();
})();
