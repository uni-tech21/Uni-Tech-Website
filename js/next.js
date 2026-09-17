'use strict';

// Small enhancements, with all essential content available in the HTML.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('.reading-progress');
  let scrollQueued = false;
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
    scrollQueued = false;
  }
  addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!reducedMotion.matches) entry.target.classList.add('reveal-in');
          reveals.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.section-heading, .service-major, .about-layout, .process-grid, .end-cta').forEach(el => reveals.observe(el));
  }

  const concepts = {
    studio: { brand: 'form & field', tagline: 'Thoughtfully made. Naturally you.', eyebrow: 'INDEPENDENT BY NATURE', lines: ['Room for', 'something', 'remarkable.'], description: ['A fresh perspective.', 'A space to make your own.'], cta: 'Explore the collection ↗', footer: 'Objects with purpose.', detail: 'Designed for everyday living ↗' },
    trades: { brand: 'GROUNDWORK', tagline: 'Good foundations. Great spaces.', eyebrow: 'BUILT ON SOMETHING BETTER', lines: ['Your space.', 'Our craft.', 'Well built.'], description: ['Thoughtful construction.', 'From the ground up.'], cta: 'Explore our approach ↗', footer: 'Craft in every detail.', detail: 'Spaces for the way you live ↗' },
    cafe: { brand: 'slow mornings', tagline: 'A little pause. A lovely coffee.', eyebrow: 'MAKE A MOMENT OF IT', lines: ['Good coffee.', 'Even better', 'company.'], description: ['Take your time.', 'Find your favourite corner.'], cta: 'Meet your morning ↗', footer: 'Stay a little longer.', detail: 'Something good is brewing ↗' }
  };
  document.querySelectorAll('[data-concept]').forEach(button => button.addEventListener('click', () => {
    const concept = concepts[button.dataset.concept];
    if (!concept) return;
    document.querySelectorAll('button[data-concept]').forEach(el => {
      const active = el.dataset.concept === button.dataset.concept;
      el.classList.toggle('active', active);
      el.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.studio').forEach(studio => {
      studio.dataset.concept = button.dataset.concept;
      studio.querySelector('.studio-nav strong').textContent = concept.brand;
      studio.querySelector('.studio-nav>span:nth-child(2)').textContent = concept.tagline;
      studio.querySelector('.studio-eyebrow').textContent = concept.eyebrow;
      const headline = studio.querySelector('.studio-body h3');
      headline.replaceChildren();
      concept.lines.forEach((line, index) => {
        if (index) headline.append(document.createElement('br'));
        if (index === 2) { const emphasis = document.createElement('em'); emphasis.textContent = line; headline.append(emphasis); }
        else headline.append(document.createTextNode(line));
      });
      const description = studio.querySelector('.studio-body p');
      description.replaceChildren(document.createTextNode(concept.description[0]), document.createElement('br'), document.createTextNode(concept.description[1]));
      studio.querySelector('.studio-link').textContent = concept.cta;
      studio.querySelector('.studio-bottom>span:first-child').textContent = concept.footer;
      studio.querySelector('.studio-bottom>span:last-child').textContent = concept.detail;
    });
  }));

  const scene = document.querySelector('.signal-scene');
  if (!scene) return;
  const modes = {
    repair: { label: '01 / REPAIR', title: 'A fresh start for your tech.', href: 'services.html#repairs', hue: 77 },
    create: { label: '02 / CREATE', title: 'Your next big thing, online.', href: 'websites.html', hue: 263 },
    connect: { label: '03 / CONNECT', title: 'Everything, working together.', href: 'services.html#support', hue: 199 }
  };
  let mode = modes.repair;
  document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => {
    mode = modes[button.dataset.scene];
    scene.dataset.mode = button.dataset.scene;
    document.querySelectorAll('[data-scene]').forEach(el => {
      const active = el === button;
      el.classList.toggle('active', active);
      el.setAttribute('aria-pressed', String(active));
    });
    document.querySelector('#scene-index').textContent = mode.label;
    document.querySelector('#scene-title').textContent = mode.title;
    document.querySelector('#scene-link').href = mode.href;
  }));

  // Native SVG circuits stay crisp at any size and remain visible without JavaScript.
  const toggle = document.querySelector('.motion-toggle');
  const stage = document.querySelector('.circuit-stage');
  let paused = reducedMotion.matches;
  let visible = true;
  let frame = 0;
  let targetX = 0, targetY = 0;

  function syncMotion() {
    const running = !paused && visible && !document.hidden;
    scene.dataset.motion = running ? 'running' : 'paused';
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play circuit animation' : 'Pause circuit animation');
    if (!running) {
      cancelAnimationFrame(frame); frame = 0;
      stage.style.setProperty('--tilt-x', '0deg');
      stage.style.setProperty('--tilt-y', '0deg');
    }
  }
  toggle.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncMotion(); }, { rootMargin: '40px' }).observe(scene);
  }
  stage.addEventListener('pointermove', event => {
    if (paused || !visible || event.pointerType === 'touch') return;
    const bounds = stage.getBoundingClientRect();
    targetX = ((event.clientY - bounds.top) / bounds.height - .5) * -5;
    targetY = ((event.clientX - bounds.left) / bounds.width - .5) * 6;
    if (!frame) frame = requestAnimationFrame(() => {
      stage.style.setProperty('--tilt-x', targetX + 'deg');
      stage.style.setProperty('--tilt-y', targetY + 'deg');
      frame = 0;
    });
  }, { passive: true });
  stage.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame); frame = 0;
    stage.style.setProperty('--tilt-x', '0deg');
    stage.style.setProperty('--tilt-y', '0deg');
  });
  syncMotion();
})();
