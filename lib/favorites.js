const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'favorites.json');

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

function add(filename) {
  const all = readAll();
  if (!all.includes(filename)) {
    all.push(filename);
    writeAll(all);
  }
  return all;
}

function remove(filename) {
  const all = readAll();
  const idx = all.indexOf(filename);
  if (idx !== -1) {
    all.splice(idx, 1);
    writeAll(all);
  }
  return all;
}

function toggle(filename) {
  const all = readAll();
  const idx = all.indexOf(filename);
  if (idx !== -1) {
    all.splice(idx, 1);
  } else {
    all.push(filename);
  }
  writeAll(all);
  return { favorited: idx === -1, favorites: all };
}

module.exports = { list, add, remove, toggle };
