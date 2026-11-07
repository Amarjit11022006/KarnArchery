/**
 * KarnArchery - Three.js Scene & Renderer Manager
 * Configures WebGLRenderer with adaptive quality settings (Low, Medium, High),
 * PCF soft shadows, tone mapping, SRGB color space, and responsive canvas resizing.
 */

import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.quality = 'high';
    
    // WebGL Renderer with graceful fallback
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('High-performance WebGL failed, trying basic WebGL:', e);
      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: false
        });
      } catch (err2) {
        console.error('WebGL is not supported in this browser context:', err2);
        this.renderer = {
          setSize: () => {},
          setPixelRatio: () => {},
          render: () => {},
          shadowMap: { enabled: false }
        };
      }
    }

    if (this.renderer.setSize) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    if (this.renderer.outputColorSpace !== undefined) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    if (this.renderer.toneMapping !== undefined) {
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
    }

    this.setQuality('high');

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', () => setTimeout(this.handleResize, 150));
  }

  setQuality(level = 'high') {
    this.quality = level;

    if (this.renderer && this.renderer.shadowMap) {
      switch (level) {
        case 'low':
          this.renderer.shadowMap.enabled = false;
          if (this.renderer.setPixelRatio) this.renderer.setPixelRatio(1.0);
          break;
        case 'medium':
          this.renderer.shadowMap.enabled = true;
          this.renderer.shadowMap.type = THREE.BasicShadowMap;
          if (this.renderer.setPixelRatio) this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
          break;
        case 'high':
        default:
          this.renderer.shadowMap.enabled = true;
          this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          if (this.renderer.setPixelRatio) this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
          break;
      }
    }

    this.handleResize();
  }

  handleResize() {
    const width = window.innerWidth || 1280;
    const height = window.innerHeight || 720;
    if (this.renderer && this.renderer.setSize) {
      this.renderer.setSize(width, height);
    }
    
    let maxDPR = 2.0;
    if (this.quality === 'medium') maxDPR = 1.25;
    if (this.quality === 'low') maxDPR = 1.0;
    if (this.renderer && this.renderer.setPixelRatio) {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDPR));
    }
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }
}
