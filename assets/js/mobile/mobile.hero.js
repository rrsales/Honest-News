// assets/js/mobile/mobile.hero.js

document.addEventListener('DOMContentLoaded', () => {
  const hero =
    document.querySelector('.hero') ||
    document.querySelector('.hero-carousel') ||
    document.querySelector('[data-hero]');

  if (!hero) return;

  // live.js already handles bg, text, height based on site-data.json.
  // Here we add mobile-only motion + visibility classes.

  const behavior = hero.getAttribute('data-hero-behavior') || null;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  if (!isMobile) return;

  // Map to CSS helper classes
  if (behavior === 'parallax-slow') {
    hero.classList.add('hero-parallax-slow');
  } else if (behavior === 'parallax-medium') {
    hero.classList.add('hero-parallax-medium');
  } else if (behavior === 'float-up') {
    hero.classList.add('hero-float-up');
    requestAnimationFrame(() => {
      setTimeout(() => {
        hero.classList.add('hn-hero-visible');
      }, 50);
    });
  }

  // OPTIONAL: If you want to derive behavior from site-data.json directly,
  // we can later extend live.js to set data-hero-behavior = page.hero.behavior.
});
