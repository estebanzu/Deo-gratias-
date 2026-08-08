const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('./config');
const { generatePDF } = require('./lib/pdf-generator');
const metadata = require('./lib/metadata');
const { ensureThumb, thumbExists, getThumbUrl, getThumbDir } = require('./lib/thumbnails');
const collections = require('./lib/collections');
const presets = require('./lib/presets');
const favorites = require('./lib/favorites');
const analytics = require('./lib/analytics');
const webhooks = require('./lib/webhooks');

const app = express();
const PORT = config.port;

const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: config.maxImageSize },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.supportedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

// ── In-memory cache for image list ──────────────────────────────────────────
let imageCache = { data: null, ts: 0 };
const CACHE_TTL = 30000; // 30 seconds

function invalidateCache() {
  imageCache = { data: null, ts: 0 };
}

function getCachedImages() {
  const now = Date.now();
  if (imageCache.data && now - imageCache.ts < CACHE_TTL) {
    return imageCache.data;
  }

  const dir = path.join(__dirname, config.imagesDir);
  if (!fs.existsSync(dir)) {
    return { images: [], total: 0 };
  }

  const allMeta = metadata.readAll();

  const files = fs.readdirSync(dir).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    const supported = config.supportedExtensions.includes(ext);
    if (!supported) return false;

    try {
      const stats = fs.statSync(path.join(dir, file));
      return stats.size >= 1024 && stats.size <= config.maxImageSize;
    } catch {
      return false;
    }
  });

  const images = files
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const ext = path.extname(file).toLowerCase();
      const defaultName = path
        .basename(file, ext)
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const meta = allMeta[file] || {};
      const hasThumb = thumbExists(path.join(__dirname, config.imagesDir), file);

      return {
        filename: file,
        name: meta.name || defaultName,
        description: meta.description || '',
        price: meta.price || '',
        category: meta.category || '',
        collection: meta.collection || '',
        material: meta.material || '',
        gemstone: meta.gemstone || '',
        order: meta.order ?? 9999,
        url: `/images/${encodeURIComponent(file)}`,
        thumbUrl: hasThumb ? getThumbUrl(file) : null,
        ext,
      };
    });

  const result = { images, total: images.length };
  imageCache = { data: result, ts: now };
  return result;
}

// ── Static files with caching headers ───────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
app.use('/images', express.static(path.join(__dirname, config.imagesDir), { maxAge: '7d' }));
app.use('/output', express.static(path.join(__dirname, config.pdf.outputDir), { maxAge: '1h' }));

app.use(express.json());

// ── API: List available images with metadata ─────────────────────────────────
app.get('/api/images', (_req, res) => {
  res.json(getCachedImages());
});

// ── API: Get single product metadata ─────────────────────────────────────────
app.get('/api/products/:filename', (req, res) => {
  const meta = metadata.get(req.params.filename);
  if (!meta) return res.status(404).json({ error: 'Product not found' });
  res.json(meta);
});

// ── API: Update product metadata ─────────────────────────────────────────────
app.put('/api/products/:filename', (req, res) => {
  const { filename } = req.params;
  const dir = path.join(__dirname, config.imagesDir);
  if (!fs.existsSync(path.join(dir, filename))) {
    return res.status(404).json({ error: 'Image not found' });
  }

  const allowed = [
    'name',
    'description',
    'price',
    'category',
    'collection',
    'material',
    'gemstone',
    'order',
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const saved = metadata.upsert(filename, updates);
  invalidateCache();
  res.json(saved);
});

// ── API: Batch reorder ──────────────────────────────────────────────────────
app.post('/api/reorder', (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders)) {
    return res.status(400).json({ error: 'orders must be an array' });
  }

  for (const item of orders) {
    if (item.filename && typeof item.order === 'number') {
      metadata.upsert(item.filename, { order: item.order });
    }
  }

  invalidateCache();
  res.json({ success: true });
});

// ── API: Delete product metadata ─────────────────────────────────────────────
app.delete('/api/products/:filename', (req, res) => {
  metadata.remove(req.params.filename);
  invalidateCache();
  res.json({ success: true });
});

