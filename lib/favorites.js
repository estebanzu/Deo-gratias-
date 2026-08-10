const { readFile, writeFile } = require('./storage');

const FILE = 'favorites.json';

function readAll() {
  return readFile(FILE, []);
}

function writeAll(data) {
  writeFile(FILE, data);
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
