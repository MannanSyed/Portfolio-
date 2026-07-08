/* =========================================================================
   SYED MANNAN — PORTFOLIO SCRIPT
   -------------------------------------------------------------------------
   HOW TO ADD YOUR REAL CERTIFICATE PHOTOS
   Each object in CERTIFICATIONS below has an "image" field, currently null.
   To use a scanned copy instead of the placeholder icon:
     1. Put the image file in an "assets/certificates/" folder next to this
        file, e.g. assets/certificates/quantum-computing.jpg
     2. Set that entry's "image" field to the path, e.g.
        image: "assets/certificates/quantum-computing.jpg"
   The card will automatically render the photo instead of the placeholder.

   HOW TO SWAP THE HERO ID CUBE PHOTO
   The hero photo lives directly in index.html as:
        <img src="assets/profile.jpg" alt="Portrait of Syed Mannan" ...>
   Replace assets/profile.jpg with a new image (same filename), or change
   the src attribute to point at a different file in the assets/ folder.
   ========================================================================= */

// The loader must be set up immediately, not inside DOMContentLoaded,
// so it can start counting up right away and catch the window "load"
// event (which can fire before DOMContentLoaded listeners even run on
// a fast/cached load).
setupLoader();

document.addEventListener('DOMContentLoaded', () => {
  setupRevealAnimations();   // must run first: creates the observer that
                              // renderCertifications/renderAchievements rely on
  renderCertifications();
  renderAchievements();
  renderMarquee();
  setupNav();
  setupHeroCoordinates();
  setupTitleBlockDate();
  setupIdCardIssuedDate();
  setupCubeLens();
  setupSpotlightHover();
  setupCertLightbox();
});

/* -------------------------------------------------------------------------
   0. LOADER
   Full-screen preloader that mirrors the site's drafting-sheet aesthetic:
   "SYED MANNAN" builds in row by row while a CAD-style progress bar and
   percentage readout tick up. Two conditions gate the reveal so it never
   feels janky in either direction:
     - a minimum on-screen time (MIN_DISPLAY_MS) so the animation always
       gets to play out, even on a fast/cached load
     - the real window "load" event, so slow asset loads (fonts, the
       profile photo, certificate images) don't get cut off mid-fetch
   Once both are satisfied the bar snaps to 100%, holds briefly, then the
   whole overlay fades out and unmounts itself from the DOM.
-------------------------------------------------------------------------- */
function setupLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const barFill = document.getElementById('loaderBarFill');
  const percentEl = document.getElementById('loaderPercent');
  const statusEl = document.getElementById('loaderStatus');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN_DISPLAY_MS = prefersReducedMotion ? 200 : 2000;

  const STATUS_STEPS = [
    { at: 0, label: 'INITIALIZING' },
    { at: 25, label: 'LOADING ASSETS' },
    { at: 60, label: 'RENDERING SHEET' },
    { at: 90, label: 'FINALIZING' },
  ];

  let displayedPercent = 0;
  let targetPercent = 0;
  let windowLoaded = false;
  let minTimeElapsed = false;
  let finished = false;
  let rafId = null;

  function setStatus(pct) {
    if (!statusEl) return;
    const step = [...STATUS_STEPS].reverse().find(s => pct >= s.at);
    if (step) statusEl.textContent = step.label;
  }

  // Animate the readout toward whatever targetPercent currently is,
  // easing so it never looks like a robotic linear tick.
  function tick() {
    displayedPercent += (targetPercent - displayedPercent) * 0.09;
    if (targetPercent - displayedPercent < 0.3) displayedPercent = targetPercent;

    const shown = Math.min(99, displayedPercent);
    if (barFill) barFill.style.width = `${shown}%`;
    if (percentEl) percentEl.textContent = `${String(Math.floor(shown)).padStart(2, '0')}%`;
    setStatus(shown);

    if (!finished) {
      rafId = requestAnimationFrame(tick);
    }
  }
  rafId = requestAnimationFrame(tick);

  // Creep the target up on its own so there's always visible progress,
  // even before real load signals arrive. Deliberately slows down near
  // the top so it doesn't sit at a false 99% for too long.
  const creepInterval = setInterval(() => {
    if (targetPercent < 88) {
      targetPercent += Math.random() * 9 + 3;
      targetPercent = Math.min(targetPercent, 88);
    }
  }, 220);

  function maybeFinish() {
    if (finished || !windowLoaded || !minTimeElapsed) return;
    finished = true;
    clearInterval(creepInterval);
    if (rafId) cancelAnimationFrame(rafId);

    targetPercent = 100;
    if (barFill) barFill.style.width = '100%';
    if (percentEl) percentEl.textContent = '100%';
    if (statusEl) statusEl.textContent = 'READY';

    // Brief hold at 100% so the completed bar is actually perceptible,
    // then fade the overlay and unmount it.
    setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      // Safety net in case transitionend doesn't fire (e.g. display:none elsewhere)
      setTimeout(() => { if (loader.isConnected) loader.remove(); }, 900);
    }, prefersReducedMotion ? 0 : 260);
  }

  window.addEventListener('load', () => {
    windowLoaded = true;
    maybeFinish();
  });
  // Fallback: if "load" is slow to fire for some reason, don't hold the
  // site hostage indefinitely.
  setTimeout(() => { windowLoaded = true; maybeFinish(); }, 6000);

  setTimeout(() => {
    minTimeElapsed = true;
    maybeFinish();
  }, MIN_DISPLAY_MS);
}

