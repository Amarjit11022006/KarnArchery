/**
 * KarnArchery - Gameplay Engine Module
 * Orchestrates 3D Archer, Bowstring Mechanics, Vector Ballistics, Target Collision,
 * Scoring, Dual Cameras (FPS/TPS), Particle Bursts, and Level Completion.
 */

import * as THREE from 'three';
import { SceneManager } from './scene.js';
import { Environment } from './environment.js';
import { Archer } from './archer.js';
import { CameraManager } from './camera.js';
import { ArrowPool } from './arrow.js';
import { Target } from './targets.js';
import { physics } from './physics.js';
import { scoring } from './scoring.js';
import { audio } from './audio.js';
import { storage } from './storage.js';

export class GameplayEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    // Scene & Environment
    this.sceneManager = new SceneManager(this.canvas);
    this.environment = new Environment(this.sceneManager.scene);
    this.cameraManager = new CameraManager(this.canvas);

    // Main Archer
    const equippedBowId = storage.getEquippedBow();
    this.archer = new Archer(equippedBowId);
    this.sceneManager.scene.add(this.archer.mesh);
    this.archer.mesh.position.set(0, 0.18, 0); // Ground platform

    // Apply saved customization
    if (storage.data.customization) {
      this.archer.setArmorTint(storage.data.customization.armorTint || 'gold');
      this.archer.setCapeColor(storage.data.customization.capeColor || 'crimson');
    }

    // Active Target
    this.currentTarget = null;

    // Arrow Object Pool (pre-allocated reusable 3D arrows)
    this.arrowPool = new ArrowPool(this.sceneManager.scene, 12);
    this.arrowPool.setBowType(equippedBowId);
    this.activeArrows = [];

    // Current level configuration
    this.currentLevelConfig = null;
    this.isTrainingMode = false;

    // Start in menu camera mode
    this.cameraManager.setMode('menu');

    // Apply saved camera settings
    const s = storage.getSettings();
    this.cameraManager.setSensitivity(s.sensitivity);
    this.cameraManager.setFov(s.fov);
  }

  setQuality(level = 'high') {
    this.sceneManager.setQuality(level);
    this.environment.setQuality(level);
  }

  setBow(bowId) {
    this.archer.equipBow(bowId);
    this.arrowPool.setBowType(bowId);
  }

  // --- Aiming & Drawing Callbacks ---

  onAim(dx, dy) {
    this.cameraManager.addAimDelta(dx, dy);
  }

  onStartDraw() {
    if (scoring.getArrowsRemaining() <= 0 && !this.isTrainingMode) return;
    this.archer.animator.setState('drawing');
    this.archer.setNockedArrow(true, 0);
    audio.startBowDraw(0.1);
  }

  onDrawPower(power) {
    this.archer.animator.setDrawAmount(power);
    this.archer.bow.updateStringPoints(power);
    this.archer.setNockedArrow(true, power);
    audio.startBowDraw(power);
  }

  onCancelDraw() {
    this.archer.animator.setState('idle');
    this.archer.animator.setDrawAmount(0);
    this.archer.bow.updateStringPoints(0);
    this.archer.setNockedArrow(false, 0);
    audio.stopBowDraw();
  }

  getAimTargetInfo() {
    // 1. Cast an aiming ray from the camera through the crosshair (screen center: NDC (0, 0))
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.cameraManager.camera);
    const cameraRay = raycaster.ray;

    let aimWorldPoint = null;
    let isTargetHit = false;
    let target = this.currentTarget;
    let targetDistance = 30;

    if (target && target.isActive) {
      const targetCenter = target.getWorldPosition(new THREE.Vector3());
      const targetNormal = target.getWorldNormal(new THREE.Vector3());
      targetDistance = this.cameraManager.camera.position.distanceTo(targetCenter);

      // Plane of the target face
      const targetPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(targetNormal, targetCenter);
      const intersectPoint = new THREE.Vector3();
      const hitsPlane = cameraRay.intersectPlane(targetPlane, intersectPoint);

      if (hitsPlane) {
        aimWorldPoint = intersectPoint;
        const distFromCenter = aimWorldPoint.distanceTo(targetCenter);
        if (distFromCenter <= target.outerRadius) {
          isTargetHit = true;
        }
      }
    }

    if (!aimWorldPoint) {
      aimWorldPoint = cameraRay.at(targetDistance, new THREE.Vector3());
    }

    // 2. Arrow launch origin directly from the 3D bow shelf / arrow nock
    const launchOrigin = this.archer.getArrowLaunchOrigin();
    const toAimPoint = new THREE.Vector3().subVectors(aimWorldPoint, launchOrigin);
    const distToAim = toAimPoint.length();

    return {
      cameraRay,
      aimWorldPoint,
      launchOrigin,
      distToAim,
      isTargetHit,
      target
    };
  }

  updateAimAssist() {
    const aimInfo = this.getAimTargetInfo();
    const { aimWorldPoint, isTargetHit, target, distToAim } = aimInfo;

    // Highlight target when crosshair is over it
    if (target && target.setHighlighted) {
      target.setHighlighted(isTargetHit);
    }

    // Calculate predicted impact point on target screen
    let screenPos = null;
    if (isTargetHit && target) {
      const currentPower = this.archer.animator.drawAmount || 0.85;
      const baseSpeed = this.archer.bow.config.speed;
      const launchSpeed = baseSpeed * (0.40 + currentPower * 0.60);
      const flightTime = Math.max(0.1, distToAim / launchSpeed);

      // Wind drift prediction
      const effectiveWind = physics.wind.clone().multiplyScalar(1 - this.archer.bow.config.windResistance * 0.9);
      const windDriftX = 0.5 * effectiveWind.x * flightTime * flightTime;
      const windDriftZ = 0.5 * effectiveWind.z * flightTime * flightTime;

      const predictedPoint = aimWorldPoint.clone().add(new THREE.Vector3(windDriftX, 0, windDriftZ));
      const proj = predictedPoint.clone().project(this.cameraManager.camera);

      // Check if in front of camera
      if (proj.z < 1) {
        screenPos = {
          x: (proj.x * 0.5 + 0.5) * window.innerWidth,
          y: (-(proj.y * 0.5) + 0.5) * window.innerHeight
        };
      }
    }

    if (this.callbacks.onAimAssistUpdate) {
      this.callbacks.onAimAssistUpdate(isTargetHit, screenPos);
    }
  }

  onShoot(power) {
    if (scoring.getArrowsRemaining() <= 0 && !this.isTrainingMode) return;

    // Archer release animation
    this.archer.animator.setState('shooting');
    this.archer.animator.setDrawAmount(0);
    this.archer.bow.updateStringPoints(0);
    this.archer.setNockedArrow(false, 0);
    audio.playArrowRelease();

    // 1. Raycast through crosshair to detect target intersection & world aim position
    const aimInfo = this.getAimTargetInfo();
    const { aimWorldPoint, launchOrigin, distToAim } = aimInfo;

    // 2. Velocity based on bow stats and draw tension (reaching 58-85 m/s)
    const baseSpeed = this.archer.bow.config.speed;
    const launchSpeed = baseSpeed * (0.40 + power * 0.60);

    // 3. Time of flight to target
    const flightTime = Math.max(0.08, distToAim / launchSpeed);

    // 4. Calculate arrow launch direction from actual bow position toward aim position
    // Ballistic gravity compensation: compensates vertical drop so arrow reaches target height
    const gravityCompY = 0.5 * 9.81 * flightTime * flightTime;
    const compensatedAimPoint = aimWorldPoint.clone().add(new THREE.Vector3(0, gravityCompY, 0));
    const launchDirection = new THREE.Vector3().subVectors(compensatedAimPoint, launchOrigin).normalize();

    // 5. Reuse arrow from pool
    const arrow = this.arrowPool.getArrow();
    arrow.launch(launchOrigin, launchDirection, launchSpeed);
    this.activeArrows.push(arrow);

    audio.playArrowWhistle();

    // Record shot in scoring
    scoring.recordShot();

    if (this.callbacks.onShotFired) {
      this.callbacks.onShotFired(scoring.getArrowsRemaining(), scoring.arrowsTotal);
    }
  }

  toggleCamera() {
    const newMode = this.cameraManager.toggleMode();
    return newMode;
  }

  // --- Level Loading ---

  loadLevel(config, isTraining = false) {
    this.currentLevelConfig = config;
    this.isTrainingMode = isTraining;
    this.clearArrows();

    // Dispose previous target
    if (this.currentTarget) {
      this.currentTarget.dispose();
      this.sceneManager.scene.remove(this.currentTarget.mesh);
      this.currentTarget = null;
    }

    // Build target at level distance
    const targetPos = new THREE.Vector3(0, 1.8, config.distance || 25);
    this.currentTarget = new Target({
      id: config.id,
      type: config.targetType || 'stationary',
      position: targetPos,
      radius: config.targetRadius || 0.8,
      moveSpeed: config.moveSpeed || 0,
      moveRange: config.moveRange || 0
    });
    this.sceneManager.scene.add(this.currentTarget.mesh);

    // Environment Lighting & Wind
    this.environment.setLightingMode(config.lighting || 'sunset');
    const windRad = ((config.windDirDeg || 0) * Math.PI) / 180;
    physics.setWind(config.windSpeed || 0, windRad);

    // Reset scoring
    scoring.reset(config.targetScore, config.arrows || 5);

    // Reset Camera & Character
    this.cameraManager.setMode('tps');
    this.cameraManager.yaw = 0;
    this.cameraManager.pitch = 0;
    this.archer.animator.setState('idle');
    this.archer.setNockedArrow(false, 0);

    // Audio theme
    audio.setChapterTheme(config.chapter || 1);
    audio.startMusic();
  }

  clearArrows() {
    this.arrowPool.resetAll();
    this.activeArrows = [];
  }

  // --- Render Loop Update ---

  update(dt, isPlaying) {
    // Always update environment atmospheric particles
    this.environment.update(dt, physics.windSpeed);

    if (isPlaying) {
      if (this.currentTarget) {
        this.currentTarget.update(dt);
      }

      this.archer.update(dt);
      this.updateArrows(dt);
      this.cameraManager.update(dt, this.archer);
      this.updateAimAssist();
    } else {
      // Menu orbit camera
      this.cameraManager.update(dt, this.archer);
    }

    this.sceneManager.render(this.cameraManager.camera);
  }

  updateArrows(dt) {
    const bowResistance = this.archer.bow.config.windResistance;

    for (let i = this.activeArrows.length - 1; i >= 0; i--) {
      const arrow = this.activeArrows[i];
      if (!arrow.isFlying) continue;

      arrow.flightTime += dt;

      // Ballistic integration
      const step = physics.updateArrow(arrow, dt, bowResistance);
      if (!step) continue;

      // Target Collision
      if (this.currentTarget && !arrow.hasHit) {
        const hitResult = physics.checkTargetCollision(step.from, step.to, this.currentTarget);

        if (hitResult) {
          arrow.attachToTarget(
            this.currentTarget.targetFace,
            hitResult.point,
            hitResult.target.getWorldNormal(new THREE.Vector3())
          );
          if (this.currentTarget.triggerImpactRecoil) {
            this.currentTarget.triggerImpactRecoil(hitResult.point, arrow.velocity);
          }
          this.currentTarget.spawnHitParticles(hitResult.point, hitResult.isBullseye);
          audio.playTargetImpact(hitResult.isBullseye);

          const scoreInfo = scoring.recordHit(hitResult);

          if (this.callbacks.onScoreHit) {
            this.callbacks.onScoreHit(scoreInfo);
          }

          this.checkEndOfLevel();
          continue;
        }
      }

      // Ground Collision (Y <= 0)
      const groundHit = physics.checkGroundCollision(step.from, step.to, 0);
      if (groundHit && !arrow.hasHit) {
        arrow.attachToGround(groundHit.point);
        audio.playTargetImpact(false);
        const missInfo = scoring.recordMiss();

        if (this.callbacks.onScoreMiss) {
          this.callbacks.onScoreMiss(missInfo);
        }

        this.checkEndOfLevel();
        continue;
      }

      // Safety timeout: arrow flying too far
      if (arrow.flightTime > 4.5 && !arrow.hasHit) {
        arrow.isFlying = false;
        arrow.hasHit = true;
        const missInfo = scoring.recordMiss();

        if (this.callbacks.onScoreMiss) {
          this.callbacks.onScoreMiss(missInfo);
        }

        this.checkEndOfLevel();
      }
    }
  }

  checkEndOfLevel() {
    if (this.isTrainingMode) return;

    const isAnyArrowFlying = this.activeArrows.some(a => a.isFlying);

    if (scoring.getArrowsRemaining() <= 0 && !isAnyArrowFlying) {
      setTimeout(() => {
        this.evaluateResult();
      }, 700);
    }
  }

  evaluateResult() {
    const stars = scoring.calculateStars();
    const coins = scoring.calculateCoinsEarned();
    const score = scoring.currentScore;
    const targetScore = scoring.targetScore;
    const accuracy = scoring.getAccuracy();
    const bullseyes = scoring.bullseyeCount;

    if (stars > 0) {
      audio.playVictorySound();
      this.archer.animator.setState('victory');

      if (this.currentLevelConfig && this.currentLevelConfig.unlockBow) {
        storage.unlockBow(this.currentLevelConfig.unlockBow);
      }

      if (this.currentLevelConfig && this.currentLevelConfig.id) {
        storage.recordLevelCompletion(this.currentLevelConfig.id, score, stars, coins);
      }
    } else {
      audio.playDefeatSound();
      this.archer.animator.setState('defeat');
    }

    if (this.callbacks.onLevelComplete) {
      this.callbacks.onLevelComplete({
        stars,
        score,
        targetScore,
        accuracy,
        bullseyes,
        coins,
        isVictory: stars > 0,
        levelId: this.currentLevelConfig ? this.currentLevelConfig.id : 1,
        hasNextLevel: this.currentLevelConfig && this.currentLevelConfig.id < 25
      });
    }
  }
}

