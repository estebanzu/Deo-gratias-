const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const THUMB_DIR = 'thumbs';
const THUMB_WIDTH = 400;
const WEBP_QUALITY = 80;

function getThumbDir(imagesDir) {
  return path.join(imagesDir, THUMB_DIR);
}

function getThumbPath(imagesDir, filename) {
  const base = path.basename(filename, path.extname(filename));
  return path.join(getThumbDir(imagesDir), `${base}.webp`);
}

function getThumbUrl(filename) {
  const base = path.basename(filename, path.extname(filename));
  return `/images/${THUMB_DIR}/${encodeURIComponent(base)}.webp`;
}

async function ensureThumb(imagesDir, filename) {
  const src = path.join(imagesDir, filename);
  const dest = getThumbPath(imagesDir, filename);

  if (fs.existsSync(dest)) return dest;

  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  try {
    await sharp(src)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(dest);
    return dest;
  } catch {
    return null;
  }
}

function thumbExists(imagesDir, filename) {
  return fs.existsSync(getThumbPath(imagesDir, filename));
}

module.exports = { ensureThumb, thumbExists, getThumbUrl, getThumbDir, THUMB_DIR };
