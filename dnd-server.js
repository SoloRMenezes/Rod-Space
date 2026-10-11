#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 4173;
const STATE_FILE = path.join(ROOT, '.dnd-session.json');
const EMPTY_STATE = { players: [], monsters: [], logs: [], turn: -1, bag: [], loc: 'Forest', weath: 'Sunny' };
const clients = new Set();
const networkAddresses = Object.values(os.networkInterfaces()).flat().filter(info => info && info.family === 'IPv4' && !info.internal);
const lanOrigin = networkAddresses[0] ? `http://${networkAddresses[0].address}:${PORT}` : `http://localhost:${PORT}`;

function loadState() {
  try { return { ...EMPTY_STATE, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) }; }
  catch { return structuredClone(EMPTY_STATE); }
}

let state = loadState();
let revision = 1;

function sendJson(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store' });
  res.end(body);
}

function snapshot() { return { state, revision }; }

function persistAndBroadcast() {
  revision += 1;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  const message = `event: state\ndata: ${JSON.stringify(snapshot())}\n\n`;
  for (const client of clients) client.write(message);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function safeFile(urlPath) {
  const decoded = decodeURIComponent(urlPath === '/' ? '/DND.html' : urlPath);
  const target = path.resolve(ROOT, `.${decoded}`);
  return target === ROOT || target.startsWith(`${ROOT}${path.sep}`) ? target : null;
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  try {
    if (req.method === 'GET' && url.pathname === '/api/dnd/state') return sendJson(res, 200, snapshot());
    if (req.method === 'GET' && url.pathname === '/api/dnd/info') return sendJson(res, 200, { lanOrigin });

    if (req.method === 'GET' && url.pathname === '/api/dnd/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write(`event: state\ndata: ${JSON.stringify(snapshot())}\n\n`);
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    if (req.method === 'PUT' && url.pathname === '/api/dnd/state') {
      const body = await readJson(req);
      if (!body || !Array.isArray(body.players) || !Array.isArray(body.monsters)) return sendJson(res, 400, { error: 'Invalid session state' });
      state = { ...EMPTY_STATE, ...body };
      persistAndBroadcast();
      return sendJson(res, 200, snapshot());
    }

    if (req.method === 'POST' && url.pathname === '/api/dnd/join') {
      const body = await readJson(req);
      const deviceId = typeof body.deviceId === 'string' ? body.deviceId.slice(0, 100) : '';
      if (!deviceId) return sendJson(res, 400, { error: 'Missing device ID' });
      const source = body.character && typeof body.character === 'object' ? body.character : {};
      const guest = body.guest === true;
      const character = {
        characterId: guest ? 'guest' : String(source.characterId || '').slice(0, 100),
        guest,
        name: String(source.name || (guest ? 'Guest' : `Hero ${state.players.length + 1}`)).slice(0, 40),
        race: String(source.race || 'Human').slice(0, 30),
        level: Math.max(1, Number(source.level) || 1),
        invest: Array.isArray(source.invest) && source.invest.length === 6 ? source.invest.map(value => Math.max(1, Number(value) || 1)) : [1, 1, 1, 1, 1, 1],
        currentHP: Math.max(0, Number(source.currentHP) || 26),
        inventory: Array.isArray(source.inventory) ? source.inventory.slice(0, 100).map(item => String(item).slice(0, 80)) : [],
        conds: Array.isArray(source.conds) ? source.conds.slice(0, 20).map(String) : []
      };
      let player = state.players.find(item => item.clientId === deviceId);
      if (!player) {
        player = { id: Date.now(), clientId: deviceId, ...character };
        state.players.push(player);
      } else Object.assign(player, character);
      persistAndBroadcast();
      return sendJson(res, 200, { player, ...snapshot() });
    }

    const playerMatch = url.pathname.match(/^\/api\/dnd\/players\/(\d+)$/);
    if (req.method === 'PATCH' && playerMatch) {
      const id = Number(playerMatch[1]);
      const player = state.players.find(item => Number(item.id) === id);
      if (!player) return sendJson(res, 404, { error: 'Player not found' });
      const patch = await readJson(req);
      const allowed = ['name', 'race', 'level', 'invest', 'currentHP', 'inventory'];
      for (const key of allowed) if (Object.hasOwn(patch, key)) player[key] = patch[key];
      persistAndBroadcast();
      return sendJson(res, 200, snapshot());
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Method not allowed' });
    const file = safeFile(url.pathname);
    if (!file) return sendJson(res, 403, { error: 'Forbidden' });
    fs.stat(file, (error, stats) => {
      if (error || !stats.isFile()) return sendJson(res, 404, { error: 'Not found' });
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).pipe(res);
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\nD&D LAN session is ready:');
  console.log(`  This computer: http://localhost:${PORT}`);
  for (const info of networkAddresses) console.log(`  Phones / iPad: http://${info.address}:${PORT}`);
  console.log('\nKeep this window open while playing. Press Ctrl+C to stop.\n');
});
