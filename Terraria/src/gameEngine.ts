/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Tile,
  TileType,
  WallType,
  BaseEntity,
  EntityType,
  Projectile,
  DroppedItem,
  GameNPC,
  GameEnemy,
  Particle,
  GameWorld,
  PlayerStats,
  InventoryItem,
  ItemType
} from './types';
import { ITEMS } from './data';
import { generateWorld, populateChestItems } from './worldGen';
import { audio } from './audio';

// World constants
export const TILE_SIZE = 16; // 16x16 pixel blocks
export const GRAVITY = 0.25;
export const TERMINAL_VELOCITY = 8;

export class GameEngine {
  world!: GameWorld;
  player!: BaseEntity;
  playerStats!: PlayerStats;
  inventory: (InventoryItem | null)[] = Array(40).fill(null); // 4 rows of 10 slots
  chestInventory: (InventoryItem | null)[] = Array(20).fill(null); // Open chest
  openChestPos: { x: number; y: number } | null = null;
  hotbarIndex: number = 0; // 0-9
  
  // Entity lists
  projectiles: Projectile[] = [];
  enemies: GameEnemy[] = [];
  npcs: GameNPC[] = [];
  droppedItems: DroppedItem[] = [];
  particles: Particle[] = [];
  damageNumbers: { id: string; x: number; y: number; text: string; color: string; life: number }[] = [];

  // Controls state
  keys: Record<string, boolean> = {};
  mouse: { x: number; y: number; isDown: boolean; clientX: number; clientY: number } = { x: 0, y: 0, isDown: false, clientX: 0, clientY: 0 };
  camera: { x: number; y: number } = { x: 0, y: 0 };

  // Screen/viewport
  viewportWidth: number = 800;
  viewportHeight: number = 600;

  // Timers & Combat
  invincibilityFrames: number = 0;
  useCooldown: number = 0;
  potCooldown: number = 0;
  starfuryCooldown: number = 0;
  swingProgress: number = 0; // 0 to 1
  swingDirection: number = 1;
  isMining: boolean = false;
  miningProgress: number = 0;
  minedTilePos: { x: number; y: number } | null = null;
  respawnTimer: number = 0;

  // Active boss tracking
  activeBoss: GameEnemy | null = null;

  // Chest data index (stored by coordinate string "x,y")
  chestsData: Record<string, (InventoryItem | null)[]> = {};

  // For double-jump logic
  hasJumpedInAir: boolean = false;

  constructor() {
    this.initDefaultGame();
  }

  initDefaultGame() {
    // Try loading from localStorage, otherwise generate new
    const saved = localStorage.getItem('terraria_copy_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.world = data.world;
        this.player = data.player;
        this.playerStats = data.playerStats;
        this.inventory = data.inventory;
        this.chestsData = data.chestsData || {};
        this.hotbarIndex = data.hotbarIndex || 0;
        this.initNPCs();
        this.recomputeLighting();
        this.centerCameraOnPlayer();
        return;
      } catch (e) {
        console.error("Failed to load save, starting fresh", e);
      }
    }

