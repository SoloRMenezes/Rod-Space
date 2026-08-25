# Asset Sources

This is an unofficial fan-game prototype. Adventure Time and Card Wars belong to their respective rights holders.

## Home and Menu Art

- `assets/card-wars-home.png`: Adventure Time Wiki, `File:Card Wars Title Card.png`
- `assets/card-wars-wiki.png`: Card Wars Wiki, `File:Card Wars.png`
- `assets/finn-menu.png`: Card Wars Wiki, `File:Finnwelcomepage.png`
- `assets/jake-menu.png`: Card Wars Wiki, `File:Jakewelcomepage.png`

## Card Images

The files in `assets/cards/` were downloaded from the corresponding card pages on the Card Wars Wiki:

- The Pig
- Corn Dog
- Ancient Scholar
- Cool Dog
- Husker Knight
- Sand Angel
- Sandwitch
- Dr. Death
- Green Party Ogre
- Wandering Bald Man

Wiki content is identified by Fandom as CC-BY-SA unless otherwise noted. The underlying game artwork remains subject to its original rights.

The expanded scans in `assets/cards/official/` come from Card Dweeb's public `CardWarsData` repository. They add Angel Heart, Archer Dan, Beach Mummy, Bog Bum, Bouncing Zebracorn, Corn Ronin, Field Reaper, Field Stalker, Niceasaurus Rex, Sand Eyebat, Sand Knights, Sand Sphinx, Sandsnake, Shark, The Big Pig, and Woadic Chief.

Source: `https://github.com/itderrickh/CardWarsData/tree/master/images/generated/small`.

## Complete Card Database

- `assets/data/card-database.json` and `assets/data/card-database.js`: metadata parsed from the live Card Dweeb Card Database.
- `assets/cards/database/`: local copies of all 862 card thumbnails currently listed by Card Dweeb, comprising 853 official entries and 9 community cards.
- `scripts/import-carddweeb.mjs` and `scripts/download-card-images.mjs`: reproducible import utilities.

Source: `https://carddweeb.com/CardDatabase`.

## Landscape Cards

The files in `assets/landscapes/` are authentic Card Wars landscape scans from the Card Dweeb database and its public `CardWarsData` asset repository. Each faction contains variants 1 through 4:

- Cornfield
- Blue Plains
- Useless Swamp
- NiceLands
- SandyLands

Sources: `https://www.carddweeb.com/CardDatabase` and `https://github.com/itderrickh/CardWarsData`. Card Dweeb credits the artwork to Cryptozoic Entertainment, Frederator Studios, and Cartoon Network Studios.

## 3D Models

The Models Resource lists extracted Card Wars models for BMO, Cinnamon Bun, Earl of Lemongrab, Ice King, Lumpy Space Princess, Marceline, Peppermint Butler, and Princess Bubblegum. They are not bundled yet because their redistribution terms need to be confirmed and the current game has no Three.js scene.

## Store Pack Reference Images

- `assets/store/hero-pack.png`: user-provided Card Wars Hero Pack product image
- `assets/store/collectors-packs.png`: user-provided Card Wars collector pack photo
- `assets/store/glory-packs.png`: user-provided Card Wars For the Glory booster display image

## Game Mats and Rules

- `assets/mats/*-hd.jpg` and `assets/mats/ice-kingdom-official.jpg`: cropped Card Wars playmat product images sourced from Philibert/Cryptozoic product listings:
  - `https://cdn1.philibertnet.com/847196-thickbox_default/adventure-time-card-wars-candy-kingdom-playmat-810120781563.jpg`
  - `https://cdn1.philibertnet.com/847197-thickbox_default/adventure-time-card-wars-treehouse-playmat-810120781587.jpg`
  - `https://cdn1.philibertnet.com/847302-thickbox_default/adventure-time-card-wars-nightosphere-playmat-810120781594.jpg`
  - `https://cdn1.philibertnet.com/847338-thickbox_default/adventure-time-card-wars-ice-kingdom-playmat-810120781570.jpg`
- `assets/rules/how-to-play.png`: user-provided Card Wars quick-start rules reference
- Full rules reference: `https://www.carddweeb.com/Resources/Rulebook`
- 2025 game reference: `https://www.kickstarter.com/projects/cze/adventure-time-card-wars-2025`
