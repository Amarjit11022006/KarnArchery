/**
 * KarnArchery - LocalStorage Manager
 * Persistent storage for user progress, unlocks, high scores, coins, and settings.
 */

export const STORAGE_KEY = 'karnarchery_save_v1';

export const DEFAULT_SAVE_DATA = {
  currentChapter: 1,
  currentLevel: 1,
  unlockedLevels: 1, // Number of levels unlocked (up to 25)
  levelStars: {},    // { levelId: stars (1-3) }
  levelHighScores: {}, // { levelId: score }
  coins: 0,
  equippedBow: 'training',
  unlockedBows: ['training'],
  customization: {
    armorTint: 'gold',
    capeColor: 'crimson'
  },
  settings: {
    masterVolume: 80,
    musicVolume: 65,
    sfxVolume: 90,
    sensitivity: 5,
    fov: 65,
    quality: 'high'
  }
};

class StorageManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (serialized) {
          const parsed = JSON.parse(serialized);
          return { ...DEFAULT_SAVE_DATA, ...parsed, settings: { ...DEFAULT_SAVE_DATA.settings, ...(parsed.settings || {}) } };
        }
      }
    } catch (e) {
      console.warn('Failed to load KarnArchery save data, using defaults:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.error('Failed to save KarnArchery save data:', e);
    }
  }

  getLevelStars(levelId) {
    return this.data.levelStars[levelId] || 0;
  }

  getTotalStars() {
    return Object.values(this.data.levelStars).reduce((acc, s) => acc + s, 0);
  }

  recordLevelCompletion(levelId, score, stars, coinsEarned) {
    // Record stars (max)
    const currentStars = this.data.levelStars[levelId] || 0;
    if (stars > currentStars) {
      this.data.levelStars[levelId] = stars;
    }

    // Record high score
    const currentHighScore = this.data.levelHighScores[levelId] || 0;
    if (score > currentHighScore) {
      this.data.levelHighScores[levelId] = score;
    }

    // Add coins
    this.data.coins += (coinsEarned || 0);

    // Unlock next level if this was the highest unlocked
    if (levelId >= this.data.unlockedLevels && this.data.unlockedLevels < 25) {
      this.data.unlockedLevels = levelId + 1;
    }

    this.save();
  }

  isLevelUnlocked(levelId) {
    return levelId <= this.data.unlockedLevels;
  }

  getEquippedBow() {
    return this.data.equippedBow || 'training';
  }

  setEquippedBow(bowId) {
    if (this.data.unlockedBows.includes(bowId)) {
      this.data.equippedBow = bowId;
      this.save();
      return true;
    }
    return false;
  }

  unlockBow(bowId) {
    if (!this.data.unlockedBows.includes(bowId)) {
      this.data.unlockedBows.push(bowId);
      this.save();
    }
  }

  isBowUnlocked(bowId) {
    return this.data.unlockedBows.includes(bowId);
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
  }

  getSettings() {
    return this.data.settings;
  }

  resetProgress(preserveSettings = true) {
    // Preserve graphics settings, sound preferences, and user preferences
    const preservedSettings = (preserveSettings && this.data && this.data.settings)
      ? JSON.parse(JSON.stringify(this.data.settings))
      : JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA.settings));

    // 1. Reset in-memory state to original starting state (Level 1, score 0, 0 stars, 0 coins)
    this.data = {
      ...JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA)),
      settings: preservedSettings
    };

    // 2. Clear all saved game-progress data from localStorage and sessionStorage,
    // including old, duplicate, or legacy progress keys.
    try {
      if (typeof localStorage !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          const kLower = key.toLowerCase();
          if (
            kLower.startsWith('karnarchery') ||
            kLower.startsWith('karn_') ||
            kLower.includes('archery_save') ||
            kLower.includes('archery_progress') ||
            kLower.includes('archery_score') ||
            kLower.includes('archery_stars') ||
            kLower.includes('archery_coins') ||
            kLower.includes('archery_level')
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => {
          try {
            localStorage.removeItem(k);
          } catch (e) {}
        });

        // Write fresh pristine save data with preserved user settings
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }

      if (typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.clear();
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Storage cleanup warning during resetProgress:', e);
    }

    return this.data;
  }
}

export const storage = new StorageManager();

