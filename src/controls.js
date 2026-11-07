/**
 * KarnArchery - Cross-Platform Controls Manager
 * Handles Desktop mouse/keyboard and Mobile touch controls for aiming,
 * bow drawing, power charging, shooting, camera toggle, and pausing.
 * Built-in debounce protection against accidental double shots and touch scrolling.
 */

export class ControlsManager {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    this.isDrawing = false;
    this.drawStartTime = 0;
    this.drawPower = 0;
    this.currentBowDrawTime = 0.95;

    this.isPointerLocked = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.touchStartPos = { x: 0, y: 0 };
    this.isTouchAiming = false;
    this.lastTouchTime = 0;
    this.lastShotTime = 0;
    this.shotCooldownMs = 300; // Minimum cooldown between shots

    this.isEnabled = false;

    this.bindDesktopEvents();
    this.bindMobileEvents();
    this.bindKeyboardEvents();
  }

  setBowDrawTime(timeSec) {
    this.currentBowDrawTime = Math.max(0.3, timeSec);
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled && this.isDrawing) {
      this.cancelDraw();
    }
    // Reset mouse positions to avoid sudden jump
    this.lastMousePos = { x: 0, y: 0 };
  }

  bindDesktopEvents() {
    // Window-level mousedown to catch clicks across canvas or transparent HUD
    window.addEventListener('mousedown', (e) => {
      if (Date.now() - this.lastTouchTime < 600) return;
      if (!this.isEnabled || e.button !== 0) return;

      // Ignore clicks on UI buttons, inputs, links, or modal dialogues
      const target = e.target;
      if (target.closest('button, select, input, .modal-content, #menu-container:not(.hidden), #chapter-select-screen:not(.hidden), #level-select-screen:not(.hidden)')) {
        return;
      }

      this.startDraw();
    });

    window.addEventListener('mouseup', (e) => {
      if (Date.now() - this.lastTouchTime < 600) return;
      if (!this.isEnabled || e.button !== 0) return;
      if (this.isDrawing) {
        this.releaseShoot();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isEnabled) return;
      if (Date.now() - this.lastTouchTime < 600) return;

      let deltaX = 0;
      let deltaY = 0;

      if (document.pointerLockElement === this.canvas) {
        deltaX = e.movementX || 0;
        deltaY = e.movementY || 0;
      } else {
        if (this.lastMousePos.x !== 0 || this.lastMousePos.y !== 0) {
          deltaX = e.clientX - this.lastMousePos.x;
          deltaY = e.clientY - this.lastMousePos.y;
        }
      }

      this.lastMousePos = { x: e.clientX, y: e.clientY };

      // Filter out huge spikes (e.g. entering the window or tab switch)
      if (Math.abs(deltaX) > 120 || Math.abs(deltaY) > 120) {
        deltaX = 0;
        deltaY = 0;
      }

      if (deltaX !== 0 || deltaY !== 0) {
        if (this.callbacks.onAim) {
          this.callbacks.onAim(deltaX, deltaY);
        }
      }
    });

    this.canvas.addEventListener('click', () => {
      if (this.isEnabled && document.pointerLockElement !== this.canvas) {
        if (this.callbacks.shouldRequestPointerLock && this.callbacks.shouldRequestPointerLock()) {
          try {
            this.canvas.requestPointerLock();
          } catch (err) {}
        }
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = (document.pointerLockElement === this.canvas);
    });
  }

  bindKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isEnabled && e.code !== 'Escape') return;

      switch (e.code) {
        case 'KeyC':
          if (this.callbacks.onCameraToggle) this.callbacks.onCameraToggle();
          break;
        case 'KeyR':
          if (this.callbacks.onRestart) this.callbacks.onRestart();
          break;
        case 'Escape':
          if (this.callbacks.onPause) this.callbacks.onPause();
          break;
      }
    });
  }

  bindMobileEvents() {
    const aimZone = document.getElementById('mobile-aim-zone') || this.canvas;
    const shootBtn = document.getElementById('mobile-shoot-btn');
    const dropBtn = document.getElementById('mobile-drop-btn');
    const camBtn = document.getElementById('mobile-cam-btn');
    const pauseBtn = document.getElementById('mobile-pause-btn');
    const restartBtn = document.getElementById('mobile-restart-btn');

    let activeAimTouchId = null;

    // --- 1. Multi-Touch Isolated Aim Zone ---
    aimZone.addEventListener('touchstart', (e) => {
      this.lastTouchTime = Date.now();
      if (!this.isEnabled) return;
      if (this.isTouchAiming) return; // Keep aiming tracked on first finger

      const touch = e.changedTouches[0];
      activeAimTouchId = touch.identifier;
      this.touchStartPos = { x: touch.clientX, y: touch.clientY };
      this.isTouchAiming = true;
      e.preventDefault();
    }, { passive: false });

    aimZone.addEventListener('touchmove', (e) => {
      this.lastTouchTime = Date.now();
      if (!this.isEnabled || !this.isTouchAiming) return;

      let touch = null;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === activeAimTouchId) {
          touch = e.touches[i];
          break;
        }
      }
      if (!touch) return;

      const deltaX = (touch.clientX - this.touchStartPos.x) * 1.6;
      const deltaY = (touch.clientY - this.touchStartPos.y) * 1.6;
      this.touchStartPos = { x: touch.clientX, y: touch.clientY };

      if (this.callbacks.onAim) {
        this.callbacks.onAim(deltaX, deltaY);
      }
      e.preventDefault();
    }, { passive: false });

    const endAimTouch = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeAimTouchId) {
          this.isTouchAiming = false;
          activeAimTouchId = null;
          break;
        }
      }
    };
    aimZone.addEventListener('touchend', endAimTouch);
    aimZone.addEventListener('touchcancel', endAimTouch);

    // --- 2. Shoot Button (Hold to Draw, Release to Shoot) ---
    if (shootBtn) {
      shootBtn.addEventListener('touchstart', (e) => {
        this.lastTouchTime = Date.now();
        if (!this.isEnabled) return;
        e.preventDefault();
        e.stopPropagation();
        shootBtn.classList.add('active');
        this.startDraw();
      }, { passive: false });

      const releaseHandler = (e) => {
        this.lastTouchTime = Date.now();
        if (!this.isEnabled) return;
        e.preventDefault();
        e.stopPropagation();
        shootBtn.classList.remove('active');
        this.releaseShoot();
      };

      shootBtn.addEventListener('touchend', releaseHandler, { passive: false });
      shootBtn.addEventListener('touchcancel', releaseHandler, { passive: false });
    }

    // --- 3. Dedicated Drop Arrow Button (Mobile/Tablet Only) ---
    if (dropBtn) {
      let lastDropTime = 0;
      const handleDrop = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (Date.now() - lastDropTime < 350) return;
        lastDropTime = Date.now();
        this.lastTouchTime = Date.now();

        if (!this.isEnabled || dropBtn.disabled || dropBtn.classList.contains('disabled')) return;

        // Cancel any active draw power to avoid double firing
        if (this.isDrawing) {
          this.cancelDraw();
        }

        dropBtn.classList.add('active');
        setTimeout(() => dropBtn.classList.remove('active'), 200);

        if (this.callbacks.onDropArrow) {
          this.callbacks.onDropArrow();
        }
      };

      dropBtn.addEventListener('touchstart', handleDrop, { passive: false });
      dropBtn.addEventListener('click', handleDrop);
    }

    // --- 4. Camera Switch Button (FPS/TPS Toggle) ---
    if (camBtn) {
      let lastCamTime = 0;
      const handleCam = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (Date.now() - lastCamTime < 250) return;
        lastCamTime = Date.now();
        this.lastTouchTime = Date.now();

        camBtn.classList.add('active');
        setTimeout(() => camBtn.classList.remove('active'), 150);

        if (this.callbacks.onCameraToggle) {
          this.callbacks.onCameraToggle();
        }
      };

      camBtn.addEventListener('touchstart', handleCam, { passive: false });
      camBtn.addEventListener('click', handleCam);
    }

    // --- 5. Pause Button ---
    if (pauseBtn) {
      const handlePause = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.lastTouchTime = Date.now();
        pauseBtn.classList.add('active');
        setTimeout(() => pauseBtn.classList.remove('active'), 150);

        if (this.callbacks.onPause) {
          this.callbacks.onPause();
        }
      };

      pauseBtn.addEventListener('touchstart', handlePause, { passive: false });
      pauseBtn.addEventListener('click', handlePause);
    }

    // --- 6. Restart Level Button ---
    if (restartBtn) {
      const handleRestart = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.lastTouchTime = Date.now();
        restartBtn.classList.add('active');
        setTimeout(() => restartBtn.classList.remove('active'), 150);

        if (this.callbacks.onRestart) {
          this.callbacks.onRestart();
        }
      };

      restartBtn.addEventListener('touchstart', handleRestart, { passive: false });
      restartBtn.addEventListener('click', handleRestart);
    }
  }

  startDraw() {
    // Cooldown check prevents duplicate shots
    if (Date.now() - this.lastShotTime < this.shotCooldownMs) return;

    this.isDrawing = true;
    this.drawStartTime = performance.now();
    this.drawPower = 0.05;
    if (this.callbacks.onStartDraw) {
      this.callbacks.onStartDraw();
    }
  }

  cancelDraw() {
    this.isDrawing = false;
    this.drawPower = 0;
    if (this.callbacks.onCancelDraw) {
      this.callbacks.onCancelDraw();
    }
  }

  releaseShoot() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    const finalPower = this.drawPower;
    this.drawPower = 0;
    this.lastShotTime = Date.now();

    if (finalPower >= 0.12 && this.callbacks.onShoot) {
      this.callbacks.onShoot(finalPower);
    } else if (this.callbacks.onCancelDraw) {
      this.callbacks.onCancelDraw();
    }
  }

  update(dt) {
    if (this.isDrawing) {
      const elapsed = (performance.now() - this.drawStartTime) / 1000;
      this.drawPower = Math.min(1.0, elapsed / this.currentBowDrawTime);

      if (this.callbacks.onDrawPower) {
        this.callbacks.onDrawPower(this.drawPower);
      }
    }
  }
}
