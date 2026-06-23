/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { gameEngine } from '../gameEngine';
import { Play, Sparkles, Trash2, HelpCircle, User, Map, Volume2 } from 'lucide-react';
import { audio } from '../audio';

interface MainMenuProps {
  onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [hasSave, setHasSave] = useState(() => localStorage.getItem('terraria_copy_save') !== null);
  const [playerName, setPlayerName] = useState('Terrarian');
  
  // Custom colors
  const [hairColor, setHairColor] = useState('#00F5FF');
  const [shirtColor, setShirtColor] = useState('#C0C0C0');
  const [pantsColor, setPantsColor] = useState('#B87333');

  // World size
  const [worldSize, setWorldSize] = useState<'small' | 'medium' | 'large'>('medium');

  const handleStartFresh = () => {
    // Determine bounds
    let w = 240, h = 100;
    if (worldSize === 'small') { w = 160; h = 80; }
    if (worldSize === 'large') { w = 320; h = 120; }

    // Init engine fresh
    gameEngine.startNewWorld(w, h);
    
    // Inject customized player metrics
    gameEngine.player.id = 'player_id';
    // We can store hair/shirt/pants color options or use standard palette. For maximum elegance we will load these custom styling properties!
    (gameEngine.player as any).hairColor = hairColor;
    (gameEngine.player as any).shirtColor = shirtColor;
    (gameEngine.player as any).pantsColor = pantsColor;

    // Trigger start
    audio.playSfx('bossSpawn'); // play epic roar on start
    onStartGame();
  };

  const handleResume = () => {
    gameEngine.initDefaultGame();
    audio.playSfx('coin');
    onStartGame();
  };

  const handleDeleteSave = () => {
    if (window.confirm("Are you sure you want to delete your current world and character progress? This cannot be undone.")) {
      gameEngine.deleteSave();
      setHasSave(false);
      audio.playSfx('dig');
    }
  };

  const PRESET_HAIR = ['#00F5FF', '#FF007F', '#FFD700', '#32CD32', '#9370DB', '#FF4500', '#FFFFFF', '#1A1A1A'];
  const PRESET_SHIRT = ['#C0C0C0', '#4169E1', '#FF3333', '#228B22', '#FFA500', '#800080', '#F5F5DC', '#333333'];

