import { localDate, freshState, reconcile, finishWorkout } from "./progress.js";
import { RepDetector, calibrate } from "./detection.js";
import * as storage from "./storage.js";
import { requestCameraAccess, CameraTracker } from "./camera.js";
const $ = (id) => document.getElementById(id);
let state,
  storageBroken = false,
  view = "home",
  mode = "free",
  target = 60,
  repLimit = 60,
  tracker,
  detector,
  phase = "up",
  samples = [],
  upSamples = [],
  lastSample = null,
  lastSampleAt = 0,
  captureUntil = 0,
  captureTimer,
  workout,
  tickId,
  startAt = 0,
  countdownAt = 0,
  wakeLock,
  saveSecond = -1,
  setupToken = 0;
const labels = {
  free: "Free set",
  time: "Time challenge",
  reps: "Rep challenge",
  max: "Maximum test",
};
function error(message, title = "Something needs attention") {
  $("error-title").textContent = title;
  $("error-message").textContent = message;
  if (!$("error-dialog").open) $("error-dialog").showModal();
}
function persist() {
  if (storageBroken) return false;
  try {
    storage.save(state);
    return true;
  } catch {
    storageBroken = true;
    $("prepare").disabled = true;
    error(
      "Progress could not be saved. Storage may be full or disabled. Keep this page open; enable website storage or free some space, then try again.",
      "Storage unavailable",
    );
    return false;
  }
}
function show(name) {
  view = name;
  for (const id of ["home", "setup", "workout", "result"])
    $(id).hidden = id !== name;
  document.body.classList.toggle("in-workout", name === "workout");
  if (name !== "workout") window.scrollTo(0, 0);
}
function time(ms, roundUp = false) {
  const s = Math.max(0, roundUp ? Math.ceil(ms / 1000) : Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function exactTime(ms) {
  return `${time(ms)}.${Math.floor((ms % 1000) / 100)}`;
}
function count() {
  return Object.values(workout?.byDate || {}).reduce((a, b) => a + b, 0);
}
function renderHistory(container, items) {
  container.replaceChildren();
  if (!items.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No sets yet.";
    container.append(p);
    return;
  }
  for (const w of items) {
    const row = document.createElement("div");
    row.className = "history-row";
    const detail = document.createElement("div"),
      title = document.createElement("strong"),
      date = document.createElement("small"),
      value = document.createElement("span");
    title.textContent =
      labels[w.mode] +
      (w.mode === "time"
        ? ` · ${w.target}s`
        : w.mode === "reps"
          ? ` · ${w.target} reps${w.timeLimit ? " / " + w.timeLimit + "s" : ""}`
          : "");
    date.textContent =
      new Date(w.endedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }) +
      " · " +
      exactTime(w.elapsedMs) +
      (w.interrupted ? " · interrupted" : "");
    value.textContent = String(w.count);
    detail.append(title, date);
    row.append(detail, value);
    container.append(row);
  }
}
function render() {
  const today = state.days[localDate()] || { total: 0 };
  const initial = !state.initialMaxCompleted;
  $("day-label").textContent = initial
    ? "First set"
    : today.completed
      ? "Today · complete"
      : "Today";
  $("daily-number").textContent = initial ? "0" : String(today.total);
  $("daily-denominator").textContent = initial ? "" : `/ ${state.dailyMinimum}`;
  $("daily-copy").textContent = initial
    ? "One maximum set. Your own standard."
    : today.completed
      ? "You showed up. Every extra rep is yours."
      : `${Math.max(0, state.dailyMinimum - today.total)} more to keep your streak moving.`;
  $("daily-progress").style.width = initial
    ? "0%"
    : `${Math.min(100, (today.total / state.dailyMinimum) * 100)}%`;
  $("streak").textContent = state.currentStreak;
  $("freezes").textContent = state.freezes;
  $("best").textContent = state.personalBest;
  $("longest").textContent = `${state.longestStreak} days`;
  $("minimum-setting").textContent = state.dailyMinimum ?? "Not set";
  document.querySelector(".mode-tabs").hidden = false;
  $("prepare").textContent = initial ? "Begin max test" : "Begin";
  $("limit-row").hidden = mode !== "reps";
  $("target-row").hidden = mode === "free";
  $("max-note").hidden = !initial;
  document.querySelector(".progress-track").hidden = initial;
  $("mode-description").textContent = initial
    ? "Start with a maximum test."
    : mode === "free"
      ? "No target. Find your rhythm."
      : mode === "time"
        ? "As many as you can before the clock runs out."
        : "Hit your target. Beat your time.";
  const record =
    mode === "time"
      ? state.records.time[target]
      : state.records.reps[`${target}@${repLimit}`];
  $("mode-record").textContent =
    mode === "free" || record === undefined
      ? ""
      : `Best: ${mode === "time" ? record + " reps" : exactTime(record)}`;
  renderHistory($("recent-history"), state.history.slice(-3).reverse());
  $("prepare").disabled = storageBroken;
}
function stopCamera() {
  setupToken++;
  tracker?.stop();
  tracker = null;
  clearInterval(captureTimer);
  captureUntil = 0;
}
async function wake() {
  try {
    wakeLock = await navigator.wakeLock?.request("screen");
  } catch {
    /* Unsupported / battery restriction: camera continues. */
  }
}
function release() {
  wakeLock?.release().catch(() => {});
  wakeLock = null;
}
function stopSession() {
  cancelAnimationFrame(tickId);
  stopCamera();
  release();
}
function setPhase(next) {
  phase = next;
  samples = [];
  captureUntil = 0;
  $("capture-clock").textContent = "";
  $("capture").disabled = false;
  $("capture").hidden = false;
  $("start").hidden = true;
  $("setup-step").textContent =
    next === "up" ? "01 / 02 · TOP" : "02 / 02 · BOTTOM";
  $("setup-title").textContent =
    next === "up" ? "Arms straight. Face down." : "Lower into your push-up.";
  $("setup-copy").textContent =
    next === "up"
      ? "Tap below, then take the top position. You have 5 seconds to get into place; hold until the countdown ends."
      : "Tap below, then lower toward the phone. Keep your whole face visible. Hold the bottom until the countdown ends.";
  $("capture").textContent =
    next === "up" ? "Capture top position" : "Capture bottom position";
  $("reuse").hidden = next !== "up" || !state.calibration;
}
function calibrated() {
  phase = "ready";
  $("setup-step").textContent = "CALIBRATED";
  $("setup-title").textContent = "Your next rep starts here.";
  $("setup-copy").textContent =
    "Press START, then take the top position during 3 → 2 → 1. Return to straight arms between reps. Tap × when you finish.";
  $("capture").hidden = true;
  $("reuse").hidden = true;
  $("start").hidden = false;
  $("start").disabled = false;
  $("capture-clock").textContent = "";
}
async function prepare() {
  reconcile(state);
  persist();
  render();
  if (storageBroken) return;
  if (mode !== "free" && !validateTarget()) return;
  show("setup");
  lastSample = null;
  lastSampleAt = 0;
  upSamples = [];
  setPhase("up");
  $("capture").disabled = true;
  $("reuse").hidden = true;
  $("tracking-status").textContent = "Opening camera and loading tracking…";
  tracker = new CameraTracker($("camera"), onSample, (e) => {
    if (view === "workout") end(false, "Tracking stopped.");
    else {
      stopCamera();
      show("home");
    }
    error(e.message);
  });
  const token = ++setupToken;
  try {
    await tracker.open();
    if (token !== setupToken || view !== "setup") return;
    setPhase("up");
    wake();
  } catch (e) {
    if (token === setupToken) {
      stopCamera();
      show("home");
      error(e.message);
    }
  }
}
function onSample(sample, now) {
  lastSample = sample;
  lastSampleAt = now;
  if (view === "setup") {
    $("tracking-status").textContent = sample
      ? "Face in frame. Keep the phone still."
      : "Keep one whole face in frame, with good lighting.";
    if (captureUntil && now > captureUntil - 1400 && sample)
      samples.push(sample.size);
  }
  if (view === "workout" && startAt && detector.update(sample, now)) {
    if (deadline() && now - startAt >= deadline()) {
      end(workout.mode === "time");
      return;
    }
    const day = localDate();
    workout.byDate[day] = (workout.byDate[day] || 0) + 1;
    workout.elapsedMs = now - startAt;
    state.active = workout;
    if (!persist()) {
      end(false, "Storage became unavailable.");
      return;
    }
    $("rep-count").textContent = count();
    if (workout.mode === "reps" && count() >= workout.target) end(true);
  }
}
function capture() {
  if (captureUntil) return;
  samples = [];
  captureUntil = performance.now() + 6500;
  $("capture").disabled = true;
  $("reuse").hidden = true;
  captureTimer = setInterval(() => {
    const left = captureUntil - performance.now();
    $("capture-clock").textContent =
      left > 1400 ? String(Math.ceil((left - 1400) / 1000)) : "Hold";
    if (left > 0) return;
    clearInterval(captureTimer);
    captureUntil = 0;
    try {
      if (samples.length < 8)
        throw Error(
          "Your face was not visible long enough. Keep it fully in frame, hold still, and try again.",
        );
      if (phase === "up") {
        upSamples = [...samples];
        setPhase("down");
      } else {
        state.calibration = {
          ...calibrate(upSamples, samples),
          orientation: orientation(),
          savedAt: new Date().toISOString(),
        };
        persist();
        calibrated();
      }
    } catch (e) {
      setPhase("up");
      error(e.message, "Try calibration again");
    }
  }, 80);
}
function orientation() {
  return `${screen.orientation?.angle ?? window.orientation ?? (innerWidth > innerHeight ? 90 : 0)}`;
}
function start() {
  if (!state.calibration) return;
  workout = {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    mode: state.initialMaxCompleted ? mode : "max",
    target: mode === "free" ? null : target,
    timeLimit: state.initialMaxCompleted && mode === "reps" ? repLimit : null,
    startedAt: new Date().toISOString(),
    byDate: {},
    elapsedMs: 0,
    completed: false,
  };
  detector = new RepDetector(state.calibration);
  startAt = 0;
  saveSecond = -1;
  countdownAt = performance.now();
  show("workout");
  $("rep-count").textContent = "3";
  $("workout-time").textContent = "";
  wake();
  tickId = requestAnimationFrame(tick);
}
function deadline() {
  return workout.mode === "time"
    ? workout.target * 1000
    : workout.mode === "reps"
      ? workout.timeLimit * 1000
      : 0;
}
function tick(now) {
  if (view !== "workout") return;
  if (!startAt) {
    const remaining = 3000 - (now - countdownAt);
    if (remaining > 0) {
      $("rep-count").textContent = Math.ceil(remaining / 1000);
    } else {
      startAt = now;
      workout.startedAt = new Date().toISOString();
      state.active = workout;
      persist();
      $("rep-count").textContent = "0";
    }
  }
  if (startAt) {
    workout.elapsedMs = now - startAt;
    const timed = deadline() > 0;
    $("workout-time").textContent = time(
      timed ? deadline() - workout.elapsedMs : workout.elapsedMs,
      timed,
    );
    if (timed && workout.elapsedMs >= deadline()) {
      workout.elapsedMs = deadline();
      end(workout.mode === "time");
      return;
    }
    const second = Math.floor(workout.elapsedMs / 1000);
    if (second !== saveSecond) {
      saveSecond = second;
      workout.updatedAt = new Date().toISOString();
      state.active = workout;
      persist();
    }
  }
  tickId = requestAnimationFrame(tick);
}
function end(completed = false, note = "") {
  if (view !== "workout") return;
  if (!startAt) {
    stopSession();
    show("home");
    return;
  }
  workout.elapsedMs = performance.now() - startAt;
  if (completed && workout.mode === "time")
    workout.elapsedMs = workout.target * 1000;
  if (deadline()) workout.elapsedMs = Math.min(workout.elapsedMs, deadline());
  workout.completed = completed;
  workout.interrupted = !!note;
  workout.endedAt = new Date().toISOString();
  stopSession();
  displayResult(note);
}
function displayResult(note = "") {
  show("result");
  const isMax = workout.mode === "max";
  let previousRecord;
  $("result-label").textContent = labels[workout.mode];
  $("result-count").textContent = count();
  $("result-time").textContent = exactTime(workout.elapsedMs);
  $("result-discard").hidden = !isMax;
  $("result-save").textContent =
    isMax && count() ? "Set my daily minimum" : "Done";
  if (isMax && count()) {
    state.active = workout;
    persist();
    $("result-message").textContent =
      `${note ? note + " " : ""}Was this your maximum attempt? Set ${count()} as your daily minimum, or discard and try again.`;
  } else {
    previousRecord =
      workout.mode === "reps"
        ? state.records.reps[`${workout.target}@${workout.timeLimit}`]
        : workout.mode === "time"
          ? state.records.time[workout.target]
          : undefined;
    finishWorkout(state, workout);
    persist();
    $("result-message").textContent =
      note ||
      (count()
        ? state.days[localDate()]?.completed
          ? "Daily minimum complete. See you tomorrow."
          : "Every rep brings you closer."
        : "No reps saved. Take your time and try again.");
  }
  if (!note && workout.mode === "reps") {
    $("result-message").textContent = workout.completed
      ? (previousRecord === undefined || workout.elapsedMs < previousRecord
          ? "New best time. "
          : "Target reached. ") +
        `${workout.target} reps in ${exactTime(workout.elapsedMs)}.`
      : workout.elapsedMs >= workout.timeLimit * 1000
        ? `Time’s up. ${count()} / ${workout.target} reps. Try again.`
        : "Set ended. Beat the target before the timer to set a record.";
  }
  render();
}
function validateTarget() {
  const value = Number($("target").value);
  const min = mode === "time" ? 10 : 1,
    max = mode === "time" ? 3600 : 1000;
  if (!Number.isInteger(value) || value < min || value > max) {
    error(`Choose a whole number from ${min} to ${max}.`);
    return false;
  }
  if (mode === "reps") {
    const limit = Number($("rep-limit").value);
    if (!Number.isInteger(limit) || limit < 10 || limit > 3600) {
      error("Choose a time limit from 10 to 3600 seconds.");
      return false;
    }
    repLimit = limit;
  }
  target = value;
  return true;
}
$("prepare").onclick = prepare;
$("capture").onclick = capture;
$("start").onclick = start;
$("reuse").onclick = () => {
  if (state.calibration.orientation !== orientation()) {
    error("Your phone orientation changed. Calibrate again.");
    return;
  }
  calibrated();
};
$("setup-exit").onclick = () => {
  stopCamera();
  release();
  show("home");
};
$("workout-exit").onclick = () => end(false);
$("result-save").onclick = () => {
  if (workout.mode === "max" && count())
    finishWorkout(state, workout, { acceptMax: true });
  reconcile(state);
  if (persist()) {
    render();
    show("home");
  }
};
$("result-discard").onclick = () => {
  state.active = null;
  if (persist()) {
    reconcile(state);
    persist();
    render();
    show("home");
  }
};
for (const button of document.querySelectorAll("[data-mode]"))
  button.onclick = () => {
    mode = button.dataset.mode;
    target = mode === "reps" ? 20 : 60;
    $("target").value = target;
    $("target").min = mode === "time" ? 10 : 1;
    $("target").max = mode === "time" ? 3600 : 1000;
    $("target-label").textContent = mode === "time" ? "Seconds" : "Target reps";
    document
      .querySelectorAll("[data-mode]")
      .forEach((b) => b.setAttribute("aria-pressed", b === button));
    render();
  };
$("rep-limit").onchange = () => {
  if (validateTarget()) render();
};
$("target").onchange = () => {
  if (validateTarget()) render();
};
$("settings-open").onclick = () => {
  $("settings").showModal();
};
$("history-open").onclick = () => {
  renderHistory($("all-history"), state.history.slice().reverse());
  $("all-records").replaceChildren();
  for (const [kind, records] of Object.entries(state.records))
    for (const [key, value] of Object.entries(records)) {
      const p = document.createElement("p");
      p.textContent =
        kind === "time"
          ? `${key} seconds · ${value} reps`
          : `${key.split("@")[0]} reps${key.includes("@") ? " in " + key.split("@")[1] + "s" : " (no limit)"} · ${exactTime(value)}`;
      $("all-records").append(p);
    }
  if (!$("all-records").children.length)
    $("all-records").textContent = "Complete a challenge to set a record.";
  $("history-dialog").showModal();
};
for (const b of document.querySelectorAll("[data-close]"))
  b.onclick = () => $(b.dataset.close).close();
$("recalibrate").onclick = () => {
  state.calibration = null;
  persist();
  $("settings").close();
};
$("reset").onclick = () => {
  if (
    !confirm(
      "Delete all workouts, streaks, freezes, records and calibration? This cannot be undone.",
    )
  )
    return;
  try {
    storage.reset();
    state = freshState();
    storageBroken = false;
    reconcile(state);
    persist();
    render();
    $("settings").close();
    show("home");
  } catch {
    error("Storage is unavailable. Allow website storage and try again.");
  }
};
function interrupt(reason) {
  if (view === "workout") end(false, reason);
  else if (view === "setup") {
    stopCamera();
    release();
    show("home");
  }
}
let oldOrientation = orientation();
function rotated() {
  const current = orientation();
  if (current !== oldOrientation) {
    oldOrientation = current;
    const active = view === "workout" || view === "setup";
    interrupt(
      "Phone orientation changed. Calibrate again before your next set.",
    );
    state.calibration = null;
    persist();
    if (active)
      error(
        "The phone rotated. Your counted reps were kept. Recalibrate before your next set.",
      );
  }
}
screen.orientation?.addEventListener("change", rotated);
window.addEventListener("orientationchange", rotated);
document.addEventListener("visibilitychange", () => {
  if (document.hidden)
    interrupt("Session interrupted when the app left the screen.");
  else if (view === "home") {
    reconcile(state);
    persist();
    render();
  }
});
window.addEventListener("pagehide", () => interrupt("Session interrupted."));
window.addEventListener("storage", (e) => {
  if (e.key === "pushup.progress.v1") {
    stopSession();
    show("home");
    error(
      "Progress changed in another tab. Reload this page before continuing.",
    );
    storageBroken = true;
    $("prepare").disabled = true;
  }
});
setInterval(() => {
  if (view === "home") {
    reconcile(state);
    persist();
    render();
  }
}, 30000);
try {
  state = storage.load();
  if (state.active) {
    workout = state.active;
    workout.endedAt ||= workout.updatedAt || workout.startedAt;
    workout.interrupted = true;
    workout.completed = false;
    displayResult("Recovered an interrupted set.");
  } else {
    reconcile(state);
    persist();
  }
  render();
} catch (e) {
  state = freshState();
  storageBroken = true;
  render();
  error(e.message, "Progress unavailable");
}
// Ask on opening, before workout setup. Release the permission-check stream
// immediately; calibration opens its own camera stream when needed.
let accessPending = false;
async function askForCamera() {
  if (accessPending) return;
  accessPending = true;
  $("camera-allow").disabled = true;
  $("camera-allow").textContent = "Requesting…";
  try {
    await requestCameraAccess();
    $("camera-access").close();
  } catch (error) {
    $("camera-access-copy").textContent = error.message;
    $("camera-allow").textContent = "Try again";
  } finally {
    accessPending = false;
    $("camera-allow").disabled = false;
  }
}
$("camera-allow").onclick = askForCamera;
if (!storageBroken && view === "home") {
  $("camera-access").showModal();
  void askForCamera();
}
async function offline() {
  if (!("serviceWorker" in navigator) || !isSecureContext) {
    $("offline-status").textContent = "Offline installation requires HTTPS.";
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register("./sw.js");
    const check = async () => {
      const cache = await caches.open("pushup-v4");
      const keys = await cache.keys();
      $("offline-status").textContent = keys.some((r) =>
        r.url.endsWith("/offline-ready"),
      )
        ? "Available offline · Stored on this device"
        : "Caching camera assets… Keep this app open.";
    };
    await navigator.serviceWorker.ready;
    await check();
    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data === "offline-ready") check();
    });
    registration.addEventListener("updatefound", () => {
      registration.installing?.addEventListener("statechange", check);
    });
  } catch {
    $("offline-status").textContent =
      "Offline caching failed. Reopen online to retry.";
  }
}
offline();
// Optional browser agent integration: read-only, no fabricated reps or hidden mutations.
try {
  const context = document.modelContext;
  if (context?.registerTool)
    Promise.resolve(
      context.registerTool({
        name: "read_pushup_progress",
        description:
          "Read the locally saved daily minimum, streak, freezes and workout records.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => ({
          dailyMinimum: state.dailyMinimum,
          currentStreak: state.currentStreak,
          freezes: state.freezes,
          personalBest: state.personalBest,
          records: structuredClone(state.records),
        }),
      }),
    ).catch(() => {});
} catch {
  /* Optional capability. */
}
