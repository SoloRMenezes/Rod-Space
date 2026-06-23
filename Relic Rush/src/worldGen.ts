/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tile, TileType, WallType, GameWorld } from './types';
import { ITEMS } from './data';

export function generateWorld(width: number, height: number): GameWorld {
  const tiles: Tile[][] = [];

  // Initialize empty world with air
  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      tiles[x][y] = {
        type: TileType.Air,
        wall: WallType.None,
        light: 1.0, // Default to full light, we will compute lighting later
      };
    }
  }

  // 1. Generate Surface Height Map
  const surfaceY: number[] = [];
  const desertBound = Math.floor(width * 0.25);
  const corruptionBound = Math.floor(width * 0.75);

  for (let x = 0; x < width; x++) {
    // Basic sine wave landscape
    let baseHeight = Math.floor(height * 0.35); // surface starts around 35% down
    
    // Multi-frequency noise approximation
    let noise1 = Math.sin(x * 0.05) * 6;
    let noise2 = Math.sin(x * 0.15) * 2;
    let noise3 = Math.cos(x * 0.02) * 4;

    // Biome modifier
    if (x < desertBound) {
      // Desert is flatter with sandy dunes
      noise1 = Math.sin(x * 0.08) * 3;
      baseHeight += 2;
    } else if (x > corruptionBound) {
      // Corruption has deep, steep chasms
      noise1 = Math.sin(x * 0.04) * 8;
      if (x % 35 > 30) {
        // Deep chasm!
        noise1 = 20;
      }
    }

    surfaceY[x] = Math.max(15, Math.min(height - 15, Math.floor(baseHeight + noise1 + noise2 + noise3)));
  }

  // 2. Fill block grid based on heights & biomes
  for (let x = 0; x < width; x++) {
    const sY = surfaceY[x];
    for (let y = 0; y < height; y++) {
      if (y < sY) {
        // Above surface = Air
        tiles[x][y] = {
          type: TileType.Air,
          wall: WallType.None,
          light: 1.0,
        };
      } else {
        // Below surface = Dirt, Stone, Sand or Ebonstone
        let type = TileType.Dirt;
        let wall = WallType.None;

        if (x < desertBound) {
          // Desert biome
          if (y === sY) {
            type = TileType.Sand;
          } else if (y < sY + 8) {
            type = TileType.Sand;
            wall = WallType.DirtWall;
          } else {
            type = TileType.Stone;
            wall = WallType.StoneWall;
          }
        } else if (x > corruptionBound) {
          // Corruption biome
          if (y === sY) {
            type = TileType.CorruptedDirt;
          } else if (y < sY + 8) {
            type = TileType.CorruptedDirt;
            wall = WallType.EbonstoneWall;
          } else {
            type = TileType.Ebonstone;
            wall = WallType.EbonstoneWall;
          }
        } else {
          // Forest / Normal biome
          if (y === sY) {
            type = TileType.Dirt; // Green grass on top will be rendered on dirt
          } else if (y < sY + 10) {
            type = TileType.Dirt;
            wall = WallType.DirtWall;
          } else {
            type = TileType.Stone;
            wall = WallType.StoneWall;
          }
        }

        tiles[x][y] = {
          type,
          wall,
          light: 0.0,
        };
      }
    }
  }

  // 3. Generate Cavern Systems (using walker worms)
  const numWorms = Math.floor((width * height) / 300);
  for (let w = 0; w < numWorms; w++) {
    let wx = Math.floor(Math.random() * width);
    let wy = Math.floor(Math.random() * (height - 25)) + 20; // caverns start deeper
    
    // If worm spawns in desert, it digs tunnels
    let wormLength = Math.floor(Math.random() * 30) + 15;
    let wormSize = Math.floor(Math.random() * 3) + 2; // radius of carve

    for (let l = 0; l < wormLength; l++) {
      // Carve circle around worm head
      for (let dx = -wormSize; dx <= wormSize; dx++) {
        for (let dy = -wormSize; dy <= wormSize; dy++) {
          const cx = wx + dx;
          const cy = wy + dy;
          if (cx >= 0 && cx < width && cy >= 15 && cy < height - 5) {
            // Check radius
            if (dx * dx + dy * dy <= wormSize * wormSize) {
              tiles[cx][cy].type = TileType.Air;
              // Leave the background wall!
            }
          }
        }
      }

      // Move worm head
      wx += Math.floor(Math.random() * 3) - 1;
      wy += Math.floor(Math.random() * 3) - 1;
      
      // Boundaries
      if (wx < 0) wx = 0;
      if (wx >= width) wx = width - 1;
      if (wy < 15) wy = 15;
      if (wy >= height - 5) wy = height - 6;
    }
  }

  // 4. Generate Ore Deposits (Iron and Gold)
  spawnOre(tiles, TileType.IronOre, 0.007, 30, height - 15, width, height);
  spawnOre(tiles, TileType.GoldOre, 0.004, 50, height - 10, width, height);

  // 5. Generate Mantle / Lava Layer
  for (let x = 0; x < width; x++) {
    for (let y = height - 6; y < height; y++) {
      if (y >= height - 3) {
        tiles[x][y] = {
          type: TileType.Stone,
          wall: WallType.StoneWall,
          light: 0.5,
          liquid: 8,
          isLava: true,
        };
      } else {
        if (Math.random() > 0.4) {
          tiles[x][y] = {
            type: TileType.Air,
            wall: WallType.StoneWall,
            light: 0.5,
            liquid: 8,
            isLava: true,
          };
        }
      }
    }
  }

  // 6. Grow surface vegetation (Trees, Cacti, Grass Decos, Mushrooms, Shadow Orbs)
  for (let x = 1; x < width - 1; x++) {
    const sY = surfaceY[x];
    if (sY >= height - 1) continue;

    const topTile = tiles[x][sY];
    
    // Check if the surface block is solid
    if (topTile.type === TileType.Dirt) {
      // Normal grass decos (mushrooms or flower grass)
      if (Math.random() < 0.25) {
        tiles[x][sY - 1].type = TileType.GrassDeco;
      }
      // Trees
      else if (Math.random() < 0.18 && x % 4 !== 0) { // space out trees
        // Check surrounding air
        if (tiles[x - 1][sY - 1].type === TileType.Air && tiles[x + 1][sY - 1].type === TileType.Air) {
          growTree(tiles, x, sY - 1, Math.floor(Math.random() * 4) + 5, width, height);
        }
      }
    } else if (topTile.type === TileType.Sand) {
      // Grow Cacti in desert
      if (Math.random() < 0.12 && x % 5 !== 0) {
        growCactus(tiles, x, sY - 1, Math.floor(Math.random() * 3) + 2);
      }
    } else if (topTile.type === TileType.CorruptedDirt) {
      // Spawn Corruption grass decor or occasional evil tree
      if (Math.random() < 0.1) {
        tiles[x][sY - 1].type = TileType.GrassDeco; // Rendered as purple weed
      }
    }
  }

  // 7. Place Shadow Orbs in deep corruption chasms
  for (let x = corruptionBound; x < width - 2; x++) {
    // Look for deep chasms
    const sY = surfaceY[x];
    if (sY > Math.floor(height * 0.45)) { // Chasm is deep!
      // Place shadow orb in a small carved chamber underground inside corruption
      let orbY = sY + 12;
      if (orbY < height - 10) {
        // Carve minor square room
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            tiles[x + dx][orbY + dy] = {
              type: TileType.Air,
              wall: WallType.EbonstoneWall,
              light: 0.1,
            };
          }
        }
        // Place Orb in the middle
        tiles[x][orbY] = {
          type: TileType.ShadowOrb,
          wall: WallType.EbonstoneWall,
          light: 0.6,
        };
      }
    }
  }

  // 8. Spawn Loot Chests in underground caverns!
  const numChests = Math.floor((width * height) / 800);
  let chestsPlaced = 0;
  for (let attempt = 0; attempt < 200 && chestsPlaced < numChests; attempt++) {
    const cx = Math.floor(Math.random() * (width - 4)) + 2;
    const cy = Math.floor(Math.random() * (height - 35)) + 25; // cave depth

    // Chest needs a solid base and open space
    const tileUnder = tiles[cx][cy + 1];
    const tileCurrent = tiles[cx][cy];
    const tileAbove = tiles[cx][cy - 1];

    if (
      tileUnder.type !== TileType.Air && 
      tileUnder.type !== TileType.Platform &&
      tileUnder.type !== TileType.TreeTrunk &&
      tileCurrent.type === TileType.Air && 
      tileAbove.type === TileType.Air
    ) {
      tiles[cx][cy] = {
        type: TileType.Chest,
        wall: tileCurrent.wall || WallType.StoneWall,
        light: 0.0,
      };
      chestsPlaced++;
    }
  }

  // Find player spawn (near center Forest biome, safe on surface)
  const spawnX = Math.floor(width / 2);
  const spawnY = surfaceY[spawnX] - 3; // Spawn slightly floating above grass

  return {
    width,
    height,
    tiles,
    spawnX,
    spawnY,
    timeOfDay: 4000, // Start in morning (dawn is around 0-3000, day is 4000-12000)
    dayNumber: 1,
  };
}

