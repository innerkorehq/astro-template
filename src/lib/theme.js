// Vanilla JS theme management — no external signals library required.

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try { localStorage.setItem('theme', theme); } catch (_) {}
}

export function initTheme() {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('theme');
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(stored || preferred);
}

export function toggleTheme() {
  if (typeof window === 'undefined') return;
  applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
}

export function getTheme() {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
