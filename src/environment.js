/**
 * KarnArchery - 3D Environment Engine
 * Mahabharata-inspired royal training grounds, ancient Indian stone architecture,
 * Gurukul pavilions, fire bowls, mountain ranges, day/night lighting, and atmospheric particles.
 */

import * as THREE from 'three';

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.lights = {
      ambient: null,
      sun: null,
      hemi: null,
      torches: []
    };
    
    this.environmentGroup = new THREE.Group();
    this.environmentGroup.name = 'EnvironmentGroup';
    this.scene.add(this.environmentGroup);

    this.particles = null;
    this.particlePositions = null;
    this.animatedBanners = [];
    this.animatedFireBowls = [];

    this.currentLighting = 'sunset';

    this.setupLighting();
    this.setupSkyAndFog();
    this.buildTerrain();
    this.buildArchitecture();
    this.buildVegetation();
    this.buildAtmosphericParticles();
  }

  setupLighting() {
    // Hemisphere Light (Sky & Ground bounce)
    this.lights.hemi = new THREE.HemisphereLight(0xFFE4B5, 0x1A2536, 0.6);
    this.scene.add(this.lights.hemi);

    // Ambient Fill
    this.lights.ambient = new THREE.AmbientLight(0x2A3B4D, 0.4);
    this.scene.add(this.lights.ambient);

    // Directional Sunlight (Casts crisp shadows)
    this.lights.sun = new THREE.DirectionalLight(0xFFD868, 1.4);
    this.lights.sun.position.set(40, 60, -40);
    this.lights.sun.castShadow = true;
    
    // Shadow map configuration
    this.lights.sun.shadow.mapSize.width = 2048;
    this.lights.sun.shadow.mapSize.height = 2048;
    this.lights.sun.shadow.camera.near = 1;
    this.lights.sun.shadow.camera.far = 180;
    const shadowD = 55;
    this.lights.sun.shadow.camera.left = -shadowD;
    this.lights.sun.shadow.camera.right = shadowD;
    this.lights.sun.shadow.camera.top = shadowD;
    this.lights.sun.shadow.camera.bottom = -shadowD;
    this.lights.sun.shadow.bias = -0.0005;

    this.scene.add(this.lights.sun);
  }

  setQuality(level = 'high') {
    if (this.lights.sun) {
      this.lights.sun.castShadow = (level !== 'low');
      if (this.lights.sun.shadow && this.lights.sun.shadow.map) {
        this.lights.sun.shadow.map.dispose();
        this.lights.sun.shadow.map = null;
      }
      if (level === 'medium') {
        this.lights.sun.shadow.mapSize.width = 1024;
        this.lights.sun.shadow.mapSize.height = 1024;
      } else if (level === 'high') {
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
      }
    }
    this.lights.torches.forEach((torch, i) => {
      torch.castShadow = (level === 'high' && i === 0);
    });
  }

  setupSkyAndFog() {
    // Clear sightline to archery targets (0m - 75m has zero fog) with atmospheric haze beyond 80m
    this.scene.fog = new THREE.Fog(0x1B161D, 80, 240);
  }

  setLightingMode(mode = 'sunset') {
    this.currentLighting = mode;
    if (this.lights.ambient) this.lights.ambient.intensity = 0.65;
    
    switch (mode) {
      case 'morning':
        this.lights.sun.color.setHex(0xFFE8C8);
        this.lights.sun.intensity = 1.6;
        this.lights.sun.position.set(-50, 45, -30);
        this.lights.hemi.color.setHex(0xFFF8E7);
        this.lights.hemi.groundColor.setHex(0x3E2B20);
        this.scene.fog.color.setHex(0xE0D4C3);
        this.scene.fog.near = 80;
        this.scene.fog.far = 240;
        this.scene.background = new THREE.Color(0xD9C6B0);
        break;

      case 'afternoon':
        this.lights.sun.color.setHex(0xFFFFF0);
        this.lights.sun.intensity = 1.8;
        this.lights.sun.position.set(20, 85, 10);
        this.lights.hemi.color.setHex(0xFFFDE8);
        this.lights.hemi.groundColor.setHex(0x4A3728);
        this.scene.fog.color.setHex(0xBFD8D5);
        this.scene.fog.near = 80;
        this.scene.fog.far = 240;
        this.scene.background = new THREE.Color(0xA5C9D7);
        break;

      case 'sunset':
        this.lights.sun.color.setHex(0xFFC04D);
        this.lights.sun.intensity = 1.7;
        this.lights.sun.position.set(45, 30, -55);
        this.lights.hemi.color.setHex(0xFFB74D);
        this.lights.hemi.groundColor.setHex(0x2E1F16);
        this.scene.fog.color.setHex(0x4A222F);
        this.scene.fog.near = 80;
        this.scene.fog.far = 240;
        this.scene.background = new THREE.Color(0x4A1E2B);
        break;

      case 'night':
        this.lights.sun.color.setHex(0x7986CB);
        this.lights.sun.intensity = 0.55;
        this.lights.sun.position.set(-20, 50, -30);
        this.lights.hemi.color.setHex(0x303F9F);
        this.lights.hemi.groundColor.setHex(0x121724);
        this.scene.fog.color.setHex(0x0C1220);
        this.scene.fog.near = 80;
        this.scene.fog.far = 240;
        this.scene.background = new THREE.Color(0x05080D);
        break;
    }
  }

  buildTerrain() {
    // Ground Plane: Sandy ancient Indian earth & training courtyard
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);

    // Subtle height displacement on edges
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > 25) {
        pos.setY(i, (Math.sin(x * 0.2) + Math.cos(z * 0.2)) * 0.6);
      }
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x8C6B4B, // Warm Sand / Earth
      roughness: 0.85,
      metalness: 0.05
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.environmentGroup.add(ground);

    // Royal Courtyard Flagstone Shooting Platform (where archer stands)
    const platformGeo = new THREE.BoxGeometry(10, 0.2, 10);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xC69A5D, // Polished sandstone
      roughness: 0.6,
      metalness: 0.1
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, 0.08, 0);
    platform.receiveShadow = true;
    platform.castShadow = true;
    this.environmentGroup.add(platform);

    // Decorative Sandstone Edge Steps
    const stepGeo = new THREE.BoxGeometry(10.6, 0.1, 10.6);
    const step = new THREE.Mesh(stepGeo, platformMat);
    step.position.set(0, 0.04, 0);
    step.receiveShadow = true;
    this.environmentGroup.add(step);

    // Distant Himalayan Mountain Silhouettes
    this.buildMountains();

    // Sacred Lotus Water Pool (Reflection pond for Matsya Vedha)
    const waterGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.2, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0A2B3E,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const waterPool = new THREE.Mesh(waterGeo, waterMat);
    waterPool.position.set(0, 0.12, 12);
    this.environmentGroup.add(waterPool);

    // Stone rim around water pool
    const rimGeo = new THREE.TorusGeometry(4.55, 0.18, 8, 32);
    rimGeo.rotateX(Math.PI / 2);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6E5D4F, roughness: 0.7 });
    const poolRim = new THREE.Mesh(rimGeo, stoneMat);
    poolRim.position.set(0, 0.14, 12);
    this.environmentGroup.add(poolRim);
  }

  buildMountains() {
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x2A1B28,
      roughness: 0.95
    });

    // Enclosing mountain peaks in background (Z > 50 and sides)
    const peakConfigs = [
      { x: -50, z: 90, r: 28, h: 42 },
      { x: 0, z: 110, r: 35, h: 55 },
      { x: 45, z: 95, r: 26, h: 38 },
      { x: -70, z: 50, r: 24, h: 32 },
      { x: 70, z: 45, r: 25, h: 34 }
    ];

    peakConfigs.forEach(cfg => {
      const coneGeo = new THREE.ConeGeometry(cfg.r, cfg.h, 7);
      const peak = new THREE.Mesh(coneGeo, mountainMat);
      peak.position.set(cfg.x, cfg.h * 0.5 - 2, cfg.z);
      this.environmentGroup.add(peak);
    });
  }

  buildArchitecture() {
    const sandstoneMat = new THREE.MeshStandardMaterial({
      color: 0xB58750, // Ancient carved Indian sandstone
      roughness: 0.75,
      metalness: 0.1
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xF5B942,
      metalness: 0.8,
      roughness: 0.25
    });

    // Grand Stone Pillars with Lotus Capitals flanking the archery range
    const pillarPositions = [
      [-6, 0, 5], [6, 0, 5],
      [-7, 0, 18], [7, 0, 18],
      [-8, 0, 32], [8, 0, 32],
      [-9, 0, 50], [9, 0, 50]
    ];

    pillarPositions.forEach(p => {
      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(p[0], 0, p[2]);

      // Base pedestal
      const baseGeo = new THREE.BoxGeometry(1.2, 0.8, 1.2);
      const base = new THREE.Mesh(baseGeo, sandstoneMat);
      base.position.y = 0.4;
      base.castShadow = true;
      base.receiveShadow = true;
      pillarGroup.add(base);

      // Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.38, 0.44, 5.5, 12);
      shaftGeo.translate(0, 3.55, 0);
      const shaft = new THREE.Mesh(shaftGeo, sandstoneMat);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      pillarGroup.add(shaft);

      // Lotus Capital on top
      const capGeo = new THREE.CylinderGeometry(0.7, 0.4, 0.6, 12);
      capGeo.translate(0, 6.55, 0);
      const capital = new THREE.Mesh(capGeo, sandstoneMat);
      pillarGroup.add(capital);

      // Gold dome finial (Kalasha)
      const kalashaGeo = new THREE.SphereGeometry(0.3, 12, 12);
      const kalasha = new THREE.Mesh(kalashaGeo, goldMat);
      kalasha.position.y = 7.0;
      pillarGroup.add(kalasha);

      this.environmentGroup.add(pillarGroup);
    });

    // Royal Flags & Banners with Sun Emblems
    const bannerPositions = [
      [-5.5, 5.2, 5], [5.5, 5.2, 5],
      [-7.5, 5.2, 32], [7.5, 5.2, 32]
    ];

    bannerPositions.forEach(pos => {
      const bannerGroup = new THREE.Group();
      bannerGroup.position.set(pos[0], pos[1], pos[2]);

      // Flagpole
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 8);
      poleGeo.translate(0, 1.75, 0);
      const pole = new THREE.Mesh(poleGeo, goldMat);
      bannerGroup.add(pole);

      // Crimson cloth banner
      const clothGeo = new THREE.PlaneGeometry(1.2, 2.0, 4, 6);
      clothGeo.translate(0.6, 1.5, 0);
      const clothMat = new THREE.MeshStandardMaterial({
        color: 0xA51F2B,
        roughness: 0.6,
        side: THREE.DoubleSide
      });
      const cloth = new THREE.Mesh(clothGeo, clothMat);
      bannerGroup.add(cloth);

      this.animatedBanners.push(cloth);
      this.environmentGroup.add(bannerGroup);
    });

    // Fire Bowls / Braziers (illuminating training ground and night mode)
    const firePositions = [
      [-4.2, 0, 2], [4.2, 0, 2],
      [-5.5, 0, 15], [5.5, 0, 15],
      [-6.5, 0, 30], [6.5, 0, 30]
    ];

    firePositions.forEach((pos, i) => {
      const bowlGroup = new THREE.Group();
      bowlGroup.position.set(pos[0], 0, pos[2]);

      // Stone plinth
      const plinthGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.9, 8);
      plinthGeo.translate(0, 0.45, 0);
      const plinth = new THREE.Mesh(plinthGeo, sandstoneMat);
      bowlGroup.add(plinth);

      // Bronze fire bowl
      const bowlGeo = new THREE.SphereGeometry(0.45, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      bowlGeo.rotateX(Math.PI);
      const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x8C5E35, metalness: 0.8, roughness: 0.3 });
      const bowl = new THREE.Mesh(bowlGeo, bronzeMat);
      bowl.position.y = 1.1;
      bowlGroup.add(bowl);

      // Flame glow mesh
      const flameGeo = new THREE.ConeGeometry(0.25, 0.6, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xFF7A00, transparent: true, opacity: 0.85 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 1.35;
      bowlGroup.add(flame);

      // Torch PointLight
      const torchLight = new THREE.PointLight(0xF5B942, 1.5, 12, 1.2);
      torchLight.position.set(0, 1.4, 0);
      torchLight.castShadow = (i < 2); // only shadow on nearest 2 for performance
      bowlGroup.add(torchLight);

      this.lights.torches.push(torchLight);
      this.animatedFireBowls.push(flame);
      this.environmentGroup.add(bowlGroup);
    });

    // Weapon Stands with Ancient Spears and Bows
    [-4.5, 4.5].forEach(x => {
      const rackGroup = new THREE.Group();
      rackGroup.position.set(x, 0, -2);
      rackGroup.rotation.y = x > 0 ? -0.4 : 0.4;

      const rackGeo = new THREE.BoxGeometry(0.1, 1.4, 1.6);
      const rackMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.8 });
      const rack = new THREE.Mesh(rackGeo, rackMat);
      rack.position.y = 0.7;
      rackGroup.add(rack);

      // Spear props resting in rack
      for (let s = -0.5; s <= 0.5; s += 0.35) {
        const spearGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.2, 6);
        const spear = new THREE.Mesh(spearGeo, goldMat);
        spear.position.set(0, 1.1, s);
        spear.rotation.x = 0.15;
        rackGroup.add(spear);
      }

      this.environmentGroup.add(rackGroup);
    });
  }

  buildVegetation() {
    // Trees (Ancient Sal and Banyan trees along the perimeter)
    const treePositions = [
      [-16, 0, 10], [-18, 0, 28], [-22, 0, 48],
      [16, 0, 12], [19, 0, 32], [23, 0, 52],
      [-12, 0, -15], [14, 0, -18]
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2E5A27, roughness: 0.7 });

    treePositions.forEach(p => {
      const tree = new THREE.Group();
      tree.position.set(p[0], 0, p[2]);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.4, 0.7, 5, 8);
      trunkGeo.translate(0, 2.5, 0);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.castShadow = true;
      tree.add(trunk);

      // Foliage canopy (clustered spheres)
      for (let c = 0; c < 3; c++) {
        const leafGeo = new THREE.SphereGeometry(2.2 - c * 0.4, 8, 8);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(
          (Math.random() - 0.5) * 1.2,
          4.5 + c * 1.5,
          (Math.random() - 0.5) * 1.2
        );
        leaf.castShadow = true;
        tree.add(leaf);
      }

      this.environmentGroup.add(tree);
    });
  }

  buildAtmosphericParticles() {
    // Floating Golden Sun Motes / Warm Embers
    const particleCount = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = Math.random() * 14 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 80;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xF5B942,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geo, mat);
    this.particlePositions = positions;
    this.scene.add(this.particles);
  }

  update(dt, windSpeed = 2.0) {
    // Animate banner cloth sway
    const time = performance.now() * 0.003;
    this.animatedBanners.forEach((cloth, idx) => {
      cloth.rotation.y = Math.sin(time * 2.5 + idx) * (0.15 + windSpeed * 0.02);
    });

    // Animate fire bowl flame flicker and point light intensity
    this.animatedFireBowls.forEach((flame, idx) => {
      const flicker = Math.sin(time * 8 + idx * 2) * 0.15;
      flame.scale.set(1 + flicker, 1 + flicker * 1.5, 1 + flicker);
      if (this.lights.torches[idx]) {
        this.lights.torches[idx].intensity = 1.3 + flicker * 0.6;
      }
    });

    // Animate atmospheric sun motes
    if (this.particles && this.particlePositions) {
      const pos = this.particles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - dt * 0.3;
        let x = pos.getX(i) + dt * (windSpeed * 0.2);
        if (y < 0.2) y = 14;
        if (x > 35) x = -35;
        pos.setY(i, y);
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }
  }
}

