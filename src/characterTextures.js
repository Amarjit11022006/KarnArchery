/**
 * KarnArchery - High-Fidelity Character PBR Texture Generator
 * Generates AAA-grade procedural PBR texture maps (Diffuse, Normal, Roughness, Metalness)
 * for Karna's realistic skin, divine golden Kavach, royal crimson dhoti, eyes, and hair.
 */

import * as THREE from 'three';

// Cache generated textures to avoid redundant canvas rendering
const textureCache = new Map();

function createOffscreenCanvas(width, height) {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  return null;
}

/**
 * 1. Realistic Human Skin PBR Suite
 * Warm Indian warrior bronze skin with pores, muscular shading, and natural tone variance.
 */
export function getSkinTextures() {
  if (textureCache.has('skin_textures')) {
    return textureCache.get('skin_textures');
  }

  const width = 1024;
  const height = 1024;

  // A. Diffuse Map
  const diffCanvas = createOffscreenCanvas(width, height);
  if (diffCanvas) {
    const ctx = diffCanvas.getContext('2d');

    // Base warrior bronze gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0.0, '#C98B54'); // Forehead / upper highlights
    grad.addColorStop(0.3, '#BA7842'); // Cheekbones & nose
    grad.addColorStop(0.6, '#A76735'); // Jaw / neck shadows
    grad.addColorStop(1.0, '#965A2C'); // Torso / muscle depths
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Biological flush & micro-pigmentation
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Add high-frequency skin pores and subtle melanin variance
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      const microPore = Math.random() < 0.08 ? -18 : 0;
      data[i]     = Math.min(255, Math.max(0, data[i] + noise + microPore));     // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.8 + microPore * 0.8)); // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.5 + microPore * 0.5)); // B
    }
    ctx.putImageData(imgData, 0, 0);

    // Subtle muscle contour shading & cheek redness
    ctx.fillStyle = 'rgba(215, 60, 45, 0.06)';
    ctx.beginPath();
    ctx.arc(width * 0.35, height * 0.45, 120, 0, Math.PI * 2);
    ctx.arc(width * 0.65, height * 0.45, 120, 0, Math.PI * 2);
    ctx.fill();
  }

  // B. Normal Map (Tangent Space)
  const normCanvas = createOffscreenCanvas(width, height);
  if (normCanvas) {
    const ctx = normCanvas.getContext('2d');
    // Base normal #8080FF
    ctx.fillStyle = '#8080FF';
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Fine skin pore normal deviations
      const nx = (Math.random() - 0.5) * 14;
      const ny = (Math.random() - 0.5) * 14;
      data[i]     = 128 + nx; // X
      data[i + 1] = 128 + ny; // Y
      data[i + 2] = 255;      // Z
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // C. Roughness Map
  const roughCanvas = createOffscreenCanvas(width, height);
  if (roughCanvas) {
    const ctx = roughCanvas.getContext('2d');
    // Base roughness ~0.55 (140)
    ctx.fillStyle = '#8C8C8C';
    ctx.fillRect(0, 0, width, height);

    // Specular zones on forehead, nose, lips (darker = glossier)
    const specGrad = ctx.createRadialGradient(width * 0.5, height * 0.4, 50, width * 0.5, height * 0.4, 300);
    specGrad.addColorStop(0, '#5A5A5A'); // ~0.35 roughness (oily sheen)
    specGrad.addColorStop(1, '#8C8C8C'); // ~0.55 standard
    ctx.fillStyle = specGrad;
    ctx.fillRect(0, 0, width, height);
  }

  const diffuse = diffCanvas ? new THREE.CanvasTexture(diffCanvas) : null;
  const normal = normCanvas ? new THREE.CanvasTexture(normCanvas) : null;
  const roughness = roughCanvas ? new THREE.CanvasTexture(roughCanvas) : null;

  if (diffuse) diffuse.colorSpace = THREE.SRGBColorSpace;
  if (diffuse) diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;
  if (normal) normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  if (roughness) roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

  const result = { diffuse, normal, roughness };
  textureCache.set('skin_textures', result);
  return result;
}

/**
 * 2. Divine Golden Kavach PBR Suite
 * Rich warm Surya Gold with relief sun mandalas, lotus filigree, and Vedic engravings.
 */
