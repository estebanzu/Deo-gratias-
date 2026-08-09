const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('./config');
const { generatePDF } = require('./lib/pdf-generator');
const metadata = require('./lib/metadata');
const { getThumbUrl } = require('./lib/thumbnails');
const cloudinaryApi = require('./lib/cloudinary');
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

// Extract base product name from filename (e.g., "rosario_cristal_01" -> "rosario_cristal")
function getBaseProductName(filename) {
  const name = path.basename(filename, path.extname(filename));
  // Remove trailing numbers/underscores like _01, _02, _1, _2, _a, _b
  const base = name.replace(/[-_]([a-z]|\d{1,3})$/i, '');
  return base || name;
}

async function getCachedImages() {
  const now = Date.now();
  if (imageCache.data && now - imageCache.ts < CACHE_TTL) {
    return imageCache.data;
  }

  const allMeta = metadata.readAll();

  let resources;
  try {
    resources = await cloudinaryApi.listImages();
  } catch (err) {
    console.error('Cloudinary list error:', err.message);
    return { images: [], total: 0 };
  }

  // Build individual images
  const allImages = resources
    .map((res) => {
      const filename = cloudinaryApi.filenameFromPublicId(res.public_id, res.format);
      const ext = path.extname(filename).toLowerCase();
      const defaultName = path
        .basename(filename, ext)
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const meta = allMeta[filename] || {};

      return {
        filename,
        name: meta.name || defaultName,
        description: meta.description || '',
        price: meta.price || '',
        category: meta.category || '',
        collection: meta.collection || '',
        material: meta.material || '',
        gemstone: meta.gemstone || '',
        order: meta.order ?? 9999,
        url: cloudinaryApi.fullUrl(filename),
        thumbUrl: getThumbUrl(filename),
        ext,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Group images by base product name
  const grouped = {};
  allImages.forEach((img) => {
    const baseName = getBaseProductName(img.filename);
    if (!grouped[baseName]) {
      grouped[baseName] = {
        id: baseName,
        name: img.name.replace(/[-_]\d+$/, '').replace(/\b\w/g, (c) => c.toUpperCase()),
        description: '',
        price: '',
        category: '',
        collection: '',
        material: '',
        gemstone: '',
        order: img.order,
        images: [],
        url: img.url,
        thumbUrl: img.thumbUrl,
      };
    }
    // Use metadata from first image or from specific image metadata
    const g = grouped[baseName];
    if (img.description) g.description = img.description;
    if (img.price) g.price = img.price;
    if (img.category) g.category = img.category;
    if (img.collection) g.collection = img.collection;
    if (img.material) g.material = img.material;
    if (img.gemstone) g.gemstone = img.gemstone;
    if (img.order < g.order) g.order = img.order;

    g.images.push({
      filename: img.filename,
      url: img.url,
      thumbUrl: img.thumbUrl,
    });
  });

  // Check for metadata override on the group itself
  Object.values(grouped).forEach((product) => {
    const groupMeta = allMeta[product.id] || {};
    if (groupMeta.name) product.name = groupMeta.name;
    if (groupMeta.description) product.description = groupMeta.description;
    if (groupMeta.price) product.price = groupMeta.price;
    if (groupMeta.category) product.category = groupMeta.category;
    if (groupMeta.collection) product.collection = groupMeta.collection;
    if (groupMeta.material) product.material = groupMeta.material;
    if (groupMeta.gemstone) product.gemstone = groupMeta.gemstone;
    if (groupMeta.order !== undefined) product.order = groupMeta.order;
  });

  const images = Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  const result = { images, total: images.length };
  imageCache = { data: result, ts: now };
  return result;
}

// ── Static files with caching headers ───────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
app.use('/output', express.static(path.join(__dirname, config.pdf.outputDir), { maxAge: '1h' }));

app.use(express.json());
app.use(require('cookie-parser')());

// ── Admin Auth Middleware ────────────────────────────────────────────────────
// ── Auth & User Management �nconst bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const users = require('./lib/users');

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});

// JWT verification middleware
function verifyToken(req, res, next) {
  const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Role-based access middleware
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Replace legacy adminAuth with JWT based auth for protected routes
function adminAuth(req, res, next) {
  // admin only via JWT role check
  return requireRole('admin')(req, res, next);
}

// ── Static Pages ────────────────────────────────────────────────────────────
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/nosotros', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'nosotros.html'));
});

// ── Product Detail Page ──────────────────────────────────────────────────────
app.get('/producto/:filename', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'producto.html'));
});

// ── API: List available images with metadata ─────────────────────────────────
app.get('/api/images', async (req, res) => {
  const result = await getCachedImages();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const total = result.images.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const images = result.images.slice(start, start + limit);

  res.json({
    images,
    total,
    page,
    totalPages,
    limit,
    hasMore: page < totalPages,
  });
});

