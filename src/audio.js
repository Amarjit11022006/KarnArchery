/**
 * KarnArchery - Web Audio Engine
 * Procedural audio synthesis for realistic archery sounds, impacts, chimes, and Indian music.
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.ambientGain = null;
    
    this.isMuted = false;
    this.masterVolume = 0.8;
    this.sfxVolume = 0.9;
    this.musicVolume = 0.65;
    
    this.isMusicPlaying = false;
    this.currentMusicTimer = null;
    this.ambientNoiseNode = null;
    this.bowTensionNode = null;
    this.bowTensionGain = null;

    // Scale notes for procedural Indian music (Raag Bhupali / Yaman pentatonic)
    // C4, D4, E4, G4, A4, C5, D5
    this.raagNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
    this.currentChapter = 1;
  }

  setChapterTheme(chapterId = 1) {
    this.currentChapter = chapterId;
    if (chapterId === 4) {
      // Kurukshetra Raag Bhairav / aggressive notes
      this.raagNotes = [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 493.88];
    } else if (chapterId === 5) {
      // Celestial Raag Yaman
      this.raagNotes = [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25];
    } else {
      // Gurukul Raag Bhupali
      this.raagNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
    }
  }

  /**
   * War Drum (Nagada / Damru) pulse
   */
  playWarDrum() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master output node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Ambient Bus
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.startAmbience();
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  // --- Sound Effects ---

  /**
   * Bowstring Draw Tension sound - changes pitch as power builds
   */
  startBowDraw(powerRatio = 0.1) {
    if (!this.ctx) return;
    this.resume();

    if (!this.bowTensionNode) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(75, this.ctx.currentTime);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      this.bowTensionNode = osc;
      this.bowTensionGain = gain;
    }

    if (this.bowTensionNode && this.bowTensionGain) {
      const freq = 80 + powerRatio * 180;
      this.bowTensionNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
      this.bowTensionGain.gain.setTargetAtTime(0.12 * powerRatio, this.ctx.currentTime, 0.05);
    }
  }

  stopBowDraw() {
    if (this.bowTensionGain && this.ctx) {
      this.bowTensionGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
      setTimeout(() => {
        if (this.bowTensionNode) {
          try { this.bowTensionNode.stop(); } catch (e) {}
          this.bowTensionNode = null;
          this.bowTensionGain = null;
        }
      }, 100);
    }
  }

  /**
   * Bowstring Release "Twang"
   */
  playArrowRelease() {
    if (!this.ctx) return;
    this.resume();
    this.stopBowDraw();

    const now = this.ctx.currentTime;
    
    // Snappy sine / triangle snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);

    // Whoosh noise layer
    this.playNoiseWhoosh(now, 0.25);
  }

  playNoiseWhoosh(startTime, duration = 0.3) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, startTime);
    filter.frequency.exponentialRampToValueAtTime(1200, startTime + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(300, startTime + duration);
    filter.Q.setValueAtTime(2.5, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(startTime);
  }

  /**
   * Arrow Whistle in Flight
   */
  playArrowWhistle() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.5);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Target Wooden Impact "Thump"
   */
  playTargetImpact(isBullseye = false) {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Low pitch thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);

    // Wood crackle noise
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noise.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);

    if (isBullseye) {
      this.playBullseyeChime();
    }
  }

  /**
   * Dropped Arrow Ground Clatter / Subtle Thud
   */
  playArrowDrop() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);

    // Subtle wooden rattle noise
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.09);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noise.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(now);
    } catch (err) {}
  }

  /**
   * Bullseye Golden Divine Chime / Temple Bell
   */
  playBullseyeChime() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Harmonic bell frequencies
    const freqs = [880, 1320, 1760, 2640];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const amp = 0.25 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 2.0);
    });
  }

  /**
   * Victory Fanfare
   */
  playVictorySound() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + i * 0.16;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.7);
    });
  }

  /**
   * Defeat Sound
   */
  playDefeatSound() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const notes = [329.63, 293.66, 261.63, 220.00];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + i * 0.22;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.8);
    });
  }

  // --- Ambient & Procedural Indian Music ---

  startAmbience() {
    if (!this.ctx || this.ambientNoiseNode) return;

    // Filtered pink noise for wind & atmosphere
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.08;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.ambientGain);
    noise.start();

    this.ambientNoiseNode = noise;
  }

  startMusic() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.playNextMusicPhrase();
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.currentMusicTimer) {
      clearTimeout(this.currentMusicTimer);
      this.currentMusicTimer = null;
    }
  }

  playNextMusicPhrase() {
    if (!this.isMusicPlaying || !this.ctx) return;
    this.resume();

    // Procedural Indian Tanpura Drone & Bansuri Flute melody
    const now = this.ctx.currentTime;
    
    // Play a gentle flute note from Raag Bhupali
    const noteFreq = this.raagNotes[Math.floor(Math.random() * this.raagNotes.length)];
    const duration = 1.2 + Math.random() * 1.5;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Subtle vibrato
    osc.frequency.setValueAtTime(noteFreq, now);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);

    if (this.currentChapter === 4 && Math.random() < 0.6) {
      this.playWarDrum();
    }

    // Schedule next note with realistic phrasing pause
    const nextInterval = (duration * 0.8 + Math.random() * 1.2) * 1000;
    this.currentMusicTimer = setTimeout(() => {
      this.playNextMusicPhrase();
    }, nextInterval);
  }
}

export const audio = new AudioManager();

