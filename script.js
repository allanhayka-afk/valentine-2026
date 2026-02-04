
// MUSIC
const music=document.getElementById("bgMusic");
const btn=document.getElementById("musicBtn");

function toggleMusic(){
 if(music.paused){
  music.play();
  btn.textContent="🔇 Pause Music";
 }else{
  music.pause();
  btn.textContent="🎵 Play Our Song";
 }
}

// COUNTDOWN
const countdown=document.getElementById("countdown");

function updateCountdown(){
 const now=new Date();
 let year=now.getFullYear();

 const valentines=new Date(`February 14, ${year} 00:00:00`);
 if(now>valentines){valentines.setFullYear(year+1);}

 const diff=valentines-now;

 const d=Math.floor(diff/(1000*60*60*24));
 const h=Math.floor((diff/(1000*60*60))%24);
 const m=Math.floor((diff/(1000*60))%60);
 const s=Math.floor((diff/1000)%60);

 countdown.innerHTML=`${d} Days 💗 ${h} Hours 💗 ${m} Min 💗 ${s} Sec`;
}

setInterval(updateCountdown,1000);
updateCountdown();

// RUNAWAY NO BUTTON
const noBtn=document.getElementById("noBtn");

function moveNoButtonAwayFromPoint(clientX, clientY){
  const parent = noBtn.parentElement;
  const parentRect = parent.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const currentLeft = btnRect.left - parentRect.left;
  const currentTop = btnRect.top - parentRect.top;

  const maxLeft = Math.max(0, parentRect.width - btnRect.width);
  const maxTop = Math.max(0, parentRect.height - btnRect.height);

  // center positions
  const btnCenterX = currentLeft + btnRect.width / 2;
  const btnCenterY = currentTop + btnRect.height / 2;
  const touchX = clientX - parentRect.left;
  const touchY = clientY - parentRect.top;

  let dx = btnCenterX - touchX;
  let dy = btnCenterY - touchY;
  const dist = Math.sqrt(dx*dx + dy*dy) || 1;

  // Move the button away along the vector from the touch to button center
  const moveAmount = Math.min(Math.max(parentRect.width * 0.35, 80), 240);
  const moveX = (dx / dist) * moveAmount;
  const moveY = (dy / dist) * moveAmount;

  let newLeft = Math.min(Math.max(0, currentLeft + moveX), maxLeft);
  let newTop = Math.min(Math.max(0, currentTop + moveY), maxTop);

  const x = newLeft - currentLeft;
  const y = newTop - currentTop;
  noBtn.style.transform = `translate(${x}px, ${y}px)`;
}

noBtn.addEventListener("mouseover",()=>{
  // Move away from the mouse pointer
  moveNoButtonAwayFromPoint(event.clientX, event.clientY);
});

// On touch devices move the button away from the touch point to make it harder to tap
noBtn.addEventListener('touchstart', (e) => {
  if(!e.changedTouches || e.changedTouches.length === 0) return;
  const t = e.changedTouches[0];
  // Prevent immediate synthetic mouse events and accidental click
  e.preventDefault();
  moveNoButtonAwayFromPoint(t.clientX, t.clientY);
});

// Return NO to centered position when mouse leaves the button area
noBtn.parentElement.addEventListener('mouseleave', () => {
  noBtn.style.transform = 'translate(0, 0)';
});

// YES BUTTON
function sayYes(){
 document.getElementById("response").innerHTML="💖 YAY! I Love You The Most, My Sweet Girl 💖";
}

