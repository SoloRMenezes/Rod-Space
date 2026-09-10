// Calendar arithmetic deliberately uses local noon, never UTC or 24-hour durations.
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dateObject(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
export function addDays(key, n) {
  const d = dateObject(key);
  d.setDate(d.getDate() + n);
  return localDate(d);
}
export function freshState(now = new Date()) {
  const today = localDate(now);
  return {
    version: 1,
    createdDate: today,
    processedThrough: addDays(today, -1),
    currentStreak: 0,
    longestStreak: 0,
    freezes: 0,
    lastCompletedDate: null,
    dailyMinimum: null,
    personalBest: 0,
    history: [],
    records: { time: {}, reps: {} },
    lastAwardMonday: null,
    initialMaxCompleted: false,
    days: {},
    calibration: null,
    active: null,
  };
}
export function reconcile(state, now = new Date()) {
  const today = typeof now === "string" ? now : localDate(now);
  // Process rewards and obligations in chronological order. Future Mondays cannot
  // retroactively rescue a Sunday on which no freeze existed.
  for (
    let day = addDays(state.processedThrough, 1);
    day <= today;
    day = addDays(day, 1)
  ) {
    if (
      dateObject(day).getDay() === 1 &&
      (!state.lastAwardMonday || day > state.lastAwardMonday)
    ) {
      state.freezes++;
      state.lastAwardMonday = day;
    }
    if (day === today) break;
    const entry = state.days[day];
    if (state.initialMaxCompleted && !entry?.completed) {
      if (state.freezes > 0) {
        state.freezes--;
        state.days[day] = { ...entry, total: entry?.total || 0, frozen: true };
        // Protected rest days preserve a streak; only completed days increment it.
      } else {
        state.currentStreak = 0;
        state.dailyMinimum = null;
        state.initialMaxCompleted = false;
      }
    }
    state.processedThrough = day;
  }
  return state;
}
function creditDay(state, day, count) {
  const entry = (state.days[day] ||= { total: 0 });
  entry.total += count;
  if (
    state.initialMaxCompleted &&
    !entry.completed &&
    entry.total >= state.dailyMinimum
  ) {
    entry.completed = true;
    state.currentStreak++;
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
    state.lastCompletedDate = day;
  }
}
export function finishWorkout(
  state,
  workout,
  { acceptMax = false, now = new Date() } = {},
) {
  if (state.history.some((w) => w.id === workout.id)) return state;
  const count = Object.values(workout.byDate).reduce((a, b) => a + b, 0);
  if (!count) {
    state.active = null;
    reconcile(state, now);
    return state;
  }
  const isMax = workout.mode === "max";
  if (isMax && !acceptMax) {
    state.active = null;
    return reconcile(state, now);
  }
  // A max test establishes the minimum on its finishing date. Ordinary reps
  // are credited to the local dates on which they actually happened.
  if (isMax) {
    const day = localDate(new Date(workout.endedAt));
    reconcile(state, day);
    state.dailyMinimum = count;
    state.initialMaxCompleted = true;
    creditDay(state, day, count);
  } else {
    for (const [day, total] of Object.entries(workout.byDate).sort()) {
      reconcile(state, day);
      creditDay(state, day, total);
    }
  }
  state.personalBest = Math.max(state.personalBest, count);
  if (workout.completed && !workout.interrupted && workout.mode === "time") {
    const key = String(workout.target);
    state.records.time[key] = Math.max(state.records.time[key] || 0, count);
  }
  if (
    workout.completed &&
    !workout.interrupted &&
    workout.mode === "reps" &&
    count >= workout.target &&
    (!workout.timeLimit || workout.elapsedMs <= workout.timeLimit * 1000)
  ) {
    const key = repRecordKey(workout.target, workout.timeLimit);
    state.records.reps[key] = Math.min(
      state.records.reps[key] ?? Infinity,
      workout.elapsedMs,
    );
  }
  state.history.push({ ...workout, count });
  state.active = null;
  reconcile(state, now);
  return state;
}

export function repRecordKey(target, timeLimit) {
  return timeLimit ? `${target}@${timeLimit}` : String(target);
}
