/**
 * KarnArchery - Character Animation Controller
 * AAA-Grade state-machine driven skeletal animation blending with smooth interpolation (slerp/lerp)
 * for:
 * - Idle Breathing & Natural Posture
 * - Walking & Running Locomotion
 * - Bow Holding & Weapon Grip
 * - Arrow Nocking from Back Quiver
 * - Bowstring Drawing & Kinetic Body Tension
 * - Dynamic 3D Aiming with Aim Pitch Alignment
 * - Explosive Arrow Release & Bow Recoil Follow-Through
 * - Victory Salute to Surya & Solemn Defeat
 * - Multi-Frequency Royal Cape Cloth Dynamics
 */

import * as THREE from 'three';

export class AnimationController {
  constructor(archer) {
    this.archer = archer;
    this.currentState = 'idle';
    this.previousState = 'idle';
    this.stateTime = 0;
    this.blendFactor = 1.0;
    this.drawAmount = 0; // 0 (rest) to 1 (full draw)
    this.aimPitch = 0;
  }

  setAimPitch(pitch) {
    this.aimPitch = pitch;
  }

  setState(newState) {
    if (this.currentState === newState) return;
    this.previousState = this.currentState;
    this.currentState = newState;
    this.stateTime = 0;
    this.blendFactor = 0;
  }

  setDrawAmount(amount) {
    this.drawAmount = Math.max(0, Math.min(1, amount));
  }

  update(dt) {
    this.stateTime += dt;
    if (this.blendFactor < 1.0) {
      this.blendFactor = Math.min(1.0, this.blendFactor + dt * 4.5); // Fast smooth blend
    }

    const t = this.stateTime;
    const bones = this.archer.bones;
    if (!bones) return;

    // Apply animation based on current active state
    switch (this.currentState) {
      case 'idle':
        this.animateIdle(t, dt);
        break;
      case 'nocking':
        this.animateNocking(t, dt);
        break;
      case 'aiming':
      case 'drawing':
        this.animateDrawAndAim(t, dt);
        break;
      case 'shooting':
        this.animateShooting(t, dt);
        break;
      case 'victory':
        this.animateVictory(t, dt);
        break;
      case 'defeat':
        this.animateDefeat(t, dt);
        break;
      case 'walking':
        this.animateWalking(t, dt);
        break;
      case 'running':
        this.animateRunning(t, dt);
        break;
      default:
        this.animateIdle(t, dt);
        break;
    }

    // Dynamic multi-frequency royal cape flutter in wind
    this.animateCape(t, dt);
  }

  // ---------------------------------------------------------------------------
  // 1. Idle Breathing & Natural Stance
  // ---------------------------------------------------------------------------
  animateIdle(t, dt) {
    const { spine, chest, head, leftArm, leftForearm, leftHand, rightArm, rightForearm, rightHand, leftLeg, rightLeg } = this.archer.bones;

    // Natural diaphragmatic breathing motion
    const breathe = Math.sin(t * 2.2) * 0.022;
    if (spine) spine.rotation.x = THREE.MathUtils.lerp(spine.rotation.x, breathe * 0.6, 0.1);
    if (chest) chest.rotation.x = THREE.MathUtils.lerp(chest.rotation.x, breathe * 0.8, 0.1);
    if (head) head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -breathe * 0.4, 0.1);

