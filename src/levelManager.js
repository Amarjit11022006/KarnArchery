/**
 * KarnArchery - Level Manager
 * Manages all 25 playable story levels (5 levels per chapter) plus Special Challenges.
 * Handles level objectives, distance, target movement, wind, scoring criteria, and unlocks.
 */

import { storage } from './storage.js';

export const ALL_LEVELS = [
  // -------------------------------------------------------------------------
  // CHAPTER 1 – THE BEGINNING (Gurukul Training Ground, Levels 1 - 5)
  // -------------------------------------------------------------------------
  {
    id: 1,
    chapter: 1,
    name: 'Basic Archery',
    lore: '"Every arrow takes flight from silence. Hold the grip steady, breathe with the forest."',
    objective: 'Hit the Stationary Royal Target at 20m. Score at least 120 points with 5 arrows.',
    distance: 20,
    targetType: 'stationary',
    targetRadius: 1.25,
    moveSpeed: 0,
    windSpeed: 0,
    windDirDeg: 0,
    arrows: 5,
    targetScore: 120,
    lighting: 'morning'
  },
  {
    id: 2,
    chapter: 1,
    name: 'Stationary Targets',
    lore: '"The wind is not your foe, warrior. Learn its whisper before your fingers release the hemp."',
    objective: 'Hit the Royal Target at 30m under a gentle 2.2 m/s cross-breeze. Score 150 points.',
    distance: 30,
    targetType: 'stationary',
    targetRadius: 1.25,
    moveSpeed: 0,
    windSpeed: 2.2,
    windDirDeg: 90,
    arrows: 5,
    targetScore: 150,
    lighting: 'morning'
  },
  {
    id: 3,
    chapter: 1,
    name: 'Precision Shooting',
    lore: '"A warrior does not aim where the mark sits, but where its rhythm shall meet the release."',
    objective: 'Hit the Moving Target on Wooden Rail oscillating at 25m. Score 180 points.',
    distance: 25,
    targetType: 'moving',
    targetRadius: 1.20,
    moveSpeed: 1.8,
    moveRange: 5.5,
    windSpeed: 1.5,
    windDirDeg: 45,
    arrows: 5,
    targetScore: 180,
    lighting: 'morning'
  },
  {
    id: 4,
    chapter: 1,
    name: 'Distance Challenge',
    lore: '"Strength without focus is as wild fire. Calm your mind; find the gold across the range."',
    objective: 'Small Precision Target with glowing Surya beacon at 40m. Score 200 points.',
    distance: 40,
    targetType: 'precision',
    targetRadius: 0.90,
    moveSpeed: 0,
    windSpeed: 3.5,
    windDirDeg: 135,
    arrows: 5,
    targetScore: 200,
    lighting: 'morning'
  },
  {
    id: 5,
    chapter: 1,
    name: 'First Trial',
    lore: '"You have learned well, son of Surya. The royal arena awaits your bow."',
    objective: 'Final Gurukul Trial: Moving Rail Target at 35m. Score 240 points to graduate!',
    distance: 35,
    targetType: 'moving',
    targetRadius: 1.20,
    moveSpeed: 2.2,
    moveRange: 6.0,
    windSpeed: 3.0,
    windDirDeg: 270,
    arrows: 5,
    targetScore: 240,
    lighting: 'morning'
  },

  // -------------------------------------------------------------------------
  // CHAPTER 2 – THE ROYAL TOURNAMENT (Hastinapur Arena, Levels 6 - 10)
  // -------------------------------------------------------------------------
  {
    id: 6,
    chapter: 2,
    name: 'The Arena Gate',
    lore: '"They mock your humble lineage. Let your arrow pierce their disbelief."',
    objective: 'Score 200 points on the Stationary Royal Target at 32m.',
    distance: 32,
    targetType: 'stationary',
    targetRadius: 1.25,
    moveSpeed: 0,
    windSpeed: 2.0,
    windDirDeg: 60,
    arrows: 5,
    targetScore: 200,
    lighting: 'afternoon'
  },
  {
    id: 7,
    chapter: 2,
    name: 'Shifting Winds',
    lore: '"The royal banners flutter violently. Compensate your sight against the arena draft."',
    objective: 'Hit the swaying Hanging Royal Target at 42m under sudden 4.5 m/s crosswind. Score 230 points.',
    distance: 42,
    targetType: 'hanging',
    targetRadius: 1.20,
    moveSpeed: 1.8,
    windSpeed: 4.5,
    windDirDeg: 180,
    arrows: 5,
    targetScore: 230,
    lighting: 'afternoon'
  },
  {
    id: 8,
    chapter: 2,
    name: 'The Royal Pendulum',
    lore: '"A moving target mocks the hasty hand. Measure its rhythm before you draw."',
    objective: 'Hit the Moving Target on Wooden Rail at 30m. Score 260 points.',
    distance: 30,
    targetType: 'moving',
    targetRadius: 1.20,
    moveSpeed: 2.6,
    moveRange: 7.0,
    windSpeed: 2.5,
    windDirDeg: 45,
    arrows: 5,
    targetScore: 260,
    lighting: 'afternoon'
  },
  {
    id: 9,
    chapter: 2,
    name: 'Pride of Hastinapur',
    lore: '"The royal archers have posted a high mark. Surpass them without faltering."',
    objective: 'Small Precision Target with Surya beacon at 45m with 4.0 m/s wind. Score 270 points.',
    distance: 45,
    targetType: 'precision',
    targetRadius: 0.90,
    moveSpeed: 0,
    windSpeed: 4.0,
    windDirDeg: 210,
    arrows: 5,
    targetScore: 270,
    lighting: 'afternoon'
  },
  {
    id: 10,
    chapter: 2,
    name: 'Tournament Champion',
    lore: '"The crowd falls silent. With this shot, Karna claims his place among the greatest."',
    objective: 'Tournament final: Spinning Royal Chakra Target at 48m. Score 300 points to unlock the Royal Bow!',
    distance: 48,
    targetType: 'rotating',
    targetRadius: 1.15,
    moveSpeed: 2.8,
    windSpeed: 3.8,
    windDirDeg: 300,
    arrows: 5,
    targetScore: 300,
    lighting: 'afternoon',
    unlockBow: 'royal'
  },

  // -------------------------------------------------------------------------
  // CHAPTER 3 – THE GURU'S TEST (Parashurama's Mountain, Levels 11 - 15)
  // -------------------------------------------------------------------------
  {
    id: 11,
    chapter: 3,
    name: 'Mountain Updraft',
    lore: '"Parashurama watches from the crags. Gravity yields only to unwavering intent."',
    objective: 'Small Precision Target across the ravine at 50m with rising winds. Score 260 points.',
    distance: 50,
    targetType: 'precision',
    targetRadius: 0.88,
    moveSpeed: 0,
    windSpeed: 5.5,
    windDirDeg: 45,
    arrows: 5,
    targetScore: 260,
    lighting: 'sunset'
  },
  {
    id: 12,
    chapter: 3,
    name: 'Twilight Precision',
    lore: '"The red sun sinks beneath the jagged peaks. Trust your senses, not your sight alone."',
    objective: 'Hanging Royal Target swaying at 45m during deep twilight. Score 280 points.',
    distance: 45,
    targetType: 'hanging',
    targetRadius: 1.18,
    moveSpeed: 2.2,
    windSpeed: 4.0,
    windDirDeg: 90,
    arrows: 5,
    targetScore: 280,
    lighting: 'sunset'
  },
  {
    id: 13,
    chapter: 3,
    name: 'Eye of the Storm',
    lore: '"When the gale howls through the valley, shoot not against the storm, but through it."',
    objective: 'Stationary Royal Target at 55m in heavy 6.5 m/s tempest wind. Score 270 points.',
    distance: 55,
    targetType: 'stationary',
    targetRadius: 1.25,
    moveSpeed: 0,
    windSpeed: 6.5,
    windDirDeg: 120,
    arrows: 5,
    targetScore: 270,
    lighting: 'sunset'
  },
  {
    id: 14,
    chapter: 3,
    name: 'Shadow Mark',
    lore: '"A true archer sees the target in the mind before the hand even reaches the quiver."',
    objective: 'Rapid Moving Rail Target at 42m. Score 310 points.',
    distance: 42,
    targetType: 'moving',
    targetRadius: 1.15,
    moveSpeed: 3.2,
    moveRange: 7.5,
    windSpeed: 3.5,
    windDirDeg: 240,
    arrows: 5,
    targetScore: 310,
    lighting: 'night'
  },
  {
    id: 15,
    chapter: 3,
    name: "The Guru's Blessing",
    lore: '"Rise, Karna. Your archery is worthy of the gods themselves. Take the Warrior Bow."',
    objective: 'Ultimate disciple trial: Spinning Divine Chakra Target at 60m with gusts. Score 340 points.',
    distance: 60,
    targetType: 'rotating',
    targetRadius: 1.15,
    moveSpeed: 3.0,
    windSpeed: 5.0,
    windDirDeg: 150,
    arrows: 5,
    targetScore: 340,
    lighting: 'sunset',
    unlockBow: 'warrior'
  },

  // -------------------------------------------------------------------------
  // CHAPTER 4 – THE BATTLEFIELD (Kurukshetra Plains, Levels 16 - 20)
  // -------------------------------------------------------------------------
  {
    id: 16,
    chapter: 4,
    name: 'Drums of Kurukshetra',
    lore: '"The conch shells sound across the dusty horizon. The great war has begun."',
    objective: 'Strike the Ancient Warrior Shield Target at 40m through smoke. Score 260 points.',
    distance: 40,
    targetType: 'shield',
    targetRadius: 1.25,
    moveSpeed: 0,
    windSpeed: 3.0,
    windDirDeg: 75,
    arrows: 5,
    targetScore: 260,
    lighting: 'sunset'
  },
  {
    id: 17,
    chapter: 4,
    name: 'Chariot Wheels',
    lore: '"The enemy chariot speeds across the frontline. Lead the target and strike true."',
    objective: 'Galloping chariot target on wooden rails at 45m. Score 290 points.',
    distance: 45,
    targetType: 'moving',
    targetRadius: 1.20,
    moveSpeed: 3.8,
    moveRange: 8.5,
    windSpeed: 4.2,
    windDirDeg: 180,
    arrows: 5,
    targetScore: 290,
    lighting: 'sunset'
  },
  {
    id: 18,
    chapter: 4,
    name: 'Battlefield Smoke',
    lore: '"Arrows blacken the sky. Amid the chaos, keep your sight steady on the standard."',
    objective: 'Ancient Shield Target at 52m obscured by battlefield dust. Score 300 points.',
    distance: 52,
    targetType: 'shield',
    targetRadius: 1.20,
    moveSpeed: 0,
    windSpeed: 5.5,
    windDirDeg: 290,
    arrows: 5,
    targetScore: 300,
    lighting: 'sunset'
  },
  {
    id: 19,
    chapter: 4,
    name: 'Distant Commander',
    lore: '"Break their formation with a single decisive shot across the lines."',
    objective: 'Hanging Royal Target at extreme 65m range. Score 320 points.',
    distance: 65,
    targetType: 'hanging',
    targetRadius: 1.15,
    moveSpeed: 2.0,
    windSpeed: 4.8,
    windDirDeg: 45,
    arrows: 5,
    targetScore: 320,
    lighting: 'sunset'
  },
  {
    id: 20,
    chapter: 4,
    name: 'Clashing Armies',
    lore: '"A hundred thousand warriors watch as Karna draws his bow against fate itself."',
    objective: 'Strike the heavy Ancient Shield Target at 58m. Score 360 points to unlock Surya Dhanush!',
    distance: 58,
    targetType: 'shield',
    targetRadius: 1.15,
    moveSpeed: 0,
    windSpeed: 5.2,
    windDirDeg: 135,
    arrows: 5,
    targetScore: 360,
    lighting: 'sunset',
    unlockBow: 'surya'
  },

  // -------------------------------------------------------------------------
  // CHAPTER 5 – THE LEGEND (Suryaputra's Divine Trials, Levels 21 - 25)
  // -------------------------------------------------------------------------
  {
    id: 21,
    chapter: 5,
    name: 'Golden Armour Radiance',
    lore: '"Born with golden armor fused to his chest, Karna radiates the eternal light of Surya."',
    objective: 'Small Precision Target with pulsing Surya gem at 55m. Score 320 points.',
    distance: 55,
    targetType: 'precision',
    targetRadius: 0.88,
    moveSpeed: 0,
    windSpeed: 4.0,
    windDirDeg: 60,
    arrows: 5,
    targetScore: 320,
    lighting: 'sunset'
  },
  {
    id: 22,
    chapter: 5,
    name: 'Matsya Vedha Precision',
    lore: '"Look into the water reflection below, and strike the revolving eye of the golden fish above."',
    objective: 'Rotating celestial Chakra target at 45m. Score 350 points.',
    distance: 45,
    targetType: 'rotating',
    targetRadius: 1.10,
    moveSpeed: 3.2,
    windSpeed: 4.5,
    windDirDeg: 120,
    arrows: 5,
    targetScore: 350,
    lighting: 'sunset'
  },
  {
    id: 23,
    chapter: 5,
    name: 'The Impossible Trajectory',
    lore: '"Curve the arrow through the gale. Let ballistics obey your divine will."',
    objective: 'Ancient Warrior Shield Target at 70m with extreme 7.5 m/s crosswind. Score 340 points.',
    distance: 70,
    targetType: 'shield',
    targetRadius: 1.15,
    moveSpeed: 0,
    windSpeed: 7.5,
    windDirDeg: 90,
    arrows: 5,
    targetScore: 340,
    lighting: 'sunset'
  },
  {
    id: 24,
    chapter: 5,
    name: 'Solar Zenith',
    lore: '"Surya blesses his son with unyielding focus. The arrow and archer become one."',
    objective: 'Sacred Chakra Target spinning rapidly at 60m. Score 380 points.',
    distance: 60,
    targetType: 'rotating',
    targetRadius: 1.10,
    moveSpeed: 3.8,
    windSpeed: 5.5,
    windDirDeg: 210,
    arrows: 5,
    targetScore: 380,
    lighting: 'sunset'
  },
  {
    id: 25,
    chapter: 5,
    name: 'Vijaya Dhanush Legend',
    lore: '"Destined to become eternal. The golden Vijaya Dhanush sings in the hands of the greatest archer."',
    objective: 'The Ultimate Archery Test: High-speed Hanging Royal Sun Target swaying at 75m. Score 400 points to claim the Vijaya Dhanush!',
    distance: 75,
    targetType: 'hanging',
    targetRadius: 1.15,
    moveSpeed: 2.5,
    windSpeed: 6.5,
    windDirDeg: 180,
    arrows: 5,
    targetScore: 400,
    lighting: 'sunset',
    unlockBow: 'vijaya'
  }
];

