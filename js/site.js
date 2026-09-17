'use strict';
document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu(restoreFocus = false) {
  if (!menu || !nav) return;
  nav.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
  if (restoreFocus) menu.focus();
}
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav?.classList.contains('is-open')) closeMenu(true); });
window.matchMedia('(min-width: 801px)').addEventListener('change', () => closeMenu());
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

const recommendations = {
  repairs: ['Let’s get your computer back on track.', 'From slow startups to unexpected crashes, we’ll investigate the problem and explain your repair or upgrade options.', 'Talk to us about repairs'],
  websites: ['Give your business a better first hello.', 'Tell us about your business and what you want your website to do. We can discuss a new build or improvements to your existing site.', 'Tell us about your website'],
  recovery: ['Let’s look at your recovery options.', 'Avoid using the affected drive or saving new files to it. Tell us what happened so we can discuss possible next steps. Recovery is not always possible.', 'Ask about data recovery'],
  security: ['Get some clarity on that suspicious behaviour.', 'Tell us about the pop-ups, messages or unexpected changes you’ve noticed. We can investigate malware and help you with safer setup.', 'Ask about security help'],
  support: ['Let’s get everything working together.', 'New device, tricky printer or unreliable Wi-Fi? Tell us what you’re trying to connect and where you’re getting stuck.', 'Get help setting up'],
  tutoring: ['A little confidence goes a long way.', 'Learn at your own pace, with patient one-to-one help tailored to your device, your questions and the skills you want to build.', 'Ask about one-to-one tutoring']
};
document.querySelectorAll('[data-need]').forEach(button => button.addEventListener('click', () => {
  const data = recommendations[button.dataset.need];
  document.querySelectorAll('[data-need]').forEach(el => { el.classList.toggle('active', el === button); el.setAttribute('aria-pressed', String(el === button)); });
  document.querySelector('#finder-title').textContent = data[0];
  document.querySelector('#finder-description').textContent = data[1];
  const link = document.querySelector('#finder-link');
  link.href = `contact.html?service=${button.dataset.need}`;
  link.replaceChildren(document.createTextNode(data[2] + ' '));
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↗'; link.append(arrow);
}));
document.querySelectorAll('[data-palette]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.studio').forEach(el => el.dataset.style = button.dataset.palette);
  document.querySelectorAll('[data-palette]').forEach(el => { const active = el.dataset.palette === button.dataset.palette; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
}));
document.querySelectorAll('[data-device]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.playground .studio').forEach(el => el.classList.toggle('is-mobile', button.dataset.device === 'mobile'));
  document.querySelectorAll('[data-device]').forEach(el => { el.classList.toggle('active', el === button); el.setAttribute('aria-pressed', String(el === button)); });
}));
function filterServices(filter) {
  document.querySelectorAll('[data-filter]').forEach(el => { const active = el.dataset.filter === filter; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
  document.querySelectorAll('[data-category]').forEach(el => el.hidden = filter !== 'all' && el.dataset.category !== filter);
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => filterServices(button.dataset.filter)));
window.addEventListener('hashchange', () => {
  if (document.querySelector('.service-directory')) {
    filterServices('all');
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView();
  }
});

const form = document.querySelector('#contact-form');
if (form) {
  const service = new URLSearchParams(location.search).get('service');
  if (Object.hasOwn(recommendations, service)) form.elements.service.value = service;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || form.dataset.sending === 'true') return;
    const button = form.querySelector('[type=submit]');
    const status = document.querySelector('#form-status');
    form.dataset.sending = 'true'; button.disabled = true; button.textContent = 'Sending your enquiry…';
    status.textContent = '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Submission failed');
      window.location.assign('thank-you.html');
    } catch (error) {
      status.textContent = 'We couldn’t confirm your message was sent. Your details are still here. Please try again, or email enquires@uni-tech.co.uk.';
      button.disabled = false; button.textContent = 'Try sending again ↗'; form.dataset.sending = 'false';
    } finally { clearTimeout(timeout); }
  });
}