    // Left arm holding bow naturally at relaxed 45-degree angle
    if (leftArm) {
      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0.28 + Math.sin(t * 1.4) * 0.015, 0.1);
      leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0.14, 0.1);
      leftArm.rotation.y = THREE.MathUtils.lerp(leftArm.rotation.y, 0.12, 0.1);
    }
    if (leftForearm) leftForearm.rotation.x = THREE.MathUtils.lerp(leftForearm.rotation.x, 0.38, 0.1);
    if (leftHand) leftHand.rotation.x = THREE.MathUtils.lerp(leftHand.rotation.x, 0.08, 0.1);

    // Right arm resting loosely by thigh
    if (rightArm) {
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.12, 0.1);
      rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.14, 0.1);
      rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, -0.08, 0.1);
    }
    if (rightForearm) rightForearm.rotation.x = THREE.MathUtils.lerp(rightForearm.rotation.x, 0.28, 0.1);
    if (rightHand) rightHand.rotation.x = THREE.MathUtils.lerp(rightHand.rotation.x, 0, 0.1);

    // Balanced athletic stance
    if (leftLeg) {
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, -0.04, 0.1);
      leftLeg.rotation.z = THREE.MathUtils.lerp(leftLeg.rotation.z, 0.06, 0.1);
    }
    if (rightLeg) {
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0.04, 0.1);
      rightLeg.rotation.z = THREE.MathUtils.lerp(rightLeg.rotation.z, -0.06, 0.1);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Arrow Nocking Animation (Reaching to Quiver and Nocking on String)
  // ---------------------------------------------------------------------------
  animateNocking(t, dt) {
    const { spine, chest, head, rightArm, rightForearm, rightHand, leftArm, leftForearm } = this.archer.bones;

    // Reach back to quiver (0.0s - 0.25s) then bring arrow to shelf (0.25s - 0.5s)
    if (t < 0.25) {
      // Reaching up and back toward quiver
      if (rightArm) {
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 2.4, 0.25);
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.8, 0.25);
        rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, 0.5, 0.25);
      }
      if (rightForearm) rightForearm.rotation.x = THREE.MathUtils.lerp(rightForearm.rotation.x, 1.8, 0.25);
    } else {
      // Bringing arrow forward to bow shelf
      if (rightArm) {
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 1.1, 0.25);
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.3, 0.25);
        rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, -0.2, 0.25);
      }
      if (rightForearm) rightForearm.rotation.x = THREE.MathUtils.lerp(rightForearm.rotation.x, 1.2, 0.25);
    }

    if (t > 0.5) {
      this.setState('drawing');
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Bowstring Drawing & Aiming (Aligned with Arrow & Pitch)
  // ---------------------------------------------------------------------------
  animateDrawAndAim(t, dt) {
    const { spine, chest, head, leftArm, leftForearm, leftHand, rightArm, rightForearm, rightHand, leftLeg, rightLeg } = this.archer.bones;
    const d = this.drawAmount;

    // Upper body rotation: perpendicular warrior stance aligned with target plane
    if (spine) {
      spine.rotation.y = THREE.MathUtils.lerp(spine.rotation.y, 0.68, 0.16);
      spine.rotation.x = THREE.MathUtils.lerp(spine.rotation.x, -this.aimPitch * 0.72 - 0.04, 0.2);
    }
    if (chest) {
      chest.rotation.y = THREE.MathUtils.lerp(chest.rotation.y, 0.12, 0.16);
      chest.rotation.x = THREE.MathUtils.lerp(chest.rotation.x, -this.aimPitch * 0.28, 0.2);
    }

    // Head turns towards target along arrow sightline
    if (head) {
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, -0.65, 0.2);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -this.aimPitch * 0.32 + 0.03, 0.2);
    }

    // Left Arm (Bow Arm): raises forward and locks collinear with the target sightline
    if (leftArm) {
      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 1.48 - this.aimPitch * 0.40, 0.22);
      leftArm.rotation.y = THREE.MathUtils.lerp(leftArm.rotation.y, 0.24, 0.22);
      leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, -0.08, 0.22);
    }
    if (leftForearm) leftForearm.rotation.x = THREE.MathUtils.lerp(leftForearm.rotation.x, 0.04, 0.22);
    if (leftHand) {
      leftHand.rotation.x = THREE.MathUtils.lerp(leftHand.rotation.x, 0.12, 0.22);
      leftHand.rotation.y = THREE.MathUtils.lerp(leftHand.rotation.y, 0, 0.22);
    }

    // Right Arm (Drawing Arm): pulls bowstring back toward the right jaw anchor point
    // Elbow raises high and drives backward as draw power approaches 100%
    const targetRightArmX = THREE.MathUtils.lerp(0.85, 1.46, d);
    const targetRightArmZ = THREE.MathUtils.lerp(-0.35, -1.22, d);
    const targetRightForearmX = THREE.MathUtils.lerp(0.55, 2.18, d);

    if (rightArm) {
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, targetRightArmX, 0.25);
      rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, -0.32 * d, 0.25);
      rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, targetRightArmZ, 0.25);
    }
    if (rightForearm) {
      rightForearm.rotation.x = THREE.MathUtils.lerp(rightForearm.rotation.x, targetRightForearmX, 0.25);
    }
    if (rightHand) {
      rightHand.rotation.z = THREE.MathUtils.lerp(rightHand.rotation.z, -0.42 * d, 0.25);
    }

    // High tension micro-tremor when holding at maximum power (> 85%)
    if (d > 0.85) {
      const tremor = (Math.random() - 0.5) * 0.012 * (d - 0.85) * 6;
      if (rightArm) rightArm.rotation.x += tremor;
      if (leftArm) leftArm.rotation.y += tremor * 0.5;
    }

    // Stable warrior stance with braced feet
    if (leftLeg) {
      leftLeg.rotation.z = THREE.MathUtils.lerp(leftLeg.rotation.z, 0.14, 0.12);
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0.06, 0.12);
    }
    if (rightLeg) {
      rightLeg.rotation.z = THREE.MathUtils.lerp(rightLeg.rotation.z, -0.14, 0.12);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, -0.06, 0.12);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Arrow Release Animation & Bow Recoil Follow-Through
  // ---------------------------------------------------------------------------
  animateShooting(t, dt) {
    const { spine, head, leftArm, leftForearm, rightArm, rightForearm } = this.archer.bones;

    // Explosive release recoil decay
    const recoilDecay = Math.max(0, 1 - t * 4.2);

    if (rightArm) {
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 1.32, 0.35);
      rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -1.48 * recoilDecay, 0.35);
    }
    if (rightForearm) {
      rightForearm.rotation.x = THREE.MathUtils.lerp(rightForearm.rotation.x, 0.52, 0.35);
    }

    // Left arm subtle upward recoil vibration
    if (leftArm) {
      leftArm.rotation.x += Math.sin(t * 32) * 0.028 * recoilDecay;
    }

    // Transition smoothly back to idle after recoil completes
    if (t > 0.36) {
      this.setState('idle');
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Walking Locomotion
  // ---------------------------------------------------------------------------
  animateWalking(t, dt) {
    const { leftLeg, rightLeg, leftArm, rightArm, spine, pelvis } = this.archer.bones;
    const stride = Math.sin(t * 5.2);

    if (leftLeg) leftLeg.rotation.x = stride * 0.42;
    if (rightLeg) rightLeg.rotation.x = -stride * 0.42;

    if (leftArm) leftArm.rotation.x = 0.28 - stride * 0.22;
    if (rightArm) rightArm.rotation.x = 0.22 + stride * 0.22;

    if (spine) {
      spine.position.y = Math.abs(Math.cos(t * 5.2)) * 0.035;
      spine.rotation.y = stride * 0.06;
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Running Locomotion
  // ---------------------------------------------------------------------------
  animateRunning(t, dt) {
    const { leftLeg, rightLeg, leftArm, rightArm, spine, pelvis } = this.archer.bones;
    const stride = Math.sin(t * 8.5);

    if (leftLeg) leftLeg.rotation.x = stride * 0.75;
    if (rightLeg) rightLeg.rotation.x = -stride * 0.75;

    if (leftArm) leftArm.rotation.x = 0.45 - stride * 0.55;
    if (rightArm) rightArm.rotation.x = 0.45 + stride * 0.55;

    if (spine) {
      spine.position.y = Math.abs(Math.cos(t * 8.5)) * 0.065;
      spine.rotation.x = 0.18; // Athletic forward sprint lean
      spine.rotation.y = stride * 0.12;
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Victory Salute to Surya
  // ---------------------------------------------------------------------------
  animateVictory(t, dt) {
    const { spine, chest, head, leftArm, leftForearm, rightArm, rightForearm } = this.archer.bones;

    // Proud heroic chest arch
    if (spine) {
      spine.rotation.x = THREE.MathUtils.lerp(spine.rotation.x, -0.22, 0.12);
      spine.rotation.y = THREE.MathUtils.lerp(spine.rotation.y, 0, 0.12);
    }
    if (chest) {
      chest.rotation.x = THREE.MathUtils.lerp(chest.rotation.x, -0.15, 0.12);
    }
    if (head) {
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -0.32, 0.12);
    }

    // Left arm raises the divine Dhanush high to the heavens!
    if (leftArm) {
      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 2.85, 0.14);
      leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0.32, 0.14);
    }
    if (leftForearm) leftForearm.rotation.x = THREE.MathUtils.lerp(leftForearm.rotation.x, 0.08, 0.14);

    // Right arm placed boldly on hip
    if (rightArm) {
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.32, 0.12);
      rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.88, 0.12);
    }
    if (rightForearm) rightForearm.rotation.x = THREE.MathUtils.lerp(rightForearm.rotation.x, 1.45, 0.12);
  }

  // ---------------------------------------------------------------------------
  // 8. Solemn Defeat / Humility
  // ---------------------------------------------------------------------------
  animateDefeat(t, dt) {
    const { spine, head, leftArm, leftForearm, rightArm, rightForearm } = this.archer.bones;

    // Bow head in solemn warrior honor
    if (spine) {
      spine.rotation.x = THREE.MathUtils.lerp(spine.rotation.x, 0.24, 0.08);
      spine.rotation.y = THREE.MathUtils.lerp(spine.rotation.y, 0, 0.08);
    }
    if (head) head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0.48, 0.08);

    // Arms held low with reverence
    if (leftArm) {
      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0.12, 0.08);
      leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0.08, 0.08);
    }
    if (rightArm) {
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.12, 0.08);
      rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.08, 0.08);
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Multi-Frequency Dynamic Cape Cloth Physics
  // ---------------------------------------------------------------------------
  animateCape(t, dt) {
    if (this.archer.capeMesh) {
      // Wind harmonics (primary gust + secondary flutter)
      const primaryFlutter = Math.sin(t * 3.4) * 0.09;
      const secondaryRipples = Math.cos(t * 7.2) * 0.035;
      const windForce = 0.14 + primaryFlutter + secondaryRipples;

      this.archer.capeMesh.rotation.x = 0.12 + windForce;
      this.archer.capeMesh.rotation.y = Math.cos(t * 2.6) * 0.06;
      this.archer.capeMesh.rotation.z = Math.sin(t * 2.1) * 0.03;
    }
  }
}
