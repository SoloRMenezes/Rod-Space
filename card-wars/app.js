const STORAGE_KEY = "cardWarsAccount";
const SAVE_VERSION = 1;
const GAME_ID = "card-wars";
const VIEW_STORAGE_KEY = "cardWarsLastView";
const TEST_MODE_PASSWORD = "1234";
const CAMERA_MIN_PITCH = 8;
const CAMERA_MAX_PITCH = 88;
const LANDSCAPE_SLOTS = 4;
const MAX_DECK_SIZE = 40;
const MAX_NON_LANDSCAPE_CARDS = MAX_DECK_SIZE - LANDSCAPE_SLOTS;
const STARTUP_LOADING_MIN_MS = 950;
const BATTLE_LOADING_MS = 1350;
const ASSET_LOADING_TIMEOUT_MS = 6500;
const startupLoadingStartedAt = performance.now();

const starterCardCatalog = [
  { id: "ember_squire", name: "The Pig", type: "Creature", faction: "Rainbow", rarity: "common", cost: 1, attack: 1, block: 4, ability: "Decrease the ATK of all opposing Corn creatures by 1.", image: "assets/cards/the-pig.png" },
  { id: "moss_guard", name: "Corn Dog", type: "Creature", faction: "Corn Fields", rarity: "rare", cost: 2, attack: 9, block: 11, ability: "Adjacent creatures gain +4 ATK when this card's FLOOP ability is used.", image: "assets/cards/corn-dog.jpg" },
  { id: "river_mage", name: "Ancient Scholar", type: "Creature", faction: "Blue Plains", rarity: "rare", cost: 2, attack: 3, block: 13, image: "assets/cards/ancient-scholar.png" },
  { id: "iron_hound", name: "Cool Dog", type: "Creature", faction: "Blue Plains", rarity: "common", cost: 1, attack: 3, block: 7, image: "assets/cards/cool-dog.jpg" },
  { id: "storm_archer", name: "Husker Knight", type: "Creature", faction: "Corn Fields", rarity: "common", cost: 1, attack: 6, block: 3, image: "assets/cards/husker-knight.png" },
  { id: "sun_drake", name: "Sand Angel", type: "Creature", faction: "Sandy Lands", rarity: "common", cost: 1, attack: 2, block: 6, image: "assets/cards/sand-angel.jpg" },
  { id: "night_knight", name: "Sandwitch", type: "Creature", faction: "Sandy Lands", rarity: "epic", cost: 4, attack: 25, block: 10, image: "assets/cards/sandwitch.jpg" },
  { id: "crystal_imp", name: "Dr. Death", type: "Creature", faction: "Useless Swamp", rarity: "legendary", cost: 5, attack: 35, block: 10, starter: false, image: "assets/cards/dr-death.jpeg" },
  { id: "cinder_witch", name: "Green Party Ogre", type: "Creature", faction: "Sandy Lands", rarity: "legendary", cost: 0, attack: 11, block: 19, image: "assets/cards/green-party-ogre.png" },
  { id: "gold_giant", name: "Wandering Bald Man", type: "Creature", faction: "Useless Swamp", rarity: "common", cost: 1, attack: 2, block: 5, image: "assets/cards/wandering-bald-man.png" },
  { id: "angel_heart", name: "Angel Heart", type: "Creature", faction: "Rainbow", rarity: "rare", cost: 0, attack: 0, block: 7, image: "assets/cards/official/Angel_Heart.png" },
  { id: "archer_dan", name: "Archer Dan", type: "Creature", faction: "Corn Fields", rarity: "common", cost: 2, attack: 2, block: 6, image: "assets/cards/official/Archer_Dan.png" },
  { id: "beach_mummy", name: "Beach Mummy", type: "Creature", faction: "Sandy Lands", rarity: "common", cost: 2, attack: 4, block: 7, image: "assets/cards/official/Beach_Mummy.png" },
  { id: "bog_bum", name: "Bog Bum", type: "Creature", faction: "Useless Swamp", rarity: "common", cost: 1, attack: 2, block: 6, image: "assets/cards/official/Bog_Bum.png" },
  { id: "bouncing_zebracorn", name: "Bouncing Zebracorn", type: "Creature", faction: "Corn Fields", rarity: "rare", cost: 2, attack: 4, block: 5, image: "assets/cards/official/Bouncing_Zebracorn.png" },
  { id: "corn_ronin", name: "Corn Ronin", type: "Creature", faction: "Corn Fields", rarity: "rare", cost: 3, attack: 7, block: 8, image: "assets/cards/official/Corn_Ronin.png" },
  { id: "field_reaper", name: "Field Reaper", type: "Creature", faction: "Corn Fields", rarity: "epic", cost: 4, attack: 12, block: 9, image: "assets/cards/official/Field_Reaper.png" },
  { id: "field_stalker", name: "Field Stalker", type: "Creature", faction: "Corn Fields", rarity: "rare", cost: 2, attack: 5, block: 7, image: "assets/cards/official/Field_Stalker.png" },
  { id: "niceasaurus_rex", name: "Niceasaurus Rex", type: "Creature", faction: "Nice Lands", rarity: "epic", cost: 4, attack: 13, block: 11, image: "assets/cards/official/Niceasaurus_Rex.png" },
  { id: "sand_eyebat", name: "Sand Eyebat", type: "Creature", faction: "Sandy Lands", rarity: "common", cost: 1, attack: 2, block: 5, image: "assets/cards/official/Sand_Eyebat.png" },
  { id: "sand_knights", name: "Sand Knights", type: "Creature", faction: "Sandy Lands", rarity: "common", cost: 1, attack: 1, block: 8, image: "assets/cards/official/Sand_Knights.png" },
  { id: "sand_sphinx", name: "Sand Sphinx", type: "Building", faction: "Sandy Lands", rarity: "rare", cost: 1, attack: 0, block: 10, image: "assets/cards/official/Sand_Sphinx.png" },
  { id: "sandsnake", name: "Sandsnake", type: "Creature", faction: "Sandy Lands", rarity: "rare", cost: 2, attack: 5, block: 6, image: "assets/cards/official/Sandsnake.png" },
  { id: "shark", name: "Shark", type: "Creature", faction: "Sandy Lands", rarity: "rare", cost: 2, attack: 6, block: 6, image: "assets/cards/official/Shark.png" },
  { id: "the_big_pig", name: "The Big Pig", type: "Creature", faction: "Rainbow", rarity: "legendary", cost: 4, attack: 12, block: 14, image: "assets/cards/official/The_Big_Pig.png" },
  { id: "woadic_chief", name: "Woadic Chief", type: "Creature", faction: "Blue Plains", rarity: "epic", cost: 4, attack: 11, block: 12, image: "assets/cards/official/Woadic_Chief.png" }
];

const importedCardDatabase = Array.isArray(window.CARD_DATABASE) ? window.CARD_DATABASE : [];
const starterCardsByName = new Map(starterCardCatalog.map((card) => [card.name.toLowerCase(), card]));
const cardCatalog = importedCardDatabase.length ? importedCardDatabase.map((card) => {
  const starterCard = starterCardsByName.get(card.name.toLowerCase());
  return starterCard ? {
    ...card,
    ...starterCard,
    id: starterCard.id,
    databaseId: card.id,
    image: starterCard.image || card.image,
    ability: starterCard.ability || card.ability,
    sourceId: card.sourceId,
    sets: card.sets,
    custom: card.custom
  } : card;
}) : starterCardCatalog;

const landscapes = ["Corn Fields", "Blue Plains", "Useless Swamp", "Nice Lands", "Sandy Lands", "Icy Lands", "Lava Flats"];
const landscapeImageSets = {
  "Corn Fields": [1, 2, 3, 4].map((variant) => `assets/landscapes/corn-fields/${variant}.png`),
  "Blue Plains": [1, 2, 3, 4].map((variant) => `assets/landscapes/blue-plains/${variant}.png`),
  "Useless Swamp": [1, 2, 3, 4].map((variant) => `assets/landscapes/useless-swamp/${variant}.png`),
  "Nice Lands": [1, 2, 3, 4].map((variant) => `assets/landscapes/nice-lands/${variant}.png`),
  "Sandy Lands": [1, 2, 3, 4].map((variant) => `assets/landscapes/sandy-lands/${variant}.png`),
  "Icy Lands": [1, 2, 3, 4].map((variant) => `assets/cards/database/IcyLands${variant}.png`),
  "Lava Flats": [1, 2, 3, 4].map((variant) => `assets/cards/database/LavaFlats${variant}.png`)
};
const landscapeCardCatalog = landscapes.flatMap((faction) => landscapeImageSets[faction].map((image, index) => ({
  id: `${slugify(faction)}-${index + 1}`,
  faction,
  variant: index + 1,
  image
})));
const kingdomCatalog = [
  { id: "Corn Fields", name: "Corn Fields", description: "Bright fields and Cobnoblin creatures.", image: landscapeImageSets["Corn Fields"][0] },
  { id: "Blue Plains", name: "Blue Plains", description: "Cool skies, water, and woadic magic.", image: landscapeImageSets["Blue Plains"][0] },
  { id: "Useless Swamp", name: "Useless Swamp", description: "Murky waters and strange swamp creatures.", image: landscapeImageSets["Useless Swamp"][0] },
  { id: "Nice Lands", name: "Nice Lands", description: "Sweet hills and friendly creatures.", image: landscapeImageSets["Nice Lands"][0] },
  { id: "Sandy Lands", name: "Sandy Lands", description: "Sun-baked ruins and desert creatures.", image: landscapeImageSets["Sandy Lands"][0] },
  { id: "Icy Lands", name: "Icy Lands", description: "Frozen terrain and snowbound magic.", image: landscapeImageSets["Icy Lands"][0] },
  { id: "Lava Flats", name: "Lava Flats", description: "Volcanic ground and blazing hazards.", image: landscapeImageSets["Lava Flats"][0] }
];
const starterKingdomCatalog = kingdomCatalog.filter((kingdom) => !["Icy Lands", "Lava Flats"].includes(kingdom.id));
const starterKingdomIds = new Set(starterKingdomCatalog.map((kingdom) => kingdom.id));
const matCatalog = [
  { id: "default", name: "Tree Fort", image: "assets/mats/tree-fort-hd.jpg?v=2" },
  { id: "meadow-road", name: "Candy Kingdom", image: "assets/mats/candy-kingdom-hd.jpg?v=2" },
  { id: "moon-bridge", name: "Ice Kingdom", image: "assets/mats/ice-kingdom-official.jpg?v=3", starter: true },
  { id: "cinder-pass", name: "Nightosphere", image: "assets/mats/nightosphere-hd.jpg?v=2", starter: true }
];
const maps = matCatalog.map((mat) => mat.id);
const starterMatIds = matCatalog.filter((mat) => mat.starter).map((mat) => mat.id);
const starterMatByKingdom = {
  "Blue Plains": "moon-bridge",
  "Corn Fields": "cinder-pass",
  "Useless Swamp": "cinder-pass",
  "Nice Lands": "moon-bridge",
  "Sandy Lands": "cinder-pass",
  "Icy Lands": "moon-bridge",
  "Lava Flats": "cinder-pass"
};
const getStarterMatForKingdom = (kingdom) => starterMatByKingdom[kingdom] || starterMatIds[0];
const backgrounds = ["default", "tree-house", "candy-kingdom", "fionna-city", "humans-island", "distant-lands", "fionna-cake", "peppermint-magic", "guild-hall", "night-market", "sun-temple", "ice-cavern", "candy-castle"];
const tonedBackgrounds = ["guild-hall", "night-market", "sun-temple"];
const backgroundImageUrls = {
  "tree-house": "https://images8.alphacoders.com/674/674794.jpg",
  "candy-kingdom": "https://www.rpgfan.com/wp-content/uploads/2021/02/Adventure-Time-Pirates-of-the-Enchiridion-Screenshot-001.jpg",
  "fionna-city": "https://images.squarespace-cdn.com/content/v1/57acf62eebbd1aed407b0e05/1698190177793-WYMC2OVJAQQL0MC1QOBQ/Scene_006_BG_v001.jpg",
  "humans-island": "https://vignette.wikia.nocookie.net/horadeaventura/images/5/55/Fondo_hda_5.png/revision/latest/scale-to-width-down/1200?cb=20121122195516&path-prefix=es",
  "distant-lands": "https://images.justwatch.com/backdrop/298708974/s1440/adventure-time-distant-lands",
  "fionna-cake": "https://images.squarespace-cdn.com/content/v1/57acf62eebbd1aed407b0e05/1698190074006-227L4FW14EDPYSA88B3U/COMP001S002%2B%281%29.png",
  "peppermint-magic": "https://img.buzzfeed.com/buzzfeed-static/static/2022-09/22/18/asset/b6481d93cd82/sub-buzz-4712-1663871609-7.jpg",
  "ice-cavern": "https://cdn.cloudflare.steamstatic.com/steam/apps/728240/ss_e70d327d56dc8d735e30f0053a592aa6872d214e.1920x1080.jpg?t=1669902198",
  "candy-castle": "https://clip.cafe/img16x9/penguins-chirp.jpg"
};
const avatarCatalog = [
  { id: "finn", name: "Finn", image: "assets/cards/database/Finn.png", focus: "34%", scale: 0.92 },
  { id: "fionna-multiverse", name: "Fionna", image: "assets/cards/database/Fionna.png", focus: "40%", scale: 0.92 },
  { id: "jake", name: "Jake", image: "assets/cards/database/Jake.png", focus: "42%" },
  { id: "fionna-cake", name: "Cake", image: "assets/cards/database/Cake.png", focus: "40%", scale: 0.92 },
  { id: "gary-prince", name: "Gary Prince", image: "https://adventuretime.fandom.com/wiki/Special:Redirect/file/Gary_Prince.png", focus: "42%" },
  { id: "ellis-p", name: "Ellis P.", image: "https://adventuretime.fandom.com/wiki/Special:Redirect/file/Ellis_P.png", focus: "42%" },
  { id: "huntress-wizard-fionna-world", name: "Huntress Wizard", image: "assets/cards/database/Huntress_Wizard.png", focus: "34%", scale: 0.82 },
  { id: "prismo-fionna-world", name: "Prismo", image: "assets/cards/database/Prismo.png", focus: "42%" },
  { id: "simon-fionna-world", name: "Simon Petrikov", image: "assets/cards/database/Simon_Petrikov.png", focus: "42%" },
  { id: "the-scarab", name: "The Scarab", image: "https://static.tvtropes.org/pmwiki/pub/images/scarab_adventure_time.jpg", focus: "30%", scale: 0.76 },
  { id: "charlie", name: "Charlie", image: "assets/cards/database/Charlie.png", focus: "42%" },
  { id: "jake-jr", name: "Jake Jr.", image: "https://adventuretime.fandom.com/wiki/Special:Redirect/file/S6e12%20Jake%20Jr.%20in%20hammock.png", focus: "42%" },
  { id: "tv", name: "T.V.", image: "https://adventuretime.fandom.com/wiki/Special:Redirect/file/T.V..png", focus: "42%" },
  { id: "viola-pup", name: "Viola", image: "https://vignette.wikia.nocookie.net/adventuretime/images/4/48/Viola.png/revision/latest?cb=20130120171311&path-prefix=de", focus: "42%" },
  { id: "kim-kil-whan", name: "Kim Kil Whan", image: "https://adventuretime.fandom.com/wiki/Special:Redirect/file/S6e12%20Kim%20Kil%20Whan%20scowling.png", focus: "42%" },
  { id: "bubblegum", name: "Princess Bubblegum", image: "assets/cards/database/Princess_Bubblegum.png", focus: "32%", scale: 0.86 },
  { id: "prince-gumball", name: "Prince Gumball", image: "https://pic.pngsucai.com/00/61/39/611123180b910f6e.webp", focus: "30%", scale: 0.78 },
  { id: "marceline", name: "Marceline", image: "assets/cards/database/Marceline.png", focus: "39%" },
  { id: "marshall-lee", name: "Marshall Lee", image: "https://www.kindpng.com/picc/m/449-4494720_marshall-lee-from-gender-swap-adventure-time-guy.png", focus: "32%", scale: 0.84 },
  { id: "ice-king", name: "Ice King", image: "assets/cards/database/Ice_King.png", focus: "36%", scale: 0.9 },
  { id: "ice-queen", name: "Ice Queen", image: "assets/cards/database/Ice_Queen.png", focus: "42%" },
  { id: "gunter", name: "Gunter", image: "assets/cards/database/Gunter.png", focus: "45%" },
  { id: "bmo", name: "BMO", image: "assets/cards/database/BMO.png", focus: "42%" },
  { id: "flame-princess", name: "Flame Princess", image: "assets/cards/database/Flame_Princess.png", focus: "36%", scale: 0.86 },
  { id: "lumpy-space-princess", name: "Lumpy Space Princess", image: "assets/cards/database/Lumpy_Space_Princess.png", focus: "42%" },
  { id: "peppermint-butler", name: "Peppermint Butler", image: "assets/cards/database/Peppermint_Butler.png", focus: "42%" },
  { id: "lady-rainicorn", name: "Lady Rainicorn", image: "assets/cards/database/Lady_Rainicorn.png", focus: "42%" },
  { id: "lord-monochromicorn", name: "Lord Monochromicorn", image: "https://comicvine.gamespot.com/a/uploads/scale_small/13/132162/3387381-lord_monochromicorn.png", focus: "42%" },
  { id: "lemongrab", name: "Lemongrab", image: "assets/cards/database/Lemongrab.png", focus: "42%" },
  { id: "lemongrab-earl", name: "Earl Lemongrab", image: "https://freepngimg.com/thumb/adventure_time/127188-lemongrab-adventure-time-free-transparent-image-hd.png", focus: "42%" },
  { id: "lemongrab-dungeon", name: "Dungeon Lemongrab", image: "https://pixel.disco.nowtv.com/uuid/260c5908-0f24-37ec-bd14-5b8b3ee3b5b5/LAND_16_9?language=en-GB&proposition=NOWOTT&version=96fb4dbf-6638-3f43-a267-50ed57db257c", focus: "42%" },
  { id: "lemonhope", name: "Lemonhope", image: "https://www.nicepng.com/png/detail/219-2190193_lemonhope-lemon-boy-adventure-time.png", focus: "34%" },
  { id: "banana-guards", name: "Banana Guards", image: "https://comicvine.gamespot.com/a/uploads/square_medium/6/67663/3946738-9221891314-S6e10.jpg", focus: "45%" },
  { id: "banana-guard", name: "Banana Guard", image: "https://media.tenor.com/A28Sm-KXbxQAAAAe/adventure-time.png", focus: "42%" },
  { id: "gumball-guardian", name: "Gumball Guardian", image: "https://comicvine.gamespot.com/a/uploads/scale_medium/13/132162/3404348-picture_42.png", focus: "36%" },
  { id: "banana-man", name: "Banana Man", image: "assets/cards/database/Banana_Man.png", focus: "42%" },
  { id: "hot-dog-princess", name: "Hot Dog Princess", image: "assets/cards/database/Hot_Dog_Princess.png", focus: "42%" },
  { id: "turtle-princess", name: "Turtle Princess", image: "assets/cards/database/Turtle_Princess.png", focus: "42%" },
  { id: "magic-man", name: "Magic Man", image: "assets/cards/database/Magic_Man.png", focus: "42%" },
  { id: "choose-goose", name: "Choose Goose", image: "assets/cards/database/Choose_Goose.png", focus: "42%" },
  { id: "party-god", name: "Party God", image: "assets/cards/database/Party_God.png", focus: "42%" },
  { id: "fern", name: "Fern", image: "assets/cards/database/Fern.png", focus: "42%" },
  { id: "peppermint-dark-magic", name: "Peppermint Butler", image: "https://www.looper.com/img/gallery/20-strongest-adventure-time-characters-ranked-worst-to-best/peppermint-butler-1655233462.jpg", focus: "45%" },
  { id: "bmo-distant-lands", name: "BMO: Distant Lands", image: "https://www.syfy.com/sites/syfy/files/styles/amp_featured_image/public/2020/05/bmo-adventure-time-distant-lands.jpg", focus: "47%" }
];
const achievementCatalog = [
  { id: "first-victory", name: "First Blood", description: "Win your first battle.", type: "wins", target: 1, reward: 25 },
  { id: "wins-3", name: "Getting Started", description: "Win 3 battles.", type: "wins", target: 3, reward: 15 },
  { id: "wins-5", name: "Seasoned Fighter", description: "Win 5 battles.", type: "wins", target: 5, reward: 25 },
  { id: "wins-10", name: "Arena Regular", description: "Win 10 battles.", type: "wins", target: 10, reward: 50 },
  { id: "wins-50", name: "Battle Veteran", description: "Win 50 battles.", type: "wins", target: 50, reward: 150 },
  { id: "wins-100", name: "Card Wars Legend", description: "Win 100 battles.", type: "wins", target: 100, reward: 300 },
  { id: "cards-50", name: "Growing Collection", description: "Collect 50 different cards.", type: "cards", target: 50, reward: 50 },
  { id: "cards-100", name: "Serious Collector", description: "Collect 100 different cards.", type: "cards", target: 100, reward: 100 },
  { id: "cards-200", name: "Master Archivist", description: "Collect 200 different cards.", type: "cards", target: 200, reward: 200 },
  { id: "cards-500", name: "Complete the Set", description: "Collect 500 different cards.", type: "cards", target: 500, reward: 500 },
  { id: "corn-fields-complete", name: "Cornfield Keeper", description: "Collect every Corn Fields card.", type: "faction", faction: "Corn Fields", reward: 100 },
  { id: "blue-plains-complete", name: "Blue Plains Scholar", description: "Collect every Blue Plains card.", type: "faction", faction: "Blue Plains", reward: 100 },
  { id: "useless-swamp-complete", name: "Swamp Thing", description: "Collect every Useless Swamp card.", type: "faction", faction: "Useless Swamp", reward: 100 },
  { id: "nice-lands-complete", name: "Nice Lands Local", description: "Collect every Nice Lands card.", type: "faction", faction: "Nice Lands", reward: 100 },
  { id: "sandy-lands-complete", name: "Sandy Lands Scout", description: "Collect every Sandy Lands card.", type: "faction", faction: "Sandy Lands", reward: 100 },
  { id: "all-buildings", name: "Architect", description: "Collect every Building card.", type: "card-type", cardType: "Building", reward: 150 },
  { id: "all-creatures", name: "Creature Feature", description: "Collect every Creature card.", type: "card-type", cardType: "Creature", reward: 150 },
  { id: "all-landscapes", name: "Land Surveyor", description: "Collect every Landscape card.", type: "landscapes", reward: 100 },
  { id: "all-mats", name: "Tabletop Tourist", description: "Collect every game mat.", type: "mats", reward: 100 },
  { id: "all-backgrounds", name: "Scene Collector", description: "Collect every battle background.", type: "backgrounds", reward: 100 },
  { id: "streak-3", name: "Hot Hand", description: "Win 3 battles in a row.", type: "streak", target: 3, reward: 25 },
  { id: "streak-5", name: "Unstoppable", description: "Win 5 battles in a row.", type: "streak", target: 5, reward: 50 },
  { id: "streak-10", name: "Perfect Run", description: "Win 10 battles in a row.", type: "streak", target: 10, reward: 150 },
  { id: "deck-builder", name: "Deck Builder", description: "Build a deck with 40 cards.", type: "deck-size", target: 40, reward: 50 },
  { id: "upgrade-card", name: "Power Up", description: "Upgrade a card.", type: "upgrade", target: 1, reward: 25 }
];

