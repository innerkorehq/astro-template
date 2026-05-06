import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NOOP = { kill() {} };

function prefersReduced() {
  return typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function fadeInUp(element, options = {}) {
  if (prefersReduced() || !element) return NOOP;
  gsap.set(element, { y: 40, opacity: 0 });
  return ScrollTrigger.create({
    trigger: element, start: options.start || 'top 85%', once: true,
    onEnter: () => gsap.to(element, {
      y: 0, opacity: 1,
      duration: options.duration || 0.8, ease: options.ease || 'power2.out',
    }),
  });
}

export function fadeInLeft(element, options = {}) {
  if (prefersReduced() || !element) return NOOP;
  gsap.set(element, { x: -40, opacity: 0 });
  return ScrollTrigger.create({
    trigger: element, start: options.start || 'top 85%', once: true,
    onEnter: () => gsap.to(element, {
      x: 0, opacity: 1,
      duration: options.duration || 0.8, ease: options.ease || 'power2.out',
    }),
  });
}

export function fadeInRight(element, options = {}) {
  if (prefersReduced() || !element) return NOOP;
  gsap.set(element, { x: 40, opacity: 0 });
  return ScrollTrigger.create({
    trigger: element, start: options.start || 'top 85%', once: true,
    onEnter: () => gsap.to(element, {
      x: 0, opacity: 1,
      duration: options.duration || 0.8, ease: options.ease || 'power2.out',
    }),
  });
}

export function staggerChildren(parent, selector, options = {}) {
  if (prefersReduced() || !parent) return NOOP;
  const children = parent.querySelectorAll(selector);
  if (!children.length) return NOOP;
  gsap.set(children, { y: 30, opacity: 0 });
  return ScrollTrigger.create({
    trigger: parent, start: options.start || 'top 85%', once: true,
    onEnter: () => gsap.to(children, {
      y: 0, opacity: 1,
      duration: options.duration || 0.6, ease: options.ease || 'power2.out',
      stagger: options.stagger || 0.12,
    }),
  });
}

export function scaleIn(element, options = {}) {
  if (prefersReduced() || !element) return NOOP;
  gsap.set(element, { scale: 0.85, opacity: 0 });
  return ScrollTrigger.create({
    trigger: element, start: options.start || 'top 85%', once: true,
    onEnter: () => gsap.to(element, {
      scale: 1, opacity: 1,
      duration: options.duration || 0.7, ease: options.ease || 'back.out(1.4)',
    }),
  });
}

export function counterUp(element, endValue, options = {}) {
  if (prefersReduced() || !element) return NOOP;
  const obj = { val: 0 };
  return ScrollTrigger.create({
    trigger: element, start: options.start || 'top 85%', once: true,
    onEnter: () => gsap.to(obj, {
      val: endValue,
      duration: options.duration || 1.5, ease: options.ease || 'power1.out',
      onUpdate: () => { element.textContent = Math.round(obj.val).toLocaleString(); },
    }),
  });
}

export function parallax(element, speed = 0.5, options = {}) {
  if (prefersReduced() || !element) return NOOP;
  return ScrollTrigger.create({
    trigger: options.trigger || element,
    start: options.start || 'top bottom', end: options.end || 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      gsap.set(element, { y: self.progress * speed * 200, willChange: 'transform' });
    },
  });
}
