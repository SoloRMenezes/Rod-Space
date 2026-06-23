/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { gameEngine, TILE_SIZE } from '../gameEngine';
import { TileType, Item, ItemType, InventoryItem } from '../types';
import { RECIPES, ITEMS, GUIDE_TIPS } from '../data';
import { audio } from '../audio';
import { Sparkles, Heart, Star, ShoppingBag, X, MessageSquare, Info, Hammer, Archive } from 'lucide-react';

interface InventoryUIProps {
  isOpen: boolean;
  onToggle: () => void;
  chestPos: { x: number; y: number } | null;
}

export const InventoryUI: React.FC<InventoryUIProps> = ({ isOpen, onToggle, chestPos }) => {
  // Local state to force-refresh when inventory model is modified inside the engine
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<{ type: 'inv' | 'chest'; index: number } | null>(null);
  const [cursorItem, setCursorItem] = useState<InventoryItem | null>(null);

  const forceRefresh = () => setRefreshKey(prev => prev + 1);

  // Sync hotbar scrolling/keys
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Rotate active slot index
      if (e.deltaY > 0) {
        gameEngine.hotbarIndex = (gameEngine.hotbarIndex + 1) % 10;
      } else {
        gameEngine.hotbarIndex = (gameEngine.hotbarIndex - 1 + 10) % 10;
      }
      forceRefresh();
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Poll state changes very softly to keep hotbar in sync with item depletion
  useEffect(() => {
    const interval = setInterval(() => {
      forceRefresh();
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Handle slot clicks (classic Terraria cursor pick up / swap item)
  const handleSlotClick = (type: 'inv' | 'chest', index: number) => {
    const isChest = type === 'chest';
    const inventory = isChest ? gameEngine.chestInventory : gameEngine.inventory;

    const clickedItem = inventory[index];

    if (!cursorItem && clickedItem) {
      // Pick up item to cursor
      inventory[index] = null;
      setCursorItem(clickedItem);
      audio.playSfx('place');
    } else if (cursorItem && !clickedItem) {
      // Drop cursor item to empty slot
      inventory[index] = cursorItem;
      setCursorItem(null);
      audio.playSfx('place');
    } else if (cursorItem && clickedItem) {
      // Merge stacks if same item ID
      if (cursorItem.item.id === clickedItem.item.id && clickedItem.count < clickedItem.item.maxStack) {
        const capacity = clickedItem.item.maxStack - clickedItem.count;
        const add = Math.min(cursorItem.count, capacity);
        
        clickedItem.count += add;
        cursorItem.count -= add;

        if (cursorItem.count <= 0) {
          setCursorItem(null);
        }
        audio.playSfx('place');
      } else {
        // Swap slots
        inventory[index] = cursorItem;
        setCursorItem(clickedItem);
        audio.playSfx('place');
      }
    }

    // Save chest inventory changes directly back to the database
    if (isChest && chestPos) {
      const key = `${chestPos.x},${chestPos.y}`;
      gameEngine.chestsData[key] = [...gameEngine.chestInventory];
    }

    gameEngine.saveGame();
    forceRefresh();
  };

  // Quick Shift-Click to move item directly between Inventory and Chest
  const handleSlotShiftClick = (type: 'inv' | 'chest', index: number, e: React.MouseEvent) => {
    if (!e.shiftKey) return;
    e.preventDefault();

    const isFromChest = type === 'chest';
    const sourceInv = isFromChest ? gameEngine.chestInventory : gameEngine.inventory;
    const destInv = isFromChest ? gameEngine.inventory : gameEngine.chestInventory;

    // Check if chest is open
    if (!chestPos) return;

    const sourceItem = sourceInv[index];
    if (!sourceItem) return;

    // Try merging with existing stacks in destination
    let remaining = sourceItem.count;
    const itemId = sourceItem.item.id;

    for (let i = 0; i < destInv.length; i++) {
      const destSlot = destInv[i];
      if (destSlot && destSlot.item.id === itemId) {
        const capacity = destSlot.item.maxStack - destSlot.count;
        if (capacity > 0) {
          const add = Math.min(remaining, capacity);
          destSlot.count += add;
          remaining -= add;
          if (remaining <= 0) {
            sourceInv[index] = null;
            break;
          }
        }
      }
    }

    // Put remaining in first free empty slot in destination
    if (remaining > 0) {
      for (let i = 0; i < destInv.length; i++) {
        if (destInv[i] === null) {
          destInv[i] = { item: sourceItem.item, count: remaining };
          sourceInv[index] = null;
          remaining = 0;
          break;
        }
      }
    }

    // Update sourceItem if partially transferred
    if (remaining > 0) {
      sourceItem.count = remaining;
    }

    // Save back to chest db
    const key = `${chestPos.x},${chestPos.y}`;
    gameEngine.chestsData[key] = [...gameEngine.chestInventory];

    audio.playSfx('place');
    gameEngine.saveGame();
    forceRefresh();
  };

  // Get crafting scanner status: is player near workbench? near anvil?
  const scanStations = () => {
    const px = Math.floor((gameEngine.player.x + gameEngine.player.width / 2) / TILE_SIZE);
    const py = Math.floor((gameEngine.player.y + gameEngine.player.height / 2) / TILE_SIZE);
    
    let hasWorkbench = false;
    let hasAnvil = false;

    // Check 4-block radius for crafting blocks
    for (let dx = -4; dx <= 4; dx++) {
      for (let dy = -4; dy <= 4; dy++) {
        const tile = gameEngine.getTile(px + dx, py + dy);
        if (tile) {
          if (tile.type === TileType.Workbench) hasWorkbench = true;
          if (tile.type === TileType.Anvil) hasAnvil = true;
        }
      }
    }

    return { hasWorkbench, hasAnvil };
  };

  // Crafting Recipes Analyzer
  const getCraftingList = () => {
    const stations = scanStations();
    
    // Aggregate item counts currently in backpack inventory
    const inventoryCounts: Record<string, number> = {};
    gameEngine.inventory.forEach(slot => {
      if (slot) {
        inventoryCounts[slot.item.id] = (inventoryCounts[slot.item.id] || 0) + slot.count;
      }
    });

    return RECIPES.map(recipe => {
      // Check crafting station requirements
      let stationSatisfied = true;
      if (recipe.requiresStation === TileType.Workbench && !stations.hasWorkbench) stationSatisfied = false;
      if (recipe.requiresStation === TileType.Anvil && !stations.hasAnvil) stationSatisfied = false;

      // Check materials requirements
      const ingredientsStatus = recipe.ingredients.map(ing => {
        const hasCount = inventoryCounts[ing.itemId] || 0;
        return {
          itemId: ing.itemId,
          needed: ing.count,
          has: hasCount,
          satisfied: hasCount >= ing.count,
        };
      });

      const canCraft = stationSatisfied && ingredientsStatus.every(ing => ing.satisfied);

      return {
        recipe,
        canCraft,
        stationSatisfied,
        ingredientsStatus,
      };
    });
  };

  // Perform Crafting
  const craftItem = (recipeData: any) => {
    if (!recipeData.canCraft) return;

    const recipe = recipeData.recipe;

    // 1. Deduct ingredient costs
    recipe.ingredients.forEach((ing: any) => {
      let needed = ing.count;
      // loop backwards to prioritize non-hotbar slots
      for (let i = 39; i >= 0; i--) {
        const slot = gameEngine.inventory[i];
        if (slot && slot.item.id === ing.itemId) {
          const take = Math.min(needed, slot.count);
          slot.count -= take;
          needed -= take;
          if (slot.count <= 0) gameEngine.inventory[i] = null;
          if (needed <= 0) break;
        }
      }
    });

    // 2. Add product result to bags
    const resultItem = { ...recipe.result };
    const added = gameEngine.addToInventory(resultItem);
    
    if (added) {
      audio.playSfx('craft');
      gameEngine.spawnDamageNumber(
        gameEngine.player.x + gameEngine.player.width / 2,
        gameEngine.player.y - 15,
        `Crafted: ${resultItem.item.name}!`,
        '#00FF00'
      );
    } else {
      // Refund if bags are full
      gameEngine.addToInventory(resultItem);
    }

    gameEngine.saveGame();
    forceRefresh();
  };

  const { hasWorkbench, hasAnvil } = scanStations();
  const craftingList = getCraftingList();

  // Find Guide dialogue
  const guide = gameEngine.npcs.find(n => n.npcType === 'guide');
  const guideAdvice = guide ? GUIDE_TIPS[guide.dialogueIndex] : null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-4">
      
      {/* 1. TOP HUD CONTAINER (Hotbar & Hearts) */}
      <div className="flex justify-between items-start w-full gap-4">
        
        {/* Hotbar Slots */}
        <div className="flex gap-1 p-1 bg-black/45 rounded-sm border-2 border-white/20 shadow-2xl backdrop-blur-sm pointer-events-auto">
          {gameEngine.inventory.slice(0, 10).map((slot, index) => {
            const isActive = gameEngine.hotbarIndex === index;
            return (
              <div
                key={`hotbar-${index}`}
                onClick={() => {
                  if (isOpen) {
                    handleSlotClick('inv', index);
                  } else {
                    gameEngine.hotbarIndex = index;
                    forceRefresh();
                  }
                }}
                className={`relative w-12 h-12 rounded-none border-2 flex items-center justify-center cursor-pointer transition-all ${
                  isActive
                    ? 'border-yellow-400 bg-[#515eb5] shadow-[0_0_8px_#facc15]'
                    : 'border-white/20 bg-[#3e4a8f] hover:border-white/40 hover:bg-[#4754a1]'
                }`}
                title={slot?.item.name || `Hotbar Slot ${index + 1}`}
              >
                {/* Hotbar numbering index bubble */}
                <div className="absolute top-0.5 left-1 text-[8px] font-mono font-bold text-yellow-200 opacity-80">
                  {index === 9 ? 0 : index + 1}
                </div>

                {slot ? (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                      {slot.item.spriteChar || '📦'}
                    </span>
                    <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                      {slot.count > 1 ? slot.count : ''}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Health Hearts (top right) & Mana Stars */}
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          {/* Hearts HP */}
          <div className="bg-black/45 p-2.5 rounded-sm border-2 border-white/20 flex flex-col items-end gap-1.5 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">HEALTH: {gameEngine.player.health} / {gameEngine.player.maxHealth}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, idx) => {
                const perHeartValue = gameEngine.player.maxHealth / 10;
                const hpFactor = gameEngine.player.health / perHeartValue;
                const isFull = idx < Math.floor(hpFactor);
                const isHalf = !isFull && (idx === Math.floor(hpFactor)) && (hpFactor % 1 > 0.2);

                return (
                  <div
                    key={`heart-${idx}`}
                    className={`w-4 h-4 border border-black shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.4)] ${
                      isFull
                        ? 'bg-red-600 animate-pulse'
                        : isHalf
                        ? 'bg-red-500/70'
                        : 'bg-black/40'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Mana Stars */}
          <div className="bg-black/45 p-2.5 rounded-sm border-2 border-white/20 flex flex-col items-end gap-1.5 backdrop-blur-sm shadow-xl">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">MANA: {gameEngine.playerStats.mana} / {gameEngine.playerStats.maxMana}</span>
            <div className="flex gap-2 p-0.5">
              {Array.from({ length: Math.ceil(gameEngine.playerStats.maxMana / 10) }).map((_, idx) => (
                <div key={`mana-${idx}`} className="w-3 h-3 bg-blue-600 rotate-45 border border-black shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.4)]" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. FULL BAG & CRAFTING INVENTORY (Middle Center, only if OPEN) */}
      {isOpen && (
        <div className="flex-1 my-4 flex items-center justify-center pointer-events-auto font-sans">
          <div className="bg-[#4157b2]/95 border-4 border-[#303e83] rounded-none w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b-2 border-[#303e83] bg-[#303e83]/30">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Inventory & Crafting Bento</span>
              </div>
              <button
                onClick={onToggle}
                className="p-1 rounded-none bg-[#303e83] hover:bg-[#515eb5] transition border border-white/10"
              >
                <X className="w-4 h-4 text-blue-200 hover:text-white" />
              </button>
            </div>

            {/* Split panels: Crafting Recipes left, Inventory central, Chest right */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
              
              {/* --- PANEL A: CRAFTING recipes list (cols 4) --- */}
              <div className="col-span-4 border-r-2 border-[#303e83] flex flex-col overflow-hidden bg-[#334491]/30">
                <div className="p-3 bg-[#303e83]/20 border-b-2 border-[#303e83]/60 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Hammer className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs font-bold text-blue-100">CRAFTING RECIPES</span>
                  </div>
                  {/* Stations indicator dots */}
                  <div className="flex gap-2 text-[8px] font-mono text-blue-200">
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${hasWorkbench ? 'bg-yellow-400' : 'bg-[#303e83]'}`}></span>
                      <span>Workbench</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${hasAnvil ? 'bg-yellow-400' : 'bg-[#303e83]'}`}></span>
                      <span>Anvil</span>
                    </div>
                  </div>
                </div>

                {/* Recipes list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {craftingList.map((rec, index) => {
                    return (
                      <div
                        key={`recipe-${index}`}
                        onClick={() => rec.canCraft && craftItem(rec)}
                        className={`p-2.5 rounded-none border transition-all ${
                          rec.canCraft
                            ? 'bg-[#3e4a8f] border-yellow-400/80 cursor-pointer hover:bg-[#4754a1] shadow-[0_0_8px_rgba(250,204,21,0.15)]'
                            : 'bg-[#334491]/20 border-white/5 opacity-55 cursor-not-allowed'
                        }`}
                      >
                        {/* Title Result */}
                        <div className="flex justify-between items-center pb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">{rec.recipe.result.item.spriteChar || '📦'}</span>
                            <span className="text-xs font-bold text-white">{rec.recipe.result.item.name}</span>
                            <span className="text-[10px] font-bold text-yellow-300">x{rec.recipe.result.count}</span>
                          </div>
                          {rec.recipe.requiresStation && (
                            <span className="text-[8px] font-mono bg-[#303e83] border border-white/10 px-1 py-0.5 text-blue-200">
                              {rec.recipe.requiresStation === TileType.Workbench ? 'Bench' : 'Anvil'}
                            </span>
                          )}
                        </div>

                        {/* Ingredients */}
                        <div className="flex flex-wrap gap-1 mt-1 border-t border-white/10 pt-1.5">
                          {rec.ingredientsStatus.map((ing, i) => {
                            const ingItem = ITEMS[ing.itemId];
                            return (
                              <div
                                key={`ing-${i}`}
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-none border flex items-center gap-1 ${
                                  ing.satisfied
                                    ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-300'
                                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                                }`}
                              >
                                <span>{ingItem?.spriteChar || '📦'}</span>
                                <span>{ingItem?.name}: {ing.has}/{ing.needed}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* --- PANEL B: MAIN BACKPACK GRID (cols 5) --- */}
              <div className="col-span-5 flex flex-col overflow-hidden bg-[#334491]/15">
                <div className="p-3 bg-[#303e83]/20 border-b-2 border-[#303e83]/60 flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-bold text-blue-100">BACKPACK STORAGE (40 slots)</span>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center">
                  <div className="grid grid-cols-10 gap-1.5">
                    {gameEngine.inventory.map((slot, index) => {
                      const isHotbar = index < 10;
                      return (
                        <div
                          key={`inv-${index}`}
                          onClick={(e) => {
                            if (e.shiftKey && chestPos) {
                              handleSlotShiftClick('inv', index, e);
                            } else {
                              handleSlotClick('inv', index);
                            }
                          }}
                          className={`relative w-10 h-10 rounded-none border flex items-center justify-center cursor-pointer select-none transition-all ${
                            isHotbar
                              ? 'border-yellow-400/50 bg-[#515eb5]/30 hover:border-yellow-400'
                              : 'border-white/10 bg-[#334491] hover:border-white/30'
                          }`}
                          title={`${slot?.item.name || 'Empty Slot'} (Index ${index + 1}) - Hold Shift+Click to transfer`}
                        >
                          {slot ? (
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-base">{slot.item.spriteChar || '📦'}</span>
                              <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                                {slot.count > 1 ? slot.count : ''}
                              </span>
                            </div>
                          ) : null}
                          
                          {/* Item tooltip summary on hover */}
                          {slot && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden hover:block group-hover:block z-30 bg-[#303e83] border border-white/20 p-2 rounded-none text-[10px] w-28 pointer-events-none text-slate-100">
                              <b className="text-white block">{slot.item.name}</b>
                              <span>{slot.item.description}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Guide NPC Tips Dialogue inside Inventory footer */}
                {guideAdvice && (
                  <div className="p-3 bg-[#303e83]/40 border-t-2 border-[#303e83]/80 flex gap-2.5 items-start">
                    <MessageSquare className="w-4 h-4 text-yellow-300 mt-0.5 shrink-0" />
                    <div className="text-[10px] text-blue-100 leading-relaxed">
                      <b className="text-white block pb-0.5">Guide Advice:</b>
                      "{guideAdvice}"
                    </div>
                  </div>
                )}
              </div>

              {/* --- PANEL C: CHEST STORAGE (cols 3) --- */}
              <div className="col-span-3 border-l-2 border-[#303e83] flex flex-col overflow-hidden bg-[#334491]/35">
                <div className="p-3 bg-[#303e83]/20 border-b-2 border-[#303e83]/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs font-bold text-blue-100">TREASURE CHEST</span>
                  </div>
                  {chestPos ? (
                    <span className="text-[8px] font-bold bg-[#3e4a8f] border border-white/10 text-yellow-300 px-1 py-0.5 rounded-none">OPEN</span>
                  ) : (
                    <span className="text-[8px] font-bold bg-[#303e83] border border-white/10 text-blue-300 px-1 py-0.5 rounded-none">CLOSED</span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
                  {chestPos ? (
                    <div className="grid grid-cols-5 gap-1.5">
                      {gameEngine.chestInventory.map((slot, index) => {
                        return (
                          <div
                            key={`chest-${index}`}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                handleSlotShiftClick('chest', index, e);
                              } else {
                                handleSlotClick('chest', index);
                              }
                            }}
                            className="relative w-10 h-10 rounded-none border border-white/10 bg-[#334491] hover:border-white/30 cursor-pointer flex items-center justify-center select-none"
                            title={`${slot?.item.name || 'Empty Chest Slot'} - Shift+Click to retrieve`}
                          >
                            {slot ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className="text-base">{slot.item.spriteChar || '📦'}</span>
                                <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-white">
                                  {slot.count > 1 ? slot.count : ''}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <Archive className="w-8 h-8 text-blue-200/40 mb-2" />
                      <span className="text-[10px] text-blue-200/80 leading-normal">
                        Stand near a placed Chest block and press <b className="text-white">[Right-Click]</b> or <b className="text-white">[F]</b> to open storage chest.
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Instruction tooltip banner */}
            <div className="px-4 py-2 border-t-2 border-[#303e83] bg-[#303e83]/20 text-[10px] text-blue-200 flex justify-between items-center">
              <span>💡 Shift+Click an item to immediately transfer it between inventory and chest.</span>
              <span>Active Hotbar: {gameEngine.hotbarIndex + 1}/10</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MOUSE CURSOR CARRIED ITEM ICON (Only if cursor item exists) */}
      {cursorItem && (
        <div
          className="fixed pointer-events-none select-none z-50 text-xl flex items-center justify-center"
          style={{
            left: `${gameEngine.mouse.clientX}px`,
            top: `${gameEngine.mouse.clientY}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span>{cursorItem.item.spriteChar || '📦'}</span>
          {cursorItem.count > 1 && (
            <span className="absolute bottom-[-6px] right-[-6px] text-[10px] font-mono font-black text-white bg-slate-950 px-1 py-0.2 rounded border border-slate-700">
              {cursorItem.count}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