const packCatalog = [
  { id: "hero-pack", name: "Hero Pack #1", image: "assets/store/hero-pack.png", price: 60, packs: 1, cardsPerPack: 5, description: "One Hero-themed booster pack." },
  { id: "collectors-packs", name: "Collector's Pack Bundle", image: "assets/store/collectors-packs.png", price: 300, packs: 6, cardsPerPack: 5, description: "Six Collector's booster packs at 50 coins each." },
  { id: "glory-packs", name: "For the Glory Packs", image: "assets/store/glory-packs.png", price: 450, packs: 10, cardsPerPack: 5, description: "Ten For the Glory booster packs at 45 coins each." }
];
const opponentFirstNames = [
  "Finn", "Jake", "BMO", "Marceline", "Peppermint", "Cinnamon", "Flame", "Ice",
  "Swamp", "Candy", "Dungeon", "Sandy", "Blue", "Rainbow", "Cool", "Card"
];
const opponentLastNames = [
  "Warden", "Ranger", "Crusher", "Ronin", "Duelist", "Sorcerer", "Scout", "Champion",
  "Knight", "Keeper", "Wizard", "Bandit", "Guardian", "Tactician", "Challenger", "Dweeb"
];

function createOpponentName() {
  const first = opponentFirstNames[Math.floor(Math.random() * opponentFirstNames.length)];
  const last = opponentLastNames[Math.floor(Math.random() * opponentLastNames.length)];
  return `${first} ${last}`;
}

const hasSavedAccount = (() => {
  try { return Boolean(localStorage.getItem(STORAGE_KEY)); } catch { return false; }
})();
let accountSetupPending = !hasSavedAccount;
let playerData = loadAccount();
let selectedDeck = playerData.activeDeck;
let collectionTypeFilter = "all";
let collectionFactionFilter = "all";
let deckTypeFilter = "Creature";
let deckFactionFilter = "all";
let deckCardSearchQuery = "";
let deckCardSort = "default";
let setupAvatarId = "finn";
let setupKingdom = "Corn Fields";
let avatarSearchQuery = "";
let testMapCamera = "angled";
let testMapHolograms = false;
let testMapOffsetX = 0;
let testMapOffsetY = 0;
let testMapPitch = 32;
let testMapRoll = -3;
let testMapZoom = 0.68;
let testMapDrag = null;
const testMapPointers = new Map();
let testMapPinch = null;
const testMapKeys = new Set();
let testMapMovementFrame = 0;
let pendingImport = null;
let battle = null;
let enemyTurnToken = 0;
let toastTimer = null;
let packOpening = null;
let cameraDrag = null;
let cameraPinch = null;
const boardPointers = new Map();
let cardDrag = null;
let boardAttackDrag = null;

const $ = (id) => document.getElementById(id);
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function setLoadingScreen(mode, title, message) {
  $("loadingTitle").textContent = title;
  $("loadingMessage").textContent = message;
  document.body.classList.add("loading-active");
  document.body.classList.toggle("battle-loading", mode === "battle");
  document.body.classList.toggle("startup-loading", mode !== "battle");
}

function hideLoadingScreen() {
  document.body.classList.remove("loading-active", "battle-loading", "startup-loading");
}

function waitForWindowLoad() {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
}

function waitForFonts() {
  return document.fonts?.ready || Promise.resolve();
}

function preloadImageSource(source) {
  if (!source) return Promise.resolve(true);
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (loaded) => {
      if (settled) return;
      settled = true;
      resolve(loaded);
    };
    image.onload = () => {
      if (image.decode) image.decode().then(() => finish(true), () => finish(true));
      else finish(true);
    };
    image.onerror = () => finish(false);
    image.src = source;
    if (image.complete) finish(image.naturalWidth > 0);
  });
}

async function preloadImageSources(sources, timeoutMs = ASSET_LOADING_TIMEOUT_MS) {
  const uniqueSources = [...new Set(sources.filter(Boolean))];
  if (!uniqueSources.length) return { loaded: 0, failed: 0, total: 0, timedOut: false };
  const loadAll = Promise.all(uniqueSources.map((source) => preloadImageSource(source)));
  const result = await Promise.race([
    loadAll.then((results) => ({ results, timedOut: false })),
    sleep(timeoutMs).then(() => ({ results: [], timedOut: true }))
  ]);
  const loaded = result.results.filter(Boolean).length;
  return {
    loaded,
    failed: result.timedOut ? uniqueSources.length - loaded : result.results.length - loaded,
    total: uniqueSources.length,
    timedOut: result.timedOut
  };
}

function collectDomImageSources(root = document) {
  if (!root) return [];
  return [...root.querySelectorAll("img")].map((image) => image.currentSrc || image.src || image.getAttribute("src"));
}

function collectStartupAssetSources() {
  return [
    "assets/loading-backdrop.svg",
    ...collectDomImageSources(document.querySelector(".loading-screen")),
    ...collectDomImageSources(document.querySelector(".view.active")),
    ...collectDomImageSources(document.querySelector("dialog[open]"))
  ];
}

function collectBattleAssetSources() {
  if (!battle) return [];
  return [
    "assets/loading-backdrop.svg",
    getMat(playerData.maps.equipped).image,
    getMat(battle.enemyMap).image,
    ...battle.playerLandscapeArt,
    ...battle.enemyLandscapeArt,
    ...battle.hand.map((id) => getCard(id)?.image),
    ...battle.playerBoard.map((creature) => creature && getCard(creature.id)?.image),
    ...battle.enemyBoard.map((creature) => creature && getCard(creature.id)?.image),
    ...collectDomImageSources($("battleView")),
    ...collectDomImageSources(document.querySelector(".loading-screen"))
  ];
}

async function finishStartupLoading() {
  setLoadingScreen("startup", "Card Wars", "Loading the kingdom");
  await Promise.all([
    waitForFonts(),
    preloadImageSources(collectStartupAssetSources()),
    sleep(Math.max(0, STARTUP_LOADING_MIN_MS - (performance.now() - startupLoadingStartedAt)))
  ]);
  hideLoadingScreen();
}

function createDefaultAccount(options = {}) {
  const collection = {};
  const includeStarterCards = options.includeStarterCards !== false;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const addCardPull = (card) => {
    if (!card) return;
    collection[card.id] = collection[card.id] || { copies: 0, upgradeLevel: 1 };
    collection[card.id].copies += 1;
  };
  const selectedKingdom = starterKingdomIds.has(options.kingdom) ? options.kingdom : null;
  const startingLandscapeCards = Array.from({ length: 4 }, (_, slot) => pick(landscapeCardCatalog.filter((card) => card.variant === slot + 1 && (!selectedKingdom || card.faction === selectedKingdom))));
  const startingLandscapeIds = startingLandscapeCards.map((card) => card.id);
  const startingLandscapes = startingLandscapeCards.map((card) => card.faction);
  const startingCards = [];
  const startingCardPool = (type) => cardCatalog.filter((card) => card.collectible !== false
    && card.starter !== false
    && card.id !== "crystal_imp"
    && card.type === type
    && (type === "Hero"
      ? card.faction === "Rainbow"
      : selectedKingdom
        ? card.faction === selectedKingdom
        : card.faction === "Rainbow" || startingLandscapes.includes(card.faction)));
  const addStartingCards = (type, amount) => {
    const pool = startingCardPool(type);
    for (let count = 0; count < amount; count += 1) {
      const unused = pool.filter((card) => !startingCards.includes(card));
      const card = pick(unused.length ? unused : pool);
      if (card) startingCards.push(card);
    }
  };
  if (includeStarterCards) {
    addStartingCards("Creature", 10);
    addStartingCards("Hero", 1);
    addStartingCards("Building", 2);
    startingCards.forEach(addCardPull);
  }
  return {
    saveVersion: SAVE_VERSION,
    gameId: GAME_ID,
    exportedAt: null,
    profile: { username: String(options.username || "Player").slice(0, 18), avatar: avatarCatalog.some((entry) => entry.id === options.avatar) ? options.avatar : "finn", kingdom: selectedKingdom || "Corn Fields", level: 1, xp: 0, coins: 0 },
    collection,
    landscapeCollection: startingLandscapeIds,
    decks: Array.from({ length: 5 }, (_, index) => ({
      name: `Deck ${index + 1}`,
      cards: [],
      landscapes: startingLandscapes,
      landscapeCards: startingLandscapeIds
    })),
    activeDeck: 0,
    maps: { owned: [...starterMatIds], equipped: getStarterMatForKingdom(options.kingdom) },
    backgrounds: { owned: ["default"], equipped: "default" },
    campaign: { currentStage: "s1", completedStages: [], rewardsCollected: [] },
    unlocks: { deckBuilder: true, campaign: true, store: true, crafting: false },
    storePurchases: [],
    achievements: { firstVictory: false, collector: false, deckCrafter: false },
    challenges: {},
    stats: { matchesWon: 0, matchesLost: 0, currentWinStreak: 0, bestWinStreak: 0 },
    settings: { sound: true, reduceMotion: false, holograms: true, boardCamera: "angled", boardOrbit: { pitch: 32, yaw: 0, zoom: 0.68, panX: 0, panY: 0 } },
    permanentProgress: {}
  };
}

function loadAccount() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeAccount(JSON.parse(saved)) : createDefaultAccount();
  } catch {
    return createDefaultAccount();
  }
}

