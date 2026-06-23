/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private musicVolume: GainNode | null = null;
  private isMuted: boolean = false;
  private currentTrack: string | null = null;
  private bgmInterval: any = null;
  private bgmTime: number = 0;

  constructor() {
    // Initialized on first interaction
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterVolume.connect(this.ctx.destination);

      this.musicVolume = this.ctx.createGain();
      this.musicVolume.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this.musicVolume.connect(this.masterVolume);

      this.startBgmLoop();
    } catch (e) {
      console.warn("AudioContext failed to start", e);
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.masterVolume && this.ctx) {
      this.masterVolume.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  getMuteStatus() {
    return this.isMuted;
  }

  playSfx(type: 'jump' | 'dig' | 'place' | 'swing' | 'hit' | 'hurtEnemy' | 'craft' | 'bossSpawn' | 'bossScream' | 'coin' | 'shoot') {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterVolume!);

    switch (type) {
      case 'jump':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(350, t + 0.15);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;

      case 'dig':
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.setValueAtTime(100, t + 0.05);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
        break;

      case 'place':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'swing':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
        break;

      case 'hit':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.linearRampToValueAtTime(60, t + 0.2);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;

      case 'hurtEnemy':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.linearRampToValueAtTime(120, t + 0.12);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
        break;

      case 'craft':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.setValueAtTime(450, t + 0.08);
        osc.frequency.setValueAtTime(600, t + 0.16);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;

      case 'bossSpawn':
        // Giant dramatic rawr!
        this.playRoar(1.2);
        break;

      case 'bossScream':
        // Fast angry screech!
        this.playRoar(0.6);
        break;

      case 'coin':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, t); // B5
        osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case 'shoot':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
    }
  }

  private playRoar(durationScale: number) {
    if (!this.ctx || !this.masterVolume) return;
    const t = this.ctx.currentTime;
    
    // Multiple oscillators to create a thick growling sound
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(60 + i * 25, t);
      osc.frequency.linearRampToValueAtTime(30, t + 0.8 * durationScale);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(80, t + 0.8 * durationScale);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.8 * durationScale);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterVolume);
      
      osc.start(t);
      osc.stop(t + 0.8 * durationScale);
    }
  }

  setTrack(track: 'forest' | 'cave' | 'night' | 'boss') {
    this.init();
    if (this.currentTrack === track) return;
    this.currentTrack = track;
    this.bgmTime = 0; // reset melody progress
  }

  private startBgmLoop() {
    if (this.bgmInterval) return;
    
    // Procedural chip-tune scheduler
    const stepTime = 160; // 160ms per 16th note (approx 94 BPM)
    let step = 0;

    // Melodies defined by scale offsets
    const scale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00]; // Pentatonic major
    const minorScale = [110.00, 123.47, 130.81, 146.83, 164.81, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63]; // Pentatonic minor
    
    // Forest happy loop (Major)
    const forestMelody = [
      4, -1, 5, 7, 8, -1, 7, 5,
      6, -1, 4, 2, 4, -1, -1, -1,
      4, -1, 5, 7, 8, -1, 9, 8,
      7, 5, 7, 8, 9, -1, -1, -1
    ];
    const forestBass = [
      1, 1, 1, 1, 3, 3, 3, 3,
      4, 4, 4, 4, 2, 2, 2, 2,
      1, 1, 1, 1, 3, 3, 3, 3,
      5, 5, 4, 4, 1, 1, 1, 1
    ];

    // Cave atmospheric loop (Deep, echoey, minor)
    const caveMelody = [
      2, -1, -1, 5, 4, -1, -1, -1,
      1, -1, -1, 4, 3, -1, -1, -1,
      2, -1, -1, 6, 5, -1, 8, -1,
      7, -1, 5, -1, 2, -1, -1, -1
    ];
    const caveBass = [
      0, -1, 0, -1, 1, -1, 1, -1,
      0, -1, 0, -1, 2, -1, 2, -1,
      0, -1, 0, -1, 3, -1, 3, -1,
      1, -1, 2, -1, 0, -1, 0, -1
    ];

    // Night loop (Spooky and slow)
    const nightMelody = [
      4, -1, 3, -1, 5, -1, 4, -1,
      6, -1, 5, -1, 7, -1, -1, -1,
      3, -1, 2, -1, 4, -1, 3, -1,
      5, -1, 4, -1, 1, -1, -1, -1
    ];

    // Boss fight theme (Fast, driving, aggressive!)
    const bossMelody = [
      2, 2, 3, 2, 5, 2, 3, 2,
      6, 5, 4, 3, 2, -1, -1, -1,
      3, 3, 4, 3, 6, 3, 4, 3,
      7, 6, 5, 4, 3, 2, 1, 0
    ];
    const bossBass = [
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      2, 2, 2, 2, 2, 2, 2, 2,
      0, 0, 0, 0, 1, 1, 1, 1
    ];

    this.bgmInterval = setInterval(() => {
      if (!this.ctx || this.isMuted || !this.currentTrack || this.ctx.state === 'suspended') return;
      
      const t = this.ctx.currentTime;
      step = (step + 1) % 32;

      if (this.currentTrack === 'forest') {
        // Play Bass note
        const bassIdx = forestBass[step];
        if (bassIdx !== -1 && step % 2 === 0) {
          this.playBgmNote(scale[bassIdx] * 0.5, 'triangle', 0.15, 0.1);
        }
        // Play Melody note
        const melIdx = forestMelody[step];
        if (melIdx !== -1) {
          this.playBgmNote(scale[melIdx], 'sine', 0.1, 0.05);
        }
        // Occasional soft drum hit
        if (step % 4 === 0) {
          this.playBgmDrum(0.04);
        }
      } 
      else if (this.currentTrack === 'cave') {
        const bassIdx = caveBass[step];
        if (bassIdx !== -1 && step % 4 === 0) {
          this.playBgmNote(minorScale[bassIdx] * 0.5, 'sine', 0.3, 0.12);
        }
        const melIdx = caveMelody[step];
        if (melIdx !== -1 && Math.random() > 0.1) {
          // Play with echoes
          this.playBgmNote(minorScale[melIdx] * 1.5, 'sine', 0.2, 0.03);
          setTimeout(() => {
            if (this.currentTrack === 'cave' && !this.isMuted) {
              this.playBgmNote(minorScale[melIdx] * 1.5, 'sine', 0.1, 0.01);
            }
          }, 240);
        }
      } 
      else if (this.currentTrack === 'night') {
        if (step % 8 === 0) {
          this.playBgmNote(minorScale[1] * 0.5, 'sine', 0.8, 0.08);
        }
        const melIdx = nightMelody[step];
        if (melIdx !== -1) {
          this.playBgmNote(minorScale[melIdx], 'triangle', 0.3, 0.03);
        }
      } 
      else if (this.currentTrack === 'boss') {
        // High intensity
        const bassIdx = bossBass[step];
        if (bassIdx !== -1) {
          // Fast driving baseline
          this.playBgmNote(minorScale[bassIdx] * 0.5, 'sawtooth', 0.1, 0.12);
        }
        const melIdx = bossMelody[step];
        if (melIdx !== -1 && step % 2 === 0) {
          this.playBgmNote(minorScale[melIdx] * 2, 'square', 0.12, 0.06);
        }
        // Fast aggressive drums
        if (step % 2 === 0) {
          this.playBgmDrum(0.08);
        }
        if (step % 8 === 4) {
          this.playSnareDrum(0.04);
        }
      }
    }, stepTime);
  }

  private playBgmNote(freq: number, type: OscillatorType, duration: number, vol: number) {
    if (!this.ctx || !this.musicVolume) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    
    gain.gain.setValueAtTime(vol, t);
    gain.gain.linearRampToValueAtTime(0.001, t + duration);
    
    osc.connect(gain);
    gain.connect(this.musicVolume);
    
    osc.start(t);
    osc.stop(t + duration);
  }

  private playBgmDrum(vol: number) {
    if (!this.ctx || !this.musicVolume) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
    
    gain.gain.setValueAtTime(vol, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.08);
    
    osc.connect(gain);
    gain.connect(this.musicVolume);
    
    osc.start(t);
    osc.stop(t + 0.08);
  }

  private playSnareDrum(vol: number) {
    if (!this.ctx || !this.musicVolume) return;
    const t = this.ctx.currentTime;
    
    // Snare white noise approximation using a rapid high-to-low triangle + short high sine
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    
    gain.gain.setValueAtTime(vol, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.1);
    
    osc.connect(gain);
    gain.connect(this.musicVolume);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }
}

export const audio = new AudioEngine();
