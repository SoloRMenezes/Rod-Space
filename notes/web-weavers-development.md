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

## Wall momentum and crawl cadence checkpoint
- User explicitly prioritised swing mechanics, wall walking/running and animations. Draft PR #4 is now open after explicit publication approval.
- Wall movement now records its actual travel velocity instead of zero. Charged wall jumps retain the sideways motion; the browser fixture failed both motion/velocity consistency and carried-speed checks before the change and passes afterwards.
- Wall animation reads actual speed. Removed the crawl's extra sevenfold phase multiplier and shared moving/idle detection across shoulders, elbows and knees.
- Focused Node checks and Chrome traversal scenarios pass. Native WKWebView confirms wall velocity/jump checks and zero obstructed strands; native crawl pose inspected, no page errors in successful runs. One capture harness typo used a nonexistent building registry and was corrected; this was not a game error.
- Branch is v20. Installed app, native source and DMG remain at verified v19 pending the next bundle checkpoint. Continue low-altitude recovery and wall-to-swing transitions; no extended performance claim.

## Wall jump strand cleanup checkpoint
- Reproduced swing -> wall run -> jump leaving an occupied hand and blocking another swing. Both old-strand cleanup and the next attachment failed before the fix and pass afterwards.
- Charged wall jump releases an inherited strand before leaving climb state, clears the traversal-start flag for queued catching, and stops the old automatic wall-run timer. Actual wall velocity is retained.
- Focused Node tests, full Chrome traversal checks, native WKWebView checks, and checks against the installed-app origin pass. No page errors in successful runs. The installed-origin harness initially had no server because Rod Space was closed; stopped that harness, launched the app, confirmed HTTP and reran successfully.
- Installed app and temporary native source updated to v21; ad-hoc signature verifies. App-served and development JS SHA-256: 42a3303a78ea3dfbcd74223e7cabf2f2d1d2bc3c695eff3cd26e582edf2439a6. Previous v19 installed files preserved in /private/tmp/web-weavers-app-update/v19-installed-files.
- DMG remains v19 pending the next packaging checkpoint. Low-altitude recovery and sustained wall/swing animation refinement remain the development priorities.

## Low-altitude slack recovery checkpoint
- Replaced the earlier artificial low-anchor fixture as the primary evidence with 24 actual assisted city-anchor scenarios: heights 0/8/20 metres, speeds 15/40 m/s and four headings at the same avenue junction.
- Found that safety reeling spent its budget winding slack while the player skimmed the clearance floor. Near the ground, take up untensioned rope to the predicted position first, then apply the existing bounded safety reel. No added upward velocity impulse; ordinary high-altitude rope behavior is unchanged.
- Worst matched route reduced ground-clearance-floor samples from 147/180 frames to 1/180. All 24 routes recover within two such frames after the change; attachment duration remains useful. These are controlled route measurements, not a universal no-contact guarantee.
- New tests/web-weavers-low-swings.cjs protects actual anchor availability, recovery duration and speed limits. Chrome and native WebKit matrices pass; native maximum observed speed 53.81 m/s, under the 60 m/s traversal cap. Existing Chrome traversal and focused Node checks pass. Native low-swing frame inspected, no page errors.
- Branch v22 contains the recovery fix; installed app/native source remain v21 and DMG v19 until the next packaging checkpoint. Next: deliver this stable recovery build, then examine wall-run entry direction and animation continuity over longer routes.

## High-drop attachment and momentum checkpoint
- User clarified the main swing issues: attachment location, momentum, and gaining speed from a high jump before catching a web. Prioritise those over peripheral work.
- Six controlled routes fall for 1.5 seconds from heights 180/260/350 metres in two headings, then call the normal smart-swing selector and trace three seconds of movement. One old catch retained only ~23 m/s from ~49 m/s because an almost overhead anchor removed most of the outward radial velocity.
- Fast-fall assisted scoring now penalises the fraction of incoming kinetic energy that an immediately taut rope would discard. During fast falls, materially different candidate scores take priority over alternating hands. Manual aimed targeting and ordinary non-falling selection retain their behavior; no velocity boost was added.
- All six smart-catch cases now pass a 90% first-frame speed-retention threshold in Chrome and native WebKit, with sampled initial speeds about 49.3 m/s. Existing full traversal checks, the 24 low-swing cases and focused Node checks pass. No page errors.
- This verifies catch behavior, not universally good full swing arcs. One route still releases around obstructing geometry, and some higher routes remain in descent after three seconds. Continue longer drop/catch/arc/release tests and visual review of attachment choices.
- Branch v23 contains both low-altitude recovery and high-drop attachment scoring. Installed app/native source remain v21; DMG remains v19 pending delivery of this checkpoint.

## v23 delivery and slack-rope physics checkpoint
- Delivered v23 to the installed app and temporary native source; app-served JS hash d13bb09ccfc655189ced6ec599a01a490a65578a39225ae9100a70dd121938b2. Installed-origin native high-catch checks passed. Backed up prior installed v21 files.
- Refreshed the private DMG to v23. Checksum validation, read-only mounted app signature and enclosed JS hash passed. Installed and staged DMG hashes match db3426add5dc050b8510ce0d3edc49cbf8839705ecad5b270cf8be3cca03f828. Original installer backup remains preserved.
- Extended high-drop traces to eight seconds. Found automatic tangent steering redirected a slack fall sideways into a facade (x velocity reached ~20 m/s without input). Swing steering now starts when the predicted step reaches rope tension; while slack, ordinary air input applies. No-input falling velocity is left alone.
- All six full-arc cases now reach positive swing ascent above 5 m/s, compared with one former route never ascending. Deep slack falls retain zero sideways drift in the early sample. Chrome and native full-arc checks, 24 low-swing cases, existing traversal tests and Node checks pass. No page errors.
- These results do not eliminate later facade collisions or guarantee sustained speed on every route. Next investigate ascent velocity clipping and useful attachment geometry over the full arc, not just initial catch retention.
- Branch v24 has slack-rope steering fix. Installed app/native source and DMG remain verified v23 until the next delivery checkpoint.

