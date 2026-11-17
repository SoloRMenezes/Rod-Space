# Rod Space

Rod Space is a personal web playground for games, experiments, and interactive projects built with HTML, CSS, and JavaScript.

This repository hosts:
- Mini-games and party games
- Creative coding experiments
- UI/UX ideas and prototypes
- Random fun projects that don’t fit anywhere else

## Live Projects
Most projects are meant to be run directly in the browser.
Open the HTML files locally or via GitHub Pages.

## Tech Stack
- HTML
- CSS (including Tailwind where useful)
- JavaScript (vanilla)

No frameworks unless needed.

## Purpose
Rod Space is a sandbox:
- Experiment freely
- Break things
- Learn by building
- Ship fun ideas fast

## Contributing
Not actively looking for contributors right now, but suggestions and feedback are welcome via Discussions.

## License
MIT License# Rod-Space

## Arcade games (November 2026)
Open `arcade.html` or follow **Arcade** from the home page. Single-player games: Fast Typing, 2048, Daily Wordle, Minesweeper, Pong, Snake Arena (computer-controlled bots), Turn-Based Combat. Local one-device games: Heads Up, UNO-style Cards, Snakes & Ladders. Platformer and network multiplayer are planned, not yet implemented.

The games use plain HTML/CSS/JavaScript with no remote dependencies. Records and preferences are stored locally in the browser (not a global leaderboard). Wordle uses a deterministic five-letter word tied to the visitor's **local calendar date**; its day number counts down to December 31 (day 0), and the yearly sequence changes on January 1. Local multiplayer games share a device; there is **no Socket.IO server** or public room-code matchmaking at this stage.

### Run and test
```sh
python3 -m http.server 8000
# Open http://localhost:8000
node tests/arcade.cjs
node --test tests/*.cjs
```

### Mac app
The native macOS application serves a bundled copy of this directory from `Rod Space.app/Contents/Resources/rod-space/`. When publishing new web content, synchronise the updated files into that bundle too. macOS-specific input handling is provided by the existing launcher; adding these web games does not require a new native executable. Restart or reload the app to see new files.

### Site publication and offline mode
The website consists of static files suitable for GitHub Pages. Run `python3 scripts/build-offline-catalog.py` after changes to game assets to recalculate verified download hashes and update the service-worker shell version. The arcade shell is pre-cached for offline use. The download index and native bundle are separate; do not assume a GitHub push updates the installed Mac app automatically.

The site has Open Graph and description metadata, a robots.txt file, keyboard controls and accessible labels. Optional analytics would require a configured service and user-consent decisions; none is enabled.
