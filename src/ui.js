/**
 * KarnArchery - UI & HUD Controller
 * Manages HUD, custom reticle, power tension gauge, score popups,
 * armory customization modal, settings panel, and result dialogues.
 */

import { storage } from './storage.js';
import { BOW_DATABASE } from './bow.js';
import { audio } from './audio.js';

export class UIManager {
  constructor(game) {
    this.game = game;

    // Cache DOM Elements
    this.menuContainer = document.getElementById('menu-container');
    this.hudContainer = document.getElementById('hud-container');
    this.crosshair = document.getElementById('hud-crosshair');
    this.powerGauge = document.getElementById('hud-power-gauge');
    this.powerFill = document.getElementById('hud-power-fill');
    this.powerText = document.getElementById('hud-power-text');
    this.impactPip = document.getElementById('hud-impact-pip');
    this.bullseyeFlash = document.getElementById('bullseye-flash');
    this.scorePopupContainer = document.getElementById('score-popup-container');

    // HUD Value Elements
    this.hudChapterLevel = document.getElementById('hud-chapter-level');
    this.hudObjectiveText = document.getElementById('hud-objective-text');
    this.hudCurrentScore = document.getElementById('hud-current-score');
    this.hudTargetScore = document.getElementById('hud-target-score');
    this.hudStreakBox = document.getElementById('hud-streak-box');
    this.hudStreakVal = document.getElementById('hud-streak-val');
    this.hudWindArrow = document.getElementById('hud-wind-arrow');
    this.hudWindSpeed = document.getElementById('hud-wind-speed');
    this.hudTargetDistance = document.getElementById('hud-target-distance');
    this.hudArrowPips = document.getElementById('hud-arrow-pips');
    this.hudArrowCount = document.getElementById('hud-arrow-count');
    this.cameraModeLabel = document.getElementById('camera-mode-label');

    // Modals
    this.challengeModal = document.getElementById('challenge-modal');
    this.customizationModal = document.getElementById('customization-modal');
    this.settingsModal = document.getElementById('settings-modal');
    this.creditsModal = document.getElementById('credits-modal');
    this.resultModal = document.getElementById('result-modal');
    this.pauseModal = document.getElementById('pause-modal');

    // Status Footer
    this.statusCoins = document.getElementById('status-coins');
    this.statusTotalStars = document.getElementById('status-total-stars');
    this.statusBowName = document.getElementById('status-bow-name');

    // Inspected bow in customization
    this.selectedBowId = storage.getEquippedBow();

    this.bindButtons();
    this.bindSettings();
    this.updateStatusFooter();
  }