function normalizeAccount(account) {
  // Normalizing an existing save must never generate another starter collection.
  const base = createDefaultAccount({ includeStarterCards: false });
  const source = account && typeof account === "object" ? account : {};
  const merged = {
    ...base,
    ...source,
    profile: { ...base.profile, ...(source.profile || {}) },
    collection: { ...base.collection, ...(source.collection || {}) },
    maps: { ...base.maps, ...(source.maps || {}) },
    backgrounds: { ...base.backgrounds, ...(source.backgrounds || {}) },
    campaign: { ...base.campaign, ...(source.campaign || {}) },
    unlocks: { ...base.unlocks, ...(source.unlocks || {}) },
    achievements: { ...base.achievements, ...(source.achievements || {}) },
    challenges: { ...base.challenges, ...(source.challenges || {}) },
    stats: { ...base.stats, ...(source.stats || {}) },
    settings: { ...base.settings, ...(source.settings || {}) },
    permanentProgress: { ...base.permanentProgress, ...(source.permanentProgress || {}) }
  };

  merged.profile.username = String(merged.profile.username || "Player").trim().slice(0, 18) || "Player";
  merged.profile.avatar = avatarCatalog.some((avatar) => avatar.id === merged.profile.avatar) ? merged.profile.avatar : "finn";
  merged.profile.kingdom = kingdomCatalog.some((kingdom) => kingdom.id === merged.profile.kingdom) ? merged.profile.kingdom : "Corn Fields";
 merged.profile.level = positiveInteger(merged.profile.level, 1);
 merged.profile.xp = nonNegativeNumber(merged.profile.xp);
  merged.profile.xp = Math.min(merged.profile.xp, getLevelWinTarget(merged.profile.level) - 1);
 merged.profile.coins = nonNegativeNumber(merged.profile.coins);
  merged.stats.matchesWon = nonNegativeNumber(merged.stats.matchesWon);
  merged.stats.matchesLost = nonNegativeNumber(merged.stats.matchesLost);
  merged.stats.currentWinStreak = nonNegativeNumber(merged.stats.currentWinStreak);
  merged.stats.bestWinStreak = Math.max(merged.stats.currentWinStreak, nonNegativeNumber(merged.stats.bestWinStreak));
  const savedOrbit = merged.settings.boardOrbit || {};
  const savedZoom = Number(savedOrbit.zoom);
  merged.settings.boardOrbit = {
    pitch: Math.min(CAMERA_MAX_PITCH, Math.max(CAMERA_MIN_PITCH, Number(savedOrbit.pitch) || 32)),
    yaw: Math.min(1080, Math.max(-1080, Number(savedOrbit.yaw) || 0)),
    zoom: Math.min(1.2, Math.max(0.4, savedZoom === 0.82 ? 0.68 : savedZoom || 0.68)),
    panX: Math.min(1000, Math.max(-1000, Number(savedOrbit.panX) || 0)),
    panY: Math.min(1000, Math.max(-1000, Number(savedOrbit.panY) || 0))
  };
  merged.activeDeck = Math.min(Math.max(Number(merged.activeDeck) || 0, 0), 4);
  merged.storePurchases = Array.isArray(source.storePurchases) ? source.storePurchases : [];
  merged.settings.holograms = typeof source.settings?.holograms === "boolean" ? source.settings.holograms : true;

  merged.decks = Array.from({ length: 5 }, (_, index) => {
    const incoming = Array.isArray(source.decks) ? source.decks[index] || {} : {};
    const cards = Array.isArray(incoming.cards) ? incoming.cards.filter((id) => getCard(id)).slice(0, MAX_NON_LANDSCAPE_CARDS) : base.decks[index].cards;
    const assigned = Array.isArray(incoming.landscapes) ? incoming.landscapes.filter((name) => landscapes.includes(name)).slice(0, 4) : [];
    while (assigned.length < 4) assigned.push(base.decks[index].landscapes[assigned.length]);
    const incomingLandscapeCards = Array.isArray(incoming.landscapeCards) ? incoming.landscapeCards : [];
    const landscapeCards = Array.from({ length: 4 }, (_, slot) => {
      const savedCard = getLandscapeCard(incomingLandscapeCards[slot]);
      if (savedCard && savedCard.variant === slot + 1) return savedCard.id;
      return getLandscapeCardsForFaction(assigned[slot]).find((card) => card.variant === slot + 1)?.id || null;
    });
    const normalizedLandscapes = landscapeCards.map((id) => getLandscapeCard(id)?.faction || null);
    const usedCopies = {};
    const legalCards = cards.filter((id) => {
      const card = getCard(id);
      const ownedCopies = merged.collection[id]?.copies || 0;
      if (!card || (usedCopies[id] || 0) >= ownedCopies) return false;
      const legal = card.faction === "Rainbow" || normalizedLandscapes.includes(card.faction);
      if (legal) usedCopies[id] = (usedCopies[id] || 0) + 1;
      return legal;
    });
    return { name: String(incoming.name || base.decks[index].name).slice(0, 24), cards: legalCards, landscapes: normalizedLandscapes, landscapeCards };
  });

  const legacyLandscapeCards = merged.decks.flatMap((deck) => deck.landscapeCards);
  const ownedLandscapeSource = Array.isArray(source.landscapeCollection)
    ? source.landscapeCollection
    : [...base.landscapeCollection, ...legacyLandscapeCards];
  merged.landscapeCollection = [...new Set(ownedLandscapeSource.filter((id) => getLandscapeCard(id)))];
  if (!merged.landscapeCollection.length) merged.landscapeCollection = [...base.landscapeCollection];
  merged.decks = merged.decks.map((deck) => {
    const landscapeCards = deck.landscapeCards.map((id, slot) => {
      const card = getLandscapeCard(id);
      return card && card.variant === slot + 1 && merged.landscapeCollection.includes(id) ? id : null;
    });
    return { ...deck, landscapeCards, landscapes: landscapeCards.map((id) => getLandscapeCard(id)?.faction || null) };
  });

  merged.maps.owned = normalizeOwnedList(merged.maps.owned, maps);
  starterMatIds.forEach((id) => {
    if (!merged.maps.owned.includes(id)) merged.maps.owned.push(id);
  });
  const hasPurchasedMat = merged.storePurchases.some((purchase) => purchase.type === "map");
  if (merged.maps.equipped === "default" && !hasPurchasedMat) merged.maps.equipped = getStarterMatForKingdom(merged.profile.kingdom);
  merged.backgrounds.owned = normalizeOwnedList(merged.backgrounds.owned, backgrounds);
  if (!merged.maps.owned.includes(merged.maps.equipped)) merged.maps.equipped = merged.maps.owned[0];
  if (!merged.backgrounds.owned.includes(merged.backgrounds.equipped)) merged.backgrounds.equipped = merged.backgrounds.owned[0];
  const achievementIds = achievementCatalog.map((achievement) => achievement.id);
  merged.campaign.completedStages = normalizeOwnedList(merged.campaign.completedStages, achievementIds, false);
  merged.campaign.rewardsCollected = normalizeOwnedList(merged.campaign.rewardsCollected, achievementIds, false);
  if (merged.unlocks.testMode) grantTestingUnlocks(merged);
  return merged;
}

function normalizeOwnedList(value, allowed, includeDefault = true) {
  const list = Array.isArray(value) ? value.filter((item) => allowed.includes(item)) : [];
  const unique = [...new Set(list)];
  if (includeDefault && !unique.includes("default") && allowed.includes("default")) unique.unshift("default");
  return unique;
}

function nonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function positiveInteger(value, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function validateAccount(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("The file is not a save object.");
  if (raw.gameId !== GAME_ID) throw new Error("This is not a Card Wars account file.");
  if (!Number.isInteger(raw.saveVersion) || raw.saveVersion < 1) throw new Error("The save version is missing or invalid.");
  if (raw.saveVersion > SAVE_VERSION) throw new Error("This save was created by a newer version of the game.");
  if (!raw.profile || typeof raw.profile.username !== "string") throw new Error("The player profile is missing.");
  if (!raw.collection || typeof raw.collection !== "object" || Array.isArray(raw.collection)) throw new Error("The card collection is missing.");
  if (!Array.isArray(raw.decks) || raw.decks.length !== 5) throw new Error("The save must contain all five deck presets.");
  raw.decks.forEach((deck, index) => {
    if (!deck || !Array.isArray(deck.cards)) throw new Error(`Deck ${index + 1} has invalid cards.`);
    if (!Array.isArray(deck.landscapes) || deck.landscapes.length !== 4) throw new Error(`Deck ${index + 1} must contain four landscapes.`);
  });
  if (!raw.maps || !Array.isArray(raw.maps.owned) || typeof raw.maps.equipped !== "string") throw new Error("Map ownership is missing.");
  if (!raw.backgrounds || !Array.isArray(raw.backgrounds.owned) || typeof raw.backgrounds.equipped !== "string") throw new Error("Background ownership is missing.");
  if (!raw.campaign || !Array.isArray(raw.campaign.completedStages) || !Array.isArray(raw.campaign.rewardsCollected)) throw new Error("Campaign progress is missing.");
  if (!raw.unlocks || !Array.isArray(raw.storePurchases) || !raw.settings) throw new Error("Permanent account progress is incomplete.");
  return normalizeAccount(raw);
}

function saveAccount(message = "Progress autosaved") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData));
  $("saveStatus").textContent = `Autosaved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  applyEquippedTheme();
  if (message) showToast(message);
}

function exportAccount() {
  const exportData = JSON.parse(JSON.stringify(playerData));
  exportData.saveVersion = SAVE_VERSION;
  exportData.gameId = GAME_ID;
  exportData.exportedAt = new Date().toISOString();
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "card-wars-account.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast("Complete account exported");
}

function showImportConfirmation(account) {
  pendingImport = account;
  $("importTitle").textContent = `Import ${account.profile.username} - Level ${account.profile.level}?`;
  $("importSummary").innerHTML = [
    ["Level", account.profile.level],
    ["Coins", account.profile.coins],
    ["Cards owned", countCards(account.collection)],
    ["Decks", `${account.decks.filter((deck) => deck.cards.length).length}/5 built`],
    ["Achievements", `${account.campaign.rewardsCollected.length}/${achievementCatalog.length} claimed`]
  ].map(([label, value]) => `<p><strong>${label}</strong><br>${value}</p>`).join("");
  $("importDialog").showModal();
}

function importPendingAccount() {
  if (!pendingImport) return;
  playerData = pendingImport;
  pendingImport = null;
  selectedDeck = playerData.activeDeck;
  saveAccount("");
  battle = null;
  renderAll();
  $("importDialog").close();
  showToast("Account imported. All progress is now active.");
}

function activateTestMode() {
  const dialog = $("testModeDialog");
  if (!dialog || dialog.open) return;
  $("testModePassword").value = "";
  $("testModeError").textContent = "";
  dialog.showModal();
  requestAnimationFrame(() => $("testModePassword").focus());
}

function confirmTestMode() {
  if ($("testModePassword").value !== TEST_MODE_PASSWORD) {
    $("testModeError").textContent = "Wrong password";
    $("testModePassword").select();
    return;
  }
  unlockEverythingForTesting();
  saveAccount("Test mode enabled: everything unlocked");
  renderAll();
  $("testModeDialog").close();
}

function grantTestingUnlocks(account, options = {}) {
  cardCatalog.forEach((card) => {
    if (!card || card.collectible === false) return;
    account.collection[card.id] = {
      copies: Math.max(account.collection[card.id]?.copies || 0, 4),
      upgradeLevel: Math.max(account.collection[card.id]?.upgradeLevel || 1, 5)
    };
  });
  account.landscapeCollection = landscapeCardCatalog.map((card) => card.id);
  account.maps.owned = [...maps];
  account.backgrounds.owned = [...backgrounds];
  account.unlocks = { ...account.unlocks, deckBuilder: true, campaign: true, store: true, crafting: true, testMode: true };
  account.profile.level = Math.max(account.profile.level, 50);
  account.profile.coins = Math.max(account.profile.coins, 99999);
  account.profile.xp = 0;
  account.campaign.completedStages = achievementCatalog.map((achievement) => achievement.id);
  account.campaign.rewardsCollected = achievementCatalog.map((achievement) => achievement.id);
  account.achievements.firstVictory = true;
  account.achievements.collector = true;
  account.achievements.deckCrafter = true;
  account.stats.matchesWon = Math.max(account.stats.matchesWon, 100);
  account.stats.bestWinStreak = Math.max(account.stats.bestWinStreak, 10);
  if (options.recordPurchase) account.storePurchases.push({ type: "test-mode", at: new Date().toISOString() });
  account.decks = account.decks.map((deck) => {
    const landscapeCards = Array.from({ length: LANDSCAPE_SLOTS }, (_, index) =>
      deck.landscapeCards[index] || landscapeCardCatalog.find((card) => card.variant === index + 1)?.id
    ).filter(Boolean);
    return {
      ...deck,
      landscapeCards,
      landscapes: landscapeCards.map((id) => getLandscapeCard(id)?.faction || "Corn Fields"),
      cards: deck.cards.filter((id) => getCard(id)).slice(0, MAX_NON_LANDSCAPE_CARDS)
    };
  });
}

function unlockEverythingForTesting() {
  grantTestingUnlocks(playerData, { recordPurchase: true });
}

function getCard(id) { return cardCatalog.find((card) => card.id === id); }
function getLandscapeCard(id) { return landscapeCardCatalog.find((card) => card.id === id); }
function getLandscapeCardsForFaction(faction) { return landscapeCardCatalog.filter((card) => card.faction === faction); }
function getOwnedLandscapeCards() { return playerData.landscapeCollection.map((id) => getLandscapeCard(id)).filter(Boolean); }
function getOwnedLandscapeCardsForFaction(faction) { return getOwnedLandscapeCards().filter((card) => card.faction === faction); }
function getMat(id) { return matCatalog.find((mat) => mat.id === id) || matCatalog[0]; }
function countCards(collection) { return Object.values(collection).reduce((sum, entry) => sum + nonNegativeNumber(entry.copies), 0); }
function getOwnedCards() { return Object.keys(playerData.collection).filter((id) => getCard(id) && playerData.collection[id].copies > 0); }
function matchesCardFilters(card, typeFilter, factionFilter) {
  if (!card) return false;
  return (typeFilter === "all" || card.type === typeFilter)
    && (factionFilter === "all" || card.faction === factionFilter);
}
function filterCards(cards, typeFilter, factionFilter) {
  return cards.filter((card) => matchesCardFilters(card, typeFilter, factionFilter));
}
function matchesDeckCardSearch(card) {
  const query = deckCardSearchQuery.trim().toLowerCase();
  if (!query) return true;
  return [card.name, card.faction, card.type, card.ability].some((value) => String(value || "").toLowerCase().includes(query));
}
function getDeckSortValue(card, sort) {
  if (sort.startsWith("atk")) return Number(card?.attack) || 0;
  if (sort.startsWith("def")) return Number(card?.block) || 0;
  if (sort.startsWith("nrg")) return Number(card?.cost) || 0;
  return 0;
}
function sortDeckCards(cards) {
  if (deckCardSort === "strongest") deckCardSort = "atk-high";
  if (deckCardSort === "weakest") deckCardSort = "atk-low";
  if (deckCardSort === "default") return cards;
  const direction = deckCardSort.endsWith("low") ? 1 : -1;
  return [...cards].sort((a, b) => (getDeckSortValue(a, deckCardSort) - getDeckSortValue(b, deckCardSort)) * direction || a.name.localeCompare(b.name));
  return cards;
}
function getLevelWinTarget(level) { return Math.max(3, level * 2 + 1); }
function getLevelReward(level) { return 10 + level * 5; }
function getWinLossRatio() {
  const wins = playerData.stats.matchesWon;
  const losses = playerData.stats.matchesLost;
  return losses ? (wins / losses).toFixed(2) : wins ? "∞" : "0.00";
}
function getOwnedDistinctCount(filter = () => true) {
  return getOwnedCards().filter((id) => filter(getCard(id))).length;
}
function getAchievementProgress(achievement) {
  switch (achievement.type) {
    case "wins": return playerData.stats.matchesWon;
    case "cards": return getOwnedCards().length;
    case "streak": return Math.max(playerData.stats.currentWinStreak, playerData.stats.bestWinStreak || 0);
    case "faction": return getOwnedDistinctCount((card) => card.faction === achievement.faction);
    case "card-type": return getOwnedDistinctCount((card) => card.type === achievement.cardType);
    case "landscapes": return playerData.landscapeCollection.length;
    case "mats": return playerData.maps.owned.length;
    case "backgrounds": return playerData.backgrounds.owned.length;
    case "deck-size": return Math.max(...playerData.decks.map((deck) => deck.cards.length + LANDSCAPE_SLOTS), 0);
    case "upgrade": return getOwnedCards().some((id) => (playerData.collection[id].upgradeLevel || 1) > 1) ? 1 : 0;
    default: return 0;
  }
}
function getAchievementTarget(achievement) {
  if (achievement.target) return achievement.target;
  if (achievement.type === "faction") return cardCatalog.filter((card) => card.collectible !== false && card.faction === achievement.faction).length;
  if (achievement.type === "card-type") return cardCatalog.filter((card) => card.collectible !== false && card.type === achievement.cardType).length;
  if (achievement.type === "landscapes") return landscapeCardCatalog.length;
  if (achievement.type === "mats") return maps.length;
  if (achievement.type === "backgrounds") return backgrounds.length;
  return 1;
}
function getAchievementState(achievement) {
  const progress = getAchievementProgress(achievement);
  const target = getAchievementTarget(achievement);
  if (playerData.campaign.rewardsCollected.includes(achievement.id)) return "claimed";
  return progress >= target ? "claim" : "locked";
}
function cardMatchesDeck(id, deck) {
  const card = getCard(id);
  return Boolean(card && card.playable !== false && (card.faction === "Rainbow" || deck.landscapes.includes(card.faction)));
}
function getDeckCardStatus(id, deck) {
  const card = getCard(id);
  if (!card || card.playable === false) return "unsupported";
  return card.faction === "Rainbow" || deck.landscapes.includes(card.faction) ? "ready" : "wrong-landscape";
}
function getDeckAvailableCopies(id, deck) {
  const owned = playerData.collection[id]?.copies || 0;
  const inDeck = deck.cards.filter((cardId) => cardId === id).length;
  return Math.max(0, owned - inDeck);
}
function getDeckCards() {
  const deck = playerData.decks[playerData.activeDeck];
  const validCards = deck.cards.filter((id) => playerData.collection[id]?.copies > 0 && cardMatchesDeck(id, deck));
  return validCards;
}

function shuffleCards(cards) {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function buildBattleDeck(sourceCards, size = sourceCards.length) {
  const validCards = sourceCards.filter((id) => getCard(id));
  if (!validCards.length) return [];
  return shuffleCards(validCards.slice(0, Math.max(0, size)));
}

function getStartingHp(deckSize) {
  return 25;
}

function getOpponentLevel() {
  const playerLevel = Math.max(1, Number(playerData.profile.level) || 1);
  const minimum = Math.max(1, playerLevel - 5);
  const maximum = playerLevel + 5;
  return minimum + Math.floor(Math.random() * (maximum - minimum + 1));
}

function getEnemyDeckSize(level) {
  return Math.min(MAX_NON_LANDSCAPE_CARDS, 15 + Math.max(0, level - 1) * 2);
}

function drawCards(hand, pile, amount = 1) {
  for (let count = 0; count < amount && pile.length; count += 1) hand.push(pile.pop());
}

function resetBoardUsage(board) {
  board.forEach((creature) => {
    if (creature) {
      creature.used = false;
      creature.turning = false;
    }
  });
}

function markCreatureUsed(creature) {
  if (!creature) return;
  if (!creature.used) creature.turning = true;
  creature.used = true;
}

function getBattleCardPool(landscapeCards) {
  const factions = landscapeCards.map((card) => card.faction);
  const matches = (id) => {
    const card = getCard(id);
    return Boolean(card && card.playable !== false && (card.faction === "Rainbow" || factions.includes(card.faction)));
  };
  const deckMatches = playerData.decks[playerData.activeDeck].cards.filter((id) => playerData.collection[id]?.copies > 0 && matches(id));
  if (deckMatches.length) return deckMatches;
  const ownedMatches = getOwnedCards().filter(matches);
  if (ownedMatches.length) return ownedMatches;
  return [];
}

function startBattle(selectedLandscapeIds = playerData.decks[playerData.activeDeck].landscapeCards) {
  const ownedLandscapes = getOwnedLandscapeCards();
  const playerLandscapeCards = Array.from({ length: 4 }, (_, slot) => {
    const selected = getLandscapeCard(selectedLandscapeIds[slot]);
    return selected && playerData.landscapeCollection.includes(selected.id) && selected.variant === slot + 1
      ? selected
      : ownedLandscapes.find((card) => card.variant === slot + 1) || null;
  });
  if (playerLandscapeCards.some((card) => !card)) {
    showToast("Assign one owned landscape card to each numbered slot before battling");
    battle = null;
    return false;
  }
  const enemyLandscapeCards = shuffleCards(landscapeCardCatalog).slice(0, 4);
  const playerLandscapes = playerLandscapeCards.map((card) => card.faction);
  const enemyLandscapes = enemyLandscapeCards.map((card) => card.faction);
  const configuredDeckCards = getDeckCards();
  const playerDrawPile = buildBattleDeck(configuredDeckCards.length ? configuredDeckCards : getBattleCardPool(playerLandscapeCards));
  const enemyPool = cardCatalog.filter((card) => card.playable !== false).map((card) => card.id);
  const opponentLevel = getOpponentLevel();
  const enemyDeckSize = getEnemyDeckSize(opponentLevel);
  const enemyDrawPile = buildBattleDeck(Array.from({ length: enemyDeckSize }, (_, index) => enemyPool[index % enemyPool.length]));
  if (!playerDrawPile.length) {
    showToast("Build a deck with owned cards before battling");
    battle = null;
    return false;
  }
  const startingHp = getStartingHp(playerDrawPile.length + LANDSCAPE_SLOTS);
  const enemyStartingHp = getStartingHp(enemyDrawPile.length + LANDSCAPE_SLOTS);
  const hand = [];
  const enemyHand = [];
  const startingPlayer = Math.random() < 0.5 ? "player" : "enemy";
  drawCards(hand, playerDrawPile, 5);
  drawCards(enemyHand, enemyDrawPile, 5);
  battle = {
    playerHp: startingHp,
    maxPlayerHp: startingHp,
    enemyHp: enemyStartingHp,
    maxEnemyHp: enemyStartingHp,
    energy: 6,
    maxEnergy: 6,
    enemyEnergy: 6,
    enemyMaxEnergy: 6,
    actionsLeft: 2,
    enemyActionsLeft: 2,
    hand,
    enemyHand,
    playerDrawPile,
    enemyDrawPile,
    playerDiscard: [],
    enemyDiscard: [],
    playerBoard: [null, null, null, null],
    enemyBoard: [null, null, null, null],
    playerLandscapes,
    playerLandscapeCards: playerLandscapeCards.map((card) => card.id),
    playerLandscapeArt: playerLandscapeCards.map((card) => card.image),
    enemyLandscapes,
    enemyLandscapeArt: enemyLandscapeCards.map((card) => card.image),
    enemyMap: maps[Math.floor(Math.random() * maps.length)],
    enemyName: createOpponentName(),
    enemyLevel: opponentLevel,
    startingPlayer,
    turn: startingPlayer,
    playerTurnsCompleted: 0,
    enemyTurnsCompleted: 0,
    enemyHasPlayed: false,
    round: 1,
    log: [],
    animating: false,
    enemyPhaseRunning: false,
    freshHand: true
  };
  battle.log.push(battle.startingPlayer === "player"
    ? "Round 1: your turn. You won the starting roll. Five cards drawn from a shuffled deck."
    : "Round 1: opponent starts. Five cards drawn from a shuffled deck.");
  return true;
}

async function playCard(id, index, cardElement, requestedLane = null) {
  const card = getCard(id);
  if (!card || battle.animating || battle.turn !== "player" || battle.actionsLeft < 1 || battle.energy < card.cost) return;
  const assignedLandscapes = battle.playerLandscapes;
  const lane = Number.isInteger(requestedLane) && cardCanUseLane(card, requestedLane, assignedLandscapes, battle.playerBoard)
    ? requestedLane
    : requestedLane === null ? findOpenLane(card, assignedLandscapes, battle.playerBoard) : -1;
  if (lane < 0) {
    showToast(card.faction === "Rainbow" ? "All four card slots are occupied" : `No open ${card.faction} landscape`);
    return;
  }
  battle.animating = true;
  const owned = playerData.collection[id] || { upgradeLevel: 1 };
  const bonus = Math.max(0, owned.upgradeLevel - 1);
  battle.energy -= card.cost;
  battle.actionsLeft -= 1;
  pulseEnergy();
  if (!playerData.settings.reduceMotion) {
    cardElement?.classList.add("playing");
    await sleep(210);
    await sleep(220);
  }
  battle.playerBoard[lane] = {
    id,
    damage: 0,
    attack: card.attack + bonus,
    defense: card.block + bonus,
    attackedRound: 0,
    counteredRound: 0,
    used: false
  };
  battle.hand.splice(index, 1);
  battle.log.unshift(`${card.name} enters lane ${lane + 1}. Drag its hologram onto an enemy creature to attack.`);
  battle.animating = false;
  renderBattle();
}

function drawExtraCard() {
  if (battle.animating || battle.turn !== "player" || battle.actionsLeft < 1) return;
  if (!battle.playerDrawPile.length) return loseBattle();
  drawCards(battle.hand, battle.playerDrawPile, 1);
  battle.actionsLeft -= 1;
  battle.freshHand = true;
  battle.log.unshift("You spend 1 Action to draw an extra card.");
  renderBattle();
}

async function enemyTurn(opening = false) {
  if (!battle || battle.animating || battle.enemyPhaseRunning || battle.turn !== (opening ? "enemy" : "player")) return;
  const activeBattle = battle;
  const turnToken = ++enemyTurnToken;
  activeBattle.enemyTurnToken = turnToken;
  activeBattle.enemyPhaseRunning = true;
  const isCurrentTurn = () => battle === activeBattle
    && activeBattle.enemyTurnToken === turnToken
    && activeBattle.turn === "enemy";

  try {
  activeBattle.animating = true;
  activeBattle.turn = "enemy";
  if (!opening) {
    activeBattle.playerTurnsCompleted += 1;
    activeBattle.log.unshift("Your turn ends. Opponent phase: each enemy creature attacks once at most.");
  } else {
    activeBattle.log.unshift("Opponent starts the battle.");
  }
  renderBattle();

  await sleep(playerData.settings.reduceMotion ? 0 : 400);
  if (!isCurrentTurn()) return;
  activeBattle.enemyActionsLeft = 2;
  activeBattle.enemyEnergy = activeBattle.enemyMaxEnergy;
  resetBoardUsage(activeBattle.enemyBoard);
  if (!opening) {
    if (!activeBattle.enemyDrawPile.length) return winBattle();
    drawCards(activeBattle.enemyHand, activeBattle.enemyDrawPile, 1);
    activeBattle.log.unshift("Opponent turn: one card drawn.");
    renderBattle();
  }

  while (activeBattle.enemyActionsLeft > 0 && isCurrentTurn()) {
    const choiceIndex = activeBattle.enemyHand.findIndex((id) => {
      const card = getCard(id);
      return card && card.cost <= activeBattle.enemyEnergy && findOpenLane(card, activeBattle.enemyLandscapes, activeBattle.enemyBoard) >= 0;
    });
    if (choiceIndex < 0) break;
    const id = activeBattle.enemyHand[choiceIndex];
    const card = getCard(id);
    const lane = findOpenLane(card, activeBattle.enemyLandscapes, activeBattle.enemyBoard);
    activeBattle.enemyEnergy -= card.cost;
    activeBattle.enemyActionsLeft -= 1;
    activeBattle.enemyHand.splice(choiceIndex, 1);
    activeBattle.enemyBoard[lane] = {
      id,
      damage: 0,
      attack: card.attack,
      defense: card.block,
      attackedRound: 0,
      counteredRound: 0,
      used: false
    };
    activeBattle.enemyHasPlayed = true;
    activeBattle.log.unshift(`${card.name} enters the opponent's lane ${lane + 1}.`);
    renderBattle();
    await sleep(playerData.settings.reduceMotion ? 0 : 350);
  }

  if (!isCurrentTurn()) return;
  activeBattle.log.unshift("Opponent attacks.");
  await resolveEnemyCombat();
  if (!isCurrentTurn()) return;
  if (activeBattle.playerHp <= 0) return loseBattle();
  if (activeBattle.enemyHp <= 0) return winBattle();

  activeBattle.enemyTurnsCompleted += 1;
  if (opening) {
    activeBattle.turn = "player";
    activeBattle.energy = activeBattle.maxEnergy;
    activeBattle.actionsLeft = 2;
    resetBoardUsage(activeBattle.playerBoard);
    activeBattle.animating = false;
    activeBattle.freshHand = true;
    renderBattle();
    return;
  }

  activeBattle.round += 1;
  activeBattle.turn = "player";
  activeBattle.energy = activeBattle.maxEnergy;
  activeBattle.actionsLeft = 2;
  resetBoardUsage(activeBattle.playerBoard);
  if (!activeBattle.playerDrawPile.length) return loseBattle();
  drawCards(activeBattle.hand, activeBattle.playerDrawPile, 1);
  activeBattle.log.unshift(`Round ${activeBattle.round}: you draw one card and refill to ${activeBattle.maxEnergy} Energy.`);
  activeBattle.animating = false;
  activeBattle.freshHand = true;
  renderBattle();
  } finally {
    if (battle === activeBattle && activeBattle.enemyTurnToken === turnToken) {
      activeBattle.enemyPhaseRunning = false;
      if (!activeBattle.gameOver && activeBattle.animating) {
        activeBattle.animating = false;
        renderBattle();
      }
    }
  }
}

