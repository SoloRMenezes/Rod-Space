/* Rod Space accounts and private, cross-device game stats. */
(() => {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyChsDKOZclM1DpQFaR8YQyS38y4uqK9Blc",
    authDomain: "rod-space-rooms-2026.firebaseapp.com",
    projectId: "rod-space-rooms-2026",
    storageBucket: "rod-space-rooms-2026.firebasestorage.app",
    messagingSenderId: "483176602236",
    appId: "1:483176602236:web:e815f4cd8c6befe69c47f9"
  };
  const firebase = Promise.all([
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
  ]).then(async ([appSdk, authSdk, dbSdk]) => {
    const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
    const auth = authSdk.getAuth(app);
    // Keep account sessions across page reloads and browser restarts.
    await authSdk.setPersistence(auth, authSdk.browserLocalPersistence);
    const db = dbSdk.getFirestore(app);
    return { auth, db, authSdk, dbSdk };
  });
  const listeners = new Set();
  const state = { user: null, profile: null, ready: false, error: "" };
  let activeGame = "";
  let playedUid = "";
  let modal;
  let mode = "create";
  let modalView = "settings";
  let lastStatus = "";
  let accountBusy = false;
  let authRevision = 0;
  const googleRequest = /^#account=connect-google&uid=([^&]+)$/.exec(globalThis.location?.hash || "");
  let expectedGoogleUid = "";
  try { expectedGoogleUid = googleRequest ? decodeURIComponent(googleRequest[1]) : ""; } catch {}
  if (expectedGoogleUid) mode = "signin";
  let passwordResetTicker = 0;
  const passwordResetCooldownKey = "rodspace.password-reset-until";
  const pendingBest = new Map();
  const pendingProgress = new Map();
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });
  const statsNames = {
    typing: "Fast Typing", "2048": "2048", wordle: "Daily Wordle", mines: "Minesweeper",
    snake: "Snake Arena", pong: "Pong", headsup: "Heads Up", uno: "UNO-style Cards",
    ladders: "Snakes & Ladders", combat: "Turn-Based Combat"
  };
  const localBestKeys = {
    typing: ["typing.best", "WPM"], "2048": ["2048.best", "score"], snake: ["snake.best", "score"],
    headsup: ["headsup.best", "correct guesses"], mines: ["mines.best.9", "mines.best.16", "mines.best.30"]
  };

  function publish() {
    listeners.forEach(fn => fn({ ...state }));
    syncSettingsMenu();
    const chip = document.getElementById("rs-account-chip");
    if (chip) { chip.textContent = state.user ? `${username()} · ${state.profile?.gamesPlayed || 0} games played` : ""; chip.hidden = !state.user; }
  }
  function username() { return state.profile?.username || state.user?.displayName || state.user?.email?.split("@")[0] || "Player"; }
  function syncSettingsMenu() {
    const trigger = document.getElementById("rs-account-trigger");
    if (trigger) trigger.textContent = "Settings";
    const gameStats = document.getElementById("rs-settings-game-stats");
    if (gameStats) gameStats.hidden = !activeGame;
    const summary = document.getElementById("rs-settings-account-summary");
    if (summary) summary.textContent = state.user ? `Account: ${username()}` : "Account: Sign in";
  }
  function messageFor(error) {
    const code = error?.code || "";
    const known = {
      "auth/email-already-in-use": "That email already has an account. Sign in instead.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/weak-password": "Use a password with at least 6 characters.",
      "auth/invalid-credential": "Email or password is incorrect.",
      "auth/too-many-requests": "Too many attempts. Wait a bit and try again.",
      "auth/operation-not-allowed": "This sign-in method is not enabled yet. Google connection needs to be enabled in Rod Space's account service.",
      "auth/credential-already-in-use": "That Google account is already connected to another Rod Space account. Your account and saves were not changed.",
      "auth/provider-already-linked": "Google is already connected to this account.",
      "auth/user-mismatch": "Confirm the same account you are currently signed in to.",
      "auth/requires-recent-login": "Confirm your identity again before changing account security.",
      "auth/popup-blocked": "Allow popups for Rod Space, then try again.",
      "auth/popup-closed-by-user": "Google confirmation was cancelled. You can try again.",
      "auth/unverified-email": "Verify your current email before changing it.",
      "auth/unauthorized-domain": "This Rod Space address is not yet enabled for accounts.",
      "permission-denied": "Could not save account data. Please try again."
    };
    return known[code] || error?.message || "Something went wrong. Try again.";
  }
  function element(tag, attrs = {}, text = "") {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "class") el.className = value;
      else if (key === "type") el.type = value;
      else el.setAttribute(key, value);
    });
    if (text) el.textContent = text;
    return el;
  }

  function makeModal() {
    if (modal) return modal;
    const style = element("style");
    style.textContent = `
      .rs-settings{position:relative;display:inline-flex;align-items:center;z-index:40}
      .rs-account-trigger{border:1px solid #475569;border-radius:10px;padding:8px 12px;background:#111827;color:#e2e8f0;font:700 13px system-ui;cursor:pointer;white-space:nowrap}
      .rs-account-trigger:hover,.rs-account-trigger[aria-expanded="true"]{border-color:#60a5fa;color:#fff}
      .rs-settings-menu{position:absolute;right:0;top:calc(100% + 8px);width:min(260px,calc(100vw - 28px));padding:8px;border:1px solid #334155;border-radius:12px;background:#111827;color:#e5e7eb;box-shadow:0 14px 36px #0008}
      .rs-settings-menu[hidden]{display:none}
      .rs-settings-title{margin:4px 8px 7px;color:#94a3b8;font:750 11px system-ui;letter-spacing:.12em;text-transform:uppercase}
      .rs-settings-account{display:grid;width:100%;gap:4px;padding:10px;border:0;border-radius:8px;background:transparent;color:#f8fafc;text-align:left;font:750 14px system-ui;cursor:pointer}
      .rs-settings-account:hover{background:#1f2937}
      .rs-settings-account small{color:#94a3b8;font:500 12px/1.35 system-ui}
      .rs-account-chip{margin:0 auto 12px;color:var(--muted,#94a3b8);font:600 13px system-ui;text-align:center}
      .rs-account-overlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:18px;background:#030712cc;backdrop-filter:blur(5px)}
      .rs-account-overlay[hidden]{display:none}
      .rs-account-dialog{width:min(100%,440px);max-height:min(88svh,720px);overflow:auto;border:1px solid #334155;border-radius:18px;padding:24px;background:#111827;color:#e5e7eb;box-shadow:0 22px 70px #0008}
      .rs-account-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
      .rs-account-head h2{margin:0;font:800 23px system-ui;color:#fff}
      .rs-account-close{border:0;background:transparent;color:#9ca3af;font-size:25px;line-height:1;padding:3px 8px;cursor:pointer}
      .rs-account-form{display:grid;gap:12px;margin-top:18px}
      .rs-account-form label{display:grid;gap:6px;font:650 13px system-ui;color:#cbd5e1}
      .rs-account-form input{min-width:0;border:1px solid #475569;border-radius:9px;padding:11px 12px;background:#0b1220;color:#fff;font:15px system-ui}
      .rs-account-primary,.rs-account-secondary{border:1px solid #4770a8;border-radius:9px;padding:11px 13px;background:#1d4ed8;color:white;font:750 14px system-ui;cursor:pointer}
      .rs-account-secondary{background:#1f2937;border-color:#475569;color:#e2e8f0}
      .rs-account-section{margin-top:20px;padding-top:16px;border-top:1px solid #334155}
      .rs-account-section h3{margin:0 0 8px;font:750 15px system-ui;color:#f8fafc}
      .rs-account-body>.rs-account-status:empty{display:none}
      .rs-account-note{margin:7px 0;color:#94a3b8;font:13px/1.5 system-ui;overflow-wrap:anywhere}
      .rs-account-form button:disabled{opacity:.6;cursor:wait}
      .rs-account-actions{display:grid;gap:10px;margin-top:18px}
      .rs-account-dialog button:focus-visible,.rs-account-dialog input:focus-visible{outline:2px solid #93c5fd;outline-offset:2px}
      .rs-account-links{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:14px}
      .rs-account-link{border:0;padding:3px 0;background:none;color:#93c5fd;font:650 13px system-ui;cursor:pointer}
      .rs-account-status{min-height:20px;margin:12px 0 0;color:#fca5a5;font:13px/1.4 system-ui}
      .rs-account-status[data-kind="success"]{color:#86efac}
      .rs-account-summary{margin:16px 0 0;color:#cbd5e1;font:14px/1.6 system-ui}
      .rs-account-stats{display:grid;gap:8px;margin:14px 0 18px;padding:0;list-style:none}
      .rs-account-stats li{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #253247;padding:8px 0;color:#cbd5e1;font:13px/1.4 system-ui}
      .rs-account-stats strong{color:white;text-align:right}
      @media(max-width:560px){.rs-account-trigger{padding:7px 9px;font-size:12px}.rs-account-dialog{padding:19px}}
    `;
    document.head.append(style);
    modal = element("div", { class: "rs-account-overlay", role: "presentation", hidden: "" });
    const dialog = element("section", { class: "rs-account-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": "rs-account-title" });
    const head = element("div", { class: "rs-account-head" });
    const title = element("h2", { id: "rs-account-title" }, "Rod Space account");
    const close = element("button", { class: "rs-account-close", type: "button", "aria-label": "Close account" }, "×");
    const body = element("div", { class: "rs-account-body" });
    head.append(title, close);
    dialog.append(head, body);
    modal.append(dialog);
    document.body.append(modal);
    close.onclick = () => { modal.hidden = true; };
    modal.addEventListener("click", event => { if (event.target === modal) modal.hidden = true; });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) modal.hidden = true; });
    modal.render = () => renderModal(body, title);
    return modal;
  }

  async function loadStats(uid) {
    const { db, dbSdk } = await firebase;
    const snapshot = await dbSdk.getDocs(dbSdk.collection(db, "profiles", uid, "games"));
    return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
  }
  function renderStatsList(list) {
    const ul = element("ul", { class: "rs-account-stats" });
    if (!list.length) {
      ul.append(element("li", {}, "No stats recorded for this game yet."));
      return ul;
    }
    list.sort((a, b) => (statsNames[a.id] || a.id).localeCompare(statsNames[b.id] || b.id));
    list.forEach(item => {
      const row = element("li");
      const name = element("span", {}, statsNames[item.id] || item.id);
      const parts = [`${item.gamesPlayed || 0} plays`];
      if (Number.isFinite(item.bestScore)) parts.push(`${item.scoreLabel || "Best"}: ${item.bestScore}`);
      if (Number.isFinite(item.bestTime)) parts.push(`Best ${item.bestTime}s (${item.difficulty || "mines"})`);
      if (Number.isFinite(item.wins) && item.wins) parts.push(`${item.wins} wins`);
      row.append(name, element("strong", {}, parts.slice(1).join(" · ") || parts[0]));
      ul.append(row);
    });
    return ul;
  }
  function setStatus(target, text, kind = "error") {
    target.textContent = text;
    target.dataset.kind = kind;
    if (text) target.scrollIntoView?.({ block: "nearest" });
  }

  async function refreshAccount() {
    const { auth, authSdk, db, dbSdk } = await firebase;
    const user = auth.currentUser;
    if (!user || user.isAnonymous || accountBusy) return;
    await authSdk.reload(user);
    const profile = await dbSdk.getDoc(dbSdk.doc(db, "profiles", user.uid));
    if (auth.currentUser?.uid !== user.uid) return;
    state.user = auth.currentUser;
    if (profile.exists()) state.profile = profile.data();
    publish();
    if (modal && !modal.hidden) modal.render();
  }

  function renderAccountSettings(body, title) {
    title.textContent = "Account settings";
    const user = state.user;
    const hasPassword = user.providerData?.some(item => item.providerId === "password");
    const google = user.providerData?.find(item => item.providerId === "google.com");
    let googleIdentityConfirmedAt = 0;
    const status = element("p", { class: "rs-account-status", role: "status" });
    let refreshAfterAction = false;
    const currentPassword = element("input", { name: "current-password", type: "password", autocomplete: "current-password", placeholder: "Current Rod Space password" });
    const assertUser = auth => { if (auth.currentUser?.uid !== user.uid) throw new Error("Your account changed. Reopen Settings and try again."); };
    const confirmIdentity = async () => {
      const { auth, authSdk } = await firebase;
      assertUser(auth);
      if (hasPassword) {
        if (!currentPassword.value) throw new Error("Enter your current password under Security first.");
        await authSdk.reauthenticateWithCredential(user, authSdk.EmailAuthProvider.credential(user.email, currentPassword.value));
      } else {
        if (globalThis.__rodSpaceMacApp) throw new Error("Confirm this Google account on the Rod Space website to change its security settings.");
        await authSdk.reauthenticateWithPopup(user, new authSdk.GoogleAuthProvider());
      }
      assertUser(auth);
    };
    const run = async (button, operation) => {
      if (accountBusy) return;
      accountBusy = true; button.disabled = true; setStatus(status, "Saving…", "success");
      try { const { auth } = await firebase; assertUser(auth); const text = await operation(); if (refreshAfterAction) lastStatus = text; else setStatus(status, text, "success"); }
      catch (error) { setStatus(status, messageFor(error)); }
      finally { accountBusy = false; button.disabled = false; currentPassword.value = ""; if (refreshAfterAction) modal.render(); }
    };
    const form = (label, name, inputType, value, action, handler) => {
      const section = element("form", { class: "rs-account-form", "aria-label": label });
      const fieldName = label.replace(/^Change /, "");
      const field = element("label", {}, fieldName[0].toUpperCase() + fieldName.slice(1));
      const input = element("input", { name, type: inputType, required: "", autocomplete: inputType === "email" ? "email" : "nickname" });
      input.value = value;
      const button = element("button", { class: "rs-account-secondary", type: "submit" }, action);
      field.append(input); section.append(field, button);
      section.onsubmit = async event => { event.preventDefault(); await run(button, () => handler(input)); };
      return section;
    };
    const profile = element("section", { class: "rs-account-section" });
    profile.append(element("h3", {}, "Profile"), form("Change username", "account-username", "text", username(), "Save username", async input => {
      const name = input.value.trim();
      if (!/^[A-Za-z0-9_]{3,18}$/.test(name)) throw new Error("Username must be 3–18 letters, numbers or underscores.");
      const { auth, authSdk, db, dbSdk } = await firebase; assertUser(auth);
      await dbSdk.updateDoc(dbSdk.doc(db, "profiles", user.uid), { username: name, updatedAt: dbSdk.serverTimestamp() });
      assertUser(auth); state.profile = { ...state.profile, username: name }; publish();
      try { await authSdk.updateProfile(user, { displayName: name }); } catch (error) { console.warn("Account display name could not be updated.", error.code); }
      refreshAfterAction = true;
      return "Username saved.";
    }));
    const security = element("section", { class: "rs-account-section" });
    security.append(element("h3", {}, "Security"));
    if (hasPassword) { const proof = element("div", { class: "rs-account-form" }); const field = element("label", {}, "Current password"); field.append(currentPassword); proof.append(field); security.append(proof, element("p", { class: "rs-account-note" }, "Confirm your password before changing email, password or Google connection.")); }
    else security.append(element("p", { class: "rs-account-note" }, "Google will ask you to confirm your identity for security changes."));
    security.append(form("Change email", "account-email", "email", user.email || "", "Verify new email", async input => {
      const email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
      if (email.toLowerCase() === user.email?.toLowerCase()) throw new Error("Enter a different email address.");
      await confirmIdentity(); const { authSdk } = await firebase;
      await authSdk.verifyBeforeUpdateEmail(user, email);
      return "Verification sent to your new email. Open the link, then refresh this account. Your current email stays active until verified.";
    }));
    const passwordForm = element("form", { class: "rs-account-form", "aria-label": "Change password" });
    const password = element("input", { name: "new-password", type: "password", autocomplete: "new-password", minlength: "8", required: "" });
    const confirmation = element("input", { name: "confirm-password", type: "password", autocomplete: "new-password", minlength: "8", required: "" });
    for (const [label, input] of [["New password", password], ["Confirm new password", confirmation]]) { const field = element("label", {}, label); field.append(input); passwordForm.append(field); }
    const passwordButton = element("button", { class: "rs-account-secondary", type: "submit" }, hasPassword ? "Change password" : "Add password");
    passwordForm.append(passwordButton);
    passwordForm.onsubmit = async event => { event.preventDefault(); await run(passwordButton, async () => {
      if (password.value.length < 8) throw new Error("Use a password with at least 8 characters.");
      if (password.value !== confirmation.value) throw new Error("The new passwords do not match.");
      await confirmIdentity(); const { authSdk } = await firebase;
      if (hasPassword) await authSdk.updatePassword(user, password.value);
      else await authSdk.linkWithCredential(user, authSdk.EmailAuthProvider.credential(user.email, password.value));
      refreshAfterAction = true;
      password.value = ""; confirmation.value = "";
      return "Password saved. Your account, scores and saves are unchanged.";
    }); password.value = ""; confirmation.value = ""; };
    security.append(passwordForm);
    const connections = element("section", { class: "rs-account-section" });
    const connect = element("button", { class: "rs-account-secondary", type: "button" }, google ? "Google connected" : "Connect Google");
    connect.disabled = Boolean(google);
    connections.append(element("h3", {}, "Connected accounts"), element("p", { class: "rs-account-note" }, google ? google.email || "Google is connected to this Rod Space account." : "Connect Google to this same account. Your profile, scores and saves stay together."), connect);
    if (expectedGoogleUid && expectedGoogleUid !== user.uid) connections.append(element("p", { class: "rs-account-status" }, "This is a different account from the Mac app. Sign out and sign in with the same Rod Space account before connecting Google."));
    connect.onclick = async () => {
      if (accountBusy || google) return;
      if (globalThis.__rodSpaceMacApp) {
        globalThis.open(`https://solormenezes.github.io/Rod-Space/#account=connect-google&uid=${encodeURIComponent(user.uid)}`, "_blank", "noopener,noreferrer");
        setStatus(status, "Continue in your browser using this same Rod Space account. Connect Google there, then return and choose Refresh account.", "success"); return;
      }
      if (expectedGoogleUid && expectedGoogleUid !== user.uid) { setStatus(status, "Sign in with the same account as the Mac app first."); return; }
      if (Date.now() - googleIdentityConfirmedAt > 60_000) {
        await run(connect, async () => { await confirmIdentity(); googleIdentityConfirmedAt = Date.now(); connect.textContent = "Choose Google account"; return "Identity confirmed. Click Choose Google account to open Google."; });
        return;
      }
      await run(connect, async () => {
        if (expectedGoogleUid && expectedGoogleUid !== user.uid) throw new Error("Sign in with the same account as the Mac app first.");
        // Open on a fresh click, not after a network reauthentication request (Safari blocks that popup).
        const { auth, authSdk } = await firebase; assertUser(auth);
        const provider = new authSdk.GoogleAuthProvider(); provider.setCustomParameters({ prompt: "select_account" });
        await authSdk.linkWithPopup(user, provider); assertUser(auth); state.user = auth.currentUser; publish();
        connect.textContent = "Google connected";
        refreshAfterAction = true;
        return "Google connected to this account. Your profile and saves are unchanged.";
      });
      if (state.user?.providerData?.some(item => item.providerId === "google.com")) connect.disabled = true;
    };
    const actions = element("div", { class: "rs-account-actions" });
    const refresh = element("button", { class: "rs-account-link", type: "button" }, "Refresh account");
    refresh.onclick = async () => { if (accountBusy) return; refresh.disabled = true; try { await refreshAccount(); } catch (error) { setStatus(status, messageFor(error)); refresh.disabled = false; } };
    const signOut = element("button", { class: "rs-account-secondary", type: "button" }, "Sign out");
    signOut.onclick = async () => { if (accountBusy) return; await run(signOut, async () => { const { auth, authSdk } = await firebase; await authSdk.signOut(auth); modal.hidden = true; return "Signed out."; }); };
    actions.append(refresh, signOut);
    body.append(element("p", { class: "rs-account-note" }, `Account: ${username()}`), status, profile, security, connections, actions);
    if (lastStatus) { setStatus(status, lastStatus, "success"); lastStatus = ""; }
  }
  function updatePasswordResetButton(reset, sending = false) {
    let seconds = 0;
    try { seconds = Math.max(0, Math.ceil((Number(localStorage.getItem(passwordResetCooldownKey)) - Date.now()) / 1000)); } catch {}
    reset.disabled = sending || seconds > 0;
    reset.textContent = sending ? "Sending reset email…" : seconds ? `Resend in ${seconds}s` : "Forgot password?";
    reset.setAttribute("aria-label", seconds ? `You can send another reset email in ${seconds} seconds` : "Send a password reset email");
    return seconds;
  }
  function startPasswordResetCountdown(reset) {
    if (passwordResetTicker) clearInterval(passwordResetTicker);
    const tick = () => {
      if (!updatePasswordResetButton(reset)) {
        clearInterval(passwordResetTicker);
        passwordResetTicker = 0;
      }
    };
    tick();
    if (!passwordResetTicker && reset.disabled) passwordResetTicker = setInterval(tick, 250);
  }
  function renderModal(body, title) {
    if (passwordResetTicker) { clearInterval(passwordResetTicker); passwordResetTicker = 0; }
    body.replaceChildren();
    if (!state.ready) {
      title.textContent = "Rod Space account";
      body.append(element("p", { class: "rs-account-summary" }, "Connecting to accounts…"));
      return;
    }
    if (state.user) {
      const showingGameStats = modalView === "stats" && Boolean(activeGame);
      if (!showingGameStats) { renderAccountSettings(body, title); return; }
      title.textContent = showingGameStats ? "In-game stats" : "Settings";
      const email = state.user.email || "";
      const intro = element("p", { class: "rs-account-summary" }, showingGameStats
        ? `${statsNames[activeGame] || activeGame} · Signed in as ${username()}.`
        : `Signed in as ${username()}${email ? ` · ${email}` : ""}. Your game stats save to this account and appear on your other devices.`);
      const status = element("p", { class: "rs-account-status", role: "status" });
      const signOut = element("button", { class: "rs-account-secondary", type: "button" }, "Sign out");
      signOut.onclick = async () => { signOut.disabled = true; try { const { auth, authSdk } = await firebase; await authSdk.signOut(auth); modal.hidden = true; } catch (error) { setStatus(status, messageFor(error)); signOut.disabled = false; } };
      body.append(intro);
      if (showingGameStats) {
        const listHolder = element("div");
        body.append(element("h3", { style: "font:750 14px system-ui;margin:18px 0 0;color:#fff" }, statsNames[activeGame] || activeGame), listHolder);
        loadStats(state.user.uid).then(list => listHolder.replaceChildren(renderStatsList(list.filter(item => item.id === activeGame)))).catch(error => setStatus(status, messageFor(error)));
      }
      if (!showingGameStats) body.append(signOut, status);
      return;
    }
    const form = element("form", { class: "rs-account-form" });
    if (expectedGoogleUid) body.append(element("p", { class: "rs-account-note" }, "Sign in with the same Rod Space account as your Mac app, then connect Google below."));
    const usernameWrap = element("label", { class: "rs-account-username-field" }, "Username");
    const usernameInput = element("input", { name: "username", type: "text", minlength: "3", maxlength: "18", pattern: "[A-Za-z0-9_]+", autocomplete: "nickname", placeholder: "e.g. RodPlayer" });
    usernameWrap.append(usernameInput);
    const emailWrap = element("label", {}, "Email");
    const emailInput = element("input", { name: "email", type: "email", autocomplete: mode === "create" ? "email" : "username", required: "" });
    emailWrap.append(emailInput);
    const passwordWrap = element("label", {}, "Password");
    const passwordInput = element("input", { name: "password", type: "password", minlength: "6", autocomplete: mode === "create" ? "new-password" : "current-password", required: "" });
    passwordWrap.append(passwordInput);
    const submit = element("button", { class: "rs-account-primary", type: "submit" }, mode === "create" ? "Create account" : "Sign in");
    const status = element("p", { class: "rs-account-status", role: "status" });
    const links = element("div", { class: "rs-account-links" });
    const switchMode = element("button", { class: "rs-account-link", type: "button" }, mode === "create" ? "Already have an account? Sign in" : "New to Rod Space? Create account");
    const reset = element("button", { class: "rs-account-link", type: "button" }, "Forgot password?");
    links.append(switchMode, reset);
    form.append(...(mode === "create" ? [usernameWrap] : []), emailWrap, passwordWrap, submit);
    form.onsubmit = async event => {
      event.preventDefault(); submit.disabled = true; setStatus(status, "", "success");
      try {
        const { auth, authSdk, db, dbSdk } = await firebase;
        if (mode === "create") {
          const name = usernameInput.value.trim();
          if (!/^[A-Za-z0-9_]{3,18}$/.test(name)) throw new Error("Username must be 3–18 letters, numbers or underscores.");
          const credential = await authSdk.createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
          await authSdk.updateProfile(credential.user, { displayName: name });
          await dbSdk.setDoc(dbSdk.doc(db, "profiles", credential.user.uid), {
            username: name, gamesPlayed: 0, createdAt: dbSdk.serverTimestamp(), updatedAt: dbSdk.serverTimestamp()
          });
          state.profile = { username: name, gamesPlayed: 0 };
          state.user = credential.user;
          publish();
        } else {
          await authSdk.signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
        }
        modal.render();
      } catch (error) { setStatus(status, messageFor(error)); submit.disabled = false; }
    };
    switchMode.onclick = () => { mode = mode === "create" ? "signin" : "create"; modal.render(); };
    reset.onclick = async () => {
      const email = emailInput.value.trim();
      if (!email) { setStatus(status, "Enter your email first."); return; }
      if (!emailInput.validity?.valid && emailInput.type === "email") { setStatus(status, "Enter a valid email address."); return; }
      const remaining = updatePasswordResetButton(reset);
      if (remaining) { setStatus(status, `You can request another reset email in ${remaining} seconds.`); return; }
      try { localStorage.setItem(passwordResetCooldownKey, String(Date.now() + 60_000)); } catch {}
      updatePasswordResetButton(reset, true);
      startPasswordResetCountdown(reset);
      setStatus(status, "Sending a secure reset link…", "success");
      try {
        const { auth, authSdk } = await firebase;
        await authSdk.sendPasswordResetEmail(auth, email);
        setStatus(status, "If an account matches that email, we sent a secure reset link. Check your inbox and spam folder.", "success");
      } catch (error) { setStatus(status, messageFor(error)); }
      updatePasswordResetButton(reset);
    };
    updatePasswordResetButton(reset);
    if (reset.disabled) startPasswordResetCountdown(reset);
    title.textContent = mode === "create" ? "Create your account" : "Sign in";
    body.append(form, links, status);
  }

  function mountControls() {
    makeModal();
    const homeMenu = document.getElementById("homeSettingsMenu");
    const homeAccount = document.getElementById("homeAccountAction");
    const header = document.querySelector(".game-topbar, .topbar .shell");
    const homeActions = document.querySelector("header.sticky > div > div.flex.items-center.gap-2");
    const target = homeActions || header;
    if (homeMenu && homeAccount) {
      homeAccount.onclick = () => {
        homeMenu.classList.add("hidden");
        document.getElementById("homeSettingsToggle")?.setAttribute("aria-expanded", "false");
        modalView = "settings";
        mode = "signin";
        makeModal().render();
        modal.hidden = false;
      };
      syncSettingsMenu();
    } else if (target && !document.getElementById("rs-account-trigger")) {
      const settings = element("div", { class: "rs-settings" });
      const trigger = element("button", { id: "rs-account-trigger", class: "rs-account-trigger", type: "button", "aria-haspopup": "menu", "aria-expanded": "false" }, "Settings");
      const menu = element("div", { id: "rs-settings-menu", class: "rs-settings-menu", role: "menu", hidden: "" });
      const heading = element("p", { class: "rs-settings-title" }, "Rod Space");
      const gameStats = element("button", { id: "rs-settings-game-stats", class: "rs-settings-account", type: "button", role: "menuitem", hidden: "" }, "In-game stats");
      const settingsAction = element("button", { class: "rs-settings-account", type: "button", role: "menuitem" }, "Settings");
      settingsAction.append(element("small", { id: "rs-settings-account-summary" }, "Sign in or create an account"));
      menu.append(heading, gameStats, settingsAction);
      settings.append(trigger, menu);
      target.append(settings);
      const closeMenu = () => { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); };
      trigger.onclick = () => { menu.hidden = !menu.hidden; trigger.setAttribute("aria-expanded", String(!menu.hidden)); };
      gameStats.onclick = () => { closeMenu(); modalView = "stats"; makeModal().render(); modal.hidden = false; };
      settingsAction.onclick = () => { closeMenu(); modalView = "settings"; mode = "create"; makeModal().render(); modal.hidden = false; };
      document.addEventListener("click", event => { if (!settings.contains(event.target)) closeMenu(); });
      document.addEventListener("keydown", event => { if (event.key === "Escape" && !menu.hidden) { closeMenu(); trigger.focus(); } });
      syncSettingsMenu();
    }
    if (document.body.dataset.game && !document.getElementById("rs-account-chip")) {
      const title = document.querySelector(".game-heading");
      if (title) {
        const chip = element("p", { id: "rs-account-chip", class: "rs-account-chip", hidden: "" });
        title.append(chip);
      }
    }
  }

  function syncLocalStats(list) {
    const store = (key, value) => { try { const existing = Number(JSON.parse(localStorage.getItem("rodspace.arcade." + key))); if (!Number.isFinite(existing) || value > existing) localStorage.setItem("rodspace.arcade." + key, JSON.stringify(value)); } catch {} };
    const remoteById = new Map(list.map(item => [item.id, item]));
    list.forEach(item => {
      if (Number.isFinite(item.bestScore)) {
        const key = localBestKeys[item.id];
        if (Array.isArray(key) && typeof key[0] === "string") store(key[0], item.bestScore);
      }
      if (item.id.startsWith("mines-")) {
        const cols = item.id.slice(6), key = "mines.best." + cols;
        try { const raw = localStorage.getItem("rodspace.arcade." + key), old = raw === null ? null : Number(JSON.parse(raw)); if (Number.isFinite(item.bestTime) && (old === null || item.bestTime < old)) localStorage.setItem("rodspace.arcade." + key, JSON.stringify(item.bestTime)); } catch {}
      }
    });
    Object.entries({"typing.best":"typing", "2048.best":"2048", "snake.best":"snake", "headsup.best":"headsup"}).forEach(([key, gameId]) => {
      try { const raw = localStorage.getItem("rodspace.arcade." + key), value = raw === null ? null : Number(JSON.parse(raw)), remote = remoteById.get(gameId)?.bestScore; if (Number.isFinite(value) && value > 0 && (!Number.isFinite(remote) || value > remote)) recordHighScore(key, value); } catch {}
    });
    [9,16,30].forEach(cols => {
      try { const key = "mines.best." + cols, raw = localStorage.getItem("rodspace.arcade." + key), value = raw === null ? null : Number(JSON.parse(raw)), remote = remoteById.get("mines-" + cols)?.bestTime; if (Number.isFinite(value) && value >= 0 && (!Number.isFinite(remote) || value < remote)) recordHighScore(key, value); } catch {}
    });
  }

  async function syncArcadeProgress(uid) {
    const { db, dbSdk } = await firebase;
    const saves = await dbSdk.getDocs(dbSdk.collection(db, "profiles", uid, "saves"));
    const remoteByKey = new Map(saves.docs.map(item => [item.id, item.data()]));
    const localKeys = [];
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith("rodspace.arcade.") && !key.startsWith("rodspace.arcade.sync.")) localKeys.push(key.slice("rodspace.arcade.".length));
      }
    } catch {}
    for (const key of new Set([...localKeys, ...remoteByKey.keys()])) {
      if (!/^[a-zA-Z0-9._-]{1,100}$/.test(key) || key.startsWith("sync.")) continue;
      const remote = remoteByKey.get(key);
      const localRaw = localStorage.getItem("rodspace.arcade." + key);
      const localTime = Number(localStorage.getItem("rodspace.arcade.sync." + key)) || 0;
      const remoteTime = remote?.updatedAt?.toMillis?.() || 0;
      if (localRaw !== null && (!remote || localTime > remoteTime)) {
        try { await writeProgress(uid, key, JSON.parse(localRaw)); } catch {}
      } else if (remote) {
        try {
          localStorage.setItem("rodspace.arcade." + key, remote.value);
          localStorage.setItem("rodspace.arcade.sync." + key, String(remoteTime || Date.now()));
        } catch {}
      }
    }
  }

  async function writeProgress(uid, key, value) {
    const { db, dbSdk } = await firebase;
    const encoded = JSON.stringify(value);
    if (encoded.length > 20000) return;
    await dbSdk.setDoc(dbSdk.doc(db, "profiles", uid, "saves", key), { value: encoded, updatedAt: dbSdk.serverTimestamp() });
  }

  function saveProgress(key, value) {
    if (!state.user || state.user.isAnonymous || !/^[a-zA-Z0-9._-]{1,100}$/.test(String(key))) return;
    const uid = state.user.uid, id = String(key), pendingKey = uid + ":" + id;
    clearTimeout(pendingProgress.get(pendingKey)?.timer);
    const entry = { value, timer: setTimeout(() => {
      pendingProgress.delete(pendingKey);
      writeProgress(uid, id, value).catch(error => console.warn("Rod Space game progress could not be saved.", error));
    }, 500) };
    pendingProgress.set(pendingKey, entry);
  }

  const recordedWins = new Set();
  async function recordWin(gameId) {
    if (!state.user || state.user.isAnonymous || !gameId) return;
    const key = `${state.user.uid}:${gameId}:${activeGame}:${Math.floor(Date.now() / 1000)}`;
    if (recordedWins.has(key)) return;
    recordedWins.add(key);
    try {
      const { db, dbSdk } = await firebase;
      const ref = dbSdk.doc(db, "profiles", state.user.uid, "games", gameId);
      await dbSdk.runTransaction(db, async transaction => {
        const snapshot = await transaction.get(ref);
        const old = snapshot.exists() ? snapshot.data() : { gameId, gamesPlayed: 0 };
        transaction.set(ref, { ...old, gameId, wins: (old.wins || 0) + 1, updatedAt: dbSdk.serverTimestamp() });
      });
    } catch (error) { recordedWins.delete(key); console.warn("Rod Space win stat could not be saved.", error); }
  }
  async function recordPlay(gameId) {
    if (!state.user || state.user.isAnonymous || playedUid === state.user.uid + ":" + gameId) return;
    playedUid = state.user.uid + ":" + gameId;
    try {
      const { db, dbSdk } = await firebase;
      const userRef = dbSdk.doc(db, "profiles", state.user.uid);
      const gameRef = dbSdk.doc(db, "profiles", state.user.uid, "games", gameId);
      await dbSdk.runTransaction(db, async transaction => {
        const [userSnap, gameSnap] = await Promise.all([transaction.get(userRef), transaction.get(gameRef)]);
        const userData = userSnap.exists() ? userSnap.data() : { username: username(), gamesPlayed: 0 };
        const gameData = gameSnap.exists() ? gameSnap.data() : { gameId, gamesPlayed: 0 };
        transaction.set(userRef, { ...userData, gamesPlayed: (userData.gamesPlayed || 0) + 1, lastPlayedAt: dbSdk.serverTimestamp(), updatedAt: dbSdk.serverTimestamp() });
        transaction.set(gameRef, { ...gameData, gameId, gamesPlayed: (gameData.gamesPlayed || 0) + 1, lastPlayedAt: dbSdk.serverTimestamp(), updatedAt: dbSdk.serverTimestamp() });
      });
      const fresh = await dbSdk.getDoc(userRef);
      if (fresh.exists()) state.profile = fresh.data();
      publish();
    } catch (error) { console.warn("Rod Space account stats could not be saved.", error); }
  }
  async function recordHighScore(key, value, label = "score") {
    if (!Number.isFinite(Number(value)) || !state.user || state.user.isAnonymous) return;
    const mappings = { "typing.best": ["typing", "bestScore", "WPM"], "2048.best": ["2048", "bestScore", "score"], "snake.best": ["snake", "bestScore", "score"], "headsup.best": ["headsup", "bestScore", "correct guesses"] };
    const mapped = mappings[key];
    const mines = /^mines\.best\.(9|16|30)$/.exec(key);
    const gameId = mapped?.[0] || (mines ? "mines-" + mines[1] : "");
    const field = mapped?.[1] || "bestTime";
    const scoreLabel = mapped?.[2] || label;
    if (!gameId) return;
    const amount = Number(value);
    const mapKey = `${state.user.uid}:${gameId}:${field}`;
    const current = pendingBest.get(mapKey);
    if (current !== undefined && (field === "bestTime" ? amount >= current : amount <= current)) return;
    pendingBest.set(mapKey, amount);
    try {
      const { db, dbSdk } = await firebase;
      const ref = dbSdk.doc(db, "profiles", state.user.uid, "games", gameId);
      await dbSdk.runTransaction(db, async transaction => {
        const snapshot = await transaction.get(ref);
        const old = snapshot.exists() ? snapshot.data() : { gameId, gamesPlayed: 0 };
        const previous = old[field];
        if (Number.isFinite(previous) && (field === "bestTime" ? amount >= previous : amount <= previous)) return;
        transaction.set(ref, { ...old, gameId, [field]: amount, ...(field === "bestTime" ? { difficulty: ({9:"9×9",16:"16×16",30:"30×16"})[mines[1]] } : { scoreLabel }), updatedAt: dbSdk.serverTimestamp() });
      });
    } catch (error) {
      pendingBest.delete(mapKey);
      console.warn("Rod Space account score could not be saved.", error);
    }
  }
  function bindNameInput(input) {
    if (!input) return;
    let lastApplied = input.value || "Player";
    const initialValue = input.value;
    const applyName = ({ user, profile }) => {
      const name = profile?.username || user?.displayName || user?.email?.split("@")[0];
      if (name && (!input.value || input.value === "Player" || input.value === lastApplied || input.value === initialValue)) {
        input.value = name;
        lastApplied = name;
      }
    };
    listeners.add(applyName);
    applyName(state);
  }

  const api = {
    get username() { return username(); },
    get user() { return state.user; },
    get profile() { return state.profile; },
    ready,
    onChange(fn) { listeners.add(fn); fn({ ...state }); return () => listeners.delete(fn); },
    bindNameInput,
    saveProgress,
    setActiveGame(gameId) { activeGame = gameId || ""; syncSettingsMenu(); if (modal && !modal.hidden && modalView === "stats") modal.render(); if (state.user && activeGame) recordPlay(activeGame); },
    recordHighScore,
    recordWin
  };
  globalThis.RodSpaceAccounts = api;

  mountControls();
  firebase.then(({ auth, authSdk, db, dbSdk }) => {
      authSdk.onAuthStateChanged(auth, async user => {
        const revision = ++authRevision;
        const userChanged = state.user?.uid !== user?.uid;
        if (!userChanged && state.profile) { state.user = user; publish(); if (!accountBusy && modal && !modal.hidden) modal.render(); return; }
        if (userChanged) playedUid = "";
        state.user = user && !user.isAnonymous ? user : null;
        state.profile = null;
        state.error = "";
        if (state.user) {
          try {
            const snapshot = await dbSdk.getDoc(dbSdk.doc(db, "profiles", state.user.uid));
            if (revision !== authRevision) return;
            if (snapshot.exists()) state.profile = snapshot.data();
            else if (state.user.displayName) {
              state.profile = { username: state.user.displayName, gamesPlayed: 0 };
              await dbSdk.setDoc(dbSdk.doc(db, "profiles", state.user.uid), { ...state.profile, createdAt: dbSdk.serverTimestamp(), updatedAt: dbSdk.serverTimestamp() });
            }
            if (state.profile) {
              const list = await loadStats(state.user.uid);
              syncLocalStats(list);
              await syncArcadeProgress(state.user.uid);
              if (activeGame && (userChanged || playedUid !== state.user.uid + ":" + activeGame)) recordPlay(activeGame);
            }
          } catch (error) { state.error = messageFor(error); }
        }
        if (revision !== authRevision) return;
        state.ready = true;
        resolveReady();
        publish();
        const chip = document.getElementById("rs-account-chip");
        if (chip) { chip.textContent = state.user ? `${username()} · ${state.profile?.gamesPlayed || 0} games played` : ""; chip.hidden = !state.user; }
        if (expectedGoogleUid) modal.hidden = false;
        if (!accountBusy && modal && !modal.hidden) modal.render();
      });
  }).catch(error => { state.ready = true; state.error = messageFor(error); resolveReady(); publish(); });
})();