export const SPECIAL_CHALLENGES = [
  {
    id: 'fish-eye',
    name: 'Matsya Vedha (Fish Eye)',
    chapter: 5,
    objective: 'Hit the revolving eye of the golden fish suspended high above the pond.',
    distance: 40,
    targetType: 'rotating',
    targetRadius: 0.85,
    moveSpeed: 3.5,
    moveRange: 6.0,
    windSpeed: 3.0,
    windDirDeg: 90,
    arrows: 5,
    targetScore: 350,
    lighting: 'sunset'
  },
  {
    id: 'chariot-assault',
    name: 'Moving War Chariot',
    chapter: 4,
    objective: 'Hit rapid targets mounted on galloping battlefield chariots.',
    distance: 48,
    targetType: 'moving',
    targetRadius: 1.15,
    moveSpeed: 4.5,
    moveRange: 9.5,
    windSpeed: 4.5,
    windDirDeg: 180,
    arrows: 5,
    targetScore: 320,
    lighting: 'sunset'
  },
  {
    id: 'darkness-trial',
    name: 'The Darkness Trial',
    chapter: 3,
    objective: 'Pitch-black night. Aim by the flicker of flame braziers.',
    distance: 42,
    targetType: 'hanging',
    targetRadius: 1.15,
    moveSpeed: 2.6,
    windSpeed: 3.0,
    windDirDeg: 270,
    arrows: 5,
    targetScore: 300,
    lighting: 'night'
  },
  {
    id: 'tempest-gale',
    name: 'The Himalayan Tempest',
    chapter: 3,
    objective: 'Survive and conquer an extreme 8.5 m/s mountain gale at 65m.',
    distance: 65,
    targetType: 'precision',
    targetRadius: 0.88,
    moveSpeed: 0,
    windSpeed: 8.5,
    windDirDeg: 110,
    arrows: 5,
    targetScore: 280,
    lighting: 'sunset'
  }
];

