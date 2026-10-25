(() => {
  const isMacApp = window.__rodSpaceMacApp ||
    (location.hostname === '127.0.0.1' && location.port === '47321');
  if (!isMacApp) return;
  if (window.top !== window || document.querySelector('#rodspace-app-menu-root')) return;

  const path = decodeURIComponent(location.pathname).replace(/\/$/, '') || '/';
  const hubs = new Set(['/', '/index.html', '/party.html']);
  if (hubs.has(path)) return;

  const passivePages = new Set([
    '/maths-book.html',
    '/trackpad-scale.html',
    '/piano.html',
    '/counter.html',
    '/sidequests.html',
    '/slot-machine.html',
    '/fidget-roulette.html',
    '/KaraokeApp/index.html',
    '/nextup/index.html'
  ]);
  const passive = passivePages.has(path);

  const root = document.createElement('div');
  root.id = 'rodspace-app-menu-root';
  root.innerHTML = `
    <style>
      #rodspace-app-menu-root{all:initial;position:fixed;z-index:2147483647;left:0;top:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f8fafc}
      #rodspace-app-menu-root *{box-sizing:border-box}
      #rodspace-app-menu-trigger{position:fixed;left:0;top:50%;transform:translateY(-50%);width:42px;min-height:76px;border:1px solid #334155;border-left:0;border-radius:0 12px 12px 0;background:#0d1117eF;color:#f8fafc;box-shadow:0 10px 28px #0008;cursor:pointer;font:900 11px/1.05 inherit;letter-spacing:.08em;writing-mode:vertical-rl;text-orientation:mixed;padding:11px 9px;backdrop-filter:blur(12px)}
      #rodspace-app-menu-trigger:hover,#rodspace-app-menu-trigger:focus-visible{background:#2563eb;outline:2px solid #93c5fd;outline-offset:2px}
      #rodspace-app-menu-backdrop{position:fixed;inset:0;display:none;place-items:center;background:#020617b8;backdrop-filter:blur(12px);padding:24px}
      #rodspace-app-menu-backdrop.open{display:grid}
      #rodspace-app-menu-panel{width:min(430px,100%);border:1px solid #334155;border-radius:18px;background:#0d1117;box-shadow:0 28px 90px #000c;padding:26px}
      #rodspace-app-menu-panel small{display:block;color:#60a5fa;font:800 11px/1 inherit;letter-spacing:.18em;text-transform:uppercase;margin-bottom:9px}
      #rodspace-app-menu-panel h2{color:#fff;font:900 clamp(30px,7vw,46px)/.95 inherit;letter-spacing:-.045em;margin:0 0 24px}
      #rodspace-app-menu-actions{display:grid;gap:10px}
      #rodspace-app-menu-actions button{appearance:none;width:100%;min-height:50px;border:1px solid #334155;border-radius:11px;background:#161b22;color:#e2e8f0;cursor:pointer;font:800 14px/1 inherit;text-align:left;padding:0 17px;box-shadow:none;text-transform:none;letter-spacing:0}
      #rodspace-app-menu-actions button:hover,#rodspace-app-menu-actions button:focus-visible{border-color:#60a5fa;background:#1e293b;color:#fff;outline:none}
      #rodspace-app-menu-actions .primary{border-color:#2563eb;background:#2563eb;color:#fff}
      html.rodspace-pointer-locked,html.rodspace-pointer-locked *{cursor:none!important}
      @media(max-width:600px){#rodspace-app-menu-trigger{min-height:64px;width:36px;font-size:10px}#rodspace-app-menu-panel{padding:21px}}
    </style>
    ${passive ? '<button id="rodspace-app-menu-trigger" aria-label="Back to Rod Space">ROD SPACE</button>' : ''}
    ${passive ? '' : `
      <div id="rodspace-app-menu-backdrop" role="dialog" aria-modal="true" aria-labelledby="rodspace-app-menu-title">
        <section id="rodspace-app-menu-panel">
          <small>Rod Space</small>
          <h2 id="rodspace-app-menu-title">Game menu</h2>
          <div id="rodspace-app-menu-actions">
            <button class="primary" data-action="resume">Close menu</button>
            <button data-action="restart">Restart game</button>
            <button data-action="home">Back to Rod Space</button>
          </div>
        </section>
      </div>`}
  `;
  document.documentElement.append(root);

  const syncPointerLockCursor = () => {
    document.documentElement.classList.toggle(
      'rodspace-pointer-locked',
      Boolean(document.pointerLockElement)
    );
  };
  document.addEventListener('pointerlockchange', syncPointerLockCursor);
  syncPointerLockCursor();

  const trigger = root.querySelector('#rodspace-app-menu-trigger');
  if (passive) {
    trigger.addEventListener('click', () => { location.href = '/'; });
    return;
  }

  const backdrop = root.querySelector('#rodspace-app-menu-backdrop');
  const setOpen = open => {
    backdrop.classList.toggle('open', open);
    if (open) root.querySelector('[data-action="resume"]').focus();
    else document.activeElement?.blur();
  };
  window.__rodSpaceOpenMenu = () => setOpen(true);
  window.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setOpen(!backdrop.classList.contains('open'));
  }, true);
  backdrop.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'resume') setOpen(false);
    if (action === 'restart') location.reload();
    if (action === 'home') location.href = '/';
    if (event.target === backdrop) setOpen(false);
  });
})();
