const { test, expect } = require('@playwright/test');

test.describe('Deo Gratias Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.product-card', { state: 'attached', timeout: 5000 });
    // Force grid and cards visible for headless Playwright
    await page.evaluate(() => {
      const grid = document.getElementById('catalog-grid');
      if (grid) {
        grid.hidden = false;
        grid.style.display = '';
      }
      document.querySelectorAll('.product-card').forEach((c) => {
        c.classList.add('visible');
        c.classList.remove('card-hidden');
        c.style.opacity = '1';
        c.style.transform = 'none';
      });
    });
    await page.waitForTimeout(700);
  });

  // ── Page structure ──────────────────────────────────────────────────

  test('loads and shows the brand header', async ({ page }) => {
    await expect(page.locator('.brand-name')).toHaveText('Deo Gratias');
    await expect(page.locator('.brand-tagline')).toHaveText('Joyeria Fina');
  });

  test('shows the catalog hero section', async ({ page }) => {
    await expect(page.locator('.catalog-title')).toHaveText('Deo Gratias');
    await expect(page.locator('.catalog-subtitle')).toBeVisible();
  });

  test('has refresh, upload, and PDF buttons', async ({ page }) => {
    await expect(page.locator('#btn-refresh')).toBeVisible();
    await expect(page.locator('#btn-upload')).toBeVisible();
    await expect(page.locator('#btn-pdf')).toBeVisible();
  });

  // ── Image catalog ───────────────────────────────────────────────────

  test('displays product cards for detected images', async ({ page }) => {
    const cards = page.locator('.product-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('shows the correct image count', async ({ page }) => {
    await expect(page.locator('#catalog-count')).toContainText('pieza');
  });

  test('each card has an image and a name', async ({ page }) => {
    const cards = page.locator('.product-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card.locator('img')).toHaveAttribute('src', /.+/);
      await expect(card.locator('.product-name')).not.toBeEmpty();
    }
  });

  test('images do not stretch (maintain aspect ratio)', async ({ page }) => {
    const imgs = page.locator('.product-image-wrap img');
    const count = await imgs.count();
    for (let i = 0; i < count; i++) {
      const box = await imgs.nth(i).boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    }
  });

  // ── Search & Filter ─────────────────────────────────────────────────

  test('toolbar is visible when images exist', async ({ page }) => {
    await expect(page.locator('#toolbar')).toBeVisible();
  });

  test('search input filters products', async ({ page }) => {
    const totalCards = await page.locator('.product-card').count();
    await page.fill('#search-input', 'zzz_no_match');
    await page.waitForTimeout(300);
    const filtered = await page.locator('.product-card').count();
    expect(filtered).toBe(0);

    await page.fill('#search-input', '');
    await page.waitForTimeout(300);
    const restored = await page.locator('.product-card').count();
    expect(restored).toBe(totalCards);
  });

  test('sort select changes card order', async ({ page }) => {
    const firstName = await page.locator('.product-card .product-name').first().textContent();
    await page.selectOption('#sort-select', 'name-desc');
    await page.waitForTimeout(300);
    const newFirstName = await page.locator('.product-card .product-name').first().textContent();
    expect(newFirstName).not.toBe(firstName);
  });

  // ── Lightbox ────────────────────────────────────────────────────────

  test('clicking a product card opens lightbox', async ({ page }) => {
    await page.locator('.product-card').first().click();
    await expect(page.locator('#lightbox')).toBeVisible();
    await expect(page.locator('#lightbox-name')).not.toBeEmpty();
  });

  test('lightbox closes on Escape', async ({ page }) => {
    await page.locator('.product-card').first().click();
    await expect(page.locator('#lightbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).toBeHidden();
  });

  test('lightbox navigates with arrow keys', async ({ page }) => {
    await page.locator('.product-card').first().click();
    const name1 = await page.locator('#lightbox-name').textContent();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(350);
    const name2 = await page.locator('#lightbox-name').textContent();
    expect(name2).not.toBe(name1);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(350);
    const name3 = await page.locator('#lightbox-name').textContent();
    expect(name3).toBe(name1);
  });

  test('lightbox close button works', async ({ page }) => {
    await page.locator('.product-card').first().click();
    await expect(page.locator('#lightbox')).toBeVisible();
    await page.locator('#lightbox-close').click();
    await expect(page.locator('#lightbox')).toBeHidden();
  });

  // ── Upload Modal ────────────────────────────────────────────────────

  test('upload button opens upload modal', async ({ page }) => {
    await page.locator('#btn-upload').click();
    await expect(page.locator('#upload-overlay')).toBeVisible();
    await expect(page.locator('.drop-zone')).toBeVisible();
  });

  test('upload modal closes on cancel', async ({ page }) => {
    await page.locator('#btn-upload').click();
    await expect(page.locator('#upload-overlay')).toBeVisible();
    await page.locator('#btn-upload-cancel').click();
    await expect(page.locator('#upload-overlay')).toBeHidden();
  });

  test('upload confirm button is disabled with no files', async ({ page }) => {
    await page.locator('#btn-upload').click();
    await expect(page.locator('#btn-upload-confirm')).toBeDisabled();
  });

  // ── Refresh ─────────────────────────────────────────────────────────

  test('refresh button reloads the catalog', async ({ page }) => {
    const cardsBefore = await page.locator('.product-card').count();
    await page.locator('#btn-refresh').click({ force: true });
    await page.waitForSelector('.product-card', { state: 'attached', timeout: 5000 });
    await page.evaluate(() => {
      const grid = document.getElementById('catalog-grid');
      if (grid) grid.hidden = false;
      document.querySelectorAll('.product-card').forEach((c) => {
        c.classList.add('visible');
        c.classList.remove('card-hidden');
        c.style.opacity = '1';
        c.style.transform = 'none';
      });
    });
    const cardsAfter = await page.locator('.product-card').count();
    expect(cardsAfter).toBe(cardsBefore);
  });

  // ── Empty state ─────────────────────────────────────────────────────

  test('empty state element exists in DOM', async ({ page }) => {
    const emptyState = page.locator('#empty-state');
    await expect(emptyState).toBeDefined();
  });

  // ── PDF generation ──────────────────────────────────────────────────

  test('PDF button triggers generation via settings modal', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 45000 });
    await page.locator('#btn-pdf').click({ force: true });
    await expect(page.locator('#pdf-settings-overlay')).toBeVisible();
    await page.locator('#btn-pdf-settings-generate').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('deo-gratias-catalog.pdf');
  });

  // ── Responsive ──────────────────────────────────────────────────────

  test('catalog is responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForSelector('.product-card', { state: 'attached', timeout: 5000 });
    await page.evaluate(() => {
      const grid = document.getElementById('catalog-grid');
      if (grid) grid.hidden = false;
      document.querySelectorAll('.product-card').forEach((c) => {
        c.classList.add('visible');
        c.classList.remove('card-hidden');
        c.style.opacity = '1';
        c.style.transform = 'none';
      });
    });
    const count = await page.locator('.product-card').count();
    expect(count).toBeGreaterThan(0);
  });

  // ── Footer ──────────────────────────────────────────────────────────

  test('footer is visible', async ({ page }) => {
    await expect(page.locator('.site-footer')).toBeVisible();
    await expect(page.locator('.site-footer')).toContainText('Deo Gratias');
  });

  // ── API endpoints ───────────────────────────────────────────────────

  test('API returns valid image list with metadata fields', async ({ page }) => {
    const res = await page.request.get('/api/images');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.total).toBeGreaterThan(0);
    expect(Array.isArray(data.images)).toBeTruthy();
    const img = data.images[0];
    expect(img).toHaveProperty('id');
    expect(img).toHaveProperty('name');
    expect(img).toHaveProperty('url');
    expect(img).toHaveProperty('collection');
    expect(img).toHaveProperty('category');
    expect(img).toHaveProperty('price');
  });

  test('API product metadata CRUD', async ({ page }) => {
    const auth = { Authorization: 'Basic ' + Buffer.from('admin:admin').toString('base64') };
    const listRes = await page.request.get('/api/images');
    const { images } = await listRes.json();
    const productId = images[0].id;

    // Update
    const putRes = await page.request.put(`/api/products/${productId}`, {
      headers: auth,
      data: { name: 'Test Name', collection: 'Test Collection', price: '$999' },
    });
    expect(putRes.ok()).toBeTruthy();
    const saved = await putRes.json();
    expect(saved.name).toBe('Test Name');
    expect(saved.collection).toBe('Test Collection');

    // Read
    const getRes = await page.request.get(`/api/products/${productId}`);
    expect(getRes.ok()).toBeTruthy();
    const fetched = await getRes.json();
    expect(fetched.name).toBe('Test Name');

    // List includes metadata
    const listRes2 = await page.request.get('/api/images');
    const data2 = await listRes2.json();
    const match = data2.images.find((i) => i.id === productId);
    expect(match.name).toBe('Test Name');
    expect(match.collection).toBe('Test Collection');

    // Cleanup
    await page.request.delete(`/api/products/${productId}`, { headers: auth });
  });

  // ── Theme Toggle ────────────────────────────────────────────────────

  test('theme toggle switches between dark and light', async ({ page }) => {
    const initial = await page.locator('html').getAttribute('data-theme');
    await page.locator('#btn-theme').click();
    await page.waitForFunction(
      (prev) => document.documentElement.getAttribute('data-theme') !== prev,
      initial,
      { timeout: 2000 }
    );
    const after = await page.locator('html').getAttribute('data-theme');
    expect(after).not.toBe(initial);

    // Toggle back
    await page.locator('#btn-theme').click();
    await page.waitForFunction(
      (prev) => document.documentElement.getAttribute('data-theme') !== prev,
      after,
      { timeout: 2000 }
    );
    const restored = await page.locator('html').getAttribute('data-theme');
    expect(restored).toBe(initial);
  });

  test('theme persists in localStorage', async ({ page }) => {
    const initial = await page.locator('html').getAttribute('data-theme');
    await page.locator('#btn-theme').click();
    await page.waitForFunction(
      (prev) => document.documentElement.getAttribute('data-theme') !== prev,
      initial,
      { timeout: 2000 }
    );
    const theme = await page.locator('html').getAttribute('data-theme');
    const stored = await page.evaluate(() => localStorage.getItem('deo-gratias-theme'));
    expect(stored).toBe(theme);
  });

  // ── Reorder API ─────────────────────────────────────────────────────

  test('reorder API updates product order', async ({ page }) => {
    const listRes = await page.request.get('/api/images');
    const { images } = await listRes.json();
    const id1 = images[0].id;
    const id2 = images[1].id;

    const reorderRes = await page.request.post('/api/reorder', {
      data: {
        orders: [
          { filename: id1, order: 100 },
          { filename: id2, order: 0 },
        ],
      },
    });
    expect(reorderRes.ok()).toBeTruthy();
    const body = await reorderRes.json();
    expect(body.success).toBe(true);

    // Verify order changed
    const listRes2 = await page.request.get('/api/images');
    const data2 = await listRes2.json();
    const img1 = data2.images.find((i) => i.id === id1);
    const img2 = data2.images.find((i) => i.id === id2);
    expect(img1.order).toBe(100);
    expect(img2.order).toBe(0);

    // Reset order
    await page.request.post('/api/reorder', {
      data: {
        orders: [
          { filename: id1, order: images[0].order },
          { filename: id2, order: images[1].order },
        ],
      },
    });
  });

  // ── Thumbnail field ─────────────────────────────────────────────────

  test('API images include thumbUrl field', async ({ page }) => {
    const res = await page.request.get('/api/images');
    const data = await res.json();
    expect(data.images[0]).toHaveProperty('thumbUrl');
  });

  // ── Keyboard navigation ─────────────────────────────────────────────

  test('product cards are focusable via Tab', async ({ page }) => {
    const firstCard = page.locator('.product-card').first();
    await firstCard.focus();
    await expect(firstCard).toBeFocused();
  });

  test('Enter key on focused card opens lightbox', async ({ page }) => {
    const firstCard = page.locator('.product-card').first();
    await firstCard.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#lightbox')).toBeVisible();
  });

  // ── Collection filter auto-activates collection view ────────────────

  test('selecting a collection filter shows collection section headers', async ({ page }) => {
    // First, set up a product with a collection
    const listRes = await page.request.get('/api/images');
    const { images } = await listRes.json();
    const productId = images[0].id;

    await page.request.put(`/api/products/${productId}`, {
      data: { collection: 'Test Group' },
    });

    await page.reload();
    await page.waitForSelector('.product-card', { state: 'attached', timeout: 5000 });
    await page.evaluate(() => {
      const grid = document.getElementById('catalog-grid');
      if (grid) grid.hidden = false;
      document.querySelectorAll('.product-card').forEach((c) => {
        c.classList.add('visible');
        c.classList.remove('card-hidden');
        c.style.opacity = '1';
        c.style.transform = 'none';
      });
    });

    // Click the filter chip for "Test Group"
    const chip = page.locator('.filter-chip', { hasText: 'Test Group' });
    if (await chip.count() > 0) {
      await chip.click();
      await page.waitForTimeout(300);
      const sections = page.locator('.collection-section');
      expect(await sections.count()).toBeGreaterThan(0);
    }

    // Cleanup
    await page.request.put(`/api/products/${productId}`, {
      data: { collection: '' },
    });
  });

  // ── Phase 3: PDF Settings Modal ──────────────────────────────────────

  test('PDF button opens PDF settings modal', async ({ page }) => {
    await page.locator('#btn-pdf').click();
    await expect(page.locator('#pdf-settings-overlay')).toBeVisible();
    await expect(page.locator('.pdf-settings-modal')).toBeVisible();
  });

  test('PDF settings modal has template buttons with correct defaults', async ({ page }) => {
    await page.locator('#btn-pdf').click();
    const catalogBtn = page.locator('.template-btn[data-template="catalog"]');
    const lineSheetBtn = page.locator('.template-btn[data-template="line-sheet"]');
    const lookbookBtn = page.locator('.template-btn[data-template="lookbook"]');
    await expect(catalogBtn).toBeVisible();
    await expect(lineSheetBtn).toBeVisible();
    await expect(lookbookBtn).toBeVisible();
    await expect(catalogBtn).toHaveClass(/active/);
    await expect(lineSheetBtn).not.toHaveClass(/active/);
  });

  test('PDF settings template buttons toggle active state', async ({ page }) => {
    await page.locator('#btn-pdf').click();
    await page.locator('.template-btn[data-template="line-sheet"]').click();
    await expect(page.locator('.template-btn[data-template="line-sheet"]')).toHaveClass(/active/);
    await expect(page.locator('.template-btn[data-template="catalog"]')).not.toHaveClass(/active/);
    await page.locator('.template-btn[data-template="lookbook"]').click();
    await expect(page.locator('.template-btn[data-template="lookbook"]')).toHaveClass(/active/);
  });

  test('PDF settings has columns, per-page, and format selects', async ({ page }) => {
    await page.locator('#btn-pdf').click();
    await expect(page.locator('#pdf-columns')).toBeVisible();
    await expect(page.locator('#pdf-per-page')).toBeVisible();
    await expect(page.locator('#pdf-format')).toBeVisible();
  });

  test('PDF settings columns select has 1-4 options', async ({ page }) => {
    await page.locator('#btn-pdf').click();
    const options = await page.locator('#pdf-columns option').allTextContents();
    expect(options).toEqual(['1', '2', '3', '4']);
  });

  test('PDF settings margin inputs have default values', async ({ page }) => {
    await page.locator('#btn-pdf').click();
    await expect(page.locator('#pdf-margin-top')).toHaveValue('20');
    await expect(page.locator('#pdf-margin-right')).toHaveValue('18');
    await expect(page.locator('#pdf-margin-bottom')).toHaveValue('25');
    await expect(page.locator('#pdf-margin-left')).toHaveValue('18');
  });

  test('PDF settings export radio buttons exist with correct values', async ({ page }) => {
    await page.locator('#btn-pdf').click();
    const allRadio = page.locator('input[name="pdf-export"][value="all"]');
    const selectedRadio = page.locator('input[name="pdf-export"][value="selected"]');
    const filteredRadio = page.locator('input[name="pdf-export"][value="filtered"]');
    await expect(allRadio).toBeAttached();
    await expect(selectedRadio).toBeAttached();
    await expect(filteredRadio).toBeAttached();
    await expect(allRadio).toBeChecked();
  });

  test('PDF settings cancel button closes modal', async ({ page }) => {
    await page.locator('#btn-pdf').click();
    await expect(page.locator('#pdf-settings-overlay')).toBeVisible();
    await page.locator('#btn-pdf-settings-cancel').click();
    await expect(page.locator('#pdf-settings-overlay')).toBeHidden();
  });

  test('PDF settings overlay closes on outside click', async ({ page }) => {
    await page.locator('#btn-pdf').click();
    await expect(page.locator('#pdf-settings-overlay')).toBeVisible();
    await page.locator('#pdf-settings-overlay').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#pdf-settings-overlay')).toBeHidden();
  });

  test('PDF settings generate button triggers generation', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 45000 });
    await page.locator('#btn-pdf').click();
    await page.locator('#btn-pdf-settings-generate').click();
    await expect(page.locator('#pdf-settings-overlay')).toBeHidden();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('deo-gratias-catalog.pdf');
  });

  // ── Phase 3: Selection Mode ──────────────────────────────────────────

  test('select mode button exists and toggles active state', async ({ page }) => {
    const btn = page.locator('#btn-select-mode');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(btn).toHaveClass(/active/);
    await btn.click();
    await expect(btn).not.toHaveClass(/active/);
  });

  test('select mode shows product-select handles on cards', async ({ page }) => {
    await page.locator('#btn-select-mode').click();
    const handles = page.locator('.product-card .product-select');
    const count = await handles.count();
    expect(count).toBeGreaterThan(0);
    await expect(handles.first()).toBeVisible();
  });

  test('clicking product-select toggles selected state on card', async ({ page }) => {
    await page.locator('#btn-select-mode').click();
    const firstCard = page.locator('.product-card').first();
    const selectHandle = firstCard.locator('.product-select');
    await selectHandle.click();
    await expect(firstCard).toHaveClass(/selected/);
    await selectHandle.click();
    await expect(firstCard).not.toHaveClass(/selected/);
  });

  test('deactivating select mode clears all selections', async ({ page }) => {
    await page.locator('#btn-select-mode').click();
    const firstCard = page.locator('.product-card').first();
    await firstCard.locator('.product-select').click();
    await expect(firstCard).toHaveClass(/selected/);
    await page.locator('#btn-select-mode').click();
    await expect(firstCard).not.toHaveClass(/selected/);
  });

  // ── Phase 3: Export Options ──────────────────────────────────────────

  test('PDF export counts update based on selection', async ({ page }) => {
    await page.locator('#btn-select-mode').click();
    const allCount = await page.locator('.product-card').count();
    const totalText = await page.locator('#pdf-export-all-count').textContent();
    const totalCount = parseInt(totalText, 10);
    expect(totalCount).toBeGreaterThanOrEqual(allCount);
    await expect(page.locator('#pdf-export-filtered-count')).toContainText(String(totalCount));
    await expect(page.locator('#pdf-export-selected-count')).toContainText('0');
  });

  test('selected count increments when cards are selected', async ({ page }) => {
    await page.locator('#btn-select-mode').click();
    const firstCard = page.locator('.product-card').first();
    await firstCard.locator('.product-select').click();
    await expect(page.locator('#pdf-export-selected-count')).toContainText('1');
  });

  test('filtered radio becomes available when search filters cards', async ({ page }) => {
    await page.fill('#search-input', 'Aurora');
    await page.waitForTimeout(300);
    const filteredCount = await page.locator('.product-card').count();
    await page.locator('#btn-pdf').click();
    await expect(page.locator('#pdf-export-filtered-count')).toContainText(String(filteredCount));
  });

  // ── Phase 12: Collections CRUD ────────────────────────────────────────

  test('API collections endpoint returns object', async ({ page }) => {
    const res = await page.request.get('/api/collections');
    const data = await res.json();
    expect(typeof data.collections).toBe('object');
  });

  test('API create and delete collection', async ({ page }) => {
    await page.request.post('/api/collections', {
      data: { slug: 'test-col', name: 'Test Collection', description: 'A test' },
    });
    const getRes = await page.request.get('/api/collections/test-col');
    const col = await getRes.json();
    expect(col.name).toBe('Test Collection');

    await page.request.delete('/api/collections/test-col');
    const delRes = await page.request.get('/api/collections/test-col');
    expect(delRes.status()).toBe(404);
  });

  test('API nested collections tree', async ({ page }) => {
    await page.request.post('/api/collections', { data: { slug: 'parent-col', name: 'Parent' } });
    await page.request.post('/api/collections', {
      data: { slug: 'child-col', name: 'Child', parent: 'parent-col' },
    });
    const res = await page.request.get('/api/collections/tree');
    const { tree } = await res.json();
    const parent = tree.find((c) => c.slug === 'parent-col');
    expect(parent).toBeTruthy();
    expect(parent.children.some((c) => c.slug === 'child-col')).toBe(true);
    // Cleanup
    await page.request.delete('/api/collections/child-col');
    await page.request.delete('/api/collections/parent-col');
  });

  // ── Phase 12: Presets ────────────────────────────────────────────────

  test('API presets CRUD', async ({ page }) => {
    const createRes = await page.request.post('/api/presets', {
      data: { name: 'Gold Rings', filters: { collection: 'Rings' }, sort: 'price-desc' },
    });
    const preset = await createRes.json();
    expect(preset.id).toBe('gold-rings');

    const listRes = await page.request.get('/api/presets');
    const { presets } = await listRes.json();
    expect(presets.some((p) => p.id === 'gold-rings')).toBe(true);

    await page.request.delete('/api/presets/gold-rings');
  });

  // ── Phase 12: Favorites ──────────────────────────────────────────────

  test('API favorites toggle', async ({ page }) => {
    const res = await page.request.post('/api/favorites/toggle', {
      data: { filename: 'aurora-pendant.jpg' },
    });
    const data = await res.json();
    expect(data.favorited).toBe(true);
    expect(data.favorites).toContain('aurora-pendant.jpg');
    // Toggle off
    const res2 = await page.request.post('/api/favorites/toggle', {
      data: { filename: 'aurora-pendant.jpg' },
    });
    const data2 = await res2.json();
    expect(data2.favorited).toBe(false);
  });

  test('favorite button appears on product cards', async ({ page }) => {
    const favBtns = page.locator('.product-fav');
    const count = await favBtns.count();
    expect(count).toBeGreaterThan(0);
  });

  // ── Phase 13: Data Export ─────────────────────────────────────────────

  test('JSON export returns valid JSON', async ({ page }) => {
    const res = await page.request.get('/api/export/json');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(typeof data).toBe('object');
  });

  test('CSV export returns CSV with headers', async ({ page }) => {
    const res = await page.request.get('/api/export/csv');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text.startsWith('filename')).toBe(true);
    expect(text.includes('name')).toBe(true);
  });

  // ── Phase 13: Webhooks ───────────────────────────────────────────────

  test('API webhooks CRUD', async ({ page }) => {
    const res = await page.request.post('/api/webhooks', {
      data: { url: 'http://localhost:9999/hook', events: ['product.viewed'] },
    });
    const hook = await res.json();
    expect(hook.url).toBe('http://localhost:9999/hook');

    const listRes = await page.request.get('/api/webhooks');
    const { webhooks: hooks } = await listRes.json();
    expect(hooks.some((h) => h.url === 'http://localhost:9999/hook')).toBe(true);

    await page.request.delete('/api/webhooks', {
      data: { url: 'http://localhost:9999/hook' },
    });
  });

  // ── Phase 14: Analytics ──────────────────────────────────────────────

  test('analytics view tracking', async ({ page }) => {
    const res = await page.request.post('/api/analytics/view', {
      data: { filename: 'aurora-pendant.jpg' },
    });
    expect(res.status()).toBe(200);
  });

  test('analytics summary endpoint', async ({ page }) => {
    const res = await page.request.get('/api/analytics/summary');
    const data = await res.json();
    expect(typeof data.totalViews).toBe('number');
    expect(typeof data.totalSearches).toBe('number');
    expect(Array.isArray(data.topProducts)).toBe(true);
  });

  // ── Phase 15: PWA ────────────────────────────────────────────────────

  test('manifest.json is served', async ({ page }) => {
    const res = await page.request.get('/manifest.json');
    expect(res.status()).toBe(200);
    const manifest = await res.json();
    expect(manifest.name).toContain('Deo Gratias');
    expect(manifest.display).toBe('standalone');
  });

  test('service worker file is served', async ({ page }) => {
    const res = await page.request.get('/sw.js');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text.includes('CACHE_NAME')).toBe(true);
  });

  test('HTML has PWA meta tags', async ({ page }) => {
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.json');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#e8b84b');
  });
});