/* -------------------------------------------------------------------------
   1. CONTENT DATA — certifications & achievements
   Kept as data so the markup in index.html never needs manual edits when
   a new certificate or achievement is added.
-------------------------------------------------------------------------- */
const CERTIFICATIONS = [
  { name: 'Quantum Computing', issuer: 'Wiser', image: 'WhatsApp Image 2026-07-07 at 4.25.48 PM.jpeg'},
  { name: 'Deloitte Data Analytics Job Simulation', issuer: 'Forage', image:'WhatsApp Image 2026-07-07 at 4.44.22 PM.jpeg'  },
  { name: 'Ignite for Entrepreneurs — India', issuer: 'Wadhwani Foundation', image:'WhatsApp Image 2026-07-07 at 4.55.57 PM.jpeg' },
  { name: 'ICAT Aptitude Test', issuer: 'ICAT', image: 'WhatsApp Image 2026-07-07 at 4.47.37 PM (1).jpeg' },
  { name: 'Workshop on Robotics & Artificial Intelligence', issuer: 'Hackboats', image:'WhatsApp Image 2026-07-07 at 5.03.27 PM.jpeg' },
  { name: 'Introduction to SQL', issuer: 'Simplilearn', image:'WhatsApp Image 2026-07-07 at 4.47.37 PM.jpeg' },
  { name: 'Introduction to Amazon CloudFront', issuer: 'Simplilearn', image: 'WhatsApp Image 2026-07-07 at 4.47.36 PM (1).jpeg' },
  { name: 'Introduction to MS Excel', issuer: 'Simplilearn', image: 'WhatsApp Image 2026-07-07 at 4.47.36 PM (2).jpeg' },
  { name: 'Operating Systems', issuer: 'SWAYAM', image: 'WhatsApp Image 2026-07-07 at 4.47.36 PM.jpeg'},
  { name: 'Fundamentals of OOPs', issuer: 'SWAYAM', image:'WhatsApp Image 2026-07-07 at 5.05.49 PM.jpeg' },
];

const ACHIEVEMENTS = [
  { tag: 'AWARD', text: 'Won <b>1st Prize</b> in Photography — RISE Krishna Sai Group of Institutions' },
  { tag: 'COMPETITION', text: 'Secured <b>2nd Prize</b> in a Technical Quiz — RISE Krishna Sai Group of Institutions' },
  { tag: 'QUIZ', text: 'Participated in the <b>RBI90 Quiz</b>, conducted by the Reserve Bank of India' },
  { tag: 'EXPO', text: 'Presented a project at the inter-college <b>Project Expo</b>, KSRM College of Engineering' },
  { tag: 'PAPER', text: 'Presented a paper at a college-level event — RISE Krishna Sai Group of Institutions' },
];

/* Scrolling ticker strip content — the disciplines and tools that show up
   in more detail throughout the rest of the page. */
const TICKER = [
  'MECHANICAL ENGINEERING',
  'COMPUTER SCIENCE',
  'CATIA',
  'AUTOCAD',
  'PYTHON',
  'C PROGRAMMING',
  'SQL',
  'AUTOMATION',
  'SIMULATION',
  'INTELLIGENT CONTROL',
];

