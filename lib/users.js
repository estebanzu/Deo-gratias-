// lib/users.js – simple in‑memory JSON storage for demonstration
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'users.json');

function readAll() {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeAll(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
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
  // placeholder for future updates
};
