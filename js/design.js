'use strict';
(() => {
  const api=window.UniTechDraft;
  if(!api) return;
  const params=new URLSearchParams(location.search);
  const briefBox=document.getElementById('design-brief-box');
  if(briefBox && params.has('design')) {
    try {document.getElementById('design-brief').value=api.brief(JSON.parse(params.get('design')));briefBox.hidden=false;} catch { /* A malformed link leaves the normal enquiry available. */ }
  }
  const editor=document.getElementById('site-editor');
  if(!editor) return;
  const form=document.getElementById('design-controls');
  const frame=document.getElementById('site-preview');
  const viewport=document.getElementById('preview-viewport');
  const selection=document.getElementById('template-selection');
  const editorStage=document.getElementById('editor-stage');
  const templatePreview=document.getElementById('template-preview-dialog');
  const templateFrame=document.getElementById('template-preview-frame');
  const templateViewport=document.getElementById('template-preview-viewport');
  const setup=document.getElementById('guided-setup');
  const setupOrder=['business','colours','photo','review'];
  const setupCopy={
    business:{title:'Your business',description:'Add your business name and a heading for your homepage. You can keep the example text for now.',next:'Choose colours'},
    colours:{title:'Website colours',description:'Choose a colour palette for your website.',next:'Choose a photograph'},
    photo:{title:'Homepage photograph',description:'Use an example photograph or upload your own.',next:'Review website'},
    review:{title:'Review your website',description:'Browse the pages and check the mobile view before sending your design brief.'}
  };
  const photoLabels={'interior.jpg':'Interior','cafe.jpg':'Café','barber.jpg':'Abstract','barber-detail.jpg':'Barber detail'};
  const storageKey='unitech-site-drafts-v2';
  const labels={hero:'Header & introduction',services:'Services / menu',about:'About',gallery:'Photos',contact:'Contact'};
  const fieldLabels={business:'Business name',eyebrow:'Short heading above the title',headline:'Homepage heading',intro:'Introduction',cta:'Button text',aboutTitle:'About heading',aboutText:'About your business',contactTitle:'Contact heading',address:'Address or service area',phone:'Phone number',email:'Email address'};
  let drafts={},setupProgress={},lastTemplate='studio';
  const persistentDrafts=new Set();
  try {
    const saved=JSON.parse(localStorage.getItem(storageKey));
    if(saved && typeof saved==='object') {
      for(const key of Object.keys(api.templates)) if(saved.drafts?.[key]) {drafts[key]=api.validate(saved.drafts[key]);persistentDrafts.add(key);}
      for(const key of Object.keys(drafts)) if(setupOrder.includes(saved.setupSteps?.[key])) setupProgress[key]=saved.setupSteps[key];
      if(Object.hasOwn(api.templates,saved.lastTemplate)) lastTemplate=saved.lastTemplate;
    } else {
      const legacy=JSON.parse(localStorage.getItem('unitech-design-v1'));
      if(legacy && typeof legacy==='object') {
        const migrated=api.validate(legacy);const defaults=api.makeDefault(migrated.template);
        if(!migrated.business.trim()) migrated.business=defaults.business;
        if(!migrated.headline.trim()) migrated.headline=defaults.headline;
        drafts[migrated.template]=migrated;lastTemplate=migrated.template;persistentDrafts.add(migrated.template);
      }
    }
  } catch { /* Saving is optional; the editor remains available. */ }
  const requested=params.get('template')||params.get('concept');
  if(Object.hasOwn(api.templates,requested)) lastTemplate=requested;
  let draft=api.validate(drafts[lastTemplate]||api.makeDefault(lastTemplate));
  const view={page:'home',mode:'preview',selected:'hero',screen:innerWidth<801?'mobile':'desktop'};
  let history=[JSON.stringify(draft)],historyIndex=0;
  let currentPanel='content',ready=false,resizeFrame,expanded=false,focusBeforeExpand;
  let previewTemplate='studio',previewPage='home',previewScreen='desktop',templateReady=false,resizeTemplateFrame;
  let setupStep='business',advanced=false,templateRevision=0;
  const photoRequests={hero:0,gallery:0};
  const clone=value=>JSON.parse(JSON.stringify(value));
  function send({resetScroll=false}={}) {
    if(ready) frame.contentWindow.postMessage({type:'unitech:render',draft,view:{...view,resetScroll}},location.origin);
  }
  function requestReady(target) {
    target.contentWindow.postMessage({type:'unitech:request-ready'},location.origin);
  }
  function fitFrame() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame=requestAnimationFrame(()=>{
      if(editorStage.hidden||!viewport.clientWidth) return;
      const available=viewport.clientWidth;
      const width=view.screen==='desktop'?1100:view.screen==='tablet'?768:Math.min(390,available);
      const scale=Math.min(1,available/width);
      const height=viewport.clientHeight;
      frame.style.width=`${width}px`;frame.style.height=`${height/scale}px`;frame.style.transform=`scale(${scale})`;
      document.getElementById('preview-frame-wrap').style.width=`${width*scale}px`;
    });
  }
  function save() {
    drafts[draft.template]=clone(draft);
    let saved=false;
    try{localStorage.setItem(storageKey,JSON.stringify({lastTemplate:draft.template,drafts,setupSteps:setupProgress}));saved=true;}catch{ /* Quota/private mode must not report a successful save. */ }
    if(saved) {persistentDrafts.clear();Object.keys(drafts).forEach(key=>persistentDrafts.add(key));}
    else persistentDrafts.delete(draft.template);
    document.getElementById('save-status').textContent=saved?'Saved in this browser':'Download your brief to keep a copy';
    document.getElementById('storage-note').textContent=saved?'Your drafts are saved on this device. Send the design brief to Uni-Tech when you’re ready to discuss the build.':'This browser could not save your draft. Download the brief before leaving, or send it to Uni-Tech for review.';
    const setupNote=document.getElementById('setup-save-note');
    if(setupNote) setupNote.textContent=saved?'Your choices are saved on this device.':'Your choices are kept for this visit. Download the brief before leaving.';
    syncSelection();
  }
  function syncSelection() {
    document.querySelectorAll('[data-template-draft]').forEach(label=>{
      const key=label.dataset.templateDraft;label.hidden=!drafts[key];
      label.textContent=persistentDrafts.has(key)?'Saved draft on this device':'Draft in this session';
    });
    document.querySelectorAll('[data-template]').forEach(button=>{
      const key=button.dataset.template;button.textContent=drafts[key]?'Continue draft':'Use this template';
      button.setAttribute('aria-label',`${button.textContent}: ${api.templates[key].label}`);
    });
    document.querySelectorAll('[data-template-preview]').forEach(button=>button.setAttribute('aria-label',`Preview template: ${api.templates[button.dataset.templatePreview].label}`));
  }
  function stageUrl(template) {
    const url=new URL(location.href);
    url.searchParams.delete('concept');url.searchParams.delete('template');url.hash='';
    if(template) url.searchParams.set('template',template);
    if(url.href!==location.href) window.history.pushState(null,'',url);
  }
  function showSelection({updateUrl=true,focus=true}={}) {
    if(templatePreview.open) templatePreview.close();
    if(expanded) toggleExpand();
    editorStage.hidden=true;selection.hidden=false;syncSelection();
    if(updateUrl) stageUrl();
    if(focus) {document.getElementById('template-selection-title').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  }
  function openEditor(template,{updateUrl=true,focus=true}={}) {
    if(!Object.hasOwn(api.templates,template)) return;
    if(templatePreview.open) templatePreview.close();
    if(template!==draft.template) switchTemplate(template);
    selection.hidden=true;editorStage.hidden=false;
    setSetupStep(setupProgress[template]||'business',{focus:false});
    if(updateUrl) stageUrl(template);
    requestReady(frame);send();fitFrame();
    if(focus) {document.getElementById('setup-title').focus({preventScroll:true});setup.scrollIntoView({block:'start',behavior:'instant'});}
  }
  function syncSetupControls() {
    setup.querySelectorAll('[data-setup-field]').forEach(input=>{if(document.activeElement!==input) input.value=draft[input.dataset.setupField];});
    setup.querySelectorAll('[data-setup-colour]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.setupColour===draft.colour)));
    setup.querySelectorAll('[data-setup-photo]').forEach(button=>button.setAttribute('aria-pressed',String(!draft.imageData&&button.dataset.setupPhoto===draft.image)));
    document.getElementById('setup-photo-name').textContent=draft.imageData?`${draft.imageName||'Uploaded photograph'} selected`:`${photoLabels[draft.image]} example selected`;
    document.getElementById('setup-photo-revert').hidden=!draft.imageData;
    const summary=document.getElementById('setup-summary'),list=document.createElement('dl');summary.replaceChildren(list);
    for(const [label,value] of [['Template',api.templates[draft.template].label],['Business',draft.business||'Example business'],['Colours',api.palettes[draft.colour].name],['Photograph',draft.imageData?(draft.imageName||'Your uploaded photograph'):`${photoLabels[draft.image]} example`]]) {
      const row=document.createElement('div'),term=document.createElement('dt'),detail=document.createElement('dd');term.textContent=label;detail.textContent=value;row.append(term,detail);list.append(row);
    }
  }
  function setEditorMode(mode) {
    view.mode=mode;editor.dataset.mode=mode;
    document.querySelectorAll('button[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
    document.getElementById('canvas-edit-hint').textContent=mode==='edit'?'Click text to edit':'Browse your website';
  }
  function setSetupStep(step,{focus=true,persist=true}={}) {
    if(!setupOrder.includes(step)) return;
    if(expanded) toggleExpand();
    setupStep=step;advanced=false;setup.hidden=false;editor.dataset.guided='true';editor.dataset.setupCurrent=step;
    document.getElementById('setup-return-review').hidden=true;
    document.getElementById('setup-more-changes').setAttribute('aria-expanded','false');
    setEditorMode('preview');
    const index=setupOrder.indexOf(step),copy=setupCopy[step];
    document.getElementById('setup-title').textContent=copy.title;document.getElementById('setup-description').textContent=copy.description;
    document.getElementById('setup-step-count').textContent=`Step ${index+1} of ${setupOrder.length}`;
    setup.querySelectorAll('[data-setup-panel]').forEach(panel=>{panel.hidden=panel.dataset.setupPanel!==step;});
    setup.querySelectorAll('[data-setup-step]').forEach(button=>{
      if(button.dataset.setupStep===step) button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    });
    const back=document.getElementById('setup-back');back.disabled=false;back.textContent=index===0?'Back to templates':'Back';
    const next=document.getElementById('setup-next');next.hidden=step==='review';next.textContent=copy.next||'Continue';
    const previewLink=document.getElementById('setup-view-preview');if(previewLink)previewLink.hidden=step==='review';
    const backToChoices=document.getElementById('setup-back-to-choices');if(backToChoices)backToChoices.textContent=step==='review'?'Back to review':`Back to ${step==='business'?'your business':step==='photo'?'photograph':'colours'}`;
    if(step!=='review') setPage('home');
    syncSetupControls();send({resetScroll:step!=='review'});fitFrame();
    if(persist){setupProgress[draft.template]=step;save();}
    if(focus){document.getElementById('setup-title').focus({preventScroll:true});setup.scrollIntoView({block:'start',behavior:'instant'});}
  }
  function openAdvancedEditor() {
    setupProgress[draft.template]='review';save();advanced=true;setup.hidden=true;editor.dataset.guided='false';
    document.getElementById('setup-return-review').hidden=false;
    document.getElementById('setup-more-changes').setAttribute('aria-expanded','true');
    setEditorMode('edit');selectSection(view.page==='home'?'hero':view.page,{fromFrame:true});fitFrame();
    document.getElementById('edit-section').focus({preventScroll:true});editor.scrollIntoView({block:'start',behavior:'instant'});
  }
  function sendTemplatePreview() {
    if(templateReady&&templatePreview.open) templateFrame.contentWindow.postMessage({type:'unitech:render',draft:api.makeDefault(previewTemplate),view:{page:previewPage,mode:'preview',selected:'hero',resetScroll:true}},location.origin);
  }
  function fitTemplateFrame() {
    cancelAnimationFrame(resizeTemplateFrame);
    resizeTemplateFrame=requestAnimationFrame(()=>{
      if(!templatePreview.open||!templateViewport.clientWidth) return;
      const available=templateViewport.clientWidth;
      const width=previewScreen==='desktop'?1100:Math.min(390,available);
      const scale=Math.min(1,available/width);
      templateFrame.style.width=`${width}px`;templateFrame.style.height=`${templateViewport.clientHeight/scale}px`;templateFrame.style.transform=`scale(${scale})`;
      document.getElementById('template-preview-frame-wrap').style.width=`${width*scale}px`;
    });
  }
  function setTemplatePreviewPage(page) {
    if(!['home','services','about','contact'].includes(page)) return;
    previewPage=page;document.getElementById('template-preview-page').value=page;
    const label=page==='services'&&previewTemplate==='cafe'?'Menu':page[0].toUpperCase()+page.slice(1);
    templateFrame.title=`${api.templates[previewTemplate].label} template: ${label} page`;
    sendTemplatePreview();
  }
  function openTemplatePreview(template) {
    if(!Object.hasOwn(api.templates,template)) return;
    previewTemplate=template;previewScreen=innerWidth<801?'mobile':'desktop';
    document.getElementById('template-preview-title').textContent=api.templates[template].label;
    document.getElementById('template-preview-page').options[1].textContent=template==='cafe'?'Menu':'Services';
    document.getElementById('use-preview-template').textContent=drafts[template]?'Continue your draft':'Use this template';
    document.querySelectorAll('[data-template-screen]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.templateScreen===previewScreen)));
    templatePreview.showModal();document.body.style.overflow='hidden';
    requestReady(templateFrame);setTemplatePreviewPage('home');fitTemplateFrame();
  }
  function historyButtons() {
    document.getElementById('undo-draft').disabled=historyIndex===0;
    document.getElementById('redo-draft').disabled=historyIndex===history.length-1;
  }
  function updateLink() {
    document.getElementById('design-enquiry').href='contact.html?service=websites&design='+encodeURIComponent(JSON.stringify(api.forLink(draft)));
  }
  function commit(next,{inline=false}={}) {
    const valid=api.validate(next);
    if(JSON.stringify(valid)===JSON.stringify(draft)) return;
    draft=valid;
    history=history.slice(0,historyIndex+1);history.push(JSON.stringify(draft));
    if(history.length>40) history.shift();historyIndex=history.length-1;
    save();updateLink();historyButtons();syncControls();
    if(!inline) send();
  }
  function undo(direction) {
    const index=historyIndex+direction;
    if(index<0||index>=history.length) return;
    photoRequests.hero++;photoRequests.gallery++;
    historyIndex=index;draft=api.validate(JSON.parse(history[index]));save();updateLink();syncControls();renderFields();renderSections();photoControls(document.getElementById('design-photo-controls'),'design');historyButtons();send();
    document.getElementById('design-status').textContent=direction<0?'Last change undone.':'Change restored.';
  }
  function field(parent,key,label,multiline=false) {
    const id=`draft-${key}`;
    const caption=document.createElement('label');caption.htmlFor=id;caption.textContent=label;
    const input=document.createElement(multiline?'textarea':'input');input.id=id;input.name=key;input.maxLength=api.fields[key];input.value=draft[key];
    if(multiline) input.rows=key==='aboutText'?6:3;
    else input.type='text';
    parent.append(caption,input);
  }
  function photoControls(host,suffix) {
    host.replaceChildren();
    const scope=suffix==='content'?'gallery':'hero',imageKey=scope==='gallery'?'galleryImage':'image',dataKey=scope==='gallery'?'galleryImageData':'imageData',nameKey=scope==='gallery'?'galleryImageName':'imageName';
    const title=document.createElement('h3');title.textContent=scope==='gallery'?'Gallery photograph':'Homepage photograph';host.append(title);
    const grid=document.createElement('div');grid.className='photo-choices';
    const photos=photoLabels;
    for(const [filename,label] of Object.entries(photos)) {
      const button=document.createElement('button');button.type='button';button.dataset.photo=filename;button.dataset.photoScope=scope;button.setAttribute('aria-label',`Use ${label.toLowerCase()} photograph`);button.setAttribute('aria-pressed',String(!draft[dataKey]&&draft[imageKey]===filename));
      const img=document.createElement('img');img.src=`images/design/${filename}`;img.alt=label;button.append(img);grid.append(button);
    }
    const upload=document.createElement('input');upload.type='file';upload.accept='image/jpeg,image/png,image/webp';upload.id=`photo-upload-${suffix}`;upload.className='photo-upload';upload.dataset.photoScope=scope;
    const label=document.createElement('label');label.htmlFor=upload.id;label.className='photo-upload-label';label.textContent='Upload your photograph ↑';
    const help=document.createElement('p');help.className='editor-help';help.textContent='JPG, PNG or WebP, up to 10 MB. The photo stays in your browser.';
    host.append(grid,upload,label,help);
    if(draft[dataKey]) {
      const name=document.createElement('p');name.className='photo-name';name.textContent=draft[nameKey];host.append(name);
      const revert=document.createElement('button');revert.type='button';revert.className='photo-revert';revert.dataset.removePhoto='true';revert.dataset.photoScope=scope;revert.textContent='Use the template photograph';host.append(revert);
    }
  }
  function renderFields() {
    const host=document.getElementById('content-fields');host.replaceChildren();
    if(view.selected==='hero') ['business','eyebrow','headline','intro','cta'].forEach(key=>field(host,key,fieldLabels[key],['headline','intro'].includes(key)));
    if(view.selected==='services') {field(host,'serviceTitle','Section heading');field(host,'serviceIntro','Section introduction',true);}
    if(view.selected==='services') [1,2,3].forEach(i=>{
      const group=document.createElement('div');group.className='editor-field-group';
      const title=document.createElement('h3');title.textContent=`${draft.template==='cafe'?'Menu item':'Service'} ${i}`;group.append(title);
      field(group,`service${i}Title`,'Name');field(group,`service${i}Text`,'Description',true);field(group,`service${i}Price`,'Price (optional)');host.append(group);
    });
    if(view.selected==='about') {field(host,'aboutTitle',fieldLabels.aboutTitle);field(host,'aboutText',fieldLabels.aboutText,true);}
    if(view.selected==='contact') {['contactTitle','address','phone','email'].forEach(key=>field(host,key,fieldLabels[key],key==='address'));if(draft.template==='cafe'){field(host,'weekdayHours','Weekday opening hours');field(host,'weekendHours','Weekend opening hours');}}
    if(view.selected==='gallery') {
      field(host,'galleryTitle','Section heading');field(host,'galleryText','Description',true);
      const help=document.createElement('p');help.className='editor-help';help.textContent='Choose a photograph for this section, or upload an image of your own work.';host.append(help);
      const controls=document.createElement('div');host.append(controls);photoControls(controls,'content');
    }
  }
  function renderSections() {
    const list=document.getElementById('section-list');list.replaceChildren();
    draft.sections.forEach((id,index)=>{
      const row=document.createElement('div');row.className='section-row'+(draft.hidden.includes(id)?' is-hidden':'');row.dataset.sectionRow=id;
      const name=document.createElement('button');name.type='button';name.className='section-name';name.dataset.selectSection=id;name.textContent=labels[id];
      const actions=document.createElement('div');actions.className='section-actions';
      for(const [direction,symbol,label] of [[-1,'↑','up'],[1,'↓','down']]) {
        const button=document.createElement('button');button.type='button';button.dataset.moveSection=id;button.dataset.direction=direction;button.textContent=symbol;button.setAttribute('aria-label',`Move ${labels[id]} ${label}`);button.disabled=index+direction<0||index+direction>=draft.sections.length;actions.append(button);
      }
      row.append(name,actions);
      if(!['hero','contact'].includes(id)) {
        const toggle=document.createElement('label');toggle.className='section-toggle';
        const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=!draft.hidden.includes(id);checkbox.dataset.toggleSection=id;
        toggle.append(checkbox,document.createTextNode('Show on homepage'));row.append(toggle);
      } else {const small=document.createElement('small');small.textContent='Always included';name.append(small);}
      list.append(row);
    });
  }
  function syncControls() {
    form.querySelectorAll('[name]').forEach(input=>{if(Object.hasOwn(draft,input.name)&&document.activeElement!==input) input.value=draft[input.name];});
    form.querySelectorAll('[data-colour]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.colour===draft.colour)));
    form.querySelectorAll('[data-layout]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.layout===draft.layout)));
    document.getElementById('template-name').textContent=api.templates[draft.template].label;
    document.getElementById('preview-page').options[1].textContent=draft.template==='cafe'?'Menu':'Services';
    document.querySelectorAll('[data-photo]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.photoScope==='gallery'?!draft.galleryImageData&&button.dataset.photo===draft.galleryImage:!draft.imageData&&button.dataset.photo===draft.image)));
    syncSetupControls();
  }
  function setPanel(panel,focus=false) {
    if(!['content','design','sections'].includes(panel)) return;
    currentPanel=panel;
    document.querySelectorAll('[data-panel]').forEach(tab=>{const active=tab.dataset.panel===panel;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;document.getElementById(`panel-${tab.dataset.panel}`).hidden=!active;if(active&&focus)tab.focus();});
  }
  function selectSection(section,{fromFrame=false}={}) {
    if(!api.sectionIds.includes(section)) return;
    const changed=view.selected!==section;
    view.selected=section;document.getElementById('edit-section').value=section;
    if(changed) renderFields();
    if(fromFrame) setPanel('content');
    else {if(view.page!=='home')setPage('home');}
    send();
    if(!fromFrame&&ready)frame.contentWindow.postMessage({type:'unitech:focus',section},location.origin);
  }
  function setPage(page) {
    if(!['home','services','about','contact'].includes(page)) return;
    view.page=page;document.getElementById('preview-page').value=page;
    frame.title=`Your website draft: ${page==='services'&&draft.template==='cafe'?'Menu':page[0].toUpperCase()+page.slice(1)} page`;
    document.getElementById('preview-address').textContent=`${draft.business.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'your-website'} / ${page==='services'&&draft.template==='cafe'?'menu':page}`;
    send();
  }
  function switchTemplate(template) {
    if(!Object.hasOwn(api.templates,template)) return;
    templateRevision++;
    draft=api.validate(drafts[template]||api.makeDefault(template));
    history=[JSON.stringify(draft)];historyIndex=0;
    view.page='home';view.selected='hero';
    document.getElementById('edit-section').value='hero';
    setPanel('content');renderFields();renderSections();photoControls(document.getElementById('design-photo-controls'),'design');syncControls();historyButtons();updateLink();setPage('home');
    document.getElementById('design-status').textContent=`${api.templates[template].label} draft loaded.`;
  }
  async function loadPhoto(file,scope='hero') {
    if(!file) return;
    const request=++photoRequests[scope],revision=templateRevision;
    const status=document.getElementById('design-status');
    const report=message=>{if(revision!==templateRevision||request!==photoRequests[scope])return;status.textContent=message;if(scope==='hero'&&!advanced)document.getElementById('setup-photo-name').textContent=message;};
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024) {report('Choose a JPG, PNG or WebP photograph smaller than 10 MB.');return;}
    report('Preparing your photograph…');
    const url=URL.createObjectURL(file);
    try {
      const img=new Image();img.src=url;await img.decode();
      if(!img.naturalWidth||!img.naturalHeight) throw new Error('Invalid image');
      const ratio=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));
      const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(img,0,0,canvas.width,canvas.height);
      let imageData=canvas.toDataURL('image/jpeg',.82);
      if(imageData.length>700000) imageData=canvas.toDataURL('image/jpeg',.55);
      if(imageData.length>1000000) throw new Error('Image too large');
      if(revision!==templateRevision||request!==photoRequests[scope]) return;
      commit({...draft,...(scope==='gallery'?{galleryImageData:imageData,galleryImageName:file.name}:{imageData,imageName:file.name})});
      photoControls(document.getElementById('design-photo-controls'),'design');if(view.selected==='gallery')renderFields();
      report(`${file.name} selected. Supply the original separately with your enquiry.`);
    } catch {report('That image could not be opened. Please try another photograph.');} finally {URL.revokeObjectURL(url);}
  }
  setup.addEventListener('input',event=>{
    const key=event.target.dataset.setupField;
    if(!['business','headline'].includes(key)) return;
    const value=event.target.value;commit({...draft,[key]:value.trim()?value:api.makeDefault(draft.template)[key]});
  });
  setup.addEventListener('focusout',event=>{
    const key=event.target.dataset.setupField;
    if(['business','headline'].includes(key)&&!event.target.value.trim()) event.target.value=draft[key];
  });
  setup.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&!event.isComposing&&event.target.dataset.setupField) {event.preventDefault();setSetupStep(setupOrder[setupOrder.indexOf(setupStep)+1]);}
  });
  setup.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.setupStep) setSetupStep(button.dataset.setupStep);
    if(button.dataset.setupColour) commit({...draft,colour:button.dataset.setupColour});
    if(button.dataset.setupPhoto) {photoRequests.hero++;commit({...draft,image:button.dataset.setupPhoto,imageData:'',imageName:''});photoControls(document.getElementById('design-photo-controls'),'design');syncSetupControls();}
  });
  document.getElementById('setup-photo-upload').addEventListener('change',event=>{loadPhoto(event.target.files[0]);event.target.value='';});
  document.getElementById('setup-photo-revert').addEventListener('click',()=>{photoRequests.hero++;commit({...draft,imageData:'',imageName:''});photoControls(document.getElementById('design-photo-controls'),'design');});
  document.getElementById('setup-back').addEventListener('click',()=>{const index=setupOrder.indexOf(setupStep);if(index===0)showSelection();else setSetupStep(setupOrder[index-1]);});
  document.getElementById('setup-next').addEventListener('click',()=>setSetupStep(setupOrder[setupOrder.indexOf(setupStep)+1]));
  document.getElementById('setup-more-changes').addEventListener('click',openAdvancedEditor);
  document.getElementById('setup-return-review').addEventListener('click',()=>setSetupStep('review'));
  document.getElementById('setup-view-preview')?.addEventListener('click',()=>{frame.focus({preventScroll:true});document.getElementById('your-preview').scrollIntoView({block:'start',behavior:'instant'});});
  document.getElementById('setup-back-to-choices')?.addEventListener('click',()=>{document.getElementById('setup-title').focus({preventScroll:true});setup.scrollIntoView({block:'start',behavior:'instant'});});
  form.addEventListener('submit',event=>event.preventDefault());
  form.addEventListener('input',event=>{
    const key=event.target.name;
    if(Object.hasOwn(api.fields,key)||key==='typeface') commit({...draft,[key]:event.target.value});
  });
  form.addEventListener('change',event=>{
    if(event.target.matches('.photo-upload')) {loadPhoto(event.target.files[0],event.target.dataset.photoScope);event.target.value='';}
    if(event.target.dataset.toggleSection) {
      const id=event.target.dataset.toggleSection;
      commit({...draft,hidden:event.target.checked?draft.hidden.filter(value=>value!==id):[...draft.hidden,id]});renderSections();
    }
  });
  form.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.colour) commit({...draft,colour:button.dataset.colour});
    if(button.dataset.layout) commit({...draft,layout:button.dataset.layout});
    if(button.dataset.photo) {photoRequests[button.dataset.photoScope]++;commit({...draft,...(button.dataset.photoScope==='gallery'?{galleryImage:button.dataset.photo,galleryImageData:'',galleryImageName:''}:{image:button.dataset.photo,imageData:'',imageName:''})});photoControls(document.getElementById('design-photo-controls'),'design');if(view.selected==='gallery')renderFields();}
    if(button.dataset.removePhoto) {photoRequests[button.dataset.photoScope]++;commit({...draft,...(button.dataset.photoScope==='gallery'?{galleryImageData:'',galleryImageName:''}:{imageData:'',imageName:''})});photoControls(document.getElementById('design-photo-controls'),'design');if(view.selected==='gallery')renderFields();}
    if(button.dataset.selectSection) {selectSection(button.dataset.selectSection);setPanel('content');}
    if(button.dataset.moveSection) {
      const sections=[...draft.sections],index=sections.indexOf(button.dataset.moveSection),next=index+Number(button.dataset.direction);
      if(next>=0&&next<sections.length){[sections[index],sections[next]]=[sections[next],sections[index]];commit({...draft,sections});renderSections();}
    }
  });
  document.getElementById('edit-section').addEventListener('change',event=>selectSection(event.target.value));
  document.querySelectorAll('[data-panel]').forEach(tab=>{
    tab.addEventListener('click',()=>setPanel(tab.dataset.panel));
    tab.addEventListener('keydown',event=>{
      const tabs=[...document.querySelectorAll('[data-panel]')];let index=tabs.indexOf(tab);
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setPanel(tabs[index].dataset.panel,true);
    });
  });
  document.querySelectorAll('button[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    setEditorMode(button.dataset.mode);send();fitFrame();
  }));
  document.querySelectorAll('[data-screen]').forEach(button=>button.addEventListener('click',()=>{
    view.screen=button.dataset.screen;document.querySelectorAll('[data-screen]').forEach(control=>control.setAttribute('aria-pressed',String(control===button)));fitFrame();
  }));
  document.getElementById('preview-page').addEventListener('change',event=>setPage(event.target.value));
  document.getElementById('choose-template').addEventListener('click',()=>showSelection());
  document.getElementById('back-to-templates').addEventListener('click',()=>showSelection());
  document.querySelectorAll('[data-template]').forEach(button=>button.addEventListener('click',()=>openEditor(button.dataset.template)));
  document.querySelectorAll('[data-template-preview]').forEach(button=>button.addEventListener('click',()=>openTemplatePreview(button.dataset.templatePreview)));
  document.getElementById('close-template-preview').addEventListener('click',()=>templatePreview.close());
  templatePreview.addEventListener('close',()=>{document.body.style.overflow=expanded?'hidden':'';});
  document.getElementById('use-preview-template').addEventListener('click',()=>openEditor(previewTemplate));
  document.getElementById('template-preview-page').addEventListener('change',event=>setTemplatePreviewPage(event.target.value));
  document.querySelectorAll('[data-template-screen]').forEach(button=>button.addEventListener('click',()=>{
    previewScreen=button.dataset.templateScreen;document.querySelectorAll('[data-template-screen]').forEach(control=>control.setAttribute('aria-pressed',String(control===button)));fitTemplateFrame();
  }));
  window.addEventListener('popstate',()=>{
    const query=new URLSearchParams(location.search),template=query.get('template')||query.get('concept');
    if(Object.hasOwn(api.templates,template)) openEditor(template,{updateUrl:false});
    else showSelection({updateUrl:false});
  });
  document.getElementById('undo-draft').addEventListener('click',()=>undo(-1));document.getElementById('redo-draft').addEventListener('click',()=>undo(1));
  document.getElementById('reset-draft').addEventListener('click',()=>{photoRequests.hero++;photoRequests.gallery++;commit(api.makeDefault(draft.template));renderFields();renderSections();photoControls(document.getElementById('design-photo-controls'),'design');document.getElementById('design-status').textContent='Template reset. Use Undo to restore your changes.';});
  function toggleExpand() {
    expanded=!expanded;editor.classList.toggle('is-expanded',expanded);
    const button=document.getElementById('expand-preview');button.setAttribute('aria-expanded',String(expanded));button.setAttribute('aria-label',expanded?'Close expanded preview':'Expand website preview');button.textContent=expanded?'×':'↗';
    document.body.style.overflow=expanded?'hidden':'';
    if(expanded){focusBeforeExpand=document.activeElement;button.focus();} else focusBeforeExpand?.focus();
    fitFrame();
  }
  document.getElementById('expand-preview').addEventListener('click',toggleExpand);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&expanded)toggleExpand();});
  document.getElementById('download-brief').addEventListener('click',()=>{
    const blob=new Blob([api.brief(draft)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='my-unitech-design-brief.txt';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('design-status').textContent='Design brief downloaded.';
  });
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||!event.data)return;
    const message=event.data;
    if(event.source===templateFrame.contentWindow) {
      if(message.type==='unitech:ready'){templateReady=true;sendTemplatePreview();fitTemplateFrame();}
      if(message.type==='unitech:navigate') setTemplatePreviewPage(message.page);
      if(message.type==='unitech:escape'&&templatePreview.open) templatePreview.close();
      return;
    }
    if(event.source!==frame.contentWindow) return;
    if(message.type==='unitech:ready'){ready=true;send();fitFrame();}
    if(editorStage.hidden) return;
    if(message.type==='unitech:navigate') setPage(message.page);
    if(message.type==='unitech:escape'&&expanded) toggleExpand();
    if(message.type==='unitech:select'&&view.mode==='edit') selectSection(message.section,{fromFrame:true});
    if(message.type==='unitech:edit'&&view.mode==='edit'&&Object.hasOwn(api.fields,message.field)&&typeof message.value==='string') {
      commit({...draft,[message.field]:message.value},{inline:true});
      document.getElementById('preview-address').textContent=`${draft.business} / ${view.page}`;
    }
  });
  frame.addEventListener('load',()=>{ready=true;send();fitFrame();});
  templateFrame.addEventListener('load',()=>{templateReady=true;sendTemplatePreview();fitTemplateFrame();});
  new ResizeObserver(fitFrame).observe(viewport);
  new ResizeObserver(fitTemplateFrame).observe(templateViewport);
  document.querySelectorAll('[data-screen]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.screen===view.screen)));
  editor.dataset.mode=view.mode;
  renderFields();renderSections();photoControls(document.getElementById('design-photo-controls'),'design');syncControls();historyButtons();syncSelection();updateLink();setPage('home');
  if(Object.hasOwn(api.templates,requested)) openEditor(requested,{updateUrl:false,focus:false});
  else showSelection({updateUrl:false,focus:false});
})();
