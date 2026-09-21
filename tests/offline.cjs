const {readFileSync}=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const root=require('node:path').resolve(__dirname,'..'),handlers={},stores=new Map();let online=true,corrupt=false;
const cache=()=>({data:new Map(),async match(k){return this.data.get(k)?.clone()},async put(k,v){this.data.set(k,v.clone())},async addAll(urls){for(const u of urls)await this.put(u,await context.fetch(u))}});
const context={URL,Response,Headers,crypto:webcrypto,console,self:{location:{href:'https://example.test/Rod-Space/sw.js'},addEventListener:(n,f)=>handlers[n]=f,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{keys:async()=>[...stores.keys()],open:async k=>{if(!stores.has(k))stores.set(k,cache());return stores.get(k)},delete:async k=>stores.delete(k)},fetch:async u=>{if(!online)throw Error('offline');let f=decodeURIComponent(new URL(typeof u==='string'?u:u.url).pathname.replace('/Rod-Space/',''))||'index.html';return new Response(corrupt?'bad':readFileSync(root+'/'+f))}};
vm.createContext(context);context.importScripts=()=>vm.runInContext(readFileSync(root+'/offline-catalog.js','utf8'),context);vm.runInContext(readFileSync(root+'/sw.js','utf8'),context);
async function message(action,id){let pending,result;handlers.message({data:{action,id},ports:[{postMessage:r=>{if(r.done||r.error)result=r}}],waitUntil:p=>pending=p});await pending;return result;}
async function request(path,mode='navigate'){let pending;handlers.fetch({request:{url:'https://example.test/Rod-Space/'+path,method:'GET',mode},respondWith:p=>pending=p});return pending;}
(async()=>{
 let pending;handlers.install({waitUntil:p=>pending=p});await pending;
 const ids=['reaction','multiplayer-test','web_weavers','backrooms','sling-champ','nextup'];
 assert.equal(Object.keys(context.self.OFFLINE_CATALOG).length,37);
 corrupt=true;assert.match((await message('download',ids[0])).error,/changed/);assert.equal((await message('status')).items.length,0);corrupt=false;
 for(const id of ids.slice(0,5))assert.equal((await message('download',id)).items.some(g=>g.id===id),true);
 assert.equal((await message('download',ids[5])).items.length,6);
 assert.equal((await message('download','shit-spiral')).items.some(g=>g.id==='shit-spiral'),true);
 online=false;for(const f of context.self.OFFLINE_CATALOG['shit-spiral'].files)assert.equal((await request(f.path,'cors')).status,200);online=true;
 assert.equal((await message('offload','shit-spiral')).items.some(g=>g.id==='shit-spiral'),false);
 online=false;
 for(const id of ids){const g=context.self.OFFLINE_CATALOG[id];for(const f of g.files)assert.equal((await request(f.path,'cors')).status,200);}
 assert.match(await (await request('')).text(),/ROD/);
 assert.equal((await request('not-downloaded.html')).status,503);
 assert.equal((await message('offload',ids[0])).items.length,5);
 online=true;assert.equal((await message('download',ids[0])).items.length,6);
 assert.equal((await request('nextup')).status,302);
 let rangeResponse;handlers.fetch({request:{url:'https://example.test/Rod-Space/nextup/index.html',method:'GET',mode:'cors',headers:new Headers({range:'bytes=0-9'})},respondWith:p=>rangeResponse=p});
 assert.equal((await rangeResponse).status,206);assert.equal((await (await rangeResponse).arrayBuffer()).byteLength,10);
 console.log('PASS: corrupt download rollback, more than five downloads, all cached assets offline, offline hub, missing-game fallback, offload and replacement.');
})().catch(e=>{console.error(e);process.exitCode=1});