/* Placeholder "wax seal" icon shown until a real certificate image is added */
const SEAL_SVG = `
  <svg class="cert-card__seal" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="17" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="24" cy="24" r="11" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 4"/>
    <path d="M18 24 L22 28 L30 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

function renderCertifications() {
  const grid = document.getElementById('certGrid');
  if (!grid) return;

  grid.innerHTML = CERTIFICATIONS.map((cert, i) => `
    <article class="cert-card reveal${cert.image ? ' cert-card--has-image' : ''}"
             style="--reveal-delay:${(i % 5) * 0.08}s"
             ${cert.image ? `data-image="${cert.image}" data-name="${cert.name}" data-issuer="${cert.issuer}"` : ''}>
      <div class="cert-card__frame">
        ${cert.image
          ? `<img src="${cert.image}" alt="Certificate: ${cert.name}" loading="lazy">`
          : SEAL_SVG}
      </div>
      <p class="cert-card__name">${cert.name}</p>
      <p class="cert-card__issuer">${cert.issuer}</p>
    </article>
  `).join('');

  // Newly injected .reveal items need to be observed too
  observeRevealElements();
}

function renderAchievements() {
  const list = document.getElementById('logList');
  if (!list) return;

  list.innerHTML = ACHIEVEMENTS.map((item, i) => `
    <li class="log__item reveal" style="--reveal-delay:${i * 0.06}s">
      <span class="log__tag">${item.tag}</span>
      <div class="log__body"><p>${item.text}</p></div>
    </li>
  `).join('');

  // Newly injected .reveal items need to be observed too
  observeRevealElements();
}

/* Renders the ticker twice back-to-back so the CSS animation (which
   translates by exactly -50%) loops seamlessly with no visible seam. */
function renderMarquee() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;

  const items = TICKER.map(label => `
    <span class="marquee__item">${label}</span>
    <span class="marquee__dot" aria-hidden="true">&#9679;</span>
  `).join('');

  track.innerHTML = items + items;
}

/* -------------------------------------------------------------------------
   2. SCROLL REVEAL
   IntersectionObserver adds .is-visible once an element enters the
   viewport. Elements are already visible by default for users who prefer
   reduced motion (handled in CSS), so this only adds motion for others.
-------------------------------------------------------------------------- */
let revealObserver;

function setupRevealAnimations() {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  observeRevealElements();
}

function observeRevealElements() {
  // Guard: if this ever runs before setupRevealAnimations() has created the
  // observer, skip quietly instead of throwing and halting the rest of the script.
  if (!revealObserver) return;
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
    revealObserver.observe(el);
  });
}

/* -------------------------------------------------------------------------
   3. NAVIGATION — mobile toggle + active-link highlighting on scroll
-------------------------------------------------------------------------- */
function setupNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Highlight the nav link for the section currently in view
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('[data-nav]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const anchor = document.querySelector(`[data-nav][href="#${id}"]`);
      if (!anchor) return;
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('is-active'));
        anchor.classList.add('is-active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));
}

/* -------------------------------------------------------------------------
   4. HERO COORDINATE READOUT + CONFINED CROSSHAIR CURSOR
   Mirrors a CAD viewport's status bar: the pointer's position inside the
   hero is translated into "drawing units" and printed live. Disabled for
   touch devices and reduced-motion users, where it would add noise
   without benefit.
-------------------------------------------------------------------------- */
function setupHeroCoordinates() {
  const viewport = document.getElementById('heroViewport');
  const readout = document.getElementById('coordReadout');
  const crosshair = document.getElementById('crosshair');
  if (!viewport || !readout) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (prefersReducedMotion || isTouch) return;

  viewport.addEventListener('mousemove', (e) => {
    const rect = viewport.getBoundingClientRect();
    // Convert pixel position to a stable "drawing units" scale (0–200)
    const x = ((e.clientX - rect.left) / rect.width) * 200;
    const y = ((e.clientY - rect.top) / rect.height) * 200;
    readout.textContent = `X ${x.toFixed(1).padStart(5, '0')}   Y ${y.toFixed(1).padStart(5, '0')}`;

    crosshair.style.left = `${e.clientX}px`;
    crosshair.style.top = `${e.clientY}px`;
    crosshair.classList.add('is-active');
  });

  viewport.addEventListener('mouseleave', () => {
    crosshair.classList.remove('is-active');
    readout.textContent = 'X 000.0   Y 000.0';
  });
}

/* -------------------------------------------------------------------------
   5. TITLE BLOCK DATE
   Fills in today's date in the drafting-sheet title block, the way a
   real drawing records its issue date.
-------------------------------------------------------------------------- */
function setupTitleBlockDate() {
  const tbDate = document.getElementById('tbDate');
  const year = document.getElementById('year');
  const now = new Date();

  if (tbDate) {
    const opts = { year: 'numeric', month: 'short', day: '2-digit' };
    tbDate.textContent = now.toLocaleDateString('en-GB', opts).toUpperCase();
  }
  if (year) {
    year.textContent = now.getFullYear();
  }
}

/* -------------------------------------------------------------------------
   6. ID CARD ISSUED DATE
   Fills in the "ISSUED" row on the hero ID card, mirroring the title
   block's date so both drafting artifacts stay in sync automatically.
-------------------------------------------------------------------------- */
function setupIdCardIssuedDate() {
  const issued = document.getElementById('cardIssued');
  if (!issued) return;
  const now = new Date();
  const opts = { year: 'numeric', month: 'short', day: '2-digit' };
  issued.textContent = now.toLocaleDateString('en-GB', opts).toUpperCase();
}

/* -------------------------------------------------------------------------
   7. ID CARD — hover "lens" effect
   On hover we add .is-lens, which lifts/scales the card slightly and
   reveals a cursor-tracked radial highlight ("lens shine") over the
   photo, like a loupe passing across a drawing. The pointer position is
   tracked as --mx / --my custom properties so the shine follows the
   cursor. Everything resets on mouseleave.
-------------------------------------------------------------------------- */
function setupCubeLens() {
  const card = document.getElementById('idCard');
  if (!card) return;

  card.addEventListener('mouseenter', () => card.classList.add('is-lens'));

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${mx}%`);
    card.style.setProperty('--my', `${my}%`);
  });

  card.addEventListener('mouseleave', () => card.classList.remove('is-lens'));

  // Keyboard users: focusing the card (it's not natively focusable, so this
  // only fires if a future update adds tabindex) triggers the same lens.
  card.addEventListener('focus', () => card.classList.add('is-lens'));
  card.addEventListener('blur', () => card.classList.remove('is-lens'));
}

