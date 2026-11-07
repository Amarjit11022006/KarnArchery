/**
 * KarnArchery - Ancient Indian Royal Archery Target System
 * 
 * Replaces all targets with ornate, highly visible ancient Indian royal archery targets
 * inspired by the Mahabharata era.
 * 
 * Features:
 * - 6 Distinct Target Variants:
 *   1. Stationary Royal Target: Ornate wooden tripod, golden torus frame, Surya crest, twin silk banners.
 *   2. Moving Target on Wooden Rail: Carved wooden carriage with rolling bronze chariot wheels on timber rails.
 *   3. Rotating Target: Sacred golden Sudarshana/Surya Chakra with spinning flame blades.
 *   4. Small Precision Target: Compact radius, double-layer filigree bezel, pulsing Surya gem beacon.
 *   5. Ancient Shield Target: Convex warrior shield (Kheta/Dhal) with bronze boss, crossed spears, war pennants.
 *   6. Hanging Royal Target: Suspended from carved torana archway with realistic dual-axis pendulum sway.
 * - High-Contrast Concentric Scoring Rings:
 *   - Outer (Ivory / Cream): 10 pts
 *   - Middle (Deep Blue): 30 pts
 *   - Inner (Crimson Red): 50 pts
 *   - Bullseye (Bright Golden Yellow Sun): 100 pts
 * - Bold, readable numerals (10, 30, 50, 100) facing the archer.
 * - Dynamic hit impact recoil/shudder, wood splinter and spark particles, and bullseye shockwave.
 * - Fully compatible with continuous swept-ray collision detection and stuck arrow hierarchy.
 */

import * as THREE from 'three';

// Texture cache to avoid re-rendering procedural canvas textures
const textureCache = new Map();

/**
 * Generate high-resolution procedural canvas texture for royal archery targets
 * @param {string} variant - 'standard' or 'shield'
 * @returns {THREE.CanvasTexture}
 */
export function createRoyalTargetTexture(variant = 'standard') {
  if (textureCache.has(variant)) {
    return textureCache.get(variant);
  }

  // Fallback for headless Node test environments
  if (typeof document === 'undefined' || !document.createElement) {
    const dummyCanvas = { width: 64, height: 64 };
    const dummyTex = new THREE.Texture();
    textureCache.set(variant, dummyTex);
    return dummyTex;
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const tex = new THREE.Texture();
    textureCache.set(variant, tex);
    return tex;
  }

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.485; // 496px radius

  if (variant === 'shield') {
    renderShieldFace(ctx, cx, cy, maxR);
  } else {
    renderStandardRoyalFace(ctx, cx, cy, maxR);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  textureCache.set(variant, texture);
  return texture;
}

/**
 * Render the Standard Royal Archery Target Face
 * User-Specified High-Contrast Palette:
 * - Outer Ring (0.72R - 1.0R): Bright Ivory (#FFF1D0) with "10"
 * - Second Ring (0.44R - 0.72R): Electric Blue (#087BFF) with "30"
 * - Third Ring (0.18R - 0.44R): Bright Crimson (#FF2525) with "50"
 * - Bullseye (0 - 0.18R): Bright Golden Yellow (#FFD700) with "100"
 * - Outer Frame: Metallic Gold (#E5A832)
 */
function renderStandardRoyalFace(ctx, cx, cy, maxR) {
  ctx.clearRect(0, 0, cx * 2, cy * 2);

  // 1. Outer Ring (Bright Ivory #FFF1D0) - 10 Points
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  const ivoryGrad = ctx.createRadialGradient(cx, cy, maxR * 0.72, cx, cy, maxR);
  ivoryGrad.addColorStop(0, '#FFFFFF');
  ivoryGrad.addColorStop(0.4, '#FFF8E1');
  ivoryGrad.addColorStop(0.85, '#FFF1D0');
  ivoryGrad.addColorStop(1, '#FEE4B3');
  ctx.fillStyle = ivoryGrad;
  ctx.fill();

  // Subtle concentric guidelines for depth
  ctx.strokeStyle = 'rgba(212, 166, 74, 0.25)';
  ctx.lineWidth = 1.5;
  for (let r = maxR * 0.74; r < maxR - 4; r += 12) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Outer decorative perimeter border (Metallic Gold #E5A832)
  ctx.strokeStyle = '#E5A832';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR - 3, 0, Math.PI * 2);
  ctx.stroke();

  // Carved ancient Indian perimeter points
  const numTeeth = 48;
  ctx.fillStyle = '#C68E2B';
  for (let i = 0; i < numTeeth; i++) {
    const angle = (i * Math.PI * 2) / numTeeth;
    const x1 = cx + Math.cos(angle) * (maxR - 2);
    const y1 = cy + Math.sin(angle) * (maxR - 2);
    const x2 = cx + Math.cos(angle + 0.05) * (maxR - 12);
    const y2 = cy + Math.sin(angle + 0.05) * (maxR - 12);
    const x3 = cx + Math.cos(angle - 0.05) * (maxR - 12);
    const y3 = cy + Math.sin(angle - 0.05) * (maxR - 12);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 2. Second Ring (Electric Blue #087BFF) - 30 Points
  const rSecond = maxR * 0.72;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rSecond, 0, Math.PI * 2);
  const blueGrad = ctx.createRadialGradient(cx, cy, maxR * 0.44, cx, cy, rSecond);
  blueGrad.addColorStop(0, '#0660CC');
  blueGrad.addColorStop(0.55, '#087BFF');
  blueGrad.addColorStop(1, '#2E93FF');
  ctx.fillStyle = blueGrad;
  ctx.fill();

  // Metallic Gold divider border
  ctx.strokeStyle = '#E5A832';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Subtle Vedic decorative beads
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 32; i++) {
    const a = (i * Math.PI * 2) / 32;
    const px = cx + Math.cos(a) * (rSecond - 12);
    const py = cy + Math.sin(a) * (rSecond - 12);
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 3. Third Ring (Bright Crimson #FF2525) - 50 Points
  const rThird = maxR * 0.44;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rThird, 0, Math.PI * 2);
  const redGrad = ctx.createRadialGradient(cx, cy, maxR * 0.18, cx, cy, rThird);
  redGrad.addColorStop(0, '#C20A0A');
  redGrad.addColorStop(0.5, '#FF2525');
  redGrad.addColorStop(1, '#FF4545');
  ctx.fillStyle = redGrad;
  ctx.fill();

  // Bright Golden divider border
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Lotus petal accents
  ctx.fillStyle = 'rgba(255, 240, 160, 0.35)';
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    const px = cx + Math.cos(a) * (rThird - 10);
    const py = cy + Math.sin(a) * (rThird - 10);
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. Bullseye (Bright Golden Yellow #FFD700) - 100 Points
  const rBullseye = maxR * 0.18;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rBullseye, 0, Math.PI * 2);
  const goldGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rBullseye);
  goldGrad.addColorStop(0, '#FFFF88');
  goldGrad.addColorStop(0.4, '#FFD700');
  goldGrad.addColorStop(0.85, '#FFB300');
  goldGrad.addColorStop(1, '#FF9100');
  ctx.fillStyle = goldGrad;
  ctx.fill();

  // Bullseye divider border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = '#E5A832';
  ctx.lineWidth = 6;
  ctx.stroke();

  // 12 Radiating Surya Sunburst Rays
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(angle - 0.12) * (rBullseye * 0.88),
      cy + Math.sin(angle - 0.12) * (rBullseye * 0.88)
    );
    ctx.lineTo(
      cx + Math.cos(angle) * (rBullseye * 0.98),
      cy + Math.sin(angle) * (rBullseye * 0.98)
    );
    ctx.lineTo(
      cx + Math.cos(angle + 0.12) * (rBullseye * 0.88),
      cy + Math.sin(angle + 0.12) * (rBullseye * 0.88)
    );
    ctx.closePath();
    ctx.fill();
  }

  // Central Sun Core / Ruby Bindu
  ctx.beginPath();
  ctx.arc(cx, cy, rBullseye * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = '#D50000';
  ctx.fill();
  ctx.strokeStyle = '#FFF1D0';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // 5. Draw Highly Readable Scoring Numbers at Cardinal Positions
  // Outer Ring: "10" (Bright Ivory Ring)
  drawCardinalNumbers(ctx, cx, cy, maxR * 0.85, '10', {
    fontSize: 54,
    fill: '#1A0F05',
    stroke: '#E5A832',
    strokeWidth: 4.5,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 8
  });

  // Second Ring: "30" (Electric Blue Ring)
  drawCardinalNumbers(ctx, cx, cy, maxR * 0.58, '30', {
    fontSize: 50,
    fill: '#FFFFFF',
    stroke: '#FFD700',
    strokeWidth: 4.5,
    shadowColor: 'rgba(0,0,0,0.85)',
    shadowBlur: 9
  });

  // Third Ring: "50" (Bright Crimson Ring)
  drawCardinalNumbers(ctx, cx, cy, maxR * 0.31, '50', {
    fontSize: 46,
    fill: '#FFD700',
    stroke: '#3A0000',
    strokeWidth: 5,
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowBlur: 9
  });

  // Center Bullseye: "100" (Golden Sun Core)
  ctx.save();
  ctx.font = 'bold 32px "Cinzel", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = '#FFFDF5';
  ctx.strokeText('100', cx, cy);
  ctx.fillStyle = '#D50000';
  ctx.fillText('100', cx, cy);
  ctx.restore();
}