function canPlayerAttackHeroDirectly() {
  return Boolean(battle)
    && battle.turn === "player"
    && battle.round >= 3
    && !battle.enemyBoard.some(Boolean);
}

function canEnemyAttackHeroDirectly() {
  return Boolean(battle)
    && battle.playerTurnsCompleted >= 1
    && battle.enemyTurnsCompleted >= 1
    && battle.round >= 2;
}

async function resolvePlayerOpenLaneAttacks() {
  renderBattle();
}

async function resolveEnemyCombat() {
  const hadPlayerCreaturesAtStart = battle.playerBoard.some(Boolean);
  const targetedLanes = new Set();
  for (let attackerLane = 0; attackerLane < 4; attackerLane += 1) {
    const attacker = battle.enemyBoard[attackerLane];
    if (!attacker || attacker.attackedRound === battle.round) continue;

    let targetLane = battle.playerBoard.findIndex((creature, lane) => creature && !targetedLanes.has(lane));
    if (targetLane < 0) targetLane = battle.playerBoard.findIndex(Boolean);
    if (targetLane < 0) {
      if (!hadPlayerCreaturesAtStart && canEnemyAttackHeroDirectly()) {
        const attack = getEffectiveAttack("enemy", attackerLane);
        attacker.attackedRound = battle.round;
        markCreatureUsed(attacker);
        battle.playerHp = Math.max(0, battle.playerHp - attack);
        battle.log.unshift(`${getCard(attacker.id).name} hits your Hero for ${attack}.`);
        addDamageNumber(attack, "player-hit");
        renderBattle();
        await sleep(playerData.settings.reduceMotion ? 0 : 300);
        if (battle.playerHp <= 0) break;
      }
      continue;
    }

    targetedLanes.add(targetLane);
    await resolveCreatureAttack("enemy", attackerLane, "player", targetLane);
    if (battle.playerHp <= 0) break;
  }
  renderBattle();
}

async function resolveCreatureAttack(attackerOwner, attackerLane, defenderOwner, defenderLane) {
  const attackers = attackerOwner === "player" ? battle.playerBoard : battle.enemyBoard;
  const defenders = defenderOwner === "player" ? battle.playerBoard : battle.enemyBoard;
  const attacker = attackers[attackerLane];
  const defender = defenders[defenderLane];
  if (!attacker || !defender || attacker.attackedRound === battle.round) return;

  attacker.attackedRound = battle.round;
  markCreatureUsed(attacker);
  const attackerCard = getCard(attacker.id);
  const defenderCard = getCard(defender.id);
  const attack = getEffectiveAttack(attackerOwner, attackerLane);
  const counter = defender.counteredRound === battle.round
    ? 0
    : getEffectiveAttack(defenderOwner, defenderLane);
  if (counter > 0) defender.counteredRound = battle.round;

  window.dispatchEvent(new CustomEvent("cardwars:holo-attack", { detail: {
    owner: attackerOwner === "player" ? "Your" : "Enemy",
    lane: attackerLane,
    targetOwner: defenderOwner === "player" ? "Your" : "Enemy",
    targetLane: defenderLane,
    duration: 980
  } }));
  await sleep(playerData.settings.reduceMotion ? 80 : 980);

  defender.damage += attack;
  if (counter) attacker.damage += counter;
  battle.log.unshift(`${attackerCard.name} attacks ${defenderCard.name} for ${attack}${counter ? `; ${defenderCard.name} strikes back for ${counter}` : ""}.`);
  renderBattle();
  await sleep(playerData.settings.reduceMotion ? 0 : 420);

  if (defender.damage >= defender.defense) {
    const discard = defenderOwner === "player" ? battle.playerDiscard : battle.enemyDiscard;
    discard.push(defender.id);
    defenders[defenderLane] = null;
    battle.log.unshift(`${defenderCard.name} is defeated and goes to the ${defenderOwner === "player" ? "your" : "opponent's"} discard pile.`);
  }
  if (attacker.damage >= attacker.defense) {
    const discard = attackerOwner === "player" ? battle.playerDiscard : battle.enemyDiscard;
    discard.push(attacker.id);
    attackers[attackerLane] = null;
    battle.log.unshift(`${attackerCard.name} is defeated and goes to the ${attackerOwner === "player" ? "your" : "opponent's"} discard pile.`);
  }
  renderBattle();
}

async function performSelectedAttack(playerLane, enemyLane) {
  if (!battle || battle.animating || battle.turn !== "player") return;
  const attacker = battle.playerBoard[playerLane];
  const defender = battle.enemyBoard[enemyLane];
  if (!attacker || !defender) return;
  if (attacker.used || attacker.attackedRound === battle.round) return showToast("That creature already attacked this round");

  battle.animating = true;
  await resolveCreatureAttack("player", playerLane, "enemy", enemyLane);
  battle.animating = false;
  renderBattle();
}

async function performDirectHeroAttack(playerLane) {
  if (!battle || battle.animating || battle.turn !== "player") return;
  const attacker = battle.playerBoard[playerLane];
  if (!attacker || attacker.used || attacker.attackedRound === battle.round) return showToast("That creature already attacked this round");
  if (battle.enemyBoard.some(Boolean)) return showToast("Attack an opposing creature first");
  if (!canPlayerAttackHeroDirectly()) return showToast("Direct attacks unlock on your Round 3");

  battle.animating = true;
  const attack = getEffectiveAttack("player", playerLane);
  const attackerCard = getCard(attacker.id);
  attacker.attackedRound = battle.round;
  markCreatureUsed(attacker);
  battle.enemyHp = Math.max(0, battle.enemyHp - attack);
  battle.log.unshift(`${attackerCard.name} hits the opposing Hero for ${attack}.`);
  addDamageNumber(attack, "enemy-hit");
  renderBattle();
  await sleep(playerData.settings.reduceMotion ? 0 : 300);
  if (battle.enemyHp <= 0) winBattle();
  battle.animating = false;
  renderBattle();
}

function getEffectiveAttack(owner, lane) {
  const ownBoard = owner === "player" ? battle.playerBoard : battle.enemyBoard;
  const creature = ownBoard[lane];
  if (!creature) return 0;
  const card = getCard(creature.id);
  let attack = creature.attack;

  if (card.faction === "Corn Fields") {
    const pigsInPlay = [...battle.playerBoard, ...battle.enemyBoard].filter((piece) => piece?.id === "ember_squire").length;
    attack -= pigsInPlay;
  }

  return Math.max(0, attack);
}

async function animateLaneCombat() {
  if (playerData.settings.reduceMotion) return;
  const animatedSlots = [];
  for (let lane = 0; lane < 4; lane += 1) {
    const playerCreature = battle.playerBoard[lane];
    const enemyCreature = battle.enemyBoard[lane];
    if (!playerCreature && !enemyCreature) continue;
    const mode = playerCreature && enemyCreature ? "lane-clash" : "lane-charge";
    const playerSlot = document.querySelector(`.player-card-slots .card-slot[data-lane="${lane}"]`);
    const enemySlot = document.querySelector(`.enemy-card-slots .card-slot[data-lane="${lane}"]`);
    if (playerCreature && playerSlot) {
      playerSlot.classList.add(mode);
      animatedSlots.push(playerSlot);
    }
    if (enemyCreature && enemySlot) {
      enemySlot.classList.add(mode);
      animatedSlots.push(enemySlot);
    }
  }
  await sleep(270);
  animatedSlots.forEach((slot) => slot.classList.add("lane-impact"));
  await sleep(190);
  animatedSlots.forEach((slot) => slot.classList.remove("lane-clash", "lane-charge", "lane-impact"));
}

function loseBattle() {
  if (battle.gameOver) return;
  battle.playerHp = 0;
  battle.turn = "game-over";
  battle.animating = false;
  battle.gameOver = true;
  battle.outcome = "defeat";
  battle.resultMessage = "Your Hero has no HP remaining.";
  playerData.stats.matchesLost += 1;
  playerData.stats.currentWinStreak = 0;
  battle.log.unshift("Game Over. Your Hero has no HP remaining.");
  saveAccount("");
  renderProfile();
  renderBattle();
}

