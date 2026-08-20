/* ==========================================================
   BUGATTI — Cinematic Site Script
   Sections: Preloader / Video Manager / Nav / Cursor /
             ScrollTrigger Animations / Three.js Ambient Layer
   ========================================================== */
(function(){
  "use strict";

  gsap.registerPlugin(ScrollTrigger);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- PRELOADER ---------------- */
  var heroVideo = document.querySelector('#hero .scene-video');
  var fill = document.getElementById('preloaderFill');
  var status = document.getElementById('preloaderStatus');
  var preloader = document.getElementById('preloader');

  function setProgress(p){
    p = Math.min(100, Math.round(p));
    fill.style.width = p + '%';
    status.textContent = 'LOADING EXPERIENCE — ' + p + '%';
  }

  function finishPreload(){
    setProgress(100);
    setTimeout(function(){
      preloader.classList.add('hide');
      document.body.style.overflow = '';
      revealHero();
      initVideoObserver();
      initReticle();
    }, 350);
  }

  document.body.style.overflow = 'hidden';
  setProgress(4);

  // load hero video source, track buffering progress
  heroVideo.src = heroVideo.getAttribute('data-src');
  var progressTimer = setInterval(function(){
    if(heroVideo.buffered.length){
      var loaded = heroVideo.buffered.end(heroVideo.buffered.length-1);
      var dur = heroVideo.duration || 1;
      setProgress(10 + (loaded/dur)*80);
    }
  }, 120);

  var safetyTimeout = setTimeout(finishPreload, 4500); // never block user too long

  heroVideo.addEventListener('canplaythrough', function(){
    clearInterval(progressTimer);
    clearTimeout(safetyTimeout);
    finishPreload();
    heroVideo.play().catch(function(){});
  }, {once:true});

  heroVideo.addEventListener('error', function(){
    clearInterval(progressTimer);
    clearTimeout(safetyTimeout);
    finishPreload();
  });

  /* ---------------- VIDEO MANAGER (lazy load + play/pause) ---------------- */
  function initVideoObserver(){
    var videos = document.querySelectorAll('.scene-video');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var v = entry.target;
        if(entry.isIntersecting){
          if(!v.src && v.getAttribute('data-src')){
            v.src = v.getAttribute('data-src');
          }
          var playPromise = v.play();
          if(playPromise && playPromise.catch) playPromise.catch(function(){});
        } else {
          v.pause();
        }
      });
    }, { rootMargin: '60% 0px 60% 0px', threshold: 0.05 });

    videos.forEach(function(v){ io.observe(v); });
  }

  /* ---------------- HERO REVEAL ---------------- */
  function revealHero(){
    var tl = gsap.timeline({defaults:{ease:'power3.out'}});
    tl.to('#hero .eyebrow', {opacity:1, y:0, duration:0.9}, 0.05)
      .to('#hero .display-huge .line', {opacity:1, y:0, duration:1.1, stagger:0.12}, 0.15)
      .to('#hero .hero-foot', {opacity:1, y:0, duration:0.9}, 0.55)
      .to('.scroll-cue', {opacity:1, duration:0.8}, 0.9)
      .to('#site-nav', {opacity:1, duration:0.8}, 0.2)
      .to('#progress-track', {opacity:1, duration:0.8}, 0.2);

    gsap.set('.scroll-cue', {opacity:0});
    gsap.set('#site-nav', {opacity:0});
    gsap.set('#progress-track', {opacity:0});
  }

  /* ---------------- NAV ---------------- */
  var navItems = document.querySelectorAll('.nav-index li');
  navItems.forEach(function(item){
    item.addEventListener('click', function(){
      var target = document.getElementById(item.getAttribute('data-target'));
      if(target){
        target.scrollIntoView({behavior:'smooth'});
      }
      document.getElementById('navIndex').classList.remove('open');
    });
  });

  var navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', function(){
    document.getElementById('navIndex').classList.toggle('open');
  });

  var scenes = document.querySelectorAll('.scene');
  scenes.forEach(function(scene){
    ScrollTrigger.create({
      trigger: scene,
      start: 'top center',
      end: 'bottom center',
      onEnter: function(){ setActiveNav(scene.id); },
      onEnterBack: function(){ setActiveNav(scene.id); }
    });
  });
  function setActiveNav(id){
    navItems.forEach(function(li){
      li.classList.toggle('active', li.getAttribute('data-target') === id);
    });
  }

  /* ---------------- SCROLL PROGRESS BAR ---------------- */
  ScrollTrigger.create({
    trigger: 'main',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: function(self){
      document.getElementById('progress-fill').style.width = (self.progress*100) + '%';
    }
  });

  /* ---------------- CURSOR / RETICLE ---------------- */
  function initReticle(){
    if(window.matchMedia('(hover:none)').matches) return;
    var reticle = document.getElementById('reticle');
    var coord = document.getElementById('reticleCoord');
    var mx=0,my=0, rx=0, ry=0;
    document.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      reticle.classList.add('active');
      var nx = (e.clientX / window.innerWidth).toFixed(3);
      var ny = (e.clientY / window.innerHeight).toFixed(3);
      coord.textContent = 'X ' + nx + ' / Y ' + ny;
    });
    document.addEventListener('mouseleave', function(){ reticle.classList.remove('active'); });

    var hoverTargets = document.querySelectorAll('a, button, li[data-target], .scene-content');
    hoverTargets.forEach(function(t){
      t.addEventListener('mouseenter', function(){ reticle.classList.add('hover'); });
      t.addEventListener('mouseleave', function(){ reticle.classList.remove('hover'); });
    });

    gsap.ticker.add(function(){
      rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
      reticle.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
    });
  }

  /* ---------------- MOUSE PARALLAX ON SCENE CONTENT ---------------- */
  if(!reduceMotion && !window.matchMedia('(hover:none)').matches){
    document.addEventListener('mousemove', function(e){
      var px = (e.clientX / window.innerWidth - 0.5);
      var py = (e.clientY / window.innerHeight - 0.5);
      gsap.to('.scene-content', {
        x: px * 14, y: py * 8, duration:1.2, ease:'power2.out', overwrite:'auto'
      });
    });
  }

  /* ---------------- SCROLL-TRIGGERED SECTION ANIMATIONS ---------------- */
  scenes.forEach(function(scene){
    if(scene.id === 'hero') return; // hero handled by preload timeline

    var content = scene.querySelector('.scene-content');
    var lines = scene.querySelectorAll('.line');
    var eyebrow = scene.querySelector('.scene-eyebrow');
    var copy = scene.querySelector('.scene-copy');
    var video = scene.querySelector('.scene-video');

    gsap.set(lines, {opacity:0, y:60});
    gsap.set(eyebrow, {opacity:0, y:20});
    if(copy) gsap.set(copy, {opacity:0, y:20});

    var tl = gsap.timeline({
      scrollTrigger:{ trigger:scene, start:'top 70%', toggleActions:'play none none reverse' }
    });
    tl.to(eyebrow, {opacity:1, y:0, duration:0.7, ease:'power2.out'})
      .to(lines, {opacity:1, y:0, duration:0.9, stagger:0.1, ease:'power3.out'}, '-=0.35');
    if(copy) tl.to(copy, {opacity:1, y:0, duration:0.8, ease:'power2.out'}, '-=0.45');

    var extra = scene.querySelector('.material-list, .perf-tags');
    if(extra){
      gsap.set(extra.children, {opacity:0, y:16});
      tl.to(extra.children, {opacity:1, y:0, duration:0.6, stagger:0.06, ease:'power2.out'}, '-=0.3');
    }

    // video subtle scale-in on scroll (transform only, GPU friendly)
    gsap.fromTo(video, {scale:1.14}, {
      scale:1.02, ease:'none',
      scrollTrigger:{ trigger:scene, start:'top bottom', end:'bottom top', scrub:0.6 }
    });

    // gentle vertical parallax drift of video layer
    gsap.to(video, {
      yPercent: 6, ease:'none',
      scrollTrigger:{ trigger:scene, start:'top bottom', end:'bottom top', scrub:0.8 }
    });
  });

  /* ---- tech overlay (engine) ---- */
  var techLines = document.querySelectorAll('.tech-line');
  var techReadouts = document.querySelectorAll('.tech-readout');
  if(techLines.length){
    gsap.timeline({ scrollTrigger:{ trigger:'#engine', start:'top 60%', toggleActions:'play none none reverse' } })
      .to(techLines, {opacity:1, duration:1, stagger:0.2})
      .to(techReadouts, {opacity:1, duration:0.6, stagger:0.15}, '-=0.6');
  }

  /* ---- aero overlay reveal ---- */
  var aeroPaths = document.querySelectorAll('.aero-path');
  if(aeroPaths.length){
    gsap.set(aeroPaths, {opacity:0});
    gsap.to(aeroPaths, {
      opacity:0.7, duration:1,
      scrollTrigger:{ trigger:'#aero', start:'top 65%', toggleActions:'play none none reverse' }
    });
  }

  /* ---- final scene: strip UI, focus on the film ---- */
  ScrollTrigger.create({
    trigger: '#final',
    start: 'top 40%',
    end: 'top top',
    onEnter: function(){ document.getElementById('site-nav').classList.add('fade-hint'); },
  });
  gsap.to('#site-nav', {
    opacity:0.15, ease:'none',
    scrollTrigger:{ trigger:'#final', start:'top 60%', end:'top 10%', scrub:true }
  });
  gsap.to('#progress-track', {
    opacity:0.15, ease:'none',
    scrollTrigger:{ trigger:'#final', start:'top 60%', end:'top 10%', scrub:true }
  });

  /* ==========================================================
     THREE.JS — ambient depth-layer particles (ties sections
     together as a single 3D volume without competing with video)
     ========================================================== */
  (function initThree(){
    var canvas = document.getElementById('webgl-bg');
    if(!canvas || reduceMotion) { if(canvas) canvas.style.display='none'; return; }

    var renderer = new THREE.WebGLRenderer({ canvas:canvas, alpha:true, antialias:false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.z = 12;

    var count = window.innerWidth < 700 ? 220 : 480;
    var geo = new THREE.BufferGeometry();
    var positions = new Float32Array(count*3);
    for(var i=0;i<count;i++){
      positions[i*3] = (Math.random()-0.5) * 30;
      positions[i*3+1] = (Math.random()-0.5) * 20;
      positions[i*3+2] = (Math.random()-0.5) * 20;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var mat = new THREE.PointsMaterial({
      color: 0x4fa6ff,
      size: 0.045,
      transparent:true,
      opacity:0.5,
      depthWrite:false
    });
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    var mouseX=0, mouseY=0, targetRX=0, targetRY=0;
    document.addEventListener('mousemove', function(e){
      mouseX = (e.clientX/window.innerWidth - 0.5);
      mouseY = (e.clientY/window.innerHeight - 0.5);
    });

    var scrollY = 0;
    window.addEventListener('scroll', function(){ scrollY = window.scrollY; }, {passive:true});

    function animate(){
      requestAnimationFrame(animate);
      targetRX += (mouseY*0.15 - targetRX)*0.03;
      targetRY += (mouseX*0.2 - targetRY)*0.03;
      points.rotation.x = targetRX;
      points.rotation.y = targetRY + scrollY*0.00008;
      points.position.y = scrollY * -0.0012;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function(){
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  })();

})();
