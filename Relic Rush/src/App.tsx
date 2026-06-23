/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './components/GameCanvas';
import { InventoryUI } from './components/InventoryUI';
import { gameEngine } from './gameEngine';
import { audio } from './audio';
import { Backpack, LogOut, RefreshCw, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'menu' | 'game'>('menu');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [chestPos, setChestPos] = useState<{ x: number; y: number } | null>(null);
  const [isMuted, setIsMuted] = useState(() => audio.getMuteStatus());

  // Handle first gesture to unlock Web Audio context
  const handleMuteToggle = () => {
    const status = audio.toggleMute();
    setIsMuted(status);
  };

  const handleStartGame = () => {
    setView('game');
  };

  const handleReturnToMenu = () => {
    // Save state before exiting
    gameEngine.saveGame();
    setView('menu');
  };

  // Close chests if player walks too far away
  useEffect(() => {
    if (!chestPos) return;

    const interval = setInterval(() => {
      const px = gameEngine.player.x + gameEngine.player.width / 2;
      const py = gameEngine.player.y + gameEngine.player.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(px - (chestPos.x * 16), 2) + 
        Math.pow(py - (chestPos.y * 16), 2)
      );

      if (distance > 70) { // Walked too far (reach is 4 blocks = 64px)
        gameEngine.openChestPos = null;
        setChestPos(null);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [chestPos]);

  // Clean ambient lighting calculations on startup
  useEffect(() => {
    if (view === 'game') {
      gameEngine.recomputeLighting();
    }
  }, [view]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 relative">
      
      {/* 1. Main Menu view */}
      {view === 'menu' && (
        <MainMenu onStartGame={handleStartGame} />
      )}

      {/* 2. Game Sandbox view */}
      {view === 'game' && (
        <div className="w-full h-full relative flex items-center justify-center">
          
          {/* HTML5 Canvas viewport */}
          <GameCanvas
            onInventoryToggle={() => setIsInventoryOpen(prev => !prev)}
            isInventoryOpen={isInventoryOpen}
            onChestToggle={setChestPos}
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
          />

          {/* Grid Inventory overlay */}
          <InventoryUI
            isOpen={isInventoryOpen}
            onToggle={() => setIsInventoryOpen(prev => !prev)}
            chestPos={chestPos}
          />

          {/* Mouse-friendly HUD controls in top right/mid */}
          <div className="absolute top-2 right-2 flex items-center gap-2 pointer-events-auto z-20">
            {/* Toggle Inventory button (for mouse-only devices/Previews!) */}
            <button
              id="hud-inventory-toggle"
              onClick={() => setIsInventoryOpen(prev => !prev)}
              className={`px-3 py-2 rounded-none font-bold text-xs transition flex items-center gap-1.5 border-2 cursor-pointer ${
                isInventoryOpen
                  ? 'bg-[#515eb5] border-yellow-400 text-yellow-100 shadow-[0_0_8px_rgba(250,204,21,0.2)]'
                  : 'bg-[#3e4a8f]/90 border-[#303e83] text-blue-200 hover:text-white hover:border-white/30'
              }`}
              title="Open Inventory Backpack"
            >
              <Backpack className="w-4 h-4" />
              <span>Backpack [E]</span>
            </button>

            {/* Exit to Menu button */}
            <button
              id="hud-menu-exit"
              onClick={handleReturnToMenu}
              className="px-3 py-2 rounded-none font-bold text-xs bg-[#3e4a8f]/90 border-2 border-[#303e83] text-blue-200 hover:text-white hover:border-white/30 transition flex items-center gap-1.5 cursor-pointer"
              title="Save and exit to menu"
            >
              <LogOut className="w-4 h-4" />
              <span>Save & Quit</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