## Ascent momentum checkpoint
- Reproduced upward momentum loss: the limiter changed an otherwise legal [20,50,0] release to [20,34,0]. Swing ascent was separately capped at 30 m/s, before the existing total 60 m/s envelope.
- Removed the separate upward caps. Total traversal speed remains limited to 60 m/s and the existing fall terminal speed remains. Ascending velocity direction is preserved when limiting total speed; no launch impulse was added.
- New focused checks cover upward release, legal ascent and direction-preserving total-speed limiting. Browser release tests include [20,50,0] and [0,58,0]. Existing traversal, 24 low-swing and six eight-second high-drop tests pass. Sampled upward speeds in high-drop routes now reach ~33-44 m/s rather than flattening at 30.
- Native WebKit and installed-app-origin checks preserve all release vectors without page errors. Installed app and native source are v25, including the prior slack-rope fix. Signature verifies; app-served source matches. Previous v23 installed files backed up. DMG remains verified v23.
- Continue checking full-arc attachment geometry and wall collision transitions; a passed momentum test is not proof that every city route is enjoyable.

## Wall-run entry direction checkpoint
- Automatic traversal wall-run entry forced a sideways/upward direction and zeroed velocity even for vertical or descending approaches. It now projects incoming velocity onto the wall, preserves that direction and stores the bounded wall-run velocity immediately. Nearly head-on entries with negligible tangent choose upward travel rather than an arbitrary side.
- Entry visual roll uses the same vertical/sideways rule as continuing wall movement, avoiding an initial upside-down rotation for descent.
- Browser fixtures covering upward, horizontal and diagonal descending entries previously had direction alignments 0.58/0.98/0.83 with zero stored speed; now all alignments are 1 with 18-19.7 m/s stored speed. Native checks and existing traversal/Node tests pass. Descending native pose inspected; upright at -18 m/s with no page errors.
- Scope: the automatic entry helper is currently called by zip collision. Swing-wall contact currently slides instead, and ordinary input-driven wall contact follows a separate path. These fixtures verify the helper and subsequent wall movement, not a newly implemented automatic swing-wall transition.
- Branch v26; installed app/native source remain v25, DMG v23. Next prioritise real swing-wall contact behavior and input-driven entry without forcing unwanted wall runs.

## Intentional swing-to-wall contact checkpoint
- Steering toward a facade at actual swing-body collision now enters wall movement directly. Glancing contact without inward directional input keeps the existing slide behavior. Wall-detach cooldown prevents immediate forced reattachment after a jump.
- The transition releases the old strand and clears traversal-start state before entering the bounded wall run. A subsequent jump can catch a fresh visible anchor using held Swing input. Incoming wall-tangent velocity reaches entry rather than passing through zero-speed air-to-wall fallback.
- Initial broad fixtures could pass through strand obstruction and ordinary air-to-wall entry, so the regression was refined to observe the first actual collision at 120 Hz. Before: air gap then climb with zero entry velocity. After: direct climb at ~12.5 m/s, free hand and successful held-input recatch. Passive contact does not enter climb.
- Full Chrome and native traversal scenarios pass, as do focused Node checks. No native page errors. This does not change the separate air-to-wall entry path when the web releases before physical contact.
- Branch v27 combines the preceding wall-entry-direction fix and this transition. Installed app/native source remain v25, DMG v23. Next delivery should include both wall fixes; further assess fast facade approaches and wall-animation contact quality.

## v27 delivery and crawl contact checkpoint
- Installed v27 wall-direction and intentional swing-wall transition fixes, preserving prior v25 files. App signature and installed-origin native transition tests passed. App-served JS matches branch hash 4e9059e7e9752e19b6c7f5feaee0d17f19c7ed58df3330d059da031eeb756c50. Native source also updated; DMG remains v23.
- Measured actual loaded R15 crawl joints over a cycle: wrists reached ~0.35 m behind the wall plane and feet ~0.31 m behind it. Added a blended visual-only 0.4 m crawl/idle-cling offset away from the wall, preserving collision position, velocity and controls.
- After settling, sampled crawl wrists remain at least ~0.05 m outside the plane and feet ~0.088 m outside. Regression checks confirm no physics changes and removal of the offset in air. Chrome/native traversal checks and Node tests pass; native crawl snapshot inspected.
- This measures joint clearance, not every skinned vertex. Vertical wall-run wrists still penetrate by ~0.145 m at part of their cycle; wall-running contact and pose quality remain open work. Side-run feet were outside the wall plane in the measured cycle.
- Branch v28 includes the crawl visual correction; installed app/native source remain v27, DMG v23.

## v28 delivery and vertical wall-run hands
- v28 is installed in the native source and local app. The installed-origin WKWebView traversal suite passes, including crawl joint clearance, and the app serves the same game JS as the branch. The app bundle retains newer speed-line CSS/assets already present locally; those files are not part of this branch.
- Added a Chrome measurement for real R15 wrist joints during a vertical wall run. Before adjustment, a wrist entered the facade by 0.334 m. Reduced the arm swing arc and moved only the visual rig 0.2 m away during vertical wall runs; the minimum tested wrist clearance is now 0.109 m. Physical position and velocity remain unchanged.
- v29 regression: focused traversal checks and full Chrome scenario pass. The 24-route low-swing and six-route high-drop Chrome matrices pass. Next assess the full hand/foot contact pose and side-run spacing visually.
