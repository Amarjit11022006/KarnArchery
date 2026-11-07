/**
 * KarnArchery - 3D Arrow System & Arrow Object Pool
 * High-performance reusable arrow instances with shared geometries & materials,
 * realistic trajectory physics, collision embedding, and zero garbage collection spikes.
 */

import * as THREE from 'three';

// Shared geometries (allocated once for all arrows)
const SHAFT_LENGTH = 0.82;
const SHAFT_RADIUS = 0.0045;

const sharedShaftGeo = new THREE.CylinderGeometry(SHAFT_RADIUS, SHAFT_RADIUS, SHAFT_LENGTH, 8);
sharedShaftGeo.rotateX(Math.PI / 2);

const sharedHeadGeo = new THREE.ConeGeometry(0.013, 0.08, 8);
sharedHeadGeo.rotateX(Math.PI / 2);

const sharedBladeGeo = new THREE.BoxGeometry(0.026, 0.003, 0.05);

const FLETCH_LENGTH = 0.11;
const FLETCH_HEIGHT = 0.014;
const sharedFeatherGeo = new THREE.PlaneGeometry(FLETCH_HEIGHT, FLETCH_LENGTH);
sharedFeatherGeo.rotateX(Math.PI / 2);
sharedFeatherGeo.translate(FLETCH_HEIGHT * 0.5 + SHAFT_RADIUS, 0, 0);

const sharedNockGeo = new THREE.CylinderGeometry(SHAFT_RADIUS * 0.9, SHAFT_RADIUS * 0.9, 0.03, 8);
sharedNockGeo.rotateX(Math.PI / 2);

// Shared materials
const materials = {
  woodShaft: new THREE.MeshStandardMaterial({ color: 0xC69A5D, roughness: 0.4, metalness: 0.05 }),
  goldShaft: new THREE.MeshStandardMaterial({ color: 0xF5B942, roughness: 0.35, metalness: 0.65 }),
  steelHead: new THREE.MeshStandardMaterial({ color: 0x718096, roughness: 0.25, metalness: 0.85 }),
  goldHead: new THREE.MeshStandardMaterial({ color: 0xFFD868, roughness: 0.2, metalness: 0.95 }),
  goldFeather: new THREE.MeshStandardMaterial({ color: 0xF5B942, roughness: 0.7, side: THREE.DoubleSide }),
  redFeather: new THREE.MeshStandardMaterial({ color: 0xA51F2B, roughness: 0.7, side: THREE.DoubleSide }),
  whiteFeather: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.7, side: THREE.DoubleSide }),
  nock: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 })
};

export class Arrow {
  constructor(bowType = 'training') {
    this.mesh = new THREE.Group();
    this.mesh.name = 'Arrow';

    this.position = new THREE.Vector3();
    this.prevPosition = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    
    this.isFlying = false;
    this.hasHit = false;
    this.isDropped = false;
    this.flightTime = 0;
    this.bowType = bowType;
    this.inUse = false;

    this.buildArrowMesh();
  }

  buildArrowMesh() {
    const isGold = this.bowType === 'golden' || this.bowType === 'legendary';
    const isLegend = this.bowType === 'legendary';
    const isWarrior = this.bowType === 'warrior';

    // Shaft
    const shaft = new THREE.Mesh(sharedShaftGeo, isGold ? materials.goldShaft : materials.woodShaft);
    shaft.position.set(0, 0, 0);
    this.mesh.add(shaft);

    // Arrowhead Cone
    const head = new THREE.Mesh(sharedHeadGeo, isGold ? materials.goldHead : materials.steelHead);
    head.position.set(0, 0, SHAFT_LENGTH * 0.5 + 0.04);
    this.mesh.add(head);

    // Arrowhead Blade Flanges
    const blade = new THREE.Mesh(sharedBladeGeo, isGold ? materials.goldHead : materials.steelHead);
    blade.position.set(0, 0, SHAFT_LENGTH * 0.5 + 0.02);
    this.mesh.add(blade);

    // 3 Fletchings
    const featherMat = isLegend ? materials.whiteFeather : (isWarrior ? materials.redFeather : materials.goldFeather);
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const feather = new THREE.Mesh(sharedFeatherGeo, featherMat);
      feather.position.set(0, 0, -SHAFT_LENGTH * 0.5 + FLETCH_LENGTH * 0.6);
      feather.rotation.z = angle;
      this.mesh.add(feather);
    }

