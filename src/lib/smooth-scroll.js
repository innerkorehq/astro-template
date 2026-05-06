import Lenis from 'lenis';
import gsap from 'gsap';

export function initSmoothScroll() {
  if (typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (typeof navigator !== 'undefined' && 'ontouchstart' in window &&
      window.innerWidth < 768) return null;

  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function destroyLenis(lenis) {
  if (lenis) lenis.destroy();
}
