/**
 * KarnArchery - Cross-Platform Device Detection & Responsive Utilities
 * Accurately detects mobile phones, tablets, laptops, and desktop PCs.
 * Uses pointer types, touch points, hover capabilities, viewport metrics, and userAgent.
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
  return window.innerHeight > window.innerWidth;
}