    // Nock
    const nock = new THREE.Mesh(sharedNockGeo, materials.nock);
    nock.position.set(0, 0, -SHAFT_LENGTH * 0.5 - 0.015);
    this.mesh.add(nock);

    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });

    this.mesh.visible = false;
  }

  launch(origin, launchDirection, speed) {
    this.position.copy(origin);
    this.prevPosition.copy(origin);
    this.velocity.copy(launchDirection).normalize().multiplyScalar(speed);
    
    this.mesh.position.copy(origin);
    this.mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      launchDirection.clone().normalize()
    );

    this.isFlying = true;
    this.hasHit = false;
    this.flightTime = 0;
    this.inUse = true;
    this.mesh.visible = true;
  }

  attachToTarget(targetMesh, hitWorldPoint, hitNormal) {
    this.isFlying = false;
    this.hasHit = true;
    this.velocity.set(0, 0, 0);

    const embedDepth = 0.12;
    const arrowDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
    const embeddedPoint = hitWorldPoint.clone().addScaledVector(arrowDir, embedDepth);

    if (targetMesh) {
      targetMesh.worldToLocal(embeddedPoint);
      this.mesh.position.copy(embeddedPoint);

      const worldQuat = this.mesh.quaternion.clone();
      targetMesh.add(this.mesh);
      const targetWorldQuat = new THREE.Quaternion();
      targetMesh.getWorldQuaternion(targetWorldQuat);
      this.mesh.quaternion.copy(targetWorldQuat.invert().multiply(worldQuat));
    }
  }

  attachToGround(hitPoint) {
    this.isFlying = false;
    this.hasHit = true;
    this.velocity.set(0, 0, 0);

    const embedDepth = 0.08;
    const arrowDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
    this.position.copy(hitPoint).addScaledVector(arrowDir, embedDepth);
    if (this.isDropped) {
      // Keep dropped arrow slightly above terrain level
      this.position.y = Math.max(0.04, this.position.y);
    }
    this.mesh.position.copy(this.position);
  }

  reset() {
    this.isFlying = false;
    this.hasHit = false;
    this.isDropped = false;
    this.flightTime = 0;
    this.inUse = false;
    this.velocity.set(0, 0, 0);
    this.mesh.visible = false;

    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}

/**
 * Object Pool for Reusable Arrows
 */
export class ArrowPool {
  constructor(scene, poolSize = 12) {
    this.scene = scene;
    this.pool = [];
    this.currentBowType = 'training';

    for (let i = 0; i < poolSize; i++) {
      const arrow = new Arrow(this.currentBowType);
      this.pool.push(arrow);
    }
  }

  setBowType(bowType) {
    if (this.currentBowType === bowType) return;
    this.currentBowType = bowType;
    this.pool.forEach(arrow => {
      arrow.bowType = bowType;
      // Clear children & rebuild meshes with correct materials
      while (arrow.mesh.children.length > 0) {
        arrow.mesh.remove(arrow.mesh.children[0]);
      }
      arrow.buildArrowMesh();
    });
  }

  getArrow() {
    // Find available arrow from pool
    let arrow = this.pool.find(a => !a.inUse);
    if (!arrow) {
      // Expand pool if all currently in flight
      arrow = new Arrow(this.currentBowType);
      this.pool.push(arrow);
    }
    this.scene.add(arrow.mesh);
    return arrow;
  }

  resetAll() {
    this.pool.forEach(arrow => {
      arrow.reset();
    });
  }
}
