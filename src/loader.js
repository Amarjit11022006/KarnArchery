/**
 * KarnArchery - Cinematic Asset Loader & Splash Controller
 * Preloads essential textures, character references, Vedic fonts, and Three.js 3D assets.
 * Displays animated progress bar with Mahabharata status descriptions and retry handling.
 */

const raf = typeof requestAnimationFrame !== 'undefined'
  ? requestAnimationFrame
  : (cb) => setTimeout(cb, 16);

export class AssetLoader {
  constructor(options = {}) {
    this.screen = document.getElementById('loading-screen');
    this.fillBar = document.getElementById('loading-bar-fill');
    this.statusText = document.getElementById('loading-status-text');
    this.percentText = document.getElementById('loading-percent-text');
    this.retryContainer = document.getElementById('loading-retry-container');
    this.retryBtn = document.getElementById('btn-loading-retry');
    this.errorMsg = document.getElementById('loading-error-msg');

    this.onProgress = options.onProgress || null;
    this.onComplete = options.onComplete || null;
    this.onError = options.onError || null;

    this.currentPercent = 0;
    this.targetPercent = 0;
    this.isLoading = false;
    this.rafId = null;

    if (this.retryBtn) {
      this.retryBtn.addEventListener('click', () => {
        if (this.retryContainer) this.retryContainer.style.display = 'none';
        this.start();
      });
    }
  }

  updateUI(percent, status) {
    const clamped = Math.min(100, Math.max(0, Math.round(percent)));
    if (this.fillBar) {
      this.fillBar.style.width = `${clamped}%`;
    }
    if (this.percentText) {
      this.percentText.textContent = `${clamped}%`;
    }
    if (status && this.statusText) {
      this.statusText.textContent = status;
    }
    if (this.onProgress) {
      this.onProgress(clamped, status);
    }
  }

  async setProgressSmooth(targetPercent, status, duration = 300) {
    this.targetPercent = targetPercent;
    if (status && this.statusText) {
      this.statusText.textContent = status;
    }

    const startPercent = this.currentPercent;
    const startTime = performance.now();

    return new Promise((resolve) => {
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Easing out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        this.currentPercent = startPercent + (targetPercent - startPercent) * ease;
        this.updateUI(this.currentPercent);

        if (progress < 1) {
          raf(step);
        } else {
          this.currentPercent = targetPercent;
          this.updateUI(this.currentPercent);
          resolve();
        }
      };
      raf(step);
    });
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`Asset image warning: ${src} failed to load, proceeding with fallback.`);
        resolve(null); // Don't fatally block on single missing decorative image
      };
      img.src = src;
    });
  }

  async start(initEngineCallback) {
    if (this.isLoading) return;
    this.isLoading = true;

    if (this.screen) {
      this.screen.classList.remove('fade-out');
      this.screen.style.display = 'flex';
    }
    if (this.retryContainer) {
      this.retryContainer.style.display = 'none';
    }

    try {
      // Step 1: Initialize canvas & graphics pipeline (0% -> 20%)
      await this.setProgressSmooth(20, 'Summoning Sacred 3D Canvas...', 350);

      // Step 2: Preload core brand imagery & backgrounds (20% -> 45%)
      const coreImages = [
        './images/logo.png',
        './images/karnarchery-logo.png',
        './images/loading-bg.png',
        './images/archer-avatar.png',
        './images/karna.png',
        './images/mahabharata-training-ground.png'
      ];
      await Promise.all(coreImages.map(src => this.preloadImage(src)));
      await this.setProgressSmooth(45, 'Forging Kavach Armor & Vijaya Dhanush...', 350);

      // Step 3: Load Vedic fonts & Mahabharata typography (45% -> 70%)
      if (document.fonts && document.fonts.ready) {
        try {
          await Promise.race([
            document.fonts.ready,
            new Promise(res => setTimeout(res, 1200)) // timeout safeguard
          ]);
        } catch (e) {
          console.warn('Font loading fallback:', e);
        }
      }
      await this.setProgressSmooth(70, 'Awakening Ancient Realms & Arrow Physics...', 350);

      // Step 4: Initialize Three.js Game Engine & Shaders (70% -> 90%)
      let gameInstance = null;
      if (typeof initEngineCallback === 'function') {
        gameInstance = await initEngineCallback();
      }
      await this.setProgressSmooth(90, 'Tuning Procedural Raag Soundscapes...', 300);

      // Step 5: Finalize and complete (90% -> 100%)
      await this.setProgressSmooth(100, 'Destiny Awakens! Entering Realm...', 400);

      // Brief pause to allow player to witness full bar and smooth transition
      await new Promise(r => setTimeout(r, 450));

      this.finish(gameInstance);
    } catch (err) {
      console.error('Fatal error during KarnArchery loading:', err);
      this.isLoading = false;
      if (this.errorMsg) {
        this.errorMsg.textContent = 'Failed to awaken sacred realm: ' + (err.message || 'Error');
      }
      if (this.retryContainer) {
        this.retryContainer.style.display = 'block';
      }
      if (this.statusText) {
        this.statusText.textContent = 'Awakening Interrupted';
      }
      if (this.onError) {
        this.onError(err);
      }
    }
  }

  async showResetLoading(onFinish) {
    if (this.isLoading) return;
    this.isLoading = true;

    if (this.screen) {
      this.screen.classList.remove('fade-out');
      this.screen.style.display = 'flex';
    }
    if (this.retryContainer) {
      this.retryContainer.style.display = 'none';
    }

    try {
      this.currentPercent = 0;
      this.updateUI(0, 'Cleansing Sacred Training Grounds...');
      await this.setProgressSmooth(30, 'Restoring Disciple Bows & Quivers...', 300);
      await this.setProgressSmooth(70, 'Resetting Chapters to Gurukul Level 1...', 300);
      await this.setProgressSmooth(100, 'Destiny Awakens! Journey Begins Anew...', 350);
      await new Promise(r => setTimeout(r, 400));
      
      this.finish(null);
      if (typeof onFinish === 'function') {
        onFinish();
      }
    } catch (err) {
      console.warn('Reset loading screen warning:', err);
      this.finish(null);
      if (typeof onFinish === 'function') {
        onFinish();
      }
    }
  }

  finish(gameInstance) {
    if (this.screen) {
      this.screen.classList.add('fade-out');
      setTimeout(() => {
        this.screen.style.display = 'none';
        this.isLoading = false;
        if (this.onComplete) {
          this.onComplete(gameInstance);
        }
      }, 800);
    } else {
      this.isLoading = false;
      if (this.onComplete) {
        this.onComplete(gameInstance);
      }
    }
  }
}