// ── API: Upload image ────────────────────────────────────────────────────────
app.post('/api/images', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  const dest = path.join(__dirname, config.imagesDir, safeName);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(req.file.path, dest);

  // Generate thumbnail
  await ensureThumb(path.join(__dirname, config.imagesDir), safeName);

  // Save any metadata sent with the upload
  const metaUpdates = {};
  if (req.body.name) metaUpdates.name = req.body.name;
  if (req.body.category) metaUpdates.category = req.body.category;
  if (req.body.collection) metaUpdates.collection = req.body.collection;
  if (Object.keys(metaUpdates).length > 0) {
    metadata.upsert(safeName, metaUpdates);
  }

  invalidateCache();

  res.json({
    success: true,
    image: {
      filename: safeName,
      name:
        metaUpdates.name ||
        safeName.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      url: `/images/${encodeURIComponent(safeName)}`,
      thumbUrl: getThumbUrl(safeName),
      ext,
    },
  });
});

// ── API: Delete image ────────────────────────────────────────────────────────
app.delete('/api/images/:filename', (req, res) => {
  const filepath = path.join(__dirname, config.imagesDir, req.params.filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Image not found' });
  }

  fs.unlinkSync(filepath);

  // Remove thumbnail if exists
  const thumbDir = getThumbDir(path.join(__dirname, config.imagesDir));
  const base = path.basename(req.params.filename, path.extname(req.params.filename));
  const thumbPath = path.join(thumbDir, `${base}.webp`);
  if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

  metadata.remove(req.params.filename);
  invalidateCache();
  res.json({ success: true });
});

