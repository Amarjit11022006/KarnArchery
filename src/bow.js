/**
 * KarnArchery - 3D Bow System
 * Recurve bows inspired by ancient Indian Dhanush with dynamic bowstring tension,
 * limb flex animation, and 5 mythological bow variants.
 */

import * as THREE from 'three';

export const BOW_DATABASE = {
  training: {
    id: 'training',
    name: 'Gurukul Training Bow',
    description: 'A balanced bamboo and teak recurve bow crafted by ashram masters for student archers.',
    speed: 58,            // 58 m/s (increased from 45)
    drawTime: 0.90,       // seconds to 100% power
    windResistance: 0.75, // 75% wind resistance
    limbColor: 0x8B5A2B,  // Teak brown
    gripColor: 0x3E2723,  // Dark leather
    accentColor: 0xC69A5D,// Sand accent
    glowColor: null
  },
  royal: {
    id: 'royal',
    name: 'Royal Palace Bow',
    description: 'Forged from seasoned rosewood and inlaid with fine brass filigree, carried by royal guards.',
    speed: 65,            // 65 m/s (increased from 55)
    drawTime: 0.80,
    windResistance: 0.84,
    limbColor: 0x5D4037,
    gripColor: 0x101C2B,
    accentColor: 0xF5B942,
    glowColor: null
  },
  warrior: {
    id: 'warrior',
    name: 'Kshatriya Warrior Bow',
    description: 'Reinforced with horn laminations and hardened bronze tips for devastating battlefield penetration.',
    speed: 72,            // 72 m/s (increased from 68)
    drawTime: 0.70,
    windResistance: 0.90,
    limbColor: 0x2E2E2E,
    gripColor: 0xA51F2B,
    accentColor: 0xCD7F32,
    glowColor: 0xA51F2B
  },
  golden: {
    id: 'golden',
    name: 'Surya Dhanush (Sun Bow)',
    description: 'An ancient solar alloy bow radiating the warmth of Surya Deva. Arrows blaze with solar speed.',
    speed: 78,            // 78 m/s
    drawTime: 0.60,
    windResistance: 0.95,
    limbColor: 0xF5B942,
    gripColor: 0x101C2B,
    accentColor: 0xFFD868,
    glowColor: 0xFFD700
  },
  legendary: {
    id: 'legendary',
    name: 'Vijaya Dhanush (Invincible)',
    description: 'The legendary divine bow bestowed upon Karna. Unrivalled trajectory velocity and unyielding wind defiance.',
    speed: 85,            // 85 m/s
    drawTime: 0.50,
    windResistance: 0.99,
    limbColor: 0xFFD700,
    gripColor: 0x800020,
    accentColor: 0xFFFFFF,
    glowColor: 0xFFE082
  }
};

export class Bow {
  constructor(bowId = 'training') {
    this.config = BOW_DATABASE[bowId] || BOW_DATABASE.training;
    this.mesh = new THREE.Group();
    this.mesh.name = 'BowGroup';

    this.drawRatio = 0; // 0 to 1
    this.maxDrawDistance = 0.62; // 62 cm authentic deep draw length

    this.stringPositions = new Float32Array(3 * 3); // 3 points: top, nock, bottom
    this.stringGeometry = null;
    this.stringLine = null;

    this.topLimb = null;
    this.bottomLimb = null;
    this.topTipPos = new THREE.Vector3(0, 0.75, 0.08);
    this.bottomTipPos = new THREE.Vector3(0, -0.75, 0.08);
    this.restNockPos = new THREE.Vector3(0, 0, 0.08);
    this.currentNockPos = new THREE.Vector3(0, 0, 0.08);

    this.buildBowMesh();
  }

