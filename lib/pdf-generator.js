let _puppeteer;
function getPuppeteer() {
  if (!_puppeteer) _puppeteer = require('puppeteer');
  return _puppeteer;
}
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config');

function fontToBase64() {
  const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'LeJourSerif-Regular.ttf');
  const buf = fs.readFileSync(fontPath);
  return buf.toString('base64');
}

function toDataURL(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    }[ext] || 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function hashImages(images) {
  const payload = images.map((i) => i.filename + '|' + i.name + '|' + i.price).join('\n');
  return crypto.createHash('md5').update(payload).digest('hex');
}

// ── Template: Catalog (default) ─────────────────────────────────────────────
function catalogTemplate(images, opts, _colors, _brand) {
  const perPage = opts.productsPerPage || 4;
  const cols = opts.columns || 2;
  const pages = [];
  for (let i = 0; i < images.length; i += perPage) {
    pages.push(images.slice(i, i + perPage));
  }

  const pageCards = pages
    .map((page, pageIdx) => {
      const cards = page
        .map((img) => {
          const imgSrc = toDataURL(img.url);
          const metaParts = [];
          if (img.collection) metaParts.push(`<span class="meta-tag">${img.collection}</span>`);
          if (img.category) metaParts.push(`<span class="meta-tag">${img.category}</span>`);
          if (img.price) metaParts.push(`<span class="meta-price">${img.price}</span>`);
          const metaHTML = metaParts.length
            ? `<div class="product-meta">${metaParts.join('')}</div>`
            : '';
          const descHTML = img.description ? `<p class="product-desc">${img.description}</p>` : '';
          return `
          <div class="product-card">
            <div class="product-image-wrap">
              <img src="${imgSrc}" alt="${img.name}" />
            </div>
            <div class="product-info">
              <h2 class="product-name">${img.name}</h2>
              <div class="product-divider"></div>
              ${descHTML}
              ${metaHTML}
            </div>
          </div>`;
        })
        .join('\n');

      return `
      <div class="pdf-page">
        <div class="product-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
          ${cards}
        </div>
        <div class="pdf-page-number">${pageIdx + 1} / ${pages.length}</div>
      </div>`;
    })
    .join('\n');

  return { pageCards, totalPages: pages.length };
}

// ── Template: Line Sheet ────────────────────────────────────────────────────
function lineSheetTemplate(images, opts) {
  const perPage = opts.productsPerPage || 8;
  const pages = [];
  for (let i = 0; i < images.length; i += perPage) {
    pages.push(images.slice(i, i + perPage));
  }

  const pageCards = pages
    .map((page, pageIdx) => {
      const rows = page
        .map((img) => {
          const imgSrc = toDataURL(img.url);
          return `
          <div class="line-row">
            <div class="line-img"><img src="${imgSrc}" alt="${img.name}" /></div>
            <div class="line-details">
              <div class="line-name">${img.name}</div>
              <div class="line-meta">${[img.collection, img.category, img.material, img.gemstone].filter(Boolean).join(' · ')}</div>
              ${img.description ? `<div class="line-desc">${img.description}</div>` : ''}
            </div>
            <div class="line-price">${img.price || '—'}</div>
          </div>`;
        })
        .join('\n');

      return `
      <div class="pdf-page">
        <div class="line-sheet">${rows}</div>
        <div class="pdf-page-number">${pageIdx + 1} / ${pages.length}</div>
      </div>`;
    })
    .join('\n');

  return { pageCards, totalPages: pages.length };
}