async function winBattle() {
  if (battle.gameOver) return;
  const xp = 1;
  const firstVictoryBonus = playerData.achievements.firstVictory ? 0 : 25;
  playerData.stats.matchesWon += 1;
  playerData.stats.currentWinStreak += 1;
  playerData.stats.bestWinStreak = Math.max(playerData.stats.bestWinStreak, playerData.stats.currentWinStreak);
  const victoryBounty = playerData.stats.currentWinStreak % 3 === 0 ? 25 : 0;
  let levelReward = 0;
  let levelsGained = 0;
  playerData.profile.xp += xp;
  while (playerData.profile.xp >= getLevelWinTarget(playerData.profile.level)) {
    playerData.profile.xp -= getLevelWinTarget(playerData.profile.level);
    playerData.profile.level += 1;
    const reward = getLevelReward(playerData.profile.level);
    levelReward += reward;
    levelsGained += 1;
  }
  const coins = 5 + firstVictoryBonus + victoryBounty + levelReward;
  battle.enemyHp = 0;
  battle.turn = "game-over";
  battle.animating = false;
  battle.gameOver = true;
  battle.outcome = "victory";
  battle.resultMessage = "You earned " + coins + " coins" + (levelsGained ? " and reached level " + playerData.profile.level : "") + ".";
  playerData.profile.coins += coins;
  playerData.achievements.firstVictory = true;
  battle.log.unshift("Victory! +" + coins + " coins" + (victoryBounty ? " including the streak bounty" : "") + (levelsGained ? " and +" + levelReward + " level rewards" : "") + ".");
  saveAccount("");
  renderProfile();
  renderBattle();
  if (!playerData.settings.reduceMotion) {
    $("battleLandscape").classList.add("victory-glow");
    await sleep(1100);
  }
  showToast("Victory: +" + coins + " coins");
}

function launchSpell(damage, targetClass) {
  const projectile = document.createElement("i");
  projectile.className = "spell-projectile";
  $("effectLayer").appendChild(projectile);
  setTimeout(() => projectile.remove(), 600);
  setTimeout(() => {
    $("battleLandscape").classList.remove("enemy-impact");
    void $("battleLandscape").offsetWidth;
    $("battleLandscape").classList.add("enemy-impact");
    addDamageNumber(damage, targetClass);
  }, 300);
}

function addDamageNumber(amount, targetClass) {
  const number = document.createElement("b");
  number.className = `damage-number ${targetClass}`;
  number.textContent = `-${amount}`;
  $("effectLayer").appendChild(number);
  setTimeout(() => number.remove(), 800);
}

function pulseEnergy() {
  const orb = $("energyCount");
  orb.classList.remove("energy-pulse");
  void orb.offsetWidth;
  orb.classList.add("energy-pulse");
}

function findOpenLane(card, assignedLandscapes, board) {
  const compatible = assignedLandscapes.map((landscape, index) => ({ landscape, index })).filter(({ index }) => cardCanUseLane(card, index, assignedLandscapes, board));
  return compatible.length ? compatible[0].index : -1;
}

function cardCanUseLane(card, lane, assignedLandscapes, board) {
  return lane >= 0 && lane < 4 && !board[lane] && (card.faction === "Rainbow" || assignedLandscapes[lane] === card.faction);
}

function buyPack(packId = "hero-pack") {
  const pack = packCatalog.find((entry) => entry.id === packId) || packCatalog[0];
  if (playerData.profile.coins < pack.price) return showToast(`You need ${pack.price - playerData.profile.coins} more coins`);
  playerData.profile.coins -= pack.price;
  const cardPulls = [];
  const newLandscapePulls = [];
  const reveals = [];
  const ownedLandscapes = new Set(playerData.landscapeCollection);

  for (let packIndex = 0; packIndex < pack.packs; packIndex += 1) {
    for (let cardIndex = 0; cardIndex < pack.cardsPerPack; cardIndex += 1) {
      const cardId = weightedCardPull();
      cardPulls.push(cardId);
      reveals.push({ type: "card", id: cardId });
      playerData.collection[cardId] = playerData.collection[cardId] || { copies: 0, upgradeLevel: 1 };
      playerData.collection[cardId].copies += 1;
    }

    const landscapeId = landscapeCardCatalog[Math.floor(Math.random() * landscapeCardCatalog.length)].id;
    if (!ownedLandscapes.has(landscapeId)) {
      ownedLandscapes.add(landscapeId);
      newLandscapePulls.push(landscapeId);
      reveals.push({ type: "landscape", id: landscapeId });
    }
  }

  playerData.landscapeCollection.push(...newLandscapePulls);
  playerData.storePurchases.push({ type: "card-pack", packId: pack.id, packs: pack.packs, price: pack.price, at: new Date().toISOString(), cards: cardPulls, landscapes: newLandscapePulls });
  playerData.achievements.collector = countCards(playerData.collection) >= 20;
  saveAccount("");
  renderAll();
  showPackOpening(pack, reveals, cardPulls.length, newLandscapePulls.length);
}

function showPackOpening(pack, reveals, cardCount, landscapeCount) {
  packOpening = { pack, reveals, cardCount, landscapeCount, index: -1 };
  $("packOpeningTitle").textContent = pack.name;
  $("packOpeningCounter").textContent = `${cardCount} cards - 1 Landscape per pack`;
  $("packOpeningPackImage").src = pack.image;
  $("packOpeningPackImage").alt = `${pack.name} unopened pack`;
  $("packOpeningPackButton").hidden = false;
  $("packRevealButton").hidden = true;
  $("packOpeningStage").className = "pack-opening-stage sealed";
  $("packOpeningDialog").showModal();
}

function openPurchasedPack() {
  if (!packOpening || packOpening.index >= 0) return;
  $("packOpeningStage").className = "pack-opening-stage opening";
  setTimeout(() => {
    if (!packOpening) return;
    packOpening.index = 0;
    renderPackReveal();
  }, playerData.settings.reduceMotion ? 80 : 700);
}

function renderPackReveal() {
  if (!packOpening) return;
  const reveal = packOpening.reveals[packOpening.index];
  const card = reveal.type === "card" ? getCard(reveal.id) : null;
  const landscape = reveal.type === "landscape" ? getLandscapeCard(reveal.id) : null;
  const name = card ? card.name : `${landscape.faction} - Art ${landscape.variant}`;
  const image = card ? card.image : landscape.image;
  $("packOpeningPackButton").hidden = true;
  $("packRevealButton").hidden = false;
  $("packRevealImage").src = image;
  $("packRevealImage").alt = `${name} card`;
  $("packRevealName").textContent = name;
  $("packRevealMeta").textContent = card ? `${titleCase(card.rarity || "common")} - ${playerData.collection[reveal.id].copies} owned` : "New Landscape unlocked";
  $("packOpeningCounter").textContent = `Reward ${packOpening.index + 1} of ${packOpening.reveals.length}`;
  $("packOpeningStage").className = `pack-opening-stage revealed rarity-${card ? card.rarity || "common" : "landscape"}`;
}

function nextPackReveal() {
  if (!packOpening) return;
  if (packOpening.index < packOpening.reveals.length - 1) {
    packOpening.index += 1;
    $("packRevealButton").classList.remove("card-enter");
    void $("packRevealButton").offsetWidth;
    $("packRevealButton").classList.add("card-enter");
    renderPackReveal();
    return;
  }
  finishPackOpening();
}

function finishPackOpening() {
  if (!packOpening) return;
  const { cardCount, landscapeCount } = packOpening;
  packOpening = null;
  $("packOpeningDialog").close();
  showToast(`${cardCount} cards${landscapeCount ? ` and ${landscapeCount} new Landscape${landscapeCount === 1 ? "" : "s"}` : ""} added`);
}

function weightedCardPull() {
  const level = playerData.profile.level;
  const available = cardCatalog.filter((card) => card.collectible !== false && getCardUnlockLevel(card) <= level);
  const pool = available.length ? available : cardCatalog.filter((card) => card.collectible !== false);
  const weighted = pool.flatMap((card) => Array.from({ length: getPackWeight(card) }, () => card));
  return weighted[Math.floor(Math.random() * weighted.length)].id;
}

function getCardUnlockLevel(card) {
  if (Number.isFinite(Number(card.unlockLevel))) return Number(card.unlockLevel);
  const power = (Number(card.attack) || 0) + (Number(card.block) || 0) + (Number(card.cost) || 0) * 2;
  if (card.rarity === "legendary" || power >= 42) return 12;
  if (card.rarity === "epic" || power >= 30) return 7;
  if (card.rarity === "rare" || power >= 20) return 3;
  return 1;
}

function getPackWeight(card) {
  const rarityWeights = { common: 72, rare: 22, epic: 6, legendary: 1 };
  const base = rarityWeights[card.rarity] || 10;
  const power = (Number(card.attack) || 0) + (Number(card.block) || 0) + (Number(card.cost) || 0) * 2;
  const powerPenalty = Math.max(0.18, 1 - Math.max(0, power - 18) * 0.035);
  return Math.max(1, Math.round(base * powerPenalty));
}

function upgradeBestCard() {
  const upgradable = getOwnedCards().map((id) => ({ id, ...playerData.collection[id] })).filter((entry) => entry.copies >= entry.upgradeLevel + 1).sort((a, b) => b.copies - a.copies);
  if (!upgradable.length) return showToast("No card has enough duplicate copies yet");
  const target = playerData.collection[upgradable[0].id];
  target.copies -= target.upgradeLevel + 1;
  target.upgradeLevel += 1;
  saveAccount(`${getCard(upgradable[0].id).name} upgraded to level ${target.upgradeLevel}`);
  renderAll();
}

function claimAchievement(stageId) {
  const achievement = achievementCatalog.find((entry) => entry.id === stageId);
  if (!achievement || getAchievementState(achievement) !== "claim") return;
  playerData.profile.coins += achievement.reward;
  playerData.campaign.completedStages.push(achievement.id);
  playerData.campaign.rewardsCollected.push(achievement.id);
  saveAccount(achievement.name + " claimed: +" + achievement.reward + " coins");
  renderAll();
}

function claimRewards() {
  let total = 0;
  achievementCatalog.forEach((achievement) => {
    if (getAchievementState(achievement) === "claim") {
      playerData.profile.coins += achievement.reward;
      playerData.campaign.completedStages.push(achievement.id);
      playerData.campaign.rewardsCollected.push(achievement.id);
      total += achievement.reward;
    }
  });
  saveAccount(total ? total + " achievement coins claimed" : "No achievements ready to claim");
  renderAll();
}

function renderAccountSetup() {
  $("setupUsername").value = playerData.profile.username === "Player" ? "" : playerData.profile.username;
  $("setupAvatarPicker").innerHTML = avatarCatalog.map((entry) => `<button class="avatar-option ${entry.id === setupAvatarId ? "active" : ""}" data-setup-avatar="${entry.id}" type="button" aria-label="Use ${entry.name}" title="${entry.name}"><span class="avatar-option-face" style="--avatar-focus:${entry.focus};--avatar-scale:${entry.scale || 1.2}"><img src="${entry.image}" alt=""></span><span>${entry.name}</span></button>`).join("");
  $("setupKingdomPicker").innerHTML = starterKingdomCatalog.map((kingdom) => `<button class="kingdom-choice ${kingdom.id === setupKingdom ? "active" : ""}" data-setup-kingdom="${kingdom.id}" type="button"><img src="${kingdom.image}" alt="${kingdom.name} Landscape"><span><b>${kingdom.name}</b><small>${kingdom.description}</small></span></button>`).join("");
}

function openAccountSetup() {
  accountSetupPending = true;
  renderAccountSetup();
  $("accountSetupDialog").showModal();
}

function completeAccountSetup() {
  const username = $("setupUsername").value.trim().slice(0, 18) || "Player";
  playerData = createDefaultAccount({ username, avatar: setupAvatarId, kingdom: starterKingdomIds.has(setupKingdom) ? setupKingdom : "Corn Fields" });
  selectedDeck = 0;
  battle = null;
  accountSetupPending = false;
  saveAccount("Account created");
  renderAll();
  $("accountSetupDialog").close();
  switchView("home");
}

function buyUnlock(type, id) {
  const area = type === "map" ? playerData.maps : playerData.backgrounds;
  const cost = type === "background" && tonedBackgrounds.includes(id) ? 45 : 90;
  if (area.owned.includes(id) || playerData.profile.coins < cost) return;
  playerData.profile.coins -= cost;
  area.owned.push(id);
  playerData.storePurchases.push({ type, id, at: new Date().toISOString() });
  saveAccount(`${type === "map" ? getMat(id).name : titleCase(id)} added to your account`);
  renderAll();
}

function renderAll() {
  renderProfile();
  renderBattle();
  renderCampaign();
  renderStore();
  renderSettings();
  if (document.querySelector("#collectionView.active")) renderCollection();
  if (document.querySelector("#decksView.active")) renderDecks();
  applyEquippedTheme();
}

function renderProfile() {
  const avatar = avatarCatalog.find((entry) => entry.id === playerData.profile.avatar) || avatarCatalog[0];
  const testModeActive = Boolean(playerData.unlocks.testMode);
  $("profileName").textContent = playerData.profile.username;
  $("profileLevel").textContent = testModeActive ? "TEST MODE" : `LV ${playerData.profile.level}`;
  const levelTarget = getLevelWinTarget(playerData.profile.level);
  const levelProgress = Math.min(playerData.profile.xp, levelTarget);
  $("profileXpLabel").textContent = `${levelProgress} / ${levelTarget} WINS`;
  $("profileXpBar").style.width = `${(levelProgress / levelTarget) * 100}%`;
  $("homeXpLabel").textContent = `${levelProgress} / ${levelTarget} WINS`;
  $("homeXpBar").style.width = `${(levelProgress / levelTarget) * 100}%`;
  $("settingsXpLabel").textContent = `${levelProgress} / ${levelTarget} WINS`;
  $("settingsXpBar").style.width = `${(levelProgress / levelTarget) * 100}%`;
  document.querySelector(".profile-xp-track")?.toggleAttribute("hidden", testModeActive);
  $("profileXpLabel").toggleAttribute("hidden", testModeActive);
  document.querySelector(".home-xp-progress")?.toggleAttribute("hidden", testModeActive);
  document.querySelector(".settings-xp-progress")?.toggleAttribute("hidden", testModeActive);
  $("coinCount").textContent = playerData.profile.coins;
  renderAvatar($("profileAvatar"), avatar);
  renderAvatar($("homeAvatar"), avatar);
  $("homeProfileName").textContent = playerData.profile.username;
  $("homeProfileLevel").textContent = testModeActive ? "Test mode" : `Level ${playerData.profile.level}`;
  $("homeCoinCount").textContent = playerData.profile.coins;
}

function renderAvatar(element, avatar) {
  if (!element) return;
  element.style.setProperty("--avatar-focus", avatar.focus);
  element.innerHTML = `<img src="${avatar.image}" alt="${avatar.name} profile picture">`;
}

function renderBattle() {
  if (!battle) return;
  $("playerHp").textContent = battle.playerHp;
  $("playerMeter").max = battle.maxPlayerHp;
  $("playerMeter").value = battle.playerHp;
  $("enemyHp").textContent = battle.enemyHp;
  $("enemyName").textContent = battle.enemyName;
  $("enemyLevel").textContent = `LV ${battle.enemyLevel}`;
  $("playerName").textContent = playerData.profile.username;
  $("playerLevel").textContent = `LV ${playerData.profile.level}`;
  $("enemyMeter").max = battle.maxEnemyHp;
  $("enemyMeter").value = battle.enemyHp;
  $("energyCount").textContent = `${battle.energy}/${battle.maxEnergy}`;
  $("actionCount").textContent = battle.actionsLeft;
  $("deckCount").textContent = battle.playerDrawPile.length;
  $("turnLabel").textContent = battle.gameOver ? "Game Over" : battle.turn === "player" ? `Your turn - Round ${battle.round}` : "Opponent turn";
  $("activeDeckLabel").textContent = "You";
  $("battleLandscape").classList.remove("enemy-impact", "victory-glow");
  $("tableStage").classList.toggle("camera-top", playerData.settings.boardCamera === "top");
  $("battleLandscape").classList.toggle("camera-3d", playerData.settings.boardCamera !== "top");
  const isTopDown = playerData.settings.boardCamera === "top";
  const holoToggleEnabled = !isTopDown;
  $("battleView").querySelector(".battle-board")?.classList.toggle("holograms-off", isTopDown || !playerData.settings.holograms);
  $("battleLandscape").dataset.holograms = !isTopDown && playerData.settings.holograms ? "on" : "off";
  $("battleLandscape").dataset.background = playerData.backgrounds.equipped;
  applyBoardOrbit();
  document.querySelectorAll("[data-camera]").forEach((button) => button.classList.toggle("active", button.dataset.camera === playerData.settings.boardCamera));
  const holoToggle = document.querySelector("[data-holograms-toggle]");
  holoToggle?.setAttribute("aria-pressed", String(Boolean(playerData.settings.holograms)));
  holoToggle?.classList.toggle("active", holoToggleEnabled && Boolean(playerData.settings.holograms));
  if (holoToggle) {
    holoToggle.disabled = !holoToggleEnabled;
    holoToggle.title = holoToggleEnabled ? "Toggle board holograms" : "Holograms are available in 3D mode";
  }
  $("playerMatSkin").dataset.mat = playerData.maps.equipped;
  $("enemyMatSkin").dataset.mat = battle.enemyMap;
  $("playerMatLabel").textContent = `Your side - ${getMat(playerData.maps.equipped).name}`;
  $("enemyMatLabel").textContent = `Opponent - ${getMat(battle.enemyMap).name}`;
  $("playerLandscapes").innerHTML = renderBoardLandscapes(battle.playerLandscapes, battle.playerLandscapeArt);
  $("enemyLandscapes").innerHTML = renderBoardLandscapes(battle.enemyLandscapes, battle.enemyLandscapeArt);
  $("playerBoardCards").innerHTML = renderBoardCards(battle.playerBoard, "Your");
  $("enemyBoardCards").innerHTML = renderBoardCards(battle.enemyBoard, "Enemy");
  clearBoardTurningFlags();
  $("battleLog").innerHTML = battle.log.slice(0, 4).map((line) => `<div>${safeText(line)}</div>`).join("");
  $("battleResult").hidden = !battle.gameOver;
  if (battle.gameOver) {
    const victory = battle.outcome === "victory";
    $("battleResultKicker").textContent = victory ? "MATCH WON" : "DEFEAT";
    $("battleResultTitle").textContent = victory ? "VICTORY" : "GAME OVER";
    $("battleResultMessage").textContent = battle.resultMessage || (victory ? "The opponent has no HP remaining." : "Your account progress is safe.");
  }
  $("hand").innerHTML = battle.hand.map((id, index) => renderCard(id, { playable: true, index, deal: battle.freshHand })).join("");
  battle.freshHand = false;
  $("drawCardButton").disabled = battle.animating || battle.turn !== "player" || battle.actionsLeft < 1 || !battle.playerDrawPile.length;
  $("endTurnButton").disabled = battle.animating || battle.enemyPhaseRunning || battle.turn !== "player";
}

