importScripts('./offline-catalog.js');
const SHELL = 'rod-shell-26fa81f0c96b941a';
const PREFIX = 'rod-game-';
const BASE = new URL('./', self.location.href);
const absolute = p => new URL(p, BASE).href;
const META = absolute('__offline_metadata__');
const shellFiles = ['./','index.html','offline.js','offline-catalog.js','assets/vendor/tailwind.js','assets/vendor/lucide.js'];
self.addEventListener('install', e => e.waitUntil((async () => {
  const cache = await caches.open(SHELL);
  await cache.addAll(shellFiles.map(absolute));
  await self.skipWaiting();
})()));
self.addEventListener('activate', e => e.waitUntil((async()=>{
  for(const key of await caches.keys()) if(key.startsWith('rod-shell-')&&key!==SHELL) await caches.delete(key);
  await self.clients.claim();
})()));
async function installed(verify=true) {
  const list=[];
  for (const key of await caches.keys()) {
    if (!key.startsWith(PREFIX)) continue;
    const cache=await caches.open(key), response=await cache.match(META);
    if (!response) continue;
    const item=await response.json();
    // A partial or evicted cache must never be advertised as ready.
    if (!verify || (await Promise.all(item.files.map(f=>cache.match(absolute(f.path))))).every(Boolean)) list.push({...item,key});
  }
  return list;
}
let busy=false;
self.addEventListener('message', e => {
  const port=e.ports[0]; if(!port) return;
  e.waitUntil((async()=>{
    const {action,id}=e.data||{};
    try {
      if(action==='status') {port.postMessage({done:true,items:await installed()});return;}
      if(busy) throw Error('Another download is in progress. Try again when it finishes.');
      busy=true;
      try {
        const current=await installed();
        if(action==='offload') {
          for(const key of await caches.keys()) if(key.startsWith(PREFIX+id+'-')) await caches.delete(key);
        } else if(action==='download') {
          const game=self.OFFLINE_CATALOG[id]; if(!game) throw Error('This game is not available offline yet.');
          if(!current.some(x=>x.id===id)&&current.length>=5) throw Error('Five games are downloaded. Offload one first.');
          const key=PREFIX+id+'-'+game.version;
          if(current.some(x=>x.key===key)) {port.postMessage({done:true,items:current});return;}
          await caches.delete(key);
          const cache=await caches.open(key);
          let loaded=0;
          try {
            for(const file of game.files) {
              const response=await fetch(absolute(file.path),{cache:'no-store'});
              if(!response.ok) throw Error('Could not download '+file.path);
              const bytes=await response.clone().arrayBuffer();
              const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
              if(hash!==file.hash) throw Error('The game has changed. Refresh Rod Space and try again.');
              await cache.put(absolute(file.path),response);
              loaded+=bytes.byteLength; port.postMessage({progress:Math.round(loaded/game.bytes*100)});
            }
            await cache.put(META,new Response(JSON.stringify({...game,id}),{headers:{'Content-Type':'application/json'}}));
          } catch(error) {await caches.delete(key);throw error;}
          for(const old of current.filter(x=>x.id===id&&x.key!==key)) await caches.delete(old.key);
        } else throw Error('Unknown download action.');
        port.postMessage({done:true,items:await installed()});
      } finally {busy=false;}
    } catch(error) {port.postMessage({error:error.name==='QuotaExceededError'?'Not enough device storage. Offload a game and try again.':error.message});}
  })());
});
self.addEventListener('fetch', e => {
  const url=new URL(e.request.url);
  if(e.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname)) return;
  e.respondWith((async()=>{
    url.search='';url.hash='';
    for(const item of await installed(false)) {
      const hit=await (await caches.open(item.key)).match(url.href);
      if(hit) return hit;
    }
    try {return await fetch(e.request);} catch(error) {
      const hit=await (await caches.open(SHELL)).match(url.href);
      if(hit) return hit;
      if(e.request.mode==='navigate') return new Response('<meta name="viewport" content="width=device-width"><body style="background:#0d1117;color:#eee;font:18px system-ui;padding:32px"><h1>This game is not downloaded</h1><p>Connect to the internet to download it first.</p><a style="color:#7abaff" href="'+BASE.href+'">Open offline games</a>',{headers:{'Content-Type':'text/html'},status:503});
      throw error;
    }
  })());
});
