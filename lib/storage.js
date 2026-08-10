const fs = require('fs');
const path = require('path');

const IS_VERCEL = !!process.env.VERCEL;
const PROJ_ROOT = path.join(__dirname, '..');

function dataDir() {
  return IS_VERCEL ? path.join('/tmp', 'data') : path.join(PROJ_ROOT, 'data');
}

function outputDir() {
  return IS_VERCEL ? path.join('/tmp', 'output') : path.join(PROJ_ROOT, 'output');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function dataFile(name) {
  const d = dataDir();
  ensureDir(d);
  // On first write in /tmp, copy original file if it doesn't exist yet
  const filePath = path.join(d, name);
  if (IS_VERCEL && !fs.existsSync(filePath)) {
    const orig = path.join(PROJ_ROOT, 'data', name);
    if (fs.existsSync(orig)) {
      fs.copyFileSync(orig, filePath);
    } else {
      fs.writeFileSync(filePath, '[]', 'utf8');
    }
  }
  return filePath;
}

function readFile(name, fallback) {
  const fp = dataFile(name);
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeFile(name, data) {
  const fp = dataFile(name);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { IS_VERCEL, dataDir, outputDir, ensureDir, dataFile, readFile, writeFile };
