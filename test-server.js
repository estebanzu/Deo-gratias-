const express = require('express');
const collections = require('./lib/collections');
const app = express();
app.use(express.json());
app.get('/test', (_req, res) => res.json({ ok: true }));
app.get('/api/collections', (_req, res) => res.json({ collections: collections.list() }));
app.listen(3099, () => console.log('listening on 3099'));