/**
 * Render Ancient Warrior Shield Target Face (Kheta / Dhal)
 */
function renderShieldFace(ctx, cx, cy, maxR) {
  ctx.clearRect(0, 0, cx * 2, cy * 2);

  // 1. Dark hammered bronze/steel circular base
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  const metalGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  metalGrad.addColorStop(0, '#4A3B32');
  metalGrad.addColorStop(0.7, '#2E241E');
  metalGrad.addColorStop(1, '#1A1411');
  ctx.fillStyle = metalGrad;
  ctx.fill();

  // Hammered metal texture marks
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.08)';
  ctx.lineWidth = 2;
  for (let r = 40; r < maxR - 10; r += 20) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 2. Concentric Scored Color Bands with Inlaid Enamel
  // Outer Ivory Band (#FFF1D0, 10 pts)
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * 0.86, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFF1D0';
  ctx.lineWidth = maxR * 0.24;
  ctx.stroke();

  // Electric Blue Enamel Band (#087BFF, 30 pts)
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * 0.58, 0, Math.PI * 2);
  ctx.strokeStyle = '#087BFF';
  ctx.lineWidth = maxR * 0.26;
  ctx.stroke();

  // Bright Crimson Enamel Band (#FF2525, 50 pts)
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * 0.31, 0, Math.PI * 2);
  ctx.strokeStyle = '#FF2525';
  ctx.lineWidth = maxR * 0.24;
  ctx.stroke();

  // Dividing Metallic Gold ribs (#E5A832)
  [maxR * 0.72, maxR * 0.44, maxR * 0.18].forEach(r => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#E5A832';
    ctx.lineWidth = 5;
    ctx.stroke();
  });

  // Bullseye Golden Sun Boss (#FFD700, 100 pts)
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * 0.18, 0, Math.PI * 2);
  const bossGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.18);
  bossGrad.addColorStop(0, '#FFFF88');
  bossGrad.addColorStop(0.5, '#FFD700');
  bossGrad.addColorStop(1, '#FFB300');
  ctx.fillStyle = bossGrad;
  ctx.fill();
  ctx.strokeStyle = '#E5A832';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 4 Ornate Bronze Rosette Studs at Diagonals
  const studRadius = maxR * 0.52;
  [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].forEach(angle => {
    const sx = cx + Math.cos(angle) * studRadius;
    const sy = cy + Math.sin(angle) * studRadius;
    ctx.beginPath();
    ctx.arc(sx, sy, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#C69A5D';
    ctx.fill();
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Stud center highlight
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE082';
    ctx.fill();
  });

  ctx.restore();

  // Shield Scoring Numerals
  drawCardinalNumbers(ctx, cx, cy, maxR * 0.85, '10', {
    fontSize: 50,
    fill: '#2B1408',
    stroke: '#D4AF37',
    strokeWidth: 4,
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowBlur: 6
  });

  drawCardinalNumbers(ctx, cx, cy, maxR * 0.58, '30', {
    fontSize: 48,
    fill: '#FFFFFF',
    stroke: '#FFD700',
    strokeWidth: 4,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 8
  });

  drawCardinalNumbers(ctx, cx, cy, maxR * 0.31, '50', {
    fontSize: 44,
    fill: '#FFEC8B',
    stroke: '#4A080E',
    strokeWidth: 4.5,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 8
  });

  // Center "100"
  ctx.save();
  ctx.font = 'bold 30px "Cinzel", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 6;
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#5E0B12';
  ctx.strokeText('100', cx, cy);
  ctx.fillStyle = '#FFF8DC';
  ctx.fillText('100', cx, cy);
  ctx.restore();
}

