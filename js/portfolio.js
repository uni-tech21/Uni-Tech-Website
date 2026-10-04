'use strict';
(async () => {
  const track = document.getElementById('project-track');
  if (!track) return;
  let originals = [...track.querySelectorAll('.project-slide')];
  let initial = Math.min(1, originals.length - 1);
  if (window.UniTechPortfolio) {
    try {
      const projects = await window.UniTechPortfolio.load();
      originals = projects.map(window.UniTechPortfolio.createSlide);
      initial = Math.max(0, projects.findIndex(project => project.initial));
    } catch {
      // The existing HTML links still work if the editable list cannot load.
    }
  }
  const count = originals.length;
  if (!count) return;
  const prev = document.getElementById('project-prev');
  const next = document.getElementById('project-next');
  const status = document.getElementById('project-position');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const looping = count > 1;
  const firstOriginal = looping ? count : 0;
  const logical = physical => ((physical % count) + count) % count;

  function copy(card) {
    const clone = card.cloneNode(true);
    clone.dataset.loopCopy = 'true';
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    const image = clone.querySelector('img');
    if (image) {
      image.loading = 'lazy';
      image.removeAttribute('fetchpriority');
    }
    return clone;
  }

  originals.forEach((card, index) => {
    card.dataset.projectIndex = String(index);
    card.removeAttribute('aria-hidden');
    card.tabIndex = 0;
  });
  // Copies supply neighbours across each end. Only the original links join
  // the tab order and accessibility tree.
  track.replaceChildren(...(looping ? [...originals.map(copy), ...originals, ...originals.map(copy)] : originals));
  track.dataset.projectCount = String(count);
  const cards = [...track.querySelectorAll('.project-slide')];
  let active = firstOriginal + initial;
  let requested = active;
  let navigating = false;
  let restoringFocus = false;
  let frame;
  let settledTimer;
  let lastWidth = track.clientWidth;
  const centre = card => card.getBoundingClientRect().left + card.clientWidth / 2;
  const middle = () => track.getBoundingClientRect().left + track.clientWidth / 2;

  function nearest() {
    const mid = middle();
    return cards.reduce((best, card, index) => Math.abs(centre(card) - mid) < Math.abs(centre(cards[best]) - mid) ? index : best, 0);
  }

  function update() {
    active = nearest();
    const mid = middle();
    cards.forEach((card, index) => {
      const distance = Math.max(-1, Math.min(1, (centre(card) - mid) / card.clientWidth));
      card.style.setProperty('--card-angle', `${distance * 4}deg`);
      card.style.setProperty('--card-drop', `${Math.abs(distance) * 52}px`);
      card.style.setProperty('--card-scale', String(1 - Math.abs(distance) * .05));
      card.classList.toggle('is-current', index === active);
    });
    prev.disabled = next.disabled = !looping;
    const text = `${logical(active) + 1} / ${count}`;
    if (status.textContent !== text) status.textContent = text;
  }

  function position(index, behavior = 'instant') {
    const left = track.scrollLeft + centre(cards[index]) - middle();
    track.scrollTo({left, behavior});
  }

  function settle() {
    clearTimeout(settledTimer);
    update();
    // Move to the identical middle copy after scrolling stops. The image and
    // its neighbours retain exactly the same visible positions.
    const target = firstOriginal + logical(active);
    if (active !== target) {
      const shift = centre(cards[target]) - centre(cards[active]);
      track.scrollTo({left: track.scrollLeft + shift, behavior: 'instant'});
    }
    update();
    requested = active;
    navigating = false;
  }

  function go(index) {
    requested = index;
    navigating = true;
    const distance = Math.abs(centre(cards[index]) - middle());
    position(index, reduced.matches ? 'instant' : 'smooth');
    if (reduced.matches || distance < 1) settle();
  }

  function chooseCopy(projectIndex, direction = 0) {
    const current = nearest();
    const choices = looping ? [projectIndex, projectIndex + count, projectIndex + count * 2] : [projectIndex];
    const directed = choices.filter(index => direction > 0 ? index > current : direction < 0 ? index < current : true);
    return (directed.length ? directed : choices).reduce((best, index) => Math.abs(index - current) < Math.abs(best - current) ? index : best);
  }

  function step(direction) {
    const from = navigating ? requested : nearest();
    let target = from + direction;
    if (target < 0 || target >= cards.length) target = chooseCopy(logical(target), direction);
    go(target);
    return logical(target);
  }

  prev.addEventListener('click', () => { if (looping) step(-1); });
  next.addEventListener('click', () => { if (looping) step(1); });
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
    clearTimeout(settledTimer);
    settledTimer = setTimeout(settle, 160);
  }, {passive: true});
  track.addEventListener('scrollend', settle);
  const manualScroll = () => { navigating = false; requested = nearest(); };
  track.addEventListener('pointerdown', manualScroll, {passive: true});
  track.addEventListener('wheel', manualScroll, {passive: true});
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    let index;
    if (event.key === 'Home' || event.key === 'End') {
      index = event.key === 'Home' ? 0 : count - 1;
      go(chooseCopy(index));
    } else if (looping) index = step(event.key === 'ArrowRight' ? 1 : -1);
    else index = 0;
    if (event.target.closest('.project-slide')) {
      restoringFocus = true;
      originals[index].focus({preventScroll: true});
      restoringFocus = false;
    }
  });
  originals.forEach((card, index) => card.addEventListener('focus', () => {
    if (!restoringFocus) go(firstOriginal + index);
  }));
  new ResizeObserver(() => {
    if (Math.abs(lastWidth - track.clientWidth) < 1) return;
    lastWidth = track.clientWidth;
    const index = logical(navigating ? requested : active);
    position(firstOriginal + index);
    settle();
  }).observe(track);
  reduced.addEventListener('change', () => {
    if (reduced.matches && navigating) { position(requested); settle(); }
  });
  position(firstOriginal + initial);
  update();
  track.dataset.ready = 'true';
})();
