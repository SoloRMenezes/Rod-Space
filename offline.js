window.offlineDownloads=new Map();
window.offlineOnly=!navigator.onLine;
let offlineWorker, offlineBusy=null;
const offlineSize=n=>n<1024*1024?`${Math.ceil(n/1024)} KB`:`${(n/1024/1024).toFixed(1)} MB`;
window.offlineCardHTML=id=>{
  const game=OFFLINE_CATALOG[id];if(!game)return '';
  const saved=offlineDownloads.get(id),busy=offlineBusy===id;
  return `<div style="margin-top:14px;display:flex;gap:8px;align-items:center;font-size:12px;color:#94a3b8"><button type="button" data-offline-id="${id}" ${!offlineWorker||offlineBusy?'disabled':''} style="border:1px solid #334155;border-radius:6px;padding:6px 9px;color:#cbd5e1;cursor:pointer;opacity:${!offlineWorker||offlineBusy?.length?'.5':'1'}">${busy?'Downloading…':saved?'Offload':'↓ Download'}</button><span>${saved?'✓ Offline · ':''}${offlineSize(saved?.bytes||game.bytes)}</span>${saved&&saved.version!==game.version?`<button data-offline-update="${id}" ${offlineBusy?'disabled':''}>Update</button>`:''}</div>`;
};
function offlineRefresh(){
  document.getElementById('offline-count').textContent=`${offlineDownloads.size} / 5`;
  document.getElementById('offline-storage').textContent=' · '+offlineSize([...offlineDownloads.values()].reduce((n,g)=>n+g.bytes,0))+' downloaded';
  document.getElementById('offline-filter').setAttribute('aria-pressed',String(offlineOnly));
  document.getElementById('offline-filter').style.background=offlineOnly?'#1e3a5f':'transparent';
  window.refreshOfflineCards?.();
}
function offlineCall(action,id,onProgress){return new Promise((resolve,reject)=>{
  const channel=new MessageChannel();
  channel.port1.onmessage=({data})=>{
    if(data.progress!==undefined){onProgress?.(data.progress);return;}
    channel.port1.close();
    if(data.error)reject(Error(data.error));else resolve(data.items);
  };
  offlineWorker.postMessage({action,id},[channel.port2]);
});}
async function offlineAction(id,update=false){
  if(offlineBusy||!offlineWorker)return;
  const remove=offlineDownloads.has(id)&&!update;
  if(!remove&&!navigator.onLine){document.getElementById('offline-status').textContent='Connect to the internet to download a game.';return;}
  if(!remove&&!offlineDownloads.has(id)&&offlineDownloads.size>=5){document.getElementById('offline-status').textContent='You have five games downloaded. Offload one to make room.';return;}
  offlineBusy=id;offlineRefresh();
  const status=document.getElementById('offline-status');
  status.textContent=remove?'Removing downloaded files…':'Downloading '+OFFLINE_CATALOG[id].name+'…';
  try {
    const items=await offlineCall(remove?'offload':'download',id,p=>status.textContent=`Downloading ${OFFLINE_CATALOG[id].name} · ${p}%`);
    offlineDownloads=new Map(items.map(x=>[x.id,x]));
    status.textContent=remove?'Offloaded. Your saved progress is kept.':'Ready to play offline. Downloads are saved on this browser and device.';
    if(!remove) navigator.storage?.persist?.().catch(()=>{});
  } catch(error){status.textContent=error.message;}
  finally{offlineBusy=null;offlineRefresh();}
}
document.addEventListener('click',e=>{
  const button=e.target.closest('[data-offline-id],[data-offline-update]');
  if(button){e.preventDefault();e.stopPropagation();offlineAction(button.dataset.offlineId||button.dataset.offlineUpdate,!!button.dataset.offlineUpdate);}
});
document.getElementById('offline-filter').onclick=()=>{offlineOnly=!offlineOnly;offlineRefresh();};
window.addEventListener('offline',()=>{offlineOnly=true;offlineRefresh();document.getElementById('offline-status').textContent='You’re offline. Downloaded games are ready to play.';});
window.addEventListener('online',()=>{document.getElementById('offline-status').textContent='Back online. You can download or update games.';});
(async()=>{
  try{
    if(!('serviceWorker'in navigator))throw Error('Offline downloads are not supported in this browser.');
    let registration=await navigator.serviceWorker.getRegistration('./');
    if (!registration?.active) {
      await navigator.serviceWorker.register('./sw.js');
      registration=await navigator.serviceWorker.ready;
    } else { navigator.serviceWorker.register('./sw.js').catch(()=>{}); }
    offlineWorker=registration.active;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{offlineWorker=navigator.serviceWorker.controller;});
    offlineDownloads=new Map((await offlineCall('status')).map(x=>[x.id,x]));
    document.getElementById('offline-status').textContent=navigator.onLine?'Keep up to five games for offline play. Offloading keeps your saves.':'You’re offline. Choose a downloaded game.';
    offlineRefresh();
  }catch(error){document.getElementById('offline-status').textContent=error.message;}
})();
