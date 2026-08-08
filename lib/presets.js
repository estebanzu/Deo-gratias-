const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'presets.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readAll() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeAll(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function list() {
  return readAll();
}

function get(id) {
  return readAll().find((p) => p.id === id) || null;
}

function create(preset) {
  const all = readAll();
  const id = preset.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const entry = {
    id,
    name: preset.name,
    filters: preset.filters || {},
    sort: preset.sort || 'name-asc',
    view: preset.view || 'grid',
    createdAt: new Date().toISOString(),
  };
  all.push(entry);
  writeAll(all);
  return entry;
}

function remove(id) {
  const all = readAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  writeAll(all);
  return true;
}

module.exports = { list, get, create, remove };
