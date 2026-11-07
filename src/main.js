/**
 * KarnArchery - Main Application Entrypoint
 * Instantiates the 3D Game Engine immediately on load.
 * Unlocks Web Audio synthesis on the first user interaction.
 */

import { Game } from './game.js';
import { audio } from './audio.js';
import { AssetLoader } from './loader.js';

function initApp() {
  const loader = new AssetLoader({
    onComplete: (gameInstance) => {
      console.log('✨ All assets loaded. Displaying KarnArchery main menu.');
      const menuContainer = document.getElementById('menu-container');
      if (menuContainer) {
        menuContainer.classList.remove('hidden');
      }
    }
  });

  // Start the loading sequence and initialize the 3D Engine
  loader.start(async () => {
    try {
      const game = new Game();
      game.loader = loader;
      window.karnArchery = game;
      console.log('🏹 KarnArchery 3D Engine successfully initialized.');
      return game;
    } catch (err) {
      console.error('Fatal error initializing KarnArchery:', err);
      throw err;
    }
  });

  // Direct foolproof listener on Start Journey button
  const btnStart = document.getElementById('btn-start-journey');
  if (btnStart) {
    btnStart.addEventListener('click', (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      try { audio.init(); } catch (err) {}
      if (window.karnArchery && window.karnArchery.navigation) {
        window.karnArchery.navigation.goToChapters();
      }
    });
  }

  // AudioContext unlock on first user gesture anywhere
  const unlockAudio = () => {
    try {
      audio.init();
      audio.resume();
      audio.startMusic();
    } catch (e) {
      console.warn('Audio resume:', e);
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };

  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