export function getKavachGoldTextures() {
  if (textureCache.has('kavach_gold_textures')) {
    return textureCache.get('kavach_gold_textures');
  }

  const width = 1024;
  const height = 1024;

  // A. Diffuse Map (Golden Sheen with carved bronze shadowing)
  const diffCanvas = createOffscreenCanvas(width, height);
  if (diffCanvas) {
    const ctx = diffCanvas.getContext('2d');

    // Metallic gold radial gradient
    const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.55);
    grad.addColorStop(0.0, '#FFF0A8'); // Lustrous golden highlight
    grad.addColorStop(0.4, '#F5B942'); // Royal Surya gold
    grad.addColorStop(0.8, '#D49525'); // Antique gold
    grad.addColorStop(1.0, '#9E6A14'); // Beveled shadow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Intricate ancient Indian royal filigree and sun mandala engraving
    ctx.strokeStyle = 'rgba(110, 68, 12, 0.45)';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(255, 240, 168, 0.4)';
    ctx.shadowBlur = 2;

    const cx = width * 0.5;
    const cy = height * 0.5;

    // 16 Radiating Sunbeams
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 80, cy + Math.sin(angle) * 80);
      ctx.lineTo(cx + Math.cos(angle) * 360, cy + Math.sin(angle) * 360);
      ctx.stroke();

      // Diamond tips
      ctx.fillStyle = 'rgba(255, 230, 120, 0.5)';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * 380, cy + Math.sin(angle) * 380, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Concentric Vedic beaded borders
    [140, 220, 310, 420].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Beads along circumference
      const count = Math.floor(r * 0.35);
      for (let b = 0; b < count; b++) {
        const ba = (b * Math.PI * 2) / count;
        ctx.fillStyle = '#FFEB99';
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ba) * r, cy + Math.sin(ba) * r, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Outer ornate royal rim band
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#8B5A10';
    ctx.strokeRect(16, 16, width - 32, height - 32);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#FFEAA7';
    ctx.strokeRect(28, 28, width - 56, height - 56);
  }

  // B. Normal Map (Crisp Beveled Relief)
  const normCanvas = createOffscreenCanvas(width, height);
  if (normCanvas) {
    const ctx = normCanvas.getContext('2d');
    ctx.fillStyle = '#8080FF';
    ctx.fillRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.5;

    // Concentric relief rings in normal map
    ctx.lineWidth = 6;
    [140, 220, 310, 420].forEach((r, idx) => {
      ctx.strokeStyle = idx % 2 === 0 ? '#9070FF' : '#7090FF';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Sunbeam normal bevels
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      ctx.strokeStyle = '#8888FF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 80, cy + Math.sin(angle) * 80);
      ctx.lineTo(cx + Math.cos(angle) * 360, cy + Math.sin(angle) * 360);
      ctx.stroke();
    }
  }

  // C. Roughness Map (Polished gold mirror with matte engraved recesses)
  const roughCanvas = createOffscreenCanvas(width, height);
  if (roughCanvas) {
    const ctx = roughCanvas.getContext('2d');
    // Polished gold base ~0.20 (50)
    ctx.fillStyle = '#323232';
    ctx.fillRect(0, 0, width, height);

    // Engraved recesses are rougher ~0.45 (115)
    ctx.strokeStyle = '#737373';
    ctx.lineWidth = 5;
    const cx = width * 0.5;
    const cy = height * 0.5;
    [140, 220, 310, 420].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  const diffuse = diffCanvas ? new THREE.CanvasTexture(diffCanvas) : null;
  const normal = normCanvas ? new THREE.CanvasTexture(normCanvas) : null;
  const roughness = roughCanvas ? new THREE.CanvasTexture(roughCanvas) : null;

  if (diffuse) diffuse.colorSpace = THREE.SRGBColorSpace;
  if (diffuse) diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;
  if (normal) normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  if (roughness) roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

  const result = { diffuse, normal, roughness };
  textureCache.set('kavach_gold_textures', result);
  return result;
}

/**
 * 3. Royal Silk Dhoti PBR Suite
 * Rich crimson royal silk with gold zari border bands and woven fabric normals.
 */
export function getDhotiTextures() {
  if (textureCache.has('dhoti_textures')) {
    return textureCache.get('dhoti_textures');
  }

  const width = 1024;
  const height = 1024;

  // A. Diffuse Map
  const diffCanvas = createOffscreenCanvas(width, height);
  if (diffCanvas) {
    const ctx = diffCanvas.getContext('2d');

    // Deep crimson silk gradient
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0.0, '#7A131A');
    grad.addColorStop(0.3, '#A31D27'); // Silk highlight
    grad.addColorStop(0.7, '#8E1720');
    grad.addColorStop(1.0, '#660F15');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Golden Zari embroidery borders (Top & Bottom)
    [24, height - 74].forEach(y => {
      ctx.fillStyle = '#E5A832';
      ctx.fillRect(0, y, width, 48);

      ctx.fillStyle = '#FFF1C2';
      ctx.fillRect(0, y + 4, width, 4);
      ctx.fillRect(0, y + 40, width, 4);

      // Sacred chevron / lotus repeating embroidery
      ctx.strokeStyle = '#8B5A10';
      ctx.lineWidth = 3;
      for (let x = 0; x < width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, y + 44);
        ctx.lineTo(x + 12, y + 8);
        ctx.lineTo(x + 24, y + 44);
        ctx.stroke();
      }
    });

    // Vertical fabric fold shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    for (let x = 0; x < width; x += 64) {
      ctx.fillRect(x, 0, 18, height);
    }
  }

  // B. Normal Map (Fine Fabric Twill Weave)
  const normCanvas = createOffscreenCanvas(width, height);
  if (normCanvas) {
    const ctx = normCanvas.getContext('2d');
    ctx.fillStyle = '#8080FF';
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        // Fine diagonal twill weave
        const wave = ((x + y) % 4 === 0) ? 12 : -12;
        data[i] = 128 + wave;
        data[i + 1] = 128 - wave;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // C. Roughness Map (Soft silk fabric ~0.72)
  const roughCanvas = createOffscreenCanvas(width, height);
  if (roughCanvas) {
    const ctx = roughCanvas.getContext('2d');
    ctx.fillStyle = '#B8B8B8'; // 0.72
    ctx.fillRect(0, 0, width, height);

    // Gold zari border is smoother ~0.35 (89)
    [24, height - 74].forEach(y => {
      ctx.fillStyle = '#595959';
      ctx.fillRect(0, y, width, 48);
    });
  }

  const diffuse = diffCanvas ? new THREE.CanvasTexture(diffCanvas) : null;
  const normal = normCanvas ? new THREE.CanvasTexture(normCanvas) : null;
  const roughness = roughCanvas ? new THREE.CanvasTexture(roughCanvas) : null;

  if (diffuse) diffuse.colorSpace = THREE.SRGBColorSpace;
  if (diffuse) diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;
  if (normal) normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  if (roughness) roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;

  const result = { diffuse, normal, roughness };
  textureCache.set('dhoti_textures', result);
  return result;
}

