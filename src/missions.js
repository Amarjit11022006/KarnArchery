/**
 * KarnArchery - Missions & Level Database
 * 25 Story levels across 5 Chapters plus Special Challenges.
 * Each level defines targets, distance, wind, lighting, arrows, and mythological narrative.
 */

export const CHAPTERS_DATA = [
  {
    id: 1,
    title: 'The Beginning',
    subtitle: 'Gurukul Training Grounds',
    description: 'Under the sacred banyan trees of the ashram, the young warrior begins his relentless pursuit of archery mastery.',
    lighting: 'morning',
    levelRange: [1, 5]
  },
  {
    id: 2,
    title: 'The Royal Tournament',
    subtitle: 'Hastinapur Arena',
    description: 'Before royal spectators and proud princes, Karna steps onto the sand to test his skill against moving marks.',
    lighting: 'afternoon',
    levelRange: [6, 10]
  },
  {
    id: 3,
    title: "The Guru's Test",
    subtitle: "Parashurama's Mountain Hermitage",
    description: 'High in the mist-veiled peaks, the legendary master Parashurama demands impossible feats in wind and darkness.',
    lighting: 'sunset',
    levelRange: [11, 15]
  },
  {
    id: 4,
    title: 'The Battlefield',
    subtitle: 'Kurukshetra Plains',
    description: 'Amid the smoke and thunder of clashing armies, arrows must find moving chariots and distant commanders.',
    lighting: 'sunset',
    levelRange: [16, 20]
  },
  {
    id: 5,
    title: 'The Legend',
    subtitle: "Suryaputra's Divine Trials",
    description: 'Ascend beyond mortal limits. Strike the rotating celestial fish and claim the divine Vijaya Dhanush.',
    lighting: 'sunset',
    levelRange: [21, 25]
  }
];

