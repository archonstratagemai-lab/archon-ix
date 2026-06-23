/**
 * ARCHON-IX | Sovereign Execution Layer
 * --------------------------------------------------------------
 * Single entry point. Imports and orchestrates all feature modules.
 *
 *   import { GhostTracker }      from './ghost-tracker.js';
 *   import { AIReceptionist }    from './ai-receptionist.js';
 *   import { LTVCACCalculator }  from './ltv-cac-calculator.js';
 */

import { GhostTracker }      from './ghost-tracker.js';
import { AIReceptionist }    from './ai-receptionist.js';
import { LTVCACCalculator }  from './ltv-cac-calculator.js';

const ghost       = new GhostTracker();
const aiDesk      = new AIReceptionist({ ghost });
const ltvCacCalc  = new LTVCACCalculator();

document.addEventListener('DOMContentLoaded', () => {
  ghost.init();
  aiDesk.init();
  ltvCacCalc.init();

  initSmoothNavigation();
  initFadeInObserver();
  initDemoAnchor();

  // Surface ghost in dev for the audit-trail demo. Production users
  // never need this handle; gating it to Vite's DEV avoids a silent
  // global mutation in shipped bundles.
  if (import.meta.env?.DEV && typeof window !== 'undefined') {
    window.ARCHON_IX = Object.freeze({ ghost, aiDesk, ltvCacCalc });
  }
});

// -------------------------------------------------------- Nav

function initSmoothNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      ghost.track('nav:scroll', { target: href });
    });
  });
}

// -------------------------------------------------------- Fade-ins

function initFadeInObserver() {
  const targets = document.querySelectorAll('.fade-in');
  if (!('IntersectionObserver' in window) || !targets.length) {
    targets.forEach((el) => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15 });

  targets.forEach((el) => io.observe(el));
}

// -------------------------------------------------------- Demo anchor

function initDemoAnchor() {
  // When the user lands via the "Launch Interactive Demo" CTA we
  // additionally prime the AI receptionist so the chat is already
  // hugging the viewport before they type.
  if (location.hash !== '#demo') return;
  setTimeout(() => {
    ghost.track('demo:landed', { from: location.hash });
  }, 100);
}
