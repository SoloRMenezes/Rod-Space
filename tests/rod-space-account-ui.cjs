const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
class Element {
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.attributes={};this.dataset={};this.hidden=false;this.textContent="";this.className="";this.style={};this.value="";this.disabled=false;this.validity={valid:true};}
 setAttribute(key,value){this.attributes[key]=String(value);if(key==="hidden")this.hidden=true;}
 append(...nodes){this.children.push(...nodes);nodes.forEach(node=>node.parentElement=this);}
 replaceChildren(...nodes){this.children=[...nodes];nodes.forEach(node=>node.parentElement=this);}
 addEventListener(name,fn){this.listeners[name]=fn;}
 contains(target){return this===target||this.children.some(child=>child.contains(target));}
}
const elements=new Map(),header=new Element("header"),resetCalls=[],storage=new Map(),intervals=new Map();let nextInterval=0;const document={
 createElement:tag=>new Element(tag),head:new Element("head"),body:new Element("body"),
 querySelector:()=>header,querySelectorAll:()=>[],getElementById:id=>elements.get(id)||null,
 addEventListener(){},
};
const originalAppend=Element.prototype.append;
Element.prototype.append=function(...nodes){originalAppend.call(this,...nodes);for(const node of nodes)if(node.attributes?.id)elements.set(node.attributes.id,node);};
const context={document,console:{warn(){}},location:{hostname:"localhost"},localStorage:{getItem(key){return storage.get(key)||null},setItem(key,value){storage.set(key,String(value))}},
 setTimeout,clearTimeout,setInterval(fn){const id=++nextInterval;intervals.set(id,fn);return id},clearInterval(id){intervals.delete(id)},Promise,Map,Set,Date,Math,Number,String,Object,Array,JSON,
 import:undefined};
vm.createContext(context);
const appSdk={getApps:()=>[],initializeApp:()=>({})},authSdk={getAuth:()=>({}),setPersistence:async()=>{},onAuthStateChanged:(_auth,callback)=>callback(null),sendPasswordResetEmail:async(_auth,email)=>resetCalls.push(email)},dbSdk={getFirestore:()=>({})};
vm.runInContext(fs.readFileSync(path.join(__dirname,"..","rod-space-account.js"),"utf8"),context,{filename:"rod-space-account.js",importModuleDynamically:async specifier=>{
 const exports=specifier.includes("firebase-app")?appSdk:specifier.includes("firebase-auth")?authSdk:dbSdk;
 const module=new vm.SyntheticModule(Object.keys(exports),function(){for(const [name,value] of Object.entries(exports))this.setExport(name,value)},{context});
 await module.link(()=>{});await module.evaluate();return module;
}});
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
(async()=>{
 await new Promise(resolve=>setTimeout(resolve,0));
 settings.onclick();
 const overlay=document.body.children.find(item=>item.className==="rs-account-overlay");assert.ok(overlay,"settings opens account dialog");
 const dialog=overlay.children[0],body=dialog.children[1],form=body.children.find(item=>item.tagName==="FORM");assert.ok(form,"signed-out account dialog shows sign-in form");
 const emailInput=form.children.find(item=>item.tagName==="LABEL"&&item.children[0]?.type==="email").children[0],reset=body.children.find(item=>item.className==="rs-account-links").children.find(item=>item.textContent==="Forgot password?");
 emailInput.value="player@example.com";
 await reset.onclick();
 assert.deepEqual(resetCalls,["player@example.com"],"password reset sends one email");
 assert.equal(reset.disabled,true,"reset email button is disabled during the cooldown");
 assert.match(reset.textContent,/Resend in 60s/,"reset email button shows the one-minute cooldown");
 await reset.onclick();assert.equal(resetCalls.length,1,"repeated clicks cannot send a second email during the cooldown");
 settings.onclick();
 const reopenedBody=dialog.children[1],reopenedReset=reopenedBody.children.find(item=>item.className==="rs-account-links").children.find(item=>item.textContent.startsWith("Resend in"));
 assert.ok(reopenedReset?.disabled,"reset cooldown persists if the account dialog is reopened");
 assert.match(reopenedReset.textContent,/Resend in \d+s/,"reopened dialog keeps the remaining cooldown visible");
 overlay.render();
 console.log("PASS: Account dropdown limits game stats and password reset uses a persistent 60-second cooldown.");
})().catch(error=>{console.error(error);process.exitCode=1});
