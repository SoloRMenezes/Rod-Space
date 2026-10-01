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

const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match=>match[1]).filter(script=>script.trim());
scripts.forEach((script,index)=>new vm.Script(script,{filename:`solos_rng.html#${index+1}`}));

console.log('PASS: Rainbow is 1 in 10,000 and roll speed reaches instant at level 10.');
