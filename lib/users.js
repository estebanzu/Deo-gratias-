const { readFile, writeFile } = require('./storage');

const FILE = 'users.json';

function readAll() {
  return readFile(FILE, []);
}

function writeAll(users) {
  writeFile(FILE, users);
}

module.exports = {
  async findByEmail(email) {
    const users = readAll();
    return users.find(u => u.email === email) || null;
  },
  async create({ email, password, role }) {
    const users = readAll();
    const id = Date.now().toString();
    const newUser = { id, email, password, role };
    users.push(newUser);
    writeAll(users);
    return newUser;
  },
  async getAll() {
    return readAll();
  },
  async deleteById(id) {
    let users = readAll();
    const originalLength = users.length;
    users = users.filter(u => u.id !== id);
    if (users.length === originalLength) return false;
    writeAll(users);
    return true;
  },
};
