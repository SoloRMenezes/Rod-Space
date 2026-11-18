const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
assert.match(fs.readFileSync(path.join(root,"arcade-immersive.css"),"utf8"),/\.game-panel\s+\[hidden\]\s*\{\s*display:\s*none\s*!important\s*\}/,"hidden game UI must stay hidden despite display rules on toolbars and panels");
const arcadeCss=fs.readFileSync(path.join(root,"arcade-immersive.css"),"utf8");
assert.match(arcadeCss,/body\[data-game="uno"\]\s*\{[^}]*--deep:#190809;[^}]*--btn:#c91f28;/,"UNO uses the requested red table theme");
assert.match(arcadeCss,/body\[data-game="uno"\] \.uno-hand\.card-hand \{display:flex;flex-wrap:nowrap;[^}]*overflow:visible/,"UNO hand stays visible without a nested scrollbar");
assert.match(arcadeCss,/body\[data-game="uno"\] \.game-heading\s*\{\s*display:\s*none/,"UNO hides its redundant page title");
assert.match(arcadeCss,/body\[data-game="headsup"\] \.game-heading\s*\{\s*display:\s*none/,"Heads Up hides the title already shown in the top bar");
assert.match(arcadeCss,/body\[data-game="headsup"\] \.prompt[^\{]*\{[^}]*background:#f1eee3;[^}]*color:#202326;/,"Heads Up uses a calm flat prompt instead of a bright gradient");
assert.match(arcadeCss,/body\[data-game="snake"\] \.game-heading\s*\{\s*display:\s*none/,"Snake uses its top bar title without a duplicate page heading");
assert.match(arcadeCss,/body\[data-game="snake"\] \.snake-game-over[^\{]*\{[^}]*font-size:clamp\(32px,6vw,64px\)/,"Snake game-over state is presented at a large readable size");
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
const games={};const memory=new Map(),documentListeners={};
const document={createElement(tag){return new FakeElement(tag)},addEventListener(name,fn){documentListeners[name]=fn},hidden:false};
const windowListeners={},intervalCallbacks=new Map(),timeoutCallbacks=[];let intervalId=0,prefersReducedMotion=false;const ctx={document,console,performance:{now:()=>1234},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},setInterval(fn){const id=++intervalId;intervalCallbacks.set(id,fn);return id},clearInterval(id){intervalCallbacks.delete(id)},setTimeout(fn,delay){timeoutCallbacks.push({fn,delay});return timeoutCallbacks.length},clearTimeout(){},requestAnimationFrame:()=>1,window:{addEventListener(name,fn){windowListeners[name]=fn},matchMedia(){return{matches:prefersReducedMotion}}},location:{href:"http://127.0.0.1/arcade.html"},navigator:{},Date,Math,JSON,Number,String,Array,Object,Set,Map};
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
const pongRoot=new FakeElement("section");registered.pong(pongRoot);
const pongToolbar=pongRoot.children.find(el=>el.className.split(" ").includes("pong-toolbar"));
assert.ok(pongToolbar.children.some(el=>el.textContent==="Main menu"),"Pong has a direct route back to the main menu");
assert.equal(pongToolbar.children.filter(el=>el.className==="stat").length,0,"Pong scores are drawn inside the court, not in toolbar pills");
assert.ok(pongRoot.children.some(el=>el.className.includes("pong-court")),"Pong uses its dedicated green court");
const combatRoot=new FakeElement("section");registered.combat(combatRoot);
assert.equal(combatRoot.children[0].children[0].textContent,"Single Player","combat starts with the single-player option");
assert.equal(combatRoot.children[0].children[1].textContent,"LAN Multiplayer","combat keeps its online multiplayer option");
combatRoot.children[0].children[0].listeners.click();
assert.equal(combatRoot.children.find(el=>el.className==="duel-scene").children.length,2,"combat uses two opposing battle positions");
assert.equal(combatRoot.children.find(el=>el.className==="choice-row battle-actions").children.length,4,"combat keeps four turn actions");
assert.ok(combatRoot.children.some(el=>el.className==="battle-dialogue"),"combat has a battle dialogue panel");
const snakeRoot=new FakeElement("section");registered.snake(snakeRoot);
const snakeToolbar=snakeRoot.children.find(el=>el.className.split(" ").includes("snake-toolbar")),snakeBoard=snakeRoot.children.find(el=>el.className==="snake-board-wrap"),snakeCanvas=snakeBoard?.children.find(el=>el.tagName==="CANVAS"),snakeJoystick=snakeBoard?.children.find(el=>el.className==="snake-joystick");
assert.equal(snakeCanvas?.getAttribute("width"),"1200","Snake arena uses a larger slither-style playfield");
assert.ok(snakeToolbar?.children.some(el=>el.className==="stat"),"Snake score and best score stay in the top toolbar");
assert.equal(snakeRoot.children.some(el=>el.className.split(" ").includes("direction-pad")),false,"Snake removes the arrow-button pad");
assert.ok(snakeJoystick,"Snake has a floating joystick for touchscreens");
assert.ok(snakeBoard.children.some(el=>el.className==="snake-game-over"),"Snake places a game-over overlay on the map");
snakeToolbar.children.find(el=>el.textContent==="Start / Restart").listeners.click();
snakeCanvas.listeners.pointerdown({pointerType:"touch",pointerId:7,clientX:120,clientY:180,preventDefault(){}});snakeCanvas.listeners.pointermove({pointerType:"touch",pointerId:7,clientX:120,clientY:120});
assert.equal(snakeJoystick.style.left,"120px","touch joystick snaps to the initial finger position");
assert.equal(snakeJoystick.style.top,"180px","touch joystick is positioned relative to the arena");
const snakeTimer=[...intervalCallbacks.entries()].at(-1)[1],snakeKey=code=>documentListeners.keydown({code,preventDefault(){}});snakeKey("ArrowDown");snakeTimer();snakeKey("ArrowRight");snakeTimer();snakeKey("ArrowUp");snakeTimer();snakeKey("ArrowLeft");snakeTimer();
assert.equal(snakeBoard.children.find(el=>el.className==="snake-game-over").hidden,true,"Snake can loop through its own body without dying");
for(let i=0;i<70;i++)snakeTimer();
assert.equal(snakeBoard.children.find(el=>el.className==="snake-game-over").hidden,false,"Snake displays a prominent game-over overlay after a crash");
const headsupRoot=new FakeElement("section");registered.headsup(headsupRoot);
const headsupSetup=headsupRoot.children.find(el=>el.className==="headsup-setup"),headsupToolbar=headsupRoot.children.find(el=>el.className.split(" ").includes("headsup-toolbar")),headsupPrompt=headsupRoot.children.find(el=>el.className==="prompt"),headsupActions=headsupRoot.children.find(el=>el.className.split(" ").includes("headsup-actions"));
assert.ok(headsupSetup&&!headsupSetup.hidden,"Heads Up opens on setup instead of starting a round");
assert.ok(headsupSetup.children.some(el=>el.children.some(child=>child.tagName==="SELECT"&&child.getAttribute("aria-label")==="Choose a category")),"Heads Up lets players choose a word category before play");
assert.ok(headsupSetup.children.some(el=>el.children.some(child=>child.tagName==="SELECT"&&child.getAttribute("aria-label")==="Round length")),"Heads Up lets players choose round length before play");
assert.equal(headsupToolbar.hidden,true,"Heads Up game HUD stays hidden until the round starts");
const headsupStart=headsupSetup.children.find(el=>el.textContent==="Start round");
assert.ok(headsupStart,"Heads Up has an explicit start-round step after setup");
(async()=>{
 await headsupStart.listeners.click();
 assert.equal(headsupSetup.hidden,true,"starting a round closes setup");
 assert.equal(headsupToolbar.hidden,false,"starting a round reveals the game HUD");
 assert.equal(headsupActions.children.length,0,"Heads Up has no on-screen Correct or Pass controls during play");
 assert.ok(windowListeners.deviceorientation,"Heads Up listens for phone tilt");
 const firstWord=headsupPrompt.textContent;windowListeners.deviceorientation({beta:0});windowListeners.deviceorientation({beta:30});
 assert.notEqual(headsupPrompt.textContent,firstWord,"tilting the phone advances the Heads Up word");
 console.log("PASS: Heads Up uses a setup step, restrained styling, and tilt controls without gameplay buttons.");
})();
const unoRoot=new FakeElement("section");registered.uno(unoRoot);
const unoTable=unoRoot.children.find(el=>el.className==="uno-table"),unoHandArea=unoRoot.children.find(el=>el.className==="uno-hand-area"),unoToolbar=unoRoot.children.find(el=>el.className.split(" ").includes("uno-toolbar")),unoControls=unoRoot.children.find(el=>el.className.split(" ").includes("uno-controls"));
assert.deepEqual(unoRoot.children[0].children.map(button=>button.textContent),["Singleplayer","LAN","Multiplayer"],"UNO mode menu stays concise with the three requested choices");
unoRoot.children[0].children[1].listeners.click();
unoTable.children[0].children.find(el=>el.className==="uno-draw-pile").listeners.click();
assert.equal(unoHandArea.children.some(el=>el.className.split(" ").includes("uno-hand")),false,"LAN play hides the next hand until the device is passed");
unoControls.children.find(el=>el.textContent==="Ready Player 2").listeners.click();
assert.ok(unoHandArea.children.some(el=>el.className.split(" ").includes("uno-hand")),"LAN play reveals the active player's own hand after passing the device");
unoToolbar.children[0].listeners.click();
unoRoot.children[0].children[0].listeners.click();
assert.ok(unoHandArea.children.some(el=>el.className.split(" ").includes("uno-hand")),"UNO solo mode deals cards directly against bots");
assert.equal(unoToolbar.children.length,2,"UNO game controls only show Main menu and the current turn");
assert.equal(unoToolbar.children[0].textContent,"Main menu");
assert.match(unoToolbar.children[1].textContent,/turn/i,"UNO keeps the current turn visible");
assert.ok(unoTable.children[0].children.some(el=>el.className.split(" ").includes("uno-draw-pile")),"UNO has a prominent face-down draw pile");
assert.equal(unoTable.children.some(el=>el.textContent.includes("Colour:")),false,"UNO removes the separate current-colour label");
const unoHand=unoHandArea.children.find(el=>el.className.split(" ").includes("uno-hand"));
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
unoLobbyRoot.children[0].children[2].listeners.click();
const playerCountControl=unoLobbyRoot.children[1].children[3],decreasePlayers=playerCountControl.children[0],playerCountDisplay=playerCountControl.children[1],increasePlayers=playerCountControl.children[2];
assert.equal(playerCountControl.className,"uno-player-count-control","UNO room uses an arrow count control");
assert.equal(decreasePlayers.getAttribute("aria-label"),"Decrease players");assert.equal(increasePlayers.getAttribute("aria-label"),"Increase players");
assert.equal(playerCountDisplay.textContent,"2");assert.equal(decreasePlayers.disabled,true,"player count cannot go below two");
for(let i=0;i<14;i++)increasePlayers.listeners.click();assert.equal(playerCountDisplay.textContent,"16");assert.equal(increasePlayers.disabled,true,"player count cannot go above sixteen");increasePlayers.listeners.click();assert.equal(playerCountDisplay.textContent,"16");
for(let i=0;i<14;i++)decreasePlayers.listeners.click();assert.equal(playerCountDisplay.textContent,"2");decreasePlayers.listeners.click();assert.equal(playerCountDisplay.textContent,"2");
timeoutCallbacks.length=0;const laddersRoot=new FakeElement("section");registered.ladders(laddersRoot);
const laddersSetup=laddersRoot.children.find(el=>el.className==="ladders-setup");
assert.ok(laddersSetup,"Snakes & Ladders opens on a dedicated setup screen");
const laddersCount=laddersSetup.children.find(el=>el.tagName==="SELECT");
assert.deepEqual(laddersCount.children.map(option=>option.textContent),["2 players","3 players","4 players"],"Snakes & Ladders supports two through four players before starting");
const laddersStart=laddersSetup.children.find(el=>el.textContent==="Start game");assert.ok(laddersStart,"players explicitly start a new match");
laddersCount.value="4";laddersStart.listeners.click();
const laddersToolbar=laddersRoot.children.find(el=>el.className==="ladders-toolbar"),laddersBoard=laddersRoot.children.find(el=>el.className==="ladders-board");
assert.ok(laddersToolbar&&laddersBoard,"live match has its own compact toolbar and board");
assert.ok(laddersToolbar.children.some(el=>el.textContent==="Main menu"),"Main menu returns to game setup");
assert.equal(laddersBoard.children.find(el=>el.className==="ladders-token-layer").children.length,4,"selected four-player game renders four player pieces");
assert.equal(laddersBoard.children.find(el=>el.className==="ladders-cells").children.length,100,"illustrated board preserves all 100 squares");
const laddersCells=laddersBoard.children.find(el=>el.className==="ladders-cells");assert.equal(laddersCells.getAttribute("aria-rowcount"),"10");assert.equal(laddersCells.getAttribute("aria-colcount"),"10");
assert.equal(laddersCells.children.find(el=>el.getAttribute("aria-label")==="Square 3. Ladder to 22")!==undefined,true,"screen readers hear the ladder destination");
assert.ok(laddersBoard.children.some(el=>el.className==="ladders-art"),"board includes illustrated snakes and ladders");
const laddersDie=laddersRoot.children.find(el=>el.className==="ladders-die");assert.ok(laddersDie,"a visible 3D die replaces the text roll button");
assert.ok(laddersDie.getAttribute("aria-label")?.includes("Roll"),"die can be rolled accessibly");
assert.equal(laddersDie.textContent,"","die result is shown on the cube rather than a visible roll label");
assert.match(arcadeCss,/\.ladders-cube\[data-result="6"\]\s*\{transform:/,"the cube rotates to show the rolled face");
const laddersCube=laddersDie.children[0];assert.equal(laddersCube.children.length,6,"the 3D die has six pip faces");
const flushLaddersMotion=()=>{let guard=0;while(timeoutCallbacks.length&&guard++<500)timeoutCallbacks.shift().fn();assert.ok(guard<500,"piece and die animation timers settle")};
const rollLadders=(face,expectedDelay)=>{const originalRandom=Math.random;Math.random=()=>((face-1)/6);laddersDie.listeners.click();assert.equal(laddersDie.disabled,true,"the die is locked while its roll animates");if(expectedDelay!==undefined)assert.equal(timeoutCallbacks[0]?.delay,expectedDelay,"reduced-motion mode skips hidden animation waits");flushLaddersMotion();Math.random=originalRandom};
const originalRandom=Math.random;Math.random=()=>0;laddersDie.listeners.click();const staleCallbacks=timeoutCallbacks.length;laddersToolbar.children.find(el=>el.textContent==="Main menu").listeners.click();laddersCount.value="4";laddersStart.listeners.click();flushLaddersMotion();Math.random=originalRandom;
assert.equal(staleCallbacks,1,"rolling schedules a movement that can be invalidated");assert.equal(laddersBoard.children.find(el=>el.className==="ladders-token-layer").children[0].getAttribute("data-square"),"1","starting a fresh game cancels stale movement from the previous match");
for(const face of [2,1,1,1,6,1,1,1,3])rollLadders(face);
assert.equal(laddersBoard.children.find(el=>el.className==="ladders-token-layer").children[0].getAttribute("data-square"),"24","landing on a snake animates the piece down to its tail");
laddersToolbar.children.find(el=>el.textContent==="Main menu").listeners.click();
assert.equal(laddersSetup.hidden,false,"Main menu returns to the game's own setup");
assert.equal(laddersRoot.children.find(el=>el.className==="game-intro"),undefined,"Snakes & Ladders uses its own setup instead of the generic intro");
laddersCount.value="2";laddersStart.listeners.click();
for(const face of [2,1,6,1,4,1,6,1,5])rollLadders(face);
const laddersTokens=laddersBoard.children.find(el=>el.className==="ladders-token-layer");
assert.equal(laddersTokens.children[0].getAttribute("data-square"),"99","piece animates through ladder climbs and reaches square 99");
rollLadders(1);rollLadders(2);
assert.equal(laddersTokens.children[0].getAttribute("data-square"),"99","overshooting from 99 with a 2 bounces back to square 99");
rollLadders(1);rollLadders(1);
assert.equal(laddersTokens.children[0].getAttribute("data-square"),"100","an exact roll reaches square 100 and wins");
assert.match(laddersToolbar.children.find(el=>el.className.includes("ladders-turn")).textContent,/wins/i,"winning state is shown in the turn indicator");
laddersToolbar.children.find(el=>el.tagName==="SELECT").value="3";laddersToolbar.children.find(el=>el.tagName==="SELECT").listeners.change();laddersToolbar.children.find(el=>el.textContent==="New game").listeners.click();
assert.equal(laddersTokens.children.length,3,"New game applies a changed player count");
prefersReducedMotion=true;rollLadders(2,0);prefersReducedMotion=false;
assert.equal(laddersTokens.children[0].getAttribute("data-square"),"22","reduced-motion users still resolve ladder movement without long invisible waits");
console.log("PASS: All ten games initialise using DOM mocks without runtime exceptions.");
(async()=>{
 let hostOptions,hostEvents={},sent=[];let players=0;
 ctx.PartyRooms={createHost:async options=>{hostOptions=options;return{roomId:"room123",lan:{on(type,fn){hostEvents[type]=fn;return()=>{}},send(peer,type,payload){sent.push({peer,type,payload})}},setPlayerCount(value){players=value},stop:async()=>{}}}};
 const roomRoot=new FakeElement("section");registered.uno(roomRoot);roomRoot.children[0].children[2].listeners.click();
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
