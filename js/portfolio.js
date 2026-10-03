'use strict';
(() => {
  const track = document.getElementById('project-track');
  if (!track) return;
  const cards = [...track.querySelectorAll('.project-slide')];
  const prev = document.getElementById('project-prev');
  const next = document.getElementById('project-next');
  const status = document.getElementById('project-position');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let frame;
  const centre = card => card.getBoundingClientRect().left + card.clientWidth / 2;
  function update() {
    const middle = track.getBoundingClientRect().left + track.clientWidth / 2;
    active = cards.reduce((best, card, i) => Math.abs(centre(card) - middle) < Math.abs(centre(cards[best]) - middle) ? i : best, 0);
    cards.forEach((card, index) => {
      const distance = Math.max(-1, Math.min(1, (centre(card) - middle) / card.clientWidth));
      card.style.setProperty('--card-angle', `${distance * 4}deg`);
      card.style.setProperty('--card-drop', `${Math.abs(distance) * 52}px`);
      card.style.setProperty('--card-scale', String(1 - Math.abs(distance) * .05));
      card.classList.toggle('is-current', index === active);
    });
    prev.disabled = active === 0;
    next.disabled = active === cards.length - 1;
    const text = `${active + 1} / ${cards.length}`;
    if (status.textContent !== text) status.textContent = text;
  }
  function go(index) {
    index = Math.max(0, Math.min(index, cards.length - 1));
    const middle = track.getBoundingClientRect().left + track.clientWidth / 2;
    track.scrollTo({left: track.scrollLeft + centre(cards[index]) - middle, behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  prev.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  track.addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }, {passive:true});
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const index = Math.max(0, Math.min(cards.length - 1, event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1)));
    if (event.target.closest('.project-slide')) cards[index].focus({preventScroll:true});
    else go(index);
  });
  // Keep a keyboard-focused link fully visible, including when tabbing backwards.
  cards.forEach((card, index) => card.addEventListener('focus', () => go(index)));
  new ResizeObserver(update).observe(track);
  // Start with the middle project, preserving the three-card composition.
  const middle = track.getBoundingClientRect().left + track.clientWidth / 2;
  track.scrollTo({left: track.scrollLeft + centre(cards[1]) - middle, behavior:'instant'});
  update();
})();
