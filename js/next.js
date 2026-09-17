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
  let renderScene = () => {};
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
    renderScene();
  }));

  // A locally rendered, smoothly shaded torus knot. No 3D library or remote asset.
  const canvas = document.querySelector('#signal-canvas');
  const gl = canvas?.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: 'low-power' });
  const toggle = document.querySelector('.motion-toggle');
  if (!gl) { if (toggle) toggle.hidden = true; return; }
  const stage = canvas.parentElement;
  let width = 0, height = 0, angle = 0.28, frame = 0, lastTime = 0;
  let paused = reducedMotion.matches, visible = true;
  let rendererFailed = false;
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  const ringSteps = 200, tubeSteps = 32;
  const vertices = [], faces = [];
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const normalize = v => { const length = Math.hypot(...v); return v.map(n => n / length); };
  function centre(t) { return [(1.32 + .4 * Math.cos(3*t))*Math.cos(2*t), (1.32 + .4*Math.cos(3*t))*Math.sin(2*t), .58*Math.sin(3*t)]; }
  for (let i=0; i<ringSteps; i++) {
    const t = i/ringSteps*Math.PI*2, c = centre(t), next = centre(t+.001);
    const tangent = normalize(next.map((n,k) => n-c[k]));
    const normal = normalize(cross(tangent,[0,0,1]));
    const binormal = normalize(cross(tangent,normal));
    for (let j=0; j<tubeSteps; j++) {
      const a = j/tubeSteps*Math.PI*2;
      const n = normal.map((v,k) => Math.cos(a)*v + Math.sin(a)*binormal[k]);
      vertices.push({p:c.map((v,k) => v + .34*n[k]), n});
      faces.push([i*tubeSteps+j, ((i+1)%ringSteps)*tubeSteps+j, ((i+1)%ringSteps)*tubeSteps+(j+1)%tubeSteps, i*tubeSteps+(j+1)%tubeSteps]);
    }
  }
  const vertexSource = `
    attribute vec3 position;
    attribute vec3 normal;
    uniform vec3 rotation;
    uniform vec2 dimensions;
    uniform float scale;
    varying vec3 surfaceNormal;
    varying vec3 surfacePosition;
    vec3 rotate(vec3 v) {
      vec3 c=cos(rotation),s=sin(rotation);
      vec3 a=vec3(v.x,v.y*c.x-v.z*s.x,v.y*s.x+v.z*c.x);
      vec3 b=vec3(a.x*c.y+a.z*s.y,a.y,-a.x*s.y+a.z*c.y);
      return vec3(b.x*c.z-b.y*s.z,b.x*s.z+b.y*c.z,b.z);
    }
    void main() {
      vec3 p=rotate(position);
      float perspective=6.7/(6.7-p.z);
      gl_Position=vec4(p.x*scale*perspective*2.0/dimensions.x,-p.y*scale*perspective*2.0/dimensions.y+0.07,-p.z*0.12,1.0);
      surfaceNormal=rotate(normal);
      surfacePosition=p;
    }`;
  const fragmentSource = `
    precision mediump float;
    uniform vec3 material;
    varying vec3 surfaceNormal;
    varying vec3 surfacePosition;
    void main() {
      vec3 n=normalize(surfaceNormal);
      vec3 eye=normalize(vec3(0.0,0.0,6.7)-surfacePosition);
      vec3 key=normalize(vec3(-0.6,-0.9,1.1));
      float diffuse=max(dot(n,key),0.0);
      float fill=max(dot(n,normalize(vec3(0.8,0.2,0.8))),0.0);
      float specular=pow(max(dot(n,normalize(key+eye)),0.0),65.0);
      float broad=pow(max(dot(n,normalize(key+eye)),0.0),9.0);
      float rim=pow(1.0-max(dot(n,eye),0.0),3.0);
      vec3 colour=material*(0.22+0.82*diffuse+0.22*fill)+vec3(0.94,1.0,0.85)*specular*0.88+vec3(0.16)*broad+material*rim*0.22;
      gl_FragColor=vec4(colour,1.0);
    }`;
  function compile(type,source) {
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  }
  const vertexShader=compile(gl.VERTEX_SHADER,vertexSource),fragmentShader=compile(gl.FRAGMENT_SHADER,fragmentSource);
  if (!vertexShader || !fragmentShader) { toggle.hidden=true; return; }
  const program=gl.createProgram();gl.attachShader(program,vertexShader);gl.attachShader(program,fragmentShader);gl.linkProgram(program);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) { toggle.hidden=true; return; }
  gl.useProgram(program);
  function attribute(name,data) {
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
    const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0);
  }
  attribute('position',vertices.flatMap(vertex=>vertex.p));attribute('normal',vertices.flatMap(vertex=>vertex.n));
  const indices=new Uint16Array(faces.flatMap(([a,b,c,d])=>[a,b,c,a,c,d]));
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
  const uniforms=Object.fromEntries(['rotation','dimensions','scale','material'].map(name=>[name,gl.getUniformLocation(program,name)]));
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  function draw() {
    if (!width || !height || gl.isContextLost()) return;
    const scale = Math.min(width*.222,height*.253);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniform3f(uniforms.rotation,.65+pointerY*.2,angle+pointerX*.27,-.29);
    gl.uniform2f(uniforms.dimensions,width,height);gl.uniform1f(uniforms.scale,scale);
    gl.uniform3fv(uniforms.material,mode.hue===77?[.68,.86,.23]:mode.hue===263?[.62,.48,.85]:[.30,.67,.85]);
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
    scene.classList.add('canvas-ready');
  }
  function animate(time) {
    frame=0;
    if (!visible || document.hidden || paused || rendererFailed) return;
    if (time-lastTime>=40) {
      angle+=Math.min(time-lastTime,65)*.00011;
      pointerX+=(targetX-pointerX)*.08;pointerY+=(targetY-pointerY)*.08;
      draw();lastTime=time;
    }
    frame=requestAnimationFrame(animate);
  }
  function requestDraw() { if (rendererFailed) return; draw(); if (!frame && visible && !document.hidden && !paused) frame=requestAnimationFrame(animate); }
  function stop() { cancelAnimationFrame(frame);frame=0; }
  function size() {
    const bounds=stage.getBoundingClientRect();width=bounds.width;height=bounds.height;
    const dpr=Math.min(devicePixelRatio||1,1.6);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);requestDraw();
  }
  function updateToggle() {
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.setAttribute('aria-label',paused?'Play sculpture animation':'Pause sculpture animation');
  }
  toggle.addEventListener('click',()=>{paused=!paused;updateToggle();if(paused)stop();else requestDraw();});
  reducedMotion.addEventListener('change',()=>{paused=reducedMotion.matches;updateToggle();stop();requestDraw();});
  stage.addEventListener('pointermove',event=>{
    if (paused || event.pointerType==='touch') return;
    const rect=stage.getBoundingClientRect();targetX=(event.clientX-rect.left)/rect.width*2-1;targetY=(event.clientY-rect.top)/rect.height*2-1;
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
  canvas.addEventListener('webglcontextlost',()=>{rendererFailed=true;stop();scene.classList.remove('canvas-ready');toggle.hidden=true;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else{lastTime=0;requestDraw();}});
  if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){lastTime=0;requestDraw();}else stop();},{rootMargin:'60px'}).observe(scene);
  if ('ResizeObserver' in window) new ResizeObserver(size).observe(stage);else addEventListener('resize',size);
  renderScene=requestDraw;
  updateToggle();size();
})();
