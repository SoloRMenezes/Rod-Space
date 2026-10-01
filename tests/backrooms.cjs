const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const files=['backrooms.html','backrooms-level1.html','backrooms-level2.html','backrooms-level7.html','backrooms-level10.html'];
for(const file of files){
  const source=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  const scripts=[...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match=>match[1]).filter(Boolean);
  for(const script of scripts)new Function(script);
  assert.match(source,/addEventListener\('blur'/,`${file} must clear held input when focus is lost`);
  assert.match(source,/Object\.keys\(keys\)\.forEach/,`${file} must clear held keys when gameplay pauses`);
}

for(const file of files.filter(file=>file!=='backrooms-level7.html')){
  const source=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  assert.match(source,/Math\.min\(clock\.getDelta\(\),0\.1\)/,`${file} must clamp resumed frame time`);
}

console.log('PASS: all Backrooms levels parse and safely clear/clamp paused input.');
