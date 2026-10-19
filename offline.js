window.offlineDownloads = new Map();
window.offlineOnly = !navigator.onLine;

let offlineWorker;
let offlineBusy = null;
let offlineProgress = 0;
let offlineStatusTimer;
const offlineQueue = new Map();

const offlineSize = bytes => bytes < 1024 * 1024
  ? `${Math.ceil(bytes / 1024)} KB`
  : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function sortedOfflineQueue() {
  return [...offlineQueue.values()].sort((a, b) => {
    if (a.action !== b.action) return a.action === 'offload' ? -1 : 1;
    return (OFFLINE_CATALOG[a.id]?.bytes || 0) - (OFFLINE_CATALOG[b.id]?.bytes || 0);
  });
}

window.offlineCardHTML = id => {
  const game = OFFLINE_CATALOG[id];
  if (!game) return '';
  const saved = offlineDownloads.get(id);
  const busy = offlineBusy?.id === id;
  const queue = sortedOfflineQueue();
  const queuedIndex = queue.findIndex(item => item.id === id);
  const queued = queuedIndex >= 0;
  const label = busy
    ? `${offlineBusy.action === 'offload' ? 'Removing' : `Downloading ${offlineProgress}%`}…`
    : queued ? `Queued #${queuedIndex + 1}` : saved ? '✓ Downloaded' : '↓ Download game';
  const disabled = !offlineWorker || busy;
  const hint = queued ? 'Click to remove from the queue' : saved ? 'Remove offline copy' : 'Add to download queue';
  return `<div style="margin-top:14px;display:flex;gap:8px;align-items:center;font-size:12px;color:#94a3b8"><button type="button" data-offline-id="${id}" ${disabled ? 'disabled' : ''} title="${hint}" style="border:1px solid #475569;border-radius:8px;padding:8px 11px;background:${saved ? '#052e2b' : '#172033'};color:${saved ? '#6ee7b7' : '#e2e8f0'};font-weight:700;cursor:${disabled ? 'default' : 'pointer'};opacity:${disabled ? '.55' : '1'}">${label}</button><span>${offlineSize(saved?.bytes || game.bytes)}</span>${saved && saved.version !== game.version && !queued && !busy ? `<button data-offline-update="${id}">Update</button>` : ''}</div>`;
};

function bulkIds(button) {
  return button.dataset.offlineAll === 'party'
    ? (window.partyOfflineIds || [])
    : Object.keys(OFFLINE_CATALOG);
}

function refreshOfflineBulkButtons() {
  document.querySelectorAll('[data-offline-all]').forEach(button => {
    const ids = bulkIds(button).filter(id => OFFLINE_CATALOG[id]);
    const remaining = ids.filter(id => !offlineDownloads.has(id) || offlineDownloads.get(id).version !== OFFLINE_CATALOG[id].version).length;
    button.disabled = !offlineWorker || !remaining;
    button.textContent = remaining ? `↓ Download all (${remaining})` : '✓ All downloaded';
  });
}

function offlineRefresh() {
  window.refreshOfflineCards?.();
  refreshOfflineBulkButtons();
}

function offlineCall(action, id, onProgress) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = ({data}) => {
      if (data.progress !== undefined) { onProgress?.(data.progress); return; }
      channel.port1.close();
      if (data.error) reject(Error(data.error));
      else resolve(data.items);
    };
    offlineWorker.postMessage({action, id}, [channel.port2]);
  });
}

function updateOfflineStatus(message) {
  clearTimeout(offlineStatusTimer);
  const waiting = offlineQueue.size;
  document.getElementById('offline-status').textContent = message + (waiting ? ` · ${waiting} queued` : '');
}

function showOfflineResult(message) {
  updateOfflineStatus(message);
  offlineStatusTimer = setTimeout(() => {
    if (!offlineBusy && !offlineQueue.size) document.getElementById('offline-status').textContent = '';
  }, 5000);
}