function applyBoardOrbit() {
  const orbit = playerData.settings.boardOrbit;
  const stage = $("tableStage");
  const scale = Math.min(1.2, Math.max(0.4, orbit.zoom));
  stage.style.setProperty("--camera-pitch", `${orbit.pitch}deg`);
  stage.style.setProperty("--camera-yaw", `${orbit.yaw}deg`);
  stage.style.setProperty("--camera-scale", scale.toFixed(3));
  stage.style.setProperty("--camera-pan-x", `${orbit.panX || 0}px`);
  stage.style.setProperty("--camera-pan-y", `${orbit.panY || 0}px`);
}

function beginCameraDrag(event) {
  if (event.button !== 0) return;
  if (event.target.closest(".player-card-slots .card-slot.occupied")) return;
  boardPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  $("tableStage").setPointerCapture(event.pointerId);
  if (boardPointers.size > 1) {
    const [first, second] = [...boardPointers.values()];
    cameraPinch = {
      distance: Math.hypot(second.x - first.x, second.y - first.y),
      zoom: playerData.settings.boardOrbit.zoom
    };
    cameraDrag = null;
    $("tableStage").classList.remove("camera-dragging");
    event.preventDefault();
    return;
  }
  const orbit = playerData.settings.boardOrbit;
  const isTopDown = playerData.settings.boardCamera === "top";
  cameraDrag = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    pitch: isTopDown ? 12 : orbit.pitch,
    yaw: orbit.yaw,
    panX: orbit.panX || 0,
    panY: orbit.panY || 0,
    mode: isTopDown ? "pan" : "orbit",
    moved: false
  };
  $("tableStage").classList.add("camera-dragging");
  event.preventDefault();
}

function moveCameraDrag(event) {
  if (boardPointers.has(event.pointerId)) boardPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (boardPointers.size > 1) {
    if (cameraPinch) {
      const [first, second] = [...boardPointers.values()];
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const orbit = playerData.settings.boardOrbit;
      orbit.zoom = Math.min(1.2, Math.max(0.4, cameraPinch.zoom * (distance / Math.max(1, cameraPinch.distance))));
      applyBoardOrbit();
      scheduleBoardOrbitSave();
    }
    event.preventDefault();
    return;
  }
  if (!cameraDrag || cameraDrag.pointerId !== event.pointerId) return;
  const deltaX = event.clientX - cameraDrag.x;
  const deltaY = event.clientY - cameraDrag.y;
  if (Math.abs(deltaX) + Math.abs(deltaY) > 3) cameraDrag.moved = true;
  if (!cameraDrag.moved) return;
  const orbit = playerData.settings.boardOrbit;
  if (cameraDrag.mode === "pan") {
    orbit.panX = Math.min(1000, Math.max(-1000, cameraDrag.panX + deltaX));
    orbit.panY = Math.min(1000, Math.max(-1000, cameraDrag.panY + deltaY));
  } else {
    playerData.settings.boardCamera = "angled";
    orbit.pitch = Math.min(CAMERA_MAX_PITCH, Math.max(CAMERA_MIN_PITCH, cameraDrag.pitch - deltaY * .2));
    orbit.yaw = Math.min(1080, Math.max(-1080, cameraDrag.yaw - deltaX * .28));
    $("tableStage").classList.remove("camera-top");
    document.querySelectorAll("[data-camera]").forEach((button) => button.classList.toggle("active", button.dataset.camera === "angled"));
  }
  applyBoardOrbit();
  event.preventDefault();
}

function endCameraDrag(event) {
  boardPointers.delete(event.pointerId);
  if (boardPointers.size < 2) cameraPinch = null;
  const moved = cameraDrag?.pointerId === event.pointerId && cameraDrag.moved;
  if (cameraDrag?.pointerId === event.pointerId) cameraDrag = null;
  if (!boardPointers.size) $("tableStage").classList.remove("camera-dragging");
  if ($("tableStage").hasPointerCapture(event.pointerId)) $("tableStage").releasePointerCapture(event.pointerId);
  if (moved) saveAccount("");
}

