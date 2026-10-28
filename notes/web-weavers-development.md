# Web Weavers development checkpoint

Working branch: codex/web-weavers-traversal in /private/tmp/web-weavers-development. Current native source: /private/tmp/rodspace-native-work. Installed app: /Applications/Rod Space/Rod Space.app. The configured Coding folder no longer exists. Native integration and backups are recorded below; Documents/GitHub and legacy copies were not modified.

## Completed
- Ordinary release preserves all incoming velocity components. Air uses the same effective 60 m/s traversal envelope as swinging, avoiding an instant 58-to-50 m/s brake. Space still performs the existing deliberate jump.
- Held Shift retries failed attachment at 10 Hz, including a re-press during the existing cooldown. Existing keybinds and R15 asset retained.
- Offline game hashes and shell version refreshed.

## Verified
- Headless Chrome loaded the real game and R15 GLB without page errors.
- Compared baseline and modified builds: level, rising and falling release vectors preserve momentum after the change; rapid release/re-press failed before and reattached after.
- Exercised street-level attachment and inspected rendered R15 gameplay screenshot.
- `node tests/web-weavers-traversal.cjs`, JavaScript syntax and diff whitespace checks pass.

## Next priorities
1. Check sustained rope visibility around buildings and physics-driven arm reach.
2. Broaden actual traversal and combat/skin regression checks.

Browser checks use isolated test storage. No claim about a player's existing saved game or sustained hardware 60 FPS.

## Second checkpoint
- Physics steps are bounded to 1/120 second; animation and telemetry sampling remain once per render. Mission DOM updates occur once per 25-metre bucket instead of repeatedly inside a distance window.
- Camera retracts to collision clearance immediately and eases outward. First-person following uses elapsed time.
- Browser regression harness covers real model loading, release vectors, rapid reattachment, frame-rate trajectories and a real facade camera obstruction. 30/60/120 Hz positions match exactly; 144 Hz differs by about 0.01 metres after 3 seconds. No page errors.
- Existing combined nico/blackjack/weavers suite fails on its first assertion: it expects FLOOR_COUNT inside nicos_nextbots.html, but that unchanged game now loads nicos_nextbots.js. This is unrelated to Web Weavers changes.

## Third checkpoint
- Reticle targeting attaches to the actual aimed facade/roof surface instead of replacing every hit with an inset roof anchor. Low wall hits defer to existing assisted selection.
- Assisted rooftop candidates terminate at the first visible surface. Falling catches now require the same unobstructed line of sight; surface offsets follow the sightline to avoid moving an edge anchor off the building.
- Browser tests cover aimed facade attachment and assisted street/air/falling anchors. Existing momentum, chaining, camera and timestep regressions pass without page errors.

## Fourth checkpoint
- Swing steering rotates velocity within the rope tangent plane. Focused tests verify a meaningful turn without speed loss or newly introduced radial velocity. Existing W pumping remains phase dependent.
- Loaded and inspected the authored R15 shoulder/elbow/hand hierarchy. Attached shoulders now aim at the actual anchor in parent coordinates; free arms and release poses keep existing blending. Both hands reach alignment >0.99 in browser checks (the sampled original left arm was ~0.05).
- Swing leg trailing responds to velocity/rise rather than an unrelated repeating sine kick. The same GLB, skeleton ownership, cosmetic skin system and keybinds remain.
- Real-time key interaction exercised ground launch, release/re-press, turning, diving and recatching with no page errors or non-finite state. The deliberately building-facing route still loses speed against facades; this is not evidence of a polished unrestricted street route. Zip was attempted but not confirmed by that real-time run.
- Visual screenshots inspected for the arm/web connection. Browser tests cover both R15 shoulder chains alongside earlier regressions.

