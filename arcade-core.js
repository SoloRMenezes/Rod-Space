(function(){
"use strict";
const catalog=[
["typing","Fast Typing","Type with precision","⌨","solo"],
["2048","2048","Merge matching numbers","🔢","solo"],
["wordle","Daily Wordle","Guess today's word","🟩","solo"],
["mines","Minesweeper","Clear hidden mines","💣","solo"],
["snake","Snake Arena","Outgrow rival snakes","🐍","solo"],
["combat","Turn-Based Combat","Choose battle mode","⚔","solo"],
["pong","Pong","Paddle duel","🏓","party"],
["headsup","Heads Up","Guess under pressure","🎭","party"],
["uno","UNO-style Cards","Match coloured cards","🃏","party"],
["ladders","Snakes & Ladders","Race to victory","🎲","party"]
];
const handlers={};
function byId(id){return document.getElementById(id)}
function node(tag,attrs,text){const el=document.createElement(tag);Object.entries(attrs||{}).forEach(([k,v])=>{if(k==="class")el.className=v;else if(k==="html")el.innerHTML=v;else if(k==="text")el.textContent=v;else el.setAttribute(k,v)});if(text!==undefined)el.textContent=text;return el}
function button(label,func,cls){const b=node("button",cls?{class:cls}:null,label);b.type="button";b.addEventListener("click",func);return b}
function clear(el){el.replaceChildren()}
function store(key,value){try{localStorage.setItem("rodspace.arcade."+key,JSON.stringify(value))}catch{}}
function read(key,fallback){try{const val=localStorage.getItem("rodspace.arcade."+key);return val===null?fallback:JSON.parse(val)}catch{return fallback}}
function highScore(key,value){const prev=Number(read(key,0))||0;if(value>prev)store(key,value);return Math.max(prev,value)}
function register(id,callback){handlers[id]=callback}
function mount(){
const id=new URL(location.href).searchParams.get("game");
const info=catalog.find(game=>game[0]===id);
if(!info){location.replace(new URL("./",location.href).href);return null}
document.body.dataset.game=id;
byId("gameTitle").textContent=info[1];
byId("gameDescription").textContent=info[2];
byId("gameLabel").textContent=info[4]==="party"?"ROD SPACE / PARTY GAME":"ROD SPACE / SOLO GAME";
document.title=info[1]+" — Rod Space";
const game=byId("game");clear(game);
try{if(handlers[id])handlers[id](game);else game.textContent="This game is not available."}catch(e){console.error(e);game.textContent="Could not start. Reload to retry."}
return info;
}
window.Arcade={catalog,register,mount,byId,node,button,clear,read,store,highScore};
})();