function zoomBoardWithWheel(event) {
  if (!event.ctrlKey && Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
  const orbit = playerData.settings.boardOrbit;
  orbit.zoom = Math.min(1.2, Math.max(0.4, orbit.zoom * Math.exp(-event.deltaY * .003)));
  applyBoardOrbit();
  scheduleBoardOrbitSave();
  event.preventDefault();
}

function scheduleBoardOrbitSave() {
  clearTimeout(zoomBoardWithWheel.saveTimer);
  zoomBoardWithWheel.saveTimer = setTimeout(() => saveAccount(""), 180);
}

function beginCardDrag(event) {
  const source = event.target.closest("[data-hand-card]");
  if (!source || event.button !== 0) return;
  const id = source.dataset.handCard;
  const card = getCard(id);
  if (battle.animating || battle.turn !== "player") return showToast("Wait for your turn");
  if (battle.actionsLeft < 1) return showToast("No Actions remaining");
  if (battle.energy < card.cost) return showToast(`You need ${card.cost} Energy`);
  const rect = source.getBoundingClientRect();
  const ghost = source.cloneNode(true);
  ghost.classList.add("dragging-card-ghost");
  ghost.classList.remove("card-dealt");
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  document.body.appendChild(ghost);
  cardDrag = {
    pointerId: event.pointerId,
    id,
    index: Number(source.dataset.handIndex),
    source,
    ghost,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    lastX: event.clientX,
    lastY: event.clientY,
    tiltX: 0,
    tiltY: 0,
    roll: -2
  };
  source.setPointerCapture(event.pointerId);
  source.classList.add("card-drag-source");
  moveCardGhost(event);
  document.querySelectorAll(".player-card-slots .card-slot").forEach((slot) => {
    const valid = cardCanUseLane(card, Number(slot.dataset.lane), battle.playerLandscapes, battle.playerBoard);
    slot.classList.add(valid ? "drop-valid" : "drop-invalid");
  });
  event.preventDefault();
}

function moveCardGhost(event) {
  if (!cardDrag || cardDrag.pointerId !== event.pointerId) return;
  const velocityX = event.clientX - cardDrag.lastX;
  const velocityY = event.clientY - cardDrag.lastY;
  cardDrag.tiltX += ((Math.max(-14, Math.min(14, velocityY * -.75))) - cardDrag.tiltX) * .42;
  cardDrag.tiltY += ((Math.max(-16, Math.min(16, velocityX * .8))) - cardDrag.tiltY) * .42;
  cardDrag.roll += ((Math.max(-8, Math.min(8, velocityX * .35)) - 2) - cardDrag.roll) * .35;
  cardDrag.lastX = event.clientX;
  cardDrag.lastY = event.clientY;
  document.querySelectorAll(".card-slot.drop-hover").forEach((slot) => slot.classList.remove("drop-hover"));
  const hoverSlot = findDropSlot(event, ".player-card-slots .card-slot.drop-valid");
  hoverSlot?.classList.add("drop-hover");
  cardDrag.ghost.classList.toggle("dragging-over-slot", Boolean(hoverSlot));
  const scale = hoverSlot ? 1.16 : 1.09;
  const lift = hoverSlot ? -18 : -10;
  cardDrag.ghost.style.left = `${event.clientX - cardDrag.offsetX}px`;
  cardDrag.ghost.style.top = `${event.clientY - cardDrag.offsetY + lift}px`;
  cardDrag.ghost.style.transform = `rotateX(${cardDrag.tiltX}deg) rotateY(${cardDrag.tiltY}deg) rotateZ(${cardDrag.roll}deg) scale(${scale})`;
  event.preventDefault();
}

function endCardDrag(event) {
  if (!cardDrag || cardDrag.pointerId !== event.pointerId) return;
  const activeDrag = cardDrag;
  const target = findDropSlot(event, ".player-card-slots .card-slot.drop-valid");
  cardDrag = null;
  activeDrag.source.classList.remove("card-drag-source");
  activeDrag.ghost.remove();
  document.querySelectorAll(".card-slot.drop-valid,.card-slot.drop-invalid,.card-slot.drop-hover").forEach((slot) => slot.classList.remove("drop-valid", "drop-invalid", "drop-hover"));
  if (event.type !== "pointercancel" && target) playCard(activeDrag.id, activeDrag.index, activeDrag.source, Number(target.dataset.lane));
  else if (event.type !== "pointercancel") showToast("Drop the card on a glowing compatible slot");
  event.preventDefault();
}

function beginBoardAttackDrag(event) {
  const sourceSlot = event.target.closest(".player-card-slots .card-slot.occupied");
  if (!sourceSlot || event.button !== 0 || !battle || battle.animating || battle.turn !== "player") return;
  const lane = Number(sourceSlot.dataset.lane);
  const creature = battle.playerBoard[lane];
  if (!creature) return;
  if (creature.used || creature.attackedRound === battle.round) return showToast("That creature already attacked this round");
  const enemyHasCreatures = battle.enemyBoard.some(Boolean);
  if (!enemyHasCreatures && !canPlayerAttackHeroDirectly()) return showToast("Direct attacks unlock on your Round 3");

  boardAttackDrag = { pointerId: event.pointerId, lane, sourceSlot, mode: enemyHasCreatures ? "creature" : "hero" };
  sourceSlot.setPointerCapture?.(event.pointerId);
  sourceSlot.classList.add("attack-source");
  if (enemyHasCreatures) {
    document.querySelectorAll(".enemy-card-slots .card-slot.occupied").forEach((slot) => slot.classList.add("attack-target"));
  } else {
    document.querySelector(".fighter.enemy")?.classList.add("hero-attack-target");
    $("enemyLandscapes")?.classList.add("hero-attack-target");
    $("enemyBoardCards")?.classList.add("hero-attack-target");
  }
  window.dispatchEvent(new CustomEvent("cardwars:holo-drag-start", { detail: { owner: "Your", lane, x: event.clientX, y: event.clientY } }));
  event.preventDefault();
  event.stopPropagation();
}

function findDropSlot(event, selector) {
  const direct = document.elementFromPoint(event.clientX, event.clientY)?.closest(selector);
  if (direct) return direct;
  const padding = document.body.classList.contains("battle-active") && !$("tableStage")?.classList.contains("camera-top") ? 20 : 0;
  return [...document.querySelectorAll(selector)].find((slot) => {
    const rect = slot.getBoundingClientRect();
    return event.clientX >= rect.left - padding && event.clientX <= rect.right + padding
      && event.clientY >= rect.top - padding && event.clientY <= rect.bottom + padding;
  }) || null;
}

function findHeroAttackTarget(event) {
  const targets = [document.querySelector(".fighter.enemy"), $("enemyLandscapes"), $("enemyBoardCards")].filter(Boolean);
  return targets.find((target) => {
    const rect = target.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right
      && event.clientY >= rect.top && event.clientY <= rect.bottom;
  }) || null;
}

function moveBoardAttackDrag(event) {
  if (!boardAttackDrag || boardAttackDrag.pointerId !== event.pointerId) return;
  document.querySelectorAll(".card-slot.attack-hover,.hero-attack-hover").forEach((slot) => slot.classList.remove("attack-hover", "hero-attack-hover"));
  const target = boardAttackDrag.mode === "hero"
    ? findHeroAttackTarget(event)
    : findDropSlot(event, ".enemy-card-slots .card-slot.attack-target");
  target?.classList.add(boardAttackDrag.mode === "hero" ? "hero-attack-hover" : "attack-hover");
  window.dispatchEvent(new CustomEvent("cardwars:holo-drag-move", { detail: { owner: "Your", lane: boardAttackDrag.lane, x: event.clientX, y: event.clientY } }));
  event.preventDefault();
}

function endBoardAttackDrag(event) {
  if (!boardAttackDrag || boardAttackDrag.pointerId !== event.pointerId) return;
  const active = boardAttackDrag;
  const target = event.type === "pointercancel"
    ? null
    : active.mode === "hero"
      ? findHeroAttackTarget(event)
      : findDropSlot(event, ".enemy-card-slots .card-slot.attack-target");
  boardAttackDrag = null;
  active.sourceSlot.classList.remove("attack-source");
  document.querySelectorAll(".card-slot.attack-target,.card-slot.attack-hover,.hero-attack-target,.hero-attack-hover").forEach((slot) => slot.classList.remove("attack-target", "attack-hover", "hero-attack-target", "hero-attack-hover"));
  if (target && active.mode === "hero") performDirectHeroAttack(active.lane);
  else if (target) performSelectedAttack(active.lane, Number(target.dataset.lane));
  else window.dispatchEvent(new CustomEvent("cardwars:holo-drag-cancel", { detail: { owner: "Your", lane: active.lane } }));
  event.preventDefault();
}

function renderBoardLandscapes(assignedLandscapes, artwork) {
  return assignedLandscapes.map((name, index) => `<div class="landscape-tile landscape-${slugify(name)}">
    <div class="landscape-terrain">
      <img class="landscape-card-face" src="${artwork[index]}" alt="${name} landscape card">
      <div class="landscape-popout" aria-hidden="true"><img src="${artwork[index]}" alt=""></div>
      <i class="terrain-piece terrain-piece-a"></i><i class="terrain-piece terrain-piece-b"></i>
    </div>
  </div>`).join("");
}

function renderBoardCards(board, owner) {
  return board.map((creature, index) => {
    const card = creature ? getCard(creature.id) : null;
    const damage = creature?.damage || 0;
    const pieceType = card ? slugify(card.type || "Creature") : "";
    const pieceId = card ? slugify(card.id) : "";
    const pieceFaction = card ? slugify(card.faction || "Rainbow") : "";
    const usedState = creature?.used ? " used" : "";
    const turningState = creature?.turning ? " turning" : "";
    return `<div class="card-slot ${card ? "occupied" : ""}${usedState}${turningState}" data-lane="${index}" data-owner="${owner}" aria-label="${owner} card slot ${index + 1}${card ? `, ${card.name}` : ""}">${card ? `<div class="board-piece board-piece-${pieceType} board-piece-${pieceId} board-piece-${pieceFaction}">
      <img class="board-card" src="${card.image}" alt="${card.name}">
      <span class="piece-base" aria-hidden="true"></span>
      <span class="piece-standee" aria-hidden="true"><img src="${card.image}" alt=""></span>
      <span class="board-damage">${Math.max(0, creature.defense - damage)} DEF</span>
    </div>` : ""}</div>`;
  }).join("");
}

function clearBoardTurningFlags() {
  if (!battle) return;
  [...battle.playerBoard, ...battle.enemyBoard].forEach((creature) => {
    if (creature) creature.turning = false;
  });
}

function renderCollection() {
  const filteredCards = collectionTypeFilter === "Landscape"
    ? filterCards(landscapeCardCatalog.map((card) => ({ ...card, type: "Landscape" })), collectionTypeFilter, collectionFactionFilter)
    : filterCards(cardCatalog, collectionTypeFilter, collectionFactionFilter);
  const totalCards = collectionTypeFilter === "Landscape" ? landscapeCardCatalog.length : cardCatalog.length;
  $("collectionCount").textContent = collectionTypeFilter === "all" && collectionFactionFilter === "all"
    ? `${cardCatalog.length} cards`
    : `${filteredCards.length} of ${totalCards} cards`;
  const orderedCards = [...filteredCards].sort((a, b) => {
    if (a.type === "Landscape" || b.type === "Landscape") return a.faction.localeCompare(b.faction) || a.variant - b.variant;
    const aOwned = (playerData.collection[a.id]?.copies || 0) > 0;
    const bOwned = (playerData.collection[b.id]?.copies || 0) > 0;
    return Number(bOwned) - Number(aOwned);
  });
  $("collectionGrid").innerHTML = orderedCards.map((card) => card.type === "Landscape" ? renderLandscapeCard(card) : renderCard(card.id, { collection: true })).join("") || "<p class=\"quiet\">No cards match these filters.</p>";
}

function renderLandscapeCard(card) {
  const owned = playerData.landscapeCollection.includes(card.id);
  return `<article class="game-card authentic-card landscape-collection-card ${owned ? "collection-owned" : "collection-unowned"}"><img class="card-art" src="${card.image}" alt="${card.faction} Landscape ${card.variant}" loading="lazy"><small class="card-ownership">${owned ? "Owned" : "Not owned"} - ${card.faction}</small></article>`;
}

function getDeckCardStacks(cards) {
  const stacks = new Map();
  cards.forEach((id) => {
    const stack = stacks.get(id) || { id, count: 0 };
    stack.count += 1;
    stacks.set(id, stack);
  });
  return [...stacks.values()];
}

function renderDeckCardStack(stack, deck) {
  const card = getCard(stack.id);
  if (!card) return "";
  const compatible = cardMatchesDeck(stack.id, deck);
  return `<article class="game-card authentic-card deck-builder-card deck-stack-card rarity-${card.rarity} ${compatible ? "" : "deck-card-disabled"}" data-remove-card-id="${stack.id}" role="button" tabindex="0" aria-label="Remove one ${card.name} from this deck${compatible ? "" : ". This card no longer matches this deck's landscapes"}">
    <span class="deck-copy-badge" aria-label="${stack.count} copies">x${stack.count}</span>
    <img class="card-art" src="${card.image}" alt="${card.name} card" loading="lazy">
  </article>`;
}

function renderDeckPoolCard(card, deck) {
  const status = getDeckCardStatus(card.id, deck);
  const available = getDeckAvailableCopies(card.id, deck);
  const ready = status === "ready" && available > 0 && deck.cards.length < MAX_NON_LANDSCAPE_CARDS;
  const label = ready
    ? `Add ${card.name} to this deck. ${available} available.`
    : status === "wrong-landscape"
      ? `${card.name} does not match this deck's landscapes.`
      : `${card.name} cannot be added.`;
  return `<article class="game-card authentic-card deck-builder-card deck-pool-card rarity-${card.rarity} ${ready ? "" : "deck-card-disabled"}" ${ready ? `data-add-card="${card.id}" role="button" tabindex="0"` : `aria-disabled="true"`} aria-label="${label}" title="${label}">
    <span class="deck-copy-badge" aria-label="${available} available">x${available}</span>
    <img class="card-art" src="${card.image}" alt="${card.name} card" loading="lazy">
  </article>`;
}

function renderDecks() {
  $("deckList").innerHTML = playerData.decks.map((deck, index) => `
    <button class="deck-button ${selectedDeck === index ? "active" : ""}" data-select-deck="${index}" type="button">
      <strong>${safeText(deck.name)}</strong><br><span>${deck.cards.length} cards ${playerData.activeDeck === index ? "- ACTIVE" : ""}</span>
    </button>`).join("");
  const deck = playerData.decks[selectedDeck];
  $("deckEditorTitle").textContent = deck.name;
  $("deckNameInput").value = deck.name;
  $("setActiveDeckButton").disabled = playerData.activeDeck === selectedDeck;
  $("landscapePicker").innerHTML = deck.landscapeCards.map((id, slot) => {
    const selected = getLandscapeCard(id);
    const slotCards = getOwnedLandscapeCards().filter((card) => card.variant === slot + 1);
    return `<label class="landscape-card-choice">
      <span>Lane ${slot + 1}</span>
      ${selected ? `<img src="${selected.image}" alt="${selected.faction} ${selected.variant}">` : "<div class=\"landscape-card-empty\">No owned card for this numbered slot</div>"}
      <select data-landscape-card-slot="${slot}">
        ${slotCards.length ? slotCards.map((card) => `<option value="${card.id}" ${card.id === id ? "selected" : ""}>${card.faction} ${card.variant}</option>`).join("") : `<option value="" selected disabled>Unlock landscape slot ${slot + 1}</option>`}
      </select>
    </label>`;
  }).join("");
  $("deckCards").innerHTML = getDeckCardStacks(deck.cards).map((stack) => renderDeckCardStack(stack, deck)).join("") || "<p class=\"quiet\">No cards in this deck yet.</p>";
  $("deckCardsTitle").textContent = `${Math.min(MAX_DECK_SIZE, deck.cards.length + LANDSCAPE_SLOTS)}/${MAX_DECK_SIZE}`;
  $("deckFactionFilter").value = deckFactionFilter;
  $("deckCardSearch").value = deckCardSearchQuery;
  $("deckCardSort").value = deckCardSort;
  const availableOwnedCards = getOwnedCards()
    .filter((id) => getDeckAvailableCopies(id, deck) > 0)
    .map((id) => getCard(id));
  const filteredOwnedCards = sortDeckCards(filterCards(availableOwnedCards, deckTypeFilter, deckFactionFilter).filter(matchesDeckCardSearch));
  $("deckCollection").innerHTML = filteredOwnedCards.map((card) => renderDeckPoolCard(card, deck)).join("") || "<p class=\"quiet\">No cards match these filters.</p>";
  document.querySelectorAll(".deck-category-tab").forEach((button) => {
    const active = button.dataset.deckTypeFilter === deckTypeFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function renderDecksAfterCardChange(changedButton) {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const changedCard = changedButton.closest(".game-card");
  const collection = $("deckCollection");
  const cardIndex = changedCard ? Array.from(collection.children).indexOf(changedCard) : -1;
  const cardTop = changedCard?.getBoundingClientRect().top;
  // The clicked card button is replaced during the render; blur it first so the browser does not chase it.
  document.activeElement?.blur();
  renderDecks();
  requestAnimationFrame(() => {
    const nextCard = cardIndex >= 0 ? collection.children[cardIndex] : null;
    const nextCardTop = nextCard?.getBoundingClientRect().top;
    const anchorShift = Number.isFinite(cardTop) && Number.isFinite(nextCardTop) ? nextCardTop - cardTop : 0;
    window.scrollTo({ left: scrollX, top: scrollY + anchorShift, behavior: "auto" });
  });
}

function renderCampaign() {
  $("battleRecord").textContent = getWinLossRatio();
  $("stageGrid").innerHTML = achievementCatalog.map((achievement, index) => {
    const state = getAchievementState(achievement);
    const target = getAchievementTarget(achievement);
    const progress = Math.min(getAchievementProgress(achievement), target);
    const status = state === "claimed" ? "Claimed" : state === "claim" ? "Ready to claim" : progress + " / " + target;
    const cardClass = state === "claimed" ? "complete" : state === "claim" ? "available" : "stage-locked";
    const buttonText = state === "claimed" ? "Claimed" : state === "claim" ? "Claim" : "Locked";
    return '<article class="stage-card ' + cardClass + '">'
      + '<div class="stage-copy"><span class="eyebrow">Achievement ' + (index + 1) + '</span><h2>' + achievement.name + '</h2><p>' + achievement.description + '</p></div>'
      + '<div class="stage-reward"><span aria-hidden="true"></span><strong>' + achievement.reward + '</strong><small>coins</small></div>'
      + '<p class="stage-status">' + status + '</p>'
      + '<button data-stage="' + achievement.id + '" ' + (state === "claim" ? "" : "disabled") + ' type="button">' + buttonText + '</button>'
      + '</article>';
  }).join("");
}

function renderStore() {
  const purchasableMats = maps.filter((map) => !starterMatIds.includes(map));
  $("storeGrid").innerHTML = `${packCatalog.map(renderPack).join("")}${purchasableMats.map((map) => renderStoreUnlock("map", map, 90)).join("")}${backgrounds.map((background) => renderStoreUnlock("background", background, tonedBackgrounds.includes(background) ? 45 : 90)).join("")}`;
}

function renderPack(pack) {
  const bought = playerData.storePurchases.filter((purchase) => purchase.type === "card-pack" && purchase.packId === pack.id).length;
  return `<article class="store-card pack-card">
    ${renderPackArt(pack)}
    <span class="eyebrow">${pack.packs} pack${pack.packs === 1 ? "" : "s"}</span><h2>${pack.name}</h2><p>${pack.description}</p><p>${pack.cardsPerPack} cards per pack - ${pack.packs * pack.cardsPerPack} cards total</p><p class="pack-landscape-bonus">+ 1 Landscape card per pack</p><p>${bought} purchase${bought === 1 ? "" : "s"}</p><button data-buy-pack="${pack.id}" ${playerData.profile.coins < pack.price ? "disabled" : ""} type="button">Buy - ${pack.price} coins</button>
  </article>`;
}

function renderPackArt(pack) {
  const packFront = pack.packs === 1 ? "assets/store/hero-pack.png" : "assets/store/for-glory-pack-front.png";
  const print = `<div class="pack-print pack-print-${pack.id}"><img class="pack-front-art" src="${packFront}" alt="Adventure Time Card Wars booster pack"></div>`;
  if (pack.packs === 1) return `<div class="pack-art pack-stage" aria-label="3D model of ${pack.name}">
    <div class="pack-model pack-model-${pack.id}">
      <div class="pack-face pack-front">${print}</div>
      <div class="pack-face pack-side"><span>CARD WARS</span></div>
      <div class="pack-face pack-top"><span>1 PACK</span></div>
    </div>
  </div>`;
  const count = pack.packs === 6 ? 6 : 10;
  const packs = Array.from({ length: count }, (_, index) => {
    const columns = pack.packs === 6 ? 3 : 2;
    const x = pack.packs === 6 ? (index % columns) * 70 - 70 : (index % columns) * 58 - 29;
    const y = pack.packs === 6 ? Math.floor(index / columns) * -14 - 24 : Math.floor(index / columns) * 22 - 44;
    const z = index * (pack.packs === 6 ? 5 : 2);
    return `<div class="mini-pack" style="--pack-x:${x}px;--pack-y:${y}px;--pack-z:${z}px">${print}</div>`;
  }).join("");
  return `<div class="pack-art pack-stage" aria-label="3D model of ${pack.name}">
    <div class="pack-bundle pack-bundle-${pack.packs === 6 ? "six" : "display"}">
      ${pack.packs === 10 ? `<div class="display-box-back"><span>CARD WARS</span></div><div class="display-box-front"></div>` : ""}
      ${packs}
    </div>
  </div>`;
}

function renderStoreUnlock(type, id, cost) {
  const area = type === "map" ? playerData.maps : playerData.backgrounds;
  const owned = area.owned.includes(id);
  const name = type === "map" ? getMat(id).name : titleCase(id);
  const preview = type === "map"
    ? `<div class="mat-preview"><img src="${getMat(id).image}" alt="${name} game mat"></div>`
    : `<div class="background-preview" data-background-preview="${id}"><img src="assets/card-wars-home.png" alt="${name} battle room preview"></div>`;
  return `<article class="store-card ${type === "map" ? "mat-store-card" : "background-store-card"}">${preview}<span class="eyebrow">${type === "map" ? "Game mat" : type}</span><h2>${name}</h2><p>${type === "map" ? "Tabletop playmat" : "Menu scene"}</p><p class="${owned ? "owned" : "locked"}">${owned ? "Owned" : `${cost} coins`}</p><button data-buy-${type}="${id}" ${owned || playerData.profile.coins < cost ? "disabled" : ""} type="button">${owned ? "Owned" : "Buy"}</button></article>`;
}

function renderSettings() {
  const ownedCardTotal = Object.values(playerData.collection).reduce((total, owned) => total + (owned.copies || 0), 0);
  const avatar = avatarCatalog.find((entry) => entry.id === playerData.profile.avatar) || avatarCatalog[0];
  const testModeActive = Boolean(playerData.unlocks.testMode);
  renderAvatar($("settingsAvatar"), avatar);
  $("settingsProfileName").textContent = playerData.profile.username;
  $("settingsProfileMeta").textContent = testModeActive ? `Test mode - ${playerData.profile.coins} coins` : `${playerData.profile.xp}/${getLevelWinTarget(playerData.profile.level)} wins - ${playerData.profile.coins} coins`;
  $("settingsCardCount").textContent = ownedCardTotal;
  $("settingsDeckCount").textContent = playerData.decks.length;
  $("settingsRecord").textContent = getWinLossRatio();
  $("usernameInput").value = playerData.profile.username;
  $("mapSelect").innerHTML = playerData.maps.owned.map((id) => `<option value="${id}" ${playerData.maps.equipped === id ? "selected" : ""}>${getMat(id).name}</option>`).join("");
  $("backgroundSelect").innerHTML = playerData.backgrounds.owned.map((id) => `<option value="${id}" ${playerData.backgrounds.equipped === id ? "selected" : ""}>${titleCase(id)}</option>`).join("");
  renderAvatarPicker();
  const equippedMat = getMat(playerData.maps.equipped);
  $("settingsMatPreview").src = equippedMat.image;
  $("settingsBackgroundPreview").dataset.backgroundPreview = playerData.backgrounds.equipped;
  $("soundToggle").checked = Boolean(playerData.settings.sound);
  $("motionToggle").checked = Boolean(playerData.settings.reduceMotion);
  $("testModeStatus").textContent = testModeActive ? "Test mode" : "";
  $("openHologramTestMapButton").hidden = !testModeActive;
}

function renderAvatarPicker() {
  const currentAvatar = playerData.profile.avatar;
  const query = avatarSearchQuery.trim().toLowerCase();
  const matchingAvatars = avatarCatalog.filter((entry) => entry.name.toLowerCase().includes(query));
  $("avatarPicker").innerHTML = matchingAvatars.map((entry) => `<button class="avatar-option ${entry.id === currentAvatar ? "active" : ""}" data-avatar="${entry.id}" type="button" aria-label="Use ${entry.name}" title="${entry.name}"><span class="avatar-option-face" style="--avatar-focus:${entry.focus};--avatar-scale:${entry.scale || 1.2}"><img src="${entry.image}" alt="${entry.name}"></span><span>${entry.name}</span></button>`).join("");
  $("avatarPickerEmpty").toggleAttribute("hidden", matchingAvatars.length > 0);
}

function renderHologramTestMap() {
  const surface = $("hologramTestSurface");
  if (!surface) return;
  const testMapCards = Array.from({ length: 4 }, (_, index) => index + 1)
    .flatMap((variant) => landscapes.map((faction) => landscapeCardCatalog.find((card) => card.faction === faction && card.variant === variant)))
    .filter(Boolean);
  surface.innerHTML = testMapCards.map((card) => `<article class="test-map-landscape landscape-${slugify(card.faction)}" data-test-landscape data-test-faction="${slugify(card.faction)}" data-test-variant="${card.variant}">
    <img src="${card.image}" alt="${card.faction} landscape ${card.variant}">
    <small>${card.faction} ${card.variant}</small>
  </article>`).join("");
  window.dispatchEvent(new CustomEvent("cardwars:test-map-rebuild"));
  updateHologramTestMap();
}

function updateHologramTestMap() {
  const surface = $("hologramTestSurface");
  if (!surface) return;
  surface.classList.toggle("camera-top", testMapCamera === "top");
  surface.classList.toggle("holograms-on", testMapHolograms);
  surface.style.setProperty("--test-map-x", `${testMapOffsetX}px`);
  surface.style.setProperty("--test-map-y", `${testMapOffsetY}px`);
  surface.style.setProperty("--test-map-pitch", `${testMapCamera === "top" ? 0 : testMapPitch}deg`);
  surface.style.setProperty("--test-map-roll", `${testMapCamera === "top" ? 0 : testMapRoll}deg`);
  surface.style.setProperty("--test-map-zoom", testMapZoom.toFixed(2));
  $("testMapHologramToggle")?.setAttribute("aria-pressed", String(testMapHolograms));
  document.querySelectorAll("[data-test-camera]").forEach((button) => button.classList.toggle("active", button.dataset.testCamera === testMapCamera));
}

function openHologramTestMap() {
  testMapCamera = "angled";
  testMapHolograms = false;
  testMapOffsetX = 0;
  testMapOffsetY = 0;
  testMapPitch = 32;
  testMapRoll = 0;
  testMapZoom = 0.68;
  testMapDrag = null;
  switchView("hologramTest");
  requestAnimationFrame(() => $("hologramTestViewport").focus());
}

function renderCard(id, options = {}) {
  const card = getCard(id);
  if (!card) return "";
  const owned = playerData.collection[id] || { copies: 0, upgradeLevel: 1 };
  const disabled = options.playable && (battle.energy < card.cost || battle.actionsLeft < 1 || battle.turn !== "player" || battle.animating);
  if (options.playable) return `<article class="game-card authentic-card hand-card rarity-${card.rarity} ${options.deal ? "card-dealt" : ""} ${disabled ? "card-unavailable" : ""}" data-hand-card="${id}" data-hand-index="${options.index}" style="--deal-delay:${(options.index || 0) * 70}ms" aria-label="${card.name}. Drag to a compatible card slot."><img class="card-art" src="${card.image}" alt="${card.name} card"></article>`;
  const deckStatus = options.deckStatus || (options.deckCompatible === false ? "wrong-landscape" : "ready");
  const action = options.addToDeck ? `<button data-add-card="${id}" type="button" ${deckStatus !== "ready" ? `disabled title="${deckStatus === "unsupported" ? "This card type is not playable in the current battle prototype" : "This card does not match the deck landscapes"}"` : ""}>${deckStatus === "unsupported" ? "Not playable yet" : deckStatus === "wrong-landscape" ? "Wrong landscape" : "Add"}</button>`
    : Number.isInteger(options.deckIndex) ? `<button data-remove-card="${options.deckIndex}" type="button">Remove</button>` : "";
  const collectionState = options.collection ? ((owned.copies || 0) > 0 ? " collection-owned" : " collection-unowned") : "";
  return `<article class="game-card authentic-card rarity-${card.rarity}${collectionState} ${options.deal ? "card-dealt" : ""}" style="--deal-delay:${(options.index || 0) * 70}ms"><img class="card-art" src="${card.image}" alt="${card.name} card" loading="lazy"><small class="card-ownership">${owned.copies || 0} owned - level ${owned.upgradeLevel || 1}</small>${action}</article>`;
}

async function beginBattleWithLoading() {
  setLoadingScreen("battle", "Card Wars", "Dealing the battlefield");
  const switched = switchView("battle", { deferOpeningEnemyTurn: true });
  if (!switched) {
    hideLoadingScreen();
    return;
  }
  await Promise.all([
    preloadImageSources(collectBattleAssetSources()),
    sleep(BATTLE_LOADING_MS)
  ]);
  requestAnimationFrame(() => requestAnimationFrame(hideLoadingScreen));
  if (battle?.startingPlayer === "enemy") setTimeout(() => enemyTurn(true), 120);
}

function switchView(viewName, options = {}) {
  if (viewName !== "hologramTest" && $("hologramTestView")?.classList.contains("active")) stopHologramTestMapInput();
  // Play always starts a new shuffled battle instead of reviving the previous one.
  const needsFreshBattle = viewName === "battle";
  if (needsFreshBattle && !startBattle()) return false;
  try {
    if (viewName === "battle") sessionStorage.removeItem(VIEW_STORAGE_KEY);
    else sessionStorage.setItem(VIEW_STORAGE_KEY, viewName);
  } catch {}
  document.querySelectorAll(".tab, .view").forEach((node) => node.classList.remove("active"));
  document.querySelector(`.tab[data-view="${viewName}"]`)?.classList.add("active");
  $(`${viewName}View`)?.classList.add("active");
  document.body.classList.toggle("home-active", viewName === "home");
  document.body.classList.toggle("battle-active", viewName === "battle");
  document.body.classList.toggle("hologram-test-active", viewName === "hologramTest");
  if (viewName === "collection") renderCollection();
  if (viewName === "decks") renderDecks();
  if (viewName === "campaign") renderCampaign();
  if (viewName === "store") renderStore();
  if (viewName === "settings") renderSettings();
  if (viewName === "hologramTest") renderHologramTestMap();
  if (needsFreshBattle) renderBattle();
  if (needsFreshBattle && battle.startingPlayer === "enemy" && !options.deferOpeningEnemyTurn) setTimeout(() => enemyTurn(true), 0);
  window.scrollTo({ top: 0, behavior: playerData.settings.reduceMotion ? "auto" : "smooth" });
  return true;
}

function applyEquippedTheme() {
  document.body.classList.toggle("reduce-motion", Boolean(playerData.settings.reduceMotion));
  const arena = $("battleLandscape");
  if (arena) arena.dataset.background = playerData.backgrounds.equipped;
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function safeText(value) { return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]); }
function titleCase(value) { return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function slugify(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

function activateDeckBuilderCard(target) {
  if (target.dataset.addCard) {
    const deck = playerData.decks[selectedDeck];
    if (!cardMatchesDeck(target.dataset.addCard, deck)) showToast("That card does not match this deck's Landscapes");
    else if (deck.cards.length >= MAX_NON_LANDSCAPE_CARDS) showToast(`This deck already has ${MAX_DECK_SIZE} cards including landscapes`);
    else if (deck.cards.filter((id) => id === target.dataset.addCard).length >= (playerData.collection[target.dataset.addCard]?.copies || 0)) showToast("You do not own another copy of that card");
    else { deck.cards.push(target.dataset.addCard); playerData.achievements.deckCrafter = true; saveAccount(""); renderDecksAfterCardChange(target); }
    return true;
  }
  if (target.dataset.removeCardId) {
    const deck = playerData.decks[selectedDeck];
    const cardIndex = deck.cards.indexOf(target.dataset.removeCardId);
    if (cardIndex >= 0) {
      deck.cards.splice(cardIndex, 1);
      saveAccount("");
      renderDecksAfterCardChange(target);
    }
    return true;
  }
  return false;
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a[data-view], [data-add-card], [data-remove-card-id]");
  if (!target) return;
  if (activateDeckBuilderCard(target)) return;
  if (target.id === "testModeButton") {
    event.preventDefault();
    activateTestMode();
    return;
  }
  if (target.id === "openHologramTestMapButton") {
    openHologramTestMap();
    return;
  }
  if (target.id === "closeHologramTestMapButton") {
    switchView("settings");
    return;
  }
  if (target.id === "homeHologramTestMapButton") {
    switchView("home");
    return;
  }
  if (target.dataset.testCamera) {
    testMapCamera = target.dataset.testCamera;
    testMapPitch = target.dataset.testCamera === "top" ? 12 : 32;
    testMapRoll = 0;
    testMapOffsetX = 0;
    testMapOffsetY = 0;
    updateHologramTestMap();
    return;
  }
  if (target.id === "testMapHologramToggle") {
    testMapHolograms = !testMapHolograms;
    updateHologramTestMap();
    return;
  }
  if (target.id === "confirmTestModeButton") {
    event.preventDefault();
    confirmTestMode();
    return;
  }
  if (target.id === "settingsAvatar") {
    avatarSearchQuery = "";
    $("avatarSearchInput").value = "";
    $("avatarPickerDialog").showModal();
    $("settingsAvatar").setAttribute("aria-expanded", "true");
    renderAvatarPicker();
    requestAnimationFrame(() => $("avatarSearchInput").focus());
    return;
  }
  if (target.classList.contains("battle-home-button")) {
    $("battleHomeDialog")?.showModal();
    return;
  }
  if (target.id === "confirmBattleHomeButton") {
    $("battleHomeDialog")?.close();
    battle = null;
    switchView("home");
    return;
  }
  if (target.dataset.setupAvatar) {
    setupAvatarId = target.dataset.setupAvatar;
    renderAccountSetup();
    return;
  }
  if (target.dataset.setupKingdom) {
    setupKingdom = target.dataset.setupKingdom;
    renderAccountSetup();
    return;
  }
  if (target.id === "completeAccountSetupButton") {
    completeAccountSetup();
    return;
  }
  if (target.dataset.view) {
    if (target.dataset.view === "battle") void beginBattleWithLoading();
    else switchView(target.dataset.view);
    return;
  }
  if (target.dataset.deckTypeFilter) {
    deckTypeFilter = target.dataset.deckTypeFilter;
    renderDecks();
    return;
  }
  if (target.dataset.avatar) {
    playerData.profile.avatar = target.dataset.avatar;
    saveAccount("Profile picture updated");
    renderAll();
    $("settingsAvatar")?.setAttribute("aria-expanded", "true");
  }
  if (target.id === "homeButton") switchView("home");
  if (target.id === "drawCardButton") drawExtraCard();
  if (target.id === "endTurnButton") {
    if (!battle || battle.animating || battle.enemyPhaseRunning || battle.turn !== "player") return;
    event.preventDefault();
    event.stopPropagation();
    void enemyTurn();
    return;
  }
  if (target.id === "battleResultButton") switchView("home");
  if (target.dataset.buyPack) buyPack(target.dataset.buyPack);
  if (target.id === "packOpeningPackButton") openPurchasedPack();
  if (target.id === "packRevealButton") nextPackReveal();
  if (target.id === "skipPackOpeningButton") finishPackOpening();
  if (target.dataset.camera) {
    playerData.settings.boardCamera = target.dataset.camera;
    playerData.settings.boardOrbit = target.dataset.camera === "top" ? { pitch: 12, yaw: 0, zoom: 0.68, panX: 0, panY: 0 } : { pitch: 32, yaw: 0, zoom: 0.68, panX: 0, panY: 0 };
    saveAccount("");
    renderBattle();
  }
  if (target.dataset.hologramsToggle !== undefined) {
    playerData.settings.holograms = !playerData.settings.holograms;
    saveAccount("");
    renderBattle();
    return;
  }
  if (target.id === "upgradeBestButton") upgradeBestCard();
  if (target.id === "claimRewardsButton") claimRewards();
  if (target.dataset.stage) claimAchievement(target.dataset.stage);
  if (target.dataset.selectDeck !== undefined) { selectedDeck = Number(target.dataset.selectDeck); renderDecks(); }
  if (target.dataset.removeCard !== undefined) { playerData.decks[selectedDeck].cards.splice(Number(target.dataset.removeCard), 1); saveAccount(""); renderDecksAfterCardChange(target); }
  if (target.id === "setActiveDeckButton") { playerData.activeDeck = selectedDeck; battle = null; saveAccount(`${playerData.decks[selectedDeck].name} is now active`); renderAll(); }
  if (target.dataset.buyMap) buyUnlock("map", target.dataset.buyMap);
  if (target.dataset.buyBackground) buyUnlock("background", target.dataset.buyBackground);
  if (target.id === "exportAccountButton") exportAccount();
  if (target.id === "importAccountButton") $("importAccountFile").click();
  if (target.id === "confirmImportButton") importPendingAccount();
  if (target.id === "resetAccountButton") $("resetDialog").showModal();
  if (target.id === "confirmResetButton") {
    localStorage.removeItem(STORAGE_KEY);
    playerData = createDefaultAccount();
    selectedDeck = 0;
    battle = null;
    accountSetupPending = true;
    renderAll();
    $("resetDialog").close();
    openAccountSetup();
  }
});

document.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const target = event.target.closest?.("[data-add-card], [data-remove-card-id]");
  if (!target) return;
  event.preventDefault();
  activateDeckBuilderCard(target);
});

$("avatarSearchInput").addEventListener("input", (event) => {
  avatarSearchQuery = event.target.value;
  renderAvatarPicker();
});
$("avatarPickerDialog").addEventListener("close", () => {
  $("settingsAvatar")?.setAttribute("aria-expanded", "false");
});
$("testModeForm").addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  confirmTestMode();
});

