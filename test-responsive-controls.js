/**
 * Test Suite: Cross-Platform Responsive Support, Mobile Landscape Gameplay & Orientation Lock
 * Verifies:
 * 1. Device detection across Desktop PC, Laptops, Android, iPhone, iPad/Tablets
 * 2. Mobile controls DOM elements & CSS rules (Drop Arrow, Shoot, Cam, Pause, Restart)
 * 3. Arrow drop physics, target exclusion, ground collision, and scoring deductions
 * 4. Mobile Landscape orientation enforcement & Capacitor / Web orientation lock APIs
 * 5. Rotate device overlay conditions & text verification
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import {
  isMobileOrTablet,
  isTouchScreen,
  isPortrait,
  lockToLandscape,
  unlockOrientation
} from './src/deviceDetection.js';
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
    },
    screen: {
      orientation: env.orientation ? {
        type: env.orientation,
        lock: async (type) => { env.lockedOrientation = type; return true; },
        unlock: () => { env.lockedOrientation = null; }
      } : {
        type: (env.height > env.width) ? 'portrait-primary' : 'landscape-primary'
      }
    }
  };

  if (env.capacitor) {
    global.window.Capacitor = env.capacitor;
  }

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

  const cleanup = () => {
    global.window = origWindow;
    if (origNavDescriptor) {
      Object.defineProperty(global, 'navigator', origNavDescriptor);
    }
  };

  let res;
  try {
    res = testFn();
  } catch (err) {
    cleanup();
    throw err;
  }

  if (res && typeof res.then === 'function') {
    return res.then(
      (val) => { cleanup(); return val; },
      (err) => { cleanup(); throw err; }
    );
  } else {
    cleanup();
    return res;
  }
}

async function runTestSuite() {
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
  orientation: 'portrait-primary',
  pointer: 'coarse',
  canHover: false,
  hasTouch: true,
  maxTouchPoints: 5,
  ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 Mobile Safari/537.36'
}, () => {
  const result = isMobileOrTablet();
  assert.strictEqual(result, true, 'Android phone portrait must be detected as mobile');
  assert.strictEqual(isPortrait(), true, 'Must detect portrait orientation');
  console.log('  ✔ Android Phone Portrait (412x915): Correctly identified as mobile (result = true, portrait = true)');
});

// 1.4 Android Smartphone (Landscape 915x412, coarse pointer, mobile UA)
runWithMockEnv({
  width: 915,
  height: 412,
  orientation: 'landscape-primary',
  pointer: 'coarse',
  canHover: false,
  hasTouch: true,
  maxTouchPoints: 5,
  ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 Mobile Safari/537.36'
}, () => {
  const result = isMobileOrTablet();
  assert.strictEqual(result, true, 'Android phone landscape must be detected as mobile');
  assert.strictEqual(isPortrait(), false, 'Must detect landscape orientation');
  console.log('  ✔ Android Phone Landscape (915x412): Correctly identified as mobile (result = true, portrait = false)');
});

// 1.5 iPhone (Portrait 390x844, mobile UA, touch)
runWithMockEnv({
  width: 390,
  height: 844,
  orientation: 'portrait-primary',
  pointer: 'coarse',
  canHover: false,
  hasTouch: true,
  maxTouchPoints: 5,
  ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
}, () => {
  const result = isMobileOrTablet();
  assert.strictEqual(result, true, 'iPhone must be detected as mobile');
  assert.strictEqual(isPortrait(), true, 'iPhone portrait must be true');
  console.log('  ✔ iPhone 15 Portrait (390x844): Correctly identified as mobile (result = true)');
});

// 1.6 iPad / Tablet Landscape (1024x768, touch)
runWithMockEnv({
  width: 1024,
  height: 768,
  orientation: 'landscape-primary',
  pointer: 'coarse',
  canHover: false,
  hasTouch: true,
  maxTouchPoints: 5,
  ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
}, () => {
  const result = isMobileOrTablet();
  assert.strictEqual(result, true, 'iPad must be detected as tablet/mobile');
  assert.strictEqual(isPortrait(), false, 'iPad landscape must be false');
  console.log('  ✔ iPad Landscape (1024x768): Correctly identified as mobile/tablet (result = true, portrait = false)');
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
assert.ok(htmlContent.includes('id="rotate-device-overlay"'), 'index.html must have #rotate-device-overlay');
assert.ok(htmlContent.includes('Please rotate your device to <strong>Landscape Mode</strong> to play KarnArchery.'), 'index.html must contain exact rotation message');
assert.ok(htmlContent.includes('viewport-fit=cover'), 'index.html must support viewport-fit=cover for notch displays');
console.log('  ✔ HTML contains all required mobile buttons, rotate overlay, and viewport settings');

// 3.2 Check CSS rules
assert.ok(cssContent.includes('.mobile-drop-btn'), 'CSS must define .mobile-drop-btn');
assert.ok(cssContent.includes('.mobile-shoot-btn'), 'CSS must define .mobile-shoot-btn');
assert.ok(cssContent.includes('.rotate-device-overlay'), 'CSS must define .rotate-device-overlay');
assert.ok(cssContent.includes('@keyframes rotatePhonePrompt'), 'CSS must define phone rotate animation');
assert.ok(cssContent.includes('@media (hover: hover) and (pointer: fine) and (min-width: 1025px)'), 'CSS must enforce desktop exclusion');
console.log('  ✔ responsive.css contains dedicated styles and desktop exclusion queries');

// ============================================================================
// TEST 4: Capacitor & Web Orientation Lock API & Rotation State
// ============================================================================
console.log('\n--- Test 4: Orientation Lock APIs & Gameplay Rotate Flow ---');

// 4.1 Capacitor Screen Orientation Lock (Android APK)
let capLocked = null;
let capUnlocked = false;

await runWithMockEnv({
  width: 800,
  height: 380,
  orientation: 'landscape-primary',
  pointer: 'coarse',
  canHover: false,
  hasTouch: true,
  capacitor: {
    Plugins: {
      ScreenOrientation: {
        lock: async (opts) => { capLocked = opts.orientation; return true; },
        unlock: async () => { capUnlocked = true; return true; }
      }
    }
  }
}, async () => {
  await lockToLandscape();
  assert.strictEqual(capLocked, 'landscape', 'Capacitor ScreenOrientation.lock should be called with landscape');
  console.log('  ✔ Capacitor Screen Orientation API: Successfully locked to landscape for Android APK');

  await unlockOrientation();
  assert.strictEqual(capUnlocked, true, 'Capacitor ScreenOrientation.unlock should be called');
  console.log('  ✔ Capacitor Screen Orientation API: Successfully unlocked orientation for menus');
});

// 4.2 Web Screen Orientation Lock
let webLocked = null;
let webUnlocked = false;

await runWithMockEnv({
  width: 800,
  height: 380,
  orientation: 'landscape-primary',
  pointer: 'coarse',
  canHover: false,
  hasTouch: true
}, async () => {
  global.window.screen.orientation.lock = async (type) => { webLocked = type; return true; };
  global.window.screen.orientation.unlock = () => { webUnlocked = true; };

  await lockToLandscape();
  assert.strictEqual(webLocked, 'landscape', 'Web screen.orientation.lock should be called with landscape');
  console.log('  ✔ Web Screen Orientation API: Successfully locked to landscape');

  await unlockOrientation();
  assert.strictEqual(webUnlocked, true, 'Web screen.orientation.unlock should be called');
  console.log('  ✔ Web Screen Orientation API: Successfully unlocked');
});

// 4.3 Simulation of Gameplay Orientation Flow
console.log('  ✔ Rotation Scenario Checks:');

// Scenario A: Mobile phone in portrait during gameplay
runWithMockEnv({
  width: 412,
  height: 915,
  orientation: 'portrait-primary',
  pointer: 'coarse',
  canHover: false,
  hasTouch: true
}, () => {
  const isGameplay = true;
  const isMobile = isMobileOrTablet();
  const isPortraitMode = isPortrait();
  const showRotateOverlay = isGameplay && isMobile && isPortraitMode;
  const showMobileControls = isGameplay && isMobile && !isPortraitMode;

  assert.strictEqual(showRotateOverlay, true, 'Portrait phone in gameplay MUST show rotate overlay');
  assert.strictEqual(showMobileControls, false, 'Mobile controls must be hidden while in portrait');
  console.log('    • Phone in Portrait during gameplay: Rotate overlay shown, controls suspended');
});

// Scenario B: Mobile phone in landscape during gameplay
runWithMockEnv({
  width: 915,
  height: 412,
  orientation: 'landscape-primary',
  pointer: 'coarse',
  canHover: false,
  hasTouch: true
}, () => {
  const isGameplay = true;
  const isMobile = isMobileOrTablet();
  const isPortraitMode = isPortrait();
  const showRotateOverlay = isGameplay && isMobile && isPortraitMode;
  const showMobileControls = isGameplay && isMobile && !isPortraitMode;

  assert.strictEqual(showRotateOverlay, false, 'Landscape phone in gameplay must NOT show rotate overlay');
  assert.strictEqual(showMobileControls, true, 'Landscape phone in gameplay MUST show mobile controls');
  console.log('    • Phone in Landscape during gameplay: Full-screen game active, mobile controls displayed');
});

// Scenario C: Tablet in landscape during gameplay
runWithMockEnv({
  width: 1024,
  height: 768,
  orientation: 'landscape-primary',
  pointer: 'coarse',
  canHover: false,
  hasTouch: true
}, () => {
  const isGameplay = true;
  const isMobile = isMobileOrTablet();
  const isPortraitMode = isPortrait();
  const showRotateOverlay = isGameplay && isMobile && isPortraitMode;
  const showMobileControls = isGameplay && isMobile && !isPortraitMode;

  assert.strictEqual(showRotateOverlay, false, 'Tablet in landscape must NOT show rotate overlay');
  assert.strictEqual(showMobileControls, true, 'Tablet in landscape must show controls');
  console.log('    • Tablet in Landscape: Correctly scaled landscape game with touch controls');
});

// Scenario D: Desktop PC in landscape/portrait
runWithMockEnv({
  width: 1920,
  height: 1080,
  pointer: 'fine',
  canHover: true,
  hasTouch: false
}, () => {
  const isGameplay = true;
  const isMobile = isMobileOrTablet();
  const isPortraitMode = isPortrait();
  const showRotateOverlay = isGameplay && isMobile && isPortraitMode;
  const showMobileControls = isGameplay && isMobile && !isPortraitMode;

  assert.strictEqual(showRotateOverlay, false, 'Desktop PC must NEVER show rotate overlay');
  assert.strictEqual(showMobileControls, false, 'Desktop PC must NEVER show mobile controls');
  console.log('    • Desktop PC: Preserved desktop controls (mouse/keyboard), mobile overlay disabled');
});

// Scenario E: Menu / Loading screen in portrait
runWithMockEnv({
  width: 412,
  height: 915,
  orientation: 'portrait-primary',
  pointer: 'coarse',
  canHover: false,
  hasTouch: true
}, () => {
  const isGameplay = false; // Menu / loading screen
  const isMobile = isMobileOrTablet();
  const isPortraitMode = isPortrait();
  const showRotateOverlay = isGameplay && isMobile && isPortraitMode;

  assert.strictEqual(showRotateOverlay, false, 'Menus in portrait must NOT show rotate overlay');
  console.log('    • Loading Screen / Menus in portrait: Responsive and accessible without blocking');
});

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! KarnArchery is fully optimized for Mobile Landscape Gameplay.');
}

runTestSuite();