  return (
    <div className="w-full h-full min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4 overflow-y-auto select-none relative font-sans">
      
      {/* 1. Game World Layer (The Background) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#5c94ff] to-[#a4c5ff] overflow-hidden">
        {/* Sun */}
        <div className="absolute top-12 left-24 w-20 h-20 bg-[#fff5a0] rounded-full shadow-[0_0_40px_#fff5a0]"></div>
        
        {/* Clouds */}
        <div className="absolute top-20 right-40 w-32 h-10 bg-white/60 rounded-full blur-md"></div>
        <div className="absolute top-48 left-1/3 w-48 h-12 bg-white/40 rounded-full blur-lg"></div>
        
        {/* Background Forest Layer */}
        <div className="absolute bottom-0 w-full h-[300px] flex items-end opacity-40">
          <div className="flex-1 h-64 bg-[#2d5a27] rounded-t-full -mb-10 mx-[-20px]"></div>
          <div className="flex-1 h-80 bg-[#1e4d1a] rounded-t-full -mb-10 mx-[-20px]"></div>
          <div className="flex-1 h-56 bg-[#2d5a27] rounded-t-full -mb-10 mx-[-20px]"></div>
        </div>
      </div>

      {/* 2. Main Bento-Style Card Terminal */}
      <div className="w-full max-w-3xl bg-[#4157b2]/95 border-4 border-[#303e83] p-8 rounded-none shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col items-center gap-8 relative z-10">
        
        {/* Glowing Title Header */}
        <div className="text-center flex flex-col gap-2">
          <div className="text-xs font-bold tracking-[0.4em] text-yellow-300 uppercase animate-pulse">2D Sandbox Adventure</div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            Terraria Pixel Craft
          </h1>
          <p className="text-xs text-blue-200 font-mono">Procedural world generation • Real-time lighting • Boss battles • Bento theme</p>
        </div>

        {/* Double Column Configuration */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Column A: Character Customizer */}
          <div className="bg-[#334491] p-5 rounded-none border-2 border-[#303e83] flex flex-col gap-4 text-white">
            <h2 className="text-sm font-bold text-blue-200 border-b border-[#303e83] pb-2 flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4 text-yellow-300" />
              CREATE YOUR HERO
            </h2>

            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-blue-200 uppercase tracking-widest">HERO NAME</label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value.slice(0, 14))}
                className="bg-[#303e83] border border-white/20 rounded-none px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-yellow-400 w-full"
                placeholder="Enter character name..."
              />
            </div>

            {/* Hair Color picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-blue-200 flex justify-between uppercase tracking-widest">
                <span>HAIR COLOR</span>
                <span className="font-bold text-yellow-300" style={{ color: hairColor }}>{hairColor}</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HAIR.map(col => (
                  <button
                    key={`hair-${col}`}
                    onClick={() => { setHairColor(col); audio.playSfx('click' as any); }}
                    className={`w-6 h-6 rounded-none border transition-transform ${hairColor === col ? 'scale-110 border-white shadow-lg' : 'border-[#303e83] hover:scale-105'}`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            {/* Shirt Color Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-blue-200 flex justify-between uppercase tracking-widest">
                <span>ARMOR SHIRT COLOR</span>
                <span className="font-bold text-yellow-300" style={{ color: shirtColor }}>{shirtColor}</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SHIRT.map(col => (
                  <button
                    key={`shirt-${col}`}
                    onClick={() => { setShirtColor(col); audio.playSfx('click' as any); }}
                    className={`w-6 h-6 rounded-none border transition-transform ${shirtColor === col ? 'scale-110 border-white shadow-lg' : 'border-[#303e83] hover:scale-105'}`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            {/* Preview Figure */}
            <div className="mt-2 bg-[#303e83]/40 p-3 rounded-none border border-[#303e83] flex items-center gap-4">
              {/* Figure canvas replica */}
              <div className="w-12 h-16 bg-[#334491] rounded-none border-2 border-[#303e83] flex flex-col items-center justify-center p-2 relative">
                {/* Hair */}
                <div className="w-6 h-3 rounded-t-sm" style={{ backgroundColor: hairColor }}></div>
                {/* Skin Face */}
                <div className="w-5 h-4 bg-[#FFE4C4] relative">
                  <div className="w-1 h-1 bg-black absolute top-1 right-1"></div>
                </div>
                {/* Shirt */}
                <div className="w-6 h-5" style={{ backgroundColor: shirtColor }}></div>
                {/* Pants */}
                <div className="w-5 h-2.5" style={{ backgroundColor: pantsColor }}></div>
              </div>

              <div className="flex flex-col gap-0.5 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">{playerName}</span>
                <span className="text-[10px] font-mono text-blue-200">Class: Recruit Explorer</span>
                <span className="text-[10px] font-mono text-yellow-300">Health: 100 • Defense: 0</span>
              </div>
            </div>
          </div>

          {/* Column B: World Configuration */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* World size selections */}
            <div className="bg-[#334491] p-5 rounded-none border-2 border-[#303e83] flex flex-col gap-4 text-white">
              <h2 className="text-sm font-bold text-blue-200 border-b border-[#303e83] pb-2 flex items-center gap-2 uppercase tracking-wider">
                <Map className="w-4 h-4 text-yellow-300" />
                WORLD SCALE SPEC
              </h2>

              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map(sz => (
                  <button
                    key={`world-${sz}`}
                    onClick={() => { setWorldSize(sz); audio.playSfx('click' as any); }}
                    className={`px-3 py-3 rounded-none border font-bold text-xs transition-all flex flex-col items-center gap-1.5 ${
                      worldSize === sz
                        ? 'border-yellow-400 bg-[#515eb5] text-yellow-200 shadow-[0_0_8px_rgba(250,204,21,0.2)]'
                        : 'border-[#303e83] bg-[#3e4a8f]/60 text-blue-200 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span className="capitalize">{sz}</span>
                    <span className="text-[9px] font-normal text-blue-300/80">
                      {sz === 'small' ? '160x80' : sz === 'medium' ? '240x100' : '320x120'}
                    </span>
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-mono text-blue-200 leading-normal bg-[#303e83]/30 p-2.5 rounded-none border border-[#303e83]">
                💡 Small generates super fast. Large offers huge deep cavern mines and multiple corruption chasms to explore!
              </div>
            </div>

            {/* Launch Actions Container */}
            <div className="flex flex-col gap-3">
              {hasSave ? (
                <button
                  id="resume-btn"
                  onClick={handleResume}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold text-sm py-4 rounded-none shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer border-2 border-yellow-300"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  RESUME ADVENTURE
                </button>
              ) : null}

              <button
                id="start-fresh-btn"
                onClick={handleStartFresh}
                className={`w-full bg-[#3e4a8f] hover:bg-[#515eb5] text-white font-bold text-sm py-4 rounded-none border-2 border-[#303e83] shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer ${!hasSave ? 'bg-gradient-to-r from-yellow-500 to-amber-500 border-2 border-yellow-300 py-5 text-slate-950 shadow-xl hover:from-yellow-400 hover:to-amber-400' : ''}`}
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                {hasSave ? 'REGENERATE NEW WORLD' : 'CREATE INITIAL WORLD'}
              </button>

              {hasSave && (
                <button
                  id="delete-save-btn"
                  onClick={handleDeleteSave}
                  className="text-red-400 hover:text-red-300 text-[10px] font-bold flex items-center gap-1.5 justify-center py-1 mt-1 transition hover:underline uppercase tracking-wider"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  DELETE SAVE DATA
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Audio Context Alert Hint */}
        <div className="text-[10px] text-blue-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Volume2 className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
          Make sure your system sound is enabled to enjoy the retro dynamic procedural music!
        </div>

      </div>

    </div>
  );
};
