# Radial Speed-Line Refinement

## Intent

Replace the current sparse, rain-like edge streaks with momentum lines that visually radiate toward the player/screen centre. The effect should make traversal feel faster after the camera reaches its useful FOV range without blurring the player or changing the HUD.

## Behaviour

- At ordinary high speed, show a cleaner radial burst: long, tapered-looking white lines with varied thickness, length, and spacing, leaving the city readable.
- As speed approaches the game's maximum traversal range, progressively add density, length, brightness, and screen coverage until the effect resembles the full anime burst in the second reference.
- Preserve the existing 48–58 speed handoff from FOV expansion into speed lines, with smoothing so crossing the threshold cannot flash.
- Keep the centre around the player comparatively clear and render the effect behind the HUD so controls and mission information remain sharp.
- Hide the effect before gameplay and while paused. Respect reduced-motion settings.

## Approaches

1. **Full anime burst at all high speeds:** closest to the dramatic reference but obscures the city too early.
2. **Cleaner radial burst only:** preserves readability but lacks the requested maximum-speed payoff.
3. **Progressive hybrid (selected):** use the cleaner burst in general and blend into the full dense burst at maximum speed. This best matches both references and the user's requested intensity curve.

## Scope

Only the speed-line overlay, its momentum mapping, and regression coverage change. Traversal physics, camera FOV, player rendering, blur, and HUD styling remain unchanged. Update the source branch, the existing pull request, and the installed Rod Space app after verification.