class LevelManager {
  constructor() {
    this.levels = ALL_LEVELS;
    this.challenges = SPECIAL_CHALLENGES;
  }

  getAllLevels() {
    return this.levels;
  }

  getLevelsForChapter(chapterId) {
    const ch = parseInt(chapterId);
    return this.levels.filter(l => l.chapter === ch);
  }

  getLevel(levelId) {
    const id = parseInt(levelId);
    return this.levels.find(l => l.id === id) || this.levels[0];
  }

  isLevelUnlocked(levelId) {
    return storage.isLevelUnlocked(parseInt(levelId));
  }

  unlockLevel(levelId) {
    const id = parseInt(levelId);
    if (id > storage.data.unlockedLevels && id <= 25) {
      storage.data.unlockedLevels = id;
      storage.save();
    }
  }

  completeLevel(levelId, score, stars, coins) {
    storage.recordLevelCompletion(levelId, score, stars, coins);
  }

  getNextLevel(currentLevelId) {
    const id = parseInt(currentLevelId);
    if (id < 25) {
      return this.getLevel(id + 1);
    }
    return null;
  }

  getSpecialChallenge(challengeId) {
    return this.challenges.find(c => c.id === challengeId) || this.challenges[0];
  }
}

export const levelManager = new LevelManager();

