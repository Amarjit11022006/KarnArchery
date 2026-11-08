/**
 * KarnArchery - Cross-Platform Device Detection & Responsive Utilities
 * Accurately detects mobile phones, tablets, laptops, and desktop PCs.
 * Supports Capacitor Screen Orientation Plugin (Android APK) and Web APIs.
 */

export function isMobileOrTablet() {
  if (typeof window === 'undefined') return false;

  // 1. Touch capability check
  const hasTouch = (
    ('ontouchstart' in window) ||
    (navigator && navigator.maxTouchPoints > 0) ||
    (navigator && navigator.msMaxTouchPoints > 0)
  );

  // 2. CSS Media Queries for pointer precision and hover capability
  const coarsePointer = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
  const finePointer = window.matchMedia ? window.matchMedia('(pointer: fine)').matches : false;
  const canHover = window.matchMedia ? window.matchMedia('(hover: hover)').matches : false;

  // 3. User agent mobile signature test
  const ua = (navigator && navigator.userAgent) ? navigator.userAgent : '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Silk/i.test(ua);

  // 4. Viewport size
  const width = window.innerWidth || 1280;
  const height = window.innerHeight || 720;
  const isCompactScreen = width <= 1024 || height <= 600;

  // Desktop PC or Laptop condition:
  // If fine pointer + can hover + large screen (> 1024) + not a mobile UA:
  // Strictly treat as Desktop/Laptop (even if touchscreen laptop like Surface/Yoga)
  if (finePointer && canHover && width > 1024 && !isMobileUA) {
    return false;
  }

  // Mobile phone or tablet if mobile UA, coarse pointer, or touch on compact screen
  return isMobileUA || coarsePointer || (hasTouch && isCompactScreen);
}

export function isTouchScreen() {
  if (typeof window === 'undefined') return false;
  return (
    ('ontouchstart' in window) ||
    (navigator && navigator.maxTouchPoints > 0)
  );
}

export function isPortrait() {
  if (typeof window === 'undefined') return false;

  // 1. Screen Orientation API check
  if (window.screen && window.screen.orientation && window.screen.orientation.type) {
    return window.screen.orientation.type.startsWith('portrait');
  }

  // 2. Legacy window.orientation check
  if (typeof window.orientation === 'number') {
    return window.orientation === 0 || window.orientation === 180;
  }

  // 3. Viewport dimension fallback
  const width = window.innerWidth || 1280;
  const height = window.innerHeight || 720;
  return height > width;
}

/**
 * Lock device screen orientation to Landscape mode
 * Supports Capacitor Screen Orientation Plugin (Android APK) and Web APIs
 */
export async function lockToLandscape() {
  if (typeof window === 'undefined') return false;

  // 1. Capacitor Screen Orientation API (Android APK)
  try {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ScreenOrientation) {
      await window.Capacitor.Plugins.ScreenOrientation.lock({ orientation: 'landscape' });
      return true;
    }
  } catch (err) {
    console.debug('Capacitor screen orientation lock failed:', err);
  }

  // 2. Standard Web Screen Orientation API
  try {
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.lock === 'function') {
      await window.screen.orientation.lock('landscape');
      return true;
    } else if (window.screen && typeof window.screen.lockOrientation === 'function') {
      window.screen.lockOrientation('landscape');
      return true;
    } else if (window.screen && typeof window.screen.mozLockOrientation === 'function') {
      window.screen.mozLockOrientation('landscape');
      return true;
    } else if (window.screen && typeof window.screen.msLockOrientation === 'function') {
      window.screen.msLockOrientation('landscape');
      return true;
    }
  } catch (err) {
    console.debug('Web screen orientation lock unsupported or requires fullscreen gesture:', err);
  }

  return false;
}

/**
 * Unlock device screen orientation back to default / user control
 */
export async function unlockOrientation() {
  if (typeof window === 'undefined') return false;

  // 1. Capacitor Screen Orientation API
  try {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ScreenOrientation) {
      await window.Capacitor.Plugins.ScreenOrientation.unlock();
      return true;
    }
  } catch (err) {
    console.debug('Capacitor screen orientation unlock failed:', err);
  }

  // 2. Standard Web Screen Orientation API
  try {
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.unlock === 'function') {
      window.screen.orientation.unlock();
      return true;
    } else if (window.screen && typeof window.screen.unlockOrientation === 'function') {
      window.screen.unlockOrientation();
      return true;
    }
  } catch (err) {}

  return false;
}