  bindButtons() {
    // Challenge Cards Click
    document.querySelectorAll('.chapter-card[data-challenge]').forEach(card => {
      card.addEventListener('click', () => {
        const challengeId = card.getAttribute('data-challenge');
        this.closeModal(this.challengeModal);
        if (this.game.navigation) {
          this.game.navigation.startSpecialChallenge(challengeId);
        }
      });
    });

    // Close Modals
    const closeChallenge = document.getElementById('btn-close-challenge-modal');
    if (closeChallenge) {
      closeChallenge.addEventListener('click', () => this.closeModal(this.challengeModal));
    }

    const closeCustom = document.getElementById('btn-close-customization');
    if (closeCustom) {
      closeCustom.addEventListener('click', () => this.closeModal(this.customizationModal));
    }

    const closeSettings = document.getElementById('btn-close-settings');
    if (closeSettings) {
      closeSettings.addEventListener('click', () => this.closeModal(this.settingsModal));
    }

    const closeCredits = document.getElementById('btn-close-credits');
    if (closeCredits) {
      closeCredits.addEventListener('click', () => this.closeModal(this.creditsModal));
    }

    // HUD Action Buttons
    const btnSwitchCamera = document.getElementById('btn-switch-camera');
    if (btnSwitchCamera) {
      btnSwitchCamera.addEventListener('click', () => this.game.toggleCamera());
    }

    const btnRestart = document.getElementById('btn-restart-level');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => this.game.restartCurrentLevel());
    }

    const btnPause = document.getElementById('btn-pause-game');
    if (btnPause) {
      btnPause.addEventListener('click', () => this.game.togglePause());
    }

    // Bow Equip Button
    const btnEquip = document.getElementById('btn-equip-bow');
    if (btnEquip) {
      btnEquip.addEventListener('click', () => {
        if (storage.isBowUnlocked(this.selectedBowId)) {
          storage.setEquippedBow(this.selectedBowId);
          this.game.setBow(this.selectedBowId);
          this.renderBowList();
          this.updateStatusFooter();
        }
      });
    }

    // Armor Tint Customization Buttons
    document.querySelectorAll('.armor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tint = btn.getAttribute('data-armor');
        if (this.game.archer) {
          this.game.archer.setArmorTint(tint);
        }
        storage.data.customization = storage.data.customization || {};
        storage.data.customization.armorTint = tint;
        storage.save();
        document.querySelectorAll('.armor-btn').forEach(b => b.classList.remove('primary'));
        btn.classList.add('primary');
      });
    });

    // Cape Color Customization Buttons
    document.querySelectorAll('.cape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-cape');
        if (this.game.archer) {
          this.game.archer.setCapeColor(color);
        }
        storage.data.customization = storage.data.customization || {};
        storage.data.customization.capeColor = color;
        storage.save();
        document.querySelectorAll('.cape-btn').forEach(b => b.classList.remove('primary'));
        btn.classList.add('primary');
      });
    });
  }

  bindSettings() {
    const s = storage.getSettings();

    const masterVol = document.getElementById('setting-master-vol');
    const musicVol = document.getElementById('setting-music-vol');
    const sfxVol = document.getElementById('setting-sfx-vol');
    const sens = document.getElementById('setting-sensitivity');
    const fov = document.getElementById('setting-fov');
    const qualitySelect = document.getElementById('setting-quality');

    if (masterVol) masterVol.value = s.masterVolume;
    if (musicVol) musicVol.value = s.musicVolume;
    if (sfxVol) sfxVol.value = s.sfxVolume;
    if (sens) sens.value = s.sensitivity;
    if (fov) fov.value = s.fov;
    if (qualitySelect) qualitySelect.value = s.quality || 'high';

    const valMaster = document.getElementById('val-master-vol');
    const valMusic = document.getElementById('val-music-vol');
    const valSfx = document.getElementById('val-sfx-vol');
    const valSens = document.getElementById('val-sensitivity');
    const valFov = document.getElementById('val-fov');

    if (valMaster) valMaster.textContent = `${s.masterVolume}%`;
    if (valMusic) valMusic.textContent = `${s.musicVolume}%`;
    if (valSfx) valSfx.textContent = `${s.sfxVolume}%`;
    if (valSens) valSens.textContent = s.sensitivity;
    if (valFov) valFov.textContent = `${s.fov}°`;

    if (masterVol) {
      masterVol.addEventListener('input', (e) => {
        const v = parseInt(e.target.value);
        if (valMaster) valMaster.textContent = `${v}%`;
        storage.updateSettings({ masterVolume: v });
        audio.setMasterVolume(v / 100);
      });
    }

    if (musicVol) {
      musicVol.addEventListener('input', (e) => {
        const v = parseInt(e.target.value);
        if (valMusic) valMusic.textContent = `${v}%`;
        storage.updateSettings({ musicVolume: v });
        audio.setMusicVolume(v / 100);
      });
    }

    if (sfxVol) {
      sfxVol.addEventListener('input', (e) => {
        const v = parseInt(e.target.value);
        if (valSfx) valSfx.textContent = `${v}%`;
        storage.updateSettings({ sfxVolume: v });
        audio.setSfxVolume(v / 100);
      });
    }

    if (sens) {
      sens.addEventListener('input', (e) => {
        const v = parseInt(e.target.value);
        if (valSens) valSens.textContent = v;
        storage.updateSettings({ sensitivity: v });
        if (this.game.cameraManager) {
          this.game.cameraManager.setSensitivity(v);
        }
      });
    }

    if (fov) {
      fov.addEventListener('input', (e) => {
        const v = parseInt(e.target.value);
        if (valFov) valFov.textContent = `${v}°`;
        storage.updateSettings({ fov: v });
        if (this.game.cameraManager) {
          this.game.cameraManager.setFov(v);
        }
      });
    }

    if (qualitySelect) {
      qualitySelect.addEventListener('change', (e) => {
        const q = e.target.value;
        storage.updateSettings({ quality: q });
        this.game.setQuality(q);
      });
    }
  }

  showMenu() {
    if (this.menuContainer) this.menuContainer.classList.remove('hidden');
    if (this.hudContainer) this.hudContainer.classList.add('hidden');
    this.updateStatusFooter();
  }

  hideMenu() {
    if (this.menuContainer) this.menuContainer.classList.add('hidden');
    if (this.hudContainer) this.hudContainer.classList.remove('hidden');
  }

  openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  updateStatusFooter() {
    if (this.statusCoins) this.statusCoins.textContent = storage.data.coins;
    if (this.statusTotalStars) this.statusTotalStars.textContent = storage.getTotalStars();
    const equipped = BOW_DATABASE[storage.getEquippedBow()];
    if (this.statusBowName) this.statusBowName.textContent = equipped ? equipped.name : 'Training Bow';
  }

  openCustomization() {
    this.selectedBowId = storage.getEquippedBow();
    this.renderBowList();
    this.inspectBow(this.selectedBowId);
    this.openModal(this.customizationModal);
  }

  renderBowList() {
    const container = document.getElementById('bow-list-container');
    if (!container) return;
    container.innerHTML = '';

    Object.values(BOW_DATABASE).forEach(bow => {
      const isUnlocked = storage.isBowUnlocked(bow.id);
      const isEquipped = storage.getEquippedBow() === bow.id;
      const isSelected = this.selectedBowId === bow.id;

      const item = document.createElement('div');
      item.className = `bow-item-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;
      if (isSelected) {
        item.style.borderColor = 'var(--royal-gold-bright)';
      }

      item.innerHTML = `
        <div class="bow-details">
          <h4>${bow.name} ${isEquipped ? '(Equipped)' : ''}</h4>
          <p>${isUnlocked ? `Speed: ${bow.speed} m/s • Wind: ${Math.round(bow.windResistance * 100)}%` : '🔒 Unlocked via Story'}</p>
        </div>
      `;

      item.addEventListener('click', () => {
        this.selectedBowId = bow.id;
        this.renderBowList();
        this.inspectBow(bow.id);
      });

      container.appendChild(item);
    });
  }

  inspectBow(bowId) {
    const bow = BOW_DATABASE[bowId];
    if (!bow) return;

    const nameEl = document.getElementById('inspect-bow-name');
    const descEl = document.getElementById('inspect-bow-desc');
    if (nameEl) nameEl.textContent = bow.name;
    if (descEl) descEl.textContent = bow.description;

    const valSpeed = document.getElementById('stat-val-speed');
    const barSpeed = document.getElementById('stat-bar-speed');
    if (valSpeed) valSpeed.textContent = `${bow.speed} m/s`;
    if (barSpeed) barSpeed.style.width = `${Math.min(100, (bow.speed / 100) * 100)}%`;

    const valDraw = document.getElementById('stat-val-draw');
    const barDraw = document.getElementById('stat-bar-draw');
    if (valDraw) valDraw.textContent = `${bow.drawTime}s`;
    if (barDraw) barDraw.style.width = `${Math.min(100, (1.2 - bow.drawTime) * 150)}%`;

    const valWind = document.getElementById('stat-val-wind');
    const barWind = document.getElementById('stat-bar-wind');
    if (valWind) valWind.textContent = `${Math.round(bow.windResistance * 100)}%`;
    if (barWind) barWind.style.width = `${Math.round(bow.windResistance * 100)}%`;

    const isUnlocked = storage.isBowUnlocked(bowId);
    const isEquipped = storage.getEquippedBow() === bowId;
    const equipBtn = document.getElementById('btn-equip-bow');

    if (equipBtn) {
      if (!isUnlocked) {
        equipBtn.textContent = 'Locked (Play Story to Unlock)';
        equipBtn.disabled = true;
        equipBtn.style.opacity = '0.5';
      } else if (isEquipped) {
        equipBtn.textContent = 'Already Equipped';
        equipBtn.disabled = true;
        equipBtn.style.opacity = '0.7';
      } else {
        equipBtn.textContent = 'Equip Bow';
        equipBtn.disabled = false;
        equipBtn.style.opacity = '1';
      }
    }
  }

  // --- HUD Updates ---

  setupLevelHUD(levelConfig, totalArrows) {
    if (this.hudChapterLevel) {
      this.hudChapterLevel.textContent = levelConfig.chapter
        ? `Chapter ${levelConfig.chapter} • Level ${levelConfig.id}: ${levelConfig.name}`
        : levelConfig.name;
    }
    if (this.hudObjectiveText) this.hudObjectiveText.textContent = levelConfig.objective;
    if (this.hudCurrentScore) this.hudCurrentScore.textContent = '0';
    if (this.hudTargetScore) this.hudTargetScore.textContent = levelConfig.targetScore;
    if (this.hudTargetDistance) this.hudTargetDistance.textContent = `${(levelConfig.distance || 20).toFixed(1)}m`;
    if (this.hudStreakBox) this.hudStreakBox.classList.remove('active');

    this.renderArrowPips(totalArrows, totalArrows);
  }

  renderArrowPips(remaining, total) {
    if (!this.hudArrowPips) return;
    this.hudArrowPips.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const pip = document.createElement('div');
      pip.className = `arrow-pip ${i >= remaining ? 'spent' : ''}`;
      this.hudArrowPips.appendChild(pip);
    }
    if (this.hudArrowCount) {
      this.hudArrowCount.textContent = `${remaining} / ${total} Remaining`;
    }
  }

  updateScore(score, streak = 0) {
    if (this.hudCurrentScore) this.hudCurrentScore.textContent = score;
    if (this.hudStreakBox) {
      if (streak >= 2) {
        this.hudStreakBox.classList.add('active');
        if (this.hudStreakVal) this.hudStreakVal.textContent = streak;
      } else {
        this.hudStreakBox.classList.remove('active');
      }
    }
  }

  updateWind(speed, dirRad) {
    if (this.hudWindSpeed) this.hudWindSpeed.textContent = `${speed.toFixed(1)} m/s`;
    if (this.hudWindArrow) {
      const deg = (dirRad * 180) / Math.PI;
      this.hudWindArrow.style.transform = `rotate(${deg}deg)`;
    }
  }

  updateDrawPower(powerRatio) {
    if (powerRatio > 0.05) {
      if (this.powerGauge) this.powerGauge.classList.add('active');
      if (this.crosshair) this.crosshair.classList.add('drawing');
      if (this.powerFill) this.powerFill.style.height = `${Math.round(powerRatio * 100)}%`;

      const pct = Math.round(powerRatio * 100);
      let powerLabel = 'Low';
      let tierClass = 'power-low';
      if (pct > 70) {
        powerLabel = 'Maximum';
        tierClass = 'power-max';
      } else if (pct > 30) {
        powerLabel = 'Medium';
        tierClass = 'power-medium';
      }

      if (this.powerGauge) {
        this.powerGauge.classList.remove('power-low', 'power-medium', 'power-max');
        this.powerGauge.classList.add(tierClass);
      }

      if (this.powerText) {
        this.powerText.textContent = `${powerLabel} • ${pct}%`;
      }
    } else {
      if (this.powerGauge) {
        this.powerGauge.classList.remove('active', 'power-low', 'power-medium', 'power-max');
      }
      if (this.crosshair) this.crosshair.classList.remove('drawing');
    }
  }

  setTargetLocked(isLocked) {
    if (this.crosshair) {
      if (isLocked) {
        this.crosshair.classList.add('target-locked');
      } else {
        this.crosshair.classList.remove('target-locked');
      }
    }
  }

  updateImpactPip(screenPos) {
    if (!this.impactPip) return;
    if (screenPos) {
      this.impactPip.classList.remove('hidden');
      this.impactPip.style.left = `${screenPos.x}px`;
      this.impactPip.style.top = `${screenPos.y}px`;
    } else {
      this.impactPip.classList.add('hidden');
    }
  }

  setCameraModeLabel(mode) {
    if (this.cameraModeLabel) {
      this.cameraModeLabel.textContent = (mode === 'fps') ? 'First Person' : 'Third Person';
    }
  }

  showScorePopup(result) {
    if (!this.scorePopupContainer) return;
    const popup = document.createElement('div');
    popup.className = `score-popup ${result.ring}`;
    
    popup.style.left = '50%';
    popup.style.top = '45%';

    let text = `+${result.awardedPoints}`;
    let sub = result.ring.toUpperCase();

    if (result.isPerfect) {
      sub = 'PERFECT BULLSEYE!';
    } else if (result.isBullseye) {
      sub = 'BULLSEYE!';
      this.triggerBullseyeFlash();
    } else if (result.ring === 'miss') {
      text = 'MISS';
      sub = '';
    }

    if (result.multiplier > 1.0) {
      sub += ` (x${result.multiplier})`;
    }

    popup.innerHTML = `
      <span>${text}</span>
      <span class="score-subtext">${sub}</span>
    `;

    this.scorePopupContainer.appendChild(popup);

    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 1200);
  }

  triggerBullseyeFlash() {
    if (!this.bullseyeFlash) return;
    this.bullseyeFlash.classList.remove('active');
    void this.bullseyeFlash.offsetWidth; // trigger reflow
    this.bullseyeFlash.classList.add('active');
  }

  showResult(resultData) {
    const isVictory = resultData.stars > 0;
    const isLevel25 = (resultData.levelId === 25);
    const titleEl = document.getElementById('result-title');

    if (titleEl) {
      if (isVictory && isLevel25) {
        titleEl.textContent = '👑 Suryaputra Ascendant: Legend Born!';
        titleEl.style.color = 'var(--royal-gold-bright)';
      } else {
        titleEl.textContent = isVictory ? 'Legendary Victory!' : 'Trial Incomplete';
        titleEl.style.color = isVictory ? 'var(--royal-gold-bright)' : '#FF5252';
      }
    }

    // Stars
    [1, 2, 3].forEach(starIdx => {
      const starEl = document.getElementById(`result-star-${starIdx}`);
      if (starEl) {
        if (starIdx <= resultData.stars) {
          starEl.classList.add('earned');
        } else {
          starEl.classList.remove('earned');
        }
      }
    });

    const scoreEl = document.getElementById('result-score');
    const targetEl = document.getElementById('result-target-score');
    const accEl = document.getElementById('result-accuracy');
    const bullEl = document.getElementById('result-bullseyes');
    const coinsEl = document.getElementById('result-coins');

    if (scoreEl) scoreEl.textContent = resultData.score;
    if (targetEl) targetEl.textContent = resultData.targetScore;
    if (accEl) accEl.textContent = `${resultData.accuracy}%`;
    if (bullEl) bullEl.textContent = resultData.bullseyes;
    if (coinsEl) coinsEl.textContent = `+${resultData.coins} 🪙`;

    const nextBtn = document.getElementById('btn-result-next');
    if (nextBtn) {
      if (isVictory && resultData.hasNextLevel) {
        nextBtn.style.display = 'inline-flex';
      } else {
        nextBtn.style.display = 'none';
      }
    }

    this.openModal(this.resultModal);
  }

  togglePauseModal(isPaused) {
    if (isPaused) {
      this.openModal(this.pauseModal);
    } else {
      this.closeModal(this.pauseModal);
    }
  }
}