/**
 * 4. Realistic Human Eye Texture (Iris, Cornea & Sclera)
 */
export function getEyeTexture() {
  if (textureCache.has('eye_texture')) {
    return textureCache.get('eye_texture');
  }

  const size = 512;
  const canvas = createOffscreenCanvas(size, size);
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const cx = size * 0.5;
    const cy = size * 0.5;

    // Sclera base (natural ivory with micro vascular tint)
    ctx.fillStyle = '#F5F2EB';
    ctx.fillRect(0, 0, size, size);

    // Micro blood vessels in sclera
    ctx.strokeStyle = 'rgba(190, 60, 60, 0.25)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 18; i++) {
      const a = (i * Math.PI * 2) / 18;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 160, cy + Math.sin(a) * 160);
      ctx.quadraticCurveTo(
        cx + Math.cos(a + 0.2) * 200,
        cy + Math.sin(a + 0.2) * 200,
        cx + Math.cos(a) * 240,
        cy + Math.sin(a) * 240
      );
      ctx.stroke();
    }

    // Limbal ring (Dark outline around iris)
    ctx.fillStyle = '#18120B';
    ctx.beginPath();
    ctx.arc(cx, cy, 142, 0, Math.PI * 2);
    ctx.fill();

    // Iris (Deep golden-amber warrior hazel)
    const irisGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 138);
    irisGrad.addColorStop(0.0, '#3E240D'); // Deep collar
    irisGrad.addColorStop(0.4, '#8E5A23'); // Warm amber
    irisGrad.addColorStop(0.8, '#C68A3D'); // Golden hazel
    irisGrad.addColorStop(1.0, '#261608'); // Dark rim
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 138, 0, Math.PI * 2);
    ctx.fill();

    // Radiating iris fibers (Striae)
    ctx.lineWidth = 1;
    for (let s = 0; s < 72; s++) {
      const sa = (s * Math.PI * 2) / 72;
      ctx.strokeStyle = s % 2 === 0 ? 'rgba(255, 215, 120, 0.4)' : 'rgba(50, 30, 10, 0.4)';
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(sa) * 45, cy + Math.sin(sa) * 45);
      ctx.lineTo(cx + Math.cos(sa) * 135, cy + Math.sin(sa) * 135);
      ctx.stroke();
    }

    // Pupil (Pitch black)
    ctx.fillStyle = '#060606';
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fill();

    // Specular corneal reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(cx - 30, cy - 30, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 35, cy - 20, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = canvas ? new THREE.CanvasTexture(canvas) : null;
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  textureCache.set('eye_texture', texture);
  return texture;
}

