const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'data', 'webhooks.json');

function ensureDataDir() {
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readConfig() {
  ensureDataDir();
  if (!fs.existsSync(CONFIG_FILE)) return { urls: [], events: [] };
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return { urls: [], events: [] };
  }
}

function writeConfig(data) {
  ensureDataDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function register(url, events = ['*']) {
  const config = readConfig();
  if (config.urls.includes(url)) return { error: 'Webhook already registered' };
  config.urls.push(url);
  config.events.push(events);
  writeConfig(config);
  return { url, events };
}

function unregister(url) {
  const config = readConfig();
  const idx = config.urls.indexOf(url);
  if (idx === -1) return false;
  config.urls.splice(idx, 1);
  config.events.splice(idx, 1);
  writeConfig(config);
  return true;
}

function list() {
  const config = readConfig();
  return config.urls.map((url, i) => ({ url, events: config.events[i] }));
}

async function fire(event, payload) {
  const config = readConfig();
  const results = [];
  for (let i = 0; i < config.urls.length; i++) {
    const url = config.urls[i];
    const events = config.events[i];
    if (!events.includes('*') && !events.includes(event)) continue;
    try {
      const parsed = new URL(url);
      const mod = parsed.protocol === 'https:' ? https : http;
      const body = JSON.stringify({ event, payload, ts: new Date().toISOString() });
      await new Promise((resolve, reject) => {
        const req = mod.request(
          parsed,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body),
            },
          },
          (res) => {
            res.resume();
            resolve(res.statusCode);
          }
        );
        req.on('error', reject);
        req.write(body);
        req.end();
      });
      results.push({ url, status: 'sent' });
    } catch {
      results.push({ url, status: 'failed' });
    }
  }
  return results;
}

module.exports = { register, unregister, list, fire };
