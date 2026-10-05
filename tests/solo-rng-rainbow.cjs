const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const html=fs.readFileSync(new URL('../solos_rng.html',`file://${__filename}`),'utf8');
assert.match(html,/\{rarity:'Rainbow',chance:1\/10000\}/);
assert.match(html,/r:"Rainbow"/);
assert.match(html,/Rainbow<\/td><td>0\.01% · 1 in 10,000/);
assert.match(html,/BASE_ROLL_MS-state\.speed\*100/);
assert.match(html,/MAX_SPEED_LEVEL=10/);
assert.match(html,/localStorage\.setItem\('rng_speed',state\.speed\)/);
assert.match(html,/type==='speed'&&state\.speed>=MAX_SPEED_LEVEL/);
assert.match(html,/if\(rollDuration===0\)/);
assert.match(html,/SPIN_PRICES=\{1:10,5:50,50:525,100:1200/);
assert.match(html,/id="roll-50-btn"[^>]*onclick="spin\(50\)"[^>]*>Pull 50 · 525/);
assert.match(html,/id="roll-100-btn"[^>]*onclick="spin\(100\)"[^>]*>Pull 100 · 1,200/);
assert.match(html,/buyBulkUnlock\(50\)[^>]*>Unlock Roll 50 · 1,500/);
assert.match(html,/buyBulkUnlock\(100\)[^>]*>Unlock Roll 100 · 3,000/);
assert.match(html,/localStorage\.setItem\(`rng_bulk_\$\{count\}`/);
assert.match(html,/state\.coins -= price/);
assert.match(html,/MAX_LUCK_LEVEL=10/);
assert.match(html,/luck: Math\.min\(MAX_LUCK_LEVEL/);
assert.match(html,/type==='luck'&&state\.luck>=MAX_LUCK_LEVEL/);
assert.match(html,/if \(state\.inventory\.length \+ count > state\.maxInv\)/);
assert.match(html,/if\(state\.maxInv<count\)return notify/);
assert.doesNotMatch(html,/overflow items auto-sold/);

const additionsSource=html.match(/const additions = (\{[\s\S]*?\});\n        config\.forEach/)[1];
const additions=vm.runInNewContext(`(${additionsSource})`);
assert.deepEqual(Object.keys(additions),['Common','Uncommon','Rare','Epic','Legendary','Mythic','Rainbow','Celestial','Transcendent','Void','Divine']);
Object.entries(additions).forEach(([rarity,items])=>assert.ok(items.length>=14,`${rarity} should receive at least 14 new items`));
const names=Object.values(additions).flat().map(([,name])=>name);
assert.equal(new Set(names).size,names.length,'new item names must be unique');

const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match=>match[1]).filter(script=>script.trim());
scripts.forEach((script,index)=>new vm.Script(script,{filename:`solos_rng.html#${index+1}`}));

console.log('PASS: Rainbow is 1 in 10,000 and roll speed reaches instant at level 10.');
