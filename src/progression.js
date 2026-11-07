/**
 * KarnArchery - Progression & Customization Manager
 * Unlocks bows, records achievements, tracks stars, coins, and updates status cards.
 */

import { storage } from './storage.js';
import { BOW_DATABASE } from './bow.js';

export class ProgressionManager {
  constructor() {
    this.storage = storage;
  }

  isLevelUnlocked(levelId) {
    return this.storage.isLevelUnlocked(levelId);
  }

  completeLevel(levelId, score, stars, coins) {
    this.storage.recordLevelCompletion(levelId, score, stars, coins);
  }

  getStarsForLevel(levelId) {
    return this.storage.getLevelStars(levelId);
  }

  getTotalStars() {
    return this.storage.getTotalStars();
  }

  getCoins() {
    return this.storage.data.coins;
  }

  getEquippedBow() {
    return this.storage.getEquippedBow();
  }

  equipBow(bowId) {
    return this.storage.setEquippedBow(bowId);
  }

  unlockBow(bowId) {
    this.storage.unlockBow(bowId);
  }

  isBowUnlocked(bowId) {
    return this.storage.isBowUnlocked(bowId);
  }

  getAllBows() {
    return Object.values(BOW_DATABASE).map(b => ({
      ...b,
      unlocked: this.isBowUnlocked(b.id),
      equipped: this.getEquippedBow() === b.id
    }));
  }
}

export const progression = new ProgressionManager();