function growTree(tiles: Tile[][], x: number, startY: number, trunkHeight: number, width: number, height: number) {
  // Check height boundary
  if (startY - trunkHeight - 2 < 0) return;

  // Place wooden trunk
  for (let i = 0; i < trunkHeight; i++) {
    tiles[x][startY - i] = {
      type: TileType.TreeTrunk,
      wall: tiles[x][startY - i].wall,
      light: tiles[x][startY - i].light,
    };
  }

  // Place leafy canopy at the top
  const topY = startY - trunkHeight + 1;
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 0; dy++) {
      const lx = x + dx;
      const ly = topY + dy;
      if (lx >= 0 && lx < width && ly >= 0) {
        // Soften corners of foliage
        if (Math.abs(dx) === 2 && dy === -2) continue;
        if (Math.abs(dx) === 2 && dy === 0 && Math.random() > 0.5) continue;

        // Overwrite air only (or overlap tree trunk branches)
        if (tiles[lx][ly].type === TileType.Air || tiles[lx][ly].type === TileType.TreeTrunk) {
          tiles[lx][ly] = {
            type: TileType.Leaves,
            wall: tiles[lx][ly].wall,
            light: tiles[lx][ly].light,
          };
        }
      }
    }
  }
}

function growCactus(tiles: Tile[][], x: number, startY: number, length: number) {
  for (let i = 0; i < length; i++) {
    tiles[x][startY - i] = {
      type: TileType.Cactus,
      wall: WallType.None,
      light: 1.0,
    };
  }
}

