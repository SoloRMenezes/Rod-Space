(function(){
"use strict";
const catalog=[
["typing","Fast Typing","Typing challenge with speed and accuracy","⌨","solo"],
["2048","2048","Slide and merge tiles to reach 2048","🔢","solo"],
["wordle","Daily Wordle","A new five-letter word each day","🟩","solo"],
["mines","Minesweeper","Clear the board without hitting mines","💣","solo"],
["pong","Pong","Play against the computer or a friend","🏓","solo"],
["snake","Snake Arena","Grow your snake against computer-controlled rivals","🐍","solo"],
["headsup","Heads Up","Pass the device and guess the prompt","🎭","party"],
["uno","UNO-style Cards","Pass-and-play colour-matching card game","🃏","party"],
["ladders","Snakes & Ladders","Roll the dice and race to 100","🎲","party"],
["combat","Turn-Based Combat","Fight monsters with abilities and strategy","⚔","solo"]
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
const info=catalog.find(x=>x[0]===id);
const title=byId("gameTitle"),desc=byId("gameDescription"),game=byId("game"),nav=byId("gameNav");
nav.replaceChildren(...catalog.map(g=>{const a=node("a",{href:"arcade.html?game="+encodeURIComponent(g[0])},g[1]);if(g[0]===id)a.setAttribute("aria-current","page");return a}));
if(!info){title.textContent="Arcade";desc.textContent="Choose a game to play. All games run in this browser.";const cards=node("div",{class:"grid-cards"});catalog.forEach(g=>{const a=node("a",{class:"game-link",href:"arcade.html?game="+g[0]});a.append(node("span",{class:"icon"},g[3]),node("strong",{},g[1]),node("small",{},g[2]));cards.append(a)});game.replaceChildren(cards);return}
title.textContent=info[1];desc.textContent=info[2];document.title=info[1]+" — Rod Space";clear(game);
try{if(handlers[id])handlers[id](game);else game.textContent="This game is not available."}catch(e){console.error(e);game.textContent="The game could not start. Reload to retry."}
}
window.Arcade={catalog,register,mount,byId,node,button,clear,read,store,highScore};
})();
