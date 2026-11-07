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

    aimZone.addEventListener('touchstart', (e) => {
      this.lastTouchTime = Date.now();
      if (!this.isEnabled) return;
      const touch = e.touches[0];
      this.touchStartPos = { x: touch.clientX, y: touch.clientY };
      this.isTouchAiming = true;
    }, { passive: false });

    aimZone.addEventListener('touchmove', (e) => {
      this.lastTouchTime = Date.now();
      if (!this.isEnabled || !this.isTouchAiming) return;
      const touch = e.touches[0];
      const deltaX = (touch.clientX - this.touchStartPos.x) * 1.6;
      const deltaY = (touch.clientY - this.touchStartPos.y) * 1.6;
      this.touchStartPos = { x: touch.clientX, y: touch.clientY };

      if (this.callbacks.onAim) {
        this.callbacks.onAim(deltaX, deltaY);
      }
      e.preventDefault();
    }, { passive: false });

    aimZone.addEventListener('touchend', () => {
      this.isTouchAiming = false;
    });

    if (shootBtn) {
      shootBtn.addEventListener('touchstart', (e) => {
        this.lastTouchTime = Date.now();
        if (!this.isEnabled) return;
        e.preventDefault();
        shootBtn.classList.add('active');
        this.startDraw();
      }, { passive: false });

      shootBtn.addEventListener('touchend', (e) => {
        this.lastTouchTime = Date.now();
        if (!this.isEnabled) return;
        e.preventDefault();
        shootBtn.classList.remove('active');
        this.releaseShoot();
      }, { passive: false });
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
