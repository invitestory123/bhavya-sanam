/**
 * Bhavya & Sanyam Wedding Invitation - Interactive Logic
 * Features:
 *  - HTML5 Canvas Scratch Card with Rose Gold Foil & Sparkles
 *  - Live Wedding Countdown Timer (Target: Nov 26, 2026)
 *  - Petal & Stardust Blessing Particle Shower with Counter
 *  - Continuous Ambient Petal Drift
 *  - Floating Audio Player with Auto-Play on interaction
 *  - Add to Calendar (.ics & Google Calendar)
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initScratchCard();
  initBlessingShower();
  initAmbientPetals();
  initAudioPlayer();
  initCalendarAction();
});

/* ==========================================================================
   1. Live Countdown Timer
   Target: November 26, 2026 11:00 AM IST
   ========================================================================== */
function initCountdown() {
  const targetDate = new Date('2026-11-26T11:00:00+05:30').getTime();

  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minsEl = document.getElementById('cdMins');
  const secsEl = document.getElementById('cdSecs');

  function update() {
    const now = new Date().getTime();
    let diff = targetDate - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = days < 10 ? '0' + days : days;
    if (hoursEl) hoursEl.textContent = hours < 10 ? '0' + hours : hours;
    if (minsEl) minsEl.textContent = mins < 10 ? '0' + mins : mins;
    if (secsEl) secsEl.textContent = secs < 10 ? '0' + secs : secs;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. HTML5 Canvas Scratch-Off Card
   Rose gold shimmer foil with scratch physics & reveal
   ========================================================================== */
function initScratchCard() {
  const canvas = document.getElementById('scratchCanvas');
  const infoPill = document.getElementById('scratchInfoPill');
  const auspiciousPill = document.getElementById('auspiciousPill');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let isRevealed = false;
  let lastX = 0, lastY = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    drawFoil();
  }

  function drawFoil() {
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;

    // Metallic rose gold gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#E8A3B3');
    grad.addColorStop(0.25, '#FDE3E8');
    grad.addColorStop(0.5, '#D5869B');
    grad.addColorStop(0.75, '#C26A82');
    grad.addColorStop(1, '#E898AE');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle metallic noise / specks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      const rsize = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(rx, ry, rsize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centered foil text
    ctx.fillStyle = '#6D2C3D';
    ctx.font = '600 12.5px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '1.8px';
    ctx.fillText('✦ SCRATCH TO REVEAL DATE ✦', w / 2, h / 2);
  }

  // Erasing scratch function
  function scratch(x, y) {
    if (isRevealed) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check clear percentage periodically
    checkClearPercentage();
  }

  function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  // Mouse & Touch events
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const { x, y } = getCoords(e);
    scratch(x, y);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    scratch(x, y);
  });

  window.addEventListener('mouseup', () => { isDrawing = false; });

  canvas.addEventListener('touchstart', (e) => {
    isDrawing = true;
    const { x, y } = getCoords(e);
    scratch(x, y);
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    scratch(x, y);
  }, { passive: true });

  canvas.addEventListener('touchend', () => { isDrawing = false; });

  let checkThrottle = 0;
  function checkClearPercentage() {
    const now = Date.now();
    if (now - checkThrottle < 200) return;
    checkThrottle = now;

    try {
      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      let transparentCount = 0;
      const totalPixels = w * h;

      for (let i = 3; i < data.length; i += 32) {
        if (data[i] < 128) transparentCount++;
      }

      const ratio = transparentCount / (totalPixels / 8);
      if (ratio > 0.35) {
        revealFullDate();
      }
    } catch (e) {
      // Cross-origin fallback
    }
  }

  function revealFullDate() {
    if (isRevealed) return;
    isRevealed = true;
    canvas.style.transition = 'opacity 0.6s ease';
    canvas.style.opacity = '0';
    setTimeout(() => {
      canvas.style.display = 'none';
    }, 600);

    if (infoPill) infoPill.style.display = 'none';
    if (auspiciousPill) auspiciousPill.style.display = 'inline-flex';

    // Celebration sparkles
    triggerCelebrationSparkles();
  }

  // Clicking the instruction pill automatically reveals it smoothly
  if (infoPill) {
    infoPill.addEventListener('click', revealFullDate);
  }

  // Initial draw
  setTimeout(resizeCanvas, 100);
  window.addEventListener('resize', () => {
    if (!isRevealed) resizeCanvas();
  });
}

function triggerCelebrationSparkles() {
  const canvas = document.getElementById('blessingPetalsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.8) * 12,
      size: Math.random() * 6 + 3,
      alpha: 1,
      color: Math.random() > 0.5 ? '#E898AE' : '#E5C158',
      decay: Math.random() * 0.02 + 0.015
    });
  }

  function renderSparkles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    if (active) {
      requestAnimationFrame(renderSparkles);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  renderSparkles();
}

/* ==========================================================================
   3. Interactive Petal & Blessing Shower
   Tapping increases live counter & spawns falling rose petals
   ========================================================================== */
function initBlessingShower() {
  const blessingBtn = document.getElementById('blessingShowerBtn');
  const countBadge = document.getElementById('blessingCountBadge');
  if (!blessingBtn) return;

  // Stored count in localStorage (initial 452 matching screenshot)
  let count = parseInt(localStorage.getItem('bhavya_sanyam_blessing_count') || '452', 10);
  if (countBadge) countBadge.textContent = `${count} SHOWERED`;

  blessingBtn.addEventListener('click', () => {
    count++;
    localStorage.setItem('bhavya_sanyam_blessing_count', count.toString());
    if (countBadge) countBadge.textContent = `${count} SHOWERED`;

    // Button pulse feedback
    blessingBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { blessingBtn.style.transform = ''; }, 160);

    spawnPetalShower(35);
  });
}

