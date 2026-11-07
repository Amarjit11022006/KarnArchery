/**
 * KarnArchery - Scoring & Combo System
 * Calculates ring scores, perfect center bonuses, consecutive hit multipliers,
 * accuracy, star ratings (1-3 stars), and coin rewards.
 */

export class ScoringSystem {
  constructor() {
    this.currentScore = 0;
    this.targetScore = 150;
    this.arrowsTotal = 5;
    this.arrowsShot = 0;
    this.arrowsHit = 0;
    this.bullseyeCount = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
  }

  reset(targetScore = 150, arrowsTotal = 5) {
    this.currentScore = 0;
    this.targetScore = targetScore;
    this.arrowsTotal = arrowsTotal;
    this.arrowsShot = 0;
    this.arrowsHit = 0;
    this.bullseyeCount = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
  }

  recordShot() {
    this.arrowsShot++;
  }

  getArrowsRemaining() {
    return Math.max(0, this.arrowsTotal - this.arrowsShot);
  }

  recordHit(hitResult) {
    this.arrowsHit++;
    this.currentStreak++;
    if (this.currentStreak > this.maxStreak) {
      this.maxStreak = this.currentStreak;
    }

    // Multiplier for streak: 1x, 1.2x (2 hits), 1.5x (3 hits), 2.0x (4+ hits)
    let multiplier = 1.0;
    if (this.currentStreak >= 4) multiplier = 2.0;
    else if (this.currentStreak === 3) multiplier = 1.5;
    else if (this.currentStreak === 2) multiplier = 1.2;

    const basePoints = hitResult.points || 10;
    const awardedPoints = Math.round(basePoints * multiplier);
    this.currentScore += awardedPoints;

    if (hitResult.isBullseye) {
      this.bullseyeCount++;
    }

    return {
      awardedPoints: awardedPoints,
      basePoints: basePoints,
      multiplier: multiplier,
      streak: this.currentStreak,
      isBullseye: hitResult.isBullseye,
      isPerfect: hitResult.isPerfect,
      ring: hitResult.ring,
      totalScore: this.currentScore
    };
  }

  recordMiss() {
    this.currentStreak = 0;
    return {
      awardedPoints: 0,
      ring: 'miss',
      streak: 0,
      totalScore: this.currentScore
    };
  }

  getAccuracy() {
    if (this.arrowsShot === 0) return 100;
    return Math.round((this.arrowsHit / this.arrowsShot) * 100);
  }

  calculateStars() {
    if (this.currentScore < this.targetScore) {
      return 0; // Failed
    }

    let stars = 1; // Passed minimum target
    if (this.currentScore >= this.targetScore * 1.35 || this.bullseyeCount >= 2) {
      stars = 2;
    }
    if (this.currentScore >= this.targetScore * 1.65 && this.getAccuracy() >= 80) {
      stars = 3;
    }
    return stars;
  }

  calculateCoinsEarned() {
    const stars = this.calculateStars();
    if (stars === 0) return 0;
    // Base coins + bonus per bullseye + star bonus
    const baseCoins = 25 * stars;
    const bullseyeCoins = this.bullseyeCount * 15;
    return baseCoins + bullseyeCoins;
  }
}

export const scoring = new ScoringSystem();

