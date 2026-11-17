const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
class FakeElement {
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.attributes={};this.style={setProperty(key,value){this[key]=value}};this.classList={toggle(){}};this.value="";this.textContent="";this.disabled=false;this.className="";}
 setAttribute(key,value){this.attributes[key]=value;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];}
 addEventListener(name,fn){this.listeners[name]=fn;}
 focus(){this.focused=true}
 getBoundingClientRect(){return{left:0,top:0,width:600,height:480}}
 getContext(){return{fillRect(){},beginPath(){},arc(){},fill(){},stroke(){},moveTo(){},lineTo(){},fillText(){},clearRect(){},set fillStyle(v){},set globalAlpha(v){}};}
 }
const games={};const memory=new Map();
const document={createElement(tag){return new FakeElement(tag)},addEventListener(){},hidden:false};
const ctx={document,console,performance:{now:()=>1234},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>1,window:{},location:{href:"http://127.0.0.1/arcade.html"},navigator:{},Date,Math,JSON,Number,String,Array,Object,Set,Map};
vm.createContext(ctx);
for(const source of ["arcade-core.js","arcade-puzzles.js","arcade-action.js","arcade-party.js"]){vm.runInContext(fs.readFileSync(path.join(root,source),"utf8"),ctx,{filename:source});}
for(const game of ["typing","2048","wordle","mines","pong","snake","headsup","uno","ladders","combat"]){
 const rootEl=new FakeElement("main");
 const details=ctx.window.Arcade.catalog.find(entry=>entry[0]===game);
 assert.ok(details,"catalog "+game);
 assert.doesNotThrow(()=>ctx.window.Arcade.mountGame?ctx.window.Arcade.mountGame(game,rootEl):null);
}
// Register callbacks are verified in arcade.cjs; simulate real rendering by overriding register in a second fresh context.
const registered={};ctx.window.Arcade.register=(name,fn)=>registered[name]=fn;
for(const source of ["arcade-puzzles.js","arcade-action.js","arcade-party.js"])vm.runInContext(fs.readFileSync(path.join(root,source),"utf8"),ctx,{filename:source});
for(const name of Object.keys(registered)){const rootEl=new FakeElement("section");assert.doesNotThrow(()=>registered[name](rootEl),"initialise "+name);assert.ok(rootEl.children.length>0,"render "+name)}
memory.clear();memory.set("rodspace.arcade.2048.score","2084");
assert.doesNotThrow(()=>registered["2048"](new FakeElement("section")),"restore 2048 with a missing legacy board");
assert.equal(JSON.parse(memory.get("rodspace.arcade.2048.save")).score,0,"discard orphaned legacy score when there is no matching saved board");
const wordleRoot=new FakeElement("section");registered.wordle(wordleRoot);
const nativeWordleInput=wordleRoot.children.find(el=>el.className==="wordle-native-input");
assert.ok(nativeWordleInput?.focused,"focus native input so mobile can open its keyboard");
nativeWordleInput.value="A";nativeWordleInput.listeners.input();
assert.equal(wordleRoot.children[2].children[0].textContent,"A","native mobile keyboard letters update the Wordle board");
const combatRoot=new FakeElement("section");registered.combat(combatRoot);
assert.equal(combatRoot.children[0].children[0].textContent,"Choose how to play","combat starts at a mode menu");
combatRoot.children[0].children[2].listeners.click();
assert.equal(combatRoot.children.find(el=>el.className==="duel-scene").children.length,2,"combat uses two opposing battle positions");
assert.equal(combatRoot.children.find(el=>el.className==="choice-row battle-actions").children.length,4,"combat keeps four turn actions");
assert.ok(combatRoot.children.some(el=>el.className==="battle-dialogue"),"combat has a battle dialogue panel");
console.log("PASS: All ten games initialise using DOM mocks without runtime exceptions.");
