const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'products.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readAll() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeAll(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function get(filename) {
  const all = readAll();
  return all[filename] || null;
}

function upsert(filename, meta) {
  const all = readAll();
  all[filename] = { ...(all[filename] || {}), ...meta, filename };
  writeAll(all);
  return all[filename];
}

function remove(filename) {
  const all = readAll();
  if (all[filename]) {
    delete all[filename];
    writeAll(all);
  }
}

function list() {
  return readAll();
}

module.exports = { get, upsert, remove, list, readAll };
