import fs from "node:fs/promises";
import path from "node:path";

const cards = JSON.parse(await fs.readFile("assets/data/card-database.json", "utf8"));
await fs.mkdir("assets/cards/database", { recursive: true });

let nextIndex = 0;
let downloaded = 0;
async function worker() {
  while (nextIndex < cards.length) {
    const card = cards[nextIndex++];
    try {
      await fs.access(card.image);
      continue;
    } catch {}
    const response = await fetch(card.sourceImage);
    if (!response.ok) throw new Error(`${response.status} ${card.sourceImage}`);
    await fs.writeFile(card.image, Buffer.from(await response.arrayBuffer()));
    downloaded += 1;
    if (downloaded % 50 === 0) console.log(`Downloaded ${downloaded} images...`);
  }
}

await Promise.all(Array.from({ length: 16 }, worker));
console.log(`Finished. Downloaded ${downloaded}; ${cards.length} database images are available locally.`);
