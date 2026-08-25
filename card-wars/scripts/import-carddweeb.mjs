import fs from "node:fs";
import path from "node:path";

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Usage: node scripts/import-carddweeb.mjs <CardDatabase.html>");

const html = fs.readFileSync(sourcePath, "utf8");
const decode = (value = "") => value
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&gt;/g, ">")
  .replace(/&lt;/g, "<")
  .replace(/&amp;/g, "&");
const attribute = (block, name) => decode(block.match(new RegExp(`data-${name}="([^"]*)"`))?.[1] || "");
const typeNames = ["Creature", "Spell", "Building", "Landscape", "Hero", "Teamwork"];
const factionNames = ["Blue Plains", "Corn Fields", "Useless Swamp", "Sandy Lands", "Nice Lands", "Icy Lands", "Lava Flats"];
const printedFactionOverrides = new Map([
  ["Basalt Behemoth", "Lava Flats"],
  ["Boarder Collie", "Icy Lands"],
  ["Bomb Pop", "Icy Lands"],
  ["Brigadier Banana Split", "Icy Lands"],
  ["Chillwave", "Icy Lands"],
  ["Chocolate TaCody", "Icy Lands"],
  ["Conflagration", "Lava Flats"],
  ["Cool Cone Cafe", "Icy Lands"],
  ["Crystal Palace", "Icy Lands"],
  ["Four Star Fudge", "Icy Lands"],
  ["Furious Phoenix", "Lava Flats"],
  ["Heat Leapers", "Lava Flats"],
  ["Ice-olation Cell", "Icy Lands"],
  ["Icemeister", "Icy Lands"],
  ["Icewarden", "Icy Lands"],
  ["Kind-ling", "Lava Flats"],
  ["Magma Canals", "Lava Flats"],
  ["Pepper Palace", "Lava Flats"],
  ["Reign Deer", "Icy Lands"],
  ["Searing Insight", "Lava Flats"],
  ["Slay Rider", "Icy Lands"],
  ["Slushie Salvo", "Icy Lands"],
  ["Smooth Eli", "Icy Lands"],
  ["Sprucy Lucy", "Icy Lands"],
  ["Tectonic Tardigrade", "Lava Flats"],
  ["Temple of the Torch", "Lava Flats"],
  ["The Icebox", "Icy Lands"],
]);

const cards = [...html.matchAll(/<div[^>]+class="card-container"[\s\S]*?<\/div>\s*<\/div>/g)].map((match) => {
  const block = match[0];
  const sourceImage = attribute(block, "card-image");
  const imageName = decodeURIComponent(sourceImage.split("/").pop());
  const typeIndex = Number(attribute(block, "card-type"));
  const landscape = attribute(block, "landscape");
  const name = attribute(block, "name");
  const cost = attribute(block, "cost");
  const attack = attribute(block, "attack");
  const defense = attribute(block, "defense");
  return {
    id: `carddweeb-${attribute(block, "id")}`,
    sourceId: Number(attribute(block, "id")),
    name,
    type: typeNames[typeIndex] || "Unknown",
    faction: printedFactionOverrides.get(name) || (landscape === "" ? "Rainbow" : factionNames[Number(landscape)] || "Rainbow"),
    ability: attribute(block, "ability"),
    cost: cost === "" ? null : Number(cost),
    attack: attack === "" ? null : Number(attack),
    block: defense === "" ? null : Number(defense),
    sets: attribute(block, "set").split("#").filter(Boolean).map(Number),
    custom: attribute(block, "custom") === "True",
    revision: Number(attribute(block, "revision")) || 1,
    rarity: "common",
    playable: typeIndex === 0,
    collectible: typeIndex !== 3,
    image: `assets/cards/database/${imageName}`,
    sourceImage: `https://carddweeb.com${sourceImage}`
  };
});

const outputDirectory = path.resolve("assets/data");
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "card-database.json"), `${JSON.stringify(cards, null, 2)}\n`);
fs.writeFileSync(path.join(outputDirectory, "card-database.js"), `window.CARD_DATABASE = ${JSON.stringify(cards)};\n`);
console.log(`Imported ${cards.length} cards (${cards.filter((card) => !card.custom).length} official, ${cards.filter((card) => card.custom).length} community).`);
