# Momentum Speed Lines Design

## Intent

Give Web Weavers a stronger sense of extreme momentum after camera FOV has reached the point where further widening would look distorted.

## Goals

- Preserve the existing FOV response and its 78-degree cap.
- Show animated white streaks around all four screen edges during high-speed traversal.
- Fade the streaks in smoothly from speed 48 to 58, then keep increasing their visual intensity above 58.
- Drive the effect from total real player velocity so it works for swinging, diving, zipping, falling, and wall-running.
- Keep the effect behind the HUD, non-interactive, performant, and smoothly damped near the threshold.

## Non-goals

- Do not change movement, momentum, controls, camera direction, collisions, or traversal state logic.
- Do not widen the FOV beyond its current cap.
- Do not show the effect in menus, while paused, or before gameplay begins.

## Approaches

- Start at speed 58: clean separation from FOV, but the onset would be abrupt.
- Fade in from speed 48 to 58, then intensify: selected because it hands off smoothly from FOV feedback to edge streaks.
- Start near speed 35: rejected because the effect would appear too often and lose its meaning.

## Chosen behavior

Use a lightweight DOM/CSS overlay with animated white streaks on each edge. JavaScript converts `P.vel.length()` into a smoothed normalized intensity: zero at or below 48, clearly visible by 58, and stronger toward the traversal speed ceiling. CSS variables control opacity, streak length, and animation rate. The overlay is visible only during active, unpaused gameplay.
