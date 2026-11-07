/**
 * KarnArchery - Central Game Controller (Optimized Production Architecture)
 * Orchestrates GameplayEngine, ControlsManager, NavigationManager, UIManager,
 * and GameState. Features 60 FPS delta-time physics and zero-leak memory lifecycle.
 */

import * as THREE from 'three';
import { GameplayEngine } from './gameplay.js';
import { ControlsManager } from './controls.js';
import { UIManager } from './ui.js';
import { NavigationManager } from './navigation.js';
import { gameState, STATES } from './gameState.js';
import { chapterManager } from './chapterManager.js';
import { levelManager } from './levelManager.js';
import { storage } from './storage.js';
import { scoring } from './scoring.js';
import { audio } from './audio.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.clock = new THREE.Clock();
    this.isLoopRunning = false;

    // 1. Core 3D Gameplay Engine
    this.gameplay = new GameplayEngine(this.canvas, {
      onShotFired: (remaining, total) => {
        this.ui.renderArrowPips(remaining, total);
      },
      onScoreHit: (scoreInfo) => {
        this.ui.updateScore(scoreInfo.totalScore, scoreInfo.streak);
        this.ui.showScorePopup(scoreInfo);
      },
      onScoreMiss: (missInfo) => {
        this.ui.updateScore(missInfo.totalScore, 0);
        this.ui.showScorePopup(missInfo);
      },
      onAimAssistUpdate: (isTargetLocked, predictedScreenPos) => {
        this.ui.setTargetLocked(isTargetLocked);
        this.ui.updateImpactPip(predictedScreenPos);
      },
      onLevelComplete: (resultData) => {
        gameState.setState(STATES.RESULT);
        this.ui.showResult(resultData);
      }
    });

    // Backwards compatibility properties
    this.archer = this.gameplay.archer;
    this.cameraManager = this.gameplay.cameraManager;
    this.sceneManager = this.gameplay.sceneManager;
    this.environment = this.gameplay.environment;

    // 2. Cross-Platform Controls Manager
    this.controls = new ControlsManager(this.canvas, {
      onAim: (dx, dy) => this.gameplay.onAim(dx, dy),
      onStartDraw: () => this.gameplay.onStartDraw(),
      onDrawPower: (p) => {
        this.gameplay.onDrawPower(p);
        this.ui.updateDrawPower(p);
      },
      onShoot: (p) => {
        this.gameplay.onShoot(p);
        this.ui.updateDrawPower(0);
      },
      onCancelDraw: () => {
        this.gameplay.onCancelDraw();
        this.ui.updateDrawPower(0);
      },
      onCameraToggle: () => this.toggleCamera(),
      onRestart: () => this.restartCurrentLevel(),
      onPause: () => this.togglePause(),
      shouldRequestPointerLock: () => gameState.isPlaying() || gameState.current === STATES.TRAINING
    });

    // 3. UI and Screen Navigation Systems
    this.ui = new UIManager(this);
    this.navigation = new NavigationManager(this);

    // Apply saved sound & quality settings
    const s = storage.getSettings();
    audio.setMasterVolume(s.masterVolume / 100);
    audio.setMusicVolume(s.musicVolume / 100);
    audio.setSfxVolume(s.sfxVolume / 100);
    if (s.quality) {
      this.gameplay.setQuality(s.quality);
    }

    // Set initial bow draw timing
    this.controls.setBowDrawTime(this.archer.bow.config.drawTime);

    // Start single continuous master RAF render loop
    this.startLoop();
  }

  // --- Quality & Bow Customization ---

  setQuality(level = 'high') {
    this.gameplay.setQuality(level);
  }

  setBow(bowId) {
    this.gameplay.setBow(bowId);
    this.controls.setBowDrawTime(this.archer.bow.config.drawTime);
  }

  // --- Gameplay Navigation Delegation ---

  startLevel(levelId) {
    this.navigation.startLevel(levelId);
  }

  startTrainingGround() {
    this.navigation.startTraining();
  }

  startSpecialChallenge(challengeId) {
    this.navigation.startSpecialChallenge(challengeId);
  }

  toggleCamera() {
    const newMode = this.gameplay.toggleCamera();
    this.ui.setCameraModeLabel(newMode);
    return newMode;
  }

  restartCurrentLevel() {
    this.navigation.restartCurrentLevel();
  }

  nextLevel() {
    this.navigation.nextLevel();
  }

  togglePause() {
    if (gameState.isPlaying() || gameState.current === STATES.TRAINING) {
      this.navigation.pauseGame();
    } else if (gameState.isPaused()) {
      this.navigation.resumeGame();
    }
  }

  returnToMenu() {
    this.navigation.goToHome();
  }

  // --- Complete Game Reset Feature ---

  resetEntireGame(skipConfirm = false) {
    if (!skipConfirm) {
      if (this.navigation && typeof this.navigation.confirmAndResetGame === 'function') {
        this.navigation.confirmAndResetGame();
        return;
      }
    }
    return this.executeCompleteReset();
  }

  async executeCompleteReset() {
    console.log('🏹 Initiating complete game reset to Level 1...');

    // 1. Close all active modals
    if (this.navigation) {
      this.navigation.closeAllModals();
    }

    // 2. Disable controls and stop audio loops
    if (this.controls) {
      this.controls.setEnabled(false);
    }
    audio.stopBowDraw();

    // 3. Clear all active gameplay states, targets, arrows, timers
    this.gameplay.clearArrows();
    this.gameplay.arrowPool.resetAll();
    if (this.gameplay.currentTarget) {
      this.gameplay.currentTarget.dispose();
      if (this.gameplay.sceneManager && this.gameplay.sceneManager.scene) {
        this.gameplay.sceneManager.scene.remove(this.gameplay.currentTarget.mesh);
      }
      this.gameplay.currentTarget = null;
    }
    this.gameplay.currentLevelConfig = null;
    this.gameplay.isTrainingMode = false;

    // 4. Reset archer character & camera to initial state
    if (this.gameplay.archer) {
      this.gameplay.archer.animator.setState('idle');
      this.gameplay.archer.animator.setDrawAmount(0);
      if (this.gameplay.archer.bow) {
        this.gameplay.archer.bow.updateStringPoints(0);
      }
      this.gameplay.archer.setNockedArrow(false, 0);
      this.gameplay.archer.equipBow('training');
      this.gameplay.archer.setArmorTint('gold');
    }
    if (this.gameplay.cameraManager) {
      this.gameplay.cameraManager.setMode('menu');
      this.gameplay.cameraManager.reset();
    }

    // 5. Reset scoring system to Level 1 initial state (Score = 0)
    scoring.reset(120, 5);

    // 6. Clear all saved game-progress data from localStorage and sessionStorage, preserving user settings
    storage.resetProgress(true);

    // 7. Reset GameState to initial state (Chapter 1, Level 1)
    gameState.selectedChapterId = 1;
    gameState.currentLevelId = 1;
    gameState.currentLevelConfig = null;
    gameState.isTrainingMode = false;
    gameState.setState(STATES.HOME, {
      chapterId: 1,
      levelId: 1,
      currentLevelConfig: null,
      isTrainingMode: false
    });

    // 8. Reset all UI elements
    this.ui.updateScore(0, 0);
    this.ui.updateDrawPower(0);
    this.ui.setTargetLocked(false);
    this.ui.updateImpactPip(null);
    this.ui.updateStatusFooter();
    this.ui.renderBowList();
    if (this.navigation) {
      this.navigation.renderChaptersScreen();
    }

    // 9. Display loading screen and transition smoothly back to main menu
    if (this.loader && typeof this.loader.showResetLoading === 'function') {
      await this.loader.showResetLoading(() => {
        if (this.navigation) {
          this.navigation.goToHome();
        }
      });
    } else {
      if (this.navigation) {
        this.navigation.goToHome();
      }
    }

    console.log('✨ KarnArchery has been completely reset. Level 1 ready, score: 0.');
    return true;
  }

  // --- Master Continuous Render Loop ---

  startLoop() {
    if (this.isLoopRunning) return;
    this.isLoopRunning = true;

    const raf = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (cb) => setTimeout(cb, 16);

    const tick = () => {
      raf(tick);

      // Clamp delta time to 50ms to prevent giant physics steps on backgrounding
      const dt = Math.min(this.clock.getDelta(), 0.05);

      const isGameplayActive = gameState.isPlaying() || gameState.current === STATES.TRAINING;
      this.gameplay.update(dt, isGameplayActive);
      this.controls.update(dt);
    };

    tick();
  }
}
