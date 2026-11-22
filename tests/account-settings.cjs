const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
class Element {
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.dataset={};this.listeners={};this.value='';this.textContent='';this.classList={add(){},remove(){}};}
 setAttribute(k,v){this.attributes[k]=String(v);if(k==='hidden')this.hidden=true;}
 append(...v){this.children.push(...v);}
 replaceChildren(...v){this.children=v;}
 addEventListener(k,fn){this.listeners[k]=fn;}
 contains(e){return this===e||this.children.some(c=>c.contains(e));}
}
const walk=e=>[e,...e.children.flatMap(walk)];
async function setup(native=false,hash=''){
 const user={uid:'existing-uid',email:'old@example.com',displayName:'OldPlayer',providerData:[{providerId:'password'}]},auth={currentUser:user};
 const profile={username:'OldPlayer',gamesPlayed:57,createdAt:1,updatedAt:2};const calls=[],opens=[],ids=new Map();let reauthError=null,linkError=null,observer;
 for(const id of ['homeAccountAction','homeSettingsMenu','homeSettingsToggle','rs-settings-account-summary'])ids.set(id,new Element('button'));
 const document={head:new Element('head'),body:new Element('body'),createElement:t=>new Element(t),getElementById:id=>ids.get(id)||null,querySelector:()=>null,addEventListener(){}};
 const sdk={getAuth:()=>auth,setPersistence:async()=>{},onAuthStateChanged:(_a,fn)=>{observer=fn;fn(user);},
  EmailAuthProvider:{credential:(email,password)=>({email,password})},GoogleAuthProvider:class{setCustomParameters(){}},
  reauthenticateWithCredential:async(u,c)=>{calls.push(['reauth',u.uid]);if(reauthError)throw reauthError;if(c.password!=='correct')throw {code:'auth/invalid-credential'};},
  updateProfile:async(u,p)=>Object.assign(u,p),verifyBeforeUpdateEmail:async(u,email)=>calls.push(['email',u.uid,email]),
  updatePassword:async(u,p)=>calls.push(['password',u.uid,p]),
  linkWithPopup:async(u)=>{calls.push(['link',u.uid]);if(linkError)throw linkError;u.providerData.push({providerId:'google.com',email:'google@example.com'});return {user:u};},
  reload:async()=>{},signOut:async()=>{auth.currentUser=null;await observer(null);}};
 const db={getFirestore:()=>({}),doc:(_d,...p)=>p.join('/'),collection:()=>'',getDocs:async()=>({docs:[]}),getDoc:async()=>({exists:()=>true,data:()=>({...profile})}),serverTimestamp:()=>999,
  updateDoc:async(ref,patch)=>{calls.push(['write',ref,{...patch}]);Object.assign(profile,patch);}};
 const context=vm.createContext({document,console,location:{hostname:'127.0.0.1',hash},__rodSpaceMacApp:native,open:(...v)=>opens.push(v),localStorage:{getItem:()=>null,setItem(){},length:0},setTimeout,clearTimeout,setInterval,clearInterval});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../rod-space-account.js'),'utf8'),context,{importModuleDynamically:async spec=>{const exports=spec.includes('firebase-app')?{getApps:()=>[],initializeApp:()=>({})}:spec.includes('firebase-auth')?sdk:db;const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const[k,v]of Object.entries(exports))this.setExport(k,v)},{context});await m.link(()=>{});await m.evaluate();return m;}});
 await context.RodSpaceAccounts.ready;
 const open=()=>ids.get('homeAccountAction').onclick();open();
 const find=predicate=>walk(document.body).find(predicate),input=name=>find(e=>e.attributes.name===name),button=text=>find(e=>e.textContent===text),submit=async name=>{const form=find(e=>e.attributes['aria-label']===name);assert.ok(form,'settings form '+name+' exists');await form.onsubmit({preventDefault(){}});};
 return {user,profile,calls,opens,ids,context,document,input,button,submit,open,reauthError:e=>reauthError=e,linkError:e=>linkError=e,text:()=>walk(document.body).map(e=>e.textContent).join(' ')};
}
(async()=>{
 let h=await setup();assert.equal(h.ids.get('rs-settings-account-summary').textContent,'Account: OldPlayer');
 h.input('account-username').value='Bad user';await h.submit('Change username');assert.equal(h.calls.length,0);
 h.input('account-username').value='NewPlayer';await h.submit('Change username');assert.equal(h.profile.username,'NewPlayer');assert.equal(h.profile.gamesPlayed,57);assert.equal(h.profile.createdAt,1);assert.equal(h.user.uid,'existing-uid');assert.equal(h.ids.get('rs-settings-account-summary').textContent,'Account: NewPlayer');
 assert.deepEqual(Object.keys(h.calls.find(c=>c[0]==='write')[2]).sort(),['updatedAt','username']);
 h.input('account-email').value='new@example.com';h.input('current-password').value='wrong';await h.submit('Change email');assert.equal(h.calls.filter(c=>c[0]==='email').length,0);
 h.input('current-password').value='correct';await h.submit('Change email');assert.deepEqual(h.calls.find(c=>c[0]==='email'),['email','existing-uid','new@example.com']);assert.equal(h.user.email,'old@example.com','email stays unchanged until verification');assert.equal(h.input('current-password').value,'');
 h.input('new-password').value='newpassword';h.input('confirm-password').value='different';await h.submit('Change password');assert.equal(h.calls.filter(c=>c[0]==='password').length,0);
 h.input('new-password').value='newpassword';h.input('confirm-password').value='newpassword';h.input('current-password').value='correct';await h.submit('Change password');assert.deepEqual(h.calls.find(c=>c[0]==='password'),['password','existing-uid','newpassword']);assert.equal(h.input('new-password').value,'');
 h.input('current-password').value='correct';h.linkError({code:'auth/credential-already-in-use'});await h.button('Connect Google').onclick();assert.equal(h.calls.filter(c=>c[0]==='link').length,0,'password is confirmed before opening Google');await h.button('Choose Google account').onclick();assert.equal(h.user.uid,'existing-uid');assert.match(h.text(),/already.*another/i);
 h.linkError(null);await h.button('Choose Google account').onclick();assert.ok(h.button('Google connected'));assert.equal(h.profile.gamesPlayed,57);
 await h.button('Sign out').onclick();assert.equal(h.context.RodSpaceAccounts.user,null);
 h=await setup(true);await h.button('Connect Google').onclick();assert.equal(h.calls.filter(c=>c[0]==='link').length,0);assert.equal(h.opens.length,1);const target=new URL(h.opens[0][0]);assert.equal(target.origin,'https://solormenezes.github.io');assert.match(target.hash,/existing-uid/);
 h=await setup(false,'#account=connect-google&uid=another-uid');h.input('current-password').value='correct';await h.button('Connect Google').onclick();assert.equal(h.calls.length,0,'Mac handoff never links the wrong website account');
 h=await setup(false,'#account=connect-google&uid=%');assert.ok(h.button('Connect Google'),'malformed fragment cannot break accounts');
 if(process.argv.includes('--preview')){
  h=await setup();
  const escape=v=>String(v).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
  function html(e){const attrs={...e.attributes};if(!e.hidden)delete attrs.hidden;if(e.className)attrs.class=e.className;if(e.type)attrs.type=e.type;if(e.value)attrs.value=e.value;return `<${e.tagName.toLowerCase()} ${Object.entries(attrs).map(([k,v])=>`${k}="${escape(v)}"`).join(' ')}>${escape(e.textContent)}${e.children.map(html).join('')}</${e.tagName.toLowerCase()}>`;}
  fs.writeFileSync('/private/tmp/rodspace-account-settings-preview.html',`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">${h.document.head.children.map(html).join('')}</head><body style="margin:0;background:#0d1117">${h.document.body.children.map(html).join('')}</body></html>`);
 }
 console.log('PASS account label, profile-only rename, reauthentication, verified email change, password confirmation, Google collisions, native browser handoff and sign out');
})().catch(e=>{console.error(e);process.exitCode=1});
