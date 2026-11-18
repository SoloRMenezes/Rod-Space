const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.attributes={};this.style={};this.className="";this.hidden=false;this.textContent="";this.classList={toggle(){}}}
 setAttribute(key,value){this.attributes[key]=value}
 addEventListener(name,fn){this.listeners[name]=fn}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.children=[...nodes]}
}
const memory=new Map(),registered={};
const document={createElement:tag=>new Element(tag),addEventListener(){}};
const node=(tag,attrs={},text)=>{const element=document.createElement(tag);for(const [key,value]of Object.entries(attrs)){if(key==="class")element.className=value;else element.setAttribute(key,value)}if(text!==undefined)element.textContent=text;return element};
const api={register:(name,handler)=>registered[name]=handler,node,button:(label,handler,cls)=>{const b=node("button",cls?{class:cls}:{} ,label);b.addEventListener("click",handler);return b},read:(key,fallback)=>memory.has(key)?JSON.parse(memory.get(key)):fallback,store:(key,value)=>memory.set(key,JSON.stringify(value)),highScore:(key,value)=>value};
const context={window:{Arcade:api},document,localStorage:{getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)},Math,Array,Number,String,Object,JSON};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,"arcade-puzzles.js"),"utf8"),context);
const savedKey="2048.save";
memory.set(savedKey,JSON.stringify({board:[2,4,8,16,4,8,16,2,8,16,2,4,16,2,4,8],score:256}));
const game=new Element("section");registered["2048"](game);
const toolbar=game.children[0],board=game.children[1],message=game.children[2],overlay=board.children.find(child=>child.className==="board-2048-over");
assert.equal(toolbar.children.some(child=>child.textContent==="New game"),false,"New game button is removed");
assert.equal(overlay.children[0].textContent,"GAME OVER");assert.equal(overlay.children[1].textContent,"Tap anywhere to play again");assert.equal(overlay.hidden,false,"saved finished games show the overlay");assert.equal(message.textContent,"","there is no second, small game-over message below the board");
game.listeners.pointerdown({preventDefault(){}});
assert.equal(overlay.hidden,true,"a tap anywhere in the game starts a fresh round");
const styles=fs.readFileSync(path.join(root,"arcade-immersive.css"),"utf8");
assert.match(styles,/body\[data-game="2048"\] \.board-2048\s*\{[^}]*width:min\(620px/,"board grows on larger screens");
assert.match(styles,/body\[data-game="2048"\] \.board-2048\s*\{[^}]*user-select:none;[^}]*-webkit-user-select:none/,"tile numbers are not selectable");
console.log("PASS: 2048 game-over restart, larger board, and nonselectable tiles.");