/* -------------------------------------------------------------------------
   8. SPOTLIGHT HOVER — soft cursor-tracked glow
   Any element with the .spotlight class (about paragraphs, spec-sheet
   rows, and anything else you tag) gets a gentle radial highlight that
   follows the cursor, driven by the --mx / --my custom properties set
   here and animated in CSS. This replaces the old full-color clip-path
   wash with a subtler "loupe passing over the text" feel.
-------------------------------------------------------------------------- */
function setupSpotlightHover() {
  const items = document.querySelectorAll('.spotlight');
  if (!items.length) return;

  items.forEach(el => {
    const setPos = (e) => {
      const rect = el.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${mx}%`);
      el.style.setProperty('--my', `${my}%`);
    };
    el.addEventListener('mousemove', setPos);

    // Touch devices: light up on tap without requiring cursor tracking
    el.addEventListener('touchstart', () => el.classList.add('is-active'), { passive: true });
    el.addEventListener('touchend', () => el.classList.remove('is-active'));
  });
}

/* -------------------------------------------------------------------------
   9. CERTIFICATE LIGHTBOX
   Clicking a certificate card that has a real image (cert-card--has-image,
   set in renderCertifications) opens that image full-size in an overlay.
   Cards still showing the placeholder seal are not clickable. Closes on
   the close button, a click outside the image, or Escape.
-------------------------------------------------------------------------- */
function setupCertLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const grid = document.getElementById('certGrid');
  if (!lightbox || !lightboxImg || !grid) return;

  function openLightbox(card) {
    const { image, name, issuer } = card.dataset;
    if (!image) return;
    lightboxImg.src = image;
    lightboxImg.alt = `Certificate: ${name}`;
    lightboxCaption.innerHTML = `<b>${name}</b> — ${issuer}`;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Event delegation: cert cards are rendered dynamically, so listen on the grid
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.cert-card--has-image');
    if (card) openLightbox(card);
  });

  closeBtn.addEventListener('click', closeLightbox);

  // Click outside the image (on the dark backdrop) closes it
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
}