// ── API: Get single product metadata ─────────────────────────────────────────
app.get('/api/products/:filename', (req, res) => {
  const meta = metadata.get(req.params.filename);
  if (!meta) return res.status(404).json({ error: 'Product not found' });
  res.json(meta);
});

// ── API: Update product metadata ─────────────────────────────────────────────
app.put('/api/products/:filename', verifyToken, requireRole('admin', 'editor'), async (req, res) => {
  const { filename } = req.params;
  const exists = await cloudinaryApi.imageExists(filename);
  if (!exists) {
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

// ── Bulk edit ────────────────────────────────────────────────────────
app.post('/api/bulk-edit', verifyToken, requireRole('admin', 'editor'), async (req, res) => {
  const { updates } = req.body; // [{filename, fields: {...}}]
  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'updates must be an array' });
  }
  const results = [];
  for (const upd of updates) {
    const { filename, fields } = upd;
    if (!filename || typeof fields !== 'object') continue;
    const saved = metadata.upsert(filename, fields);
    results.push({ filename, saved });
  }
  invalidateCache();
  res.json({ results });
});

// ── Reorder persistence ────────────────────────────────────────────────
app.post('/api/reorder', verifyToken, requireRole('admin', 'editor'), (req, res) => {
  const { orderedIds } = req.body; // array of product IDs in new order
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds must be an array' });
  }
  orderedIds.forEach((id, idx) => {
    metadata.upsert(id, { order: idx });
  });
  invalidateCache();
  res.json({ success: true });
});

// ── API: Batch reorder ──────────────────────────────────────────────────────
// Removed duplicate unprotected reorder endpoint; protected version retained above

// ── API: Delete product metadata ─────────────────────────────────────────────
app.delete('/api/products/:filename', verifyToken, requireRole('admin'), (req, res) => {
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

  try {
    const result = await cloudinaryApi.uploadImage(req.file.path, safeName);

    // Clean up temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch {}

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
        url: result.secure_url,
        thumbUrl: getThumbUrl(safeName),
        ext,
      },
    });
  } catch (err) {
    try {
      fs.unlinkSync(req.file.path);
    } catch {}
    console.error('Cloudinary upload error:', err.message);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// ── API: Delete image ────────────────────────────────────────────────────────
app.delete('/api/images/:filename', async (req, res) => {
  const exists = await cloudinaryApi.imageExists(req.params.filename);
  if (!exists) {
    return res.status(404).json({ error: 'Image not found' });
  }

  try {
    await cloudinaryApi.deleteImage(req.params.filename);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete image' });
  }

  metadata.remove(req.params.filename);
  invalidateCache();
  res.json({ success: true });
});

// ── API: Generate PDF ────────────────────────────────────────────────────────
app.post('/api/generate-pdf', async (req, res) => {
  try {
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

    let resources;
    try {
      resources = await cloudinaryApi.listImages();
    } catch (err) {
      return res.status(400).json({ error: 'Failed to fetch images from Cloudinary' });
    }

    let files = resources.map((res) =>
      cloudinaryApi.filenameFromPublicId(res.public_id, res.format)
    );

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
          url: cloudinaryApi.fullUrl(file),
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

// ── API: Collections ────────────────────────────────────────────────────────
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

app.post('/api/collections', verifyToken, requireRole('admin'), (req, res) => {
  const { name, description, coverImage, parent, order } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const result = collections.create(slug, { name, description, coverImage, parent, order });
  if (result.error) return res.status(409).json(result);
  res.status(201).json(result);
});

app.put('/api/collections/:slug', verifyToken, requireRole('admin'), (req, res) => {
  const result = collections.update(req.params.slug, req.body);
  if (!result) return res.status(404).json({ error: 'Collection not found' });
  res.json(result);
});

app.delete('/api/collections/:slug', verifyToken, requireRole('admin'), (req, res) => {
  const ok = collections.remove(req.params.slug);
  if (!ok) return res.status(404).json({ error: 'Collection not found' });
  res.json({ success: true });
});

// ── API: Admin Login ────────────────────────────────────────────────────────
// ── User Registration & Login (JWT) �napp.post('/api/register', authLimiter, async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const existing = await users.findByEmail(email);
  if (existing) return res.status(409).json({ error: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const newUser = await users.create({ email, password: hashed, role: role || 'viewer' });
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, config.jwtSecret, { expiresIn: '1h' });
  res
    .cookie('jwt', token, { httpOnly: true, sameSite: 'strict' })
    .json({ success: true, user: { email: newUser.email, role: newUser.role } });
});

app.post('/api/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await users.findByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
  res
    .cookie('jwt', token, { httpOnly: true, sameSite: 'strict' })
    .json({ success: true, user: { email: user.email, role: user.role } });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('jwt').json({ success: true });
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
// Export the Express app for serverless platforms (e.g., Vercel)
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`  Deo Gratias Catalog started  -> http://localhost:${PORT}`));
}


