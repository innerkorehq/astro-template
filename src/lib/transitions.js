export function initTransitions(options = {}) {
  try {
    return import('swup').then(({ default: Swup }) =>
      new Swup({
        animationSelector: '[class*="transition-"]',
        containers: ['#main-content'],
        ...options,
      })
    );
  } catch (err) {
    console.warn('Swup transition init skipped:', err.message);
    return null;
  }
}

export function destroyTransitions(swup) {
  if (swup && typeof swup.destroy === 'function') swup.destroy();
}
