const { readFile, writeFile } = require('./storage');

const FILE = 'presets.json';

function readAll() {
  return readFile(FILE, []);
}

function writeAll(data) {
  writeFile(FILE, data);
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
