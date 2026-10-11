#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 4173;
const STATE_FILE = path.join(ROOT, '.dnd-session.json');
const EMPTY_STATE = { players: [], monsters: [], logs: [], turn: -1, bag: [], loc: 'Forest', weath: 'Sunny', discovery: '' };
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

function addLog(message, type = 'norm') {
  const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.logs.unshift({ t, msg: message, type });
  state.logs = state.logs.slice(0, 150);
}

function maxHP(player) {
  const raceHealth = { Human: 1.2, Vessel: 1.1, Elf: 1.3, Orc: 1.9, Titan: 2, Fae: 1.1, Automaton: 1.7 }[player.race] || 1.2;
  return 10 + Math.round(((player.invest?.[0] || 1) * raceHealth) * 5) + ((Number(player.level) || 1) * 10);
}

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
        className: String(source.className || 'Adventurer').slice(0, 30),
        level: Math.max(1, Number(source.level) || 1),
        invest: Array.isArray(source.invest) && source.invest.length === 6 ? source.invest.map(value => Math.max(1, Number(value) || 1)) : [1, 1, 1, 1, 1, 1],
        currentHP: Math.max(0, Number(source.currentHP) || 26),
        inventory: Array.isArray(source.inventory) ? source.inventory.slice(0, 100).map(item => String(item).slice(0, 80)) : [],
        conds: Array.isArray(source.conds) ? source.conds.slice(0, 20).map(String) : [],
        chest: []
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
      const allowed = ['race', 'className', 'level', 'invest'];
      for (const key of allowed) if (Object.hasOwn(patch, key)) player[key] = patch[key];
      persistAndBroadcast();
      return sendJson(res, 200, snapshot());
    }

    if (req.method === 'POST' && url.pathname === '/api/dnd/action') {
      const body = await readJson(req);
      const player = state.players.find(item => Number(item.id) === Number(body.playerId));
      if (!player) return sendJson(res, 404, { error: 'Player not found' });
      const itemIndex = Number(body.itemIndex);
      if (body.type === 'discard' && player.inventory?.[itemIndex]) player.inventory.splice(itemIndex, 1);
      else if (body.type === 'give' && player.inventory?.[itemIndex]) {
        const target = state.players.find(item => Number(item.id) === Number(body.targetId) && Number(item.id) !== Number(player.id));
        if (!target) return sendJson(res, 400, { error: 'Choose another player' });
        target.inventory ||= [];
        target.inventory.push(player.inventory.splice(itemIndex, 1)[0]);
      } else if (body.type === 'open-chest' && Array.isArray(player.chest) && player.chest.length) {
        player.inventory ||= [];
        player.inventory.push(...player.chest);
        player.chest = [];
        addLog(`🎁 ${player.name} opened their chest.`);
      } else if (body.type === 'use' && player.inventory?.[itemIndex]) {
        const item = player.inventory[itemIndex];
        const monster = state.monsters.find(entry => Number(entry.cur) > 0);
        let used = true;
        if (item === 'Health Potion') player.currentHP = Math.min(maxHP(player), Number(player.currentHP) + 10);
        else if (item === 'Greater Healing Potion') player.currentHP = Math.min(maxHP(player), Number(player.currentHP) + 20);
        else if (item === 'Phoenix Down') player.currentHP = Number(player.currentHP) <= 0 ? Math.ceil(maxHP(player) / 2) : Number(player.currentHP);
        else if (item === 'Antidote') player.conds = (player.conds || []).filter(condition => condition !== 'Poisoned');
        else if (item === 'Regen Herb') { player.conds ||= []; if (!player.conds.includes('Regen')) player.conds.push('Regen'); }
        else if (item === 'Shield Charm') { player.conds ||= []; if (!player.conds.includes('Shield')) player.conds.push('Shield'); }
        else if (item === 'Lucky Coin') { player.conds ||= []; if (!player.conds.includes('Blessed')) player.conds.push('Blessed'); }
        else if (item === 'Bomb' && monster) monster.cur = Math.max(0, Number(monster.cur) - 12);
        else if (item === 'Fire Flask' && monster) { monster.conds ||= []; if (!monster.conds.includes('Burning')) monster.conds.push('Burning'); }
        else if (item === 'Smoke Bomb' && monster) { monster.conds ||= []; if (!monster.conds.includes('Blinded')) monster.conds.push('Blinded'); }
        else used = false;
        if (!used) return sendJson(res, 400, { error: 'That item cannot be used right now' });
        player.inventory.splice(itemIndex, 1);
        addLog(`🧪 ${player.name} used ${item}.`, 'atk');
      } else if (body.type === 'combat') {
        if (Number(player.currentHP) <= 0) return sendJson(res, 400, { error: 'Dead characters cannot act' });
        if (Number(state.players[state.turn]?.id) !== Number(player.id)) return sendJson(res, 400, { error: 'Wait for your turn' });
        if (player.acted) return sendJson(res, 400, { error: 'You already acted this turn' });
        const monster = state.monsters.find(entry => Number(entry.cur) > 0);
        if (body.move === 'defend') {
          player.conds ||= [];
          if (!player.conds.includes('Shield')) player.conds.push('Shield');
          addLog(`🛡️ ${player.name} braces for the next hit.`, 'atk');
        } else if (monster) {
          const roll = Math.floor(Math.random() * 20) + 1;
          const strength = Number(player.invest?.[3]) || 1;
          const magic = Number(player.invest?.[4]) || 1;
          const skill = body.move === 'skill';
          const hit = roll + (player.conds?.includes('Blessed') ? 3 : 0) >= (skill ? 8 : 9);
          const damage = hit ? Math.max(1, (skill ? magic + 5 : strength + 3) + Math.floor(Math.random() * 6) + (roll === 20 ? 6 : 0)) : 0;
          monster.cur = Math.max(0, Number(monster.cur) - damage);
          addLog(hit ? `${skill ? '✨' : '⚔️'} ${player.name} hits ${monster.n} for ${damage}.` : `❌ ${player.name} misses ${monster.n}.`, 'atk');
          if (monster.cur === 0) addLog(`☠️ ${monster.n} is defeated!`, 'atk');
        } else return sendJson(res, 400, { error: 'There is no living monster to target' });
        player.acted = true;
      } else return sendJson(res, 400, { error: 'Invalid action' });
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
