/**
 * KarnArchery - Dual Camera System
 * First-Person (FPS eye-level aiming) and Third-Person (over-the-shoulder cinematic view)
 * with seamless state preservation, zero clipping, and smooth transitions.
 */

import * as THREE from 'three';

export class CameraManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      250
    );

    this.mode = 'tps'; // 'fps' or 'tps' or 'menu'
    
    // Aim angles in radians
    this.yaw = 0;   // Horizontal rotation (around Y)
    this.pitch = 0; // Vertical rotation (around X)

    // Sensitivity factor
    this.sensitivity = 0.0022;

    // Pitch limits (avoid flipping over)
    this.minPitch = -Math.PI / 4; // -45 deg (looking up)
    this.maxPitch = Math.PI / 5;  // +36 deg (looking down)

    // Damped camera transforms
    this.currentPosition = new THREE.Vector3(0, 1.8, -2.4);
    this.targetPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3(0, 1.8, 10);
    this.targetLookAt = new THREE.Vector3();

    // Menu orbit camera
    this.menuTime = 0;

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
  }

  toggleMode() {
    this.mode = (this.mode === 'fps') ? 'tps' : 'fps';
    return this.mode;
  }

  setSensitivity(scale) {
    this.sensitivity = 0.0006 + (scale * 0.00035);
  }

  setFov(fov) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  addAimDelta(deltaX, deltaY) {
    this.yaw -= deltaX * this.sensitivity;
    this.pitch -= deltaY * this.sensitivity;

    // Clamp pitch
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));

    // Clamp yaw
    this.yaw = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, this.yaw));
  }

  getAimDirection() {
    return new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      -Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();
  }

  update(dt, archer) {
    const archerPos = archer ? archer.mesh.position : new THREE.Vector3();

    if (this.mode === 'menu') {
      // Cinematic slow menu orbit around archer and palace
      this.menuTime += dt * 0.25;
      const radius = 3.8;
      this.camera.position.set(
        Math.sin(this.menuTime) * radius,
        1.7 + Math.sin(this.menuTime * 0.5) * 0.2,
        Math.cos(this.menuTime) * radius - 1.0
      );
      this.camera.lookAt(0, 1.45, 0);

      if (archer) {
        archer.setFirstPersonMode(false);
      }
      return;
    }

    const aimDir = this.getAimDirection();

    if (this.mode === 'fps') {
      // First-Person: Camera positioned near the archer's sightline
      const eyeOffset = new THREE.Vector3(0.08, 1.62, 0.16);
      eyeOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      this.targetPosition.copy(archerPos).add(eyeOffset);
      this.targetLookAt.copy(this.targetPosition).add(aimDir.clone().multiplyScalar(20));

      this.currentPosition.lerp(this.targetPosition, 0.45);
      this.currentLookAt.lerp(this.targetLookAt, 0.45);

      this.camera.position.copy(this.currentPosition);
      this.camera.lookAt(this.currentLookAt);

      if (archer) {
        archer.setFirstPersonMode(true);
        archer.mesh.rotation.y = this.yaw;
        archer.setAimPitch(this.pitch);
      }
    } else if (this.mode === 'tps') {
      // Third-Person: Cinematic Over-the-shoulder view
      const shoulderOffset = new THREE.Vector3(0.60, 1.70, -2.2);
      shoulderOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      this.targetPosition.copy(archerPos).add(shoulderOffset);
      
      const lookTarget = archerPos.clone().add(new THREE.Vector3(0, 1.6, 0)).add(aimDir.clone().multiplyScalar(30));
      this.targetLookAt.copy(lookTarget);

      this.currentPosition.lerp(this.targetPosition, 0.22);
      this.currentLookAt.lerp(this.targetLookAt, 0.25);

      this.camera.position.copy(this.currentPosition);
      this.camera.lookAt(this.currentLookAt);

      if (archer) {
        archer.setFirstPersonMode(false);
        archer.mesh.rotation.y = this.yaw;
        archer.setAimPitch(this.pitch);
      }
    }
  }
}
