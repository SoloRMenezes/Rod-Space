const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {resolve} = require('node:path');

const root = resolve(__dirname, '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const index = read('index.html');
const party = read('party.html');
const offline = read('offline.js');
const worker = read('sw.js');

assert.match(index, /data-offline-all="rodspace"/);
assert.match(index, /window\.offlineCardHTML\(proj\.id\)/);
assert.match(party, /data-offline-all="party"/);
assert.match(party, /window\.partyOfflineIds=games\.map/);
assert.match(party, /src="offline-catalog\.js/);
assert.match(party, /src="offline\.js/);
assert.match(offline, /window\.offlineDownloadAll/);
assert.match(offline, /Download game/);
assert.match(worker, /'party\.html'/);

console.log('PASS: bulk controls, individual game controls, Party Space offline wiring, and offline page shell.');
