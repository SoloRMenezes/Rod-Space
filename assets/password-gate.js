(function () {
  const script = document.currentScript;
  const password = script?.dataset?.password || "3112";
  const title = script?.dataset?.title || "16+ content";
  const storageKey = `rodSpacePasswordGate:${location.pathname}`;

  function storageGet(key) {
    try {
      return window.sessionStorage ? window.sessionStorage.getItem(key) : null;
    } catch (err) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      if (window.sessionStorage) window.sessionStorage.setItem(key, value);
    } catch (err) {
      /* Private/restricted browser modes can block storage. */
    }
  }

  function unlock() {
    storageSet(storageKey, "unlocked");
    document.documentElement.classList.remove("rod-password-locked");
    document.body?.classList.remove("rod-password-locked-body");
    document.getElementById("rod-password-gate")?.remove();
  }

  function installStyles() {
    if (document.getElementById("rod-password-gate-style")) return;
    const style = document.createElement("style");
    style.id = "rod-password-gate-style";
    style.textContent = `
      html.rod-password-locked,
      html.rod-password-locked body {
        min-height: 100%;
        overflow: hidden !important;
      }
      body.rod-password-locked-body > :not(#rod-password-gate) {
        visibility: hidden !important;
        pointer-events: none !important;
      }
      #rod-password-gate {
        position: fixed;
        inset: 0;
        z-index: 2147483600;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 22px;
        background:
          radial-gradient(circle at 24% 18%, rgba(99, 102, 241, .18), transparent 32%),
          radial-gradient(circle at 82% 12%, rgba(244, 63, 94, .14), transparent 30%),
          #070a12;
        color: #f8fafc;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .rod-password-gate__panel {
        width: min(100%, 380px);
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 18px;
        background: rgba(15, 23, 42, .88);
        box-shadow: 0 28px 90px rgba(0,0,0,.55);
        padding: 24px;
        text-align: center;
      }
      .rod-password-gate__eyebrow {
        margin: 0 0 8px;
        color: #fda4af;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .rod-password-gate__title {
        margin: 0;
        font-size: 28px;
        line-height: 1.05;
        letter-spacing: 0;
      }
      .rod-password-gate__copy {
        margin: 12px 0 20px;
        color: #cbd5e1;
        font-size: 14px;
        line-height: 1.45;
      }
      .rod-password-gate__input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid rgba(255,255,255,.18);
        border-radius: 12px;
        background: rgba(2, 6, 23, .72);
        color: #fff;
        padding: 14px 15px;
        font-size: 20px;
        font-weight: 800;
        text-align: center;
        letter-spacing: .18em;
        outline: none;
      }
      .rod-password-gate__input:focus {
        border-color: rgba(129, 140, 248, .8);
        box-shadow: 0 0 0 4px rgba(99, 102, 241, .18);
      }
      .rod-password-gate__button {
        width: 100%;
        margin-top: 12px;
        border: 0;
        border-radius: 12px;
        background: #4f46e5;
        color: #fff;
        padding: 14px 16px;
        font-size: 14px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
        cursor: pointer;
      }
      .rod-password-gate__button:active {
        transform: translateY(1px);
      }
      .rod-password-gate__error {
        min-height: 18px;
        margin: 10px 0 0;
        color: #fb7185;
        font-size: 13px;
        font-weight: 700;
      }
    `;
    document.head.appendChild(style);
  }

  function buildGate() {
    const gate = document.createElement("div");
    gate.id = "rod-password-gate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "rod-password-gate-title");
    gate.innerHTML = `
      <form class="rod-password-gate__panel">
        <p class="rod-password-gate__eyebrow">Content lock</p>
        <h1 id="rod-password-gate-title" class="rod-password-gate__title">${title}</h1>
        <p class="rod-password-gate__copy">This game can include mature prompts, swearing, or 16+ reading content. Enter the password to continue.</p>
        <input class="rod-password-gate__input" type="password" inputmode="numeric" autocomplete="off" placeholder="Password" aria-label="Password" />
        <button class="rod-password-gate__button" type="submit">Enter</button>
        <p class="rod-password-gate__error" aria-live="polite"></p>
      </form>
    `;

    const form = gate.querySelector("form");
    const input = gate.querySelector("input");
    const error = gate.querySelector(".rod-password-gate__error");
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (input.value === password) {
        unlock();
        return;
      }
      input.value = "";
      error.textContent = "Wrong password.";
      input.focus();
    });

    document.body.appendChild(gate);
    input.focus({ preventScroll: true });
  }

  function init() {
    if (storageGet(storageKey) === "unlocked") {
      unlock();
      return;
    }

    installStyles();
    document.documentElement.classList.add("rod-password-locked");
    document.body.classList.add("rod-password-locked-body");
    buildGate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
