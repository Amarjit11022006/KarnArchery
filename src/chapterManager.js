/**
 * KarnArchery - Chapter Manager
 * Manages the five story chapters inspired by Karna's epic journey.
 * Handles chapter progression, star tracking, and unlock validation.
 */

import { storage } from './storage.js';

export const CHAPTERS_DATA = [
  {
    id: 1,
    title: 'The Beginning',
    subtitle: 'Gurukul Training Grounds',
    description: 'Under the sacred banyan trees of the ashram, the young warrior begins his relentless pursuit of archery mastery.',
    lighting: 'morning',
    levelRange: [1, 5],
    accentColor: '#D4A64A',
    icon: '🏹'
  },
  {
    id: 2,
    title: 'The Royal Tournament',
    subtitle: 'Hastinapur Arena',
    description: 'Before royal spectators and proud princes, Karna steps onto the golden sand to challenge the elite with moving marks.',
    lighting: 'afternoon',
    levelRange: [6, 10],
    accentColor: '#F5B942',
    icon: '🎪'
  },
  {
    id: 3,
    title: "The Guru's Test",
    subtitle: "Parashurama's Mountain Hermitage",
    description: 'High in the mist-veiled peaks, the legendary master Parashurama demands impossible feats in wind and deep twilight.',
    lighting: 'sunset',
    levelRange: [11, 15],
    accentColor: '#A87932',
    icon: '⛰️'
  },
  {
    id: 4,
    title: 'The Battlefield',
    subtitle: 'Kurukshetra Plains',
    description: 'Amid the smoke and thunder of clashing armies, arrows must strike galloping war chariots and distant commanders.',
    lighting: 'sunset',
    levelRange: [16, 20],
    accentColor: '#8E2028',
    icon: '⚔️'
  },
  {
    id: 5,
    title: 'The Legend',
    subtitle: "Suryaputra's Divine Trials",
    description: 'Ascend beyond mortal limits. Strike the rotating celestial fish and unlock the legendary golden Vijaya Dhanush.',
    lighting: 'sunset',
    levelRange: [21, 25],
    accentColor: '#FFD700',
    icon: '☀️'
  }
];

class ChapterManager {
  constructor() {
    this.chapters = CHAPTERS_DATA;
  }

  getAllChapters() {
    return this.chapters;
  }

  getChapter(chapterId) {
    const id = parseInt(chapterId);
    return this.chapters.find(c => c.id === id) || this.chapters[0];
  }

  isChapterUnlocked(chapterId) {
    const id = parseInt(chapterId);
    if (id === 1) return true; // Chapter 1 always unlocked
    // Chapter N is unlocked if level (N-1)*5 is completed or first level of chapter is unlocked
    const firstLevelOfChapter = (id - 1) * 5 + 1;
    return storage.isLevelUnlocked(firstLevelOfChapter);
  }

  getChapterStars(chapterId) {
    const ch = this.getChapter(chapterId);
    let totalStars = 0;
    for (let lvl = ch.levelRange[0]; lvl <= ch.levelRange[1]; lvl++) {
      totalStars += storage.getLevelStars(lvl);
    }
    return totalStars;
  }

  getChapterProgress(chapterId) {
    const ch = this.getChapter(chapterId);
    let completedCount = 0;
    const totalLevels = ch.levelRange[1] - ch.levelRange[0] + 1;
    for (let lvl = ch.levelRange[0]; lvl <= ch.levelRange[1]; lvl++) {
      if (storage.getLevelStars(lvl) > 0) {
        completedCount++;
      }
    }
    const stars = this.getChapterStars(chapterId);
    const maxStars = totalLevels * 3;
    return {
      completedLevels: completedCount,
      totalLevels,
      stars,
      maxStars,
      isComplete: completedCount === totalLevels
    };
  }
}

export const chapterManager = new ChapterManager();

