const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'analytics.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readAll() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) return { views: {}, searches: [], exports: [] };
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { views: {}, searches: [], exports: [] };
  }
}

function writeAll(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function trackView(filename) {
  const data = readAll();
  if (!data.views[filename]) data.views[filename] = { count: 0, lastViewed: null };
  data.views[filename].count++;
  data.views[filename].lastViewed = new Date().toISOString();
  writeAll(data);
}

function trackSearch(query) {
  if (!query || query.length < 2) return;
  const data = readAll();
  data.searches.push({ query, ts: new Date().toISOString() });
  // Keep last 500 searches
  if (data.searches.length > 500) data.searches = data.searches.slice(-500);
  writeAll(data);
}

function trackExport(type, count) {
  const data = readAll();
  data.exports.push({ type, count, ts: new Date().toISOString() });
  if (data.exports.length > 200) data.exports = data.exports.slice(-200);
  writeAll(data);
}

function getTopProducts(limit = 10) {
  const data = readAll();
  return Object.entries(data.views)
    .map(([filename, v]) => ({ filename, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function getTopSearches(limit = 10) {
  const data = readAll();
  const freq = {};
  for (const s of data.searches) {
    const q = s.query.toLowerCase();
    freq[q] = (freq[q] || 0) + 1;
  }
  return Object.entries(freq)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function getExportStats() {
  const data = readAll();
  const freq = {};
  for (const e of data.exports) {
    freq[e.type] = (freq[e.type] || 0) + 1;
  }
  return freq;
}

function getSummary() {
  const data = readAll();
  const totalViews = Object.values(data.views).reduce((s, v) => s + v.count, 0);
  const uniqueProducts = Object.keys(data.views).length;
  return {
    totalViews,
    uniqueProducts,
    totalSearches: data.searches.length,
    totalExports: data.exports.length,
    topProducts: getTopProducts(5),
    topSearches: getTopSearches(5),
    exportBreakdown: getExportStats(),
  };
}

module.exports = {
  trackView,
  trackSearch,
  trackExport,
  getTopProducts,
  getTopSearches,
  getExportStats,
  getSummary,
};
