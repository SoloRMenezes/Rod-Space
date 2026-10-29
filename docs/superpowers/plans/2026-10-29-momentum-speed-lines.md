# Momentum Speed Lines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add smooth, momentum-driven animated white speed streaks around the Web Weavers viewport after ordinary FOV feedback nears its cap.

**Architecture:** Add one non-interactive overlay to the existing HUD markup and style four edge groups with CSS-animated streaks. A small pure speed-to-intensity function and a damped per-frame updater in `web_weavers.js` drive CSS variables from total player velocity without changing traversal physics.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Three.js r128, Playwright browser QA

**Spec:** `docs/superpowers/specs/2026-10-29-momentum-speed-lines-design.md`

## Global Constraints

- Preserve the existing FOV response and 78-degree cap.
- Intensity is zero at speed 48 or below, clearly visible at speed 58, and stronger above 58.
- Use total `P.vel.length()` across all traversal states.
- Keep the overlay behind the HUD, pointer-transparent, hidden outside active unpaused gameplay, and independent of physics.
- Add no dependencies and do not alter controls, movement, collisions, or camera direction.

## Review Focus

- Threshold jitter: speeds oscillating around 48 must fade smoothly instead of flashing.
- Menu and pause state: streaks must be invisible even if stored velocity remains high.
- Extreme speed: intensity and CSS values must remain bounded at the traversal ceiling.
- Viewport variation: all four edges must cover wide, tall, and mobile-landscape screens without blocking HUD controls.
- Low-end rendering: the effect must use a fixed, small streak count and compositor-friendly opacity/transform animation.

---

### Task 1: Momentum speed-line overlay

**Files:**
- Modify: `web_weavers.html` (add the decorative overlay inside `#hud`)
- Modify: `web_weavers.css` (four edge groups, streak geometry, animation, and responsive coverage)
- Modify: `web_weavers.js` (intensity mapping, smoothing, gameplay visibility, and frame update)
- Modify: `tests/web-weavers-browser.cjs` (threshold, cap, pause/menu, and DOM coverage assertions)

**Interfaces:**
- Consumes: `P.vel.length()`, `gameActive`, `paused`, and the existing `tick()` loop.
- Produces: `speedLineIntensityForSpeed(speed: number): number` in `[0, 1]`, `updateSpeedLines(dt: number): void`, and CSS custom properties on `#speedLines`.

- [ ] **Step 1: Add failing browser assertions**

Extend `tests/web-weavers-browser.cjs` to assert that the overlay has four edge groups; intensity is `0` at speeds `0` and `48`; intensity is visibly nonzero at `58`; values increase above `58` but never exceed `1`; repeated updates near the threshold change opacity smoothly; and inactive or paused gameplay forces the overlay hidden.

- [ ] **Step 2: Run the focused browser test and confirm failure**

Run: `node tests/web-weavers-browser.cjs`

Expected: FAIL because `#speedLines`, `speedLineIntensityForSpeed`, and `updateSpeedLines` do not exist.

- [ ] **Step 3: Add the overlay markup and CSS animation**

Add `#speedLines[aria-hidden="true"]` with `top`, `right`, `bottom`, and `left` edge groups. Give each group a fixed set of streak spans, edge-safe positioning, `pointer-events:none`, and compositor-friendly keyframes. Drive opacity, streak scale, and duration from CSS variables while keeping the layer below ordinary HUD elements.

- [ ] **Step 4: Implement intensity mapping and damping**

Implement `speedLineIntensityForSpeed(speed)` with exact thresholds `48` and `58`, a bounded high-speed ramp, and finite-number protection. Implement `updateSpeedLines(dt)` to exponentially damp current intensity toward the target, force zero outside active unpaused gameplay, and update the overlay CSS variables. Call it once per `tick()` after player simulation and before rendering.

- [ ] **Step 5: Run focused verification**

Run: `node --check web_weavers.js`

Expected: exit 0.

Run: `node tests/web-weavers-browser.cjs`

Expected: PASS, including the new speed-line assertions and all existing traversal checks.

Run: `git diff --check -- web_weavers.html web_weavers.css web_weavers.js tests/web-weavers-browser.cjs`

Expected: no output and exit 0.

- [ ] **Step 6: Visually inspect real gameplay**

Serve the repository locally, open `web_weavers.html?qa=1`, trigger synthetic high-speed traversal, and inspect desktop plus mobile-landscape screenshots. Confirm streaks stay at the edges, remain behind HUD controls, animate smoothly, disappear when paused, and do not introduce console errors.

- [ ] **Step 7: Commit the focused change**

```bash
git add docs/superpowers/specs/2026-10-29-momentum-speed-lines-design.md docs/superpowers/plans/2026-10-29-momentum-speed-lines.md web_weavers.html web_weavers.css web_weavers.js tests/web-weavers-browser.cjs
git commit -m "Add momentum speed lines to Web Weavers"
```
