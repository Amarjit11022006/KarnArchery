/**
 * KarnArchery - Main 3D Archer Character (Suryaputra Karna)
 * AAA-Grade Realistic 3D Humanoid Warrior Character inspired by the Mahabharata.
 * Features:
 * - Anatomically realistic athletic warrior physique (1.84m height)
 * - Sculpted human face with eyes, lips, jaw, and traditional warrior hairstyle (Shikha)
 * - Divine Golden Kavach with embossed Surya sunburst mandala engravings
 * - Celestial Kundala earrings with dangling sunburst drops
 * - Royal crimson dhoti with gold zari borders and dynamic fabric normals
 * - Ornate pauldrons, vambraces, greaves, waistband, and flowing crimson cape
 * - PBR material suite with diffuse, normal, and roughness maps
 * - Full humanoid skeletal articulation (bones hierarchy) compatible with AnimationController
 * - First-Person and Third-Person visibility masking & camera compatibility
 */

import * as THREE from 'three';
import { AnimationController } from './animation.js';
import { Bow } from './bow.js';
import { getSkinTextures, getKavachGoldTextures, getDhotiTextures, getEyeTexture } from './characterTextures.js';

export const ARMOR_TINTS = {
  gold: { color: 0xF5B942, metalness: 0.94, roughness: 0.18 },
  bronze: { color: 0xCD7F32, metalness: 0.88, roughness: 0.28 },
  silver: { color: 0xE2E8F0, metalness: 0.95, roughness: 0.15 },
  obsidian: { color: 0x222226, metalness: 0.80, roughness: 0.32 }
};

export const CAPE_COLORS = {
  crimson: 0x8E1B23,
  saffron: 0xEE7600,
  navy: 0x101C2B,
  emerald: 0x1E5E3A
};

export class Archer {
  constructor(bowType = 'training') {
    this.mesh = new THREE.Group();
    this.mesh.name = 'ArcherKarna';

    this.bowType = bowType;
    this.bow = null;
    this.nockedArrowMesh = null;

    // Humanoid Bone / Joint References for Animation Controller
    this.bones = {
      root: null,
      pelvis: null,
      spine: null,
      chest: null,
      neck: null,
      head: null,
      leftShoulder: null,
      leftArm: null,
      leftForearm: null,
      leftHand: null,
      rightShoulder: null,
      rightArm: null,
      rightForearm: null,
      rightHand: null,
      leftLeg: null,
      leftShin: null,
      leftFoot: null,
      rightLeg: null,
      rightShin: null,
      rightFoot: null
    };

    this.capeMesh = null;
    this.armorMat = null;
    this.capeMat = null;
    this.skinMat = null;
    this.dhotiMat = null;
    this.thirdPersonOnlyMeshes = [];

    this.animator = new AnimationController(this);

    // Build the realistic warrior character
    this.buildCharacter();
    this.equipBow(this.bowType);
  }

