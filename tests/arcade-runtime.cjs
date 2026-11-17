const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
class FakeElement {
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.attributes={};this.style={setProperty(key,value){this[key]=value}};this.classList={toggle(){}};this.value="";this.textContent="";this.disabled=false;this.className="";}
 setAttribute(key,value){this.attributes[key]=value;}
 getAttribute(key){return this.attributes[key]??null;}
 append(...nodes){this.children.push(...nodes);}
 insertBefore(node,reference){const current=this.children.indexOf(node);if(current>=0)this.children.splice(current,1);const index=this.children.indexOf(reference);this.children.splice(index<0?this.children.length:index,0,node);}
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
assert.equal(combatRoot.children[0].children[0].textContent,"Single Player","combat starts with the single-player option");
assert.equal(combatRoot.children[0].children[1].textContent,"LAN Multiplayer","combat keeps its online multiplayer option");
combatRoot.children[0].children[0].listeners.click();
assert.equal(combatRoot.children.find(el=>el.className==="duel-scene").children.length,2,"combat uses two opposing battle positions");
assert.equal(combatRoot.children.find(el=>el.className==="choice-row battle-actions").children.length,4,"combat keeps four turn actions");
assert.ok(combatRoot.children.some(el=>el.className==="battle-dialogue"),"combat has a battle dialogue panel");
const unoRoot=new FakeElement("section");registered.uno(unoRoot);
assert.equal(unoRoot.children[0].children[0].textContent,"Choose your game","UNO starts with solo or multiplayer choices");
unoRoot.children[0].children[2].listeners.click();
assert.ok(unoRoot.children[3].children.some(el=>el.className.split(" ").includes("uno-hand")),"UNO solo mode deals cards directly against bots");
assert.equal(unoRoot.children[3].children.find(el=>el.className==="uno-hand-label").textContent,"Your hand · 7 cards","UNO clearly labels the visible cards as the local player's own hand");
const unoHand=unoRoot.children[3].children.find(el=>el.className.split(" ").includes("uno-hand"));
const draggedCard=unoHand.children[0],firstCardId=draggedCard.getAttribute("data-card-id");
unoHand.children.forEach((card,index)=>{card.getBoundingClientRect=()=>({left:index*40,top:0,width:60,height:90})});
draggedCard.listeners.pointerdown({button:0,pointerId:9,clientX:10,clientY:10});
assert.ok(draggedCard.className.includes("card-held"),"UNO lifts and animates a card as soon as it is held");
unoHand.listeners.pointermove({pointerId:9,clientX:210,clientY:10,preventDefault(){}});
assert.ok(draggedCard.className.includes("card-dragging"),"UNO keeps the held animation during a drag");
unoHand.listeners.pointerup({pointerId:9});
assert.ok(!draggedCard.className.includes("card-held")&&!draggedCard.className.includes("card-dragging"),"UNO releases the held animation on drop");
assert.notEqual(unoHand.children[0].getAttribute("data-card-id"),firstCardId,"UNO cards can be dragged into a different hand position");
const unoLobbyRoot=new FakeElement("section");registered.uno(unoLobbyRoot);
unoLobbyRoot.children[0].children[3].listeners.click();
const playerCountControl=unoLobbyRoot.children[1].children[3],decreasePlayers=playerCountControl.children[0],playerCountDisplay=playerCountControl.children[1],increasePlayers=playerCountControl.children[2];
assert.equal(playerCountControl.className,"uno-player-count-control","UNO room uses an arrow count control");
assert.equal(decreasePlayers.getAttribute("aria-label"),"Decrease players");assert.equal(increasePlayers.getAttribute("aria-label"),"Increase players");
assert.equal(playerCountDisplay.textContent,"2");assert.equal(decreasePlayers.disabled,true,"player count cannot go below two");
for(let i=0;i<14;i++)increasePlayers.listeners.click();assert.equal(playerCountDisplay.textContent,"16");assert.equal(increasePlayers.disabled,true,"player count cannot go above sixteen");increasePlayers.listeners.click();assert.equal(playerCountDisplay.textContent,"16");
for(let i=0;i<14;i++)decreasePlayers.listeners.click();assert.equal(playerCountDisplay.textContent,"2");decreasePlayers.listeners.click();assert.equal(playerCountDisplay.textContent,"2");
console.log("PASS: All ten games initialise using DOM mocks without runtime exceptions.");
(async()=>{
 let hostOptions,hostEvents={},sent=[];let players=0;
 ctx.PartyRooms={createHost:async options=>{hostOptions=options;return{roomId:"room123",lan:{on(type,fn){hostEvents[type]=fn;return()=>{}},send(peer,type,payload){sent.push({peer,type,payload})}},setPlayerCount(value){players=value},stop:async()=>{}}}};
 const roomRoot=new FakeElement("section");registered.uno(roomRoot);roomRoot.children[0].children[3].listeners.click();
 const roomCount=roomRoot.children[1].children[3];for(let i=0;i<14;i++)roomCount.children[2].listeners.click();await roomRoot.children[1].children[4].listeners.click();
 assert.equal(hostOptions.metadata.maxPlayers,16,"UNO room uses the selected player count");
 for(let i=1;i<=15;i++)assert.equal(await hostOptions.onConnectionRequest({id:"peer-"+i}),true,"UNO room reserves each of its 15 guest seats");
 assert.equal(await hostOptions.onConnectionRequest({id:"peer-overflow"}),false,"UNO room rejects guests after reaching 16 players");
 const peer={meta:{id:"peer-1",name:"Alex"}};hostOptions.onConnected(peer);
 hostEvents.message({peer,data:{type:"uno-hello",payload:{playerKey:"alex-key",name:"Alex"}}});
 let state=sent.filter(packet=>packet.type==="uno-state").at(-1).payload;
 assert.equal(state.seat,1,"UNO assigns the guest a seat");assert.equal(state.hand.length,7,"UNO sends the guest only their own hand");assert.equal(state.maxPlayers,16,"UNO state preserves the 16-player room size");assert.equal(state.counts.length,16,"UNO creates all 16 player seats");assert.ok(state.counts.every(count=>count===7),"UNO deals seven cards to all 16 players");assert.equal(state.deckCount,1,"large UNO rooms retain a card to draw after dealing");assert.equal(players,2,"UNO room count includes the host and guest");assert.ok(!("hands" in state),"UNO never sends the complete set of players' hands");assert.ok(state.players.every(player=>!("hand" in player)),"UNO player summaries never include card identities");assert.ok(state.counts.every(count=>typeof count==="number"),"UNO exposes only hand sizes for opponents");
 hostEvents.close(peer);assert.equal(players,1,"UNO marks a disconnected player as a bot seat");
 hostEvents.message({peer,data:{type:"uno-heartbeat",payload:{playerKey:"alex-key",name:"Alex"}}});
 state=sent.filter(packet=>packet.type==="uno-state").at(-1).payload;
 assert.equal(state.seat,1,"UNO reconnect restores the player to their reserved seat");assert.equal(players,2,"UNO reconnect republishes the restored player count");
 console.log("PASS: UNO rooms assign seats, keep hands private, and restore disconnected players.");
})().catch(error=>{console.error(error);process.exitCode=1});
