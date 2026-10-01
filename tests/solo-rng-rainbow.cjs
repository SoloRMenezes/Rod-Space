const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const html=fs.readFileSync(new URL('../solos_rng.html',`file://${__filename}`),'utf8');
assert.match(html,/RAINBOW_CHANCE=1\/10000/);
assert.match(html,/r:"Rainbow"/);
assert.match(html,/Rainbow<\/td><td>0\.01% · 1 in 10,000/);
assert.match(html,/BASE_ROLL_MS-state\.speed\*100/);
assert.match(html,/MAX_SPEED_LEVEL=10/);
assert.match(html,/localStorage\.setItem\('rng_speed',state\.speed\)/);
assert.match(html,/type==='speed'&&state\.speed>=MAX_SPEED_LEVEL/);
assert.match(html,/if\(rollDuration===0\)/);
assert.match(html,/SPIN_PRICES=\{1:10,5:50,50:475,100:900\}/);
assert.match(html,/buyBulkRoll\(50\)[^>]*>Pull 50 · 475/);
assert.match(html,/buyBulkRoll\(100\)[^>]*>Pull 100 · 900/);
assert.match(html,/state\.coins -= price/);
assert.match(html,/Need \$\{state\.inventory\.length\+count-state\.maxInv\} more bag slots/);

const additionsSource=html.match(/const additions = (\{[\s\S]*?\});\n        config\.forEach/)[1];
const additions=vm.runInNewContext(`(${additionsSource})`);
assert.deepEqual(Object.keys(additions),['Common','Uncommon','Rare','Epic','Legendary','Mythic','Rainbow']);
Object.entries(additions).forEach(([rarity,items])=>assert.ok(items.length>=14,`${rarity} should receive at least 14 new items`));
const names=Object.values(additions).flat().map(([,name])=>name);
assert.equal(new Set(names).size,names.length,'new item names must be unique');

const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match=>match[1]).filter(script=>script.trim());
scripts.forEach((script,index)=>new vm.Script(script,{filename:`solos_rng.html#${index+1}`}));

console.log('PASS: Rainbow is 1 in 10,000 and roll speed reaches instant at level 10.');