  buildCharacter() {
    // -------------------------------------------------------------------------
    // 1. PBR Materials Suite with High-Resolution Maps
    // -------------------------------------------------------------------------
    const skinPBR = getSkinTextures();
    const goldPBR = getKavachGoldTextures();
    const dhotiPBR = getDhotiTextures();
    const eyeTex = getEyeTexture();

    // A. Warm Indian Warrior Skin PBR
    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xC4864E,
      map: skinPBR.diffuse,
      normalMap: skinPBR.normal,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: skinPBR.roughness,
      roughness: 0.52,
      metalness: 0.05
    });

    // B. Divine Golden Kavach PBR
    this.armorMat = new THREE.MeshStandardMaterial({
      color: 0xF5B942,
      map: goldPBR.diffuse,
      normalMap: goldPBR.normal,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughnessMap: goldPBR.roughness,
      roughness: 0.18,
      metalness: 0.94
    });

    // C. Royal Silk Dhoti PBR
    this.dhotiMat = new THREE.MeshStandardMaterial({
      color: 0x8E1B23,
      map: dhotiPBR.diffuse,
      normalMap: dhotiPBR.normal,
      normalScale: new THREE.Vector2(0.75, 0.75),
      roughnessMap: dhotiPBR.roughness,
      roughness: 0.74,
      metalness: 0.04
    });

    // D. Royal Crimson Cape
    this.capeMat = new THREE.MeshStandardMaterial({
      color: 0x8E1B23,
      map: dhotiPBR.diffuse,
      roughness: 0.75,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // E. Dark Warrior Hairstyle PBR
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x120D0A, // Deep black-brown
      roughness: 0.42,
      metalness: 0.1
    });

    // F. Leather Materials
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x3D2418,
      roughness: 0.65,
      metalness: 0.12
    });

    // G. Realistic Eyes PBR
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      map: eyeTex,
      roughness: 0.1,
      metalness: 0.05
    });

    // -------------------------------------------------------------------------
    // 2. Skeletal Joint Hierarchy
    // -------------------------------------------------------------------------

    // Root Group
    const root = new THREE.Group();
    root.name = 'Archer_Root';
    this.mesh.add(root);
    this.bones.root = root;

    // Pelvis / Hips (Y = 0.96m from ground)
    const pelvis = new THREE.Group();
    pelvis.position.set(0, 0.96, 0);
    root.add(pelvis);
    this.bones.pelvis = pelvis;

    // Spine / Torso (Y = 0.14m above pelvis)
    const spine = new THREE.Group();
    spine.position.set(0, 0.14, 0);
    pelvis.add(spine);
    this.bones.spine = spine;

    // Chest / Upper Torso (Y = 0.22m above spine)
    const chest = new THREE.Group();
    chest.position.set(0, 0.22, 0);
    spine.add(chest);
    this.bones.chest = chest;

    // Neck & Head
    const neck = new THREE.Group();
    neck.position.set(0, 0.26, 0);
    chest.add(neck);
    this.bones.neck = neck;

    const head = new THREE.Group();
    head.position.set(0, 0.10, 0);
    neck.add(head);
    this.bones.head = head;

    // -------------------------------------------------------------------------
    // 3. Anatomical Head, Realistic Face, Kundalas & Hairstyle
    // -------------------------------------------------------------------------
    this.buildRealisticHead(head, neck, skinPBR, eyeMat, hairMat);

    // -------------------------------------------------------------------------
    // 4. Divine Golden Kavach (Breastplate, Backplate, Sun Emblem, Pauldrons)
    // -------------------------------------------------------------------------
    this.buildDivineKavach(spine, chest, leatherMat);

    // -------------------------------------------------------------------------
    // 5. Muscular Arms, Golden Vambraces & Hands
    // -------------------------------------------------------------------------
    this.buildMuscularArms(chest, leatherMat);

    // -------------------------------------------------------------------------
    // 6. Lower Body, Royal Silk Dhoti, Greaves & Feet
    // -------------------------------------------------------------------------
    this.buildLowerBodyAndDhoti(pelvis, leatherMat);

    // -------------------------------------------------------------------------
    // 7. Subtle Celestial Rim Light (Karna's Surya Aura)
    // -------------------------------------------------------------------------
    const auraLight = new THREE.PointLight(0xFFD56B, 0.45, 3.2);
    auraLight.position.set(0, 0.28, 0.35);
    chest.add(auraLight);
    this.thirdPersonOnlyMeshes.push(auraLight);

    // Enable soft realistic shadows across all character meshes
    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  // ===========================================================================
  // HEAD, REALISTIC FACE & KUNDALAS
  // ===========================================================================

  buildRealisticHead(head, neck, skinPBR, eyeMat, hairMat) {
    // Neck Mesh (Muscular sternocleidomastoid definition)
    const neckGeo = new THREE.CylinderGeometry(0.068, 0.082, 0.12, 16);
    const neckMesh = new THREE.Mesh(neckGeo, this.skinMat);
    neckMesh.position.set(0, 0.05, -0.01);
    neck.add(neckMesh);
    this.thirdPersonOnlyMeshes.push(neckMesh);

    // Sculpted Head Cranium & Face
    const headGeo = new THREE.SphereGeometry(0.118, 24, 24);
    headGeo.scale(0.96, 1.18, 1.05);
    const headMesh = new THREE.Mesh(headGeo, this.skinMat);
    headMesh.position.set(0, 0.04, 0);
    head.add(headMesh);
    this.thirdPersonOnlyMeshes.push(headMesh);

    // Brow Ridge & Forehead
    const browGeo = new THREE.BoxGeometry(0.14, 0.035, 0.06);
    const browMesh = new THREE.Mesh(browGeo, this.skinMat);
    browMesh.position.set(0, 0.07, 0.095);
    head.add(browMesh);
    this.thirdPersonOnlyMeshes.push(browMesh);

    // Chiseled Warrior Nose (Bridge & Nostril apex)
    const noseGeo = new THREE.ConeGeometry(0.022, 0.068, 8);
    noseGeo.rotateX(Math.PI);
    noseGeo.scale(0.85, 1.0, 1.25);
    const noseMesh = new THREE.Mesh(noseGeo, this.skinMat);
    noseMesh.position.set(0, 0.025, 0.138);
    head.add(noseMesh);
    this.thirdPersonOnlyMeshes.push(noseMesh);

    // Sculpted Lips & Philtrum
    const upperLipGeo = new THREE.BoxGeometry(0.058, 0.015, 0.03);
    const lipMat = new THREE.MeshStandardMaterial({ color: 0x985542, roughness: 0.38 });
    const upperLip = new THREE.Mesh(upperLipGeo, lipMat);
    upperLip.position.set(0, -0.022, 0.122);
    head.add(upperLip);
    this.thirdPersonOnlyMeshes.push(upperLip);

    const lowerLipGeo = new THREE.BoxGeometry(0.052, 0.016, 0.032);
    const lowerLip = new THREE.Mesh(lowerLipGeo, lipMat);
    lowerLip.position.set(0, -0.038, 0.12);
    head.add(lowerLip);
    this.thirdPersonOnlyMeshes.push(lowerLip);

    // Strong Warrior Jaw & Chin
    const chinGeo = new THREE.BoxGeometry(0.064, 0.045, 0.05);
    const chinMesh = new THREE.Mesh(chinGeo, this.skinMat);
    chinMesh.position.set(0, -0.072, 0.095);
    head.add(chinMesh);
    this.thirdPersonOnlyMeshes.push(chinMesh);

    // Realistic Eyes (Left & Right Eyeballs with Iris/Sclera Texture)
    [-0.042, 0.042].forEach(x => {
      const eyeGeo = new THREE.SphereGeometry(0.017, 16, 16);
      eyeGeo.rotateY(Math.PI / 2);
      const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
      eyeMesh.position.set(x, 0.042, 0.108);
      head.add(eyeMesh);
      this.thirdPersonOnlyMeshes.push(eyeMesh);

      // Eyelid crease
      const lidGeo = new THREE.TorusGeometry(0.018, 0.005, 8, 12, Math.PI);
      const lid = new THREE.Mesh(lidGeo, this.skinMat);
      lid.position.set(x, 0.046, 0.112);
      lid.rotation.x = 0.3;
      head.add(lid);
      this.thirdPersonOnlyMeshes.push(lid);
    });

    // Sacred Warrior Tilak (Crimson and Sandalwood on Forehead)
    const tilakGeo = new THREE.PlaneGeometry(0.018, 0.05);
    const tilakMat = new THREE.MeshBasicMaterial({ color: 0x9B111E, side: THREE.DoubleSide });
    const tilak = new THREE.Mesh(tilakGeo, tilakMat);
    tilak.position.set(0, 0.082, 0.125);
    head.add(tilak);
    this.thirdPersonOnlyMeshes.push(tilak);

    // -------------------------------------------------------------------------
    // Traditional Indian Warrior Hairstyle (Long flowing locks & Shikha topknot)
    // -------------------------------------------------------------------------
    const hairCapGeo = new THREE.SphereGeometry(0.128, 20, 20);
    hairCapGeo.scale(1.02, 1.06, 1.14);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.set(0, 0.065, -0.02);
    head.add(hairCap);
    this.thirdPersonOnlyMeshes.push(hairCap);

    // Flowing shoulder-length hair locks falling down the neck and back
    const backHairGeo = new THREE.CylinderGeometry(0.11, 0.16, 0.32, 12);
    backHairGeo.scale(1, 1, 0.65);
    const backHair = new THREE.Mesh(backHairGeo, hairMat);
    backHair.position.set(0, -0.06, -0.08);
    head.add(backHair);
    this.thirdPersonOnlyMeshes.push(backHair);

    // Royal Topknot (Shikha / Jata) tied with gold ring
    const topknotGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.18, 10);
    topknotGeo.rotateX(0.42);
    const topknot = new THREE.Mesh(topknotGeo, hairMat);
    topknot.position.set(0, 0.17, -0.09);
    head.add(topknot);
    this.thirdPersonOnlyMeshes.push(topknot);

    const knotRingGeo = new THREE.TorusGeometry(0.042, 0.009, 8, 16);
    knotRingGeo.rotateX(Math.PI / 2 + 0.42);
    const knotRing = new THREE.Mesh(knotRingGeo, this.armorMat);
    knotRing.position.set(0, 0.135, -0.075);
    head.add(knotRing);
    this.thirdPersonOnlyMeshes.push(knotRing);

    // Royal Warrior Mukuta (Golden Tiara / Forehead Band)
    const crownGeo = new THREE.TorusGeometry(0.122, 0.016, 8, 24);
    crownGeo.rotateX(Math.PI / 2);
    const crown = new THREE.Mesh(crownGeo, this.armorMat);
    crown.position.set(0, 0.07, 0.01);
    head.add(crown);
    this.thirdPersonOnlyMeshes.push(crown);

    // Central Sun Crest on Tiara
    const crownCrestGeo = new THREE.ConeGeometry(0.028, 0.075, 8);
    const crownCrest = new THREE.Mesh(crownCrestGeo, this.armorMat);
    crownCrest.position.set(0, 0.12, 0.12);
    crownCrest.rotation.x = -0.25;
    head.add(crownCrest);
    this.thirdPersonOnlyMeshes.push(crownCrest);

    // -------------------------------------------------------------------------
    // Divine Kundalas (Iconic Golden Earrings of Karna)
    // -------------------------------------------------------------------------
    [-0.124, 0.124].forEach((x, idx) => {
      const kundalGroup = new THREE.Group();
      kundalGroup.position.set(x, 0.015, 0);

      // Celestial Filigree Hoop
      const hoopGeo = new THREE.TorusGeometry(0.024, 0.006, 8, 16);
      const hoop = new THREE.Mesh(hoopGeo, this.armorMat);
      kundalGroup.add(hoop);

      // Dangling Sunburst Teardrop Pendant
      const dropGeo = new THREE.ConeGeometry(0.012, 0.038, 8);
      dropGeo.rotateX(Math.PI);
      const drop = new THREE.Mesh(dropGeo, this.armorMat);
      drop.position.set(0, -0.036, 0);
      kundalGroup.add(drop);

      // Faceted ruby gem inset
      const rubyGeo = new THREE.SphereGeometry(0.008, 6, 6);
      const rubyMat = new THREE.MeshStandardMaterial({ color: 0xB5121B, roughness: 0.15, metalness: 0.8 });
      const ruby = new THREE.Mesh(rubyGeo, rubyMat);
      ruby.position.set(0, -0.015, 0.008);
      kundalGroup.add(ruby);

      head.add(kundalGroup);
      this.thirdPersonOnlyMeshes.push(kundalGroup);
    });
  }

  // ===========================================================================
  // DIVINE KAVACH (ARMOUR) & QUIVER
  // ===========================================================================

  buildDivineKavach(spine, chest, leatherMat) {
    // Contoured Golden Breastplate (Kavach)
    // Lower Torso / Abdominal Armour
    const lowerArmourGeo = new THREE.CylinderGeometry(0.185, 0.165, 0.22, 16);
    lowerArmourGeo.scale(1.15, 1.0, 0.88);
    const lowerArmour = new THREE.Mesh(lowerArmourGeo, this.armorMat);
    lowerArmour.position.set(0, 0.10, 0);
    spine.add(lowerArmour);
    this.thirdPersonOnlyMeshes.push(lowerArmour);

    // Upper Chest Breastplate (Pectoral contoured)
    const chestPlateGeo = new THREE.CylinderGeometry(0.235, 0.195, 0.28, 16);
    chestPlateGeo.scale(1.22, 1.0, 0.92);
    const chestPlate = new THREE.Mesh(chestPlateGeo, this.armorMat);
    chestPlate.position.set(0, 0.12, 0);
    chest.add(chestPlate);
    this.thirdPersonOnlyMeshes.push(chestPlate);

    // -------------------------------------------------------------------------
    // Embossed Central Surya Sun Emblem (Karna's Divine Heritage)
    // -------------------------------------------------------------------------
    const suryaCenterGeo = new THREE.CylinderGeometry(0.082, 0.082, 0.024, 20);
    suryaCenterGeo.rotateX(Math.PI / 2);
    const suryaEmblem = new THREE.Mesh(suryaCenterGeo, this.armorMat);
    suryaEmblem.position.set(0, 0.15, 0.195);
    chest.add(suryaEmblem);
    this.thirdPersonOnlyMeshes.push(suryaEmblem);

    // Radiant Sunbeams (12 sculpted rays radiating from sun disc)
    const rayGeo = new THREE.ConeGeometry(0.016, 0.085, 6);
    rayGeo.rotateX(Math.PI / 2);
    for (let r = 0; r < 12; r++) {
      const angle = (r * Math.PI * 2) / 12;
      const ray = new THREE.Mesh(rayGeo, this.armorMat);
      ray.position.set(Math.cos(angle) * 0.105, 0.15 + Math.sin(angle) * 0.105, 0.192);
      ray.rotation.z = angle - Math.PI / 2;
      chest.add(ray);
      this.thirdPersonOnlyMeshes.push(ray);
    }

    // Glowing Central Solar Ruby Cabochon
    const gemGeo = new THREE.SphereGeometry(0.025, 12, 12);
    gemGeo.scale(1, 1, 0.4);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xE52521,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x990000,
      emissiveIntensity: 0.4
    });
    const solarGem = new THREE.Mesh(gemGeo, gemMat);
    solarGem.position.set(0, 0.15, 0.208);
    chest.add(solarGem);
    this.thirdPersonOnlyMeshes.push(solarGem);

    // Gorget (Golden Throat & Collar Protection)
    const gorgetGeo = new THREE.TorusGeometry(0.13, 0.025, 8, 16, Math.PI);
    gorgetGeo.rotateX(Math.PI / 2 + 0.2);
    const gorget = new THREE.Mesh(gorgetGeo, this.armorMat);
    gorget.position.set(0, 0.23, 0.07);
    chest.add(gorget);
    this.thirdPersonOnlyMeshes.push(gorget);

    // -------------------------------------------------------------------------
    // 3-Tiered Articulated Pauldrons (Shoulder Armour)
    // -------------------------------------------------------------------------
    [-0.27, 0.27].forEach((x, idx) => {
      const pauldronGroup = new THREE.Group();
      pauldronGroup.position.set(x, 0.24, 0);

      // Tier 1: Main Curved Dome Guard
      const t1Geo = new THREE.SphereGeometry(0.105, 12, 12);
      t1Geo.scale(1.25, 0.75, 1.15);
      const t1 = new THREE.Mesh(t1Geo, this.armorMat);
      pauldronGroup.add(t1);

      // Tier 2: Lower Articulated Lame
      const t2Geo = new THREE.SphereGeometry(0.095, 10, 10);
      t2Geo.scale(1.2, 0.65, 1.1);
      const t2 = new THREE.Mesh(t2Geo, this.armorMat);
      t2.position.set(idx === 0 ? -0.04 : 0.04, -0.065, 0);
      pauldronGroup.add(t2);

      // Lion Crest Emblem on Pauldron
      const lionCrestGeo = new THREE.ConeGeometry(0.025, 0.04, 6);
      lionCrestGeo.rotateZ(idx === 0 ? Math.PI / 2 : -Math.PI / 2);
      const crest = new THREE.Mesh(lionCrestGeo, this.armorMat);
      crest.position.set(idx === 0 ? -0.11 : 0.11, 0.02, 0);
      pauldronGroup.add(crest);

      chest.add(pauldronGroup);
      this.thirdPersonOnlyMeshes.push(pauldronGroup);
    });

    // -------------------------------------------------------------------------
    // Back Quiver (Packed with 5 Detailed Arrows)
    // -------------------------------------------------------------------------
    const quiver = new THREE.Group();
    quiver.position.set(-0.08, 0.14, -0.18);
    quiver.rotation.z = -0.32; // Traditional diagonal strap
    quiver.rotation.y = -0.15;

    const quiverGeo = new THREE.CylinderGeometry(0.068, 0.052, 0.62, 12);
    const quiverMesh = new THREE.Mesh(quiverGeo, leatherMat);
    quiver.add(quiverMesh);

    // Decorative Golden Bandings on Quiver
    [-0.22, 0, 0.22].forEach(y => {
      const bandGeo = new THREE.TorusGeometry(0.066, 0.01, 8, 16);
      bandGeo.rotateX(Math.PI / 2);
      const band = new THREE.Mesh(bandGeo, this.armorMat);
      band.position.y = y;
      quiver.add(band);
    });

    // 5 Arrows with Goose Fletchings in Quiver
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const arrowShaftGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.52, 8);
      const arrowShaftMat = new THREE.MeshStandardMaterial({ color: 0xC69A5D });
      const arrowShaft = new THREE.Mesh(arrowShaftGeo, arrowShaftMat);
      arrowShaft.position.set(Math.cos(angle) * 0.028, 0.38 + (i % 2) * 0.04, Math.sin(angle) * 0.028);

      // Red/Golden Fletchings
      const fletchGeo = new THREE.BoxGeometry(0.035, 0.08, 0.005);
      const fletchMat = new THREE.MeshStandardMaterial({ color: 0xB5121B });
      const fletch = new THREE.Mesh(fletchGeo, fletchMat);
      fletch.position.set(0, 0.22, 0);
      arrowShaft.add(fletch);

      quiver.add(arrowShaft);
    }
    chest.add(quiver);
    this.thirdPersonOnlyMeshes.push(quiver);

    // -------------------------------------------------------------------------
    // Royal Crimson Cape (Uttariya) with Subdivided Geometry
    // -------------------------------------------------------------------------
    const capeGeo = new THREE.PlaneGeometry(0.68, 1.25, 8, 12);
    capeGeo.translate(0, -0.62, 0);
    this.capeMesh = new THREE.Mesh(capeGeo, this.capeMat);
    this.capeMesh.position.set(0, 0.24, -0.19);
    chest.add(this.capeMesh);
    this.thirdPersonOnlyMeshes.push(this.capeMesh);
  }

  // ===========================================================================
  // MUSCULAR ARMS & GOLDEN VAMBRACES
  // ===========================================================================

  buildMuscularArms(chest, leatherMat) {
    // -------------------------------------------------------------------------
    // Left Arm (Bow Holding Arm)
    // -------------------------------------------------------------------------
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.27, 0.24, 0);
    chest.add(leftShoulder);
    this.bones.leftShoulder = leftShoulder;

    const leftArm = new THREE.Group();
    leftShoulder.add(leftArm);
    this.bones.leftArm = leftArm;

    // Muscular Bicep/Tricep
    const bicepGeo = new THREE.CylinderGeometry(0.062, 0.054, 0.30, 12);
    bicepGeo.translate(0, -0.15, 0);
    const leftBicep = new THREE.Mesh(bicepGeo, this.skinMat);
    leftArm.add(leftBicep);

    const leftForearm = new THREE.Group();
    leftForearm.position.set(0, -0.30, 0);
    leftArm.add(leftForearm);
    this.bones.leftForearm = leftForearm;

    // Muscular Forearm
    const forearmGeo = new THREE.CylinderGeometry(0.054, 0.046, 0.28, 12);
    forearmGeo.translate(0, -0.14, 0);
    const leftForearmMesh = new THREE.Mesh(forearmGeo, this.skinMat);
    leftForearm.add(leftForearmMesh);

    // Golden Vambrace (Bahu-Kavach) with engraved trims
    const vambraceGeo = new THREE.CylinderGeometry(0.059, 0.051, 0.20, 14);
    vambraceGeo.translate(0, -0.13, 0);
    const leftVambrace = new THREE.Mesh(vambraceGeo, this.armorMat);
    leftForearm.add(leftVambrace);

    // Left Hand (Engineered to grip bow handle securely)
    const leftHand = new THREE.Group();
    leftHand.position.set(0, -0.28, 0);
    leftForearm.add(leftHand);
    this.bones.leftHand = leftHand;

    const palmGeo = new THREE.BoxGeometry(0.058, 0.075, 0.045);
    const leftPalm = new THREE.Mesh(palmGeo, this.skinMat);
    leftPalm.position.set(0, -0.03, 0);
    leftHand.add(leftPalm);

    // Curved gripping fingers
    const fingersGeo = new THREE.BoxGeometry(0.054, 0.045, 0.038);
    const leftFingers = new THREE.Mesh(fingersGeo, this.skinMat);
    leftFingers.position.set(0, -0.07, 0.015);
    leftHand.add(leftFingers);

    // -------------------------------------------------------------------------
    // Right Arm (Drawing Arm with Archer Tab)
    // -------------------------------------------------------------------------
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.27, 0.24, 0);
    chest.add(rightShoulder);
    this.bones.rightShoulder = rightShoulder;

    const rightArm = new THREE.Group();
    rightShoulder.add(rightArm);
    this.bones.rightArm = rightArm;

    const rightBicep = new THREE.Mesh(bicepGeo, this.skinMat);
    rightArm.add(rightBicep);

    const rightForearm = new THREE.Group();
    rightForearm.position.set(0, -0.30, 0);
    rightArm.add(rightForearm);
    this.bones.rightForearm = rightForearm;

    const rightForearmMesh = new THREE.Mesh(forearmGeo, this.skinMat);
    rightForearm.add(rightForearmMesh);

    const rightVambrace = new THREE.Mesh(vambraceGeo, this.armorMat);
    rightForearm.add(rightVambrace);

    // Right Hand (Archer's Drawing Hand with Leather Tab / Ring)
    const rightHand = new THREE.Group();
    rightHand.position.set(0, -0.28, 0);
    rightForearm.add(rightHand);
    this.bones.rightHand = rightHand;

    const rightPalm = new THREE.Mesh(palmGeo, this.skinMat);
    rightPalm.position.set(0, -0.03, 0);
    rightHand.add(rightPalm);

    // Archer's Leather Shooting Tab (Angulitrana) on drawing fingers
    const tabGeo = new THREE.BoxGeometry(0.056, 0.042, 0.032);
    const rightTab = new THREE.Mesh(tabGeo, leatherMat);
    rightTab.position.set(0, -0.07, -0.012);
    rightHand.add(rightTab);
  }

  // ===========================================================================
  // LOWER BODY, ROYAL DHOTI, GREAVES & FEET
  // ===========================================================================

  buildLowerBodyAndDhoti(pelvis, leatherMat) {
    // -------------------------------------------------------------------------
    // Ornate Golden Waistband (Kamarband / Mekhala)
    // -------------------------------------------------------------------------
    const waistbandGeo = new THREE.CylinderGeometry(0.185, 0.175, 0.16, 16);
    waistbandGeo.scale(1.15, 1.0, 0.88);
    const waistbandMesh = new THREE.Mesh(waistbandGeo, this.dhotiMat);
    pelvis.add(waistbandMesh);
    this.thirdPersonOnlyMeshes.push(waistbandMesh);

    // Heavy Golden Belt with Sun Buckle
    const beltGeo = new THREE.TorusGeometry(0.19, 0.024, 8, 20);
    beltGeo.rotateX(Math.PI / 2);
    beltGeo.scale(1.14, 0.88, 1);
    const belt = new THREE.Mesh(beltGeo, this.armorMat);
    belt.position.set(0, 0.03, 0);
    pelvis.add(belt);
    this.thirdPersonOnlyMeshes.push(belt);

    // Central Sun Buckle on Waist
    const buckleGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.02, 16);
    buckleGeo.rotateX(Math.PI / 2);
    const buckle = new THREE.Mesh(buckleGeo, this.armorMat);
    buckle.position.set(0, 0.03, 0.175);
    pelvis.add(buckle);
    this.thirdPersonOnlyMeshes.push(buckle);

    // Royal Dhoti Front Pleated Drape (Kachha with Golden Zari Border)
    const kachhaGeo = new THREE.BoxGeometry(0.16, 0.55, 0.06);
    const kachha = new THREE.Mesh(kachhaGeo, this.dhotiMat);
    kachha.position.set(0, -0.22, 0.15);
    pelvis.add(kachha);
    this.thirdPersonOnlyMeshes.push(kachha);

    // -------------------------------------------------------------------------
    // Muscular Legs, Dhoti Wraps, Greaves & Sandals
    // -------------------------------------------------------------------------
    [-0.105, 0.105].forEach((x, idx) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(x, -0.06, 0);
      pelvis.add(legGroup);

      if (idx === 0) this.bones.leftLeg = legGroup;
      else this.bones.rightLeg = legGroup;

      // Muscular Thigh covered in pleated royal silk dhoti
      const thighGeo = new THREE.CylinderGeometry(0.088, 0.072, 0.46, 12);
      thighGeo.translate(0, -0.23, 0);
      const thigh = new THREE.Mesh(thighGeo, this.dhotiMat);
      legGroup.add(thigh);
      this.thirdPersonOnlyMeshes.push(thigh);

      // Knee Joint & Shin
      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.46, 0);
      legGroup.add(shinGroup);

      if (idx === 0) this.bones.leftShin = shinGroup;
      else this.bones.rightShin = shinGroup;

      // Muscular Calf
      const shinGeo = new THREE.CylinderGeometry(0.068, 0.054, 0.44, 12);
      shinGeo.translate(0, -0.22, 0);
      const shin = new THREE.Mesh(shinGeo, this.skinMat);
      shinGroup.add(shin);
      this.thirdPersonOnlyMeshes.push(shin);

      // Golden Greave (Jangha-Kavach) with engraved knee cop
      const greaveGeo = new THREE.CylinderGeometry(0.072, 0.058, 0.28, 12);
      greaveGeo.translate(0, -0.20, 0.01);
      const greave = new THREE.Mesh(greaveGeo, this.armorMat);
      shinGroup.add(greave);
      this.thirdPersonOnlyMeshes.push(greave);

      const kneeCopGeo = new THREE.SphereGeometry(0.042, 10, 10);
      kneeCopGeo.scale(1.1, 1.2, 0.8);
      const kneeCop = new THREE.Mesh(kneeCopGeo, this.armorMat);
      kneeCop.position.set(0, -0.02, 0.062);
      shinGroup.add(kneeCop);
      this.thirdPersonOnlyMeshes.push(kneeCop);

      // Foot & Ancient Warrior Paduka (Laced Sandals)
      const footGroup = new THREE.Group();
      footGroup.position.set(0, -0.44, 0.04);
      shinGroup.add(footGroup);

      if (idx === 0) this.bones.leftFoot = footGroup;
      else this.bones.rightFoot = footGroup;

      const footGeo = new THREE.BoxGeometry(0.082, 0.045, 0.20);
      footGeo.translate(0, 0, 0.03);
      const foot = new THREE.Mesh(footGeo, leatherMat);
      footGroup.add(foot);
      this.thirdPersonOnlyMeshes.push(foot);
    });
  }

  // ===========================================================================
  // CAMERA MODES, CUSTOMIZATION & ARCHERY LOGIC
  // ===========================================================================

  setFirstPersonMode(isFPS) {
    this.thirdPersonOnlyMeshes.forEach(mesh => {
      mesh.visible = !isFPS;
    });

    if (isFPS) {
      // First-person: bring hands forward into sightline
      if (this.bones.leftShoulder) this.bones.leftShoulder.position.set(-0.16, 0.24, 0.14);
      if (this.bones.rightShoulder) this.bones.rightShoulder.position.set(0.16, 0.24, 0.14);
    } else {
      // Third-person: standard broad athletic warrior shoulder stance
      if (this.bones.leftShoulder) this.bones.leftShoulder.position.set(-0.27, 0.24, 0);
      if (this.bones.rightShoulder) this.bones.rightShoulder.position.set(0.27, 0.24, 0);
    }
  }

  setArmorTint(tintKey = 'gold') {
    const tint = ARMOR_TINTS[tintKey] || ARMOR_TINTS.gold;
    if (this.armorMat) {
      this.armorMat.color.setHex(tint.color);
      this.armorMat.metalness = tint.metalness;
      this.armorMat.roughness = tint.roughness;
    }
  }

  setCapeColor(colorKey = 'crimson') {
    const hex = CAPE_COLORS[colorKey] || CAPE_COLORS.crimson;
    if (this.capeMat) {
      this.capeMat.color.setHex(hex);
    }
  }

  equipBow(bowType) {
    if (this.bow && this.bow.mesh.parent) {
      this.bow.mesh.parent.remove(this.bow.mesh);
    }

    this.bowType = bowType;
    this.bow = new Bow(bowType);

    // Securely attach bow to Left Hand palm grip
    if (this.bones.leftHand) {
      this.bones.leftHand.add(this.bow.mesh);
      this.bow.mesh.position.set(0, -0.04, 0.02);
      this.bow.mesh.rotation.set(0, Math.PI / 2, 0);
    }
  }

  setNockedArrow(visible, drawPower = 0) {
    if (!this.nockedArrowMesh) {
      const shaftGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.84, 8);
      shaftGeo.rotateX(Math.PI / 2);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0xC69A5D, roughness: 0.5 });
      this.nockedArrowMesh = new THREE.Mesh(shaftGeo, shaftMat);

      const headGeo = new THREE.ConeGeometry(0.014, 0.09, 8);
      headGeo.rotateX(Math.PI / 2);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.9, roughness: 0.2 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, 0, 0.46);
      this.nockedArrowMesh.add(head);

      if (this.bow) {
        this.bow.mesh.add(this.nockedArrowMesh);
      }
    }

    if (this.nockedArrowMesh) {
      this.nockedArrowMesh.visible = visible;
      if (visible && this.bow) {
        const drawOffset = drawPower * this.bow.maxDrawDistance;
        this.nockedArrowMesh.position.set(0, 0, 0.41 - drawOffset);
      }
    }
  }

  getArrowLaunchOrigin() {
    if (this.bow && this.bones.leftHand) {
      const origin = new THREE.Vector3();
      this.bow.mesh.localToWorld(origin.set(0, 0, 0.32));
      return origin;
    }
    return new THREE.Vector3(0.08, 1.58, 0.4).add(this.mesh.position);
  }

  setAimPitch(pitch) {
    if (this.animator && this.animator.setAimPitch) {
      this.animator.setAimPitch(pitch);
    }
  }

  update(dt) {
    this.animator.update(dt);
  }
}