  buildBowMesh() {
    // Clear previous children if re-building
    while (this.mesh.children.length > 0) {
      this.mesh.remove(this.mesh.children[0]);
    }

    const { limbColor, gripColor, accentColor, glowColor } = this.config;

    // Materials
    const limbMat = new THREE.MeshStandardMaterial({
      color: limbColor,
      roughness: 0.35,
      metalness: this.config.id === 'golden' || this.config.id === 'legendary' ? 0.75 : 0.2
    });

    const gripMat = new THREE.MeshStandardMaterial({
      color: gripColor,
      roughness: 0.6,
      metalness: 0.1
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.2,
      metalness: 0.8
    });

    // Central Grip / Riser
    const gripGeo = new THREE.CylinderGeometry(0.022, 0.024, 0.18, 12);
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.set(0, 0, 0);
    this.mesh.add(grip);

    // Grip wrapping rings / bands
    [-0.07, 0, 0.07].forEach(y => {
      const ringGeo = new THREE.TorusGeometry(0.024, 0.003, 8, 16);
      const ring = new THREE.Mesh(ringGeo, accentMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, y, 0);
      this.mesh.add(ring);
    });

    // Top Limb (Recurve curve using CatmullRomCurve3)
    const topCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.09, 0),
      new THREE.Vector3(0, 0.32, -0.05),
      new THREE.Vector3(0, 0.55, 0.02),
      this.topTipPos.clone()
    ]);
    const topLimbGeo = new THREE.TubeGeometry(topCurve, 20, 0.016, 8, false);
    this.topLimb = new THREE.Mesh(topLimbGeo, limbMat);
    this.mesh.add(this.topLimb);

    // Bottom Limb (Mirror curve)
    const bottomCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.09, 0),
      new THREE.Vector3(0, -0.32, -0.05),
      new THREE.Vector3(0, -0.55, 0.02),
      this.bottomTipPos.clone()
    ]);
    const bottomLimbGeo = new THREE.TubeGeometry(bottomCurve, 20, 0.016, 8, false);
    this.bottomLimb = new THREE.Mesh(bottomLimbGeo, limbMat);
    this.mesh.add(this.bottomLimb);

    // Limb Tip Ornaments (Horn nocks)
    [this.topTipPos, this.bottomTipPos].forEach((pos, idx) => {
      const tipGeo = new THREE.ConeGeometry(0.016, 0.06, 8);
      const tip = new THREE.Mesh(tipGeo, accentMat);
      tip.position.copy(pos);
      tip.rotation.x = idx === 0 ? Math.PI / 4 : -Math.PI / 4;
      this.mesh.add(tip);
    });

    // Divine Bow Glow (for Surya Dhanush and Vijaya)
    if (glowColor) {
      const glowGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.4
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.set(0, 0, 0);
      this.mesh.add(glowMesh);
    }

    // Dynamic Bowstring
    this.stringGeometry = new THREE.BufferGeometry();
    this.stringGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.stringPositions, 3)
    );
    this.updateStringPoints(0);

    const stringMat = new THREE.LineBasicMaterial({
      color: this.config.id === 'legendary' ? 0xFFFFFF : 0xF5B942,
      linewidth: 2
    });
    this.stringLine = new THREE.Line(this.stringGeometry, stringMat);
    this.mesh.add(this.stringLine);
  }

  /**
   * Update string vertex buffer based on current draw power ratio (0 to 1)
   */
  updateStringPoints(ratio) {
    this.drawRatio = Math.max(0, Math.min(1, ratio));

    // Nock pulls backwards along -Z (relative to bow front)
    const drawOffset = this.drawRatio * this.maxDrawDistance;
    this.currentNockPos.set(0, 0, this.restNockPos.z - drawOffset);

    // Dynamic tip bending under heavy tension
    const tipPullZ = this.drawRatio * 0.08;
    const tipInwardY = this.drawRatio * 0.035;

    // Top tip
    this.stringPositions[0] = this.topTipPos.x;
    this.stringPositions[1] = this.topTipPos.y - tipInwardY;
    this.stringPositions[2] = this.topTipPos.z - tipPullZ;

    // Center nock point
    this.stringPositions[3] = this.currentNockPos.x;
    this.stringPositions[4] = this.currentNockPos.y;
    this.stringPositions[5] = this.currentNockPos.z;

    // Bottom tip
    this.stringPositions[6] = this.bottomTipPos.x;
    this.stringPositions[7] = this.bottomTipPos.y + tipInwardY;
    this.stringPositions[8] = this.bottomTipPos.z - tipPullZ;

    if (this.stringGeometry && this.stringGeometry.attributes && this.stringGeometry.attributes.position) {
      this.stringGeometry.attributes.position.needsUpdate = true;
    }

    // Dynamic limb curvature under tension
    if (this.topLimb && this.bottomLimb) {
      const flexScale = 1 - (this.drawRatio * 0.07);
      const flexCurve = this.drawRatio * 0.10;
      this.topLimb.scale.set(1, flexScale, 1);
      this.topLimb.rotation.x = -flexCurve;
      this.bottomLimb.scale.set(1, flexScale, 1);
      this.bottomLimb.rotation.x = flexCurve;
    }
  }

  getNockWorldPosition() {
    const worldPos = new THREE.Vector3();
    this.mesh.localToWorld(worldPos.copy(this.currentNockPos));
    return worldPos;
  }

  changeBowType(bowId) {
    if (BOW_DATABASE[bowId]) {
      this.config = BOW_DATABASE[bowId];
      this.buildBowMesh();
    }
  }
}

