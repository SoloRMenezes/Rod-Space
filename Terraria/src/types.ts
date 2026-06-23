/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TileType {
  Air = 0,
  Dirt = 1,
  Stone = 2,
  Wood = 3,
  Leaves = 4,
  IronOre = 5,
  GoldOre = 6,
  Clay = 7,
  Sand = 8,
  Cactus = 9,
  Ebonstone = 10,
  CorruptedDirt = 11,
  Platform = 12,
  Torch = 13,
  Workbench = 14,
  Anvil = 15,
  Chest = 16,
  GrassDeco = 17,
  TreeTrunk = 18,
  ShadowOrb = 19,
  Brick = 20,
}

export enum ItemType {
  Tool = 'tool',
  Block = 'block',
  Wall = 'wall',
  Weapon = 'weapon',
  Armor = 'armor',
  Accessory = 'accessory',
  Consumable = 'consumable',
  Material = 'material',
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  tileType?: TileType; // If it can be placed as a tile
  wallType?: WallType; // If it can be placed as a wall
  damage?: number;
  knockback?: number;
  range?: number; // block range
  miningSpeed?: number; // tool speed multiplier (lower is faster)
  defense?: number;
  healPower?: number;
  maxStack: number;
  spriteColor: string; // fallback color
  spriteChar?: string; // symbol for retro representation or pixel art code
  isAccessory?: boolean;
}

export enum WallType {
  None = 0,
  DirtWall = 1,
  StoneWall = 2,
  WoodWall = 3,
  EbonstoneWall = 4,
}

export interface InventoryItem {
  item: Item;
  count: number;
}

export interface Tile {
  type: TileType;
  wall: WallType;
  light: number; // 0 to 1
  liquid?: number; // 0 to 8 (water)
  isLava?: boolean;
  minedProgress?: number; // 0 to 100
}

export enum EntityType {
  Player = 'player',
  NPC = 'npc',
  Slime = 'slime',
  Zombie = 'zombie',
  DemonEye = 'demon_eye',
  ServantOfCthulhu = 'servant',
  EyeOfCthulhu = 'eye_of_cthulhu',
  Projectile = 'projectile',
  DroppedItem = 'dropped_item',
  Enemy = 'enemy',
}

export interface BaseEntity {
  id: string;
  type: EntityType;
  x: number; // pixel coords
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  damage: number;
  isGrounded: boolean;
  direction: number; // -1 = left, 1 = right
  state?: any; // internal state Machine states
  stateData?: any; // secondary state storage
}

export interface Projectile extends BaseEntity {
  ownerId: string;
  gravity: boolean;
  lifeTime: number; // in ticks/frames
  color: string;
}

export interface DroppedItem extends BaseEntity {
  inventoryItem: InventoryItem;
  pickupCooldown: number;
}

export interface GameNPC extends BaseEntity {
  npcType: 'guide' | 'merchant' | 'nurse';
  dialogueIndex: number;
  talkCooldown: number;
}

export interface GameEnemy extends BaseEntity {
  enemyType: 'green_slime' | 'blue_slime' | 'red_slime' | 'zombie' | 'demon_eye' | 'servant' | 'eye_of_cthulhu';
  phase?: number;
  chargeTimer?: number;
  jumpTimer?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number; // 0 to 1
  gravity?: boolean;
}

export interface Recipe {
  id: string;
  result: InventoryItem;
  ingredients: { itemId: string; count: number }[];
  requiresStation?: TileType;
}

export interface GameWorld {
  width: number;
  height: number;
  tiles: Tile[][];
  spawnX: number;
  spawnY: number;
  timeOfDay: number; // 0 to 24000 (12000 is dusk)
  dayNumber: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  defense: number;
  speedMultiplier: number;
  jumpMultiplier: number;
  doubleJumpAvailable: boolean;
  hasDoubleJump: boolean;
  hasRegen: boolean;
  hasHermes: boolean;
}
