/**
 * KarnArchery - Master Screen Navigation System
 * Coordinates transitions across:
 * Home Menu -> Chapter Selection -> Level Selection -> 3D Gameplay -> Result -> Next Level
 */

import { gameState, STATES } from './gameState.js';
import { chapterManager } from './chapterManager.js';
import { levelManager } from './levelManager.js';
import { storage } from './storage.js';
import { audio } from './audio.js';
import { isMobileOrTablet } from './deviceDetection.js';

export class NavigationManager {
  constructor(game) {
    this.game = game;

    // Cache Screen Elements
    this.screenHome = document.getElementById('menu-container');
    this.screenChapters = document.getElementById('chapter-select-screen');
    this.screenLevels = document.getElementById('level-select-screen');
    this.hudContainer = document.getElementById('hud-container');

    // Modals
    this.customizationModal = document.getElementById('customization-modal');
    this.challengeModal = document.getElementById('challenge-modal');
    this.settingsModal = document.getElementById('settings-modal');
    this.creditsModal = document.getElementById('credits-modal');
    this.resultModal = document.getElementById('result-modal');
    this.pauseModal = document.getElementById('pause-modal');
    this.confirmResetModal = document.getElementById('confirm-reset-modal');

    // Wire Navigation Listeners
    this.bindEvents();

    // Listen to GameState changes
    gameState.onChange((newState, oldState, payload) => {
      this.handleStateChange(newState, oldState, payload);
    });
  }

