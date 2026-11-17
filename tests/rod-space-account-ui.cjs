const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
class Element {
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.attributes={};this.dataset={};this.hidden=false;this.textContent="";this.className="";this.style={};}
 setAttribute(key,value){this.attributes[key]=String(value);if(key==="hidden")this.hidden=true;}
 append(...nodes){this.children.push(...nodes);nodes.forEach(node=>node.parentElement=this);}
 replaceChildren(...nodes){this.children=[...nodes];nodes.forEach(node=>node.parentElement=this);}
 addEventListener(name,fn){this.listeners[name]=fn;}
 contains(target){return this===target||this.children.some(child=>child.contains(target));}
}
const elements=new Map(),header=new Element("header"),document={
 createElement:tag=>new Element(tag),head:new Element("head"),body:new Element("body"),
 querySelector:()=>header,querySelectorAll:()=>[],getElementById:id=>elements.get(id)||null,
 addEventListener(){},
};
const originalAppend=Element.prototype.append;
Element.prototype.append=function(...nodes){originalAppend.call(this,...nodes);for(const node of nodes)if(node.attributes?.id)elements.set(node.attributes.id,node);};
const context={document,console:{warn(){}},location:{hostname:"localhost"},localStorage:{getItem(){return null},setItem(){}},
 setTimeout,clearTimeout,Promise,Map,Set,Date,Math,Number,String,Object,Array,JSON,
 import:undefined};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,"..","rod-space-account.js"),"utf8"),context,{filename:"rod-space-account.js",importModuleDynamically:()=>Promise.reject(new Error("Firebase unavailable in UI test"))});
const api=context.RodSpaceAccounts,trigger=elements.get("rs-account-trigger"),menu=elements.get("rs-settings-menu");
assert.ok(api&&trigger&&menu,"account dropdown mounts");
const gameStats=menu.children.find(item=>item.textContent==="In-game stats");
const settings=menu.children.find(item=>item.textContent==="Settings");
assert.ok(gameStats&&settings,"dropdown has separate stats and settings actions");
assert.equal(gameStats.hidden,true,"game stats stay hidden outside a game");
api.setActiveGame("typing");
assert.equal(gameStats.hidden,false,"game stats appear while a game is active");
api.setActiveGame("");
assert.equal(gameStats.hidden,true,"game stats disappear when leaving a game");
console.log("PASS: Account dropdown limits game stats to active games and keeps settings available.");