export const LEVELS_DATA = [
  // -------------------------------------------------------------------------
  // CHAPTER 1 – THE BEGINNING (Levels 1 - 5)
  // -------------------------------------------------------------------------
  {
    id: 1,
    chapter: 1,
    name: 'First Flight',
    lore: '"Every arrow takes flight from silence. Hold the grip steady, breathe with the forest."',
    objective: 'Hit the stationary target at 20m. Score at least 120 points.',
    distance: 20,
    targetType: 'stationary',
    targetRadius: 0.85,
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
    name: 'Breath & Balance',
    lore: '"The wind is not your foe, warrior. Learn its whisper before your fingers release the hemp."',
    objective: 'Stationary target at 30m with a gentle cross-breeze.',
    distance: 30,
    targetType: 'stationary',
    targetRadius: 0.8,
    moveSpeed: 0,
    windSpeed: 2.2,
    windDirDeg: 90,
    arrows: 5,
    targetScore: 160,
    lighting: 'morning'
  },
  {
    id: 3,
    chapter: 1,
    name: 'The Swaying Branch',
    lore: '"A warrior does not aim where the bird sits, but where its wings shall meet the dawn."',
    objective: 'Hit a moving target oscillating horizontally at 25m.',
    distance: 25,
    targetType: 'moving',
    targetRadius: 0.8,
    moveSpeed: 1.6,
    moveRange: 5.0,
    windSpeed: 1.5,
    windDirDeg: 45,
    arrows: 5,
    targetScore: 180,
    lighting: 'morning'
  },
  {
    id: 4,
    chapter: 1,
    name: "Master's Discipline",
    lore: '"Strength without focus is as wild fire. Calm your mind; find the gold."',
    objective: 'Longer distance 40m target with increased wind.',
    distance: 40,
    targetType: 'stationary',
    targetRadius: 0.75,
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
    name: 'Gurukul Graduation',
    lore: '"You have learned well, son of Surya. The royal arena awaits your bow."',
    objective: 'Score 250 points on a swaying target at 35m with 5 arrows.',
    distance: 35,
    targetType: 'moving',
    targetRadius: 0.75,
    moveSpeed: 2.0,
    moveRange: 6.0,
    windSpeed: 3.0,
    windDirDeg: 270,
    arrows: 5,
    targetScore: 250,
    lighting: 'morning'
  },

  // -------------------------------------------------------------------------
  // CHAPTER 2 – THE ROYAL TOURNAMENT (Levels 6 - 10)
  // -------------------------------------------------------------------------
  {
    id: 6,
    chapter: 2,
    name: 'The Arena Gate',
    lore: '"They mock your humble lineage. Let your arrow pierce their disbelief."',
    objective: 'Score 200 points on the royal arena target at 32m.',
    distance: 32,
    targetType: 'stationary',
    targetRadius: 0.75,
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
    objective: 'Hit the target at 42m under sudden 4.8 m/s crosswind.',
    distance: 42,
    targetType: 'stationary',
    targetRadius: 0.72,
    moveSpeed: 0,
    windSpeed: 4.8,
    windDirDeg: 180,
    arrows: 5,
    targetScore: 240,
    lighting: 'afternoon'
  },
  {
    id: 8,
    chapter: 2,
    name: 'The Royal Pendulum',
    lore: '"A moving target mocks the hasty hand. Measure its rhythm before you draw."',
    objective: 'Hit the fast-moving pendulum target at 30m.',
    distance: 30,
    targetType: 'moving',
    targetRadius: 0.7,
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
    objective: 'Small precision target at 45m with 4.0 m/s wind.',
    distance: 45,
    targetType: 'stationary',
    targetRadius: 0.65,
    moveSpeed: 0,
    windSpeed: 4.0,
    windDirDeg: 210,
    arrows: 5,
    targetScore: 280,
    lighting: 'afternoon'
  },
  {
    id: 10,
    chapter: 2,
    name: 'Tournament Champion',
    lore: '"The crowd falls silent. With this shot, Karna claims his place among the greatest."',
    objective: 'Tournament final: Moving target at 48m. Unlocks the Royal Bow!',
    distance: 48,
    targetType: 'moving',
    targetRadius: 0.7,
    moveSpeed: 2.8,
    moveRange: 6.5,
    windSpeed: 3.8,
    windDirDeg: 300,
    arrows: 5,
    targetScore: 300,
    lighting: 'afternoon',
    unlockBow: 'royal'
  },

  // -------------------------------------------------------------------------
  // CHAPTER 3 – THE GURU'S TEST (Levels 11 - 15)
  // -------------------------------------------------------------------------
  {
    id: 11,
    chapter: 3,
    name: 'Mountain Updraft',
    lore: '"Parashurama watches from the crags. Gravity yields only to unwavering intent."',
    objective: 'Long-range target across the ravine at 50m with rising winds.',
    distance: 50,
    targetType: 'stationary',
    targetRadius: 0.7,
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
    objective: 'Moving target at 45m during deep twilight.',
    distance: 45,
    targetType: 'moving',
    targetRadius: 0.65,
    moveSpeed: 2.2,
    moveRange: 5.5,
    windSpeed: 4.0,
    windDirDeg: 120,
    arrows: 5,
    targetScore: 280,
    lighting: 'sunset'
  },
  {
    id: 13,
    chapter: 3,
    name: 'Night of the Torches',
    lore: '"Darkness blinds the coward, but guides the master of Shabda-bhedi (sound & instincts)."',
    objective: 'Shoot in darkness! Targets revealed only by flaming torch braziers.',
    distance: 38,
    targetType: 'stationary',
    targetRadius: 0.7,
    moveSpeed: 0,
    windSpeed: 2.5,
    windDirDeg: 90,
    arrows: 5,
    targetScore: 300,
    lighting: 'night'
  },
  {
    id: 14,
    chapter: 3,
    name: 'The Spinning Chakra',
    lore: '"The Sudarshana spins eternal. Time your strike to the center axis."',
    objective: 'Rotating chakra wheel target at 40m.',
    distance: 40,
    targetType: 'rotating',
    targetRadius: 0.7,
    moveSpeed: 2.5,
    windSpeed: 3.5,
    windDirDeg: 180,
    arrows: 5,
    targetScore: 320,
    lighting: 'sunset'
  },
  {
    id: 15,
    chapter: 3,
    name: "Parashurama's Blessing",
    lore: '"You have endured tests no mortal has passed. Take this weapon, Kshatriya."',
    objective: 'Extreme test: Moving target at 55m in sunset gusts. Unlocks Warrior Bow!',
    distance: 55,
    targetType: 'moving',
    targetRadius: 0.65,
    moveSpeed: 2.5,
    moveRange: 6.0,
    windSpeed: 6.2,
    windDirDeg: 75,
    arrows: 5,
    targetScore: 340,
    lighting: 'sunset',
    unlockBow: 'warrior'
  },

  // -------------------------------------------------------------------------
  // CHAPTER 4 – THE BATTLEFIELD (Levels 16 - 20)
  // -------------------------------------------------------------------------
  {
    id: 16,
    chapter: 4,
    name: 'Frontline Barricade',
    lore: '"Kurukshetra trembles with the conch shells. Strike through the battlefield haze."',
    objective: 'Battlefield target at 45m behind smoke and barricades.',
    distance: 45,
    targetType: 'stationary',
    targetRadius: 0.7,
    moveSpeed: 0,
    windSpeed: 5.0,
    windDirDeg: 150,
    arrows: 5,
    targetScore: 280,
    lighting: 'sunset'
  },
  {
    id: 17,
    chapter: 4,
    name: 'Chariot on the Move',
    lore: '"War chariots rumble across the dusty plain. Lead your arrow before the wheel turns."',
    objective: 'Hit the target mounted on a rolling war chariot at 40m!',
    distance: 40,
    targetType: 'chariot',
    targetRadius: 0.75,
    moveSpeed: 3.2,
    moveRange: 10.0,
    windSpeed: 4.5,
    windDirDeg: 90,
    arrows: 5,
    targetScore: 300,
    lighting: 'sunset'
  },
  {
    id: 18,
    chapter: 4,
    name: 'Smoke & Ashes',
    lore: '"Battlefield pyres rise into the dusky sky. Shifting gale forces test your mastery."',
    objective: 'High wind 7.5 m/s challenge at 52m.',
    distance: 52,
    targetType: 'stationary',
    targetRadius: 0.65,
    moveSpeed: 0,
    windSpeed: 7.5,
    windDirDeg: 220,
    arrows: 5,
    targetScore: 320,
    lighting: 'sunset'
  },
  {
    id: 19,
    chapter: 4,
    name: 'Rapid Chariot Flank',
    lore: '"The enemy chariot attempts to outflank your position. End their advance."',
    objective: 'Fast moving chariot target at 50m.',
    distance: 50,
    targetType: 'chariot',
    targetRadius: 0.7,
    moveSpeed: 3.8,
    moveRange: 12.0,
    windSpeed: 5.0,
    windDirDeg: 60,
    arrows: 5,
    targetScore: 350,
    lighting: 'sunset'
  },
  {
    id: 20,
    chapter: 4,
    name: "Commander's Stand",
    lore: '"The sun god Surya bestows his golden brilliance upon his son. Rise, Karna."',
    objective: 'Long-distance 65m moving chariot challenge. Unlocks the Golden Surya Bow!',
    distance: 65,
    targetType: 'chariot',
    targetRadius: 0.7,
    moveSpeed: 3.5,
    moveRange: 12.0,
    windSpeed: 6.0,
    windDirDeg: 180,
    arrows: 5,
    targetScore: 380,
    lighting: 'sunset',
    unlockBow: 'golden'
  },

  // -------------------------------------------------------------------------
  // CHAPTER 5 – THE LEGEND (Levels 21 - 25)
  // -------------------------------------------------------------------------
  {
    id: 21,
    chapter: 5,
    name: 'Divine Reach',
    lore: '"Only the true master can reach marks where the eye can barely discern the center."',
    objective: 'Extreme long range 75m target.',
    distance: 75,
    targetType: 'stationary',
    targetRadius: 0.65,
    moveSpeed: 0,
    windSpeed: 5.5,
    windDirDeg: 135,
    arrows: 5,
    targetScore: 320,
    lighting: 'sunset'
  },
  {
    id: 22,
    chapter: 5,
    name: 'Matsya Vedha (Fish Eye)',
    lore: '"Look upon the still water of the lotus pool. Strike the eye of the revolving golden fish above."',
    objective: 'Mythological Matsya Vedha: Hit the rotating golden fish eye at 35m!',
    distance: 35,
    targetType: 'fish-eye',
    targetRadius: 0.25, // Small precision eye
    moveSpeed: 1.8,
    windSpeed: 3.0,
    windDirDeg: 45,
    arrows: 5,
    targetScore: 350,
    lighting: 'sunset'
  },
  {
    id: 23,
    chapter: 5,
    name: 'Storm of Arrows',
    lore: '"When celestial gales howl, the mind of the archer remains motionless like mount Meru."',
    objective: 'Gale wind 9.5 m/s with moving target at 55m.',
    distance: 55,
    targetType: 'moving',
    targetRadius: 0.6,
    moveSpeed: 3.0,
    moveRange: 7.0,
    windSpeed: 9.5,
    windDirDeg: 280,
    arrows: 5,
    targetScore: 380,
    lighting: 'sunset'
  },
  {
    id: 24,
    chapter: 5,
    name: 'The Golden Eye',
    lore: '"A single strand of silk separates glory from eternity. Strike true."',
    objective: 'Micro-precision target at 65m with rapid lateral movement.',
    distance: 65,
    targetType: 'moving',
    targetRadius: 0.5,
    moveSpeed: 2.8,
    moveRange: 8.0,
    windSpeed: 6.0,
    windDirDeg: 90,
    arrows: 5,
    targetScore: 400,
    lighting: 'sunset'
  },
  {
    id: 25,
    chapter: 5,
    name: 'Destiny: Vijaya Dhanush',
    lore: '"You are Karna: Suryaputra, Radheya, Danaveera, and the greatest archer under heaven. Claim Vijaya!"',
    objective: 'The Ultimate Archery Test: 85m extreme long-range moving target. Unlocks Legendary Vijaya Bow!',
    distance: 85,
    targetType: 'moving',
    targetRadius: 0.6,
    moveSpeed: 3.2,
    moveRange: 8.0,
    windSpeed: 7.0,
    windDirDeg: 120,
    arrows: 5,
    targetScore: 450,
    lighting: 'sunset',
    unlockBow: 'legendary'
  }
];