    this.startNewWorld(240, 100); // 240 width, 100 height
  }

  startNewWorld(w: number, h: number) {
    this.world = generateWorld(w, h);
    
    // Set up player
    this.player = {
      id: 'player_id',
      type: EntityType.Player,
      x: this.world.spawnX * TILE_SIZE,
      y: this.world.spawnY * TILE_SIZE,
      vx: 0,
      vy: 0,
      width: 14,
      height: 26,
      health: 100,
      maxHealth: 100,
      damage: 1,
      isGrounded: false,
      direction: 1,
    };

    this.playerStats = {
      health: 100,
      maxHealth: 100,
      mana: 20,
      maxMana: 20,
      defense: 0,
      speedMultiplier: 1.0,
      jumpMultiplier: 1.0,
      doubleJumpAvailable: false,
      hasDoubleJump: false,
      hasRegen: false,
      hasHermes: false,
    };

    // Populate initial items
    this.inventory = Array(40).fill(null);
    this.inventory[0] = { item: ITEMS.copper_pickaxe, count: 1 };
    this.inventory[1] = { item: ITEMS.copper_axe, count: 1 };
    this.inventory[2] = { item: ITEMS.wooden_sword, count: 1 };
    this.inventory[3] = { item: ITEMS.torch, count: 20 };
    this.inventory[4] = { item: ITEMS.wood, count: 35 };
    this.inventory[5] = { item: ITEMS.dirt_block, count: 50 };
    this.inventory[6] = { item: ITEMS.lesser_healing_potion, count: 3 };

    this.chestsData = {};
    this.projectiles = [];
    this.enemies = [];
    this.particles = [];
    this.droppedItems = [];
    this.damageNumbers = [];
    this.activeBoss = null;
    this.respawnTimer = 0;

    this.initNPCs();
    this.recomputeLighting();
    this.centerCameraOnPlayer();
    this.saveGame();
  }

  saveGame() {
    try {
      const data = {
        world: this.world,
        player: this.player,
        playerStats: this.playerStats,
        inventory: this.inventory,
        chestsData: this.chestsData,
        hotbarIndex: this.hotbarIndex,
      };
      localStorage.setItem('terraria_copy_save', JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  deleteSave() {
    localStorage.removeItem('terraria_copy_save');
    this.startNewWorld(240, 100);
  }

  initNPCs() {
    this.npcs = [];
    // Spawn Guide near player spawn
    this.npcs.push({
      id: 'guide_npc',
      type: EntityType.NPC,
      x: (this.world.spawnX + 3) * TILE_SIZE,
      y: (this.world.spawnY) * TILE_SIZE,
      vx: 0,
      vy: 0,
      width: 14,
      height: 26,
      health: 250,
      maxHealth: 250,
      damage: 10,
      isGrounded: false,
      direction: -1,
      npcType: 'guide',
      dialogueIndex: 0,
      talkCooldown: 0,
    });
  }

  centerCameraOnPlayer() {
    this.camera.x = this.player.x - this.viewportWidth / 2 + this.player.width / 2;
    this.camera.y = this.player.y - this.viewportHeight / 2 + this.player.height / 2;
    this.constrainCamera();
  }

  constrainCamera() {
    const maxX = this.world.width * TILE_SIZE - this.viewportWidth;
    const maxY = this.world.height * TILE_SIZE - this.viewportHeight;
    this.camera.x = Math.max(0, Math.min(maxX, this.camera.x));
    this.camera.y = Math.max(0, Math.min(maxY, this.camera.y));
  }

  // Update loop (runs 60 times/sec)
  tick() {
    if (this.respawnTimer > 0) {
      this.respawnTimer--;
      if (this.respawnTimer === 0) {
        this.respawnPlayer();
      }
      this.updateEntitiesOnly();
      return;
    }

    this.updatePlayerStats();
    this.handlePlayerMovement();
    this.handleControls();
    this.updateEntities();
    this.updateLightingAtCamera();
    this.spawnSpontaneousEntities();
    this.updateTimeOfDay();

    // Smoothly follow player with camera
    const targetCamX = this.player.x - this.viewportWidth / 2 + this.player.width / 2;
    const targetCamY = this.player.y - this.viewportHeight / 2 + this.player.height / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.12;
    this.camera.y += (targetCamY - this.camera.y) * 0.12;
    this.constrainCamera();

    if (this.invincibilityFrames > 0) this.invincibilityFrames--;
    if (this.useCooldown > 0) this.useCooldown--;
    if (this.potCooldown > 0) this.potCooldown--;
    if (this.starfuryCooldown > 0) this.starfuryCooldown--;
  }

  respawnPlayer() {
    this.player.x = this.world.spawnX * TILE_SIZE;
    this.player.y = (this.world.spawnY - 5) * TILE_SIZE;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.health = this.player.maxHealth;
    this.playerStats.health = this.playerStats.maxHealth;
    this.centerCameraOnPlayer();
    this.addNotification("You have respawned!", "#00FF00");
  }

  updatePlayerStats() {
    // Read accessories
    let hasRegen = false;
    let hasDoubleJump = false;
    let hasHermes = false;
    let defense = 0;

    // Check bottom 4 slots (as dedicated accessory slots for simplicity, or we check accessories in whole inventory)
    // Let's assume standard accessory search in the whole inventory to make it ultra-flexible!
    for (const invItem of this.inventory) {
      if (invItem && invItem.item.isAccessory) {
        if (invItem.item.id === 'band_of_regeneration') hasRegen = true;
        if (invItem.item.id === 'cloud_in_a_bottle') hasDoubleJump = true;
        if (invItem.item.id === 'hermes_boots') hasHermes = true;
      }
    }

    this.playerStats.hasRegen = hasRegen;
    this.playerStats.hasDoubleJump = hasDoubleJump;
    this.playerStats.hasHermes = hasHermes;
    this.playerStats.defense = defense;

    // Health Regen passive (1 HP / sec if regen band)
    if (hasRegen && Math.random() < 0.016) { // ~1 per 60 frames
      if (this.player.health < this.player.maxHealth) {
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
        this.playerStats.health = this.player.health;
      }
    }
  }

  handlePlayerMovement() {
    const activeItem = this.inventory[this.hotbarIndex]?.item;
    let speed = 2.5;
    if (this.playerStats.hasHermes) {
      // Accelerate if moving
      if (this.keys['KeyA'] || this.keys['KeyD'] || this.keys['ArrowLeft'] || this.keys['ArrowRight']) {
        speed = 4.2; // Hermes speed boost!
        if (this.player.isGrounded && Math.random() < 0.15) {
          // Spawn cloud sprint particles
          this.spawnParticle(this.player.x + this.player.width / 2, this.player.y + this.player.height, '#E0E0E0', 3, 10, true);
        }
      }
    }

    // Horizontal Movement
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.player.vx = -speed;
      this.player.direction = -1;
    } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.player.vx = speed;
      this.player.direction = 1;
    } else {
      this.player.vx *= 0.7; // Friction slide
      if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
    }

    // Vertical Jump
    if (this.keys['Space'] || this.keys['KeyW'] || this.keys['ArrowUp']) {
      if (this.player.isGrounded) {
        this.player.vy = -5.8;
        this.player.isGrounded = false;
        this.hasJumpedInAir = false;
        audio.playSfx('jump');
      } else if (this.playerStats.hasDoubleJump && !this.hasJumpedInAir && !this.keys.prevJump) {
        // Double jump!
        this.player.vy = -5.2;
        this.hasJumpedInAir = true;
        audio.playSfx('jump');
        // Double jump burst particles
        for (let i = 0; i < 12; i++) {
          this.spawnParticle(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height,
            '#FFFFFF',
            Math.random() * 4 + 2,
            15,
            false
          );
        }
      }
      this.keys.prevJump = true;
    } else {
      this.keys.prevJump = false;
    }

    // Drop through platform
    if (this.keys['KeyS'] || this.keys['ArrowDown']) {
      // Just flag that we want to drop through. We handle this inside solid collision checks!
    }

    // Gravity
    this.player.vy += GRAVITY;
    if (this.player.vy > TERMINAL_VELOCITY) this.player.vy = TERMINAL_VELOCITY;

    // Apply Physics & Collisions
    this.moveAndResolveCollisions(this.player);
  }

  moveAndResolveCollisions(entity: BaseEntity) {
    const isDroppingThrough = entity.type === EntityType.Player && (this.keys['KeyS'] || this.keys['ArrowDown']);

    // 1. Move X first
    entity.x += entity.vx;
    this.resolveTileCollisionsX(entity);

    // 2. Move Y second
    entity.y += entity.vy;
    entity.isGrounded = false;
    this.resolveTileCollisionsY(entity, isDroppingThrough);
  }

  resolveTileCollisionsX(entity: BaseEntity) {
    const bounds = this.getEntityTileBounds(entity);

    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (this.isTileSolid(x, y)) {
          // Check collision overlap
          if (this.checkAABBOverlap(entity, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)) {
            // Push out of solid tile
            if (entity.vx > 0) {
              entity.x = x * TILE_SIZE - entity.width;
              entity.vx = 0;
            } else if (entity.vx < 0) {
              entity.x = x * TILE_SIZE + TILE_SIZE;
              entity.vx = 0;
            }
          }
        }
      }
    }
  }

  resolveTileCollisionsY(entity: BaseEntity, isDroppingThrough: boolean) {
    const bounds = this.getEntityTileBounds(entity);

    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        const tile = this.getTile(x, y);
        if (!tile) continue;

        const isSolid = tile.type !== TileType.Air && tile.type !== TileType.Torch && tile.type !== TileType.GrassDeco && tile.type !== TileType.ShadowOrb;
        const isPlatform = tile.type === TileType.Platform;

        if (isSolid) {
          // Normal solid tile AABB check
          if (isPlatform) {
            // Platforms only collide from the top when player is moving down
            if (entity.vy >= 0 && !isDroppingThrough) {
              const footY = entity.y + entity.height;
              const prevFootY = footY - entity.vy;
              const platformTopY = y * TILE_SIZE;

              if (prevFootY <= platformTopY + 1.1 && footY >= platformTopY) {
                // Stand on platform
                if (this.checkAABBOverlap(entity, x * TILE_SIZE, platformTopY, TILE_SIZE, TILE_SIZE)) {
                  entity.y = platformTopY - entity.height;
                  entity.vy = 0;
                  entity.isGrounded = true;
                }
              }
            }
          } else {
            // Standard solid block
            if (this.checkAABBOverlap(entity, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)) {
              if (entity.vy > 0) {
                entity.y = y * TILE_SIZE - entity.height;
                entity.vy = 0;
                entity.isGrounded = true;
              } else if (entity.vy < 0) {
                entity.y = y * TILE_SIZE + TILE_SIZE;
                entity.vy = 0;
              }
            }
          }
        }
      }
    }
  }

  isTileSolid(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile) return true; // world bounds are solid
    if (tile.type === TileType.Air || tile.type === TileType.Torch || tile.type === TileType.GrassDeco || tile.type === TileType.Platform || tile.type === TileType.ShadowOrb) {
      return false;
    }
    return true;
  }

  getTile(x: number, y: number): Tile | null {
    if (x < 0 || x >= this.world.width || y < 0 || y >= this.world.height) {
      return null;
    }
    return this.world.tiles[x][y];
  }

  getEntityTileBounds(entity: BaseEntity) {
    return {
      minX: Math.floor(entity.x / TILE_SIZE),
      maxX: Math.floor((entity.x + entity.width) / TILE_SIZE),
      minY: Math.floor(entity.y / TILE_SIZE),
      maxY: Math.floor((entity.y + entity.height) / TILE_SIZE),
    };
  }

  checkAABBOverlap(e: BaseEntity, x: number, y: number, w: number, h: number): boolean {
    return (
      e.x < x + w &&
      e.x + e.width > x &&
      e.y < y + h &&
      e.y + e.height > y
    );
  }

  // Handle building, mining, attacking, and accessories usage
  handleControls() {
    if (this.useCooldown > 0) return;

    const activeItemSlot = this.inventory[this.hotbarIndex];
    if (!activeItemSlot) {
      this.isMining = false;
      return;
    }

    const item = activeItemSlot.item;

    if (this.mouse.isDown) {
      // 1. Calculate tile coords from mouse screen position plus camera
      const worldMouseX = this.mouse.x + this.camera.x;
      const worldMouseY = this.mouse.y + this.camera.y;
      const tx = Math.floor(worldMouseX / TILE_SIZE);
      const ty = Math.floor(worldMouseY / TILE_SIZE);

      const dx = (this.player.x + this.player.width / 2) - worldMouseX;
      const dy = (this.player.y + this.player.height / 2) - worldMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check range limit
      const range = (item.range || 4) * TILE_SIZE;

      if (dist <= range && tx >= 0 && tx < this.world.width && ty >= 0 && ty < this.world.height) {
        
        // --- MINING / TOOL ACTION ---
        if (item.id.includes('pickaxe') || item.id.includes('axe')) {
          const tile = this.world.tiles[tx][ty];
          if (tile.type !== TileType.Air) {
            // Trigger swing animation direction towards click
            this.swingDirection = worldMouseX < this.player.x + this.player.width / 2 ? -1 : 1;
            this.triggerSwingAnimation();

            if (this.minedTilePos?.x !== tx || this.minedTilePos?.y !== ty) {
              this.minedTilePos = { x: tx, y: ty };
              this.miningProgress = 0;
            }

            // Mining strength
            let damage = 15; // default base block-dmg
            if (item.id === 'gold_pickaxe') damage = 28;
            if (item.id === 'platinum_pickaxe') damage = 42;

            // Ebonstone hardness check
            if (tile.type === TileType.Ebonstone && item.id === 'copper_pickaxe') {
              damage = 3; // Copper pickaxe is terrible on Ebonstone! Needs gold+
            }

            this.miningProgress += damage * (1 / (item.miningSpeed || 1.0));
            tile.minedProgress = Math.min(100, this.miningProgress);

            // Spawn mining dust particles
            if (Math.random() < 0.3) {
              this.spawnParticle(tx * TILE_SIZE + 8, ty * TILE_SIZE + 8, this.getTileColor(tile.type), 2.5, 12, true);
            }

            if (this.miningProgress >= 100) {
              this.mineTile(tx, ty);
              this.minedTilePos = null;
              this.miningProgress = 0;
            }

            this.useCooldown = Math.floor(10 * (item.miningSpeed || 1.0));
            this.isMining = true;
          } else {
            this.isMining = false;
          }
        }

        // --- ATTACKING / MELEE SWORD ---
        else if (item.type === 'weapon' && item.id.includes('sword')) {
          this.swingDirection = worldMouseX < this.player.x + this.player.width / 2 ? -1 : 1;
          this.player.direction = this.swingDirection;
          this.triggerSwingAnimation();
          audio.playSfx('swing');

          // Melee check against enemies inside swing arc
          this.performMeleeAttack(item);

          this.useCooldown = 15; // Swing rate
        }

        // --- SHOOTING BOW ---
        else if (item.id === 'wooden_bow') {
          // Check arrows
          const arrowIndex = this.inventory.findIndex(slot => slot && slot.item.id === 'wooden_arrow');
          if (arrowIndex !== -1) {
            // Consume arrow
            this.inventory[arrowIndex]!.count--;
            if (this.inventory[arrowIndex]!.count <= 0) {
              this.inventory[arrowIndex] = null;
            }

            // Shoot!
            audio.playSfx('shoot');
            this.shootProjectile(worldMouseX, worldMouseY, item.damage || 10);
            this.useCooldown = 22;
          } else {
            this.addNotification("No Wooden Arrows left in inventory!", "#FF3333");
            this.useCooldown = 30;
          }
        }

        // --- STARFURY WEAPON ACTION ---
        else if (item.id === 'starfury') {
          if (this.starfuryCooldown === 0) {
            this.swingDirection = worldMouseX < this.player.x + this.player.width / 2 ? -1 : 1;
            this.triggerSwingAnimation();
            audio.playSfx('swing');

            // Summon star from top above mouse click
            const starX = worldMouseX - 100 + Math.random() * 50;
            const starY = this.camera.y - 40;
            const angle = Math.atan2(worldMouseY - starY, worldMouseX - starX);
            const speed = 7.5;

            this.projectiles.push({
              id: 'star_' + Math.random(),
              type: EntityType.Projectile,
              x: starX,
              y: starY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              width: 10,
              height: 10,
              health: 1,
              maxHealth: 1,
              damage: item.damage || 22,
              isGrounded: false,
              direction: 1,
              ownerId: 'player_id',
              gravity: false,
              lifeTime: 120,
              color: '#FFFF00',
              state: 'star',
            } as any);

            this.starfuryCooldown = 35;
            this.useCooldown = 15;
          }
        }

        // --- PLACING BLOCKS OR WALLS ---
        else if (item.tileType !== undefined || item.wallType !== undefined) {
          const tile = this.world.tiles[tx][ty];

          if (item.tileType !== undefined) {
            // Place block
            // Needs to be adjacent to a solid tile or wall, or within background wall to avoid floating tiles
            if (tile.type === TileType.Air) {
              let canPlace = this.hasNeighborBlock(tx, ty) || tile.wall !== WallType.None;
              
              // Prevent placing on player or npcs
              const blockRect = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
              const overlapsPlayer = this.checkAABBOverlap(this.player, blockRect.x, blockRect.y, blockRect.width, blockRect.height);
              
              if (overlapsPlayer && item.tileType !== TileType.Platform && item.tileType !== TileType.Torch && item.tileType !== TileType.GrassDeco) {
                canPlace = false;
              }

              if (canPlace) {
                tile.type = item.tileType;
                tile.minedProgress = 0;
                audio.playSfx('place');

                // If chest, initialize empty inventory for it
                if (item.tileType === TileType.Chest) {
                  const key = `${tx},${ty}`;
                  this.chestsData[key] = Array(20).fill(null);
                }

                // Consume item
                activeItemSlot.count--;
                if (activeItemSlot.count <= 0) {
                  this.inventory[this.hotbarIndex] = null;
                }

                this.useCooldown = 12;
                this.recomputeLightingAround(tx, ty, 15);
              }
            }
          } else if (item.wallType !== undefined) {
            // Place background wall
            if (tile.wall === WallType.None && (tile.type !== TileType.Air || this.hasNeighborBlock(tx, ty) || this.hasNeighborWall(tx, ty))) {
              tile.wall = item.wallType;
              audio.playSfx('place');

              activeItemSlot.count--;
              if (activeItemSlot.count <= 0) {
                this.inventory[this.hotbarIndex] = null;
              }

              this.useCooldown = 10;
              this.recomputeLightingAround(tx, ty, 15);
            }
          }
        }

        // --- CONSUMING POTIONS / FOOD ---
        else if (item.type === ItemType.Consumable) {
          if (item.id === 'suspicious_looking_eye') {
            // Can only summon Boss at night! Night is timeOfDay between 12000 and 24000
            if (this.world.timeOfDay >= 12000 && this.world.timeOfDay < 23500) {
              if (this.activeBoss) {
                this.addNotification("Eye of Cthulhu has already been summoned!", "#FF3333");
              } else {
                this.summonEyeOfCthulhu();
                activeItemSlot.count--;
                if (activeItemSlot.count <= 0) {
                  this.inventory[this.hotbarIndex] = null;
                }
                this.useCooldown = 60;
              }
            } else {
              this.addNotification("Can only be used at night!", "#FF5555");
            }
          } else if (item.healPower) {
            if (this.potCooldown === 0) {
              const healed = Math.min(this.player.maxHealth - this.player.health, item.healPower);
              if (healed > 0) {
                this.player.health += healed;
                this.playerStats.health = this.player.health;
                this.spawnDamageNumber(this.player.x + this.player.width / 2, this.player.y, `+${healed}`, '#00FF00');
                audio.playSfx('coin'); // potion chug
                
                // Spawn healing sparkles
                for (let i = 0; i < 15; i++) {
                  this.spawnParticle(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#32CD32', 3, 20, false);
                }

                activeItemSlot.count--;
                if (activeItemSlot.count <= 0) {
                  this.inventory[this.hotbarIndex] = null;
                }

                // Add potion sickness cooldown (15 seconds = 900 frames)
                this.potCooldown = 900;
                this.useCooldown = 20;
              } else {
                this.addNotification("Health is already full!", "#FFFFFF");
              }
            } else {
              this.addNotification(`Potion sickness! Wait ${Math.ceil(this.potCooldown / 60)}s`, "#FF3333");
            }
          }
        }
      }
    } else {
      this.isMining = false;
    }
  }

  hasNeighborBlock(tx: number, ty: number): boolean {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of dirs) {
      const neighbor = this.getTile(tx + dx, ty + dy);
      if (neighbor && neighbor.type !== TileType.Air) return true;
    }
    return false;
  }

  hasNeighborWall(tx: number, ty: number): boolean {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of dirs) {
      const neighbor = this.getTile(tx + dx, ty + dy);
      if (neighbor && neighbor.wall !== WallType.None) return true;
    }
    return false;
  }

  mineTile(tx: number, ty: number) {
    const tile = this.world.tiles[tx][ty];
    if (tile.type === TileType.Air) return;

    // Determine drop item
    let dropItemId: string | null = null;
    let chestItemsToScatter: any[] = [];

    switch (tile.type) {
      case TileType.Dirt:
        dropItemId = 'dirt_block';
        break;
      case TileType.Stone:
        dropItemId = 'stone_block';
        break;
      case TileType.Wood:
        dropItemId = 'wood_block';
        break;
      case TileType.Sand:
        dropItemId = 'sand_block';
        break;
      case TileType.Clay:
        dropItemId = 'clay_block';
        break;
      case TileType.Brick:
        dropItemId = 'brick_block';
        break;
      case TileType.Ebonstone:
        dropItemId = 'ebonstone_block';
        break;
      case TileType.Platform:
        dropItemId = 'wood_platform';
        break;
      case TileType.Torch:
        dropItemId = 'torch';
        break;
      case TileType.Workbench:
        dropItemId = 'workbench';
        break;
      case TileType.Anvil:
        dropItemId = 'anvil';
        break;
      case TileType.TreeTrunk:
        dropItemId = 'wood';
        break;
      case TileType.Leaves:
        // Leaves drop saplings or gel, or nothing
        if (Math.random() < 0.15) dropItemId = 'wood';
        break;
      case TileType.Cactus:
        dropItemId = 'wood'; // Cacti drops raw wood
        break;
      case TileType.GrassDeco:
        if (Math.random() < 0.3) dropItemId = 'mushroom';
        break;
      case TileType.Chest:
        dropItemId = 'chest';
        // Scatter chest contents if any
        const key = `${tx},${ty}`;
        const chestInventory = this.chestsData[key];
        if (chestInventory) {
          chestInventory.forEach(slot => {
            if (slot) chestItemsToScatter.push(slot);
          });
          delete this.chestsData[key];
        }
        if (this.openChestPos?.x === tx && this.openChestPos?.y === ty) {
          this.openChestPos = null;
        }
        break;
      case TileType.ShadowOrb:
        dropItemId = 'lens';
        // Spawn lens and roll boss spawn warning!
        this.addNotification("A shiver runs down your spine...", "#B026FF");
        this.spawnEnemy('demon_eye', tx * TILE_SIZE, ty * TILE_SIZE);
        break;
    }

    tile.type = TileType.Air;
    tile.minedProgress = 0;
    audio.playSfx('dig');

    // Spawn block broken particles
    const color = this.getTileColor(dropItemId ? ITEMS[dropItemId]?.tileType || TileType.Dirt : TileType.Dirt);
    for (let i = 0; i < 8; i++) {
      this.spawnParticle(tx * TILE_SIZE + 8, ty * TILE_SIZE + 8, color, 3, 12, true);
    }

    // Spawn dropped loot entity
    if (dropItemId) {
      this.spawnDroppedItem(dropItemId, 1, tx * TILE_SIZE + 4, ty * TILE_SIZE + 4);
    }

    // Scatter any contained items
    chestItemsToScatter.forEach(slot => {
      this.spawnDroppedItem(slot.item.id, slot.count, tx * TILE_SIZE + Math.random() * 8, ty * TILE_SIZE - 4);
    });

    // Recompute lighting
    this.recomputeLightingAround(tx, ty, 15);
  }

  spawnDroppedItem(itemId: string, count: number, x: number, y: number) {
    const item = ITEMS[itemId];
    if (!item) return;

    this.droppedItems.push({
      id: 'drop_' + Math.random(),
      type: EntityType.DroppedItem,
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: -3 - Math.random() * 2,
      width: 10,
      height: 10,
      health: 1,
      maxHealth: 1,
      damage: 0,
      isGrounded: false,
      direction: 1,
      inventoryItem: { item, count },
      pickupCooldown: 40, // frames until player can grab
    });
  }

  performMeleeAttack(swordItem: any) {
    // Attack box extends in front of player
    const reach = (swordItem.range || 3) * TILE_SIZE;
    const pxCenter = this.player.x + this.player.width / 2;
    const pyCenter = this.player.y + this.player.height / 2;

    const attackBox = {
      x: this.swingDirection === 1 ? pxCenter : pxCenter - reach,
      y: pyCenter - reach / 1.5,
      width: reach,
      height: reach * 1.3,
    };

    // Spawn swish sparkles
    for (let i = 0; i < 4; i++) {
      this.spawnParticle(
        pxCenter + this.swingDirection * (reach * 0.6) + (Math.random() - 0.5) * 10,
        pyCenter + (Math.random() - 0.5) * 15,
        swordItem.spriteColor,
        2.5,
        15,
        false
      );
    }

    // Check overlap with enemies
    this.enemies.forEach(enemy => {
      if (enemy.health <= 0) return;

      const overlap = (
        enemy.x < attackBox.x + attackBox.width &&
        enemy.x + enemy.width > attackBox.x &&
        enemy.y < attackBox.y + attackBox.height &&
        enemy.y + enemy.height > attackBox.y
      );

      if (overlap) {
        this.hurtEnemy(enemy, swordItem.damage || 5, swordItem.knockback || 4);
      }
    });

    // Guide NPC can also be talked to via clicking near them
    const guide = this.npcs.find(n => n.npcType === 'guide');
    if (guide) {
      const dist = Math.abs((this.player.x + this.player.width / 2) - (guide.x + guide.width / 2));
      if (dist < 50) {
        // Simple chat trigger from clicking
      }
    }
  }

  hurtEnemy(enemy: GameEnemy, dmg: number, knockback: number) {
    // Enemy gets hurt
    const actualDmg = Math.max(1, Math.floor(dmg * (0.9 + Math.random() * 0.2)));
    enemy.health -= actualDmg;

    // Spawn floating damage numbers
    this.spawnDamageNumber(enemy.x + enemy.width / 2, enemy.y, actualDmg.toString(), '#FFFFFF');
    audio.playSfx('hurtEnemy');

    // Apply knockback
    const kbDir = (enemy.x + enemy.width / 2) < (this.player.x + this.player.width / 2) ? -1 : 1;
    enemy.vx = kbDir * knockback * 0.8;
    enemy.vy = -1.5 - Math.random() * 1.5;

    // Hurt particles
    for (let i = 0; i < 6; i++) {
      this.spawnParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#FF0000', 3, 10, true);
    }

    // Handle Enemy Death
    if (enemy.health <= 0) {
      this.killEnemy(enemy);
    }
  }

  killEnemy(enemy: GameEnemy) {
    // Drops
    let lootId: string | null = null;
    let count = 1;

    if (enemy.enemyType.includes('slime')) {
      lootId = 'gel';
      count = Math.floor(Math.random() * 3) + 1;
    } else if (enemy.enemyType === 'zombie') {
      if (Math.random() < 0.2) lootId = 'dirt_block';
      if (Math.random() < 0.05) lootId = 'hermes_boots'; // rare chance to find boots if unlucky in chests!
    } else if (enemy.enemyType === 'demon_eye') {
      lootId = 'lens';
      if (Math.random() < 0.35) count = 2;
    } else if (enemy.enemyType === 'eye_of_cthulhu') {
      // BOSS DEATH DROP!
      lootId = 'gold_bar';
      count = 8;
      this.spawnDroppedItem('lens', 4, enemy.x, enemy.y);
      this.spawnDroppedItem('lesser_healing_potion', 5, enemy.x + 10, enemy.y);
      this.spawnDroppedItem('wooden_arrow', 60, enemy.x - 10, enemy.y);
      this.spawnDroppedItem('band_of_regeneration', 1, enemy.x, enemy.y + 10);

      this.activeBoss = null;
      this.addNotification("Eye of Cthulhu has been defeated!", "#00FF00");
    }

    if (lootId) {
      this.spawnDroppedItem(lootId, count, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    }

    // Spawn massive death explosion particles
    for (let i = 0; i < 18; i++) {
      this.spawnParticle(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        enemy.enemyType === 'eye_of_cthulhu' ? '#FF5555' : '#777777',
        Math.random() * 4 + 2,
        25,
        true
      );
    }
  }

  shootProjectile(worldTargetX: number, worldTargetY: number, damage: number) {
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;
    
    const angle = Math.atan2(worldTargetY - py, worldTargetX - px);
    const speed = 6.2;

    this.projectiles.push({
      id: 'arrow_' + Math.random(),
      type: EntityType.Projectile,
      x: px,
      y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: 6,
      height: 6,
      health: 1,
      maxHealth: 1,
      damage,
      isGrounded: false,
      direction: worldTargetX < px ? -1 : 1,
      ownerId: 'player_id',
      gravity: true, // Arrows fall over distance!
      lifeTime: 300,
      color: '#A0522D',
    });
  }

  summonEyeOfCthulhu() {
    this.addNotification("Eye of Cthulhu is approaching...", "#FF0000");
    audio.playSfx('bossSpawn');

    // Spawn high above player
    const bx = this.player.x;
    const by = this.player.y - 200;

    const boss: GameEnemy = {
      id: 'eye_of_cthulhu_boss',
      type: EntityType.Enemy,
      x: bx,
      y: by,
      vx: 0,
      vy: 0,
      width: 48,
      height: 48,
      health: 2800,
      maxHealth: 2800,
      damage: 18,
      isGrounded: false,
      direction: 1,
      enemyType: 'eye_of_cthulhu',
      phase: 1,
      chargeTimer: 0,
      jumpTimer: 0,
      state: 'hovering', // hovering, spinning, charging
    };

    this.enemies.push(boss);
    this.activeBoss = boss;
    audio.setTrack('boss');
  }

  updateEntities() {
    // 1. Update projectles
    this.projectiles = this.projectiles.filter(proj => {
      if (proj.gravity) {
        proj.vy += GRAVITY * 0.4;
      }
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.lifeTime--;

      // Check collision with solid tiles
      const tx = Math.floor((proj.x + proj.width / 2) / TILE_SIZE);
      const ty = Math.floor((proj.y + proj.height / 2) / TILE_SIZE);
      
      if (this.isTileSolid(tx, ty)) {
        // Hit wall! Sparkle and destroy
        for (let i = 0; i < 4; i++) {
          this.spawnParticle(proj.x, proj.y, proj.color, 2, 8, true);
        }
        return false;
      }

      // Check overlap with enemies
      let hit = false;
      this.enemies.forEach(enemy => {
        if (enemy.health > 0 && this.checkAABBOverlap(enemy as any, proj.x, proj.y, proj.width, proj.height)) {
          this.hurtEnemy(enemy, proj.damage, 2);
          hit = true;
        }
      });

      if (hit) return false;

      return proj.lifeTime > 0;
    });

    // 2. Update NPCs
    this.npcs.forEach(npc => {
      // NPC Gravity
      npc.vy += GRAVITY;
      if (npc.vy > TERMINAL_VELOCITY) npc.vy = TERMINAL_VELOCITY;

      // Simple pacing AI for Guide
      if (npc.npcType === 'guide') {
        if (npc.isGrounded && Math.random() < 0.005) {
          npc.vx = (Math.random() - 0.5) * 1.5;
          npc.direction = npc.vx < 0 ? -1 : 1;
        }
        // Jump over minor obstacles
        const frontX = Math.floor((npc.x + (npc.direction * 8)) / TILE_SIZE);
        const feetY = Math.floor((npc.y + npc.height) / TILE_SIZE);
        if (npc.isGrounded && this.isTileSolid(frontX, feetY - 1)) {
          npc.vy = -4.5;
        }
      }

      this.moveAndResolveCollisions(npc);
    });

    // 3. Update Enemies
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.health <= 0) return false;

      // Distance to player
      const dx = (this.player.x + this.player.width / 2) - (enemy.x + enemy.width / 2);
      const dy = (this.player.y + this.player.height / 2) - (enemy.y + enemy.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Despawn boss if player is dead and too far
      if (enemy.enemyType === 'eye_of_cthulhu' && this.respawnTimer > 0 && dist > 1000) {
        this.activeBoss = null;
        this.addNotification("Eye of Cthulhu fled into the night skies...", "#FF5555");
        return false;
      }

      // --- GREEN/BLUE/RED SLIME AI ---
      if (enemy.enemyType.includes('slime')) {
        enemy.vy += GRAVITY;
        if (enemy.vy > TERMINAL_VELOCITY) enemy.vy = TERMINAL_VELOCITY;

        enemy.jumpTimer = (enemy.jumpTimer || 0) + 1;
        if (enemy.isGrounded && enemy.jumpTimer > 100 + Math.random() * 50 && dist < 350) {
          // Bounce towards player
          enemy.vy = -3.8 - Math.random() * 1.5;
          enemy.vx = (dx > 0 ? 1 : -1) * (1.8 + Math.random() * 1.0);
          enemy.isGrounded = false;
          enemy.jumpTimer = 0;
        }

        // Apply friction when grounded
        if (enemy.isGrounded) {
          enemy.vx *= 0.8;
          if (Math.abs(enemy.vx) < 0.1) enemy.vx = 0;
        }

        this.moveAndResolveCollisions(enemy);
      }

      // --- ZOMBIE AI ---
      else if (enemy.enemyType === 'zombie') {
        enemy.vy += GRAVITY;
        if (enemy.vy > TERMINAL_VELOCITY) enemy.vy = TERMINAL_VELOCITY;

        if (dist < 400) {
          enemy.vx = (dx > 0 ? 1 : -1) * 0.9;
          enemy.direction = dx > 0 ? 1 : -1;

          // Jump over obstacle
          const nextTileX = Math.floor((enemy.x + (enemy.direction * 10)) / TILE_SIZE);
          const headY = Math.floor((enemy.y + 4) / TILE_SIZE);
          if (enemy.isGrounded && this.isTileSolid(nextTileX, headY)) {
            enemy.vy = -4.2;
          }
        } else {
          enemy.vx *= 0.9;
        }

        this.moveAndResolveCollisions(enemy);
      }

      // --- DEMON EYE AI (FLYING) ---
      else if (enemy.enemyType === 'demon_eye' || enemy.enemyType === 'servant') {
        // Smooth flying towards player
        const speed = enemy.enemyType === 'servant' ? 1.6 : 1.2;
        const angle = Math.atan2(dy, dx);
        
        // Float drift
        enemy.vx += (Math.cos(angle) * speed - enemy.vx) * 0.05;
        enemy.vy += (Math.sin(angle) * speed - enemy.vy) * 0.05;

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
      }

      // --- EYE OF CTHULHU BOSS AI ---
      else if (enemy.enemyType === 'eye_of_cthulhu') {
        enemy.chargeTimer = (enemy.chargeTimer || 0) + 1;

        // BOSS PHASE TRANSITION (Health < 50%)
        if (enemy.phase === 1 && enemy.health < enemy.maxHealth / 2) {
          enemy.phase = 2;
          enemy.damage = 26; // Rage!
          enemy.state = 'transition';
          enemy.chargeTimer = 0;
          audio.playSfx('bossScream');
          this.addNotification("Eye of Cthulhu has entered Phase 2!", "#FF3333");
        }

        if (enemy.state === 'transition') {
          // Spin and do glowing rage transitions
          enemy.vx *= 0.9;
          enemy.vy *= 0.9;
          if (enemy.chargeTimer > 120) {
            enemy.state = 'hovering';
            enemy.chargeTimer = 0;
          }
          // Sparkle rings
          const rad = (enemy.chargeTimer * 0.3);
          this.spawnParticle(enemy.x + 24, enemy.y + 24, '#FF0000', 3, 10, false);
        }

        // --- PHASE 1 STATE MACHINE ---
        else if (enemy.phase === 1) {
          if (enemy.state === 'hovering') {
            // Hover above player
            const targetX = this.player.x - 24;
            const targetY = this.player.y - 120 + Math.sin(enemy.chargeTimer * 0.05) * 20;

            enemy.vx += (targetX - enemy.x) * 0.02;
            enemy.vy += (targetY - enemy.y) * 0.02;

            // Cap speeds
            enemy.vx = Math.max(-4, Math.min(4, enemy.vx));
            enemy.vy = Math.max(-4, Math.min(4, enemy.vy));

            // Periodically spawn Servant of Cthulhu
            if (enemy.chargeTimer > 180 && Math.random() < 0.1) {
              this.spawnEnemy('servant', enemy.x + 16, enemy.y + 30);
              enemy.chargeTimer = 0;
              // Spawn sound
              audio.playSfx('shoot');
            }

            // Enter charge cycle after 350 frames
            if (enemy.chargeTimer > 320) {
              enemy.state = 'charging';
              enemy.chargeTimer = 0;
              // Aim directly at player
              const angle = Math.atan2(dy, dx);
              enemy.vx = Math.cos(angle) * 7.5;
              enemy.vy = Math.sin(angle) * 7.5;
              audio.playSfx('bossScream');
            }
          } 
          else if (enemy.state === 'charging') {
            // Fast charges
            if (enemy.chargeTimer > 40) {
              // Finish first charge, maybe do another or go back to hover
              enemy.state = 'hovering';
              enemy.chargeTimer = 0;
            }
          }
        }

        // --- PHASE 2 STATE MACHINE ---
        else if (enemy.phase === 2) {
          if (enemy.state === 'hovering') {
            // Hovers much closer and faster, roaring
            const targetX = this.player.x - 24;
            const targetY = this.player.y - 80 + Math.sin(enemy.chargeTimer * 0.1) * 15;

            enemy.vx += (targetX - enemy.x) * 0.04;
            enemy.vy += (targetY - enemy.y) * 0.04;

            if (enemy.chargeTimer > 140) {
              enemy.state = 'charging';
              enemy.chargeTimer = 0;
              // Furious fast charge!
              const angle = Math.atan2(dy, dx);
              enemy.vx = Math.cos(angle) * 11.5;
              enemy.vy = Math.sin(angle) * 11.5;
              audio.playSfx('bossScream');
            }
          } 
          else if (enemy.state === 'charging') {
            // Rapid multiple charge bursts
            if (enemy.chargeTimer > 30) {
              // 3 rapid charges
              const chargesCount = enemy.stateData || 0;
              if (chargesCount < 2) {
                enemy.stateData = chargesCount + 1;
                enemy.chargeTimer = 0;
                // Re-aim charge
                const angle = Math.atan2(dy, dx);
                enemy.vx = Math.cos(angle) * 11.0;
                enemy.vy = Math.sin(angle) * 11.0;
                audio.playSfx('bossScream');
              } else {
                enemy.stateData = 0;
                enemy.state = 'hovering';
                enemy.chargeTimer = 0;
              }
            }
          }
        }

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
      }

      // Check combat overlap with player
      if (this.invincibilityFrames === 0 && this.respawnTimer === 0) {
        if (this.checkAABBOverlap(this.player, enemy.x, enemy.y, enemy.width, enemy.height)) {
          this.hurtPlayer(enemy.damage);
        }
      }

      return true;
    });

    // 4. Update Dropped items (loot attraction vacuum)
    this.droppedItems = this.droppedItems.filter(drop => {
      // Apply short gravity
      drop.vy += GRAVITY * 0.5;
      if (drop.vy > TERMINAL_VELOCITY * 0.5) drop.vy = TERMINAL_VELOCITY * 0.5;

      drop.x += drop.vx;
      drop.y += drop.vy;
      drop.vx *= 0.9; // air friction

      this.resolveTileCollisionsY(drop, false);
      this.resolveTileCollisionsX(drop);

      if (drop.pickupCooldown > 0) drop.pickupCooldown--;

      // Distance check to player
      const dx = (this.player.x + this.player.width / 2) - (drop.x + 5);
      const dy = (this.player.y + this.player.height / 2) - (drop.y + 5);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 60 && drop.pickupCooldown === 0) {
        // Vacuum pull!
        const angle = Math.atan2(dy, dx);
        drop.vx = Math.cos(angle) * 4.5;
        drop.vy = Math.sin(angle) * 4.5;
      }

      if (dist < 15 && drop.pickupCooldown === 0) {
        // Add to inventory
        const added = this.addToInventory(drop.inventoryItem);
        if (added) {
          audio.playSfx('coin');
          return false;
        }
      }

      return true;
    });

    // 5. Particles
    this.particles = this.particles.filter(p => {
      if (p.gravity) {
        p.vy += GRAVITY * 0.2;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02; // lifespan decrease
      return p.life > 0;
    });

    // 6. Damage numbers popup
    this.damageNumbers = this.damageNumbers.filter(dn => {
      dn.y -= 0.5; // Float up
      dn.life -= 0.025;
      return dn.life > 0;
    });
  }

  updateEntitiesOnly() {
    // Used when player is dead, keep updating elements so they don't lock
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.02; return p.life > 0;
    });
    this.damageNumbers = this.damageNumbers.filter(dn => {
      dn.y -= 0.5; dn.life -= 0.025; return dn.life > 0;
    });
  }

  hurtPlayer(dmg: number) {
    // Damage after defense calculation
    const actualDmg = Math.max(1, Math.floor(dmg - this.playerStats.defense * 0.5));
    this.player.health -= actualDmg;
    this.playerStats.health = this.player.health;

    this.invincibilityFrames = 45; // 0.75 seconds i-frames
    audio.playSfx('hit');

    // Spawn red damage number floating up
    this.spawnDamageNumber(
      this.player.x + this.player.width / 2,
      this.player.y - 10,
      actualDmg.toString(),
      '#FF3333'
    );

    // Hurt particles
    for (let i = 0; i < 10; i++) {
      this.spawnParticle(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        '#FF0000',
        3,
        15,
        true
      );
    }

    if (this.player.health <= 0) {
      this.player.health = 0;
      this.playerStats.health = 0;
      this.respawnTimer = 180; // 3 seconds until respawn
      this.addNotification("You were slain...", "#FF1111");

      // Drop coins or items? We keep inventory but notify of defeat!
    }
  }

  addToInventory(invItem: InventoryItem): boolean {
    const item = invItem.item;
    let remaining = invItem.count;

    // 1. Try filling existing stacks first
    for (let i = 0; i < 40; i++) {
      const slot = this.inventory[i];
      if (slot && slot.item.id === item.id) {
        const capacity = item.maxStack - slot.count;
        if (capacity > 0) {
          const add = Math.min(remaining, capacity);
          slot.count += add;
          remaining -= add;
          if (remaining <= 0) return true;
        }
      }
    }

    // 2. Find empty slots
    for (let i = 0; i < 40; i++) {
      if (this.inventory[i] === null) {
        this.inventory[i] = { item, count: remaining };
        return true;
      }
    }

    this.addNotification("Inventory is full!", "#FF3333");
    return false;
  }

  // Web Audio/Visual indicators
  spawnDamageNumber(x: number, y: number, text: string, color: string) {
    this.damageNumbers.push({
      id: 'dmg_' + Math.random(),
      x,
      y,
      text,
      color,
      life: 1.0,
    });
  }

  spawnParticle(x: number, y: number, color: string, size: number, speed: number, gravity: boolean) {
    const angle = Math.random() * Math.PI * 2;
    const s = Math.random() * speed * 0.15 + 0.5;
    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * s,
      vy: Math.sin(angle) * s - (gravity ? 1 : 0),
      color,
      size,
      life: 1.0,
      gravity,
    });
  }

  spawnEnemy(type: 'green_slime' | 'blue_slime' | 'red_slime' | 'zombie' | 'demon_eye' | 'servant', x: number, y: number) {
    let health = 40;
    let damage = 6;
    let width = 16;
    let height = 12;

    switch (type) {
      case 'green_slime':
        health = 24; damage = 5; width = 14; height = 10;
        break;
      case 'blue_slime':
        health = 35; damage = 7; width = 18; height = 12;
        break;
      case 'red_slime':
        health = 50; damage = 10; width = 20; height = 14;
        break;
      case 'zombie':
        health = 75; damage = 12; width = 14; height = 26;
        break;
      case 'demon_eye':
        health = 60; damage = 14; width = 18; height = 14;
        break;
      case 'servant':
        health = 20; damage = 8; width = 12; height = 12;
        break;
    }

    this.enemies.push({
      id: 'enemy_' + Math.random(),
      type: EntityType.Enemy,
      x,
      y,
      vx: 0,
      vy: 0,
      width,
      height,
      health,
      maxHealth: health,
      damage,
      isGrounded: false,
      direction: 1,
      enemyType: type,
    });
  }

  // BFS Light propagation engine
  // This computes soft lighting values around the visible camera screen extremely fast!
  updateLightingAtCamera() {
    const pad = 12; // compute slightly outside visible viewport to avoid visual clipping
    const minX = Math.max(0, Math.floor(this.camera.x / TILE_SIZE) - pad);
    const maxX = Math.min(this.world.width - 1, Math.ceil((this.camera.x + this.viewportWidth) / TILE_SIZE) + pad);
    const minY = Math.max(0, Math.floor(this.camera.y / TILE_SIZE) - pad);
    const maxY = Math.min(this.world.height - 1, Math.ceil((this.camera.y + this.viewportHeight) / TILE_SIZE) + pad);

    // Determine current daylight factor
    let skylight = 1.0;
    const tod = this.world.timeOfDay;
    if (tod >= 12000 && tod < 13500) {
      // Dusk fade: 1.0 down to 0.15
      skylight = 1.0 - ((tod - 12000) / 1500) * 0.85;
    } else if (tod >= 13500 && tod < 22500) {
      // Night
      skylight = 0.15;
    } else if (tod >= 22500 && tod < 24000) {
      // Dawn fade: 0.15 up to 1.0
      skylight = 0.15 + ((tod - 22500) / 1500) * 0.85;
    }

    const queue: { x: number; y: number; light: number }[] = [];

    // Set up default light values based on tiles and background walls
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const tile = this.world.tiles[x][y];
        tile.light = 0.05; // ambient dark

        // Skylight: air tiles or thin walls get skylight if they can trace up to sky
        // To be fast, any air tile above the cavern line or with no background walls gets skylight
        if (tile.type === TileType.Air && tile.wall === WallType.None) {
          tile.light = skylight;
          queue.push({ x, y, light: skylight });
        } else if (tile.wall === WallType.None && y < 35) {
          // Soft daylight seepage
          tile.light = skylight * 0.45;
          queue.push({ x, y, light: tile.light });
        }

        // Active emissive source lights
        if (tile.type === TileType.Torch) {
          tile.light = 1.0;
          queue.push({ x, y, light: 1.0 });
        } else if (tile.isLava) {
          tile.light = 0.8;
          queue.push({ x, y, light: 0.8 });
        } else if (tile.type === TileType.ShadowOrb) {
          tile.light = 0.7;
          queue.push({ x, y, light: 0.7 });
        }
      }
    }

    // Run BFS propagation
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let head = 0;

    while (head < queue.length) {
      const curr = queue[head++];
      const cx = curr.x;
      const cy = curr.y;
      const cl = curr.light;

      for (const [dx, dy] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx >= minX && nx <= maxX && ny >= minY && ny <= maxY) {
          const neighbor = this.world.tiles[nx][ny];
          
          // Decays: solid blocks absorb more light, transparent lets it pass easily
          const isSolid = neighbor.type !== TileType.Air && neighbor.type !== TileType.Torch && neighbor.type !== TileType.GrassDeco && neighbor.type !== TileType.Platform;
          const decay = isSolid ? 0.22 : 0.08;

          const nextL = cl - decay;
          if (nextL > neighbor.light) {
            neighbor.light = nextL;
            queue.push({ x: nx, y: ny, light: nextL });
          }
        }
      }
    }
  }

  recomputeLighting() {
    // Compiles lighting for the entire grid (slow, used on load)
    this.updateLightingAtCamera();
  }

  recomputeLightingAround(tx: number, ty: number, radius: number) {
    // Incremental lightning helper
    this.updateLightingAtCamera();
  }

  // Procedural Spawners
  spawnSpontaneousEntities() {
    // Only spawn if player is alive
    if (this.respawnTimer > 0) return;

    const tod = this.world.timeOfDay;
    const isNight = tod >= 12000 && tod < 22500;

    // Spawn cap
    if (this.enemies.length >= 15) return;

    // Spawn slimes during day, zombies/eyes at night
    if (Math.random() < 0.008) {
      // Spawn slightly offscreen to left or right of player
      const side = Math.random() > 0.5 ? 1 : -1;
      const spawnX = this.player.x + side * (this.viewportWidth / 2 + 50 + Math.random() * 100);
      const tx = Math.floor(spawnX / TILE_SIZE);

      if (tx >= 0 && tx < this.world.width) {
        // Trace down to surface block
        let spawnY = -1;
        for (let y = 10; y < this.world.height; y++) {
          if (this.world.tiles[tx][y].type !== TileType.Air) {
            spawnY = (y - 2) * TILE_SIZE;
            break;
          }
        }

        if (spawnY !== -1) {
          if (isNight) {
            // Night spawns: zombies, demon eyes
            if (Math.random() < 0.6) {
              this.spawnEnemy('zombie', spawnX, spawnY);
            } else {
              this.spawnEnemy('demon_eye', spawnX, spawnY - 60); // fly slightly higher
            }
          } else {
            // Day spawns: different slimes
            const roll = Math.random();
            if (roll < 0.5) {
              this.spawnEnemy('green_slime', spawnX, spawnY);
            } else if (roll < 0.85) {
              this.spawnEnemy('blue_slime', spawnX, spawnY);
            } else {
              this.spawnEnemy('red_slime', spawnX, spawnY);
            }
          }
        }
      }
    }

    // Spontaneous Fallen Stars at night!
    if (isNight && Math.random() < 0.003) {
      // Spawn star falling from sky above camera
      const spawnX = this.player.x + (Math.random() - 0.5) * 600;
      const spawnY = this.camera.y - 40;

      this.droppedItems.push({
        id: 'fallen_star_' + Math.random(),
        type: EntityType.DroppedItem,
        x: spawnX,
        y: spawnY,
        vx: (Math.random() - 0.5) * 2 - 1, // diagonal fall
        vy: 3,
        width: 10,
        height: 10,
        health: 1,
        maxHealth: 1,
        damage: 0,
        isGrounded: false,
        direction: 1,
        inventoryItem: { item: ITEMS.fallen_star, count: 1 },
        pickupCooldown: 10,
      });
    }
  }

  updateTimeOfDay() {
    this.world.timeOfDay = (this.world.timeOfDay + 4) % 24000; // speeds up day cycle
    
    // Set appropriate ambient background audio tracks dynamically!
    const isNight = this.world.timeOfDay >= 12000 && this.world.timeOfDay < 22500;
    const isCavern = this.player.y / TILE_SIZE > 45;

    if (this.activeBoss) {
      audio.setTrack('boss');
    } else if (isCavern) {
      audio.setTrack('cave');
    } else if (isNight) {
      audio.setTrack('night');
    } else {
      audio.setTrack('forest');
    }

    if (this.world.timeOfDay === 0) {
      this.world.dayNumber++;
      this.addNotification(`Day ${this.world.dayNumber} is dawning!`, "#FFFF00");
    }
    if (this.world.timeOfDay === 12000) {
      this.addNotification("The cold shadow of night is falling...", "#B0C4DE");
    }
  }

  // Swing animation triggers
  triggerSwingAnimation() {
    this.swingProgress = 1.0;
  }

  updateSwingAnimation() {
    if (this.swingProgress > 0) {
      this.swingProgress -= 0.12; // rate of sword swing animation fade
      if (this.swingProgress < 0) this.swingProgress = 0;
    }
  }

  // Chest / inventory interactions
  interactWithChest(tx: number, ty: number) {
    const key = `${tx},${ty}`;
    
    // Check if chest exists
    if (this.world.tiles[tx][ty].type !== TileType.Chest) return;

    if (this.openChestPos?.x === tx && this.openChestPos?.y === ty) {
      // Close chest
      this.openChestPos = null;
    } else {
      // Open chest
      this.openChestPos = { x: tx, y: ty };
      
      // If chest data does not exist yet (rare, for world gen ones), initialize it now!
      if (!this.chestsData[key]) {
        this.chestsData[key] = Array(20).fill(null);
        // Fill chest with procedural items
        const contents = populateChestItems();
        contents.forEach((slot, idx) => {
          if (idx < 20) {
            this.chestsData[key][idx] = {
              item: ITEMS[slot.itemId],
              count: slot.count,
            };
          }
        });
      }

      this.chestInventory = this.chestsData[key];
    }
  }

  // Quick helper to translate Tile types into flat CSS hex color codes for retro particles/fallbacks
  getTileColor(type: TileType): string {
    switch (type) {
      case TileType.Dirt: return '#8B5A2B';
      case TileType.Stone: return '#808080';
      case TileType.Wood: return '#6B4226';
      case TileType.Leaves: return '#228B22';
      case TileType.IronOre: return '#D2691E';
      case TileType.GoldOre: return '#FFD700';
      case TileType.Clay: return '#CD5C5C';
      case TileType.Sand: return '#EDC9AF';
      case TileType.Cactus: return '#2E8B57';
      case TileType.Ebonstone: return '#4B0082';
      case TileType.CorruptedDirt: return '#4B0082';
      case TileType.Platform: return '#CD853F';
      case TileType.Torch: return '#FFD700';
      case TileType.Chest: return '#CD853F';
      case TileType.ShadowOrb: return '#EE82EE';
      default: return '#777777';
    }
  }

  // Floating notifications list for epic in-game text triggers
  notifications: { id: string; text: string; color: string; life: number }[] = [];
  addNotification(text: string, color: string) {
    this.notifications.push({
      id: 'notif_' + Math.random(),
      text,
      color,
      life: 180, // 3 seconds
    });
  }

  updateNotifications() {
    this.notifications = this.notifications.filter(n => {
      n.life--;
      return n.life > 0;
    });
  }
}
export const gameEngine = new GameEngine();
export const game = gameEngine; // alias for ease
