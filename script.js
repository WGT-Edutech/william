/* William Thomason - Isikhova site
   Lenis smooth scroll + GSAP ScrollTrigger reveals + name char-split pan-in +
   hero backdrop fade + section buttons + landscape guard.
   Hero Ken Burns motion lives in style.css (no JS needed). */
(function(){
  'use strict';

  // Hard reset: always land at the top (no bfcache / hash jumps)
  if('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0,0);
  if(location.hash) history.replaceState(null, '', location.pathname + location.search);

  // ---- Lenis: buttery inertial scroll, one scroll system only ----
  var lenis = new Lenis({
    duration:1.2,
    easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},
    smoothWheel:true, wheelMultiplier:1, touchMultiplier:1.4
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function(t){ lenis.raf(t*1000); });
  gsap.ticker.lagSmoothing(0);
  gsap.registerPlugin(ScrollTrigger);

  // ---- Hero video: honour mobile autoplay-touch gate ----
  var heroVid = document.getElementById('heroVid');
  function tryPlay(){
    if(heroVid && heroVid.readyState >= 2){ heroVid.play().catch(function(){}); }
  }
  if(heroVid){
    heroVid.playbackRate = 0.3;
    heroVid.addEventListener('canplay', tryPlay);
    heroVid.addEventListener('loadeddata', tryPlay);
  }
  window.addEventListener('pointerdown', tryPlay, {passive:true});
  window.addEventListener('keydown', tryPlay, {passive:true});

  // ---- Name: char-split + pan-in from bottom (bottom-quarter title) ----
  var nameText = document.getElementById('nameText');
  if(nameText){
    var txt = nameText.textContent, chars=[];
    nameText.textContent = '';
    txt.split('').forEach(function(ch){
      var s = document.createElement('span');
      s.className = 'name-char';
      s.textContent = (ch === ' ') ? '\u00a0' : ch;
      nameText.appendChild(s); chars.push(s);
    });
  }
  gsap.timeline({defaults:{ease:'power2.out'}})
    .to('.hero-title',{opacity:1, duration:0.6}, 0.2)
    .to('.name-char',{opacity:1, y:0, duration:0.75, stagger:0.03}, 0.45)
    .from('.slogan-text',{opacity:0, y:16, duration:0.6}, 0.6)
    .from('.slogan-sub',{opacity:0, y:12, duration:0.5}, 0.8);

  // ---- Fade the hero backdrop once the first content room arrives ----
  gsap.to('.hero-bg',{opacity:0, duration:0.7, ease:'power2.in',
    scrollTrigger:{trigger:'#about', start:'top 88%', scrub:0.5,
      toggleActions:'play none none reverse'}
  });

  // ---- Scroll-reveal each content room's items ----
  gsap.utils.toArray('.content-room').forEach(function(room){
    var items = room.querySelectorAll(
      '.content-lede, .content-tag, .content-title, .card, .stat-card, .gallery-card'
    );
    gsap.from(items, {
      y:38, opacity:0, duration:0.9, ease:'power2.out', stagger:0.05,
      scrollTrigger:{trigger:room, start:'top 86%',
        toggleActions:'play none none reverse'}
    });
  });

  // ---- Section buttons: show once you've left the hero ----
  var secBtn = document.getElementById('sectionButtons');
  function updateButtons(){
    if(secBtn){ secBtn.classList.toggle('visible', window.scrollY > window.innerHeight*0.6); }
  }
  lenis.on('scroll', updateButtons);
  updateButtons();

  // ---- Landscape rotate guard (portrait phones) ----
  var lo = document.getElementById('landscapeOverlay');
  var loDismissed = false;
  try{ loDismissed = localStorage.getItem('will-lo') === '1'; }catch(e){}
  function checkOrientation(){
    if(!lo) return;
    var show = (window.innerHeight > window.innerWidth) && (window.innerWidth <= 900) && !loDismissed;
    lo.style.display = show ? 'flex' : 'none';
  }
  checkOrientation();
  window.addEventListener('orientationchange', function(){ setTimeout(checkOrientation,120); });
  window.addEventListener('resize', checkOrientation);
  var ok = document.getElementById('loOkBtn');
  if(ok){ ok.onclick = function(){
    loDismissed = true; lo.style.display = 'none';
    try{ localStorage.setItem('will-lo','1'); }catch(e){}
  }; }

  // ---- bfcache reset ----
  window.addEventListener('pageshow', function(ev){
    if(ev.persisted || window.scrollY !== 0){
      window.scrollTo(0,0);
      if(lenis) lenis.scrollTo(0,{immediate:true});
    }
  });
})();
