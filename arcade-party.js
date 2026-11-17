(function(){
"use strict";
const {register,node,button,read,store,highScore}=window.Arcade;
function shuffle(items){for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]]}return items}
register("headsup",function(root){
const sets={
Animals:["Elephant","Giraffe","Dolphin","Penguin","Cheetah","Octopus","Koala","Kangaroo","Hedgehog","Eagle","Sloth","Crocodile","Peacock","Zebra","Shark","Panda","Lobster","Ostrich","Bat","Camel"],
Movies:["Star Wars","The Lion King","Titanic","Finding Nemo","Frozen","Shrek","Toy Story","Jurassic Park","Harry Potter","Spider-Man","The Avengers","Avatar","The Matrix","Inside Out","Aladdin","Moana","Jaws","Barbie","The Incredibles","Up"],
Everyday:["Backpack","Toothbrush","Headphones","Umbrella","Microwave","Sandwich","Bicycle","Pillow","Notebook","Mirror","Suitcase","Doorbell","Telescope","Calendar","Keyboard","Washing machine","Remote control","Refrigerator","Flashlight","Elevator"]
};
let words=[],score=0,skips=0,seconds=60,timer=0,running=false,round=0;
const bar=node("div",{class:"toolbar"}),category=node("select",{"aria-label":"Choose a category"}),time=node("span",{class:"stat"}),points=node("span",{class:"stat"}),best=node("span",{class:"stat"}),card=node("div",{class:"prompt",role:"status"}),actions=node("div",{class:"choice-row"}),msg=node("p",{class:"message",role:"status"});Object.keys(sets).forEach(k=>category.append(node("option",{value:k},k)));bar.append(category,button("Start new round",start,"secondary"),time,points,best);root.append(bar,card,actions,msg);
function refresh(){time.textContent="Time "+seconds+"s";points.textContent="Correct "+score;best.textContent="Best "+read("headsup.best",0);card.textContent=running?(words[round%words.length]):"Ready? Put the screen facing your teammates."}
function next(got){if(!running)return;if(got)score++;else skips++;round++;refresh()}
function finish(){clearInterval(timer);running=false;const record=highScore("headsup.best",score);msg.textContent="Round over: "+score+" correct, "+skips+" passed. Best "+record;refresh();actions.replaceChildren(button("Play again",start))}
function start(){clearInterval(timer);words=shuffle([...sets[category.value]]);score=0;skips=0;seconds=60;round=0;running=true;msg.textContent="Describe the word without saying it. Use Correct or Pass.";actions.replaceChildren(button("✓ Correct",()=>next(true)),button("↷ Pass",()=>next(false),"secondary"));refresh();timer=setInterval(()=>{seconds--;refresh();if(seconds<=0)finish()},1000)}
actions.append(button("Start 60-second round",start));refresh();
});
register("ladders",function(root){
const ladders={3:22,8:30,19:38,28:84,36:44,51:67,71:91,80:99},snakes={17:4,47:26,62:18,64:60,87:24,93:73,95:75,98:79};
const colours=["🔵","🔴","🟡","🟢"],bar=node("div",{class:"toolbar"}),select=node("select",{"aria-label":"Players"}),turnInfo=node("span",{class:"stat"}),msg=node("p",{class:"message",role:"status"}),grid=node("div",{class:"ladder-grid",role:"grid","aria-label":"Snakes and ladders board"}),controls=node("div",{class:"toolbar"});
[2,3,4].forEach(n=>select.append(node("option",{value:String(n)},n+" players")));const rollBtn=button("Roll dice",roll);bar.append(select,button("New game",reset,"secondary"),turnInfo);controls.append(rollBtn);root.append(bar,grid,controls,msg);
let pos=[1,1],turn=0,over=false;
function reset(){pos=Array(Number(select.value)||2).fill(1);turn=0;over=false;msg.textContent="Roll the die. You need an exact roll to reach 100.";render()}
function roll(){if(over)return;const n=1+Math.floor(Math.random()*6),from=pos[turn],to=from+n;let detail=colours[turn]+" rolled "+n+".";if(to<=100){pos[turn]=to;if(ladders[to]){pos[turn]=ladders[to];detail+=" Ladder! Up to "+pos[turn]+"."}else if(snakes[to]){pos[turn]=snakes[to];detail+=" Snake! Down to "+pos[turn]+"."}}else detail+=" Need exact roll to finish.";if(pos[turn]===100){over=true;detail+=" Player "+(turn+1)+" wins!"}else turn=(turn+1)%pos.length;msg.textContent=detail;render()}
function render(){turnInfo.textContent=over?"Game over":"Turn "+colours[turn]+" Player "+(turn+1);rollBtn.disabled=over;grid.replaceChildren();for(let row=9;row>=0;row--){for(let step=0;step<10;step++){const n=row%2===0?row*10+step+1:row*10+10-step;const cell=node("div",{class:"ladder-cell"+(ladders[n]?" special":snakes[n]?" snake":""),role:"gridcell"});cell.append(node("span",{},String(n)),node("span",{class:"tokens"},pos.map((p,i)=>p===n?colours[i]:"").join("")));if(ladders[n]||snakes[n])cell.append(node("span",{},ladders[n]?"↑"+ladders[n]:"↓"+snakes[n]));grid.append(cell)}}}
select.onchange=reset;reset();
});
register("uno",function(root){
const COLORS=["red","blue","green","yellow"],labels={red:"Red",blue:"Blue",green:"Green",yellow:"Yellow"};let hands=[],deck=[],pile=[],turn=0,activeColor="red",stage="handoff",winner=-1,log="";
const bar=node("div",{class:"toolbar"}),status=node("span",{class:"stat"}),deckCount=node("span",{class:"stat"}),opponent=node("span",{class:"stat"}),center=node("div"),controls=node("div",{class:"choice-row"}),msg=node("p",{class:"message",role:"status"});
bar.append(button("New match",reset,"secondary"),status,deckCount,opponent);root.append(bar,center,controls,msg);
function buildDeck(){const d=[];COLORS.forEach(color=>{d.push({color,value:"0"});for(let n=1;n<=9;n++)for(let j=0;j<2;j++)d.push({color,value:String(n)});for(const value of ["Skip","Reverse","+2"])for(let j=0;j<2;j++)d.push({color,value})});for(let j=0;j<4;j++){d.push({color:"wild",value:"Wild"});d.push({color:"wild",value:"+4"})}return shuffle(d)}
function take(){if(!deck.length){const top=pile.pop();deck=shuffle(pile);pile=[top]}return deck.pop()||null}
function deal(player,count){for(let i=0;i<count;i++){const c=take();if(c)hands[player].push(c)}}
function reset(){deck=buildDeck();pile=[];hands=[[],[]];deal(0,7);deal(1,7);let c=take();while(c&&c.color==="wild"||c&&!/^\d$/.test(c.value)){deck.unshift(c);shuffle(deck);c=take()}if(!c)c={color:"red",value:"0"};pile=[c];activeColor=c.color;turn=0;winner=-1;stage="handoff";log="Pass the device to Player 1.";render()}
function legal(c){const top=pile[pile.length-1];return c.color==="wild"||c.color===activeColor||c.value===top.value}
function nextTurn(card){if(!hands[turn].length){winner=turn;stage="winner";log="Player "+(turn+1)+" wins!";render();return}const opponent=1-turn;if(card.value==="+2"||card.value==="+4")deal(opponent,card.value==="+2"?2:4);if(card.value==="Skip"||card.value==="Reverse"||card.value==="+2"||card.value==="+4"){log="Player "+(turn+1)+" plays again after "+card.value+".";stage="handoff"}else{turn=opponent;stage="handoff";log="Pass the device to Player "+(turn+1)+"."}render()}
function play(index){if(stage!=="playing")return;const card=hands[turn][index];if(!card||!legal(card))return;hands[turn].splice(index,1);pile.push(card);if(card.color==="wild"){stage="color";render()}else{activeColor=card.color;nextTurn(card)}}
function choose(color){activeColor=color;nextTurn(pile[pile.length-1])}
function draw(){if(stage!=="playing")return;deal(turn,1);turn=1-turn;stage="handoff";log="Card drawn. Pass to Player "+(turn+1)+".";render()}
function cardElement(card,fn,disabled){const b=button(card.value,fn,"uno-card "+card.color);b.disabled=disabled;b.setAttribute("aria-label",card.color+" "+card.value);return b}
function render(){status.textContent=winner>=0?"Winner: Player "+(winner+1):"Player "+(turn+1)+" · "+activeColor;deckCount.textContent="Deck "+deck.length;opponent.textContent="Opponent has "+hands[1-turn].length+" cards";msg.textContent=log;center.replaceChildren();controls.replaceChildren();const discard=node("div",{class:"card-hand"});discard.append(node("span",{class:"stat"},"Top card"));discard.append(cardElement(pile[pile.length-1],()=>{},true));discard.append(node("span",{class:"stat"},"Current colour: "+activeColor));center.append(discard);
if(stage==="handoff"){center.append(node("div",{class:"prompt"},"Player "+(turn+1)+" · Ready?"));controls.append(button("Reveal my cards",()=>{stage="playing";log="Choose a matching colour or value. Wild matches anything.";render()}));return}
if(stage==="winner"){center.append(node("div",{class:"prompt"},"Player "+(winner+1)+" wins!"));controls.append(button("Play again",reset));return}
if(stage==="color"){center.append(node("div",{class:"prompt"},"Choose a colour"));COLORS.forEach(c=>controls.append(button(labels[c],()=>choose(c),"uno-card "+c)));return}
const hand=node("div",{class:"card-hand","aria-label":"Your cards"});hands[turn].forEach((c,i)=>hand.append(cardElement(c,()=>play(i),!legal(c))));center.append(hand);controls.append(button("Draw one & pass",draw,"secondary"));if(hands[turn].length===1)center.append(node("p",{class:"message"},"UNO! One card left."))}
reset();
});
register("combat",function(root){
let hp=100,mhp=100,enemy=120,maxEnemy=120,mana=20,guard=false,turn=0,ended=false;let logs=[];
const bar=node("div",{class:"toolbar"}),stats=node("div"),actions=node("div",{class:"choice-row"}),log=node("div",{class:"mini-log",role:"log","aria-live":"polite"}),msg=node("p",{class:"message",role:"status"});
bar.append(button("New battle",reset,"secondary"));root.append(bar,stats,actions,msg,log);
function write(s){logs.unshift(s);logs=logs.slice(0,12)}
function render(){stats.replaceChildren();const hpLabel=node("p",{},"Hero "+hp+"/"+mhp+" HP · "+mana+"/30 mana");const track=node("div",{class:"health-track"});track.append(node("span",{style:"width:"+Math.max(0,hp/mhp*100)+"%"}));const enemyLabel=node("p",{},"Enemy "+enemy+"/"+maxEnemy+" HP");const track2=node("div",{class:"health-track"});track2.append(node("span",{style:"width:"+Math.max(0,enemy/maxEnemy*100)+"%;background:#ef4444"}));stats.append(hpLabel,track,enemyLabel,track2);actions.replaceChildren();if(ended){actions.append(button("Fight again",reset))}else{[["Attack (+5 mana)",attack,0],["Power strike (10 mana)",power,10],["Heal (12 mana)",heal,12],["Guard (+7 mana)",defend,0]].forEach(([text,fn,cost])=>{const b=button(text,fn,cost?"secondary":undefined);b.disabled=mana<cost;actions.append(b)})}log.replaceChildren(...logs.map(s=>node("div",{},s)))}
function enemyAct(){if(ended)return;if(Math.random()<.18&&enemy<100){const n=12+Math.floor(Math.random()*8);enemy=Math.min(maxEnemy,enemy+n);write("Enemy heals "+n+".")}else{let damage=10+Math.floor(Math.random()*12);if(guard){damage=Math.floor(damage*.35);guard=false}hp=Math.max(0,hp-damage);write("Enemy hits for "+damage+".")}if(hp<=0){ended=true;msg.textContent="Defeat. Try a different strategy."}render()}
function attack(){if(ended)return;const damage=13+Math.floor(Math.random()*9);enemy=Math.max(0,enemy-damage);mana=Math.min(30,mana+5);write("You attack for "+damage+".");after()}
function power(){if(ended||mana<10)return;mana-=10;const damage=27+Math.floor(Math.random()*14);enemy=Math.max(0,enemy-damage);write("Power strike deals "+damage+".");after()}
function heal(){if(ended||mana<12)return;mana-=12;const gain=Math.min(mhp-hp,24+Math.floor(Math.random()*9));hp+=gain;write("You heal "+gain+" HP.");after()}
function defend(){if(ended)return;guard=true;mana=Math.min(30,mana+7);write("You brace for the next attack.");after()}
function after(){turn++;if(enemy<=0){ended=true;msg.textContent="Victory in "+turn+" turns! Best "+highScore("combat.wins",read("combat.wins",0)+1)+" wins.";store("combat.wins",read("combat.wins",0));render();return}enemyAct()}
function reset(){hp=100;enemy=120;mana=20;turn=0;guard=false;ended=false;logs=["A new challenger approaches."];msg.textContent="Reduce enemy HP to zero before your own reaches zero.";render()}
reset();
});
})();