function moveHologramTestMap() {
  if (!$("hologramTestView")?.classList.contains("active") || !testMapKeys.size) {
    testMapMovementFrame = 0;
    return;
  }
  const distance = 5.5;
  if (testMapKeys.has("w")) testMapOffsetY += distance;
  if (testMapKeys.has("s")) testMapOffsetY -= distance;
  if (testMapKeys.has("a")) testMapOffsetX += distance;
  if (testMapKeys.has("d")) testMapOffsetX -= distance;
  updateHologramTestMap();
  testMapMovementFrame = requestAnimationFrame(moveHologramTestMap);
}

function isEditableTarget(target) {
  return target instanceof HTMLElement && (target.matches("input, textarea, select, [contenteditable='true']") || target.isContentEditable);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (!$("hologramTestView")?.classList.contains("active") || isEditableTarget(event.target) || !["w", "a", "s", "d"].includes(key)) return;
  event.preventDefault();
  testMapKeys.add(key);
  if (!testMapMovementFrame) testMapMovementFrame = requestAnimationFrame(moveHologramTestMap);
});
document.addEventListener("keyup", (event) => {
  testMapKeys.delete(event.key.toLowerCase());
  if (!testMapKeys.size && testMapMovementFrame) {
    cancelAnimationFrame(testMapMovementFrame);
    testMapMovementFrame = 0;
  }
});
window.addEventListener("blur", stopHologramTestMapInput);
$("hologramTestViewport").addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || event.target.closest("button")) return;
  testMapPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  $("hologramTestViewport").setPointerCapture(event.pointerId);
  if (testMapPointers.size === 2) {
    const [first, second] = [...testMapPointers.values()];
    testMapPinch = { distance: Math.hypot(second.x - first.x, second.y - first.y), zoom: testMapZoom };
    testMapDrag = null;
    event.preventDefault();
    return;
  }
  const isTopDown = testMapCamera === "top";
  testMapDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, pitch: testMapPitch, roll: testMapRoll, offsetX: testMapOffsetX, offsetY: testMapOffsetY, mode: isTopDown ? "pan" : "orbit" };
  updateHologramTestMap();
  event.preventDefault();
});
$("hologramTestViewport").addEventListener("pointermove", (event) => {
  if (testMapPointers.has(event.pointerId)) testMapPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (testMapPinch && testMapPointers.size >= 2) {
    const [first, second] = [...testMapPointers.values()];
    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    testMapZoom = Math.min(1.24, Math.max(0.54, testMapPinch.zoom * (distance / Math.max(1, testMapPinch.distance))));
    updateHologramTestMap();
    event.preventDefault();
    return;
  }
  if (!testMapDrag || testMapDrag.pointerId !== event.pointerId) return;
  const deltaX = event.clientX - testMapDrag.x;
  const deltaY = event.clientY - testMapDrag.y;
  if (testMapDrag.mode === "pan") {
    testMapOffsetX = Math.min(1000, Math.max(-1000, testMapDrag.offsetX + deltaX));
    testMapOffsetY = Math.min(1000, Math.max(-1000, testMapDrag.offsetY + deltaY));
  } else {
    testMapCamera = "angled";
    testMapPitch = Math.min(88, Math.max(8, testMapDrag.pitch - deltaY * 0.2));
    testMapRoll = Math.min(1080, Math.max(-1080, testMapDrag.roll - deltaX * 0.28));
  }
  updateHologramTestMap();
  event.preventDefault();
});
$("hologramTestViewport").addEventListener("pointerup", (event) => {
  testMapPointers.delete(event.pointerId);
  if (testMapPointers.size < 2) testMapPinch = null;
  if (testMapDrag?.pointerId === event.pointerId) testMapDrag = null;
  if ($("hologramTestViewport").hasPointerCapture(event.pointerId)) $("hologramTestViewport").releasePointerCapture(event.pointerId);
});
$("hologramTestViewport").addEventListener("pointercancel", (event) => {
  testMapPointers.delete(event.pointerId);
  testMapPinch = null;
  testMapDrag = null;
});
$("hologramTestViewport").addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaY) < 1) return;
  testMapZoom = Math.min(1.24, Math.max(0.54, testMapZoom * Math.exp(-event.deltaY * 0.001)));
  updateHologramTestMap();
  event.preventDefault();
}, { passive: false });
function stopHologramTestMapInput() {
  testMapKeys.clear();
  testMapPointers.clear();
  testMapPinch = null;
  testMapDrag = null;
  if (testMapMovementFrame) cancelAnimationFrame(testMapMovementFrame);
  testMapMovementFrame = 0;
}

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-landscape-card-slot]")) {
    const slot = Number(event.target.dataset.landscapeCardSlot);
    const landscapeCard = getLandscapeCard(event.target.value);
    if (!landscapeCard || landscapeCard.variant !== slot + 1 || !playerData.landscapeCollection.includes(landscapeCard.id)) return;
    const deck = playerData.decks[selectedDeck];
    deck.landscapeCards[slot] = landscapeCard.id;
    deck.landscapes[slot] = landscapeCard.faction;
    const previousCount = deck.cards.length;
    deck.cards = deck.cards.filter((id) => cardMatchesDeck(id, deck));
    const removedCount = previousCount - deck.cards.length;
    saveAccount(removedCount ? `${removedCount} incompatible card${removedCount === 1 ? "" : "s"} removed` : "Landscape card saved");
    if (playerData.activeDeck === selectedDeck) battle = null;
    renderDecks();
  }
});

document.addEventListener("pointerdown", beginCardDrag);
document.addEventListener("pointerdown", beginBoardAttackDrag);
document.addEventListener("pointermove", moveCardGhost);
document.addEventListener("pointermove", moveBoardAttackDrag);
document.addEventListener("pointerup", endCardDrag);
document.addEventListener("pointerup", endBoardAttackDrag);
document.addEventListener("pointercancel", endCardDrag);
document.addEventListener("pointercancel", endBoardAttackDrag);

$("loadingSkipButton").addEventListener("click", hideLoadingScreen);
$("collectionTypeFilter").addEventListener("change", (event) => { collectionTypeFilter = event.target.value; renderCollection(); });
$("collectionFactionFilter").addEventListener("change", (event) => { collectionFactionFilter = event.target.value; renderCollection(); });
$("deckFactionFilter").addEventListener("change", (event) => { deckFactionFilter = event.target.value; renderDecks(); });
$("deckCardSearch").addEventListener("input", (event) => { deckCardSearchQuery = event.target.value; renderDecks(); });
$("deckCardSort").addEventListener("change", (event) => { deckCardSort = event.target.value; renderDecks(); });

$("deckNameInput").addEventListener("change", (event) => { playerData.decks[selectedDeck].name = event.target.value.trim() || `Deck ${selectedDeck + 1}`; saveAccount(""); renderDecks(); });
$("usernameInput").addEventListener("change", (event) => { playerData.profile.username = event.target.value.trim().slice(0, 18) || "Player"; saveAccount("Username saved"); renderAll(); });
$("mapSelect").addEventListener("change", (event) => { playerData.maps.equipped = event.target.value; saveAccount("Game mat equipped"); renderSettings(); renderBattle(); });
$("backgroundSelect").addEventListener("change", (event) => {
  playerData.backgrounds.equipped = event.target.value;
  saveAccount("Battle room background equipped");
  renderSettings();
  renderBattle();
});
$("soundToggle").addEventListener("change", (event) => { playerData.settings.sound = event.target.checked; saveAccount("Sound setting saved"); });
$("motionToggle").addEventListener("change", (event) => { playerData.settings.reduceMotion = event.target.checked; saveAccount("Motion setting saved"); });
$("accountSetupDialog").addEventListener("cancel", (event) => { if (accountSetupPending) event.preventDefault(); });
$("tableStage").addEventListener("pointerdown", beginCameraDrag);
$("tableStage").addEventListener("pointermove", moveCameraDrag);
$("tableStage").addEventListener("pointerup", endCameraDrag);
$("tableStage").addEventListener("pointercancel", endCameraDrag);
$("tableStage").addEventListener("wheel", zoomBoardWithWheel, { passive: false });
document.addEventListener("wheel", (event) => {
  if (event.ctrlKey && !event.target.closest(".table-stage, .hologram-test-viewport")) event.preventDefault();
}, { passive: false, capture: true });
document.addEventListener("gesturestart", (event) => {
  if (!event.target.closest(".table-stage, .hologram-test-viewport")) event.preventDefault();
}, { passive: false });
document.addEventListener("gesturechange", (event) => {
  if (!event.target.closest(".table-stage, .hologram-test-viewport")) event.preventDefault();
}, { passive: false });
document.addEventListener("contextmenu", (event) => {
  if (event.target.closest(".store-grid, .settings-choice-grid, .hologram-test-page")) event.preventDefault();
});
document.addEventListener("dragstart", (event) => {
  if (event.target.closest(".store-grid, .settings-choice-grid, .hologram-test-page")) event.preventDefault();
});
window.addEventListener("resize", applyBoardOrbit);

$("importAccountFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 5_000_000) throw new Error("The account file is too large.");
    showImportConfirmation(validateAccount(JSON.parse(await file.text())));
  } catch (error) {
    showToast(`Import failed: ${error.message}`);
  } finally {
    event.target.value = "";
  }
});

renderAll();
const startupUrl = new URL(window.location.href);
startupUrl.searchParams.delete("view");
window.history.replaceState(null, "", `${startupUrl.pathname}${startupUrl.search}${startupUrl.hash}`);
if (accountSetupPending) {
  try { sessionStorage.setItem(VIEW_STORAGE_KEY, "home"); } catch {}
  openAccountSetup();
} else {
  saveAccount("");
  let initialView = "home";
  try {
    const savedView = sessionStorage.getItem(VIEW_STORAGE_KEY);
    const validViews = ["home", "collection", "decks", "campaign", "store", "rules", "settings", "hologramTest"];
    if (validViews.includes(savedView)) initialView = savedView;
  } catch {}
  switchView(initialView);
}
void finishStartupLoading();