async function processOfflineQueue() {
  if (offlineBusy || !offlineWorker) return;
  const next = sortedOfflineQueue()[0];
  if (!next) return;
  offlineQueue.delete(next.id);
  offlineBusy = next;
  offlineProgress = 0;
  offlineRefresh();
  updateOfflineStatus(next.action === 'offload' ? `Removing ${OFFLINE_CATALOG[next.id].name}…` : `Downloading ${OFFLINE_CATALOG[next.id].name}…`);
  try {
    const items = await offlineCall(next.action, next.id, progress => {
      offlineProgress = progress;
      updateOfflineStatus(`Downloading ${OFFLINE_CATALOG[next.id].name} · ${progress}%`);
      offlineRefresh();
    });
    offlineDownloads = new Map(items.map(item => [item.id, item]));
    if (next.action === 'download') navigator.storage?.persist?.().catch(() => {});
    showOfflineResult(next.action === 'offload'
      ? `${OFFLINE_CATALOG[next.id].name} removed from offline games.`
      : `✓ ${OFFLINE_CATALOG[next.id].name} downloaded for offline play.`);
  } catch (error) {
    showOfflineResult(`Download failed: ${error.message}`);
  } finally {
    offlineBusy = null;
    offlineProgress = 0;
    offlineRefresh();
    processOfflineQueue();
  }
}

window.offlineDownloadAll = ids => {
  if (!offlineWorker) {
    showOfflineResult('Offline downloads are still getting ready. Try again in a moment.');
    return;
  }
  if (!navigator.onLine) {
    showOfflineResult('Connect to the internet to download games.');
    return;
  }
  const pending = (ids || Object.keys(OFFLINE_CATALOG)).filter(id =>
    OFFLINE_CATALOG[id] && (!offlineDownloads.has(id) || offlineDownloads.get(id).version !== OFFLINE_CATALOG[id].version)
  );
  if (!pending.length) {
    showOfflineResult('All of these games are already downloaded.');
    return;
  }
  pending.forEach(id => offlineQueue.set(id, {id, action: 'download'}));
  offlineRefresh();
  updateOfflineStatus(`${pending.length} game${pending.length === 1 ? '' : 's'} added to the download queue.`);
  processOfflineQueue();
};

function offlineAction(id, update = false) {
  if (!offlineWorker || !OFFLINE_CATALOG[id] || offlineBusy?.id === id) return;
  if (offlineQueue.has(id)) {
    offlineQueue.delete(id);
    offlineRefresh();
    updateOfflineStatus(offlineBusy ? `${offlineBusy.action === 'offload' ? 'Removing' : 'Downloading'} ${OFFLINE_CATALOG[offlineBusy.id].name}…` : '');
    return;
  }
  const action = offlineDownloads.has(id) && !update ? 'offload' : 'download';
  if (action === 'download' && !navigator.onLine) {
    document.getElementById('offline-status').textContent = 'Connect to the internet to download a game.';
    return;
  }
  offlineQueue.set(id, {id, action});
  offlineRefresh();
  processOfflineQueue();
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-offline-id],[data-offline-update],[data-offline-all]');
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  if (button.dataset.offlineAll !== undefined) {
    window.offlineDownloadAll(bulkIds(button));
    return;
  }
  offlineAction(button.dataset.offlineId || button.dataset.offlineUpdate, Boolean(button.dataset.offlineUpdate));
});

window.addEventListener('offline', () => {
  offlineOnly = true;
  offlineRefresh();
  document.getElementById('offline-status').textContent = '';
});
window.addEventListener('online', () => {
  offlineOnly = false;
  document.getElementById('offline-status').textContent = '';
  processOfflineQueue();
});

(async () => {
  try {
    if (!('serviceWorker' in navigator)) throw Error('Offline downloads are not supported in this browser.');
    let registration = await navigator.serviceWorker.getRegistration('./');
    if (!registration?.active) {
      await navigator.serviceWorker.register('./sw.js');
      registration = await navigator.serviceWorker.ready;
    } else {
      await registration.update().catch(() => {});
      const updatingWorker = registration.installing || registration.waiting;
      if (updatingWorker && updatingWorker.state !== 'activated') {
        await new Promise(resolve => {
          const finish = () => {
            if (updatingWorker.state === 'activated' || updatingWorker.state === 'redundant') resolve();
          };
          updatingWorker.addEventListener('statechange', finish);
          finish();
        });
      }
    }
    offlineWorker = registration.active || navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      offlineWorker = navigator.serviceWorker.controller;
      processOfflineQueue();
    });
    offlineDownloads = new Map((await offlineCall('status')).map(item => [item.id, item]));
    document.getElementById('offline-status').textContent = '';
    offlineRefresh();
  } catch (error) {
    document.getElementById('offline-status').textContent = error.message;
  }
})();