## Fifth checkpoint
- Aimed anchors with nearly horizontal elevation defer to assisted targeting. Ground-launch impulses now apply only at street level; slow airborne catches preserve incoming velocity, including motion opposite the camera.
- Swing-to-zip clears the occupied web hand. Reproduced the old failure (zipClearedSwing=false, swingAfterZip=false) against the saved prior code; both pass after the fix.
- Expanded browser checks confirm actual zip movement, wall-run to charged jump, cosmetic-only skin application and independent cloned R15 skeletons, without page errors.
- A live avenue run reached ~24 m/s after launch and ~38 m/s through the next swing, then turned/dived/caught successfully. These are one run's measurements, not hardware-independent benchmarks.
- Earlier/faster ground reeling was investigated and discarded: it failed to eliminate ground skimming in an isolated low-anchor fixture. No unproven reeling tuning was retained.

## Remaining priorities
- Sustained rope obstruction handling after a valid attachment (especially around corners).
- Low-altitude slack-rope recovery without ground skimming or artificial launch energy.
- Broader performance measurement and long-session gameplay assessment; no 60 FPS guarantee.

## Native app integration checkpoint
- User clarified the current copies are /private/tmp/rodspace-native-work and /Applications/Rod Space/Rod Space.app. Inspected both and found native mouse/rendering changes in the app plus newer uncommitted traversal/QA changes in the temporary checkout.
- Preserved native mouse locking, native rendering settings, HUD throttling, limited 9 m/s attachment slack take-up (at most 10 metres), native steering tuning and descent-only pumping. Retained the ?qa=1 interface. Combined these with this branch's verified momentum, transition, targeting, animation and camera changes. Script version is v18.
- Original native source files are backed up in /private/tmp/web-weavers-app-update/native-source-before. The previous installed app is preserved as /private/tmp/web-weavers-app-update/Rod Space.before.app. Unrelated fingerboard work was not changed.
- Installed the staged update using the existing ad-hoc signing format; codesign --verify --deep --strict passed. Only Web Weavers JS/HTML, offline catalog, shell cache metadata and signature-related bytes changed in the app bundle.
- Installed app launched and served HTTP 200 at 127.0.0.1:47321. Served JS, bundled JS and temporary source JS hashes match.
- Native WKWebView loaded the actual installed-app origin with isolated storage. R15 loading, chaining, release vectors, both arms, zip transitions, wall jumps, camera collision, cosmetic skins and independent skeletons passed. No page errors were logged. Snapshot inspected. This does not verify every physical native mouse/trackpad gesture.
- Draft GitHub PR creation was rejected by automatic approval review for unverified publication authorization; no PR was created. Existing checkpoint branch pushes succeeded.
- At this checkpoint the existing DMG had not yet been regenerated; see installer delivery below.

## Obstructed strand checkpoint
- Added segment/building intersection checks from the actual animated hand to the active anchor. A strand blocked by a facade releases without a velocity impulse; a held Swing input uses the existing queued catch mechanism.
- Matched ten-second city route: 64 obstructed frames before, zero after. The corrected route retained 416 attached frames out of 600; reduced attachment time is expected when formerly invalid strands release. No runtime errors.
- Geometry tests cover attached surfaces, a building crossing, above-roof travel, parallel misses and origins inside a building. Full Chrome and native WebKit traversal regressions pass.
- App cache version advanced to v19. The tested signed app was used for the installer refresh below.

## Installer delivery
- Installed app and /private/tmp/rodspace-native-work now contain the tested v19 build. App-served JS returned HTTP 200 and matches both copies (SHA-256 bc7adcbbeb365cd8521c9e4d5cf4378b63fde41e773438d2419d3da3ab80c257).
- Refreshed /Applications/Rod Space/Rod Space.dmg. hdiutil verify passed; mounted read-only, verified the enclosed app signature and matching JS hash, then detached it.
- Previous installer is /private/tmp/web-weavers-app-update/Rod Space.before.dmg. Original app and native-source backups remain at the paths above.
- Checked Web Weavers download sizes/hashes in branch, native source and installed app catalogs. No unrelated game content was replaced.
- Work remains active: extended play/performance assessment and low-altitude slack-rope recovery still need attention.
