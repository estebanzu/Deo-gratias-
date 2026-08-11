const { readFile, writeFile } = require('./storage');

const FILE = 'collections.json';

function readAll() {
  return readFile(FILE, {});
}

function writeAll(data) {
  writeFile(FILE, data);
}

function list() {
  return readAll();
}

function get(slug) {
  const all = readAll();
  return all[slug] || null;
}

function create(slug, data) {
  const all = readAll();
  if (all[slug]) return { error: 'Collection already exists' };
  all[slug] = {
    slug,
    name: data.name || slug,
    description: data.description || '',
    coverImage: data.coverImage || '',
    parent: data.parent || '',
    order: data.order ?? 9999,
    createdAt: new Date().toISOString(),
  };
  writeAll(all);
  return all[slug];
}

function update(slug, data) {
  const all = readAll();
  if (!all[slug]) return null;
  const allowed = ['name', 'description', 'coverImage', 'parent', 'order'];
  for (const key of allowed) {
    if (data[key] !== undefined) all[slug][key] = data[key];
  }
  all[slug].updatedAt = new Date().toISOString();
  writeAll(all);
  return all[slug];
}

function remove(slug) {
  const all = readAll();
  if (!all[slug]) return false;
  delete all[slug];
  for (const key of Object.keys(all)) {
    if (all[key].parent === slug) all[key].parent = '';
  }
  writeAll(all);
  return true;
}

function getTree() {
  const all = readAll();
  const roots = [];
  const children = {};
  for (const col of Object.values(all)) {
    if (col.parent && all[col.parent]) {
      if (!children[col.parent]) children[col.parent] = [];
      children[col.parent].push({ ...col, children: [] });
    } else {
      roots.push({ ...col, children: [] });
    }
  }
  for (const root of roots) {
    root.children = children[root.slug] || [];
  }
  return roots.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}

module.exports = { list, get, create, update, remove, getTree };
