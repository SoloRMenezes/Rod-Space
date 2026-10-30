# Radial Speed-Line Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the sparse edge dashes into a clean radial speed burst that progressively blends into a dense anime burst at maximum momentum.

**Architecture:** Replace the repeated HTML streak elements with two transparent, full-viewport raster assets: a readable base burst and a denser maximum-speed burst. Keep the existing smoothed momentum intensity, but expose separate base and maximum-burst CSS variables so opacity, scale, and coverage increase without changing animation duration or blurring the scene.

**Tech Stack:** HTML, CSS animations, vanilla JavaScript, Three.js math utilities, transparent PNG assets, Playwright browser regression tests.

**Spec:** `docs/superpowers/specs/2026-10-29-radial-speed-line-refinement-design.md`

## Global Constraints

- Preserve traversal physics and the existing camera FOV behaviour.
- Do not blur the player, world, or HUD and do not restyle the HUD.
- Keep the centre around the player comparatively clear.
- Hide the effect outside active gameplay and while paused; respect reduced motion.
- Use a fixed asset/layer count and do not add runtime dependencies.

## Review Focus

- Speeds repeatedly crossing 48 must remain subdued without visible flashing; pin this in the browser test.
- Mid-high speed must show the clean layer while the dense layer remains secondary; pin both CSS opacities at speed 80.
- Maximum speed must visibly increase dense-layer opacity and scale; pin values at speed 100.
- Pausing or leaving gameplay must immediately hide both layers; pin both variables at zero.
- Long-running animations must not jump when velocity changes; keep animation duration fixed and retain the aged-animation regression.

---

### Task 1: Progressive radial speed burst

**Files:**
- Create: `assets/effects/web-weavers-speed-lines-clean.png`
- Create: `assets/effects/web-weavers-speed-lines-dense.png`
- Modify: `web_weavers.html`
- Modify: `web_weavers.css`
- Modify: `web_weavers.js`
- Modify: `tests/web-weavers-browser.cjs`

**Interfaces:**
- Consumes: `speedLineIntensityForSpeed(speed: number) -> number` and `updateSpeedLines(dt: number)` from the existing effect.
- Produces: CSS properties `--speed-line-base-opacity`, `--speed-line-burst-opacity`, `--speed-line-scale`, and two `.speedLineLayer` image elements.

- [ ] **Step 1: Write the failing browser assertions**

Replace the fixed streak-count assertion with checks for exactly two loaded image layers. Sample speed 80 and 100 and assert the clean layer is visible at both, the dense layer is secondary at 80, the dense layer strengthens at 100, both hide while paused/inactive, threshold crossings stay bounded, and the aged animation keeps the same translation when speed changes.

- [ ] **Step 2: Run the browser suite to verify RED**

Run: `NODE_PATH=... CHROME_PATH=... GAME_URL=http://127.0.0.1:8766/web_weavers.html node tests/web-weavers-browser.cjs`

Expected: FAIL because the two raster layers and their CSS variables do not exist.

- [ ] **Step 3: Generate and inspect the two transparent assets**

Use ImageGen to create white radial speed-line overlays at a 16:9 ratio with a transparent background and a wide clear centre: one restrained/clean and one dense/anime. Inspect both assets at original resolution and reject any asset containing a player, city, UI, text, blur, or opaque background.

- [ ] **Step 4: Replace the repeated streak markup and styling**

In `web_weavers.html`, replace the four edge groups with clean and dense `<img>` layers using the generated assets and bump cache-query versions. In `web_weavers.css`, cover the viewport with both assets, keep them behind HUD content, use fixed-duration outward motion, and drive opacity/scale only through the produced CSS properties.

- [ ] **Step 5: Split clean and maximum-burst intensity in JavaScript**

Keep `speedLineIntensityForSpeed`. In `updateSpeedLines(dt)`, derive base opacity from the smoothed intensity and derive maximum-burst opacity with a late smoothstep so it stays secondary at speed 80 and becomes dominant near speed 100; reset both immediately when inactive or paused.

- [ ] **Step 6: Run verification and visual QA**

Run the browser suite, `node --check web_weavers.js`, and `git diff --check`. Capture desktop and mobile-landscape screenshots at speed 80 and 100, compare them with the supplied target, and fix P0/P1/P2 discrepancies until `design-qa.md` records `final result: passed`.

- [ ] **Step 7: Commit, update the installed app, and update the existing PR**

Commit the source change, apply the same scoped files/assets to `/Applications/Rod Space/Rod Space.app/Contents/Resources/rod-space`, run the speed-line browser checks against the installed copy, and push `codex/web-weavers-speed-lines` so PR #5 updates.
