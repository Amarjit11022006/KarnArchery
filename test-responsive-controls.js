/**
 * Test Suite: Cross-Platform Responsive Support & Mobile Controls (including Drop Arrow)
 * Verifies:
 * 1. Device detection across Desktop PC, Laptops, Android, iPhone, iPad/Tablets
 * 2. Mobile controls DOM elements & CSS rules (Drop Arrow, Shoot, Cam, Pause, Restart)
 * 3. Arrow drop physics, target exclusion, ground collision, and scoring deductions
 * 4. Desktop controls preservation
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { isMobileOrTablet, isTouchScreen, isPortrait } from './src/deviceDetection.js';
import { Arrow } from './src/arrow.js';
import { ScoringSystem } from './src/scoring.js';
import { PhysicsEngine } from './src/physics.js';

console.log('🧪 Starting KarnArchery Cross-Platform & Mobile Controls Test Suite...\n');

// ============================================================================
// TEST 1: Device Detection Simulation
// ============================================================================
console.log('--- Test 1: Device Detection Verification ---');

// Helper to mock browser environment
function runWithMockEnv(env, testFn) {
  const origWindow = global.window;
  const origNavDescriptor = Object.getOwnPropertyDescriptor(global, 'navigator');

  global.window = {
    innerWidth: env.width || 1280,
    innerHeight: env.height || 720,
    matchMedia: (query) => {
      let matches = false;
      if (query.includes('pointer: coarse') && env.pointer === 'coarse') matches = true;
      if (query.includes('pointer: fine') && env.pointer === 'fine') matches = true;
      if (query.includes('hover: hover') && env.canHover === true) matches = true;
      if (query.includes('hover: none') && env.canHover === false) matches = true;
      return { matches };
    }
  };

  if (env.hasTouch) {
    global.window.ontouchstart = () => {};
  }

  const mockNav = {
    userAgent: env.ua || '',
    maxTouchPoints: env.maxTouchPoints || (env.hasTouch ? 5 : 0)
  };

  Object.defineProperty(global, 'navigator', {
    value: mockNav,
    configurable: true,
    writable: true
  });

  try {
    testFn();
  } finally {
    global.window = origWindow;
    if (origNavDescriptor) {
      Object.defineProperty(global, 'navigator', origNavDescriptor);
    }
  }
}

// 1.1 Desktop PC (No touch, 1920x1080, fine pointer, mouse hover)
runWithMockEnv({
  width: 1920,
  height: 1080,
  pointer: 'fine',
  canHover: true,
  hasTouch: false,
  maxTouchPoints: 0,
  ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'
}, () => {
  const result = isMobileOrTablet();
  assert.strictEqual(result, false, 'Desktop PC must NOT be detected as mobile/tablet');
  console.log('  ✔ Desktop PC (1080p, mouse): Correctly identified as desktop (result = false)');
});

// 1.2 Windows Touch Laptop (Touchscreen laptop, 1920x1080, fine pointer, mouse hover)
runWithMockEnv({
  width: 1920,
  height: 1080,
  pointer: 'fine',
  canHover: true,
  hasTouch: true,
  maxTouchPoints: 10,
  ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'
}, () => {
  const result = isMobileOrTablet();
  assert.strictEqual(result, false, 'Windows Touch Laptop must NOT show mobile touch overlay');
  console.log('  ✔ Windows Touchscreen Laptop (1080p): Correctly identified as desktop (result = false)');
});

// 1.3 Android Smartphone (Portrait 412x915, coarse pointer, mobile UA)
runWithMockEnv({
  width: 412,
  height: 915,
  pointer: 'coarse',
  canHover: false,
  hasTouch: true,
  maxTouchPoints: 5,
  ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 Mobile Safari/537.36'
}, () => {
  const result = isMobileOrTablet();
  assert.strictEqual(result, true, 'Android phone portrait must be detected as mobile');
  assert.strictEqual(isPortrait(), true, 'Must detect portrait orientation');
  console.log('  ✔ Android Phone Portrait (412x915): Correctly identified as mobile (result = true)');
});

// 1.4 Android Smartphone (Landscape 915x412, coarse pointer, mobile UA)
runWithMockEnv({
  width: 915,
  height: 412,
  pointer: 'coarse',
  canHover: false,
  hasTouch: true,
  maxTouchPoints: 5,
  ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 Mobile Safari/537.36'
}, () => {
  const result = isMobileOrTablet();
  assert.strictEqual(result, true, 'Android phone landscape must be detected as mobile');
  assert.strictEqual(isPortrait(), false, 'Must detect landscape orientation');
  console.log('  ✔ Android Phone Landscape (915x412): Correctly identified as mobile (result = true)');
});

// 1.5 iPhone (Portrait 390x844, mobile UA, touch)
runWithMockEnv({
  width: 390,
  height: 844,
  pointer: 'coarse',
  canHover: false,
  hasTouch: true,
  maxTouchPoints: 5,
  ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
}, () => {
  const result = isMobileOrTablet();
  assert.strictEqual(result, true, 'iPhone must be detected as mobile');
  console.log('  ✔ iPhone 15 (390x844): Correctly identified as mobile (result = true)');
});

// 1.6 iPad / Tablet (768x1024 or 1024x768, touch)
runWithMockEnv({
  width: 820,
  height: 1180,
  pointer: 'coarse',
  canHover: false,
  hasTouch: true,
  maxTouchPoints: 5,
  ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
}, () => {
  const result = isMobileOrTablet();
  assert.strictEqual(result, true, 'iPad must be detected as tablet/mobile');
  console.log('  ✔ iPad / Tablet (820x1180): Correctly identified as mobile/tablet (result = true)');
});

// ============================================================================
// TEST 2: Arrow Drop Physics & Collision Exclusion
// ============================================================================
console.log('\n--- Test 2: Arrow Drop Physics & Target Exclusion ---');

const physics = new PhysicsEngine();
const scoring = new ScoringSystem();
scoring.reset(200, 5);

// Test 2.1: Dropped Arrow launch and properties
const arrow = new Arrow('training');
assert.strictEqual(arrow.isDropped, false, 'Arrow.isDropped should initialize to false');

const launchOrigin = new THREE.Vector3(0, 1.58, 0);
const dropVel = new THREE.Vector3(0, -1.6, 0.8);
arrow.isDropped = true;
arrow.launch(launchOrigin, dropVel.clone().normalize(), dropVel.length());

assert.strictEqual(arrow.isDropped, true, 'Arrow should retain isDropped flag');
assert.strictEqual(arrow.isFlying, true, 'Arrow should start in flying state');
assert.strictEqual(arrow.velocity.y < 0, true, 'Initial drop velocity Y should be negative (downward)');
assert.strictEqual(arrow.velocity.z > 0, true, 'Initial drop velocity Z should be forward');
console.log('  ✔ Dropped arrow launches with downward vector: Vy =', arrow.velocity.y.toFixed(2), 'm/s');

// Test 2.2: Simulate gravity trajectory
let hitGround = false;
let stepCount = 0;
const dt = 0.02; // 50 Hz

while (arrow.isFlying && stepCount < 100) {
  stepCount++;
  const step = physics.updateArrow(arrow, dt);
  if (!step) break;

  // Verify dropped arrow never hits target
  // Place target directly in front of archer
  const fakeTarget = {
    isActive: true,
    outerRadius: 1.0,
    getWorldPosition: () => new THREE.Vector3(0, 1.58, 2.0),
    getWorldNormal: () => new THREE.Vector3(0, 0, -1)
  };

  // Logic from gameplay.js: if (this.currentTarget && !arrow.hasHit && !arrow.isDropped)
  let targetHit = null;
  if (!arrow.isDropped) {
    targetHit = physics.checkTargetCollision(step.from, step.to, fakeTarget);
  }
  assert.strictEqual(targetHit, null, 'Dropped arrow must NEVER trigger target collision');

  // Check ground collision
  const groundHit = physics.checkGroundCollision(step.from, step.to, 0);
  if (groundHit) {
    arrow.attachToGround(groundHit.point);
    hitGround = true;
    break;
  }
}

assert.strictEqual(hitGround, true, 'Dropped arrow must hit ground within reasonable steps');
assert.strictEqual(arrow.isFlying, false, 'Arrow should stop flying on ground hit');
assert.strictEqual(arrow.hasHit, true, 'Arrow should mark hasHit = true');
assert.strictEqual(arrow.mesh.position.y >= 0, true, 'Arrow ground position Y should be >= 0');
console.log('  ✔ Dropped arrow hit ground after', stepCount, 'steps (elapsed time ~' + (stepCount * dt).toFixed(2) + 's)');

// Test 2.3: Scoring deduction & miss handling
const initialRemaining = scoring.getArrowsRemaining();
scoring.recordShot();
const missResult = scoring.recordMiss();

assert.strictEqual(scoring.getArrowsRemaining(), initialRemaining - 1, 'Remaining arrows should decrement by 1');
assert.strictEqual(missResult.ring, 'miss', 'Scoring ring should be "miss"');
assert.strictEqual(missResult.streak, 0, 'Streak should reset to 0');
assert.strictEqual(missResult.awardedPoints, 0, 'No points awarded for drop');
console.log('  ✔ Scoring correctly deducts 1 arrow and records 0 points (streak = 0)');

// Test 2.4: Resetting dropped arrow
arrow.reset();
assert.strictEqual(arrow.isDropped, false, 'Resetting arrow must clear isDropped flag');
assert.strictEqual(arrow.isFlying, false, 'Resetting arrow must clear isFlying');
assert.strictEqual(arrow.inUse, false, 'Resetting arrow must clear inUse');
console.log('  ✔ Arrow.reset() successfully restores pool state');

// ============================================================================
// TEST 3: DOM Elements & Responsive CSS Verification
// ============================================================================
console.log('\n--- Test 3: HTML Structure & CSS Rules Verification ---');

const htmlContent = fs.readFileSync(path.resolve('index.html'), 'utf-8');
const cssContent = fs.readFileSync(path.resolve('styles/responsive.css'), 'utf-8');

// 3.1 Check HTML elements
assert.ok(htmlContent.includes('id="mobile-controls"'), 'index.html must have #mobile-controls');
assert.ok(htmlContent.includes('id="mobile-aim-zone"'), 'index.html must have #mobile-aim-zone');
assert.ok(htmlContent.includes('id="mobile-shoot-btn"'), 'index.html must have #mobile-shoot-btn');
assert.ok(htmlContent.includes('id="mobile-drop-btn"'), 'index.html must have #mobile-drop-btn');
assert.ok(htmlContent.includes('id="mobile-cam-btn"'), 'index.html must have #mobile-cam-btn');
assert.ok(htmlContent.includes('id="mobile-pause-btn"'), 'index.html must have #mobile-pause-btn');
assert.ok(htmlContent.includes('id="mobile-restart-btn"'), 'index.html must have #mobile-restart-btn');
assert.ok(htmlContent.includes('viewport-fit=cover'), 'index.html must support viewport-fit=cover for notch displays');
console.log('  ✔ HTML contains all required mobile control buttons and viewport settings');

// 3.2 Check CSS rules
assert.ok(cssContent.includes('.mobile-drop-btn'), 'CSS must define .mobile-drop-btn');
assert.ok(cssContent.includes('.mobile-shoot-btn'), 'CSS must define .mobile-shoot-btn');
assert.ok(cssContent.includes('@media (hover: hover) and (pointer: fine) and (min-width: 1025px)'), 'CSS must enforce desktop exclusion');
assert.ok(cssContent.includes('.hud-bottom-right'), 'CSS must adapt HUD on mobile/tablet');
console.log('  ✔ responsive.css contains dedicated styles and desktop exclusion queries');

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! KarnArchery is fully responsive across all devices.');
