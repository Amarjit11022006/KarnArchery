/**
 * KarnArchery - 3D Projectile Physics & Ballistics Engine
 * Custom vector-based projectile motion with gravity, wind acceleration, aerodynamic drag,
 * tangent rotation alignment, and swept-ray continuous collision detection.
 */

import * as THREE from 'three';

export class PhysicsEngine {
  constructor() {
    this.gravity = new THREE.Vector3(0, -9.81, 0);
    this.wind = new THREE.Vector3(0, 0, 0); // Current wind vector (m/s^2)
    this.windSpeed = 0;                     // Wind magnitude in m/s
    this.windDirectionRad = 0;             // Wind direction angle in radians
    this.airDragCoeff = 0.00075;           // Realistic aerodynamic drag coefficient for arrow
  }

  /**
   * Set environmental wind
   * @param {number} speed - speed in m/s (e.g. 0 to 12 m/s)
   * @param {number} directionRad - angle in radians (0 = east, PI/2 = north, etc.)
   */
  setWind(speed, directionRad) {
    this.windSpeed = speed;
    this.windDirectionRad = directionRad;
    // Calculate wind acceleration vector in X-Z plane
    // Wind exerts lateral acceleration on arrow
    const accelMag = speed * 0.35; // scaled wind force
    this.wind.set(
      Math.cos(directionRad) * accelMag,
      0,
      Math.sin(directionRad) * accelMag
    );
  }

  /**
   * Update an active arrow's position, velocity, and orientation over delta time
   * @param {Object} arrow - arrow object with position, velocity, mesh, isFlying
   * @param {number} dt - delta time in seconds (clamped to prevent huge steps)
   * @param {number} windResistanceFactor - bow's wind resistance (e.g. 0.7 to 0.99)
   */
  updateArrow(arrow, dt, windResistanceFactor = 0.8) {
    if (!arrow || !arrow.isFlying) return null;

    // Clamp delta time to avoid tunneling or erratic physics on lag spikes
    const subDt = Math.min(dt, 0.033);

    // Store previous position for swept collision raycasting
    if (!arrow.prevPosition) {
      arrow.prevPosition = arrow.position.clone();
    } else {
      arrow.prevPosition.copy(arrow.position);
    }

    // Calculate acceleration: gravity + wind - air resistance
    const speed = arrow.velocity.length();
    const dragMag = this.airDragCoeff * speed * speed;
    const dragVec = arrow.velocity.clone().normalize().multiplyScalar(-dragMag);

    // Effective wind factoring in bow's resistance
    const effectiveWind = this.wind.clone().multiplyScalar(1 - windResistanceFactor * 0.9);

    const totalAccel = new THREE.Vector3()
      .add(this.gravity)
      .add(effectiveWind)
      .add(dragVec);

    // Update velocity: v = v0 + a * dt
    arrow.velocity.addScaledVector(totalAccel, subDt);

    // Update position: p = p0 + v * dt
    arrow.position.addScaledVector(arrow.velocity, subDt);
    arrow.mesh.position.copy(arrow.position);

    // Align arrow orientation along its velocity tangent vector
    if (arrow.velocity.lengthSq() > 0.001) {
      const dir = arrow.velocity.clone().normalize();
      // Arrow model is built along Z or -Z axis; orient smoothly to velocity
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        dir
      );
      arrow.mesh.quaternion.slerp(targetQuat, 0.4);
    }

    return {
      from: arrow.prevPosition,
      to: arrow.position
    };
  }

  /**
   * Continuous swept-line ray collision against a target plane and rings
   * @param {THREE.Vector3} rayStart - previous position
   * @param {THREE.Vector3} rayEnd - current position
   * @param {Object} target - target object with center, normal, radius, rings
   * @returns {Object|null} hit info or null
   */
  checkTargetCollision(rayStart, rayEnd, target) {
    if (!target || !target.isActive) return null;

    const rayDir = new THREE.Vector3().subVectors(rayEnd, rayStart);
    const rayLength = rayDir.length();
    if (rayLength < 0.0001) return null;
    rayDir.normalize();

    // Target plane definition: normal vector and center point
    const targetCenter = target.getWorldPosition(new THREE.Vector3());
    const targetNormal = target.getWorldNormal(new THREE.Vector3());

    // Ray-plane intersection test
    const denom = targetNormal.dot(rayDir);
    // Arrow should only hit from the front face (denom < 0)
    if (Math.abs(denom) < 1e-6) return null;

    const t = targetNormal.dot(new THREE.Vector3().subVectors(targetCenter, rayStart)) / denom;

    // Check if intersection point lies within the step segment [0, rayLength] (with buffer to prevent tunneling at high velocity)
    if (t >= -0.15 && t <= rayLength + 0.25) {
      const hitPoint = rayStart.clone().addScaledVector(rayDir, Math.max(0, t));
      
      // Distance from target center point in the target plane
      const distFromCenter = hitPoint.distanceTo(targetCenter);

      // Check if within the target face outer circle
      if (distFromCenter <= target.outerRadius) {
        // Determine ring
        const rRatio = distFromCenter / target.outerRadius;
        let ring = 'outer';
        let points = 10;
        let isBullseye = false;
        let isPerfect = false;

        if (rRatio <= 0.18) {
          ring = 'bullseye';
          points = 100;
          isBullseye = true;
          if (rRatio <= 0.06) {
            points += 50; // Perfect shot bonus
            isPerfect = true;
          }
        } else if (rRatio <= 0.44) {
          ring = 'inner';
          points = 50;
        } else if (rRatio <= 0.72) {
          ring = 'middle';
          points = 30;
        }

        return {
          hit: true,
          point: hitPoint,
          targetCenter: targetCenter,
          distFromCenter: distFromCenter,
          ring: ring,
          points: points,
          isBullseye: isBullseye,
          isPerfect: isPerfect,
          target: target
        };
      }
    }

    return null;
  }

  /**
   * Check collision with ground plane (y = 0)
   */
  checkGroundCollision(rayStart, rayEnd, groundY = 0) {
    if ((rayStart.y >= groundY && rayEnd.y <= groundY) || rayEnd.y <= groundY) {
      const t = (groundY - rayStart.y) / (rayEnd.y - rayStart.y);
      const hitPoint = rayStart.clone().lerp(rayEnd, Math.max(0, Math.min(1, t)));
      hitPoint.y = groundY;
      return {
        hit: true,
        point: hitPoint
      };
    }
    return null;
  }
}

export const physics = new PhysicsEngine();