function spawnOre(tiles: Tile[][], oreType: TileType, density: number, minY: number, maxY: number, width: number, height: number) {
  const numOres = Math.floor((width * height) * density);
  for (let o = 0; o < numOres; o++) {
    const ox = Math.floor(Math.random() * width);
    const oy = Math.floor(Math.random() * (maxY - minY)) + minY;

    // Place a small cluster of 2x2 or 3x3 ore
    const clusterSize = Math.floor(Math.random() * 3) + 2;
    for (let dx = 0; dx < clusterSize; dx++) {
      for (let dy = 0; dy < clusterSize; dy++) {
        const cx = ox + dx;
        const cy = oy + dy;
        if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
          // Replace stone with ore
          if (tiles[cx][cy].type === TileType.Stone || tiles[cx][cy].type === TileType.Ebonstone || tiles[cx][cy].type === TileType.Dirt) {
            tiles[cx][cy].type = oreType;
          }
        }
      }
    }
  }
}

// Generate starting chest items
export function populateChestItems(): any[] {
  const possibleLoots = [
    { id: 'hermes_boots', count: 1, chance: 0.35 },
    { id: 'cloud_in_a_bottle', count: 1, chance: 0.35 },
    { id: 'band_of_regeneration', count: 1, chance: 0.35 },
    { id: 'gold_bar', count: 3, chance: 0.5 },
    { id: 'iron_bar', count: 5, chance: 0.6 },
    { id: 'torch', count: 15, chance: 0.8 },
    { id: 'lesser_healing_potion', count: 4, chance: 0.7 },
    { id: 'wooden_arrow', count: 50, chance: 0.8 },
    { id: 'gold_ore', count: 10, chance: 0.5 },
  ];

  const chestContents: any[] = [];
  
  // Pick 2-4 items
  const itemsCount = Math.floor(Math.random() * 3) + 2;
  const shuffled = [...possibleLoots].sort(() => Math.random() - 0.5);
  
  for (const loot of shuffled) {
    if (chestContents.length >= itemsCount) break;
    if (Math.random() < loot.chance) {
      chestContents.push({
        itemId: loot.id,
        count: Math.floor(Math.random() * (loot.count - 1)) + 1 || 1,
      });
    }
  }

  // Guarantee at least one nice accessory if lucky
  if (chestContents.length === 0) {
    chestContents.push({ itemId: 'torch', count: 10 });
    chestContents.push({ itemId: 'lesser_healing_potion', count: 3 });
  }

  return chestContents;
}
