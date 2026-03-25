  // LOADER
  window.addEventListener('load',()=>setTimeout(()=>document.getElementById('loader').classList.add('hidden'),1800));

  // ======================================
  // MOBILE OPTIMIZATION
  // ======================================
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    || window.innerWidth < 768;

  if (isMobile) {
    // 2. Disable particle canvas - heaviest GPU usage
    const pCanvas = document.getElementById('particle-canvas');
    if (pCanvas) pCanvas.style.display = 'none';

    // 3. Disable blueprint SVG trail
    const bpSvgEl = document.querySelector('svg[style*="position:fixed"]');
    if (bpSvgEl) bpSvgEl.style.display = 'none';

    // 4. Disable custom cursor (no mouse on mobile)
    const cursorEl  = document.getElementById('cursor');
    const ringEl    = document.getElementById('cursorRing');
    const blendEl   = document.getElementById('cursorBlend');
    const labelEl   = document.getElementById('cursor-label');
    [cursorEl, ringEl, blendEl, labelEl].forEach(el => { if(el) el.style.display = 'none'; });
    document.body.style.cursor = 'auto';

    // 5. Disable grain texture (opacity = 0)
    const grainStyle = document.createElement('style');
    grainStyle.textContent = 'body::after{display:none!important;}';
    document.head.appendChild(grainStyle);

    // 6. Disable 3D tilt on images - causes lag on touch scroll
    document.querySelectorAll('.project-card-thumb, .rp-thumb').forEach(el => {
      el.style.transform = 'none';
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
    });

    // 7. Reduce fade-up animations - keep opacity only, remove translateY
    const mobileAnimStyle = document.createElement('style');
    mobileAnimStyle.textContent = `
      .fade-up { transform: none !important; transition: opacity 0.5s ease !important; }
      .fade-up.visible { opacity: 1 !important; transform: none !important; }
      .split-reveal .char { transform: none !important; transition: opacity 0.4s ease !important; }
      .split-reveal.revealed .char { opacity: 1 !important; }
      .section-watermark { display: none; }
      .draw-svg { display: none; }
      .float-label { display: none; }
      #cad-coords { display: none; }
      #scale-ruler { display: none; }
      .project-card { perspective: none !important; }
      .project-card-inner { transform-style: flat !important; }
      body::after { display: none !important; }
      * { transition-duration: 0.2s !important; }
      .loader-bar, .draw-path, .skill-fill { transition-duration: 0.8s !important; }
    `;
    document.head.appendChild(mobileAnimStyle);

    // 8. Disable hue shift on scroll
    const hueEl = document.getElementById('hue-shift-style');
    if (hueEl) hueEl.textContent = '';

    // 10. Disable hero opacity fade (too heavy on mobile)
    const heroLeftEl  = document.querySelector('.hero-left');
    const heroRightEl = document.querySelector('.hero-right');
    if (heroLeftEl)  heroLeftEl.style.opacity  = '1';
    if (heroRightEl) heroRightEl.style.opacity = '1';

    console.log('[Mobile] Heavy effects disabled for better performance');
  }


  // CURSOR
  const cursor=document.getElementById('cursor'),ring=document.getElementById('cursorRing');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  function animCursor(){cursor.style.left=(mx-5)+'px';cursor.style.top=(my-5)+'px';rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=(rx-18)+'px';ring.style.top=(ry-18)+'px';requestAnimationFrame(animCursor);}
  animCursor();
  document.querySelectorAll('a,button,.project-card,.activity-card,.photo-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cursor.style.transform='scale(2)';ring.style.transform='scale(1.5)';});
    el.addEventListener('mouseleave',()=>{cursor.style.transform='scale(1)';ring.style.transform='scale(1)';});
  });

  // CURSOR ADAPTIVE COLOR
  // dark bg (projects, hobbies, footer) -> white cursor
  // rust/orange bg (ai-section, stats-bar) -> white cursor
  // light bg (hero-left, about, activities, contact-form) -> rust cursor
  const cursorColorMap = [
    { selector: '#projects',             color: '#ffffff', ring: 'rgba(255,255,255,0.5)' },
    { selector: '#hobbies',              color: '#ffffff', ring: 'rgba(255,255,255,0.5)' },
    { selector: '#contact',              color: '#ffffff', ring: 'rgba(255,255,255,0.5)' },
    { selector: '#aiSection',             color: '#f5f0e8', ring: 'rgba(245,240,232,0.6)' },
    { selector: '#statsBar',              color: '#f5f0e8', ring: 'rgba(245,240,232,0.6)' },
    { selector: '#home',                 color: '#b84c2a', ring: 'rgba(184,76,42,0.4)'  },
    { selector: '#about',                color: '#b84c2a', ring: 'rgba(184,76,42,0.4)'  },
    { selector: '#activities',           color: '#0e0c0a', ring: 'rgba(14,12,10,0.3)'   },
    { selector: '#contact-form-section', color: '#b84c2a', ring: 'rgba(184,76,42,0.4)'  },
  ];
  let currentCursorColor = '#b84c2a';
  let currentRingColor   = 'rgba(184,76,42,0.4)';
  function setCursorColor(c, r){
    if(c === currentCursorColor) return;
    currentCursorColor = c; currentRingColor = r;
    cursor.style.transition = 'background 0.3s ease, transform 0.1s ease';
    ring.style.transition    = 'border-color 0.3s ease, all 0.18s ease';
    cursor.style.background  = c;
    cursor.style.mixBlendMode = (c === "#ffffff" || c === "#f5f0e8") ? "normal" : "multiply";
    ring.style.borderColor   = r;
  }
  const colorObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(!e.isIntersecting) return;
      const match = cursorColorMap.find(m => e.target.matches(m.selector));
      if(match) setCursorColor(match.color, match.ring);
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  cursorColorMap.forEach(m => {
    document.querySelectorAll(m.selector).forEach(el => colorObs.observe(el));
  });

  // TABS
  function switchTab(id,btn){document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.getElementById('tab-'+id).classList.add('active');btn.classList.add('active');}

  // SCROLL ANIMATIONS + SKILL BARS
  const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');e.target.querySelectorAll('.skill-fill').forEach(b=>b.classList.add('animated'));}});},{threshold:0.15});
  document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));
  const sio=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.skill-fill').forEach(b=>b.classList.add('animated'));});},{threshold:0.2});
  const ab=document.getElementById('about');if(ab)sio.observe(ab);

  // STATS COUNTER
  let counted=false;
  const statsObs=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting&&!counted){
      counted=true;
      document.querySelectorAll('.count').forEach(el=>{
        const target=+el.dataset.target; let cur=0;
        const step=Math.ceil(target/30);
        const t=setInterval(()=>{cur=Math.min(cur+step,target);el.textContent=cur;if(cur>=target)clearInterval(t);},40);
      });
    }
  },{threshold:0.5});
  const sb=document.getElementById('statsBar');if(sb)statsObs.observe(sb);

  // NAV COLOR
  const navEl=document.querySelector('nav');
  const darkSections=['projects','hobbies','contact'];
  const navObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)navEl.classList.toggle('nav-dark',darkSections.includes(e.target.id));});},{rootMargin:'-60px 0px -85% 0px'});
  document.querySelectorAll('section[id],footer[id]').forEach(s=>navObs.observe(s));

  // CONTACT FORM (Formspree)
  const form=document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const btn=form.querySelector('.cf-submit');
      btn.textContent='Sendingâ€¦';btn.disabled=true;
      try{
        const res=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}});
        if(res.ok){form.reset();document.getElementById('cfSuccess').classList.add('show');btn.textContent='âœ“ Sent';}
        else{btn.textContent='Error â€” try email instead';btn.disabled=false;}
      }catch{btn.textContent='Error â€” try email instead';btn.disabled=false;}
    });
  }

  // LIGHTBOX
  const lb=document.getElementById('lightbox'),lbImg=document.getElementById('lbImg'),lbCaption=document.getElementById('lbCaption'),lbCounter=document.getElementById('lbCounter');
  let lbImages=[],lbIndex=0;
  function collectImages(){lbImages=[];document.querySelectorAll('.photo-item').forEach(item=>{const img=item.querySelector('img');if(!img||img.style.display==='none'||!img.src||img.src===window.location.href)return;const cap=item.querySelector('.photo-placeholder span:not(.photo-icon):not(.photo-caption)');lbImages.push({src:img.src,alt:img.alt||'',caption:cap?cap.textContent:img.alt});});lbImages=lbImages.filter((v,i,a)=>a.findIndex(t=>t.src===v.src)===i);}
  function openLightbox(src){collectImages();lbIndex=lbImages.findIndex(i=>i.src===src);if(lbIndex<0)lbIndex=0;showLbImage();lb.classList.add('active');document.body.style.overflow='hidden';}
  function showLbImage(){const item=lbImages[lbIndex];if(!item)return;lbImg.style.cssText='opacity:0;transform:scale(0.96);transition:opacity 0.2s,transform 0.2s';setTimeout(()=>{lbImg.src=item.src;lbImg.alt=item.alt;lbCaption.textContent=item.caption;lbCounter.textContent=(lbIndex+1)+' / '+lbImages.length;lbImg.style.cssText='opacity:1;transform:scale(1);transition:opacity 0.2s,transform 0.2s';},120);}
  function closeLightbox(){lb.classList.remove('active');document.body.style.overflow='';}
  document.querySelectorAll('.photo-item').forEach(item=>{item.addEventListener('click',()=>{const img=item.querySelector('img');if(img&&img.style.display!=='none'&&img.src&&img.src!==window.location.href)openLightbox(img.src);});});
  document.getElementById('lbClose').addEventListener('click',closeLightbox);
  document.getElementById('lbPrev').addEventListener('click',e=>{e.stopPropagation();lbIndex=(lbIndex-1+lbImages.length)%lbImages.length;showLbImage();});
  document.getElementById('lbNext').addEventListener('click',e=>{e.stopPropagation();lbIndex=(lbIndex+1)%lbImages.length;showLbImage();});
  lb.addEventListener('click',e=>{if(e.target===lb)closeLightbox();});
  document.addEventListener('keydown',e=>{if(!lb.classList.contains('active'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft'){lbIndex=(lbIndex-1+lbImages.length)%lbImages.length;showLbImage();}if(e.key==='ArrowRight'){lbIndex=(lbIndex+1)%lbImages.length;showLbImage();}});

  // ======================================
  // FUN UI FEATURES
  // ======================================

  // 1. CURSOR TRAIL
  const trailPool = [];
  const TRAIL_COUNT = 10;
  for(let i=0;i<TRAIL_COUNT;i++){
    const d=document.createElement('div');
    d.style.cssText='position:fixed;pointer-events:none;z-index:9990;border-radius:50%;width:6px;height:6px;opacity:0;transition:opacity 0.4s ease;transform:translate(-50%,-50%)';
    document.body.appendChild(d);
    trailPool.push({el:d,x:0,y:0});
  }
  let trailTick=0;
  document.addEventListener('mousemove',e=>{
    trailTick=(trailTick+1)%TRAIL_COUNT;
    const t=trailPool[trailTick];
    t.x=e.clientX; t.y=e.clientY;
    t.el.style.left=e.clientX+'px';
    t.el.style.top=e.clientY+'px';
    t.el.style.background=currentCursorColor;
    t.el.style.opacity='0.35';
    setTimeout(()=>{t.el.style.opacity='0';},300);
  });

  // 2. CLICK RIPPLE
  document.addEventListener('click',e=>{
    const r=document.createElement('div');
    r.style.cssText=`position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:8px;height:8px;border-radius:50%;border:2px solid ${currentCursorColor};transform:translate(-50%,-50%) scale(1);pointer-events:none;z-index:9995;opacity:0.8;transition:transform 0.6s ease,opacity 0.6s ease;`;
    document.body.appendChild(r);
    requestAnimationFrame(()=>{
      r.style.transform='translate(-50%,-50%) scale(8)';
      r.style.opacity='0';
    });
    setTimeout(()=>r.remove(),700);
  });

  // 3. HERO PARALLAX (mouse move on hero section)
  const heroName=document.querySelector('.hero-name');
  const heroTagline=document.querySelector('.hero-tagline');
  const heroSection=document.querySelector('.hero');
  if(heroSection&&heroName){
    heroSection.addEventListener('mousemove',e=>{
      const rect=heroSection.getBoundingClientRect();
      const cx=(e.clientX-rect.left)/rect.width-0.5;
      const cy=(e.clientY-rect.top)/rect.height-0.5;
      heroName.style.transform=`translate(${cx*18}px,${cy*10}px)`;
      heroName.style.transition='transform 0.1s ease';
      if(heroTagline){heroTagline.style.transform=`translate(${cx*10}px,${cy*6}px)`;heroTagline.style.transition='transform 0.1s ease';}
    });
    heroSection.addEventListener('mouseleave',()=>{
      heroName.style.transform='';
      if(heroTagline)heroTagline.style.transform='';
    });
  }

  // 4. MAGNETIC BUTTONS
  document.querySelectorAll('.btn-cv,.cf-submit,.nav-lang').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)*0.3;
      const dy=(e.clientY-r.top-r.height/2)*0.3;
      btn.style.transform=`translate(${dx}px,${dy}px)`;
      btn.style.transition='transform 0.1s ease';
    });
    btn.addEventListener('mouseleave',()=>{
      btn.style.transform='';
      btn.style.transition='transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    });
  });

  // 5. TEXT SCRAMBLE on section titles
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#';
  function scramble(el){
    const original=el.textContent;
    let frame=0; const totalFrames=18;
    const interval=setInterval(()=>{
      el.textContent=original.split('').map((c,i)=>{
        if(c===' ')return ' ';
        if(frame/totalFrames>i/original.length)return c;
        return chars[Math.floor(Math.random()*chars.length)];
      }).join('');
      frame++;
      if(frame>totalFrames){el.textContent=original;clearInterval(interval);}
    },40);
  }
  const scrambleObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting&&!e.target.dataset.scrambled){
        e.target.dataset.scrambled='1';
        scramble(e.target);
      }
    });
  },{threshold:0.5});
  document.querySelectorAll('.section-title').forEach(t=>scrambleObs.observe(t));



  // NEW FEATURES

  // A. SCROLL PROGRESS BAR
  const progressBar=document.getElementById('scroll-progress');
  window.addEventListener('scroll',()=>{
    const pct=window.scrollY/(document.body.scrollHeight-window.innerHeight)*100;
    progressBar.style.width=pct+'%';
  },{passive:true});

  // B. BACK TO TOP
  const backTop=document.getElementById('back-top');
  window.addEventListener('scroll',()=>{
    backTop.classList.toggle('visible',window.scrollY>600);
  },{passive:true});
  backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // C. IMAGE TILT 3D
  document.querySelectorAll('.project-card-thumb,.rp-thumb').forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const cx=(e.clientX-r.left)/r.width-0.5;
      const cy=(e.clientY-r.top)/r.height-0.5;
      el.style.transform=`perspective(600px) rotateY(${cx*14}deg) rotateX(${-cy*10}deg) scale(1.03)`;
      el.style.transition='transform 0.1s ease';
    });
    el.addEventListener('mouseleave',()=>{
      el.style.transform='perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
      el.style.transition='transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    });
  });

  // D. PAGE TRANSITION WIPE
  const wipe=document.getElementById('page-wipe');
  document.querySelectorAll('a[href]').forEach(a=>{
    const href=a.getAttribute('href');
    if(!href||href.startsWith('#')||href.startsWith('mailto')||href.startsWith('tel')||href.startsWith('http')||a.hasAttribute('download')) return;
    a.addEventListener('click',e=>{
      e.preventDefault();
      wipe.classList.add('wipe-in');
      setTimeout(()=>window.location.href=href,450);
    });
  });
  window.addEventListener('pageshow',()=>{
    wipe.classList.remove('wipe-in');
    requestAnimationFrame(()=>wipe.classList.add('wipe-out'));
    setTimeout(()=>wipe.classList.remove('wipe-out'),500);
  });

  // E. SKELETON SHIMMER on images before load
  document.querySelectorAll('img').forEach(img=>{
    if(!img.complete){
      img.classList.add('img-skeleton');
      img.addEventListener('load',()=>img.classList.remove('img-skeleton'),{once:true});
      img.addEventListener('error',()=>img.classList.remove('img-skeleton'),{once:true});
    }
  });

  // 7. THEME SWITCHER
  const themes=['light','dark','blueprint','mono'];
  let currentTheme='light';
  function applyTheme(t){
    themes.forEach(th=>document.body.classList.remove('theme-'+th));
    if(t!=='light') document.body.classList.add('theme-'+t);
    currentTheme=t;
    document.querySelectorAll('.theme-dot').forEach(d=>{
      d.classList.toggle('active',d.dataset.theme===t);
    });
    localStorage.setItem('btk-theme',t);
  }
  // Load saved theme or auto-detect dark mode
  const savedTheme=localStorage.getItem('btk-theme');
  if(savedTheme) {
    applyTheme(savedTheme);
  } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }
  // Listen for OS theme changes
  if(window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if(!localStorage.getItem('btk-theme')) applyTheme(e.matches ? 'dark' : 'light');
    });
  }
  // Dot click
  document.querySelectorAll('.theme-dot').forEach(d=>{
    d.addEventListener('click',()=>{
      applyTheme(d.dataset.theme);
      document.body.setAttribute('data-theme-set','1');
    });
  });

  // ======================================
  // POLISH FEATURES
  // ======================================

  // 1. ACTIVE NAV HIGHLIGHT
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const allSections = document.querySelectorAll('section[id], footer[id], div[id="aiSection"], div[id="statsBar"]');
  const navHighlightObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navAnchors.forEach(a => {
        a.classList.remove('nav-active');
        if (a.getAttribute('href') === '#' + e.target.id) {
          a.classList.add('nav-active');
        }
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  allSections.forEach(s => navHighlightObs.observe(s));

  // 2. CURSOR BLEND MODE â€” activates over dark sections + images
  const cursorBlend = document.getElementById('cursorBlend');
  let blendMx = 0, blendMy = 0;
  document.addEventListener('mousemove', e => {
    blendMx = e.clientX; blendMy = e.clientY;
    cursorBlend.style.left = blendMx + 'px';
    cursorBlend.style.top  = blendMy + 'px';
  });
  // Activate blend on dark bg elements
  const blendTargets = document.querySelectorAll(
    '#projects, #hobbies, footer, .ai-section, .stats-bar, .photo-item, .project-card, #loader'
  );
  blendTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursorBlend.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorBlend.classList.remove('active'));
  });

  // 3. LAZY LOAD â€” fade in images when they enter viewport
  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  const lazyObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        if (img.complete) img.classList.add('loaded');
        lazyObs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  lazyImgs.forEach(img => lazyObs.observe(img));

  // 4. DYNAMIC FOOTER YEAR
  const fyEl = document.getElementById('footerYear');
  if (fyEl) fyEl.textContent = new Date().getFullYear();

  // 5. SMOOTH SCROLL for nav anchor links (override default)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // 6. CUSTOM SCROLLBAR color sync with theme
  function updateScrollbarTheme(t) {
    const colors = {
      light: '#b84c2a', dark: '#c4652a',
      blueprint: '#00bcd4', mono: '#111'
    };
    document.documentElement.style.setProperty('--scrollbar-color', colors[t] || '#b84c2a');
  }
  // Hook into applyTheme
  const _origApplyTheme = applyTheme;
  applyTheme = function(t) { _origApplyTheme(t); updateScrollbarTheme(t); };
  updateScrollbarTheme(currentTheme || 'light');


  // â”€â”€ SCROLL LINE DRAWING â”€â”€
  const drawPaths = document.querySelectorAll('.draw-path');
  const drawObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('drawn');
        drawObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  drawPaths.forEach(p => drawObs.observe(p));

  // â”€â”€ SPLIT TEXT REVEAL â”€â”€
  const splitEls = document.querySelectorAll('.split-reveal');
  const splitObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
      e.target.classList.add('revealed');
        splitObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  splitEls.forEach(el => splitObs.observe(el));


  // ======================================
  // PARTICLE FIELD â€” GPU Canvas
  // ======================================
  (function(){
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Config
    const CONFIG = {
      count: 80,
      maxDist: 140,       // max distance to draw connection line
      mouseRadius: 180,   // mouse influence radius
      mouseForce: 0.012,  // how strongly particles repel from mouse
      speed: 0.35,
      particleRadius: 1.8,
      lineWidth: 0.5,
    };

    let W, H, dpr, animId;
    let mouseX = -9999, mouseY = -9999;
    let particles = [];

    // Colors â€” sync with theme
    function getColors() {
      const style = getComputedStyle(document.body);
      const isDark = document.body.classList.contains('theme-dark');
      const isBP   = document.body.classList.contains('theme-blueprint');
      const isMono = document.body.classList.contains('theme-mono');
      if (isBP)   return { dot: '#00bcd4', line: '#00bcd4' };
      if (isMono) return { dot: '#555',    line: '#333'    };
      if (isDark) return { dot: '#c4652a', line: '#c4652a' };
      return { dot: '#b84c2a', line: '#b84c2a' };
    }

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(dpr, dpr);
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < CONFIG.count; i++) {
        particles.push({
          x:  Math.random() * W,
          y:  Math.random() * H,
          vx: (Math.random() - 0.5) * CONFIG.speed,
          vy: (Math.random() - 0.5) * CONFIG.speed,
          r:  CONFIG.particleRadius * (0.6 + Math.random() * 0.8),
          opacity: 0.3 + Math.random() * 0.5,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const colors = getColors();

      // Update + draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius && dist > 0) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
          p.vx += (dx / dist) * force * CONFIG.mouseForce * 8;
          p.vy += (dy / dist) * force * CONFIG.mouseForce * 8;
        }

        // Velocity damping
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Speed cap
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > CONFIG.speed * 3) {
          p.vx = (p.vx / speed) * CONFIG.speed * 3;
          p.vy = (p.vy / speed) * CONFIG.speed * 3;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = colors.dot
          .replace(')', `,${p.opacity})`)
          .replace('rgb', 'rgba')
          .replace('#b84c2a', `rgba(184,76,42,${p.opacity})`)
          .replace('#c4652a', `rgba(196,101,42,${p.opacity})`)
          .replace('#00bcd4', `rgba(0,188,212,${p.opacity})`)
          .replace('#555',    `rgba(85,85,85,${p.opacity})`);

        // Simpler approach
        ctx.fillStyle = hexToRgba(colors.dot, p.opacity);
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx2 = p.x - q.x;
          const dy2 = p.y - q.y;
          const d2  = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (d2 < CONFIG.maxDist) {
            const alpha = (1 - d2 / CONFIG.maxDist) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = hexToRgba(colors.line, alpha);
            ctx.lineWidth   = CONFIG.lineWidth;
            ctx.stroke();
          }
        }

        // Draw mouse connection (closest 5 particles to mouse)
        if (dist < CONFIG.mouseRadius * 1.2) {
          const alpha = (1 - dist / (CONFIG.mouseRadius * 1.2)) * 0.4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = hexToRgba(colors.line, alpha);
          ctx.lineWidth   = CONFIG.lineWidth * 0.8;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    function hexToRgba(hex, a) {
      // Handle both hex and named colors
      const map = {
        '#b84c2a': `rgba(184,76,42,${a})`,
        '#c4652a': `rgba(196,101,42,${a})`,
        '#00bcd4': `rgba(0,188,212,${a})`,
        '#555':    `rgba(85,85,85,${a})`,
        '#333':    `rgba(51,51,51,${a})`,
      };
      return map[hex] || `rgba(184,76,42,${a})`;
    }

    // Init
    resize();
    createParticles();
    draw();
    setTimeout(() => canvas.classList.add('visible'), 100);

    // Events
    window.addEventListener('resize', () => {
      cancelAnimationFrame(animId);
      resize();
      draw();
    });

    const heroEl = document.getElementById('home');
    if (heroEl) {
      heroEl.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouseX = e.clientX - r.left;
        mouseY = e.clientY - r.top;
      });
      heroEl.addEventListener('mouseleave', () => {
        mouseX = -9999; mouseY = -9999;
      });
    }

    // Touch support
    heroEl && heroEl.addEventListener('touchmove', e => {
      const r = canvas.getBoundingClientRect();
      mouseX = e.touches[0].clientX - r.left;
      mouseY = e.touches[0].clientY - r.top;
    }, { passive: true });

    // Performance: pause when tab not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else draw();
    });

  })();


  // ======================================
  // 10 NEW EFFECTS
  // ======================================


  // 2. COLOR SHIFT ON SCROLL
  function updateHueShift() {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const hue = Math.round(pct * 18); // 0 â†’ 18 degrees
    document.documentElement.style.setProperty('--hue-shift', hue + 'deg');
  }
  // Apply hue shift via filter on rust-colored elements dynamically
  const hueStyle = document.createElement('style');
  hueStyle.id = 'hue-shift-style';
  document.head.appendChild(hueStyle);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const hue = Math.round(pct * 20);
    hueStyle.textContent = `
      .scroll-line, #scroll-progress, .skill-fill,
      .project-card::before, .section-num, .hero-name span,
      .hero-label, .loader-bar {
        filter: hue-rotate(${hue}deg);
      }
    `;
  }, { passive: true });

  // 3. PROJECT CARD SHINE (holographic)
  document.querySelectorAll('.project-card').forEach(card => {
    const thumb = card.querySelector('.project-card-thumb');
    if (!thumb) return;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      thumb.style.setProperty('--shine-x', x + '%');
      thumb.style.setProperty('--shine-y', y + '%');
      if (thumb.querySelector('img')) {
        thumb.style.backgroundImage =
          `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      thumb.style.backgroundImage = '';
    });
  });



  // 5. AUDIO â€” subtle ambient tone on project card hover (Web Audio API)
  let audioCtx;
  function playTone(freq = 440, type = 'sine', dur = 0.18) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }
  const tones = [261, 293, 329, 349, 392]; // C D E F G â€” pentatonic
  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.addEventListener('mouseenter', () => playTone(tones[i % tones.length] * 1.5, 'triangle', 0.22));
  });
  document.querySelectorAll('.activity-card').forEach((card, i) => {
    card.addEventListener('mouseenter', () => playTone(tones[i % tones.length], 'sine', 0.15));
  });
  document.querySelectorAll('.photo-item').forEach((item, i) => {
    item.addEventListener('mouseenter', () => playTone(tones[i % tones.length] * 2, 'sine', 0.1));
  });


  // 7. LOADER PERCENTAGE COUNTER
  const loaderPct = document.getElementById('loader-pct');
  if (loaderPct) {
    let pct = 0;
    const pctTimer = setInterval(() => {
      pct = Math.min(pct + Math.random() * 12, 99);
      loaderPct.textContent = Math.round(pct) + '%';
    }, 100);
    window.addEventListener('load', () => {
      clearInterval(pctTimer);
      loaderPct.textContent = '100%';
    });
  }

  // 10. TIME-BASED GREETING
  const greetEl = document.getElementById('time-greeting');
  if (greetEl) {
    const h = new Date().getHours();
    let greet;
    if (h >= 5  && h < 12) greet = 'Good morning, Khang â˜€ï¸';
    else if (h >= 12 && h < 17) greet = 'Good afternoon, Khang ðŸŒ¤';
    else if (h >= 17 && h < 21) greet = 'Good evening, Khang ðŸŒ…';
    else greet = 'Still working, Khang? ðŸŒ™';
    greetEl.textContent = greet;
  }


  // â”€â”€ REAL-TIME CLOCK (Vietnam) â”€â”€
  function updateClock() {
    const now = new Date();
    const vn = now.toLocaleTimeString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    const el = document.getElementById('clockVN');
    if (el) el.textContent = vn;
  }
  updateClock();
  setInterval(updateClock, 1000);


  // â”€â”€ BACKGROUND MUSIC â”€â”€
  const bgMusic = document.getElementById('bgMusic');
  const musicBtn = document.getElementById('musicBtn');
  let musicPlaying = false;

  function toggleMusic() {
    if (!bgMusic) return;
    if (musicPlaying) {
      bgMusic.pause();
      musicBtn.classList.remove('playing');
      musicPlaying = false;
    } else {
      bgMusic.volume = 0;
      bgMusic.play().then(() => {
        musicPlaying = true;
        musicBtn.classList.add('playing');
        // Fade in volume smoothly
        let vol = 0;
        const fadeIn = setInterval(() => {
          vol = Math.min(vol + 0.02, 0.3); // max 30% volume
          bgMusic.volume = vol;
          if (vol >= 0.3) clearInterval(fadeIn);
        }, 60);
      }).catch(() => {});
    }
  }

  // Fade out when leaving page
  window.addEventListener('beforeunload', () => {
    if (bgMusic && !bgMusic.paused) {
      bgMusic.volume = 0;
    }
  });

  // Pause when tab hidden, resume when visible
  document.addEventListener('visibilitychange', () => {
    if (!bgMusic || !musicPlaying) return;
    if (document.hidden) {
      bgMusic.pause();
    } else {
      bgMusic.play().catch(() => {});
    }
  });


  // ======================================
  // 10 NEW COMBO EFFECTS Aâ†’Z
  // ======================================

  // 1. CUSTOM RIGHT-CLICK CONTEXT MENU
  const ctxMenu = document.getElementById('ctx-menu');
  function hideCtx(){ ctxMenu.classList.remove('show'); }
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth  - 210);
    const y = Math.min(e.clientY, window.innerHeight - 260);
    ctxMenu.style.left = x + 'px';
    ctxMenu.style.top  = y + 'px';
    ctxMenu.classList.add('show');
  });
  document.addEventListener('click', hideCtx);
  document.addEventListener('scroll', hideCtx, { passive: true });

  // 2. DRAG TO EXPLORE photo mosaic
  const mosaic = document.querySelector('.photo-mosaic');
  if (mosaic) {
    let isDragging = false, startX = 0, scrollLeft = 0;
    mosaic.style.overflowX = 'auto';
    mosaic.style.cursor = 'grab';
    mosaic.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.pageX - mosaic.offsetLeft;
      scrollLeft = mosaic.scrollLeft;
      mosaic.style.cursor = 'grabbing';
      mosaic.style.userSelect = 'none';
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
      mosaic.style.cursor = 'grab';
    });
    mosaic.addEventListener('mousemove', e => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - mosaic.offsetLeft;
      mosaic.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
  }

  // 3. DOUBLE-CLICK CONFETTI
  document.addEventListener('dblclick', e => {
    const colors = ['#b84c2a','#d4a96a','#f5f0e8','#c4652a','#8a7f72'];
    for (let i = 0; i < 28; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const angle = (Math.random() * 360) * Math.PI / 180;
      const dist  = 80 + Math.random() * 140;
      el.style.cssText = `
        left:${e.clientX}px;top:${e.clientY}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        --tx:${Math.cos(angle)*dist}px;
        --ty:${Math.sin(angle)*dist + 60}px;
        --rot:${Math.random()*720-360}deg;
        --dur:${0.6+Math.random()*0.6}s;
        width:${4+Math.random()*8}px;
        height:${4+Math.random()*8}px;
        border-radius:${Math.random()>0.5?'50%':'2px'};
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    }
  });

  // 4. HERO SCROLL OPACITY
  const heroLeft  = document.querySelector('.hero-left');
  const heroRight = document.querySelector('.hero-right');
  window.addEventListener('scroll', () => {
    const heroH = document.querySelector('.hero')?.offsetHeight || window.innerHeight;
    const pct   = Math.min(window.scrollY / (heroH * 0.6), 1);
    if (heroLeft)  heroLeft.style.opacity  = 1 - pct * 0.7;
    if (heroRight) heroRight.style.opacity = 1 - pct * 0.4;
  }, { passive: true });

  // 5. FLOATING LABELS â€” already HTML+CSS, no extra JS needed

  // 6. PROJECT CARD FLIP
  function flipCard(card) {
    // Don't flip if clicking a link inside
    card.classList.toggle('flipped');
  }
  // Prevent flip when clicking inner links/buttons
  document.querySelectorAll('.project-card a, .project-card button').forEach(el => {
    el.addEventListener('click', e => e.stopPropagation());
  });

  // 7. BLUEPRINT CURSOR TRAIL
  const bpSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  bpSvg.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9989;';
  document.body.appendChild(bpSvg);
  const trailPoints = [];
  const MAX_TRAIL = 18;
  document.addEventListener('mousemove', e => {
    trailPoints.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    if (trailPoints.length > MAX_TRAIL) trailPoints.shift();
    // Clear old lines
    while (bpSvg.firstChild) bpSvg.removeChild(bpSvg.firstChild);
    // Draw technical lines
    for (let i = 1; i < trailPoints.length; i++) {
      const a = trailPoints[i-1], b = trailPoints[i];
      const age = (Date.now() - b.t) / 500;
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.setAttribute('stroke', 'var(--rust)');
      line.setAttribute('stroke-width', '0.6');
      line.setAttribute('opacity', Math.max(0, (1 - age) * 0.35));
      bpSvg.appendChild(line);
      // Add tick marks every 4 points
      if (i % 4 === 0) {
        const tick = document.createElementNS('http://www.w3.org/2000/svg','line');
        const dx = b.y - a.y, dy = -(b.x - a.x);
        const len = Math.sqrt(dx*dx+dy*dy) || 1;
        tick.setAttribute('x1', b.x - (dx/len)*4);
        tick.setAttribute('y1', b.y - (dy/len)*4);
        tick.setAttribute('x2', b.x + (dx/len)*4);
        tick.setAttribute('y2', b.y + (dy/len)*4);
        tick.setAttribute('stroke', 'var(--rust)');
        tick.setAttribute('stroke-width', '0.5');
        tick.setAttribute('opacity', Math.max(0, (1-age)*0.2));
        bpSvg.appendChild(tick);
      }
    }
  });

  // 8. CAD COORDINATES
  const cadEl = document.getElementById('cad-coords');
  document.addEventListener('mousemove', e => {
    if (cadEl) cadEl.innerHTML =
      `X:&nbsp;${String(e.clientX).padStart(4,'0')} &nbsp; Y:&nbsp;${String(e.clientY).padStart(4,'0')}`;
  });

  // 9. SCALE RULER â€” changes label based on scroll depth
  const rulerLabel = document.querySelector('#scale-ruler span:last-child');
  const scales = ['10m','20m','50m','100m','200m'];
  const scaleNums = ['1:100','1:200','1:500','1:1000','1:2000'];
  const rulerNum = document.querySelector('#scale-ruler span:first-child');
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const idx = Math.min(Math.floor(pct * scales.length), scales.length - 1);
    if (rulerLabel) rulerLabel.textContent = scales[idx];
    if (rulerNum)   rulerNum.textContent   = scaleNums[idx];
  }, { passive: true });

  // 10. SHAKE TO RANDOMIZE THEME (DeviceMotion)
  const shakeToast = document.getElementById('shakeToast');
  let lastShake = 0, shakeAcc = 0;
  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', e => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const total = Math.abs(a.x||0) + Math.abs(a.y||0) + Math.abs(a.z||0);
      shakeAcc = shakeAcc * 0.8 + total * 0.2;
      const now = Date.now();
      if (shakeAcc > 28 && now - lastShake > 1500) {
        lastShake = now;
        const t = themes[Math.floor(Math.random() * themes.length)];
        applyTheme(t);
        if (shakeToast) {
          shakeToast.classList.add('show');
          setTimeout(() => shakeToast.classList.remove('show'), 2000);
        }
      }
    });
  }


  // â”€â”€ PROJECT SLIDESHOW â”€â”€
  function getSlides(wrap) {
    return Array.from(wrap.querySelectorAll('.slide-img'));
  }
  function getDots(wrap) {
    return Array.from(wrap.querySelectorAll('.slide-dot'));
  }
  function showSlide(wrap, idx) {
    const slides = getSlides(wrap);
    const dots   = getDots(wrap);
    const cur    = wrap.querySelector('.slide-cur');
    if (!slides.length) return;
    idx = (idx + slides.length) % slides.length;
    slides.forEach((s,i) => {
      s.classList.toggle('active', i === idx);
      s.style.opacity = i === idx ? (wrap.classList.contains('rp-thumb') ? '0.75' : '0.85') : '0';
      if (i === idx) s.style.position = 'relative';
      else s.style.position = 'absolute';
    });
    dots.forEach((d,i) => d.classList.toggle('active', i === idx));
    if (cur) cur.textContent = idx + 1;
    wrap._slideIdx = idx;
  }
  function nextSlide(wrap, e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    showSlide(wrap, (wrap._slideIdx || 0) + 1);
  }
  function prevSlide(wrap, e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    showSlide(wrap, (wrap._slideIdx || 0) - 1);
  }
  function goSlide(wrap, idx, e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    showSlide(wrap, idx);
  }
  function startSlide(wrap) {
    if (wrap._slideTimer) return;
    wrap._slideTimer = setInterval(() => nextSlide(wrap), 1800);
  }
  function stopSlide(wrap) {
    clearInterval(wrap._slideTimer);
    wrap._slideTimer = null;
  }
  // Init all slideshows
  document.querySelectorAll('.project-card-thumb, .rp-thumb').forEach(wrap => {
    wrap._slideIdx = 0;
    showSlide(wrap, 0);
  });


  // â”€â”€ MESSENGER CHAT POPUP â”€â”€
  let chatOpen = false;
  let chatTypingDone = false;

  function toggleChat() {
    const popup = document.getElementById('chat-popup');
    const notify = document.querySelector('.chat-notify');
    chatOpen = !chatOpen;
    popup.classList.toggle('open', chatOpen);
    // Hide notification dot when opened
    if (chatOpen && notify) {
      notify.style.display = 'none';
      // Show typing then hide after 2s
      if (!chatTypingDone) {
        chatTypingDone = true;
        const typing = document.getElementById('chatTyping');
        if (typing) setTimeout(() => typing.style.display = 'none', 2000);
      }
    }
  }

  // Auto-open after 8s with a little bounce
  setTimeout(() => {
    const btn = document.getElementById('chat-btn');
    if (btn) {
      btn.style.animation = 'chatBounce 0.6s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => btn.style.animation = '', 600);
    }
  }, 8000);

  // Close when clicking outside
  document.addEventListener('click', e => {
    const popup = document.getElementById('chat-popup');
    const btn   = document.getElementById('chat-btn');
    if (chatOpen && popup && btn && !popup.contains(e.target) && !btn.contains(e.target)) {
      chatOpen = false;
      popup.classList.remove('open');
    }
  });

  // ======================================
  // NEW FUNCTIONAL FEATURES
  // ======================================

  // 1. PROJECT FILTER
  function filterProjects(cat, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const allCards = document.querySelectorAll('.project-card[data-category], .real-project-item[data-category]');
    allCards.forEach(card => {
      if (cat === 'all' || card.dataset.category === cat) {
        card.style.display = '';
        card.style.opacity = '1';
      } else {
        card.style.opacity = '0';
        setTimeout(() => card.style.display = 'none', 200);
      }
    });
  }

  // 2. PROJECT DETAIL MODAL
  document.querySelectorAll('.project-card .project-card-arrow').forEach(arrow => {
    arrow.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = this.closest('.project-card');
      const modal = document.getElementById('projectModal');
      const numEl = card.querySelector('.project-card-num');
      const titleEl = card.querySelector('.project-card-title');
      const descEl = card.querySelector('.back-desc') || card.querySelector('.project-card-sub');
      const metaEl = card.querySelector('.back-meta');
      const imgs = card.querySelectorAll('.slide-img');

      document.getElementById('pmNum').textContent = numEl ? numEl.textContent : '';
      document.getElementById('pmTitle').textContent = titleEl ? titleEl.textContent : '';
      document.getElementById('pmDesc').textContent = descEl ? descEl.textContent : '';
      document.getElementById('pmMeta').textContent = metaEl ? metaEl.textContent : '';

      const gallery = document.getElementById('pmGallery');
      gallery.innerHTML = '';
      imgs.forEach(img => {
        const clone = document.createElement('img');
        clone.src = img.src;
        clone.alt = img.alt;
        clone.loading = 'lazy';
        gallery.appendChild(clone);
      });

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modals on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('cvModal').classList.remove('active');
      document.getElementById('projectModal').classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // 3. LANGUAGE AUTO-DETECT
  (function(){
    if (localStorage.getItem('btkLangDismissed')) return;
    const isVi = /^vi/i.test(navigator.language || '');
    if (isVi) {
      setTimeout(() => document.getElementById('langSuggest').classList.add('show'), 3000);
    }
  })();

  // 4. SERVICE WORKER REGISTRATION
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('[SW] Registered:', reg.scope);
      }).catch(err => console.log('[SW] Registration failed:', err));
    });
  }

  // 5. ARIA ENHANCEMENTS
  (function(){
    // Tab panels
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', btn.classList.contains('active'));
    });
    document.querySelectorAll('.tab-panel').forEach(p => p.setAttribute('role', 'tabpanel'));
    // Lightbox
    const lbEl = document.getElementById('lightbox');
    if (lbEl) { lbEl.setAttribute('role', 'dialog'); lbEl.setAttribute('aria-label', 'Image Lightbox'); }
    // Chat
    const chatPopup = document.getElementById('chat-popup');
    if (chatPopup) { chatPopup.setAttribute('role', 'dialog'); chatPopup.setAttribute('aria-label', 'Chat with Khang'); }
  })();

