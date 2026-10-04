'use strict';
(() => {
  const fields = {business:70,headline:140,intro:500,cta:50,eyebrow:70,aboutTitle:100,aboutText:1000,contactTitle:100,address:180,phone:50,email:100,serviceTitle:100,serviceIntro:500,galleryTitle:100,galleryText:600,weekdayHours:80,weekendHours:80};
  for (let i=1;i<=3;i++) { fields[`service${i}Title`]=70;fields[`service${i}Text`]=300;fields[`service${i}Price`]=50; }
  const palettes = {
    olive:{name:'Olive',paper:'#f4f1e9',ink:'#303b2e',accent:'#526347'},
    clay:{name:'Clay',paper:'#fff4e8',ink:'#492926',accent:'#8e392d'},
    blue:{name:'Blue',paper:'#f2f5f8',ink:'#122e48',accent:'#235d91'},
    charcoal:{name:'Charcoal',paper:'#f5f4f0',ink:'#242424',accent:'#424242'}
  };
  const templates = {
    studio:{label:'Interiors studio',description:'An editorial website with project imagery and service pages.',business:'FORM & FIELD',headline:'Interiors for everyday living.',intro:'Residential interior design, from room layouts and materials to the final details.',cta:'Discuss your project',eyebrow:'RESIDENTIAL INTERIOR DESIGN',colour:'olive',typeface:'editorial',layout:'split',image:'interior.jpg',aboutTitle:'A practical approach to good design.',aboutText:'We plan rooms around the people who use them. From the first conversation to the choice of materials, we help you make decisions about your space and develop a clear design for your home.',contactTitle:'Tell us about your space.',address:'Kent & East Sussex',phone:'',email:'hello@example.com',service1Title:'Room design',service1Text:'Layouts, colour schemes and material choices for a room you want to change.',service1Price:'',service2Title:'Full-home interiors',service2Text:'A coordinated design for your home, with room plans and a shared material palette.',service2Price:'',service3Title:'Finishing & styling',service3Text:'Furniture, lighting and finishing details that bring your rooms together.',service3Price:''},
    trades:{label:'Local trades',description:'A service-led site with clear project and enquiry pages.',business:'OAK & LINE',headline:'Home improvements, built to last.',intro:'Joinery, fitted storage and interior renovations across Kent and East Sussex.',cta:'Request a quote',eyebrow:'JOINERY & HOME IMPROVEMENTS',colour:'blue',typeface:'bold',layout:'split',image:'interior.jpg',aboutTitle:'Work planned around your home.',aboutText:'We start by looking at the space and discussing the work you need. You receive a clear description of the job before it begins, with time to review materials and finishes. We keep you informed as the work progresses.',contactTitle:'Discuss your next project.',address:'Kent & East Sussex',phone:'',email:'hello@example.com',service1Title:'Fitted storage',service1Text:'Built-in wardrobes, shelving and storage designed to fit your rooms.',service1Price:'Quote on request',service2Title:'Interior renovations',service2Text:'Practical updates to rooms, fixtures and interior finishes.',service2Price:'Quote on request',service3Title:'Bespoke joinery',service3Text:'Made-to-measure woodwork for your home, from planning to installation.',service3Price:'Quote on request'},
    cafe:{label:'Neighbourhood café',description:'A photographic café website with a menu and visit page.',business:'THE DAILY POUR',headline:'Your local coffee stop.',intro:'Coffee, breakfast and freshly baked pastries. Eat in or take away.',cta:'View the menu',eyebrow:'COFFEE • BREAKFAST • GOOD COMPANY',colour:'clay',typeface:'editorial',layout:'cover',image:'cafe.jpg',aboutTitle:'Make yourself at home.',aboutText:'A neighbourhood café for a morning coffee, a quick lunch or a catch-up with friends. Take a seat, browse the menu and stay a while. We serve coffee and food throughout the day, with takeaway available.',contactTitle:'Come and see us.',address:'Your street address\nYour town, postcode',phone:'',email:'hello@example.com',service1Title:'Coffee',service1Text:'Espresso, flat white, cappuccino and filter coffee. Ask about our current beans.',service1Price:'From £2.80',service2Title:'Breakfast',service2Text:'Toast, breakfast rolls and a choice of freshly prepared morning dishes.',service2Price:'From £5.50',service3Title:'Pastries',service3Text:'Croissants, cakes and the day’s selection of baked treats.',service3Price:'From £3.00'}
  };
  const sectionIds=['hero','services','about','gallery','contact'];
  function makeDefault(template='studio') {
    if (!Object.hasOwn(templates,template)) template='studio';
    const {label,description,...content}=templates[template];
    const extra={
      studio:{serviceTitle:'Design services',serviceIntro:'Support for a single room or a complete home, with a clear plan for each stage.',galleryTitle:'Materials, light and space.',galleryText:'A room shaped around natural light, useful storage and a considered choice of furniture. Add your project photographs here.'},
      trades:{serviceTitle:'How we can help',serviceIntro:'Home improvements with the scope, materials and next steps agreed before work starts.',galleryTitle:'A better use of your space.',galleryText:'Interior updates and made-to-measure details for the rooms you use every day. Add photographs of your completed work here.'},
      cafe:{serviceTitle:'Something for every morning',serviceIntro:'Coffee to order, breakfast favourites and something from the pastry counter.',galleryTitle:'Take a seat. Stay a while.',galleryText:'A coffee before work, breakfast with friends or a quiet afternoon break. Eat in or take your favourites with you.'}
    };
    return {version:2,template,...content,...extra[template],weekdayHours:'7:30am – 4:00pm',weekendHours:'8:30am – 3:00pm',imageData:'',imageName:'',galleryImage:content.image,galleryImageData:'',galleryImageName:'',sections:[...sectionIds],hidden:[]};
  }
  function validate(raw) {
    if (!raw || typeof raw!=='object') return makeDefault();
    // Older shared links still open as useful design briefs.
    const template=Object.hasOwn(templates,raw.template)?raw.template:(Object.hasOwn(templates,raw.concept)?raw.concept:'studio');
    const state=makeDefault(template);
    for(const [key,max] of Object.entries(fields)) if(typeof raw[key]==='string') state[key]=raw[key].slice(0,max);
    for(const [key,allowed] of Object.entries({colour:Object.keys(palettes),typeface:['editorial','modern','bold'],layout:['split','cover','centered'],image:['interior.jpg','barber.jpg','barber-detail.jpg','cafe.jpg'],galleryImage:['interior.jpg','barber.jpg','barber-detail.jpg','cafe.jpg']})) if(allowed.includes(raw[key])) state[key]=raw[key];
    if(Array.isArray(raw.sections)) {
      const order=[...new Set(raw.sections.filter(id=>sectionIds.includes(id)))];
      state.sections=[...order,...sectionIds.filter(id=>!order.includes(id))];
    }
    if(Array.isArray(raw.hidden)) state.hidden=[...new Set(raw.hidden.filter(id=>['services','about','gallery'].includes(id)))];
    if(raw.services===false) state.hidden=[...new Set([...state.hidden,'services'])];
    for(const key of ['imageData','galleryImageData']) if(typeof raw[key]==='string' && raw[key].length<1800000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(raw[key])) state[key]=raw[key];
    for(const key of ['imageName','galleryImageName']) if(typeof raw[key]==='string')state[key]=raw[key].slice(0,120);
    return state;
  }
  function forLink(raw) {const {imageData,galleryImageData,...state}=validate(raw);return state;}
  function brief(raw) {
    const d=validate(raw);
    return `Website design brief\nBusiness: ${d.business}\nTemplate: ${templates[d.template].label}\nPages: Home, ${d.template==='cafe'?'Menu':'Services'}, About, Contact\nPalette: ${palettes[d.colour].name}\nTypography: ${d.typeface}\nHero layout: ${d.layout}\nHomepage photograph: ${d.imageName||d.image}\nGallery photograph: ${d.galleryImageName||d.galleryImage}\nHomepage sections: ${d.sections.filter(id=>!d.hidden.includes(id)).join(', ')}\n\nHOMEPAGE\n${d.eyebrow}\n${d.headline}\n${d.intro}\nButton: ${d.cta}\n\nSERVICES / MENU\n${d.serviceTitle}\n${d.serviceIntro}\n${[1,2,3].map(i=>`${d[`service${i}Title`]} — ${d[`service${i}Price`]}\n${d[`service${i}Text`]}`).join('\n\n')}\n\nABOUT\n${d.aboutTitle}\n${d.aboutText}\n\nPROJECTS / PHOTOS\n${d.galleryTitle}\n${d.galleryText}\n\nCONTACT\n${d.contactTitle}\n${d.address}\n${d.phone}\n${d.email}${d.template==='cafe'?`\nWeekday hours: ${d.weekdayHours}\nWeekend hours: ${d.weekendHours}`:''}\n\nThis is a design brief for Uni-Tech to review. Uploaded photographs are saved only in this browser and must be supplied separately with your enquiry.`;
  }
  window.UniTechDraft={templates,palettes,fields,sectionIds,makeDefault,validate,brief,forLink};
})();