/* Slideshow: tap grid image to open slideshow */
(function(){
  const grid = document.querySelector('.photo-grid');
  if(!grid) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const images = Array.from(grid.querySelectorAll('img'));
  const modal = document.getElementById('slideshowModal');
  const modalImg = document.getElementById('slideshowImage');
  const caption = document.getElementById('slideCaption');
  const closeBtn = document.querySelector('.slideshow-close');
  const prevBtn = document.querySelector('.slideshow-prev');
  const nextBtn = document.querySelector('.slideshow-next');
  const playBtn = document.querySelector('.slideshow-play');
  const indicatorsWrap = document.getElementById('slideshowIndicators');

  let currentIndex = 0;
  let autoplayInterval = null;
  const AUTOPLAY_INTERVAL = 3000; // ms

  // Build indicators (dots)
  const indicators = images.map((img, i) => {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Slide ${i+1}`);
    btn.addEventListener('click', (e) => { e.stopPropagation(); showImage(i); });
    indicatorsWrap.appendChild(btn);
    return btn;
  });

  function updateIndicators(){
    indicators.forEach((b, idx) => b.classList.toggle('active', idx === currentIndex));
  }

  function showImage(index){
    const img = images[index];
    // Fade-out, change src, fade-in
    if (!prefersReducedMotion) modalImg.classList.add('fading');
    setTimeout(() => {
      modalImg.src = img.src;
      modalImg.alt = img.alt || '';
      caption.textContent = img.alt || '';
      currentIndex = index;
      updateIndicators();
      // ensure image has loaded before fading in
      modalImg.onload = () => { if (!prefersReducedMotion) modalImg.classList.remove('fading'); };
    }, prefersReducedMotion ? 0 : 180);
  }

  function openModal(index){
    showImage(index);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    // Start autoplay automatically on open unless user prefers reduced motion
    if (!prefersReducedMotion) startAutoplay(AUTOPLAY_INTERVAL);
    updatePlayButton();
  }
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    stopAutoplay();
    updatePlayButton();
  }
  function nextImage(){ showImage((currentIndex + 1) % images.length); }
  function prevImage(){ showImage((currentIndex - 1 + images.length) % images.length); }

  images.forEach((img, i) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => openModal(i));
  });

  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  closeBtn.addEventListener('click', closeModal);

  // Play / Pause button
  function updatePlayButton(){
    if(!playBtn) return;
    playBtn.textContent = autoplayInterval ? '⏸' : '▶';
  }
  playBtn && playBtn.addEventListener('click', (e) => { e.stopPropagation(); if(autoplayInterval) stopAutoplay(); else startAutoplay(AUTOPLAY_INTERVAL); updatePlayButton(); });

  // Click outside image (modal background) closes; click image advances
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
    if (e.target === modalImg) nextImage();
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if(!modal.classList.contains('open')) return;
    if(e.key === 'ArrowRight') nextImage();
    if(e.key === 'ArrowLeft') prevImage();
    if(e.key === 'Escape') closeModal();
  });

  // Touch swipe support on the image
  let touchStartX = null;
  modalImg.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; });
  modalImg.addEventListener('touchend', (e) => {
    if(touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if(Math.abs(dx) > 40){ if(dx < 0) nextImage(); else prevImage(); }
    touchStartX = null;
  });

  function startAutoplay(interval=AUTOPLAY_INTERVAL){ if (prefersReducedMotion) return; stopAutoplay(); autoplayInterval = setInterval(nextImage, interval); updatePlayButton(); }
  function stopAutoplay(){ if(autoplayInterval){ clearInterval(autoplayInterval); autoplayInterval=null; updatePlayButton(); } }

  // Pause autoplay when tab is hidden; resume when visible (unless reduced motion)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopAutoplay(); }
    else if (modal.classList.contains('open') && !prefersReducedMotion) { startAutoplay(AUTOPLAY_INTERVAL); }
  });

  // Optional: double-tap to start/stop autoplay
  let lastTap = 0;
  modalImg.addEventListener('click', () => {
    const now = Date.now();
    if(now - lastTap < 300){ // double tap
      if(autoplayInterval) stopAutoplay(); else startAutoplay(AUTOPLAY_INTERVAL);
      updatePlayButton();
    }
    lastTap = now;
  });

  // Initialize first indicator state and play button
  updateIndicators();
  updatePlayButton();
})();