export const SPECIAL_CHALLENGES = {
  'fish-eye': {
    id: 'fish-eye',
    name: 'Matsya Vedha (Fish Eye Challenge)',
    lore: 'Look down into the reflection bowl and pierce the revolving golden fish.',
    distance: 30,
    targetType: 'fish-eye',
    targetRadius: 0.22,
    moveSpeed: 2.2,
    windSpeed: 3.5,
    windDirDeg: 45,
    arrows: 5,
    targetScore: 300,
    lighting: 'sunset'
  },
  'chariot-assault': {
    id: 'chariot-assault',
    name: 'Moving War Chariot',
    lore: 'Strike rapid battle chariots roaring past at full gallop.',
    distance: 45,
    targetType: 'chariot',
    targetRadius: 0.7,
    moveSpeed: 4.2,
    moveRange: 14.0,
    windSpeed: 5.0,
    windDirDeg: 90,
    arrows: 5,
    targetScore: 350,
    lighting: 'sunset'
  },
  'darkness-trial': {
    id: 'darkness-trial',
    name: 'The Darkness Trial',
    lore: 'Total darkness. Rely solely on instincts and torch flames.',
    distance: 40,
    targetType: 'moving',
    targetRadius: 0.7,
    moveSpeed: 2.0,
    moveRange: 6.0,
    windSpeed: 4.0,
    windDirDeg: 180,
    arrows: 5,
    targetScore: 320,
    lighting: 'night'
  },
  'tempest-gale': {
    id: 'tempest-gale',
    name: 'The Himalayan Tempest',
    lore: 'Defy extreme 12.0 m/s shifting winds across the mountain canyon.',
    distance: 60,
    targetType: 'stationary',
    targetRadius: 0.65,
    moveSpeed: 0,
    windSpeed: 12.0,
    windDirDeg: 270,
    arrows: 5,
    targetScore: 300,
    lighting: 'sunset'
  }
};

export class MissionsManager {
  getLevel(id) {
    return LEVELS_DATA.find(lvl => lvl.id === id) || LEVELS_DATA[0];
  }

  getChapter(chapterId) {
    return CHAPTERS_DATA.find(ch => ch.id === chapterId) || CHAPTERS_DATA[0];
  }

  getLevelsInChapter(chapterId) {
    return LEVELS_DATA.filter(lvl => lvl.chapter === chapterId);
  }

  getSpecialChallenge(challengeId) {
    return SPECIAL_CHALLENGES[challengeId] || SPECIAL_CHALLENGES['fish-eye'];
  }
}

export const missions = new MissionsManager();

