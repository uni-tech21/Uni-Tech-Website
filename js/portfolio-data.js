'use strict';
(() => {
  // Resolve from this script so the registry also works beneath a GitHub Pages repository path.
  const scriptURL = document.currentScript?.src || new URL('js/portfolio-data.js', document.baseURI).href;
  const registryURL = new URL('../portfolio/projects.json', scriptURL);
  const imageTypes = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;
  const reservedIDs = new Set(['top', 'main', 'main-nav', 'portfolio-projects', 'portfolio-title', 'portfolio-contact-title']);
  const cleanText = (value, limit = 1000) => typeof value === 'string' ? value.trim().slice(0, limit) : '';

  function websiteURL(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim());
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !url.hostname) return null;
      return url.href;
    } catch { return null; }
  }

  function imageURL(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim(), registryURL);
      if (url.origin !== registryURL.origin || !['https:', 'http:'].includes(url.protocol) || url.username || url.password || !imageTypes.test(url.pathname)) return null;
      return url.href;
    } catch { return null; }
  }

  function projectID(value, name, index) {
    const supplied = cleanText(value, 64);
    let id = /^[a-z][a-z0-9_-]*$/i.test(supplied) ? supplied.toLowerCase() : name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64);
    if (!id || !/^[a-z]/.test(id)) id = `project-${index + 1}`;
    if (reservedIDs.has(id)) id = `project-${id}`;
    return id;
  }

  function normalizeProject(entry, index = 0) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    const name = cleanText(entry.name, 200);
    const url = websiteURL(entry.url);
    const image = imageURL(entry.image);
    if (!name || !url || !image) return null;
    const dimension = (value, fallback) => Number.isInteger(value) && value > 0 && value <= 20000 ? value : fallback;
    return {
      name,
      id: projectID(entry.id, name, index),
      url,
      image,
      alt: cleanText(entry.alt, 500) || `${name} website preview`,
      width: dimension(entry.width, 1800),
      height: dimension(entry.height, 970),
      category: cleanText(entry.category, 100) || 'WEBSITE PROJECT',
      description: cleanText(entry.description, 1500),
      features: Array.isArray(entry.features) ? entry.features.map(feature => cleanText(feature, 200)).filter(Boolean).slice(0, 12) : [],
      initial: entry.initial === true,
      portfolioOrder: Number.isFinite(entry.portfolioOrder) ? entry.portfolioOrder : undefined
    };
  }

  async function load() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let entries;
    try {
      const response = await fetch(registryURL, {cache: 'no-cache', credentials: 'same-origin', signal: controller.signal});
      if (!response.ok) throw new Error('Portfolio registry could not be loaded.');
      entries = await response.json();
    } finally { clearTimeout(timeout); }
    if (!Array.isArray(entries)) throw new Error('Portfolio registry must contain a list of projects.');
    const projects = [];
    const ids = new Set();
    entries.forEach((entry, index) => {
      const project = normalizeProject(entry, index);
      if (!project) return;
      const baseID = project.id;
      let suffix = 2;
      while (ids.has(project.id)) project.id = `${baseID}-${suffix++}`;
      ids.add(project.id);
      projects.push(project);
    });
    if (!projects.length) throw new Error('Portfolio registry contains no valid projects.');
    return projects;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function externalLink(project, className) {
    const link = element('a', className);
    link.href = project.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function arrow() {
    const node = element('span', '', '↗');
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function previewImage(project, priority = false) {
    const image = element('img');
    image.src = project.image;
    image.alt = project.alt;
    image.width = project.width;
    image.height = project.height;
    image.decoding = 'async';
    if (priority) image.fetchPriority = 'high';
    else image.loading = 'lazy';
    return image;
  }

  function createSlide(entry) {
    const project = normalizeProject(entry);
    if (!project) throw new TypeError('A portfolio slide requires a valid name, website URL and image.');
    const slide = externalLink(project, 'project-slide');
    slide.dataset.projectId = project.id;
    if (project.initial) slide.dataset.initial = 'true';
    slide.setAttribute('aria-label', `Visit ${project.name} website (opens in a new tab)`);
    const surface = element('div', 'project-surface');
    surface.append(previewImage(project, project.initial));
    const label = element('div', 'project-label');
    label.append(element('strong', '', project.name), element('span', '', 'VISIT WEBSITE ↗'));
    slide.append(surface, label);
    return slide;
  }

  function pageProject(project, index) {
    const article = element('article', 'work-project');
    article.id = project.id;
    const preview = externalLink(project, `work-preview work-preview-${project.id}`);
    preview.setAttribute('aria-label', `View ${project.name} website (opens in a new tab)`);
    const previewVisit = element('span', 'preview-visit', 'VIEW LIVE WEBSITE ');
    previewVisit.append(arrow());
    preview.append(previewImage(project, index === 0), previewVisit);
    const details = element('div', 'work-details');
    const kicker = element('div', 'work-kicker');
    kicker.append(element('span', '', String(index + 1).padStart(2, '0')), element('span', '', project.category));
    const heading = element('h2');
    const titleLink = externalLink(project);
    titleLink.append(document.createTextNode(project.name), element('span', 'sr-only', ' (opens in a new tab)'));
    heading.append(titleLink);
    details.append(kicker, heading);
    if (project.description) details.append(element('p', '', project.description));
    if (project.features.length) {
      const features = element('ul', 'work-features');
      features.setAttribute('aria-label', 'Website features');
      project.features.forEach(feature => features.append(element('li', '', feature)));
      details.append(features);
    }
    const visit = externalLink(project, 'text-link work-link');
    visit.append(document.createTextNode('Visit website '), arrow(), element('span', 'sr-only', ' (opens in a new tab)'));
    details.append(visit);
    article.append(preview, details);
    return article;
  }

  function renderPage(entries, container) {
    if (!(container instanceof Element) || !Array.isArray(entries)) return;
    const projects = entries.map(normalizeProject).filter(Boolean);
    if (!projects.length) return;
    // Explicit order is optional; otherwise the directory follows the JSON list.
    const ordered = projects.map((project, index) => ({project, index})).sort((a, b) => (a.project.portfolioOrder ?? a.index + 1) - (b.project.portfolioOrder ?? b.index + 1) || a.index - b.index);
    const fragment = document.createDocumentFragment();
    ordered.forEach(({project}, index) => fragment.append(pageProject(project, index)));
    container.querySelectorAll(':scope > .work-project').forEach(article => article.remove());
    const note = container.querySelector(':scope > .portfolio-link-note');
    container.insertBefore(fragment, note);
  }

  window.UniTechPortfolio = Object.freeze({load, createSlide, renderPage});
  const pageContainer = document.querySelector('body.portfolio-page #portfolio-projects');
  if (pageContainer) load().then(projects => renderPage(projects, pageContainer)).catch(() => {
    // Keep the three HTML projects visible if the file is unavailable or malformed.
  });
})();