// ── Template: Lookbook ──────────────────────────────────────────────────────
function lookbookTemplate(images, opts) {
  const perPage = opts.productsPerPage || 2;
  const pages = [];
  for (let i = 0; i < images.length; i += perPage) {
    pages.push(images.slice(i, i + perPage));
  }

  const pageCards = pages
    .map((page, pageIdx) => {
      const cards = page
        .map((img) => {
          const imgSrc = toDataURL(img.url);
          return `
          <div class="lookbook-card">
            <div class="lookbook-image"><img src="${imgSrc}" alt="${img.name}" /></div>
            <div class="lookbook-overlay">
              <h2 class="lookbook-name">${img.name}</h2>
              ${img.description ? `<p class="lookbook-desc">${img.description}</p>` : ''}
              ${img.price ? `<span class="lookbook-price">${img.price}</span>` : ''}
            </div>
          </div>`;
        })
        .join('\n');

      return `
      <div class="pdf-page">
        <div class="lookbook-grid">${cards}</div>
        <div class="pdf-page-number">${pageIdx + 1} / ${pages.length}</div>
      </div>`;
    })
    .join('\n');

  return { pageCards, totalPages: pages.length };
}

// ── Build HTML ──────────────────────────────────────────────────────────────
function buildHTML(images, opts = {}) {
  const { colors, brand } = config;
  const margins = opts.margins || config.pdf.margins;
  const template = opts.template || 'catalog';

  let templateResult;
  if (template === 'line-sheet') {
    templateResult = lineSheetTemplate(images, opts);
  } else if (template === 'lookbook') {
    templateResult = lookbookTemplate(images, opts);
  } else {
    templateResult = catalogTemplate(images, opts, colors, brand);
  }

  const { pageCards } = templateResult;

  const fontBase64 = fontToBase64();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  @font-face {
    font-family: 'Le Jour Serif';
    font-style: normal;
    font-weight: 400;
    src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @page {
    size: ${opts.format || 'A4'} portrait;
    margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
  }

  body {
    font-family: 'Le Jour Serif', Georgia, serif;
    background: ${colors.darkNavy};
    color: ${colors.textLight};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .pdf-page {
    page-break-after: always;
    position: relative;
    min-height: 100%;
  }
  .pdf-page:last-child { page-break-after: auto; }

  .pdf-header {
    text-align: center;
    padding: 0 0 10mm 0;
    border-bottom: 0.5px solid ${colors.gold}40;
    margin-bottom: 8mm;
  }
  .pdf-header .brand {
    font-family: 'Le Jour Serif', Georgia, serif;
    font-size: 28pt;
    font-weight: 400;
    letter-spacing: 8px;
    text-transform: uppercase;
    color: ${colors.gold};
    margin-bottom: 2mm;
  }
  .pdf-header .tagline {
    font-size: 7pt;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: ${colors.textMuted};
  }

  /* ── Catalog Template ───────────────────────────── */
  .product-grid {
    display: grid;
    gap: 5mm;
  }
  .product-card {
    border-radius: 2px;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
    display: flex;
    flex-direction: column;
  }
  .product-image-wrap {
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${colors.deepNavy};
  }
  .product-image-wrap img {
    width: 100%; height: 100%; object-fit: contain; display: block;
  }
  .product-info {
    padding: 3mm 2.5mm 4mm 2.5mm;
    text-align: center;
  }
  .product-name {
    font-family: 'Le Jour Serif', Georgia, serif;
    font-size: 10pt;
    font-weight: 400;
    letter-spacing: 2px;
    color: ${colors.cream};
    margin-bottom: 1.5mm;
  }
  .product-divider {
    width: 10mm; height: 0.5px;
    background: ${colors.gold}; margin: 0 auto 2mm;
  }
  .product-desc {
    font-size: 7pt;
    line-height: 1.5;
    color: ${colors.textMuted};
    margin-bottom: 2mm;
  }
  .product-meta {
    display: flex; justify-content: center; gap: 3mm; flex-wrap: wrap;
  }
  .meta-tag {
    font-size: 6pt; letter-spacing: 1px; text-transform: uppercase;
    color: ${colors.textMuted};
  }
  .meta-price {
    font-size: 7.5pt; letter-spacing: 1px; color: ${colors.gold};
  }

  /* ── Line Sheet Template ─────────────────────────── */
  .line-sheet { display: flex; flex-direction: column; gap: 4mm; }
  .line-row {
    display: flex; align-items: center; gap: 4mm;
    padding: 3mm; border-bottom: 0.5px solid ${colors.gold}20;
    break-inside: avoid; page-break-inside: avoid;
  }
  .line-img {
    width: 28mm; height: 28mm; flex-shrink: 0;
    overflow: hidden; border-radius: 2px; background: ${colors.deepNavy};
  }
  .line-img img { width: 100%; height: 100%; object-fit: contain; }
  .line-details { flex: 1; }
  .line-name {
    font-family: 'Le Jour Serif', Georgia, serif; font-size: 10pt; letter-spacing: 1px;
    color: ${colors.cream}; margin-bottom: 1mm;
  }
  .line-meta {
    font-size: 6.5pt; letter-spacing: 1px; text-transform: uppercase;
    color: ${colors.textMuted}; margin-bottom: 1mm;
  }
  .line-desc { font-size: 7pt; color: ${colors.textMuted}; line-height: 1.4; }
  .line-price {
    font-size: 10pt; letter-spacing: 1px; color: ${colors.gold};
    white-space: nowrap; font-weight: 500;
  }

  /* ── Lookbook Template ───────────────────────────── */
  .lookbook-grid { display: grid; grid-template-columns: 1fr; gap: 4mm; }
  .lookbook-card {
    position: relative; border-radius: 3px; overflow: hidden;
    break-inside: avoid; page-break-inside: avoid;
    height: 110mm;
  }
  .lookbook-image { width: 100%; height: 100%; }
  .lookbook-image img { width: 100%; height: 100%; object-fit: cover; }
  .lookbook-overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 6mm 5mm;
    background: linear-gradient(transparent, ${colors.darkNavy}E0);
  }
  .lookbook-name {
    font-family: 'Le Jour Serif', Georgia, serif; font-size: 16pt; letter-spacing: 3px;
    color: ${colors.cream}; margin-bottom: 2mm;
  }
  .lookbook-desc { font-size: 8pt; color: ${colors.textMuted}; line-height: 1.5; margin-bottom: 2mm; }
  .lookbook-price { font-size: 11pt; color: ${colors.gold}; letter-spacing: 2px; }

  /* ── Page number ─────────────────────────────────── */
  .pdf-page-number {
    position: absolute; bottom: ${margins.bottom - 12}mm; left: 0; right: 0;
    text-align: center; font-size: 6pt; letter-spacing: 2px;
    color: ${colors.textMuted};
  }
</style>
</head>
<body>

<div class="pdf-header">
  <div class="brand">${brand.name}</div>
  <div class="tagline">${brand.tagline}</div>
</div>

${pageCards}

</body>
</html>`;
}

// ── PDF Cache ───────────────────────────────────────────────────────────────
const pdfCache = { hash: null, path: null };

function getCachedPDF(hash, outputPath) {
  if (pdfCache.hash === hash && pdfCache.path && fs.existsSync(outputPath)) {
    return true;
  }
  return false;
}

function setCachedPDF(hash, outputPath) {
  pdfCache.hash = hash;
  pdfCache.path = outputPath;
}

// ── Generate PDF ────────────────────────────────────────────────────────────
async function generatePDF(images, outputPath, opts = {}) {
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const hash = hashImages(images) + JSON.stringify(opts);
  if (getCachedPDF(hash, outputPath)) {
    return { cached: true };
  }

  const html = buildHTML(images, opts);

  const tmpFile = path.join(outDir, '.catalog-render.html');
  fs.writeFileSync(tmpFile, html, 'utf8');

  const browser = await getPuppeteer().launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('file://' + path.resolve(tmpFile), {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await page.pdf({
      path: outputPath,
      format: opts.format || config.pdf.format,
      printBackground: true,
      margin: opts.margins || config.pdf.margins,
      preferCSSPageSize: false,
    });

    setCachedPDF(hash, outputPath);
    return { cached: false };
  } finally {
    await browser.close();
    try {
      fs.unlinkSync(tmpFile);
    } catch {}
  }
}

module.exports = { generatePDF };
