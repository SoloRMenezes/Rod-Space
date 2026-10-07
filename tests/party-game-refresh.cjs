const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const theft=read('theft.html');
assert.match(theft,/ALARM — DON'T MOVE/,'Theft includes security-alarm decoys');
assert.match(theft,/addEventListener\('pointerdown'/,'Theft uses one pointer input path');
assert.doesNotMatch(theft,/addEventListener\('touchstart'|addEventListener\('mousedown'/,'Theft avoids duplicate touch and mouse grabs');
assert.match(theft,/if\(e\.repeat\)return/,'held keyboard keys cannot submit repeatedly');

const boredom=read('cards-against-boredom.html');
const uniqueSource=boredom.match(/function uniqueCards\(cards\) \{[\s\S]*?\n    \}/)[0];
const context={Set,String};vm.createContext(context);vm.runInContext(uniqueSource,context);
assert.deepEqual([...context.uniqueCards(['Same','same',' New ','','NEW'])],['Same',' New ']);
assert.match(boredom,/id="player-names"/,'local multiplayer accepts player names');
assert.match(boredom,/winners\.length === 1/,'final scoring handles ties');

console.log('PASS: Theft decoys and unified controls; Cards Against Boredom unique decks, named players, and tie results.');
