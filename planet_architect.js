"use strict";
const SAVE_KEY="chronos_save_v2";
const eras=[
 {name:"The Pre-Void",kicker:"ERA I · PRIMORDIAL",desc:"Darkness moves upon the deep.",min:0,image:"assets/chronos/era-0-pre-void.png",alt:"A primordial black hole"},
 {name:"Hadean Inferno",kicker:"ERA II · IGNITION",desc:"Stone becomes fire beneath impossible gravity.",min:300,image:"assets/chronos/era-1-hadean-inferno.png",alt:"A molten world falling around a black hole"},
 {name:"Archean Waters",kicker:"ERA III · OCEANS",desc:"Rain outlives the fire and gathers into seas.",min:5000,image:"assets/chronos/era-2-archean-waters.png",alt:"An ocean world orbiting a dark core"},
 {name:"Verdant Bloom",kicker:"ERA IV · LIFE",desc:"The first green breath crosses the continents.",min:50000,image:"assets/chronos/era-3-verdant-bloom.png",alt:"A living green world around a cosmic core"},
 {name:"Techno-Organic",kicker:"ERA V · TRANSCENDENCE",desc:"Life and machine become one celestial mind.",min:1000000,image:"assets/chronos/era-4-techno-organic.png",alt:"A violet techno-organic world surrounding a black hole"}
];
const upgrades=[
 {id:"focus",icon:"✦",name:"Divine Will",cost:10,type:"click",power:1.7,desc:"Stronger manual harvests"},
 {id:"gravity",icon:"◉",name:"Primal Mass",cost:40,type:"auto",power:1.5,desc:"Passively bends Essence inward"},
 {id:"flare",icon:"☼",name:"Solar Flare",cost:180,type:"crit",power:2,desc:"Raises critical harvest chance"},
 {id:"core",icon:"◆",name:"Iron Heart",cost:900,type:"auto",power:12,desc:"A dense, tireless planetary core"},
 {id:"tectonics",icon:"⬡",name:"World Forge",cost:6500,type:"auto",power:85,desc:"Moves continents without rest"},
 {id:"civilization",icon:"⌁",name:"Star Choir",cost:55000,type:"auto",power:850,desc:"A civilization sings Essence home"},
 {id:"loom",icon:"∞",name:"Quantum Loom",cost:750000,type:"auto",power:12000,desc:"Weaves probability into matter"},
 {id:"nebula",icon:"✺",name:"Nebula Heart",cost:9000000,type:"auto",power:160000,desc:"Births stars in clouds of dust"},
 {id:"epoch",icon:"⌛",name:"Epoch Engine",cost:140000000,type:"auto",power:2400000,desc:"Turns deep time into power"},
 {id:"crown",icon:"♜",name:"Galactic Crown",cost:3000000000,type:"auto",power:50000000,desc:"Commands a spiral of suns"},
 {id:"quasar",icon:"✹",name:"Quasar Throne",cost:90000000000,type:"auto",power:1400000000,desc:"Feeds upon a brilliant nucleus"},
 {id:"reality",icon:"◇",name:"Reality Root",cost:4000000000000,type:"auto",power:70000000000,desc:"Anchors creation to your will"},
 {id:"eternity",icon:"◈",name:"Eternity Furnace",cost:300000000000000,type:"auto",power:6000000000000,desc:"Burns the final age as fuel"},
 {id:"omniverse",icon:"✧",name:"Omniverse Seed",cost:20000000000000000,type:"auto",power:500000000000000,desc:"Germinates adjacent realities"}
];
const achievements=[
 {id:"first",name:"First Light",desc:"Harvest the core once.",test:s=>s.clicks>=1,reward:1},
 {id:"hundred",name:"Gathering Weight",desc:"Create 100 lifetime Essence.",test:s=>s.totalEssence>=100,reward:2},
 {id:"inferno",name:"World on Fire",desc:"Reach the Hadean Inferno.",test:s=>s.maxEra>=1,reward:3},
 {id:"engine",name:"Perpetual Motion",desc:"Reach 100 Essence per second.",test:s=>s.autoRate>=100,reward:4},
 {id:"verdant",name:"The Living World",desc:"Reach Verdant Bloom.",test:s=>s.maxEra>=3,reward:7},
 {id:"ascend",name:"The Second Genesis",desc:"Ascend for the first time.",test:s=>s.rebirthCount>=1,reward:12},
 {id:"thousand",name:"A Growing Hunger",desc:"Create 1,000 lifetime Essence.",test:s=>s.totalEssence>=1e3,reward:2},
 {id:"million",name:"Architect of Millions",desc:"Create 1 million lifetime Essence.",test:s=>s.totalEssence>=1e6,reward:8},
 {id:"billion",name:"Weight of Worlds",desc:"Create 1 billion lifetime Essence.",test:s=>s.totalEssence>=1e9,reward:18},
 {id:"trillion",name:"The Trillionth Spark",desc:"Create 1 trillion lifetime Essence.",test:s=>s.totalEssence>=1e12,reward:35},
 {id:"quadrillion",name:"Beyond Counting",desc:"Create 1 quadrillion lifetime Essence.",test:s=>s.totalEssence>=1e15,reward:70},
 {id:"quintillion",name:"The Long Number",desc:"Create 1 quintillion lifetime Essence.",test:s=>s.totalEssence>=1e18,reward:120},
 {id:"flow_million",name:"River of Stars",desc:"Reach 1 million Essence per second.",test:s=>s.autoRate>=1e6,reward:15},
 {id:"flow_billion",name:"Cosmic Deluge",desc:"Reach 1 billion Essence per second.",test:s=>s.autoRate>=1e9,reward:40},
 {id:"forge_hundred",name:"Master of the Forge",desc:"Own 100 upgrades in total.",test:s=>Object.values(s.upgradesOwned).reduce((a,b)=>a+b,0)>=100,reward:20},
 {id:"forge_five_hundred",name:"Reality Industrialised",desc:"Own 500 upgrades in total.",test:s=>Object.values(s.upgradesOwned).reduce((a,b)=>a+b,0)>=500,reward:65},
 {id:"comet_one",name:"Catch a Falling Star",desc:"Catch one rare comet.",test:s=>(s.cometsCaught||0)>=1,reward:10},
 {id:"comet_ten",name:"Comet Shepherd",desc:"Catch ten rare comets.",test:s=>(s.cometsCaught||0)>=10,reward:50},
 {id:"ascend_five",name:"Five Creations",desc:"Ascend five times.",test:s=>s.rebirthCount>=5,reward:45},
 {id:"ascend_twenty_five",name:"Endless Genesis",desc:"Ascend twenty-five times.",test:s=>s.rebirthCount>=25,reward:180}
];
const missions=[
 {name:"Awaken the core",desc:"Tap the core 25 times.",field:"clicks",target:25,reward:25},
 {name:"Gathering gravity",desc:"Create 750 lifetime Essence.",field:"totalEssence",target:750,reward:180},
 {name:"A world that moves",desc:"Reach 30 Essence per second.",field:"autoRate",target:30,reward:500},
 {name:"Feed the horizon",desc:"Create 15,000 lifetime Essence.",field:"totalEssence",target:15000,reward:4000},
 {name:"The green promise",desc:"Reach Verdant Bloom.",field:"maxEra",target:3,reward:18000},
 {name:"A million grains",desc:"Create 1 million lifetime Essence.",field:"totalEssence",target:1e6,reward:180000},
 {name:"An engine of suns",desc:"Reach 1 million Essence per second.",field:"autoRate",target:1e6,reward:3e6},
 {name:"Catch the wanderer",desc:"Catch a rare passing comet.",field:"cometsCaught",target:1,reward:12e6},
 {name:"Galactic treasury",desc:"Create 1 billion lifetime Essence.",field:"totalEssence",target:1e9,reward:250e6},
 {name:"The trillionth spark",desc:"Create 1 trillion lifetime Essence.",field:"totalEssence",target:1e12,reward:80e9},
 {name:"Beyond mortal counting",desc:"Create 1 quadrillion lifetime Essence.",field:"totalEssence",target:1e15,reward:90e12},
 {name:"A number without end",desc:"Create 1 quintillion lifetime Essence.",field:"totalEssence",target:1e18,reward:75e15}
];
const defaultState={essence:0,totalEssence:0,autoRate:0,clickPower:1,critChance:0,eraIndex:0,maxEra:0,upgradesOwned:{},aether:0,rebirthCount:0,clicks:0,cometsCaught:0,claimed:[],missionIndex:0,buyAmount:1,lastTick:Date.now(),nextComet:Date.now()+120000+Math.random()*120000};
let state=load(),toastTimer,cometTimer;
let upgradeSignature="",achievementSignature="";
const $=id=>document.getElementById(id);
function load(){try{const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||localStorage.getItem("chronos_save"));return raw?{...defaultState,...raw,upgradesOwned:{...(raw.upgradesOwned||{})},claimed:[...(raw.claimed||[])]}:{...defaultState};}catch{return {...defaultState}}}
function save(){state.lastTick=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(state))}
const numberTiers=[[1e3,"K"],[1e6,"M"],[1e9,"B"],[1e12,"T"],[1e15,"Qa"],[1e18,"Qi"],[1e21,"Sx"],[1e24,"Sp"],[1e27,"Oc"],[1e30,"No"],[1e33,"Dc"],[1e36,"Ud"],[1e39,"Dd"],[1e42,"Td"],[1e45,"Qad"],[1e48,"Qid"],[1e51,"Sxd"],[1e54,"Spd"],[1e57,"Ocd"],[1e60,"Nod"],[1e63,"Vg"],[1e66,"Uvg"],[1e69,"Dvg"],[1e72,"Tvg"]];
function format(n){if(!Number.isFinite(n))return"∞";const abs=Math.abs(n);if(abs<1000)return Math.floor(n).toLocaleString();let tier=numberTiers[0];for(const candidate of numberTiers){if(abs<candidate[0])break;tier=candidate}const value=n/tier[0],digits=value>=100?0:value>=10?1:2;return `${value.toFixed(digits)} ${tier[1]}`}
function multiplier(){return 1+state.aether*.12}
function rates(){let auto=0,click=1,crit=0;for(const u of upgrades){const n=state.upgradesOwned[u.id]||0;if(u.type==="auto")auto+=u.power*n;if(u.type==="click")click*=Math.pow(u.power,n);if(u.type==="crit")crit+=u.power*n}state.autoRate=auto*multiplier();state.clickPower=Math.max(1,Math.round(click*(1+state.eraIndex*.55)*multiplier()));state.critChance=Math.min(45,crit)}
function unitCost(u,count){return Math.floor(u.cost*Math.pow(1.18,count))}
function purchasePlan(u){let count=state.upgradesOwned[u.id]||0,total=0,qty=0,limit=state.buyAmount===Infinity?9999:state.buyAmount;while(qty<limit){const cost=unitCost(u,count+qty);if(total+cost>state.essence)break;total+=cost;qty++}return{qty,total,next:unitCost(u,count)}}
function buy(id){const u=upgrades.find(x=>x.id===id),plan=purchasePlan(u);if(!plan.qty)return;state.essence-=plan.total;state.upgradesOwned[id]=(state.upgradesOwned[id]||0)+plan.qty;rates();log(`Forged ${plan.qty} ${u.name}.`);update();save()}
function harvest(e){const crit=Math.random()*100<state.critChance,quick=Date.now()-(state.lastClick||0)<650;state.combo=quick?(state.combo||0)+1:0;state.lastClick=Date.now();const combo=Math.min(2.5,1+state.combo*.04),gain=state.clickPower*combo*(crit?5:1);state.essence+=gain;state.totalEssence+=gain;state.clicks++;spawn(e.clientX||innerWidth/2,e.clientY||innerHeight/2,`${crit?"CRITICAL ":""}+${format(gain)}`);const b=$("planetButton");b.classList.remove("harvest");void b.offsetWidth;b.classList.add("harvest");update()}
function spawn(x,y,text){const p=document.createElement("span");p.className="particle";p.textContent=text;p.style.left=x+"px";p.style.top=y+"px";document.body.append(p);setTimeout(()=>p.remove(),760)}
function log(text){$("eventLog").textContent=text}
function toast(text){const el=$("toast");el.textContent=text;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200)}
function currentEra(){let idx=0;eras.forEach((e,i)=>{if(state.totalEssence>=e.min)idx=i});return idx}
function renderEra(force=false){const idx=currentEra(),era=eras[idx];if(idx!==state.eraIndex||force){const changed=idx>state.eraIndex;state.eraIndex=idx;state.maxEra=Math.max(state.maxEra,idx);$("eraImage").src=era.image;$("eraImage").alt=era.alt;$("eraName").textContent=era.name;$("eraKicker").textContent=era.kicker;$("eraDesc").textContent=era.desc;$("planetButton").setAttribute("aria-label",`Harvest Essence from ${era.name}`);rates();if(changed){toast(`${era.name} awakened`);log(`A new era begins: ${era.name}.`)}}const next=eras[idx+1];if(next){const base=era.min,progress=(state.totalEssence-base)/(next.min-base);$("eraProgressLabel").textContent=`Next: ${next.name}`;$("eraProgressValue").textContent=`${format(state.totalEssence)} / ${format(next.min)}`;$("eraProgressBar").style.width=Math.min(100,progress*100)+"%"}else{$("eraProgressLabel").textContent="Final form achieved";$("eraProgressValue").textContent=format(state.totalEssence);$("eraProgressBar").style.width="100%"}}
function renderUpgrades(){const signature=upgrades.map(u=>{const p=purchasePlan(u);return `${u.id}:${state.upgradesOwned[u.id]||0}:${p.qty}:${p.total}:${state.essence>=p.next}`}).join("|")+":"+state.buyAmount;if(signature===upgradeSignature)return;upgradeSignature=signature;$("upgradeContainer").innerHTML=upgrades.map(u=>{const count=state.upgradesOwned[u.id]||0,plan=purchasePlan(u),price=plan.qty?plan.total:plan.next;return `<button class="upgrade" data-buy="${u.id}" onclick="buy('${u.id}')" ${state.essence<plan.next?"disabled":""}><span class="upgrade-icon">${u.icon}</span><span class="upgrade-copy"><strong>${u.name} · ${count}</strong><span>${u.desc}</span></span><span class="upgrade-price"><strong>${format(price)}</strong><small>${state.buyAmount===Infinity?`MAX ${plan.qty}`:state.buyAmount>1?`BUY ${plan.qty}`:"ESSENCE"}</small></span></button>`}).join("")}
function renderMission(){const done=state.missionIndex>=missions.length,m=missions[Math.min(state.missionIndex,missions.length-1)],current=done?m.target:Math.min(m.target,state[m.field]||0);$("missionName").textContent=done?"Prophecies fulfilled":m.name;$("missionDesc").textContent=done?"Ascend to begin the cycle with greater power.":m.desc;$("missionProgress").textContent=done?"COMPLETE":`${format(current)} / ${format(m.target)}`;$("missionReward").textContent=done?"":`+${format(m.reward)} essence`;$("missionBar").style.width=(done?100:current/m.target*100)+"%";if(!done&&current>=m.target){state.essence+=m.reward;state.totalEssence+=m.reward;state.missionIndex++;toast(`Prophecy fulfilled · +${format(m.reward)}`);log(`The prophecy “${m.name}” is complete.`);renderMission()}}
function renderAchievements(){const status=achievements.map(a=>`${a.id}:${a.test(state)}:${state.claimed.includes(a.id)}`).join("|");if(status===achievementSignature)return;achievementSignature=status;let ready=0;$("achievementList").innerHTML=achievements.map(a=>{const claimed=state.claimed.includes(a.id),complete=a.test(state);if(complete&&!claimed)ready++;return `<article class="achievement ${claimed?"claimed":complete?"ready":""}"><small>+${a.reward} AETHER</small><h2>${a.name}</h2><p>${a.desc}</p><button data-claim="${a.id}" onclick="claim('${a.id}')" ${!complete||claimed?"disabled":""}>${claimed?"RECORDED":complete?"CLAIM SEAL":"LOCKED"}</button></article>`}).join("");$("claimBadge").hidden=!ready}
function claim(id){const a=achievements.find(x=>x.id===id);if(!a||state.claimed.includes(id)||!a.test(state))return;state.claimed.push(id);state.aether+=a.reward;rates();toast(`Seal claimed · +${a.reward} Aether`);update();save()}
function anomaly(){const comet=$("cometButton");if(!comet.hidden||Date.now()<state.nextComet)return;state.nextComet=Date.now()+240000+Math.random()*240000;comet.style.setProperty("--comet-top",`${18+Math.random()*49}%`);comet.hidden=false;comet.style.animation="none";void comet.offsetWidth;comet.style.animation="";clearTimeout(cometTimer);cometTimer=setTimeout(()=>{if(comet.hidden)return;comet.hidden=true;log("A rare comet escaped beyond the horizon.");save()},9500);save()}
function catchComet(e){const comet=$("cometButton");if(comet.hidden)return;clearTimeout(cometTimer);comet.hidden=true;state.cometsCaught=(state.cometsCaught||0)+1;const reward=Math.max(5000,state.autoRate*180,state.clickPower*800);state.essence+=reward;state.totalEssence+=reward;spawn(e.clientX||innerWidth/2,e.clientY||innerHeight/2,`COMET +${format(reward)}`);toast(`Rare comet caught · +${format(reward)}`);log(`Comet ${state.cometsCaught} was caught before it crossed the horizon.`);update();save()}
function rewardForRise(){return Math.floor(Math.sqrt(state.totalEssence/100000))}
function renderRise(){const reward=rewardForRise();$("aetherDisplay").textContent=format(state.aether);$("aetherRewardDisplay").textContent=format(reward);$("aetherTopDisplay").textContent=format(state.aether);$("nextMultiplier").textContent=(1+(state.aether+reward)*.12).toFixed(2)+"×";$("rebirthButton").disabled=reward<1;$("rebirthRequirement").textContent=reward<1?`Create ${format(Math.max(0,100000-state.totalEssence))} more lifetime Essence to ascend.`:"Your upgrades, Essence, era and prophecies will reset."}
function ascend(){const reward=rewardForRise();if(reward<1)return;const keep={aether:state.aether+reward,rebirthCount:state.rebirthCount+1,claimed:state.claimed,cometsCaught:state.cometsCaught};state={...defaultState,...keep,lastTick:Date.now(),nextComet:Date.now()+120000+Math.random()*120000};rates();renderEra(true);toast(`Ascended · +${reward} Aether`);setView("home");update();save()}
function update(){renderEra();$("essenceDisplay").textContent=format(state.essence);$("flowDisplay").textContent=format(state.autoRate)+"/s";$("clickPower").textContent="+"+format(state.clickPower);renderUpgrades();renderMission();renderAchievements();renderRise()}
function setView(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===name));if(name==="achievements")renderAchievements();if(name==="rebirth")renderRise()}
function offlineGain(){const seconds=Math.min(14400,Math.max(0,(Date.now()-(state.lastTick||Date.now()))/1000));rates();const gain=state.autoRate*seconds;if(gain>=1){state.essence+=gain;state.totalEssence+=gain;setTimeout(()=>toast(`While away · +${format(gain)} Essence`),350)}}
$("planetButton").addEventListener("click",harvest);$("buyMode").addEventListener("click",()=>{state.buyAmount=state.buyAmount===1?10:state.buyAmount===10?Infinity:1;$("buyMode").textContent=state.buyAmount===Infinity?"BUY MAX":`BUY ${state.buyAmount}`;upgradeSignature="";renderUpgrades()});$("cometButton").addEventListener("click",catchComet);$("rebirthButton").addEventListener("click",ascend);document.addEventListener("keydown",e=>{if(e.code==="Space"&&document.querySelector("#view-home.active")&&!e.repeat&&!e.target.closest("button,input,select,textarea")){e.preventDefault();harvest({clientX:innerWidth*.42,clientY:innerHeight*.5})}});
addEventListener("hashchange",()=>setView(location.hash.slice(1)||"home"));
offlineGain();rates();renderEra(true);update();setView(location.hash.slice(1)||"home");setInterval(()=>{const delta=Math.min(.25,(Date.now()-state.lastTick)/1000);state.lastTick=Date.now();if(state.autoRate){const gain=state.autoRate*delta;state.essence+=gain;state.totalEssence+=gain}anomaly();update()},250);setInterval(save,8000);addEventListener("pagehide",save);
