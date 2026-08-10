const { readFile, writeFile } = require('./storage');

const FILE = 'products.json';

function readAll() {
  return readFile(FILE, {});
}

function writeAll(data) {
  writeFile(FILE, data);
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
