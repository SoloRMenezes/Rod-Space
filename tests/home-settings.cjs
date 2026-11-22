const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
class Element {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.listeners={};this.dataset={};this.textContent='';this.value='';this.disabled=false;this.hidden=false;const classes=new Set();this.classList={add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle(c,value){const on=value===undefined?!classes.has(c):value;on?classes.add(c):classes.delete(c);return on;}};}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='hidden')this.hidden=true;}
  getAttribute(k){return this.attributes[k]??null;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  addEventListener(k,fn){this.listeners[k]=fn;}
  contains(node){return this===node||this.children.some(c=>c.contains(node));}
  querySelector(){return null;}
  focus(){}
}
async function start(stored='dark'){
 const ids=new Map(),header=new Element(),body=new Element('body'),root=new Element('html'),storage=new Map([['rodspace.arcade.theme',stored]]);
 for(const id of ['homeSettingsToggle','homeSettingsMenu','homeAccountAction','rs-settings-account-summary','homeThemeToggle']){const el=new Element(id.includes('Toggle')||id==='homeAccountAction'?'button':'div');el.setAttribute('id',id);ids.set(id,el);}
 ids.get('homeSettingsToggle').setAttribute('aria-expanded','false');ids.get('homeSettingsMenu').classList.add('hidden');ids.get('homeSettingsMenu').append(ids.get('homeAccountAction'),ids.get('homeThemeToggle'));
 header.append(ids.get('homeSettingsToggle'),ids.get('homeSettingsMenu'));
 const all=e=>[e,...e.children.flatMap(all)];
 const document={body,head:new Element('head'),documentElement:root,createElement:t=>new Element(t),getElementById:id=>ids.get(id)||all(header).find(e=>e.attributes.id===id)||null,querySelector:()=>header,addEventListener(){}};
 const context=vm.createContext({document,location:{hostname:'127.0.0.1'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console,setTimeout,clearTimeout,setInterval,clearInterval});
 const exportsFor=spec=>spec.includes('firebase-app')?{getApps:()=>[],initializeApp:()=>({})}:spec.includes('firebase-auth')?{getAuth:()=>({}),setPersistence:async()=>{},onAuthStateChanged:(_a,fn)=>fn(null)}:{getFirestore:()=>({})};
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../rod-space-account.js'),'utf8'),context,{importModuleDynamically:async spec=>{const exports=exportsFor(spec);const mod=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v] of Object.entries(exports))this.setExport(k,v)},{context});await mod.link(()=>{});await mod.evaluate();return mod;}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../site-theme.js'),'utf8'),context);
 await context.RodSpaceAccounts.ready;
 return {ids,header,body,root,storage};
}
(async()=>{
 const h=await start();
 assert.equal(h.header.children.length,2,'accounts must reuse the home settings menu rather than add a second Settings button');
 h.ids.get('homeSettingsToggle').listeners.click();
 assert.equal(h.ids.get('homeSettingsMenu').classList.contains('hidden'),false);
 assert.equal(typeof h.ids.get('homeAccountAction').onclick,'function','Account in home menu is wired to the shared account system');
 h.ids.get('homeAccountAction').onclick();
 assert.equal(h.ids.get('homeSettingsMenu').classList.contains('hidden'),true);
 assert.equal(h.ids.get('homeSettingsToggle').getAttribute('aria-expanded'),'false');
 const modal=h.body.children.find(e=>e.className==='rs-account-overlay');
 assert.equal(modal.hidden,false,'Account opens the existing shared sign-in dialog');
 assert.equal(modal.children[0].children[0].children[0].textContent,'Sign in');
 const toggle=h.ids.get('homeThemeToggle');
 assert.equal(toggle.getAttribute('aria-checked'),'true','dark theme is reflected by switch state');
 toggle.listeners.click();
 assert.equal(h.root.classList.contains('rod-light'),true);
 assert.equal(toggle.getAttribute('aria-checked'),'false');
 assert.equal(h.storage.get('rodspace.arcade.theme'),'light','theme uses the existing cross-page storage key');
 toggle.listeners.click();assert.equal(h.root.classList.contains('rod-light'),false);
 const light=await start('light');assert.equal(light.root.classList.contains('rod-light'),true);assert.equal(light.ids.get('homeThemeToggle').getAttribute('aria-checked'),'false');
 console.log('PASS unified home settings, shared account entry, persisted theme and accessible sun/moon switch state');
})().catch(e=>{console.error(e);process.exitCode=1;});
