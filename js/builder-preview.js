'use strict';
(() => {
  const api = window.UniTechDraft;
  if (!api) return;
  const host = document.getElementById('preview-site');
  const validPages = ['home','services','about','contact'];
  let draft = api.makeDefault('studio');
  let view = {page:'home',mode:'edit',selected:'hero'};
  let rendered = '';
  const sectionLabels = {hero:'Hero',services:'Services',about:'About',gallery:'Projects',contact:'Contact'};
  const details = {
    studio:{galleryLabel:'RESIDENTIAL INTERIORS',pageIntro:'Interior design that helps you make informed decisions about your home.',aboutIntro:'Residential interiors, planned around how you live.',contactIntro:'Tell us about your rooms, the changes you are considering and your preferred timescale.',steps:[['First conversation','We discuss the rooms, how you use them and what you want to change.'],['Developing the design','Room layouts, material options and key details form the basis of your plan.'],['Putting it together','We work through the finishing choices and the next steps for your home.']]},
    trades:{galleryLabel:'HOME IMPROVEMENT PROJECTS',pageIntro:'Joinery and interior improvements, from fitted storage to room renovations.',aboutIntro:'A practical plan for the work your home needs.',contactIntro:'Describe the job, include your location and let us know when you would like the work to begin.',steps:[['Discuss the work','We look at the space and talk through what you need.'],['Review your quote','The scope and materials are set out for you to review.'],['Arrange the job','We agree the schedule and keep you updated as the work progresses.']]},
    cafe:{galleryLabel:'AT THE DAILY POUR',pageIntro:'Coffee, breakfast and pastries, served throughout the day. Ask us about dietary requirements when you order.',aboutIntro:'A place for good coffee and everyday conversation.',contactIntro:'Find us, check the opening hours or ask a question before your visit.',steps:[['Your morning coffee','Coffee made to order, with a choice of hot and iced drinks.'],['Breakfast & lunch','A selection of freshly prepared food to eat in or take away.'],['The pastry counter','A changing selection of cakes, croissants and baked treats.']]}
  };
  function node(tag, className, text) {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (typeof text === 'string') result.textContent = text;
    return result;
  }
  function add(parent, ...children) { children.filter(Boolean).forEach(child => parent.append(child)); return parent; }
  function textField(tag, key, className) {
    const result = node(tag,className,draft[key]);
    result.dataset.field = key;
    return result;
  }
  function image(className, filename, alt, role = false) {
    const result = node('img',className);
    result.src = role === true && draft.imageData ? draft.imageData : role === 'gallery' && draft.galleryImageData ? draft.galleryImageData : `images/design/${filename}`;
    if (role === 'gallery' && draft.galleryImageName) result.title = draft.galleryImageName;
    result.alt = alt;
    result.decoding = 'async';
    if (role !== true) result.loading = 'lazy';
    return result;
  }
  function pageButton(label, page, className = 'nav-item') {
    const result = node('button',className,label);
    result.type = 'button';
    result.dataset.page = page;
    if (page === view.page && className.includes('nav-item')) result.setAttribute('aria-current','page');
    return result;
  }
  function section(name, className = 'content-section') {
    const result = node('section',`${className} ${name}`);
    result.dataset.section = name;
    result.dataset.label = name === 'services' && draft.template === 'cafe' ? 'Menu' : sectionLabels[name];
    return result;
  }
  function photoDescription(filename, uploaded) {
    return uploaded ? `Photograph for ${draft.business}` : ({'interior.jpg':'A bright living room with plants and natural materials','cafe.jpg':'A café counter and freshly prepared coffee','barber.jpg':'An abstract arrangement of peach and navy geometric blocks','barber-detail.jpg':'A close view of a barber trimming a beard'}[filename]);
  }
  function photoAlt() {return photoDescription(draft.image,draft.imageData);}
  function header() {
    const result = node('header','site-head');
    if (draft.template === 'trades') add(result,add(node('div','topline'),add(node('div','wrap'),node('span','', 'JOINERY & HOME IMPROVEMENTS'),textField('span','address'))));
    const nav = node('nav','site-nav');
    nav.setAttribute('aria-label','Website navigation');
    add(nav,pageButton('Home','home'),pageButton(draft.template === 'cafe' ? 'Menu' : 'Services','services'),pageButton('About','about'),pageButton('Contact','contact'));
    const brand = pageButton('', 'home', 'wordmark');
    add(brand,textField('span','business'));
    brand.setAttribute('aria-label','Website home');
    return add(result,add(node('div','wrap head-inner'),brand,nav));
  }
  function hero() {
    const result = section('hero','hero');
    const copy = add(node('div','hero-copy'),textField('span','eyebrow','eyebrow'),textField('h1','headline'),textField('p','intro'));
    const cta = pageButton('',draft.template === 'cafe' ? 'services' : 'contact','site-button');
    add(cta,textField('span','cta'));
    add(copy,cta);
    return add(result,add(node('div','wrap hero-inner'),copy,image('hero-img',draft.image,photoAlt(),true)));
  }
  function services() {
    const result = section('services');
    const wrap = node('div','wrap');
    const title = draft.template === 'cafe' ? 'The menu' : 'OUR SERVICES';
    const intro = add(node('div','section-intro'),add(node('div'),node('span','eyebrow',title),textField('h2','serviceTitle')),textField('p','serviceIntro'));
    const grid = node('div','services-grid');
    [1,2,3].forEach(number => {
      const card = add(node('article','service-card'),node('span','service-number',`0${number}`),textField('h3',`service${number}Title`),textField('p',`service${number}Text`));
      if (draft[`service${number}Price`] || view.mode === 'edit') add(card,textField('span',`service${number}Price`,'service-price'));
      add(grid,card);
    });
    add(wrap,intro,grid);
    if (view.page === 'services' && draft.template === 'cafe') add(wrap,node('p','form-note','Sample menu prices. Replace these with your current menu. Please ask before ordering if you have an allergy.'));
    if (view.page === 'home') {
      const linkWrap = node('div'); linkWrap.style.marginTop = '35px';
      add(wrap,add(linkWrap,pageButton(draft.template === 'cafe' ? 'Explore the menu' : 'View all services','services','text-button')));
    }
    return add(result,wrap);
  }
  function about() {
    const result = section('about');
    const copy = add(node('div','about-copy'),node('span','eyebrow',draft.template === 'cafe' ? 'OUR CAFÉ' : 'ABOUT US'),textField('h2','aboutTitle'),textField('p','aboutText'));
    add(copy,pageButton(view.page === 'about' ? (draft.template === 'cafe' ? 'Plan your visit' : 'Get in touch') : 'More about us',view.page === 'about' ? 'contact' : 'about','text-button'));
    const photo = draft.template === 'cafe' ? 'cafe.jpg' : 'interior.jpg';
    add(result,add(node('div','wrap about-grid'),image('about-image',photo,draft.template === 'cafe' ? 'Coffee and the café counter' : 'A comfortable living room with natural light'),copy));
    if (view.page === 'about') {
      const steps = node('div','wrap process-grid');
      details[draft.template].steps.forEach((item,index) => add(steps,add(node('article','process-step'),node('span','eyebrow',`0${index+1} / ${draft.template === 'cafe' ? 'AT THE CAFÉ' : 'HOW WE WORK'}`),node('h3','',item[0]),node('p','',item[1]))));
      add(result,steps);
    }
    return result;
  }
  function gallery() {
    const d = details[draft.template];
    const result = section('gallery');
    const wrap = node('div','wrap');
    add(wrap,add(node('div','section-intro'),add(node('div'),node('span','eyebrow',draft.template === 'cafe' ? 'IN THE CAFÉ' : 'PROJECTS'))));
    const caption = add(node('div','gallery-caption'),add(node('div'),textField('h2','galleryTitle'),textField('p','galleryText')),node('span','gallery-label',draft.template === 'cafe' ? `AT ${draft.business}` : d.galleryLabel));
    const galleryFile = draft.galleryImage || (draft.template === 'cafe' ? 'cafe.jpg' : 'interior.jpg');
    add(wrap,add(node('div','gallery-grid'),image('gallery-image',galleryFile,photoDescription(galleryFile,draft.galleryImageData),'gallery'),caption));
    return add(result,wrap);
  }
  function contactDetail(label,key) {
    const result = node('div');
    const value = textField('span',key);
    if (key === 'address') value.style.whiteSpace = 'pre-line';
    add(result,node('span','detail-label',label),value);
    return result;
  }
  function openingHours() {
    return add(node('div','opening-hours'),node('span','eyebrow','OPENING HOURS'),add(node('p'),node('span','','Monday – Friday'),textField('span','weekdayHours')),add(node('p'),node('span','','Saturday – Sunday'),textField('span','weekendHours')));
  }
  function contact() {
    const result = section('contact');
    const copy = add(node('div','contact-copy'),node('span','eyebrow',draft.template === 'cafe' ? 'VISIT US' : 'GET IN TOUCH'),textField('h2','contactTitle'),node('p','',details[draft.template].contactIntro));
    const info = add(node('div','contact-details'),contactDetail(draft.template === 'cafe' ? 'Find us' : 'Based in','address'),contactDetail('Email','email'));
    if (draft.phone || view.mode === 'edit') add(info,contactDetail('Phone','phone'));
    add(copy,info);
    if (draft.template === 'cafe') add(copy,openingHours());
    const form = node('form','sample-form');
    form.setAttribute('aria-label','Example contact form');
    [['Your name','text','name'],['Email address','email','email']].forEach(([label,type,name]) => {
      const input = node('input'); input.type = type; input.name = name; input.required = true; input.autocomplete = name;
      add(form,add(node('label','',label),input));
    });
    const textarea = node('textarea'); textarea.name = 'message'; textarea.required = true; textarea.rows = 4;
    add(form,add(node('label','',draft.template === 'cafe' ? 'Your question' : 'Tell us about the work'),textarea));
    const submit = node('button','site-button','Send enquiry'); submit.type = 'submit';
    const status = node('p','form-status'); status.hidden = true; status.setAttribute('role','status');
    add(form,submit,node('p','form-note','This form is part of your website preview. It does not send an enquiry.'),status);
    form.addEventListener('submit',event => {
      event.preventDefault();
      status.hidden = false;
      status.textContent = 'This is a preview. Use Send to Uni-Tech in the editor to discuss your website.';
    });
    return add(result,add(node('div','wrap contact-grid'),copy,form));
  }
  function pageIntro() {
    const d = details[draft.template];
    const result = node('section','page-intro');
    const wrap = node('div','wrap');
    let title = ''; let intro = '';
    if (view.page === 'services') {title = draft.template === 'cafe' ? 'Our menu.' : 'Services for your home.'; intro = d.pageIntro;}
    if (view.page === 'about') {title = draft.template === 'cafe' ? 'Your neighbourhood café.' : 'A considered approach.'; intro = d.aboutIntro;}
    if (view.page === 'contact') {title = draft.template === 'cafe' ? 'Plan your visit.' : 'Let’s discuss your project.'; intro = d.contactIntro;}
    return add(result,add(wrap,node('span','eyebrow',draft.business),node('h1','',title),node('p','',intro)));
  }
  function ctaStrip() {
    const title = draft.template === 'cafe' ? 'Your next coffee is waiting.' : 'Have a project in mind?';
    return add(node('section','cta-strip'),add(node('div','wrap'),node('h2','',title),pageButton(draft.template === 'cafe' ? 'Plan your visit' : 'Discuss your project','contact','site-button')));
  }
  function footer() {
    const result = node('footer','site-foot');
    const brand = add(node('div'),textField('div','business','footer-brand'),node('p','',draft.template === 'cafe' ? 'Coffee, breakfast and pastries. Eat in or take away.' : draft.template === 'trades' ? 'Joinery and home improvements in Kent & East Sussex.' : 'Residential interior design in Kent & East Sussex.'));
    const nav = node('nav','footer-nav'); nav.setAttribute('aria-label','Footer navigation');
    add(nav,pageButton('Home','home'),pageButton(draft.template === 'cafe' ? 'Menu' : 'Services','services'),pageButton('About','about'),pageButton('Contact','contact'));
    return add(result,add(node('div','wrap'),add(node('div','footer-top'),brand,nav),add(node('div','footer-bottom'),node('span','',`© ${new Date().getFullYear()} ${draft.business}`),node('span','','Website preview · Example business'))));
  }
  function send(message) {if (window.parent !== window) window.parent.postMessage(message,location.origin);}
  function syncSelection() {
    host.querySelectorAll('[data-section]').forEach(block => block.classList.toggle('is-selected',view.mode === 'edit' && block.dataset.section === view.selected));
  }
  function syncMode() {
    host.classList.toggle('edit-mode',view.mode === 'edit');
    host.querySelectorAll('[data-field]').forEach(field => {
      field.contentEditable = String(view.mode === 'edit');
      field.spellcheck = view.mode === 'edit';
      if (view.mode === 'edit') {
        const label = field.dataset.field.replace(/([A-Z])/g,' $1');
        if (!/^H[1-6]$/.test(field.tagName)) {field.setAttribute('aria-label',`${label} — click to edit`);field.setAttribute('role','textbox');}
        field.setAttribute('aria-description',`Edit ${label}`);
      } else {field.removeAttribute('aria-label');field.removeAttribute('aria-description');field.removeAttribute('role');}
    });
    syncSelection();
  }
  function signature() {return JSON.stringify([draft,view.page,view.mode]);}
  function render(resetScroll = false) {
    const nextSignature = signature();
    if (nextSignature === rendered) {syncSelection();if(resetScroll)window.scrollTo(0,0);return;}
    const oldScroll = window.scrollY;
    const p = api.palettes[draft.colour];
    document.body.style.setProperty('--paper',p.paper);
    document.body.style.setProperty('--ink',p.ink);
    document.body.style.setProperty('--accent',p.accent);
    host.className = `site-${draft.template} type-${draft.typeface} layout-${draft.layout}`;
    const main = node('main'); main.id = 'site-main';
    if (view.page === 'home') {
      const renderSection = {hero,services,about,gallery,contact};
      draft.sections.filter(id => !draft.hidden.includes(id)).forEach(id => add(main,renderSection[id]()));
    } else {
      add(main,pageIntro());
      if (view.page === 'services') add(main,services(),ctaStrip());
      if (view.page === 'about') add(main,about(),gallery(),ctaStrip());
      if (view.page === 'contact') add(main,contact());
    }
    host.replaceChildren(header(),main,footer());
    rendered = nextSignature;
    syncMode();
    document.title = `${draft.business} — ${view.page === 'services' && draft.template === 'cafe' ? 'Menu' : view.page[0].toUpperCase()+view.page.slice(1)}`;
    requestAnimationFrame(() => window.scrollTo(0,resetScroll ? 0 : oldScroll));
  }
  host.addEventListener('click',event => {
    const block = event.target.closest('[data-section]');
    if (view.mode === 'edit' && block && view.selected !== block.dataset.section) {
      view.selected = block.dataset.section;
      syncSelection();
      send({type:'unitech:select',section:view.selected});
    }
    const pageControl = event.target.closest('[data-page]');
    if (!pageControl || (view.mode === 'edit' && event.target.closest('[data-field]'))) return;
    event.preventDefault();
    const page = pageControl.dataset.page;
    if (!validPages.includes(page)) return;
    if (window.parent === window) {view.page = page;render(true);}
    else send({type:'unitech:navigate',page});
  });
  host.addEventListener('focusin',event => {
    const block = event.target.closest('[data-section]');
    if (view.mode !== 'edit' || !event.target.closest('[data-field]') || !block || view.selected === block.dataset.section) return;
    view.selected = block.dataset.section; syncSelection();
    send({type:'unitech:select',section:view.selected});
  });
  host.addEventListener('input',event => {
    const field = event.target.closest('[data-field]');
    if (!field || view.mode !== 'edit') return;
    const key = field.dataset.field;
    if (!Object.hasOwn(api.fields,key)) return;
    const value = field.innerText.replace(/\r/g,'').slice(0,api.fields[key]);
    if (field.innerText.length > api.fields[key]) {
      field.textContent = value;
      const caret = document.createRange(); caret.selectNodeContents(field); caret.collapse(false);
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(caret);
    }
    draft[key] = value;
    host.querySelectorAll(`[data-field="${key}"]`).forEach(other => {if (other !== field) other.textContent = value;});
    rendered = signature();
    send({type:'unitech:edit',field:key,value});
  });
  host.addEventListener('paste',event => {
    const field = event.target.closest('[data-field]');
    if (!field || view.mode !== 'edit') return;
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    const selection = getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const inserted = document.createTextNode(text);
    range.insertNode(inserted);range.setStartAfter(inserted);range.collapse(true);
    selection.removeAllRanges();selection.addRange(range);
    field.dispatchEvent(new Event('input',{bubbles:true}));
  });
  host.addEventListener('keydown',event => {
    if (event.key === 'Enter' && event.target.matches('[contenteditable=true]') && ['business','cta','eyebrow','phone','email', 'service1Price','service2Price','service3Price'].includes(event.target.dataset.field)) event.preventDefault();
  });
  document.addEventListener('keydown',event => {
    if (event.key !== 'Escape') return;
    const active = document.activeElement;
    if (active && active.matches('[contenteditable=true]')) active.blur();
    send({type:'unitech:escape'});
  });
  window.addEventListener('message',event => {
    if (event.origin !== location.origin || event.source !== parent || !event.data) return;
    if (event.data.type === 'unitech:request-ready') {send({type:'unitech:ready'});return;}
    if (event.data.type === 'unitech:focus') {
      const id = event.data.section;
      if (!api.sectionIds.includes(id)) return;
      const block = host.querySelector(`[data-section="${id}"]`);
      if (block) {
        view.selected = id; syncSelection();
        requestAnimationFrame(() => {
          const current = host.querySelector(`[data-section="${id}"]`);
          if (current) current.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'start'});
        });
      }
      return;
    }
    if (event.data.type !== 'unitech:render') return;
    const next = event.data.view || {};
    const nextPage = validPages.includes(next.page) ? next.page : view.page;
    const changedPage = view.page !== nextPage;
    draft = api.validate(event.data.draft);
    view = {page:nextPage,mode:next.mode === 'preview' ? 'preview' : 'edit',selected:api.sectionIds.includes(next.selected) ? next.selected : view.selected};
    render(changedPage || next.resetScroll === true);
  });
  render();
  send({type:'unitech:ready'});
})();
