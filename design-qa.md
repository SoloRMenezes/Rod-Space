# Design QA — Web Weavers radial speed lines

## Evidence

- Source visual truth: `/var/folders/gl/yylbjr2j5q149yxwknz8s2140000gn/T/codex-clipboard-4354e435-113d-465f-8dd0-b71148b1f2ca.png`
- Implementation, clean high-speed state: `/private/tmp/web-weavers-reference-size-80.png`
- Implementation, maximum-speed state: `/private/tmp/web-weavers-reference-size-100.png`
- Responsive evidence: `/private/tmp/web-weavers-mobile-80.png` and `/private/tmp/web-weavers-mobile-100.png`
- Source pixels: 1306 × 735. Implementation comparison pixels/CSS viewport: 1306 × 735 at device scale 1. Mobile-landscape pixels/CSS viewport: 844 × 390 at device scale 1.
- State: active gameplay with forced traversal speeds of 80 and 100. The source and implementation show different in-game camera positions, so comparison is limited to the approved speed-line overlay and preservation of player/HUD clarity.

## Full-view comparison

The speed-80 capture uses long white radial lines from all four edges with mixed lengths and widths, while retaining noticeably more world visibility than the supplied maximum-intensity reference. The speed-100 capture adds the dense second layer and closely matches the reference's full anime-burst density and edge coverage. Both captures retain a broad clear centre around the player and keep HUD text and controls sharp.

## Focused-region comparison

No additional crop was needed: the relevant visual is a full-frame radial composition and its important details are clearly readable at the normalized 1306 × 735 comparison size. Desktop and mobile-landscape full views cover the centre clearance, edge density, and responsive crop.

## Required fidelity surfaces

- Fonts and typography: unchanged from the existing game; the overlay does not blur or restyle text.
- Spacing and layout rhythm: radial assets cover the full viewport, converge on the screen centre, and keep a clear player region. HUD remains above the effect.
- Colors and visual tokens: white lines with transparent alpha match the source; no grey veil or opaque background is present.
- Image quality and asset fidelity: both generated PNGs are 1672 × 941 RGBA assets with real transparency, crisp tapered lines, no player, city, UI, text, or blur baked in.
- Copy and content: unchanged.

## Findings

No actionable P0, P1, or P2 differences remain for the requested overlay. The speed-80 state intentionally has lower density than the reference; the speed-100 state supplies the selected full-burst treatment.

## Interaction and runtime checks

- Browser gameplay regression suite passed at desktop and mobile-landscape viewports.
- Clean and dense assets loaded successfully.
- Repeated 48-speed threshold crossings remained subdued.
- Paused and inactive states hid both layers.
- Console/page errors: none.

## Comparison history

- Pass 1: no actionable P0/P1/P2 findings; no visual fixes required after the normalized comparison.

## Follow-up polish

- P3: tune the exact clean-layer opacity after extended hands-on play if the player wants more or less city visibility at speed 80.

final result: passed