/**
 * Draw scoring numerals at the 4 cardinal positions (Top, Bottom, Left, Right)
 */
function drawCardinalNumbers(ctx, cx, cy, radius, text, style) {
  ctx.save();
  ctx.font = `bold ${style.fontSize}px "Cinzel", "Times New Roman", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = style.shadowColor || 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = style.shadowBlur || 6;
  ctx.lineWidth = style.strokeWidth || 3;
  ctx.strokeStyle = style.stroke || '#D4AF37';
  ctx.fillStyle = style.fill || '#FFFFFF';

  const positions = [
    { x: cx, y: cy - radius }, // Top (12 o'clock)
    { x: cx, y: cy + radius }, // Bottom (6 o'clock)
    { x: cx - radius, y: cy }, // Left (9 o'clock)
    { x: cx + radius, y: cy }  // Right (3 o'clock)
  ];

  positions.forEach(pos => {
    ctx.strokeText(text, pos.x, pos.y);
    ctx.fillText(text, pos.x, pos.y);
  });

  ctx.restore();
}

/**
 * Main Target Class
 */
export class Target {
  constructor(config = {}) {
    this.id = config.id || 'target_1';
    // Normalize target type: 'stationary', 'moving', 'rotating', 'precision', 'shield', 'hanging'
    let rawType = (config.type || 'stationary').toLowerCase();
    if (rawType === 'chakra' || rawType === 'fish-eye') rawType = 'rotating';
    if (rawType === 'chariot') rawType = 'moving';
    this.type = rawType;

    this.position = config.position ? config.position.clone() : new THREE.Vector3(0, 1.8, 25);
    // Larger target dimensions for crystal-clear visibility downrange
    this.outerRadius = config.radius || (this.type === 'precision' ? 0.90 : 1.25);
    this.moveRange = config.moveRange || (this.type === 'moving' ? 6.5 : 0);
    this.moveSpeed = config.moveSpeed !== undefined ? config.moveSpeed : (this.type === 'stationary' ? 0 : 2.0);
    this.isActive = true;
    this.isHit = false;
    this.isHighlighted = false;

    // Outer root container added to the 3D scene
    this.mesh = new THREE.Group();
    this.mesh.name = `Target_${this.id}`;

    // Sub-hierarchy:
    // this.mesh -> this.recoilGroup (handles hit shudder) -> this.targetFace (active scoring disc)
    this.recoilGroup = new THREE.Group();
    this.recoilGroup.name = 'RecoilGroup';
    this.mesh.add(this.recoilGroup);

    this.targetFace = null;
    this.glowMesh = null;
    this.targetFaceLight = null;
    this.carriageGroup = null; // for moving rail variant
    this.chains = [];          // for hanging variant
    this.particles = [];
    this.shockwaves = [];
    this.geometriesToDispose = [];
    this.materialsToDispose = [];

    this.initialPosition = this.position.clone();
    this.time = 0;

    // Recoil spring state
    this.recoilZ = 0;
    this.recoilRotX = 0;
    this.recoilRotY = 0;

    this.buildTarget();
  }

  buildTarget() {
    switch (this.type) {
      case 'moving':
        this.buildMovingRailTarget();
        break;
      case 'rotating':
        this.buildRotatingTarget();
        break;
      case 'precision':
        this.buildPrecisionTarget();
        break;
      case 'shield':
        this.buildShieldTarget();
        break;
      case 'hanging':
        this.buildHangingTarget();
        break;
      case 'stationary':
      default:
        this.buildStationaryTarget();
        break;
    }

    // Set position and face towards the player (-Z direction)
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = Math.PI;

    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  /**
   * Helper to build the common circular target board with ornate frame and Surya crest
   */
  createCommonTargetBoard(isShield = false) {
    const boardGroup = new THREE.Group();
    boardGroup.name = 'TargetFace';
    this.targetFace = boardGroup;
    this.recoilGroup.add(boardGroup);

    // 1. Thick dark polished Indian teak backing cylinder
    const backingDepth = 0.12;
    const backingGeo = new THREE.CylinderGeometry(this.outerRadius * 1.02, this.outerRadius * 1.02, backingDepth, 48);
    backingGeo.rotateX(Math.PI / 2);
    this.geometriesToDispose.push(backingGeo);

    const teakMat = new THREE.MeshStandardMaterial({
      color: 0x3E2723,
      roughness: 0.75,
      metalness: 0.08
    });
    this.materialsToDispose.push(teakMat);

    const backingMesh = new THREE.Mesh(backingGeo, teakMat);
    backingMesh.position.set(0, 0, -backingDepth * 0.5);
    boardGroup.add(backingMesh);

    // 2. High-Resolution Royal Target Face Disc (Vibrant, high luminescence)
    const faceGeo = new THREE.CircleGeometry(this.outerRadius, 48);
    this.geometriesToDispose.push(faceGeo);

    const targetTex = createRoyalTargetTexture(isShield ? 'shield' : 'standard');
    const faceMat = new THREE.MeshStandardMaterial({
      map: targetTex,
      roughness: 0.35,
      metalness: 0.08,
      emissive: 0x2A2210,
      emissiveIntensity: 0.32
    });
    this.materialsToDispose.push(faceMat);

    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.set(0, 0, 0.002);
    boardGroup.add(faceMesh);

    // 3. Ornate Golden Metallic Outer Frame (Metallic Gold #E5A832)
    const torusRadius = this.outerRadius * 1.01;
    const tubeRadius = 0.06;
    const torusGeo = new THREE.TorusGeometry(torusRadius, tubeRadius, 16, 48);
    this.geometriesToDispose.push(torusGeo);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xE5A832, // Metallic Gold as requested
      metalness: 0.88,
      roughness: 0.20
    });
    this.materialsToDispose.push(goldMat);

    const torusMesh = new THREE.Mesh(torusGeo, goldMat);
    torusMesh.position.set(0, 0, 0.01);
    boardGroup.add(torusMesh);

    // Perimeter Golden Studs / Rosettes (16 studs)
    const studGeo = new THREE.SphereGeometry(tubeRadius * 0.65, 12, 12);
    this.geometriesToDispose.push(studGeo);
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      const stud = new THREE.Mesh(studGeo, goldMat);
      stud.position.set(
        Math.cos(angle) * torusRadius,
        Math.sin(angle) * torusRadius,
        tubeRadius * 0.8
      );
      boardGroup.add(stud);
    }

    // 4. Subtle Glowing Golden Outline Halo
    const glowGeo = new THREE.RingGeometry(this.outerRadius * 1.01, this.outerRadius * 1.15, 48);
    this.geometriesToDispose.push(glowGeo);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xE5A832,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending
    });
    this.materialsToDispose.push(glowMat);
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(0, 0, 0.015);
    boardGroup.add(glowMesh);
    this.glowMesh = glowMesh;

    // 5. Dedicated Target Illumination Spotlight
    const targetFaceLight = new THREE.PointLight(0xFFF1D0, 1.8, 14);
    targetFaceLight.position.set(0, 0, 1.2);
    boardGroup.add(targetFaceLight);
    this.targetFaceLight = targetFaceLight;

    // 6. Royal Surya Sun-Emblem Crest mounted at the top apex
    this.attachSuryaCrest(boardGroup, goldMat);

    // 7. Visibility Beacon for long distances (>= 35m) or Precision variant
    if (this.position.z >= 35 || this.type === 'precision') {
      this.attachVisibilityBeacon(boardGroup);
    }

    return boardGroup;
  }

  /**
   * Royal Surya Sun-Emblem Crest mounted atop the target
   */
  attachSuryaCrest(parentGroup, goldMat) {
    const crestGroup = new THREE.Group();
    crestGroup.position.set(0, this.outerRadius + 0.16, 0);

    // Central Golden Solar Disc
    const solarDiscGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 24);
    solarDiscGeo.rotateX(Math.PI / 2);
    this.geometriesToDispose.push(solarDiscGeo);
    const solarDisc = new THREE.Mesh(solarDiscGeo, goldMat);
    crestGroup.add(solarDisc);

    // Radiating Golden Flame Rays (8 flame points)
    const rayGeo = new THREE.ConeGeometry(0.035, 0.18, 8);
    rayGeo.rotateX(Math.PI / 2);
    this.geometriesToDispose.push(rayGeo);

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 7 - Math.PI / 2; // Spread across top half arc
      const ray = new THREE.Mesh(rayGeo, goldMat);
      ray.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0);
      ray.rotation.z = angle - Math.PI / 2;
      crestGroup.add(ray);
    }

    // Faceted Crimson Ruby Core
    const rubyGeo = new THREE.SphereGeometry(0.055, 12, 12);
    this.geometriesToDispose.push(rubyGeo);
    const rubyMat = new THREE.MeshStandardMaterial({
      color: 0xC41224,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x4A040A,
      emissiveIntensity: 0.4
    });
    this.materialsToDispose.push(rubyMat);
    const ruby = new THREE.Mesh(rubyGeo, rubyMat);
    ruby.position.set(0, 0, 0.025);
    crestGroup.add(ruby);

    parentGroup.add(crestGroup);
  }

  /**
   * Visibility Beacon Light for long-distance recognition
   */
  attachVisibilityBeacon(parentGroup) {
    const beaconGeo = new THREE.SphereGeometry(0.09, 12, 12);
    this.geometriesToDispose.push(beaconGeo);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xFFE066 });
    this.materialsToDispose.push(beaconMat);
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, this.outerRadius + 0.38, 0.02);
    parentGroup.add(beaconMesh);

    const beaconLight = new THREE.PointLight(0xFFD700, 1.4, 18);
    beaconLight.position.set(0, this.outerRadius + 0.38, 0.35);
    parentGroup.add(beaconLight);
    this.beaconLight = beaconLight;
  }

  /**
   * Attach Twin Ceremonial Crimson & Gold Silk Banners
   */
  attachCeremonialBanners(parentGroup) {
    const bannerGroup = new THREE.Group();
    bannerGroup.name = 'CeremonialBanners';

    const bannerMat = new THREE.MeshStandardMaterial({
      color: 0x9E1B26,
      roughness: 0.65,
      side: THREE.DoubleSide
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xF5B942,
      metalness: 0.8,
      roughness: 0.3
    });
    this.materialsToDispose.push(bannerMat, goldTrimMat);

    [-1, 1].forEach(side => {
      const bannerSide = new THREE.Group();
      bannerSide.position.set(side * (this.outerRadius + 0.22), 0.1, -0.05);

      // Golden bracket arm
      const armGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8);
      armGeo.rotateZ(Math.PI / 2);
      this.geometriesToDispose.push(armGeo);
      const arm = new THREE.Mesh(armGeo, goldTrimMat);
      arm.position.set(side * 0.1, 0.2, 0);
      bannerSide.add(arm);

      // Silk Banner Fabric (Swallowtail tapered ribbon)
      const fabricGeo = new THREE.PlaneGeometry(0.32, 1.4, 4, 8);
      this.geometriesToDispose.push(fabricGeo);
      const fabric = new THREE.Mesh(fabricGeo, bannerMat);
      fabric.position.set(0, -0.6, 0);
      fabric.rotation.y = side * 0.15; // Angled slightly outward
      bannerSide.add(fabric);

      // Gold bottom tassel
      const tasselGeo = new THREE.ConeGeometry(0.04, 0.16, 8);
      this.geometriesToDispose.push(tasselGeo);
      const tassel = new THREE.Mesh(tasselGeo, goldTrimMat);
      tassel.position.set(0, -1.35, 0);
      bannerSide.add(tassel);

      bannerGroup.add(bannerSide);
    });

    parentGroup.add(bannerGroup);
  }

  // =========================================================================
  // VARIANT 1: Stationary Royal Target
  // =========================================================================
  buildStationaryTarget() {
    this.createCommonTargetBoard(false);
    this.attachCeremonialBanners(this.mesh);

    // Sturdy Wooden Tripod Stand with Bronze Ferrules
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4A3728, roughness: 0.8 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x8C6239, metalness: 0.75, roughness: 0.35 });
    this.materialsToDispose.push(woodMat, bronzeMat);

    const legLength = 2.45;
    const legGeo = new THREE.CylinderGeometry(0.045, 0.055, legLength, 12);
    this.geometriesToDispose.push(legGeo);

    // Front Left Leg
    const legFL = new THREE.Mesh(legGeo, woodMat);
    legFL.position.set(-0.62, -0.75, 0.32);
    legFL.rotation.set(-0.25, 0, -0.22);
    this.mesh.add(legFL);

    // Front Right Leg
    const legFR = new THREE.Mesh(legGeo, woodMat);
    legFR.position.set(0.62, -0.75, 0.32);
    legFR.rotation.set(-0.25, 0, 0.22);
    this.mesh.add(legFR);

    // Rear Support Leg
    const legRear = new THREE.Mesh(legGeo, woodMat);
    legRear.position.set(0, -0.75, -0.72);
    legRear.rotation.set(0.38, 0, 0);
    this.mesh.add(legRear);

    // Bronze protective ferrules at the foot of each leg
    const ferruleGeo = new THREE.CylinderGeometry(0.058, 0.062, 0.22, 12);
    this.geometriesToDispose.push(ferruleGeo);
    [legFL, legFR, legRear].forEach(leg => {
      const ferrule = new THREE.Mesh(ferruleGeo, bronzeMat);
      ferrule.position.set(0, -legLength * 0.42, 0);
      leg.add(ferrule);
    });

    // Low Stabilizing Crossbar (positioned low at y = -0.92 so it NEVER obstructs target face)
    const crossGeo = new THREE.CylinderGeometry(0.038, 0.038, 1.25, 8);
    crossGeo.rotateZ(Math.PI / 2);
    this.geometriesToDispose.push(crossGeo);
    const crossbar = new THREE.Mesh(crossGeo, woodMat);
    crossbar.position.set(0, -0.95, 0.3);
    this.mesh.add(crossbar);
  }

  // =========================================================================
  // VARIANT 2: Moving Target on Wooden Rail
  // =========================================================================
  buildMovingRailTarget() {
    this.carriageGroup = new THREE.Group();
    this.carriageGroup.name = 'RailCarriage';
    this.mesh.add(this.carriageGroup);

    // Build the target board inside the carriage group
    this.createCommonTargetBoard(false);
    this.carriageGroup.add(this.recoilGroup);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4A3728, roughness: 0.75 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x966F33, metalness: 0.8, roughness: 0.3 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6E665C, roughness: 0.9 });
    this.materialsToDispose.push(woodMat, bronzeMat, stoneMat);

    // 1. Static Wooden Rail Track System (12m long along X axis)
    const railLength = Math.max(12.0, this.moveRange * 2 + 3.0);
    const trackGroup = new THREE.Group();
    trackGroup.name = 'WoodenRailTrack';

    // Twin Timber Track Beams
    const timberGeo = new THREE.BoxGeometry(railLength, 0.15, 0.16);
    this.geometriesToDispose.push(timberGeo);
    [-0.35, 0.35].forEach(z => {
      const timber = new THREE.Mesh(timberGeo, woodMat);
      timber.position.set(0, -1.68, z);
      trackGroup.add(timber);

      // Bronze guide rail on top of timber
      const guideGeo = new THREE.BoxGeometry(railLength, 0.04, 0.06);
      this.geometriesToDispose.push(guideGeo);
      const guide = new THREE.Mesh(guideGeo, bronzeMat);
      guide.position.set(0, -1.58, z);
      trackGroup.add(guide);
    });

    // Sandstone Plinths / Ties supporting the rails
    const numPlinths = Math.ceil(railLength / 1.8);
    const plinthGeo = new THREE.BoxGeometry(0.3, 0.22, 1.1);
    this.geometriesToDispose.push(plinthGeo);
    for (let i = 0; i <= numPlinths; i++) {
      const x = -railLength * 0.5 + (i * railLength) / numPlinths;
      const plinth = new THREE.Mesh(plinthGeo, stoneMat);
      plinth.position.set(x, -1.82, 0);
      trackGroup.add(plinth);
    }

    // Carved Timber Buffer End Stops with Bronze Caps
    [-1, 1].forEach(side => {
      const stopGeo = new THREE.BoxGeometry(0.3, 0.45, 0.95);
      this.geometriesToDispose.push(stopGeo);
      const stop = new THREE.Mesh(stopGeo, woodMat);
      stop.position.set(side * (railLength * 0.5 - 0.15), -1.5, 0);
      trackGroup.add(stop);
    });
    this.mesh.add(trackGroup);

    // 2. Rolling Carriage with 4 Bronze Chariot Wheels
    const carriageBaseGeo = new THREE.BoxGeometry(1.2, 0.18, 0.9);
    this.geometriesToDispose.push(carriageBaseGeo);
    const carriageBase = new THREE.Mesh(carriageBaseGeo, woodMat);
    carriageBase.position.set(0, -1.5, 0);
    this.carriageGroup.add(carriageBase);

    // Vertical mounting post supporting target board
    const postGeo = new THREE.BoxGeometry(0.18, 1.5, 0.18);
    this.geometriesToDispose.push(postGeo);
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.set(0, -0.75, 0);
    this.carriageGroup.add(post);

    // 4 Chariot Wheels that rotate as the carriage translates
    this.chariotWheels = [];
    const wheelRadius = 0.26;
    const wheelRimGeo = new THREE.TorusGeometry(wheelRadius, 0.035, 8, 24);
    const spokeGeo = new THREE.CylinderGeometry(0.015, 0.015, wheelRadius * 2, 6);
    this.geometriesToDispose.push(wheelRimGeo, spokeGeo);

    [
      { x: -0.45, z: 0.45 },
      { x: 0.45, z: 0.45 },
      { x: -0.45, z: -0.45 },
      { x: 0.45, z: -0.45 }
    ].forEach(pos => {
      const wheelHub = new THREE.Group();
      wheelHub.position.set(pos.x, -1.52, pos.z);

      const rim = new THREE.Mesh(wheelRimGeo, bronzeMat);
      wheelHub.add(rim);

      // 8 Spokes per wheel
      for (let s = 0; s < 4; s++) {
        const spoke = new THREE.Mesh(spokeGeo, bronzeMat);
        spoke.rotation.z = (s * Math.PI) / 4;
        wheelHub.add(spoke);
      }

      this.carriageGroup.add(wheelHub);
      this.chariotWheels.push(wheelHub);
    });

    this.attachCeremonialBanners(this.carriageGroup);
  }

  // =========================================================================
  // VARIANT 3: Rotating Target / Sacred Chakra
  // =========================================================================
  buildRotatingTarget() {
    this.createCommonTargetBoard(false);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5C5248, roughness: 0.85 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xF5B942, metalness: 0.9, roughness: 0.2 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x8C6239, metalness: 0.8, roughness: 0.3 });
    this.materialsToDispose.push(stoneMat, goldMat, bronzeMat);

    // 1. Massive Carved Ancient Temple Stone Pillar Pedestal
    const baseGeo = new THREE.CylinderGeometry(0.45, 0.65, 1.8, 16);
    this.geometriesToDispose.push(baseGeo);
    const basePillar = new THREE.Mesh(baseGeo, stoneMat);
    basePillar.position.set(0, -1.0, -0.2);
    this.mesh.add(basePillar);

    // Heavy Bronze Axle Hub Housing
    const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 16);
    hubGeo.rotateX(Math.PI / 2);
    this.geometriesToDispose.push(hubGeo);
    const hub = new THREE.Mesh(hubGeo, bronzeMat);
    hub.position.set(0, 0, -0.18);
    this.mesh.add(hub);

    // 2. Ornate Golden Sudarshana Chakra Blades attached to targetFace
    // 12 Curved Golden Flame Blades radiating outward
    const bladeGeo = new THREE.ConeGeometry(0.08, 0.38, 8);
    bladeGeo.rotateX(Math.PI / 2);
    this.geometriesToDispose.push(bladeGeo);

    const chakraRadius = this.outerRadius * 1.08;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const blade = new THREE.Mesh(bladeGeo, goldMat);
      blade.position.set(Math.cos(angle) * chakraRadius, Math.sin(angle) * chakraRadius, 0.01);
      blade.rotation.z = angle - Math.PI / 2 + 0.35; // curved swirl angle
      this.targetFace.add(blade);
    }
  }

  // =========================================================================
  // VARIANT 4: Small Precision Target
  // =========================================================================
  buildPrecisionTarget() {
    this.outerRadius = 0.62; // High-precision compact radius
    this.createCommonTargetBoard(false);

    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x2E1F16, roughness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.92, roughness: 0.15 });
    this.materialsToDispose.push(darkWoodMat, goldMat);

    // Double-Layer Golden Filigree Frame
    const outerBezelGeo = new THREE.TorusGeometry(this.outerRadius * 1.08, 0.038, 16, 48);
    this.geometriesToDispose.push(outerBezelGeo);
    const outerBezel = new THREE.Mesh(outerBezelGeo, goldMat);
    outerBezel.position.set(0, 0, 0.015);
    this.targetFace.add(outerBezel);

    // Sleek Royal Tripod with Gold Inlay Bands
    const legGeo = new THREE.CylinderGeometry(0.035, 0.045, 2.3, 12);
    this.geometriesToDispose.push(legGeo);

    const legL = new THREE.Mesh(legGeo, darkWoodMat);
    legL.position.set(-0.52, -0.75, 0.28);
    legL.rotation.set(-0.25, 0, -0.2);
    this.mesh.add(legL);

    const legR = new THREE.Mesh(legGeo, darkWoodMat);
    legR.position.set(0.52, -0.75, 0.28);
    legR.rotation.set(-0.25, 0, 0.2);
    this.mesh.add(legR);

    const legB = new THREE.Mesh(legGeo, darkWoodMat);
    legB.position.set(0, -0.75, -0.65);
    legB.rotation.set(0.35, 0, 0);
    this.mesh.add(legB);
  }

  // =========================================================================
  // VARIANT 5: Ancient Shield Target (Dhal / Kheta)
  // =========================================================================
  buildShieldTarget() {
    // Build convex warrior shield face
    this.createCommonTargetBoard(true);

    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x8C6239, metalness: 0.85, roughness: 0.28 });
    const spearWoodMat = new THREE.MeshStandardMaterial({ color: 0x4E3629, roughness: 0.7 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.9, roughness: 0.2 });
    this.materialsToDispose.push(bronzeMat, spearWoodMat, steelMat);

    // Heavy Central Bronze Spike Boss
    const spikeGeo = new THREE.ConeGeometry(0.09, 0.25, 16);
    spikeGeo.rotateX(Math.PI / 2);
    this.geometriesToDispose.push(spikeGeo);
    const spike = new THREE.Mesh(spikeGeo, bronzeMat);
    spike.position.set(0, 0, 0.12);
    this.targetFace.add(spike);

    // Stand: Two Crossed Ancient Royal Spears forming an "X"
    const spearShaftLength = 3.2;
    const shaftGeo = new THREE.CylinderGeometry(0.032, 0.035, spearShaftLength, 12);
    const spearHeadGeo = new THREE.ConeGeometry(0.06, 0.35, 8);
    this.geometriesToDispose.push(shaftGeo, spearHeadGeo);

    [-1, 1].forEach(side => {
      const spear = new THREE.Group();
      spear.position.set(0, -0.3, -0.15);
      spear.rotation.z = side * 0.42;

      const shaft = new THREE.Mesh(shaftGeo, spearWoodMat);
      spear.add(shaft);

      const head = new THREE.Mesh(spearHeadGeo, steelMat);
      head.position.set(0, spearShaftLength * 0.5 + 0.15, 0);
      spear.add(head);

      // Crimson war pennant on spear
      const pennantGeo = new THREE.PlaneGeometry(0.25, 0.6);
      pennantGeo.rotateZ(side * 0.2);
      this.geometriesToDispose.push(pennantGeo);
      const pennantMat = new THREE.MeshStandardMaterial({ color: 0xA51F2B, side: THREE.DoubleSide });
      this.materialsToDispose.push(pennantMat);
      const pennant = new THREE.Mesh(pennantGeo, pennantMat);
      pennant.position.set(side * 0.15, spearShaftLength * 0.4, 0);
      spear.add(pennant);

      this.mesh.add(spear);
    });

    // Fortified Timber Stake Backing
    const stakeGeo = new THREE.CylinderGeometry(0.07, 0.08, 2.2, 8);
    this.geometriesToDispose.push(stakeGeo);
    const rearStake = new THREE.Mesh(stakeGeo, spearWoodMat);
    rearStake.position.set(0, -0.85, -0.65);
    rearStake.rotation.set(0.38, 0, 0);
    this.mesh.add(rearStake);
  }

  // =========================================================================
  // VARIANT 6: Hanging Royal Target
  // =========================================================================
  buildHangingTarget() {
    this.createCommonTargetBoard(false);

    const timberMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.8 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x8C6239, metalness: 0.85, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xF5B942, metalness: 0.85, roughness: 0.25 });
    this.materialsToDispose.push(timberMat, bronzeMat, goldMat);

    // Monumental Carved Wooden Torana Archway (Gallows Frame)
    const archway = new THREE.Group();
    archway.name = 'ToranaArchway';

    const pillarHeight = 4.2;
    const pillarGeo = new THREE.BoxGeometry(0.24, pillarHeight, 0.24);
    this.geometriesToDispose.push(pillarGeo);

    // Twin Pillars
    [-1.5, 1.5].forEach(x => {
      const pillar = new THREE.Mesh(pillarGeo, timberMat);
      pillar.position.set(x, 0.2, 0);
      archway.add(pillar);

      // Bronze bracket capitals
      const capGeo = new THREE.BoxGeometry(0.32, 0.18, 0.32);
      this.geometriesToDispose.push(capGeo);
      const cap = new THREE.Mesh(capGeo, bronzeMat);
      cap.position.set(x, pillarHeight * 0.5 + 0.1, 0);
      archway.add(cap);
    });

    // Heavy Horizontal Lintel Crossbeam
    const beamGeo = new THREE.BoxGeometry(3.4, 0.26, 0.28);
    this.geometriesToDispose.push(beamGeo);
    const lintel = new THREE.Mesh(beamGeo, timberMat);
    lintel.position.set(0, 2.3, 0);
    archway.add(lintel);
    this.mesh.add(archway);

    // Suspension Bronze Chains
    const chainLength = 1.9;
    this.chainL = this.createChainMesh(chainLength, bronzeMat);
    this.chainL.position.set(-this.outerRadius * 0.75, 2.2, 0);
    this.mesh.add(this.chainL);

    this.chainR = this.createChainMesh(chainLength, bronzeMat);
    this.chainR.position.set(this.outerRadius * 0.75, 2.2, 0);
    this.mesh.add(this.chainR);

    // Triple Silk Tassels hanging below the target board
    const tasselGeo = new THREE.ConeGeometry(0.05, 0.25, 8);
    this.geometriesToDispose.push(tasselGeo);
    [-0.35, 0, 0.35].forEach(x => {
      const tassel = new THREE.Mesh(tasselGeo, goldMat);
      tassel.position.set(x, -this.outerRadius - 0.14, 0);
      this.targetFace.add(tassel);
    });
  }

  createChainMesh(length, material) {
    const chainGroup = new THREE.Group();
    const linkCount = Math.floor(length / 0.1);
    const linkGeo = new THREE.TorusGeometry(0.042, 0.015, 6, 12);
    this.geometriesToDispose.push(linkGeo);

    for (let i = 0; i < linkCount; i++) {
      const link = new THREE.Mesh(linkGeo, material);
      link.position.set(0, -i * 0.09, 0);
      link.rotation.y = (i % 2) * (Math.PI / 2);
      chainGroup.add(link);
    }
    return chainGroup;
  }

  // =========================================================================
  // WORLD TRANSFORMS & HIT INTERACTION
  // =========================================================================

  setHighlighted(highlighted) {
    if (this.isHighlighted === highlighted) return;
    this.isHighlighted = highlighted;
    if (this.glowMesh) {
      if (highlighted) {
        this.glowMesh.material.opacity = 0.88;
        this.glowMesh.material.color.setHex(0xFFD700);
      } else {
        this.glowMesh.material.opacity = 0.42;
        this.glowMesh.material.color.setHex(0xE5A832);
      }
    }
    if (this.targetFaceLight) {
      this.targetFaceLight.intensity = highlighted ? 2.8 : 1.8;
    }
  }

  getWorldPosition(targetVec) {
    if (this.targetFace) {
      return this.targetFace.getWorldPosition(targetVec);
    }
    return this.mesh.getWorldPosition(targetVec);
  }

  getWorldNormal(targetVec) {
    if (this.targetFace) {
      // Local +Z points outward from front face
      const normal = new THREE.Vector3(0, 0, 1);
      const worldQuat = new THREE.Quaternion();
      this.targetFace.getWorldQuaternion(worldQuat);
      return normal.applyQuaternion(worldQuat).normalize();
    }
    return new THREE.Vector3(0, 0, -1);
  }

  /**
   * Dynamic Impact Recoil Shudder when hit by an arrow
   */
  triggerImpactRecoil(hitWorldPoint, arrowVelocity) {
    this.isHit = true;
    const localHit = this.targetFace.worldToLocal(hitWorldPoint.clone());

    // Backward recoil along local Z
    this.recoilZ = 0.085;

    // Recoil tilt depending on hit offset from center
    this.recoilRotX = -localHit.y * 0.16;
    this.recoilRotY = localHit.x * 0.16;
  }

  /**
   * Spawn realistic wood splinters, golden sparks, and bullseye shockwave
   */
  spawnHitParticles(worldHitPoint, isBullseye = false) {
    if (this.particles.length > 35) return;

    const localHit = this.recoilGroup.worldToLocal(worldHitPoint.clone());
    const particleCount = isBullseye ? 18 : 10;

    // 1. Wood Splinter & Spark Particles
    for (let i = 0; i < particleCount; i++) {
      const isSpark = Math.random() < (isBullseye ? 0.7 : 0.4);
      const geo = isSpark
        ? new THREE.SphereGeometry(0.015, 6, 6)
        : new THREE.BoxGeometry(0.02, 0.04, 0.01);

      const mat = new THREE.MeshBasicMaterial({
        color: isSpark ? (isBullseye ? 0xFFEA00 : 0xFFB300) : 0x5D4037
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(localHit);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        Math.random() * 3.0 + 1.2,
        (Math.random() - 0.5) * 3.5
      );

      this.recoilGroup.add(mesh);
      this.particles.push({
        mesh: mesh,
        position: localHit.clone(),
        velocity: vel,
        rotationVel: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ),
        life: 0.6 + Math.random() * 0.35,
        maxLife: 0.8
      });
    }

    // 2. Bullseye Expanding Golden Shockwave Ring
    if (isBullseye) {
      const shockGeo = new THREE.RingGeometry(0.05, 0.12, 32);
      const shockMat = new THREE.MeshBasicMaterial({
        color: 0xFFD700,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const shockMesh = new THREE.Mesh(shockGeo, shockMat);
      shockMesh.position.copy(localHit);
      shockMesh.position.z += 0.01;
      this.recoilGroup.add(shockMesh);

      this.shockwaves.push({
        mesh: shockMesh,
        scale: 1.0,
        life: 0.45,
        maxLife: 0.45
      });
    }
  }

  // =========================================================================
  // UPDATE LOOP (60 FPS)
  // =========================================================================

  update(dt) {
    this.time += dt;

    // 1. Variant-Specific Movement Physics
    if (this.type === 'moving' && this.carriageGroup) {
      // Oscillate carriage smoothly along the wooden rail track
      const offset = Math.sin(this.time * this.moveSpeed) * (this.moveRange * 0.5);
      this.carriageGroup.position.x = offset;

      // Roll chariot wheels in sync with linear translation
      if (this.chariotWheels) {
        const wheelRadius = 0.26;
        const wheelRot = -offset / wheelRadius;
        this.chariotWheels.forEach(w => {
          w.rotation.z = wheelRot;
        });
      }
    } else if (this.type === 'rotating') {
      // Continuous smooth rotation around center Z axis
      if (this.targetFace) {
        this.targetFace.rotation.z += this.moveSpeed * dt;
      }
    } else if (this.type === 'hanging') {
      // Dual-Axis Dynamic Gravitational Pendulum Sway
      const sway = Math.sin(this.time * this.moveSpeed) * 0.22;
      const swayPitch = Math.cos(this.time * this.moveSpeed * 1.4) * 0.04;

      if (this.recoilGroup) {
        this.recoilGroup.rotation.z = sway;
        this.recoilGroup.rotation.x = swayPitch;
        this.recoilGroup.position.x = Math.sin(sway) * 1.8;
        this.recoilGroup.position.y = -(1.0 - Math.cos(sway)) * 1.8;
      }
    }

    // 2. Pulse Visibility Beacon and Subtle Glowing Outline
    if (this.beaconLight) {
      this.beaconLight.intensity = 1.2 + Math.sin(this.time * 4) * 0.4;
    }
    if (this.glowMesh && !this.isHighlighted) {
      this.glowMesh.material.opacity = 0.38 + Math.sin(this.time * 3.2) * 0.12;
    }

    // 3. Elastic Spring Shudder Decay (Impact Recoil)
    if (Math.abs(this.recoilZ) > 0.001 || Math.abs(this.recoilRotX) > 0.001) {
      const springDamp = Math.pow(0.005, dt);
      this.recoilZ *= springDamp;
      this.recoilRotX *= springDamp;
      this.recoilRotY *= springDamp;

      this.recoilGroup.position.z = -this.recoilZ;
      this.recoilGroup.rotation.x = this.recoilRotX;
      this.recoilGroup.rotation.y = this.recoilRotY;
    }

    // 4. Update Particle Bursts
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 9.8 * dt; // Gravity
      p.mesh.position.copy(p.position);
      p.mesh.rotation.x += p.rotationVel.x * dt;
      p.mesh.rotation.y += p.rotationVel.y * dt;
      p.mesh.scale.multiplyScalar(0.96);

      if (p.life <= 0) {
        this.recoilGroup.remove(p.mesh);
        if (p.mesh.geometry) p.mesh.geometry.dispose();
        if (p.mesh.material) p.mesh.material.dispose();
        this.particles.splice(i, 1);
      }
    }

    // 5. Update Expanding Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= dt;
      sw.scale += dt * 5.0;
      sw.mesh.scale.set(sw.scale, sw.scale, 1);
      sw.mesh.material.opacity = Math.max(0, sw.life / sw.maxLife);

      if (sw.life <= 0) {
        this.recoilGroup.remove(sw.mesh);
        if (sw.mesh.geometry) sw.mesh.geometry.dispose();
        if (sw.mesh.material) sw.mesh.material.dispose();
        this.shockwaves.splice(i, 1);
      }
    }
  }

  // =========================================================================
  // RESET & DISPOSAL (Zero Memory Leaks)
  // =========================================================================

  reset() {
    this.isHit = false;
    this.time = 0;
    this.recoilZ = 0;
    this.recoilRotX = 0;
    this.recoilRotY = 0;
    this.mesh.position.copy(this.initialPosition);

    if (this.recoilGroup) {
      this.recoilGroup.position.set(0, 0, 0);
      this.recoilGroup.rotation.set(0, 0, 0);
    }

    if (this.targetFace) {
      this.targetFace.rotation.set(0, 0, 0);

      // Clean up all embedded arrows from previous shots
      const toRemove = [];
      this.targetFace.traverse(child => {
        if (child.name === 'Arrow') {
          toRemove.push(child);
        }
      });
      toRemove.forEach(a => a.parent && a.parent.remove(a));
    }

    // Clear active particles
    this.particles.forEach(p => {
      this.recoilGroup.remove(p.mesh);
      if (p.mesh.geometry) p.mesh.geometry.dispose();
      if (p.mesh.material) p.mesh.material.dispose();
    });
    this.particles = [];

    this.shockwaves.forEach(sw => {
      this.recoilGroup.remove(sw.mesh);
      if (sw.mesh.geometry) sw.mesh.geometry.dispose();
      if (sw.mesh.material) sw.mesh.material.dispose();
    });
    this.shockwaves = [];
  }

  dispose() {
    this.reset();
    this.geometriesToDispose.forEach(g => g && g.dispose());
    this.materialsToDispose.forEach(m => m && m.dispose());
    this.geometriesToDispose = [];
    this.materialsToDispose = [];
  }
}
