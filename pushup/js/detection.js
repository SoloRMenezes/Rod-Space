export const median = (values) => {
  const a = [...values].sort((x, y) => x - y);
  return a[Math.floor(a.length / 2)];
};
export function calibrate(upSamples, downSamples) {
  for (const samples of [upSamples, downSamples]) {
    if (samples.length < 8)
      throw Error(
        "Keep your whole face in view and hold still. Try again in brighter light.",
      );
    const m = median(samples);
    if (median(samples.map((v) => Math.abs(v - m))) / m > 0.08)
      throw Error("Hold each position steady during calibration.");
  }
  const up = median(upSamples),
    down = median(downSamples);
  if (down < up * 1.25)
    throw Error(
      "Move closer at the bottom. Keep the phone under your face in both positions.",
    );
  return {
    up,
    down,
    upper: up + (down - up) * 0.28,
    lower: up + (down - up) * 0.72,
  };
}
export class RepDetector {
  constructor(calibration) {
    this.c = calibration;
    this.lastRep = -Infinity;
    this.reset();
  }
  reset() {
    this.armed = false;
    this.values = [];
    this.aboveSince = null;
    this.belowSince = null;
    this.lastSeen = null;
    this.previous = null;
  }
  update(sample, now) {
    if (!sample || !Number.isFinite(sample.size) || sample.size <= 0) {
      this.aboveSince = null;
      this.belowSince = null;
      if (this.lastSeen !== null && now - this.lastSeen > 250) this.reset();
      return false;
    }
    if (this.lastSeen !== null && now - this.lastSeen > 250) this.reset();
    if (
      this.previous &&
      (Math.hypot(sample.x - this.previous.x, sample.y - this.previous.y) >
        0.18 ||
        Math.abs(Math.log(sample.size / this.previous.size)) > 0.45)
    ) {
      this.reset();
      this.lastSeen = now;
      this.previous = sample;
      return false;
    }
    this.lastSeen = now;
    this.previous = sample;
    this.values.push(sample.size);
    if (this.values.length > 3) this.values.shift();
    const size = median(this.values);
    if (size <= this.c.upper) {
      this.belowSince = null;
      this.aboveSince ??= now;
      if (now - this.aboveSince >= 140) this.armed = true;
    } else {
      this.aboveSince = null;
      if (size >= this.c.lower && this.armed) {
        this.belowSince ??= now;
        if (now - this.belowSince >= 100 && now - this.lastRep >= 450) {
          this.armed = false;
          this.belowSince = null;
          this.lastRep = now;
          return true;
        }
      } else this.belowSince = null;
    }
    return false;
  }
}

// Guided calibration driven entirely by continuous, stable face observations.
export class AutoCalibration {
  constructor(now) {
    this.phase = "up";
    this.notBefore = now + 4000;
    this.window = [];
    this.up = null;
    this.calibration = null;
    this.lastSeen = null;
  }
  update(sample, now) {
    if (this.phase === "done") return { phase: "done", progress: 1 };
    if (
      !sample ||
      !Number.isFinite(sample.size) ||
      sample.size <= 0 ||
      now < this.notBefore
    ) {
      this.window = [];
      return { phase: this.phase, progress: 0 };
    }
    if (this.lastSeen !== null && now - this.lastSeen > 250) this.window = [];
    this.lastSeen = now;
    const eligible =
      this.phase === "up" ||
      (this.phase === "down"
        ? sample.size >= median(this.up) * 1.3
        : sample.size <= this.calibration.upper);
    if (!eligible) {
      this.window = [];
      return { phase: this.phase, progress: 0 };
    }
    this.window.push({ ...sample, time: now });
    const duration = this.phase === "ready" ? 900 : 1400;
    while (this.window.length > 1 && this.window[1].time <= now - duration)
      this.window.shift();
    const sizes = this.window.map((s) => s.size),
      center = median(sizes);
    const range = (values) => Math.max(...values) - Math.min(...values);
    if (
      range(sizes) / center > 0.12 ||
      range(this.window.map((s) => s.x)) > 0.08 ||
      range(this.window.map((s) => s.y)) > 0.08
    ) {
      this.window = [{ ...sample, time: now }];
      return { phase: this.phase, progress: 0 };
    }
    const progress = Math.min(1, (now - this.window[0].time) / duration);
    if (progress < 1 || this.window.length < 8)
      return { phase: this.phase, progress };
    if (this.phase === "up") {
      this.up = sizes;
      this.phase = "down";
    } else if (this.phase === "down") {
      this.calibration = calibrate(this.up, sizes);
      this.phase = "ready";
    } else this.phase = "done";
    this.window = [];
    return { phase: this.phase, progress: 0, calibration: this.calibration };
  }
}
