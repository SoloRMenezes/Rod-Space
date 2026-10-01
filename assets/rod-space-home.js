(() => {
  const script = document.currentScript;
  const rodSpaceUrl = new URL('../', script.src).href;

  function addRodSpaceHome() {
    document.querySelectorAll('a.home-link').forEach(link => {
      if (/rod\s*space/i.test(link.textContent)) link.remove();
    });
    if (document.getElementById('rod-space-home-link')) return;

    const link = document.createElement('a');
    link.id = 'rod-space-home-link';
    link.href = rodSpaceUrl;
    link.setAttribute('aria-label', 'Return to Rod Space');
    link.textContent = '← ROD SPACE';
    document.body.appendChild(link);

    // Keep the game canvas clear after the player starts interacting. The link
    // returns whenever the page's home screen is opened again by reloading it.
    const hideAfterGameStarts = event => {
      if (!link.contains(event.target)) link.classList.add('rod-space-home-hidden');
    };
    document.addEventListener('pointerup', hideAfterGameStarts, { capture: true, once: true });
    document.addEventListener('keydown', hideAfterGameStarts, { capture: true, once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addRodSpaceHome, { once: true });
  } else {
    addRodSpaceHome();
  }
})();
