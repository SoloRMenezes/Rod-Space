/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { gameEngine, TILE_SIZE } from '../gameEngine';
import { TileType, WallType, EntityType } from '../types';
import { ITEMS } from '../data';
import { audio } from '../audio';
import { Eye, Sun, Moon, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface GameCanvasProps {
  onInventoryToggle: () => void;
  isInventoryOpen: boolean;
  onChestToggle: (pos: { x: number; y: number } | null) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onInventoryToggle,
  isInventoryOpen,
  onChestToggle,
  isMuted,
  onMuteToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fps, setFps] = useState(60);
  const [bossHealthPercent, setBossHealthPercent] = useState<number | null>(null);
  const [bossName, setBossName] = useState<string | null>(null);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['Space', 'KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
      }

      gameEngine.keys[e.code] = true;

      // Quick hotbar selection 1-9, 0
      if (e.code.startsWith('Digit')) {
        const digit = parseInt(e.code.replace('Digit', ''));
        if (digit >= 1 && digit <= 9) {
          gameEngine.hotbarIndex = digit - 1;
        } else if (digit === 0) {
          gameEngine.hotbarIndex = 9;
        }
      }

      // Toggle inventory
      if (e.code === 'KeyE') {
        onInventoryToggle();
      }

      // Interact with nearby chests or NPCs with 'KeyQ' or 'KeyF' or 'Right Click'
      if (e.code === 'KeyF') {
        interactWithWorld();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameEngine.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInventoryToggle]);

  const interactWithWorld = () => {
    // Search nearby chest or talk to nearby Guide
    const px = gameEngine.player.x + gameEngine.player.width / 2;
    const py = gameEngine.player.y + gameEngine.player.height / 2;

    let chestFound = false;
    const reach = 4.0 * TILE_SIZE; // block reach

    // Scan for chest nearby
    const ptx = Math.floor(px / TILE_SIZE);
    const pty = Math.floor(py / TILE_SIZE);

    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -3; dy <= 3; dy++) {
        const tx = ptx + dx;
        const ty = pty + dy;
        const tile = gameEngine.getTile(tx, ty);
        if (tile && tile.type === TileType.Chest) {
          const distance = Math.sqrt(dx * dx + dy * dy) * TILE_SIZE;
          if (distance <= reach) {
            gameEngine.interactWithChest(tx, ty);
            onChestToggle(gameEngine.openChestPos);
            chestFound = true;
            break;
          }
        }
      }
      if (chestFound) break;
    }

    if (!chestFound) {
      // Check Guide talk distance
      const guide = gameEngine.npcs.find(n => n.npcType === 'guide');
      if (guide) {
        const distance = Math.sqrt(
          Math.pow((px - (guide.x + guide.width / 2)), 2) + 
          Math.pow((py - (guide.y + guide.height / 2)), 2)
        );
        if (distance < 50) {
          // Speak with Guide
          guide.dialogueIndex = (guide.dialogueIndex + 1) % 11; // 11 dialog tips
          gameEngine.spawnDamageNumber(guide.x + guide.width / 2, guide.y - 12, "Advice!", "#FFFF00");
          audio.playSfx('coin');
        }
      }
    }
  };

  // Mouse controls & Canvas game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set pixelated rendering for beautiful retro styling
    ctx.imageSmoothingEnabled = false;

    // Handle mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      gameEngine.mouse.clientX = e.clientX;
      gameEngine.mouse.clientY = e.clientY;
      gameEngine.mouse.x = (e.clientX - rect.left) * scaleX;
      gameEngine.mouse.y = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        gameEngine.mouse.isDown = true;
      } else if (e.button === 2) {
        // Right click: Interact
        e.preventDefault();
        interactWithWorld();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        gameEngine.mouse.isDown = false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleContextMenu);

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;
    let animationFrameId: number;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // FPS counter
      frameCount++;
      fpsTimer += deltaTime;
      if (fpsTimer >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = 0;
      }

      // Step physics and engine (clamped step for safety)
      gameEngine.tick();
      gameEngine.updateSwingAnimation();
      gameEngine.updateNotifications();

      // Render graphics
      renderGame(ctx, canvas);

      // Save game periodically (every 10 seconds = 600 frames)
      if (Math.random() < 0.0016) {
        gameEngine.saveGame();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // Resize Handler
    const handleResize = () => {
      const container = containerRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        gameEngine.viewportWidth = canvas.width;
        gameEngine.viewportHeight = canvas.height;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // call initially

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Visual Assets & Rendering Pipelines on Canvas
  const renderGame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const scale = 2.0; // Retro zoom
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const camX = gameEngine.camera.x;
    const camY = gameEngine.camera.y;

    // --- 1. RENDER BACKGROUND & SKY GRADIENTS ---
    drawSkyAndEnvironment(ctx, canvas);

    ctx.save();
    // Shift coordinate system by camera
    ctx.translate(-camX, -camY);

    // --- 2. RENDER PARALLAX BACKGROUNDS (MOUNTAINS/FOREST SHAPES) ---
    drawParallaxBackground(ctx, scale);

    // --- 3. RENDER TILES (GRID) ---
    drawTilesGrid(ctx, scale);

    // --- 4. RENDER DROP LOOT ITEMS ---
    drawDroppedItems(ctx);

    // --- 5. RENDER PROJECTILES ---
    drawProjectiles(ctx);

    // --- 6. RENDER NPCs ---
    drawNPCs(ctx);

    // --- 7. RENDER ENEMIES ---
    drawEnemies(ctx);

    // --- 8. RENDER PLAYER ---
    drawPlayer(ctx);

    // --- 9. RENDER PARTICLES ---
    drawParticles(ctx);

    // --- 10. RENDER LIGHTING TRANSITIONS OVERLAY ---
    drawLightingOverlay(ctx, scale);

    // --- 11. RENDER BREAK PROGRESS CRACKS & SELECTION BOX ---
    drawMiningSelectionAndCracks(ctx);

    // --- 12. DRAW FLOATING DAMAGE NUMBERS POPUPS ---
    drawDamagePopups(ctx);

    ctx.restore();

    // --- 13. HUD BOSS HEALTH BARS AND OVERLAYS ---
    drawScreenOverlaysAndHUD(ctx);
  };

  const drawSkyAndEnvironment = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const tod = gameEngine.world.timeOfDay;
    const width = canvas.width;
    const height = canvas.height;

    // Sky colors based on timeOfDay (0 to 24000)
    // 0: Dawn, 4000: Noon, 11000: Sunset, 13000-22000: Night, 23000: Dawn again
    let skyGrad = ctx.createLinearGradient(0, 0, 0, height);

    if (tod < 2000) {
      // Dawn rising (pinkish orange to soft purple)
      skyGrad.addColorStop(0, '#5D3F6A');
      skyGrad.addColorStop(0.5, '#FF7E5F');
      skyGrad.addColorStop(1, '#FEB47B');
    } else if (tod >= 2000 && tod < 11000) {
      // Day (beautiful forest blue)
      skyGrad.addColorStop(0, '#4A90E2');
      skyGrad.addColorStop(1, '#87CEEB');
    } else if (tod >= 11000 && tod < 13000) {
      // Dusk / Sunset (deep fiery crimson orange)
      const ratio = (tod - 11000) / 2000;
      skyGrad.addColorStop(0, '#110D2C');
      skyGrad.addColorStop(0.5, '#D35400');
      skyGrad.addColorStop(1, '#FF7F50');
    } else if (tod >= 13000 && tod < 22000) {
      // Night (deep navy space, shining moon/stars)
      skyGrad.addColorStop(0, '#020111');
      skyGrad.addColorStop(1, '#0F172A');
    } else {
      // Morning rising dawn
      skyGrad.addColorStop(0, '#1E1B4B');
      skyGrad.addColorStop(0.5, '#5D3F6A');
      skyGrad.addColorStop(1, '#FF7E5F');
    }

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw static starry stars at night!
    if (tod >= 12000 && tod < 23000) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      // Seeded random-like dots based on index
      for (let i = 0; i < 40; i++) {
        const starX = (Math.sin(i * 354 + 23) * 0.5 + 0.5) * width;
        const starY = (Math.cos(i * 123 + 99) * 0.5 + 0.5) * (height * 0.5);
        const flash = Math.sin(tod * 0.01 + i) * 0.3 + 0.7; // twinkle
        ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
        ctx.fillRect(starX, starY, 2, 2);
      }

      // Draw Retro pixelated Moon
      const moonX = width * 0.75;
      const moonY = height * 0.25;
      ctx.fillStyle = '#E5E4E2';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
      ctx.fill();
      // crater texture
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(moonX - 8, moonY - 6, 4, 4);
      ctx.fillRect(moonX + 2, moonY + 4, 6, 6);
    } else {
      // Draw Sun
      const sunX = width * 0.25;
      const sunY = height * 0.2;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const drawParallaxBackground = (ctx: CanvasRenderingContext2D, scale: number) => {
    const camX = gameEngine.camera.x;
    const camY = gameEngine.camera.y;
    const worldWidth = gameEngine.world.width * TILE_SIZE;

    // Distant mountain shapes
    ctx.fillStyle = '#485E48';
    ctx.beginPath();
    // Parallax factor 0.3 (moves slower than foreground)
    const pxOffsetX = camX * 0.35;
    for (let x = 0; x <= gameEngine.viewportWidth + TILE_SIZE; x += 40) {
      const rx = x + camX - pxOffsetX;
      const heightSine = Math.sin(rx * 0.003) * 60 + Math.cos(rx * 0.01) * 20 + 450;
      if (x === 0) ctx.moveTo(x + camX, heightSine);
      else ctx.lineTo(x + camX, heightSine);
    }
    ctx.lineTo(gameEngine.viewportWidth + camX, gameEngine.viewportHeight + camY);
    ctx.lineTo(camX, gameEngine.viewportHeight + camY);
    ctx.closePath();
    ctx.fill();

    // Medium-distance forest tree line shapes
    ctx.fillStyle = '#2C3E2C';
    ctx.beginPath();
    const pxOffsetX2 = camX * 0.15;
    for (let x = 0; x <= gameEngine.viewportWidth + TILE_SIZE; x += 25) {
      const rx = x + camX - pxOffsetX2;
      const heightSine = Math.cos(rx * 0.006) * 35 + Math.sin(rx * 0.02) * 10 + 500;
      if (x === 0) ctx.moveTo(x + camX, heightSine);
      else ctx.lineTo(x + camX, heightSine);
    }
    ctx.lineTo(gameEngine.viewportWidth + camX, gameEngine.viewportHeight + camY);
    ctx.lineTo(camX, gameEngine.viewportHeight + camY);
    ctx.closePath();
    ctx.fill();
  }

  const drawTilesGrid = (ctx: CanvasRenderingContext2D, scale: number) => {
    const pad = 3;
    const minX = Math.max(0, Math.floor(gameEngine.camera.x / TILE_SIZE) - pad);
    const maxX = Math.min(gameEngine.world.width - 1, Math.ceil((gameEngine.camera.x + gameEngine.viewportWidth) / TILE_SIZE) + pad);
    const minY = Math.max(0, Math.floor(gameEngine.camera.y / TILE_SIZE) - pad);
    const maxY = Math.min(gameEngine.world.height - 1, Math.ceil((gameEngine.camera.y + gameEngine.viewportHeight) / TILE_SIZE) + pad);

    const t = gameEngine.world.timeOfDay;

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const tile = gameEngine.world.tiles[x][y];
        const screenX = x * TILE_SIZE;
        const screenY = y * TILE_SIZE;

        // Draw background walls first
        if (tile.wall !== WallType.None) {
          ctx.fillStyle = getWallColor(tile.wall);
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
          // brick mortar detail
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(screenX, screenY + TILE_SIZE - 2, TILE_SIZE, 1);
        }

        // Draw solid block
        if (tile.type !== TileType.Air) {
          ctx.fillStyle = gameEngine.getTileColor(tile.type);

          // Custom visual rendering for beautiful biome details
          if (tile.type === TileType.Dirt) {
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            // Grass grass top border: if tile above is air/torch/platform, paint green top grass!
            const tileAbove = gameEngine.getTile(x, y - 1);
            const isGrassSurface = !tileAbove || tileAbove.type === TileType.Air || tileAbove.type === TileType.Torch || tileAbove.type === TileType.GrassDeco;
            
            if (isGrassSurface) {
              // Draw grass top
              ctx.fillStyle = '#32CD32'; // Forest Green
              ctx.fillRect(screenX, screenY, TILE_SIZE, 4);
              // grass fringe blades
              ctx.fillStyle = '#228B22';
              for (let i = 0; i < TILE_SIZE; i += 4) {
                ctx.fillRect(screenX + i, screenY + 4, 1.5, 2);
              }
            }
          } 
          else if (tile.type === TileType.CorruptedDirt) {
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            // Purple Corruption grass surface
            const tileAbove = gameEngine.getTile(x, y - 1);
            const isGrassSurface = !tileAbove || tileAbove.type === TileType.Air || tileAbove.type === TileType.Torch || tileAbove.type === TileType.GrassDeco;
            
            if (isGrassSurface) {
              ctx.fillStyle = '#8A2BE2'; // BlueViolet
              ctx.fillRect(screenX, screenY, TILE_SIZE, 4);
              ctx.fillStyle = '#4B0082'; // Indigo blades
              for (let i = 0; i < TILE_SIZE; i += 4) {
                ctx.fillRect(screenX + i, screenY + 4, 1.5, 2);
              }
            }
          }
          else if (tile.type === TileType.Stone) {
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            // stone details (crevices)
            ctx.fillStyle = '#696969';
            ctx.fillRect(screenX + 3, screenY + 2, 4, 2);
            ctx.fillRect(screenX + 10, screenY + 8, 3, 2);
            ctx.fillRect(screenX + 1, screenY + 12, 6, 2);
          }
          else if (tile.type === TileType.Sand) {
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            // sand grains
            ctx.fillStyle = '#E5C158';
            ctx.fillRect(screenX + 2, screenY + 4, 1.5, 1.5);
            ctx.fillRect(screenX + 11, screenY + 9, 1.5, 1.5);
          }
          else if (tile.type === TileType.Leaves) {
            // Leafy blobs
            ctx.fillStyle = '#1E6F1E';
            ctx.beginPath();
            ctx.arc(screenX + 8, screenY + 8, 8.5, 0, Math.PI * 2);
            ctx.fill();
            // foliage texture dots
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(screenX + 4, screenY + 3, 3, 3);
            ctx.fillRect(screenX + 10, screenY + 8, 3, 3);
          }
          else if (tile.type === TileType.Platform) {
            // Thin ledge
            ctx.fillRect(screenX, screenY, TILE_SIZE, 4);
            // support posts
            ctx.fillRect(screenX + 2, screenY + 4, 2, 3);
            ctx.fillRect(screenX + TILE_SIZE - 4, screenY + 4, 2, 3);
          }
          else if (tile.type === TileType.Torch) {
            // Wooden stick
            ctx.fillStyle = '#8B5A2B';
            ctx.fillRect(screenX + 7, screenY + 5, 2, 11);
            // Flame flicker
            const flameColors = ['#FF4500', '#FF8C00', '#FFD700'];
            const fColor = flameColors[Math.floor(t * 0.1 + screenX + screenY) % 3];
            ctx.fillStyle = fColor;
            ctx.fillRect(screenX + 6, screenY + 1, 4, 4);
            ctx.fillStyle = '#FFFF00'; // hot center
            ctx.fillRect(screenX + 7, screenY + 2, 2, 2);
          }
          else if (tile.type === TileType.TreeTrunk) {
            // Draw wooden ring columns
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#5A381B'; // bark grooves
            ctx.fillRect(screenX + 3, screenY, 2, TILE_SIZE);
            ctx.fillRect(screenX + 11, screenY, 2, TILE_SIZE);
          }
          else if (tile.type === TileType.Chest) {
            // Draw treasure box chest
            ctx.fillRect(screenX + 1, screenY + 2, TILE_SIZE - 2, TILE_SIZE - 2);
            ctx.fillStyle = '#DAA520'; // gold hinges/lock
            ctx.fillRect(screenX + 7, screenY + 8, 2, 3);
            ctx.fillStyle = '#5C4033'; // lid seam
            ctx.fillRect(screenX + 1, screenY + 6, TILE_SIZE - 2, 1.5);
          }
          else if (tile.type === TileType.Workbench) {
            // Custom desk shape
            ctx.fillRect(screenX, screenY + 6, TILE_SIZE, 10);
            ctx.fillStyle = '#8B4513'; // legs
            ctx.fillRect(screenX + 1, screenY + 10, 2, 6);
            ctx.fillRect(screenX + TILE_SIZE - 3, screenY + 10, 2, 6);
          }
          else if (tile.type === TileType.Anvil) {
            // Custom anvil shape
            ctx.fillRect(screenX + 2, screenY + 9, TILE_SIZE - 4, 7);
            ctx.fillRect(screenX, screenY + 6, TILE_SIZE - 2, 3);
            ctx.fillStyle = '#333333';
            ctx.fillRect(screenX + 6, screenY + 9, 4, 4);
          }
          else if (tile.type === TileType.GrassDeco) {
            // Small flowers or weeds (non-solid)
            const seed = screenX * 123 + screenY;
            if (seed % 3 === 0) {
              // Little red mushroom!
              ctx.fillStyle = '#FF0000';
              ctx.beginPath();
              ctx.arc(screenX + 8, screenY + 11, 4.5, Math.PI, 0);
              ctx.fill();
              ctx.fillStyle = '#FFFFFF'; // spots
              ctx.fillRect(screenX + 6, screenY + 8, 1, 1);
              ctx.fillRect(screenX + 9, screenY + 9, 1, 1);
              // stem
              ctx.fillStyle = '#F5F5DC';
              ctx.fillRect(screenX + 7, screenY + 11, 2, 5);
            } else if (seed % 3 === 1) {
              // Tall grass weed
              ctx.fillStyle = '#228B22';
              ctx.fillRect(screenX + 4, screenY + 8, 2, 8);
              ctx.fillRect(screenX + 8, screenY + 5, 2, 11);
              ctx.fillRect(screenX + 11, screenY + 10, 1.5, 6);
            } else {
              // Yellow flower
              ctx.fillStyle = '#228B22';
              ctx.fillRect(screenX + 7, screenY + 8, 2, 8); // stem
              ctx.fillStyle = '#FFD700'; // bloom
              ctx.fillRect(screenX + 5, screenY + 5, 6, 3);
              ctx.fillStyle = '#FFA500';
              ctx.fillRect(screenX + 7, screenY + 6, 2, 1);
            }
          }
          else if (tile.type === TileType.Cactus) {
            // Spiked cactus segmented columns
            ctx.fillRect(screenX + 3, screenY, TILE_SIZE - 6, TILE_SIZE);
            // needle notches
            ctx.fillStyle = '#1D5F3A';
            ctx.fillRect(screenX + 2, screenY + 4, 1, 1);
            ctx.fillRect(screenX + TILE_SIZE - 3, screenY + 9, 1, 1);
          }
          else if (tile.type === TileType.ShadowOrb) {
            // Spooky glowing orb
            ctx.fillStyle = '#4B0082';
            ctx.beginPath();
            ctx.arc(screenX + 8, screenY + 8, 6.5, 0, Math.PI*2);
            ctx.fill();
            // shiny accent
            ctx.fillStyle = '#EE82EE';
            ctx.fillRect(screenX + 5, screenY + 5, 2.5, 2.5);
          }
          else {
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
          }
        }

        // Draw Liquid (water/lava)
        if (tile.liquid !== undefined && tile.liquid > 0) {
          const liquidHeight = (tile.liquid / 8) * TILE_SIZE;
          ctx.fillStyle = tile.isLava ? '#FF4500' : 'rgba(30, 144, 255, 0.7)';
          ctx.fillRect(screenX, screenY + TILE_SIZE - liquidHeight, TILE_SIZE, liquidHeight);
        }
      }
    }
  };

  const drawDroppedItems = (ctx: CanvasRenderingContext2D) => {
    gameEngine.droppedItems.forEach(drop => {
      ctx.fillStyle = drop.inventoryItem.item.spriteColor;
      // Draw a small floating box
      const bounce = Math.sin(performance.now() * 0.007 + drop.x) * 2;
      ctx.fillRect(drop.x, drop.y + bounce, drop.width, drop.height);

      // Draw sprite char icon or shadow ring
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(drop.inventoryItem.item.spriteChar || '', drop.x + 5, drop.y + bounce + 8);
    });
  };

  const drawProjectiles = (ctx: CanvasRenderingContext2D) => {
    gameEngine.projectiles.forEach(proj => {
      ctx.fillStyle = proj.color;
      if ((proj as any).state === 'star') {
        // Draw starry sparkle shape!
        ctx.fillStyle = '#FFFF33';
        ctx.fillRect(proj.x - 2, proj.y - 2, 4, 4);
        ctx.fillRect(proj.x - 5, proj.y, 10, 1.5);
        ctx.fillRect(proj.x, proj.y - 5, 1.5, 10);
      } else {
        // Simple arrow wedge
        ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
      }
    });
  };

  const drawNPCs = (ctx: CanvasRenderingContext2D) => {
    gameEngine.npcs.forEach(npc => {
      // Draw Guide NPC
      // Skin, shirt, trousers, head
      ctx.fillStyle = '#FFD1A9'; // head skin
      ctx.fillRect(npc.x + 2, npc.y, 10, 8);
      ctx.fillStyle = '#8B4513'; // brown hair
      ctx.fillRect(npc.x + 1, npc.y, 12, 3);
      ctx.fillRect(npc.x + npc.direction === -1 ? 1 : 11, npc.y + 3, 2, 3); // hair fringe

      ctx.fillStyle = '#228B22'; // Green shirt
      ctx.fillRect(npc.x + 2, npc.y + 8, 10, 10);

      ctx.fillStyle = '#0000CD'; // blue pants
      ctx.fillRect(npc.x + 2, npc.y + 18, 10, 8);

      // Cute eye looking at player
      ctx.fillStyle = '#000000';
      const lookOffset = npc.direction === 1 ? 9 : 3;
      ctx.fillRect(npc.x + lookOffset, npc.y + 4, 1.5, 2);

      // NPC Tag
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("Guide", npc.x + npc.width / 2, npc.y - 6);
    });
  };

  const drawEnemies = (ctx: CanvasRenderingContext2D) => {
    gameEngine.enemies.forEach(enemy => {
      // --- SLIMES ---
      if (enemy.enemyType.includes('slime')) {
        let gelColor = '#32CD32'; // Green
        if (enemy.enemyType === 'blue_slime') gelColor = '#1E90FF';
        if (enemy.enemyType === 'red_slime') gelColor = '#FF4500';
        if (enemy.enemyType === 'servant') gelColor = '#FF5555';

        ctx.fillStyle = gelColor;
        // Squish effect based on bounce/grounded
        let squishH = 0;
        let squishW = 0;
        if (!enemy.isGrounded) {
          // stretched jumping
          squishH = 3;
          squishW = -2;
        } else if (Math.abs(enemy.vx) > 0.5) {
          // squashed gliding
          squishH = -2;
          squishW = 3;
        }

        const rw = enemy.width + squishW;
        const rh = enemy.height + squishH;
        const rx = enemy.x - squishW / 2;
        const ry = enemy.y - squishH;

        // slime dome
        ctx.beginPath();
        ctx.ellipse(rx + rw/2, ry + rh, rw/2, rh, 0, Math.PI, 0);
        ctx.fill();

        // little slime eyes
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(rx + rw/2 - 3, ry + rh - 6, 2, 3);
        ctx.fillRect(rx + rw/2 + 1, ry + rh - 6, 2, 3);
      }

      // --- ZOMBIE ---
      else if (enemy.enemyType === 'zombie') {
        // Green skin, tattered blue shirt, purple pants
        ctx.fillStyle = '#556B2F'; // green head
        ctx.fillRect(enemy.x + 2, enemy.y, 10, 8);
        ctx.fillStyle = '#1E90FF'; // blue tattered shirt
        ctx.fillRect(enemy.x + 2, enemy.y + 8, 10, 10);
        // Outstretched zombie arms
        ctx.fillStyle = '#556B2F'; // arms extend forward
        const armX = enemy.direction === 1 ? enemy.x + 10 : enemy.x - 4;
        ctx.fillRect(armX, enemy.y + 9, 8, 3);

        ctx.fillStyle = '#8B008B'; // tattered purple pants
        ctx.fillRect(enemy.x + 2, enemy.y + 18, 10, 8);
      }

      // --- FLYING DEMON EYE ---
      else if (enemy.enemyType === 'demon_eye' || enemy.enemyType === 'servant') {
        // Draw white ball
        ctx.fillStyle = '#F5F5F5';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Red veins on trailing back side
        ctx.fillStyle = '#FF3333';
        const veinX = enemy.vx > 0 ? enemy.x + 2 : enemy.x + enemy.width - 4;
        ctx.fillRect(veinX, enemy.y + 3, 2, 2);
        ctx.fillRect(veinX + (enemy.vx > 0 ? 1 : -1) * 2, enemy.y + 8, 2, 2);

        // Giant dynamic eye iris pointing at player
        const dx = (gameEngine.player.x + gameEngine.player.width/2) - (enemy.x + enemy.width/2);
        const dy = (gameEngine.player.y + gameEngine.player.height/2) - (enemy.y + enemy.height/2);
        const a = Math.atan2(dy, dx);
        
        const irisOffset = 3.5;
        const ix = enemy.x + enemy.width / 2 + Math.cos(a) * irisOffset;
        const iy = enemy.y + enemy.height / 2 + Math.sin(a) * irisOffset;

        ctx.fillStyle = '#4169E1'; // Royal blue iris
        ctx.beginPath();
        ctx.arc(ix, iy, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000'; // black pupil
        ctx.beginPath();
        ctx.arc(ix, iy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- EYE OF CTHULHU BOSS ---
      else if (enemy.enemyType === 'eye_of_cthulhu') {
        const rad = enemy.width / 2;
        const bx = enemy.x + rad;
        const by = enemy.y + rad;

        // Back tendrils (pulsing scary red fleshy fringes)
        ctx.fillStyle = '#CC0000';
        ctx.beginPath();
        ctx.ellipse(bx - enemy.vx * 1.5, by - enemy.vy * 1.5, rad * 1.2, rad * 0.9, Math.atan2(enemy.vy, enemy.vx), 0, Math.PI * 2);
        ctx.fill();

        // Giant main eyeball white body
        ctx.fillStyle = '#F8F8FF';
        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing veins crawling all over!
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - 15, by - 5);
        ctx.lineTo(bx - 5, by - 12);
        ctx.moveTo(bx + 15, by + 10);
        ctx.lineTo(bx + 8, by - 4);
        ctx.moveTo(bx - 10, by + 15);
        ctx.lineTo(bx + 2, by + 5);
        ctx.stroke();

        const dx = (gameEngine.player.x + gameEngine.player.width/2) - bx;
        const dy = (gameEngine.player.y + gameEngine.player.height/2) - by;
        const a = Math.atan2(dy, dx);

        if (enemy.phase === 1) {
          // PHASE 1: Giant Iris and pupil staring at you
          const irisDist = 11;
          const ix = bx + Math.cos(a) * irisDist;
          const iy = by + Math.sin(a) * irisDist;

          ctx.fillStyle = '#104E8B'; // Deep blue iris
          ctx.beginPath();
          ctx.arc(ix, iy, 11, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#000000'; // Pupil
          ctx.beginPath();
          ctx.arc(ix, iy, 6, 0, Math.PI * 2);
          ctx.fill();

          // Servant spawning portal highlight inside pupil
          if (enemy.state === 'hovering' && enemy.chargeTimer! > 140) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(ix, iy, 4 + Math.sin(performance.now() * 0.05) * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // PHASE 2: Iris ripped away, revealing giant fanged jaws!
          // Draw a circular bloody mouth center
          const mx = bx + Math.cos(a) * 4;
          const my = by + Math.sin(a) * 4;

          ctx.fillStyle = '#4A0000'; // dark blood throat
          ctx.beginPath();
          ctx.arc(mx, my, 12, 0, Math.PI * 2);
          ctx.fill();

          // Draw razor fangs pointing inward!
          ctx.fillStyle = '#FFFFFF';
          const numTeeth = 8;
          for (let i = 0; i < numTeeth; i++) {
            const ta = a + (i / numTeeth) * Math.PI * 2 + performance.now() * 0.005;
            const tipDist = 11;
            const baseDist = 13;

            const tTipX = mx + Math.cos(ta) * tipDist;
            const tTipY = my + Math.sin(ta) * tipDist;

            const tBase1X = mx + Math.cos(ta - 0.25) * baseDist;
            const tBase1Y = my + Math.sin(ta - 0.25) * baseDist;
            const tBase2X = mx + Math.cos(ta + 0.25) * baseDist;
            const tBase2Y = my + Math.sin(ta + 0.25) * baseDist;

            ctx.beginPath();
            ctx.moveTo(tTipX, tTipY);
            ctx.lineTo(tBase1X, tBase1Y);
            ctx.lineTo(tBase2X, tBase2Y);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    });
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    if (gameEngine.respawnTimer > 0) return; // don't draw player if dead

    const p = gameEngine.player;

    // Blink player if invincible (I-frames)
    if (gameEngine.invincibilityFrames > 0 && Math.floor(gameEngine.invincibilityFrames / 4) % 2 === 0) {
      return;
    }

    // 1. Draw Character figure
    // Head skin
    ctx.fillStyle = '#FFE4C4';
    ctx.fillRect(p.x + 2, p.y + 1, 10, 8);
    // Cool Terraria Hair (Blue / Turquoise!)
    ctx.fillStyle = '#00F5FF';
    ctx.fillRect(p.x + 1, p.y, 12, 3.5);
    ctx.fillRect(p.x + (p.direction === 1 ? 10 : 1), p.y + 3, 3, 4);

    // Eyes
    ctx.fillStyle = '#000';
    const lookOffset = p.direction === 1 ? 9 : 3;
    ctx.fillRect(p.x + lookOffset, p.y + 4, 1.5, 2);

    // Shirt & armor (Silver breastplate details)
    ctx.fillStyle = '#C0C0C0'; // Silver breastplate
    ctx.fillRect(p.x + 2, p.y + 9, 10, 10);
    ctx.fillStyle = '#FFD700'; // gold shoulder guards
    ctx.fillRect(p.x + (p.direction === 1 ? 1 : 11), p.y + 9, 2, 4);

    // Copper greaves pants
    ctx.fillStyle = '#B87333';
    ctx.fillRect(p.x + 2, p.y + 19, 10, 7);

    // --- SWORD / TOOL SWING SWEEP ---
    const activeSlot = gameEngine.inventory[gameEngine.hotbarIndex];
    if (activeSlot && gameEngine.swingProgress > 0) {
      const item = activeSlot.item;
      // We want to render a sweeping sword trailing behind/ahead
      const progress = gameEngine.swingProgress; // 1.0 down to 0
      const sweepAngle = (p.direction === 1) 
        ? (-Math.PI / 3) + (1.0 - progress) * (Math.PI * 1.2)
        : (Math.PI * 1.3) - (1.0 - progress) * (Math.PI * 1.2);

      const pxCenter = p.x + p.width / 2;
      const pyCenter = p.y + p.height / 2;
      const swordLength = (item.range || 3) * TILE_SIZE * 0.7;

      ctx.save();
      ctx.translate(pxCenter, pyCenter);
      ctx.rotate(sweepAngle);

      // Draw blade
      ctx.fillStyle = item.spriteColor;
      ctx.fillRect(0, -2, swordLength, 4);
      // hilt/handle
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-4, -1, 4, 2);
      ctx.fillStyle = '#DAA520';
      ctx.fillRect(0, -4, 2, 8); // guard

      ctx.restore();
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    gameEngine.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1.0; // reset
  };

  const drawLightingOverlay = (ctx: CanvasRenderingContext2D, scale: number) => {
    // Draws a dynamic soft shading overlay based on compiled tile light values
    const pad = 3;
    const minX = Math.max(0, Math.floor(gameEngine.camera.x / TILE_SIZE) - pad);
    const maxX = Math.min(gameEngine.world.width - 1, Math.ceil((gameEngine.camera.x + gameEngine.viewportWidth) / TILE_SIZE) + pad);
    const minY = Math.max(0, Math.floor(gameEngine.camera.y / TILE_SIZE) - pad);
    const maxY = Math.min(gameEngine.world.height - 1, Math.ceil((gameEngine.camera.y + gameEngine.viewportHeight) / TILE_SIZE) + pad);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const tile = gameEngine.world.tiles[x][y];
        const screenX = x * TILE_SIZE;
        const screenY = y * TILE_SIZE;

        const darkness = 1.0 - tile.light;
        if (darkness > 0.01) {
          // Soft square shading overlay
          ctx.fillStyle = `rgba(0, 0, 0, ${darkness.toFixed(3)})`;
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  };

  const drawMiningSelectionAndCracks = (ctx: CanvasRenderingContext2D) => {
    // Selection highlight over mined tile
    if (gameEngine.mouse.isDown) {
      const activeSlot = gameEngine.inventory[gameEngine.hotbarIndex];
      if (activeSlot && (activeSlot.item.id.includes('pickaxe') || activeSlot.item.id.includes('axe'))) {
        const worldMouseX = gameEngine.mouse.x + gameEngine.camera.x;
        const worldMouseY = gameEngine.mouse.y + gameEngine.camera.y;
        const tx = Math.floor(worldMouseX / TILE_SIZE);
        const ty = Math.floor(worldMouseY / TILE_SIZE);

        const tile = gameEngine.getTile(tx, ty);
        if (tile && tile.type !== TileType.Air) {
          // Range check
          const px = gameEngine.player.x + gameEngine.player.width / 2;
          const py = gameEngine.player.y + gameEngine.player.height / 2;
          const dist = Math.sqrt(Math.pow(px - worldMouseX, 2) + Math.pow(py - worldMouseY, 2));
          const range = (activeSlot.item.range || 4) * TILE_SIZE;

          if (dist <= range) {
            // Draw square selection bracket
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            // Draw cracking overlay lines based on progress
            if (tile.minedProgress && tile.minedProgress > 10) {
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              
              const factor = tile.minedProgress / 100;
              const bx = tx * TILE_SIZE;
              const by = ty * TILE_SIZE;

              // Crack lines crossing
              ctx.moveTo(bx + 2, by + 2);
              ctx.lineTo(bx + TILE_SIZE * factor, by + TILE_SIZE * factor);
              if (tile.minedProgress > 45) {
                ctx.moveTo(bx + TILE_SIZE - 2, by + 3);
                ctx.lineTo(bx + TILE_SIZE * (1 - factor), by + TILE_SIZE * factor);
              }
              ctx.stroke();
            }
          }
        }
      }
    }
  };

  const drawDamagePopups = (ctx: CanvasRenderingContext2D) => {
    ctx.textAlign = 'center';
    gameEngine.damageNumbers.forEach(dn => {
      ctx.fillStyle = dn.color;
      // Shadow
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(dn.text, dn.x + 1, dn.y + 1);

      ctx.fillStyle = dn.color;
      ctx.fillText(dn.text, dn.x, dn.y);
    });
  };

  const drawScreenOverlaysAndHUD = (ctx: CanvasRenderingContext2D) => {
    // --- EPIC BOSS HEALTH BAR ---
    let boss: any = null;
    gameEngine.enemies.forEach(e => {
      if (e.enemyType === 'eye_of_cthulhu') boss = e;
    });

    if (boss && boss.health > 0) {
      const percent = boss.health / boss.maxHealth;
      const barW = 320;
      const barH = 14;
      const bx = (gameEngine.viewportWidth - barW) / 2;
      const by = gameEngine.viewportHeight - 45;

      // Dark shadow background
      ctx.fillStyle = '#1C1C1C';
      ctx.fillRect(bx - 3, by - 16, barW + 6, barH + 22);

      // Red core fill
      ctx.fillStyle = '#7A0000';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = '#CC0000'; // shiny red
      ctx.fillRect(bx, by, barW * percent, barH);

      // Border bracket
      ctx.strokeStyle = '#D4AF37'; // gold border
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, barW, barH);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`EYE OF CTHULHU - PHASE ${boss.phase}  (${boss.health}/${boss.maxHealth})`, bx + barW / 2, by - 4);
    }

    // --- GAME NOTIFICATIONS ALERTS (e.g. dawn dawning, boss approaches) ---
    let notifY = 120;
    gameEngine.notifications.forEach(n => {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 13px "Press Start 2P", monospace, Arial';
      ctx.textAlign = 'center';
      
      const textW = ctx.measureText(n.text).width;
      ctx.fillRect(gameEngine.viewportWidth / 2 - textW / 2 - 12, notifY - 14, textW + 24, 22);

      // Draw core text with high contrast outline
      ctx.fillStyle = '#000000';
      ctx.fillText(n.text, gameEngine.viewportWidth / 2 + 1.5, notifY + 1.5);
      ctx.fillStyle = n.color;
      ctx.fillText(n.text, gameEngine.viewportWidth / 2, notifY);

      notifY += 28;
    });

    // --- RESPAWN TIMER SCREEN OVERLAY ---
    if (gameEngine.respawnTimer > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, gameEngine.viewportWidth, gameEngine.viewportHeight);

      ctx.fillStyle = '#FF1111';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("YOU WERE SLAIN", gameEngine.viewportWidth / 2, gameEngine.viewportHeight / 2 - 20);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px monospace';
      ctx.fillText(`Respawning in ${Math.ceil(gameEngine.respawnTimer / 60)} seconds...`, gameEngine.viewportWidth / 2, gameEngine.viewportHeight / 2 + 10);
    }
  };

  const getWallColor = (wall: WallType): string => {
    switch (wall) {
      case WallType.DirtWall: return '#453026';
      case WallType.StoneWall: return '#4D4D4D';
      case WallType.WoodWall: return '#5A381B';
      case WallType.EbonstoneWall: return '#2D1B36';
      default: return 'transparent';
    }
  };

  return (
    <div className="relative w-full h-full select-none" ref={containerRef}>
      {/* Canvas */}
      <canvas
        id="terraria-game-canvas"
        ref={canvasRef}
        className="block w-full h-full bg-slate-900 cursor-crosshair"
      />

      {/* Floating Info Panels (Mute, Controls Helper, FPS) */}
      <div className="absolute top-2 left-2 flex items-center gap-3 text-white pointer-events-auto bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 backdrop-blur">
        <button
          id="audio-toggle-btn"
          onClick={onMuteToggle}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 transition"
          title="Toggle Music/Sound"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <div className="text-xs font-mono select-none flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>FPS: {fps}</span>
          </div>
          <span className="text-[10px] text-slate-400">Time: {Math.floor(gameEngine.world.timeOfDay / 1000)}:00</span>
        </div>
      </div>

      {/* Controls HUD Helper in Bottom-Left */}
      <div className="absolute bottom-2 left-2 pointer-events-none bg-slate-950/70 border border-slate-800 text-slate-300 p-2.5 rounded-lg text-[10px] font-mono flex flex-col gap-1 backdrop-blur max-w-xs">
        <div className="text-[11px] font-bold text-white border-b border-slate-800 pb-1 flex items-center gap-1.5">
          Controls Checklist:
        </div>
        <div><b className="text-emerald-400">[A][D] / [←][→]</b> : Run Left / Right</div>
        <div><b className="text-emerald-400">[Space] / [W] / [↑]</b> : Jump (Double Jump supported!)</div>
        <div><b className="text-emerald-400">[S] / [↓]</b> : Drop through platforms</div>
        <div><b className="text-emerald-400">[Left Click + Hold]</b> : Mine / Attack / Place</div>
        <div><b className="text-emerald-400">[Right Click]</b> : Open Chests / Talk to Guide</div>
        <div><b className="text-emerald-400">[E]</b> : Toggle Inventory & Crafting</div>
        <div><b className="text-emerald-400">[1-9][0]</b> : Hotbar Slots Selection</div>
      </div>
    </div>
  );
};
