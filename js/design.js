'use strict';
(() => {
  const concepts = {
    barber: {name:'NORTH & BLADE', headline:'Good people. Great hair.', description:'Your style. Sharpened.', eyebrow:'INDEPENDENT SPIRIT. CONSIDERED STYLE.', cta:'Find your next look ↗', image:'barber.jpg', alt:'A barber carefully shaping a customer’s beard', services:['A cut above','Beard & grooming','Your own style']},
    studio: {name:'FORM & FIELD', headline:'Spaces for a slower kind of living.', description:'Considered interiors. Everyday beauty.', eyebrow:'INDEPENDENT BY NATURE', cta:'Discover our world ↗', image:'interior.jpg', alt:'Warm architectural interior with natural materials', services:['Spaces with soul','Considered details','Made for you']},
    cafe: {name:'THE DAILY POUR', headline:'Good coffee. Better company.', description:'Your neighbourhood. Your new favourite.', eyebrow:'MAKE YOURSELF AT HOME', cta:'Find your daily ritual ↗', image:'cafe.jpg', alt:'Coffee and a quiet moment at a café', services:['Coffee with character','Something freshly baked','A place to slow down']},
    trades: {name:'OAK & LINE', headline:'Built with care. Made to last.', description:'Craftsmanship for the place you call home.', eyebrow:'GOOD WORK. DONE PROPERLY.', cta:'Explore our work ↗', image:'interior.jpg', alt:'A carefully finished home interior', services:['Thoughtful planning','Skilled craftsmanship','Finishing touches']}
  };
  const palettes={olive:['#f0eee6','#3d4637','#424b3c','Olive / warm & grounded'],clay:['#f6e8dc','#683b2c','#834b36','Clay / warm & expressive'],blue:['#eaf0f6','#293e62','#344f88','Blue / clear & confident'],plum:['#f2e9ee','#57384d','#633f59','Plum / rich & distinctive']};
  const defaults={concept:'studio',business:'',headline:'',colour:'olive',typeface:'editorial',layout:'split',services:true};
  function validState(raw){
    const s={...defaults}; if(!raw || typeof raw!=='object') return s;
    if(Object.hasOwn(concepts,raw.concept)) s.concept=raw.concept;
    if(Object.hasOwn(palettes,raw.colour)) s.colour=raw.colour;
    if(['editorial','modern','bold'].includes(raw.typeface)) s.typeface=raw.typeface;
    if(['split','centered'].includes(raw.layout)) s.layout=raw.layout;
    if(typeof raw.business==='string') s.business=raw.business.slice(0,50);
    if(typeof raw.headline==='string') s.headline=raw.headline.slice(0,100);
    if(typeof raw.services==='boolean') s.services=raw.services;
    return s;
  }
  function brief(s){const c=concepts[s.concept];return `Website design concept\nBusiness: ${s.business.trim()||c.name}\nHeadline: ${s.headline.trim()||c.headline}\nStarting point: ${s.concept}\nPalette: ${s.colour}\nTypography: ${s.typeface}\nLayout: ${s.layout}\nServices section: ${s.services?'Included':'Not included'}\n\nA starting point for a custom Uni-Tech website, not a final specification.`;}
  const params=new URLSearchParams(location.search);
  const briefBox=document.getElementById('design-brief-box');
  if(briefBox && params.has('design')){try{const s=validState(JSON.parse(params.get('design')));document.getElementById('design-brief').value=brief(s);briefBox.hidden=false;}catch{/* A malformed link must not prevent a normal enquiry. */}}
  const form=document.getElementById('design-controls'); if(!form) return;
  let state={...defaults};
  try{state=validState(JSON.parse(localStorage.getItem('unitech-design-v1')));}catch{/* The playground also works when storage is unavailable. */}
  if(Object.hasOwn(concepts,params.get('concept'))) state={...defaults,concept:params.get('concept'),...(params.get('concept')==='barber'?{colour:'clay',typeface:'bold'}:{})};
  const preview=document.getElementById('live-website');
  function fill(){form.elements.concept.value=state.concept;form.elements.business.value=state.business;form.elements.headline.value=state.headline;form.elements.typeface.value=state.typeface;document.getElementById('show-services').checked=state.services;}
  function render(save=true){
    const c=concepts[state.concept], p=palettes[state.colour], name=state.business.trim()||c.name;
    document.getElementById('preview-name').textContent=name;
    document.getElementById('preview-footer').textContent=name;
    document.getElementById('preview-headline').textContent=state.headline.trim()||c.headline;
    document.getElementById('preview-description').textContent=c.description;
    document.getElementById('preview-eyebrow').textContent=c.eyebrow;
    document.getElementById('preview-cta').textContent=c.cta;
    const img=document.getElementById('preview-image');img.src=`images/design/${c.image}`;img.alt=c.alt;
    ['one','two','three'].forEach((key,i)=>document.getElementById(`service-${key}`).textContent=c.services[i]);
    form.elements.business.placeholder=c.name;form.elements.headline.placeholder=c.headline;
    preview.style.setProperty('--preview-bg',p[0]);preview.style.setProperty('--preview-ink',p[1]);preview.style.setProperty('--preview-accent',p[2]);
    preview.dataset.layout=state.layout;preview.dataset.type=state.typeface;
    document.getElementById('preview-services').hidden=!state.services;
    document.getElementById('palette-name').textContent=p[3];
    document.querySelectorAll('[data-colour]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.colour===state.colour)));
    document.querySelectorAll('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===state.layout)));
    document.getElementById('design-enquiry').href='contact.html?service=websites&design='+encodeURIComponent(JSON.stringify(state));
    if(save){let saved=false;try{localStorage.setItem('unitech-design-v1',JSON.stringify(state));saved=true;}catch{} document.getElementById('design-status').textContent=saved?'Preview updated. Your design is saved in this browser.':'Preview updated. Download your brief to keep a copy.';}
  }
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',()=>{state.concept=form.elements.concept.value;state.business=form.elements.business.value;state.headline=form.elements.headline.value;state.typeface=form.elements.typeface.value;state.services=document.getElementById('show-services').checked;render();});
  document.querySelectorAll('[data-colour]').forEach(b=>b.addEventListener('click',()=>{state.colour=b.dataset.colour;render();}));
  document.querySelectorAll('[data-layout]').forEach(b=>b.addEventListener('click',()=>{state.layout=b.dataset.layout;render();}));
  document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>{preview.classList.toggle('is-phone',b.dataset.screen==='mobile');document.querySelectorAll('[data-screen]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
  form.addEventListener('reset',e=>{e.preventDefault();state={...defaults};fill();preview.classList.remove('is-phone');document.querySelectorAll('[data-screen]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.screen==='desktop')));render();});
  document.getElementById('download-brief').addEventListener('click',()=>{const blob=new Blob([brief(state)],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='my-unitech-design-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('design-status').textContent='Your design brief is ready to download.';});
  fill();render(false);
})();
