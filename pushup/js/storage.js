import { freshState } from "./progress.js";
const KEY = "pushup.progress.v1";
export function load() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return freshState();
  const state = JSON.parse(raw);
  if (
    state.version !== 1 ||
    !Array.isArray(state.history) ||
    !state.days ||
    !state.records ||
    !/^\d{4}-\d{2}-\d{2}$/.test(state.processedThrough)
  )
    throw Error(
      "Saved progress could not be read. Reset it in Settings to start again.",
    );
  return state;
}
export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
export function reset() {
  localStorage.removeItem(KEY);
}