  bindEvents() {
    // --- Home Screen Buttons ---
    const btnStart = document.getElementById('btn-start-journey');
    if (btnStart) {
      btnStart.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        try { audio.init(); } catch (err) {}
        console.log('🏹 Start Journey clicked -> Opening Chapters');
        this.goToChapters();
      });
    }

    const btnContinue = document.getElementById('btn-continue-story');
    if (btnContinue) {
      btnContinue.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        try { audio.init(); } catch (err) {}
        const nextLvl = Math.min(25, storage.data.unlockedLevels || 1);
        this.startLevel(nextLvl);
      });
    }

    const btnTraining = document.getElementById('btn-training-ground');
    if (btnTraining) {
      btnTraining.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        try { audio.init(); } catch (err) {}
        this.startTraining();
      });
    }

    const btnChallenge = document.getElementById('btn-challenge-mode');
    if (btnChallenge) {
      btnChallenge.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        try { audio.init(); } catch (err) {}
        this.openModal(this.challengeModal);
      });
    }

    const btnCustom = document.getElementById('btn-customization');
    if (btnCustom) {
      btnCustom.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.game.ui.openCustomization();
      });
    }

    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.openModal(this.settingsModal);
      });
    }

    const btnCredits = document.getElementById('btn-credits');
    if (btnCredits) {
      btnCredits.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.openModal(this.creditsModal);
      });
    }

    // --- Chapter Screen Buttons ---
    const btnBackToHome = document.getElementById('btn-back-to-home');
    if (btnBackToHome) {
      btnBackToHome.addEventListener('click', () => {
        this.goToHome();
      });
    }

    // --- Level Screen Buttons ---
    const btnBackToChapters = document.getElementById('btn-back-to-chapters');
    if (btnBackToChapters) {
      btnBackToChapters.addEventListener('click', () => {
        this.goToChapters();
      });
    }

    const btnLevelsToHome = document.getElementById('btn-levels-to-home');
    if (btnLevelsToHome) {
      btnLevelsToHome.addEventListener('click', () => {
        this.goToHome();
      });
    }

    // --- Result Modal Action Buttons ---
    const btnNext = document.getElementById('btn-result-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.closeModal(this.resultModal);
        this.nextLevel();
      });
    }

    const btnRetry = document.getElementById('btn-result-retry');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        this.closeModal(this.resultModal);
        this.restartCurrentLevel();
      });
    }

    const btnResultLevels = document.getElementById('btn-result-levels');
    if (btnResultLevels) {
      btnResultLevels.addEventListener('click', () => {
        this.closeModal(this.resultModal);
        const chId = this.game.gameplay.currentLevelConfig ? this.game.gameplay.currentLevelConfig.chapter : 1;
        this.goToLevels(chId);
      });
    }

    const btnResultMenu = document.getElementById('btn-result-menu');
    if (btnResultMenu) {
      btnResultMenu.addEventListener('click', () => {
        this.closeModal(this.resultModal);
        this.goToHome();
      });
    }

    // --- Pause Modal Buttons ---
    const btnResume = document.getElementById('btn-pause-resume');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        this.resumeGame();
      });
    }

    const btnPauseRestart = document.getElementById('btn-pause-restart');
    if (btnPauseRestart) {
      btnPauseRestart.addEventListener('click', () => {
        this.closeModal(this.pauseModal);
        this.restartCurrentLevel();
      });
    }

    const btnPauseSettings = document.getElementById('btn-pause-settings');
    if (btnPauseSettings) {
      btnPauseSettings.addEventListener('click', () => {
        this.openModal(this.settingsModal);
      });
    }

    const btnPauseMenu = document.getElementById('btn-pause-menu');
    if (btnPauseMenu) {
      btnPauseMenu.addEventListener('click', () => {
        this.closeModal(this.pauseModal);
        this.goToHome();
      });
    }

    // --- Restart Entire Game Buttons (Main Menu, Settings, Pause) ---
    const restartGameButtons = [
      document.getElementById('btn-restart-game'),
      document.getElementById('btn-settings-restart-game'),
      document.getElementById('btn-pause-restart-game')
    ];

    restartGameButtons.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          this.confirmAndResetGame();
        });
      }
    });

    // Confirmation Modal Action Buttons
    const btnConfirmReset = document.getElementById('btn-confirm-reset');
    if (btnConfirmReset) {
      btnConfirmReset.addEventListener('click', () => {
        this.closeModal(this.confirmResetModal);
        if (this.game && typeof this.game.executeCompleteReset === 'function') {
          this.game.executeCompleteReset();
        }
      });
    }

    const btnCancelReset = document.getElementById('btn-cancel-reset');
    if (btnCancelReset) {
      btnCancelReset.addEventListener('click', () => {
        this.closeModal(this.confirmResetModal);
      });
    }

    // Dynamic responsive listeners for mobile controls visibility
    window.addEventListener('resize', () => {
      this.updateMobileControlsVisibility();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateMobileControlsVisibility(), 150);
    });
  }

  updateMobileControlsVisibility(state = gameState.current) {
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;

    const isGameplay = (state === STATES.PLAYING || state === STATES.TRAINING);
    const showMobile = isGameplay && isMobileOrTablet();

    if (showMobile) {
      mobileControls.classList.remove('hidden');
      mobileControls.style.display = 'block';
    } else {
      mobileControls.classList.add('hidden');
      mobileControls.style.display = 'none';
    }
  }

  confirmAndResetGame() {
    if (this.confirmResetModal) {
      this.openModal(this.confirmResetModal);
    } else {
      const confirmed = window.confirm("Are you sure you want to restart the entire game? All progress will be lost.");
      if (confirmed) {
        if (this.game && typeof this.game.executeCompleteReset === 'function') {
          this.game.executeCompleteReset();
        }
      }
    }
  }

  handleStateChange(newState, oldState, payload) {
    // Hide all full screens
    if (this.screenHome) this.screenHome.classList.add('hidden');
    if (this.screenChapters) this.screenChapters.classList.add('hidden');
    if (this.screenLevels) this.screenLevels.classList.add('hidden');
    if (this.hudContainer) this.hudContainer.classList.add('hidden');

    this.updateMobileControlsVisibility(newState);

    switch (newState) {
      case STATES.HOME:
        if (this.screenHome) this.screenHome.classList.remove('hidden');
        this.game.gameplay.cameraManager.setMode('menu');
        this.game.controls.setEnabled(false);
        this.game.ui.updateStatusFooter();
        break;

      case STATES.CHAPTERS:
        if (this.screenChapters) this.screenChapters.classList.remove('hidden');
        this.game.gameplay.cameraManager.setMode('menu');
        this.game.controls.setEnabled(false);
        this.renderChaptersScreen();
        break;

      case STATES.LEVELS:
        if (this.screenLevels) this.screenLevels.classList.remove('hidden');
        this.game.gameplay.cameraManager.setMode('menu');
        this.game.controls.setEnabled(false);
        this.renderLevelsScreen(payload.chapterId || gameState.selectedChapterId);
        break;

      case STATES.PLAYING:
      case STATES.TRAINING:
        if (this.hudContainer) this.hudContainer.classList.remove('hidden');
        this.game.controls.setEnabled(true);
        break;

      case STATES.PAUSED:
        if (this.hudContainer) this.hudContainer.classList.remove('hidden');
        this.openModal(this.pauseModal);
        this.game.controls.setEnabled(false);
        break;

      case STATES.RESULT:
        if (this.hudContainer) this.hudContainer.classList.remove('hidden');
        this.openModal(this.resultModal);
        this.game.controls.setEnabled(false);
        break;
    }
  }

  // --- Screen Transitions ---

  goToHome() {
    this.closeAllModals();
    this.game.gameplay.clearArrows();
    gameState.setState(STATES.HOME);

    if (this.screenHome) this.screenHome.classList.remove('hidden');
    if (this.screenChapters) this.screenChapters.classList.add('hidden');
    if (this.screenLevels) this.screenLevels.classList.add('hidden');
    if (this.hudContainer) this.hudContainer.classList.add('hidden');
    this.game.gameplay.cameraManager.setMode('menu');
    this.game.controls.setEnabled(false);
    this.game.ui.updateStatusFooter();
  }

  goToChapters() {
    this.closeAllModals();
    gameState.setState(STATES.CHAPTERS);

    // Guaranteed DOM visibility transition
    if (this.screenHome) this.screenHome.classList.add('hidden');
    if (this.screenChapters) this.screenChapters.classList.remove('hidden');
    if (this.screenLevels) this.screenLevels.classList.add('hidden');
    if (this.hudContainer) this.hudContainer.classList.add('hidden');
    this.game.gameplay.cameraManager.setMode('menu');
    this.game.controls.setEnabled(false);
    this.renderChaptersScreen();
  }

  goToLevels(chapterId) {
    this.closeAllModals();
    const chId = parseInt(chapterId) || 1;
    gameState.setState(STATES.LEVELS, { chapterId: chId });

    // Guaranteed DOM visibility transition
    if (this.screenHome) this.screenHome.classList.add('hidden');
    if (this.screenChapters) this.screenChapters.classList.add('hidden');
    if (this.screenLevels) this.screenLevels.classList.remove('hidden');
    if (this.hudContainer) this.hudContainer.classList.add('hidden');
    this.game.gameplay.cameraManager.setMode('menu');
    this.game.controls.setEnabled(false);
    this.renderLevelsScreen(chId);
  }

  startLevel(levelId) {
    this.closeAllModals();
    const config = levelManager.getLevel(levelId);
    gameState.setState(STATES.PLAYING, {
      levelId: config.id,
      chapterId: config.chapter,
      levelConfig: config,
      isTrainingMode: false
    });

    if (this.screenHome) this.screenHome.classList.add('hidden');
    if (this.screenChapters) this.screenChapters.classList.add('hidden');
    if (this.screenLevels) this.screenLevels.classList.add('hidden');
    if (this.hudContainer) this.hudContainer.classList.remove('hidden');

    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        mobileControls.classList.remove('hidden');
      } else {
        mobileControls.classList.add('hidden');
      }
    }

    this.game.gameplay.loadLevel(config, false);
    this.game.ui.setupLevelHUD(config, config.arrows || 5);
    const windRad = ((config.windDirDeg || 0) * Math.PI) / 180;
    this.game.ui.updateWind(config.windSpeed || 0, windRad);
    this.game.ui.setCameraModeLabel(this.game.gameplay.cameraManager.mode);
    this.game.controls.setEnabled(true);
  }

  startTraining() {
    this.closeAllModals();
    const config = {
      id: 0,
      chapter: 1,
      name: 'Training Ground',
      objective: 'Practice your aim, compensate for wind, and perfect your bullseyes.',
      distance: 35,
      targetType: 'stationary',
      targetRadius: 0.8,
      windSpeed: 2.5,
      windDirDeg: 90,
      arrows: 999,
      targetScore: 500,
      lighting: 'afternoon'
    };
    gameState.setState(STATES.TRAINING, {
      levelId: 0,
      levelConfig: config,
      isTrainingMode: true
    });

    if (this.screenHome) this.screenHome.classList.add('hidden');
    if (this.screenChapters) this.screenChapters.classList.add('hidden');
    if (this.screenLevels) this.screenLevels.classList.add('hidden');
    if (this.hudContainer) this.hudContainer.classList.remove('hidden');

    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        mobileControls.classList.remove('hidden');
      } else {
        mobileControls.classList.add('hidden');
      }
    }

    this.game.gameplay.loadLevel(config, true);
    this.game.ui.setupLevelHUD(config, 999);
    const windRad = ((config.windDirDeg || 0) * Math.PI) / 180;
    this.game.ui.updateWind(config.windSpeed || 0, windRad);
    this.game.ui.setCameraModeLabel(this.game.gameplay.cameraManager.mode);
    this.game.controls.setEnabled(true);
  }

  startSpecialChallenge(challengeId) {
    this.closeAllModals();
    const config = levelManager.getSpecialChallenge(challengeId);
    gameState.setState(STATES.PLAYING, {
      levelId: config.id,
      chapterId: config.chapter,
      levelConfig: config,
      isTrainingMode: false
    });

    if (this.screenHome) this.screenHome.classList.add('hidden');
    if (this.screenChapters) this.screenChapters.classList.add('hidden');
    if (this.screenLevels) this.screenLevels.classList.add('hidden');
    if (this.hudContainer) this.hudContainer.classList.remove('hidden');

    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        mobileControls.classList.remove('hidden');
      } else {
        mobileControls.classList.add('hidden');
      }
    }

    this.game.gameplay.loadLevel(config, false);
    this.game.ui.setupLevelHUD(config, config.arrows || 5);
    const windRad = ((config.windDirDeg || 0) * Math.PI) / 180;
    this.game.ui.updateWind(config.windSpeed || 0, windRad);
    this.game.ui.setCameraModeLabel(this.game.gameplay.cameraManager.mode);
    this.game.controls.setEnabled(true);
  }

  restartCurrentLevel() {
    if (gameState.currentLevelConfig) {
      if (gameState.isTrainingMode) {
        this.startTraining();
      } else {
        this.startLevel(gameState.currentLevelConfig.id);
      }
    }
  }

  nextLevel() {
    const next = levelManager.getNextLevel(gameState.currentLevelId);
    if (next) {
      this.startLevel(next.id);
    } else {
      this.goToChapters();
    }
  }

  pauseGame() {
    if (gameState.isPlaying() || gameState.current === STATES.TRAINING) {
      gameState.setState(STATES.PAUSED);
    }
  }

  resumeGame() {
    if (gameState.isPaused()) {
      this.closeModal(this.pauseModal);
      gameState.setState(gameState.isTrainingMode ? STATES.TRAINING : STATES.PLAYING);
    }
  }

  // --- Dynamic Renderers ---

  renderChaptersScreen() {
    const container = document.getElementById('chapters-screen-grid');
    if (!container) return;
    container.innerHTML = '';

    const chapters = chapterManager.getAllChapters();
    chapters.forEach(ch => {
      const isUnlocked = chapterManager.isChapterUnlocked(ch.id);
      const progress = chapterManager.getChapterProgress(ch.id);

      const card = document.createElement('div');
      card.className = `royal-chapter-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      card.innerHTML = `
        <div class="chapter-card-header">
          <span class="chapter-badge">CHAPTER ${ch.id}</span>
          <span class="chapter-star-badge">⭐ ${progress.stars}/${progress.maxStars}</span>
        </div>
        <div class="chapter-card-body">
          <span class="chapter-icon">${ch.icon}</span>
          <h3 class="chapter-name">${ch.title}</h3>
          <h5 class="chapter-sub">${ch.subtitle}</h5>
          <p class="chapter-desc">${ch.description}</p>
        </div>
        <div class="chapter-card-footer">
          <button type="button" class="btn-mythic ${isUnlocked ? 'primary' : 'disabled'}" ${!isUnlocked ? 'disabled' : ''}>
            ${isUnlocked ? 'Select Chapter' : '🔒 Locked'}
          </button>
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.goToLevels(ch.id);
        });
        const btn = card.querySelector('button');
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.goToLevels(ch.id);
          });
        }
      }

      container.appendChild(card);
    });
  }

  renderLevelsScreen(chapterId) {
    const ch = chapterManager.getChapter(chapterId);
    const heading = document.getElementById('level-screen-heading');
    const subHeading = document.getElementById('level-screen-subheading');
    const progressBadge = document.getElementById('level-screen-progress');
    const container = document.getElementById('levels-screen-grid');

    if (heading) heading.textContent = `Chapter ${ch.id}: ${ch.title}`;
    if (subHeading) subHeading.textContent = ch.subtitle;

    const progress = chapterManager.getChapterProgress(ch.id);
    if (progressBadge) {
      progressBadge.textContent = `⭐ ${progress.stars}/${progress.maxStars} Stars Earned`;
    }

    if (!container) return;
    container.innerHTML = '';

    const levels = levelManager.getLevelsForChapter(ch.id);
    levels.forEach(lvl => {
      const isUnlocked = levelManager.isLevelUnlocked(lvl.id);
      const stars = storage.getLevelStars(lvl.id);
      const highScore = storage.data.levelHighScores[lvl.id] || 0;

      const card = document.createElement('div');
      card.className = `royal-level-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      const starIcons = '★'.repeat(stars) + '☆'.repeat(3 - stars);

      card.innerHTML = `
        <div class="level-card-top">
          <div class="level-badge-num">LEVEL ${lvl.id}</div>
          <div class="level-stars-display ${stars > 0 ? 'earned' : ''}">${isUnlocked ? starIcons : '🔒'}</div>
        </div>
        <h4 class="level-card-title">${lvl.name}</h4>
        <p class="level-card-objective">${lvl.objective}</p>
        <div class="level-card-stats">
          <span>🎯 ${lvl.distance}m</span>
          <span>🏹 ${lvl.arrows} Arrows</span>
          <span>🎯 Target: ${lvl.targetScore}</span>
        </div>
        <div class="level-card-footer">
          <span class="level-highscore">${highScore > 0 ? `Best: ${highScore} pts` : ''}</span>
          <button type="button" class="btn-mythic ${isUnlocked ? 'primary' : 'disabled'}" ${!isUnlocked ? 'disabled' : ''}>
            ${isUnlocked ? (stars > 0 ? 'Replay' : 'Play Level') : 'Locked'}
          </button>
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.startLevel(lvl.id);
        });
        const btn = card.querySelector('button');
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startLevel(lvl.id);
          });
        }
      }

      container.appendChild(card);
    });
  }

  // --- Modal Helpers ---

  openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  closeAllModals() {
    const modals = [
      this.customizationModal,
      this.challengeModal,
      this.settingsModal,
      this.creditsModal,
      this.resultModal,
      this.pauseModal,
      this.confirmResetModal
    ];
    modals.forEach(m => this.closeModal(m));
  }
}