function spawnPetalShower(numPetals) {
  const canvas = document.getElementById('blessingPetalsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const petals = [];
  const colors = [
    'rgba(235, 137, 161, 0.85)',
    'rgba(244, 169, 185, 0.85)',
    'rgba(218, 98, 126, 0.80)',
    'rgba(255, 192, 203, 0.90)',
    'rgba(224, 122, 145, 0.85)'
  ];

  for (let i = 0; i < numPetals; i++) {
    petals.push({
      x: Math.random() * canvas.width,
      y: -30 - Math.random() * 100,
      size: Math.random() * 14 + 10,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2.5,
      angle: Math.random() * Math.PI * 2,
      vAngle: (Math.random() - 0.5) * 0.08,
      wobble: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let remaining = 0;

    petals.forEach(p => {
      p.y += p.vy;
      p.wobble += 0.04;
      p.x += Math.sin(p.wobble) * 2 + p.vx;
      p.angle += p.vAngle;

      if (p.y < canvas.height + 40) {
        remaining++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;

        // Draw delicate rose petal curve
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size / 2, p.size / 2, 0, p.size);
        ctx.bezierCurveTo(p.size / 2, p.size / 2, p.size / 2, -p.size / 2, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    });

    if (remaining > 0) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

/* ==========================================================================
   4. Ambient Continuous Petal Drift
   ========================================================================== */
function initAmbientPetals() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const ambientPetals = [];
  const maxPetals = 16;
  const colors = [
    'rgba(240, 160, 180, 0.45)',
    'rgba(247, 182, 198, 0.40)',
    'rgba(230, 140, 162, 0.35)',
    'rgba(255, 215, 225, 0.45)'
  ];

  for (let i = 0; i < maxPetals; i++) {
    ambientPetals.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 10 + 6,
      vx: (Math.random() - 0.5) * 0.8,
      vy: Math.random() * 0.9 + 0.4,
      angle: Math.random() * Math.PI * 2,
      vAngle: (Math.random() - 0.5) * 0.02,
      wobble: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ambientPetals.forEach(p => {
      p.y += p.vy;
      p.wobble += 0.02;
      p.x += Math.sin(p.wobble) * 0.8 + p.vx;
      p.angle += p.vAngle;

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -20) p.x = canvas.width + 20;
      if (p.x > canvas.width + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size / 2, p.size / 2, 0, p.size);
      ctx.bezierCurveTo(p.size / 2, p.size / 2, p.size / 2, -p.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(loop);
  }

  loop();
}

/* ==========================================================================
   5. Floating Audio Player
   Background romantic instrumental music with seamless play/pause
   ========================================================================== */
function initAudioPlayer() {
  const audio = document.getElementById('bgAudio');
  const btn = document.getElementById('floatingAudioBtn');
  const iconPause = document.getElementById('audioIconPause');
  const iconPlay = document.getElementById('audioIconPlay');
  if (!audio || !btn) return;

  let isPlaying = false;

  function playAudio() {
    audio.play().then(() => {
      isPlaying = true;
      btn.classList.add('is-playing');
      if (iconPause) iconPause.style.display = 'block';
      if (iconPlay) iconPlay.style.display = 'none';
    }).catch(() => {
      // Autoplay blocked until gesture
    });
  }

  function pauseAudio() {
    audio.pause();
    isPlaying = false;
    btn.classList.remove('is-playing');
    if (iconPause) iconPause.style.display = 'none';
    if (iconPlay) iconPlay.style.display = 'block';
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  });

  // Attempt auto-play on first tap or scroll anywhere on document
  function firstInteraction() {
    if (!isPlaying) {
      playAudio();
    }
    window.removeEventListener('click', firstInteraction);
    window.removeEventListener('touchstart', firstInteraction);
    window.removeEventListener('scroll', firstInteraction);
  }

  window.addEventListener('click', firstInteraction, { once: true });
  window.addEventListener('touchstart', firstInteraction, { once: true });
  window.addEventListener('scroll', firstInteraction, { once: true });
}

/* ==========================================================================
   6. Add to Calendar (Google Calendar & .ics)
   ========================================================================== */
function initCalendarAction() {
  const calBtn = document.getElementById('btnAddToCalendar');
  if (!calBtn) return;

  calBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const title = encodeURIComponent('Bhavya & Sanyam Wedding Celebration');
    const details = encodeURIComponent('Together with their families, Bhavya & Sanyam joyfully invite you to celebrate their auspicious wedding festivities.');
    const location = encodeURIComponent('Rivaya by Zion (Formerly Crossroad Banquets), Sohna Road, Delhi-NCR');
    
    // Nov 26, 2026: 11:00 AM to 11:00 PM IST (UTC: 20261126T053000Z to 20261126T173000Z)
    const dates = '20261126T053000Z/20261126T173000Z';
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;

    // Generate .ics download or open Google Calendar
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // Download .ics for native mobile calendar (iOS / Android)
      downloadIcs();
    } else {
      window.open(googleUrl, '_blank');
    }
  });

  function downloadIcs() {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bhavya & Sanyam Wedding//EN',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@invitingyou.top',
      'DTSTAMP:20261008T000000Z',
      'DTSTART:20261126T053000Z',
      'DTEND:20261126T173000Z',
      'SUMMARY:Bhavya & Sanyam Wedding Celebration',
      'DESCRIPTION:Together with their families\\, Bhavya & Sanyam joyfully invite you to celebrate their auspicious wedding festivities.',
      'LOCATION:Rivaya by Zion (Formerly Crossroad Banquets)\\, Sohna Road\\, Delhi-NCR',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bhavya-Sanyam-Wedding.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