// ── API: Generate PDF ────────────────────────────────────────────────────────
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const dir = path.join(__dirname, config.imagesDir);
    if (!fs.existsSync(dir)) {
      return res.status(400).json({ error: 'Images directory not found' });
    }

    const allMeta = metadata.readAll();

    // PDF options from client
    const {
      template = 'catalog',
      columns = config.pdf.columns,
      margins = config.pdf.margins,
      format = config.pdf.format,
      productsPerPage = config.pdf.productsPerPage,
      filenames, // optional: array of filenames to include (selective export)
    } = req.body || {};

    let files = fs.readdirSync(dir).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return config.supportedExtensions.includes(ext);
    });

    // Selective export: filter to only requested filenames
    if (Array.isArray(filenames) && filenames.length > 0) {
      const set = new Set(filenames);
      files = files.filter((f) => set.has(f));
    }

    if (files.length === 0) {
      return res.status(400).json({ error: 'No images found to generate PDF' });
    }

    const images = files
      .sort((a, b) => a.localeCompare(b))
      .map((file) => {
        const ext = path.extname(file).toLowerCase();
        const meta = allMeta[file] || {};
        const defaultName = path
          .basename(file, ext)
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return {
          filename: file,
          name: meta.name || defaultName,
          description: meta.description || '',
          price: meta.price || '',
          collection: meta.collection || '',
          category: meta.category || '',
          material: meta.material || '',
          gemstone: meta.gemstone || '',
          url: path.join(__dirname, config.imagesDir, file),
        };
      });

    const slug = template !== 'catalog' ? `-${template}` : '';
    const outputPath = path.join(__dirname, config.pdf.outputDir, `deo-gratias-catalog${slug}.pdf`);
    const result = await generatePDF(images, outputPath, {
      template,
      columns: parseInt(columns, 10) || config.pdf.columns,
      margins: typeof margins === 'object' ? margins : config.pdf.margins,
      format,
      productsPerPage: parseInt(productsPerPage, 10) || config.pdf.productsPerPage,
    });

    res.json({
      success: true,
      downloadUrl: `/output/deo-gratias-catalog${slug}.pdf`,
      cached: result.cached || false,
      count: images.length,
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ── API: Collections CRUD ──────────────────────────────────────────────────
app.get('/api/collections', (_req, res) => {
  res.json({ collections: collections.list() });
});

app.get('/api/collections/tree', (_req, res) => {
  res.json({ tree: collections.getTree() });
});

app.get('/api/collections/:slug', (req, res) => {
  const col = collections.get(req.params.slug);
  if (!col) return res.status(404).json({ error: 'Collection not found' });
  res.json(col);
});

app.post('/api/collections', (req, res) => {
  const { slug, name, description, coverImage, parent, order } = req.body;
  if (!slug) return res.status(400).json({ error: 'slug is required' });
  const result = collections.create(slug, { name, description, coverImage, parent, order });
  if (result.error) return res.status(409).json(result);
  res.status(201).json(result);
});

app.put('/api/collections/:slug', (req, res) => {
  const result = collections.update(req.params.slug, req.body);
  if (!result) return res.status(404).json({ error: 'Collection not found' });
  res.json(result);
});

app.delete('/api/collections/:slug', (req, res) => {
  const ok = collections.remove(req.params.slug);
  if (!ok) return res.status(404).json({ error: 'Collection not found' });
  res.json({ success: true });
});

// ── API: Presets ───────────────────────────────────────────────────────────
app.get('/api/presets', (_req, res) => {
  res.json({ presets: presets.list() });
});

app.post('/api/presets', (req, res) => {
  const result = presets.create(req.body);
  res.status(201).json(result);
});

app.delete('/api/presets/:id', (req, res) => {
  const ok = presets.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Preset not found' });
  res.json({ success: true });
});

// ── API: Favorites ─────────────────────────────────────────────────────────
app.get('/api/favorites', (_req, res) => {
  res.json({ favorites: favorites.list() });
});

app.post('/api/favorites/toggle', (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename is required' });
  res.json(favorites.toggle(filename));
});

// ── API: Analytics ─────────────────────────────────────────────────────────
app.post('/api/analytics/view', (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename is required' });
  analytics.trackView(filename);
  webhooks.fire('product.viewed', { filename }).catch(() => {});
  res.json({ success: true });
});

app.post('/api/analytics/search', (req, res) => {
  const { query } = req.body;
  analytics.trackSearch(query);
  res.json({ success: true });
});

app.post('/api/analytics/export', (req, res) => {
  const { type, count } = req.body;
  analytics.trackExport(type, count);
  res.json({ success: true });
});

app.get('/api/analytics/summary', (_req, res) => {
  res.json(analytics.getSummary());
});

// ── API: Data Export (CSV/JSON) ────────────────────────────────────────────
app.get('/api/export/json', (_req, res) => {
  const allMeta = metadata.readAll();
  res.setHeader('Content-Disposition', 'attachment; filename="deo-gratias-products.json"');
  res.setHeader('Content-Type', 'application/json');
  res.json(allMeta);
});

app.get('/api/export/csv', (_req, res) => {
  const allMeta = metadata.readAll();
  const headers = [
    'filename',
    'name',
    'description',
    'price',
    'category',
    'collection',
    'material',
    'gemstone',
    'order',
  ];
  const rows = [headers.join(',')];
  for (const [filename, meta] of Object.entries(allMeta)) {
    const row = headers.map((h) => {
      const val = h === 'filename' ? filename : meta[h] || '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    rows.push(row.join(','));
  }
  res.setHeader('Content-Disposition', 'attachment; filename="deo-gratias-products.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.send(rows.join('\n'));
});

// ── API: Webhooks ──────────────────────────────────────────────────────────
app.get('/api/webhooks', (_req, res) => {
  res.json({ webhooks: webhooks.list() });
});

app.post('/api/webhooks', (req, res) => {
  const { url, events } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });
  const result = webhooks.register(url, events);
  if (result.error) return res.status(409).json(result);
  res.status(201).json(result);
});

app.delete('/api/webhooks', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });
  const ok = webhooks.unregister(url);
  if (!ok) return res.status(404).json({ error: 'Webhook not found' });
  res.json({ success: true });
});

// ── Multer error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message === 'Unsupported file type') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ✦ Deo Gratias Catalog running at http://localhost:${PORT}\n`);
  console.log(`  Place jewelry images in:  ./${config.imagesDir}/`);
  console.log(`  Supported formats:        ${config.supportedExtensions.join(', ')}\n`);
});
