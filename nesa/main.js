/* ==========================================================================
   NIAGARA ELITE SOCCER ACADEMY — page behaviour
   Progressive enhancement: every section reads fine with no JS and no motion.
   Motion (GSAP + ScrollTrigger, Lenis on desktop only) is skipped for
   reduced-motion users and on touch devices where it would cost battery.
   ========================================================================== */
(() => {
  'use strict';

  const d = document;
  const root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = matchMedia('(min-width: 960px)');
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  const motion = !!(G && ST) && !reduce;

  root.classList.add('js');
  if (!motion) root.classList.remove('motion');
  if (motion) G.registerPlugin(ST);

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll (desktop pointer only) ---------- */
  let lenis = null;
  if (motion && fine && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const navH = () => $('#nav').offsetHeight;
  const goTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: -navH() - 8, duration: 1.1 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- Menu ---------- */
  const menuBtn = $('.nav__menu');
  const menu = $('#menu');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    root.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  desktop.addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* In-page links: close the menu, scroll with Lenis when it is running. */
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 && d.getElementById(id.slice(1));
    if (!target) return;
    if (!menu.hidden) setMenu(false);
    if (lenis) { e.preventDefault(); goTo(target); history.replaceState(null, '', id); }
  });

  /* ---------- Active nav link + mobile quick bar ---------- */
  const navLinks = $$('.nav__links a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['about', 'experience', 'credentials', 'training', 'media', 'inquiry'].forEach((id) => { const s = d.getElementById(id); if (s) io.observe(s); });

  const mbar = $('.mbar');
  const seen = { hero: true, iq: false };
  const mbarIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { seen[en.target.id === 'top' ? 'hero' : 'iq'] = en.isIntersecting; });
    mbar.classList.toggle('is-on', !seen.hero && !seen.iq);
  });
  mbarIO.observe($('#top'));
  mbarIO.observe($('#inquiry'));

  /* ==========================================================================
     03 — EXPERIENCE: tabs on desktop (one always open), accordion on mobile.
     ========================================================================== */
  const xpBoard = $('.xp__board');
  const xpBtns = $$('.xp__btn', xpBoard);
  const xpMarker = $('.xp__marker', xpBoard);
  $$('.xp__orgs', xpBoard).forEach((ul) => $$('li', ul).forEach((li, i) => li.style.setProperty('--i', i)));

  const placeMarker = () => {
    const open = xpBtns.find((b) => b.getAttribute('aria-expanded') === 'true');
    if (!open || !desktop.matches) return;
    const top = open.getBoundingClientRect().top - xpBoard.getBoundingClientRect().top + open.offsetHeight / 2;
    xpMarker.style.top = `${top}px`;
  };
  const xpSet = (btn, open) => {
    const panel = d.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(open));
    btn.closest('.xp__item').classList.toggle('is-open', open);
    panel.hidden = !open;
    panel.classList.remove('is-in');
    if (open) { void panel.offsetWidth; panel.classList.add('is-in'); }
  };
  xpBtns.forEach((btn) => btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if (desktop.matches && isOpen) return;          // desktop: behaves like tabs
    xpBtns.forEach((b) => { if (b !== btn) xpSet(b, false); });
    xpSet(btn, !isOpen);
    placeMarker();
    if (motion) ST.refresh();
  }));
  desktop.addEventListener('change', () => {
    if (desktop.matches && !xpBtns.some((b) => b.getAttribute('aria-expanded') === 'true')) xpSet(xpBtns[0], true);
    placeMarker();
  });
  addEventListener('resize', placeMarker);
  addEventListener('load', placeMarker);
  placeMarker();

  /* ==========================================================================
     05 — TRAINING SELECTOR: one field, three formats.
     Marker positions are % of the field; zone is in SVG units (800 × 500).
     ========================================================================== */
  const FORMATS = {
    '1on1': { zone: [150, 150, 230, 200], coach: [28, 50], players: [[40, 44]] },
    small: { zone: [110, 70, 330, 360], coach: [20, 50], players: [[34, 28], [36, 72], [44, 42], [46, 60], [54, 50]] },
    team: {
      zone: [28, 28, 744, 444], coach: [62, 84],
      players: [[6, 50], [20, 16], [18, 38], [18, 62], [20, 84], [36, 18], [34, 40], [34, 60], [36, 82], [48, 40], [48, 60]],
    },
  };
  const trTabs = $$('.tr__tab');
  const trStage = $('.tr__stage');
  const trZone = $('.tr__zone');
  const [coachM, ...playerM] = $$('.tr__m');
  const place = (el, xy) => { el.style.left = `${xy[0]}%`; el.style.top = `${xy[1]}%`; el.classList.add('is-on'); };
  let trCurrent = null;

  const setFormat = (f, focusTab) => {
    const cfg = FORMATS[f];
    if (!cfg || f === trCurrent) return;
    trCurrent = f;
    trTabs.forEach((t) => {
      const on = t.dataset.f === f;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = d.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.remove('is-in');
      if (on) { void panel.offsetWidth; panel.classList.add('is-in'); }
      if (on && focusTab) t.focus();
    });
    trStage.dataset.f = f;
    place(coachM, cfg.coach);
    playerM.forEach((m, i) => {
      if (cfg.players[i]) place(m, cfg.players[i]);
      else { m.classList.remove('is-on'); m.style.left = `${cfg.coach[0]}%`; m.style.top = `${cfg.coach[1]}%`; }
    });
    const [x, y, w, h] = cfg.zone;
    if (motion) G.to(trZone, { attr: { x, y, width: w, height: h }, duration: 0.7, ease: 'power3.inOut' });
    else Object.entries({ x, y, width: w, height: h }).forEach(([k, v]) => trZone.setAttribute(k, v));
  };
  trTabs.forEach((t, i) => {
    t.addEventListener('click', () => setFormat(t.dataset.f));
    t.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); setFormat(trTabs[e.key === 'Home' ? 0 : trTabs.length - 1].dataset.f, true); }
      if (!step) return;
      e.preventDefault();
      setFormat(trTabs[(i + step + trTabs.length) % trTabs.length].dataset.f, true);
    });
  });
  $$('[data-tab]').forEach((a) => a.addEventListener('click', () => setFormat(a.dataset.tab)));
  setFormat('1on1');

  /* ==========================================================================
     06 — MEDIA: category filter + video lightbox for tiles with data-video
     ========================================================================== */
  const chips = $$('.chip');
  const tiles = $$('.mtile');
  chips.forEach((c) => c.addEventListener('click', () => {
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    tiles.forEach((t) => { t.hidden = c.dataset.cat !== 'all' && t.dataset.cat !== c.dataset.cat; });
    if (motion) ST.refresh();
  }));

  const vbox = $('#vbox');
  const vEl = $('.vbox__v', vbox);
  const closeV = () => { vEl.pause(); vEl.removeAttribute('src'); vEl.load(); if (vbox.open) vbox.close(); };
  $$('.mtile[data-video]').forEach((t) => {
    t.tabIndex = 0;
    t.setAttribute('role', 'button');
    const open = () => { vEl.src = t.dataset.video; if (vbox.showModal) vbox.showModal(); vEl.play().catch(() => {}); };
    t.addEventListener('click', open);
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  $('.vbox__x', vbox).addEventListener('click', closeV);
  vbox.addEventListener('close', closeV);
  vbox.addEventListener('click', (e) => { if (e.target === vbox) closeV(); });

  /* ==========================================================================
     07 — INQUIRY: four steps, the development line becomes the progress bar.
     ========================================================================== */
  const form = $('#iqForm');
  const steps = $$('.iq__step', form);
  const stepLabels = $$('.iq__steps li', form);
  const prog = $('.iq__prog', form);
  const count = $('.iq__count b', form);
  const backBtn = $('.iq__back', form);
  const nextBtn = $('.iq__next', form);
  const sum = $('.iq__sum', form);
  let cur = 0;

  const val = (name) => { const el = form.elements[name]; return el ? (el.value || '').trim() : ''; };
  const VALID = [
    () => !!val('interest'),
    () => !!val('player_age'),
    () => !!val('experience'),
    () => !!val('name') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email')),
  ];
  const showErr = (i, on) => {
    const step = steps[i];
    $('.iq__err', step).hidden = !on;
    if (i === 1) form.elements.player_age.setAttribute('aria-invalid', String(on));
    if (i === 3) {
      form.elements.name.setAttribute('aria-invalid', String(on && !val('name')));
      form.elements.email.setAttribute('aria-invalid', String(on && !VALID[3]()));
    }
  };
  const firstField = (step) => $('input:not([type=hidden]):checked, input:not([type=hidden]), select, textarea', step);

  const goStep = (i, focus = true) => {
    cur = i;
    form.dataset.step = String(i);
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    stepLabels.forEach((l, k) => l.classList.toggle('is-on', k <= i));
    prog.style.setProperty('--p', String(i / (steps.length - 1)));
    count.textContent = String(i + 1);
    backBtn.hidden = i === 0;
    if (i === 3) {
      sum.hidden = false;
      sum.textContent = `Asking about: ${val('interest') || '—'} · Player age: ${val('player_age') || '—'} · Experience: ${val('experience') || '—'}`;
    }
    if (focus) { const f = firstField(steps[i]); if (f) f.focus({ preventScroll: true }); }
  };
  nextBtn.addEventListener('click', () => {
    if (!VALID[cur]()) { showErr(cur, true); const f = firstField(steps[cur]); if (f) f.focus(); return; }
    showErr(cur, false);
    goStep(cur + 1);
  });
  backBtn.addEventListener('click', () => goStep(cur - 1));
  form.addEventListener('change', () => { if (VALID[cur]()) showErr(cur, false); });
  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || cur === 3 || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    nextBtn.click();
  });
  form.addEventListener('submit', (e) => {
    const bad = VALID.findIndex((ok) => !ok());
    if (bad === -1) return;                         // valid: let the form post (Netlify Forms)
    e.preventDefault();
    goStep(bad);
    showErr(bad, true);
  });

  /* "Ask about …" buttons pre-answer step 01 and move the form on to step 02. */
  const PRESET = { '1on1': '1-on-1 training', small: 'Small-group training', team: 'Team training', goalkeeper: 'Goalkeeper training' };
  $$('[data-preset]').forEach((a) => a.addEventListener('click', () => {
    const radio = $(`input[name="interest"][value="${PRESET[a.dataset.preset]}"]`, form);
    if (!radio) return;
    radio.checked = true;
    showErr(0, false);
    if (cur === 0) goStep(1, false);
  }));
  goStep(0, false);

  /* ==========================================================================
     MOTION
     ========================================================================== */
  if (!motion) return;

  /* Hero: field lines draw, photo unmasks inside the box, headline lifts, credentials land. */
  const counter = $('[data-count]');
  const hero = G.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
  hero
    .to('.hero__kicker', { opacity: 1, duration: 0.6 })
    .to('.hero__title .ln > span', { y: 0, duration: 1, stagger: 0.09, ease: 'power4.out' }, '<0.05')
    .to('.hero__lines path', { strokeDashoffset: 0, duration: 1.4, stagger: 0.12, ease: 'power2.inOut' }, '<0.1')
    .to('.hero__photo', { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power4.inOut' }, '<0.35')
    .to('.hero__run', { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '<0.5')
    .to(['.hero__pos', '.hero__cap'], { opacity: 1, duration: 0.5 }, '<0.3')
    .to(['.hero__lede', '.hero__cta'], { opacity: 1, duration: 0.7, stagger: 0.1 }, 0.7)
    .to('.hero__rule i', { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }, 0.9)
    .to('.cred-strip li', { opacity: 1, duration: 0.6, stagger: 0.08 }, 1.1);
  if (counter) {
    const n = { v: 0 };
    hero.to(n, { v: +counter.dataset.count, duration: 1.2, ease: 'power2.out', onUpdate: () => { counter.textContent = Math.round(n.v); } }, 1.1);
  }

  /* Reveals */
  ST.batch('.rv', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => G.to(els, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }),
  });

  /* The development line: each section's line draws once as it arrives. */
  $$('[data-reveal]').forEach((el) => {
    G.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: el.dataset.reveal === 'up' ? 1.2 : 1.5, ease: 'power2.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  /* CTA magnetism (mouse only) */
  if (fine) {
    $$('[data-magnetic]').forEach((b) => {
      const xTo = G.quickTo(b, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = G.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.18);
        yTo((e.clientY - r.top - r.height / 2) * 0.28);
      });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  addEventListener('load', () => ST.refresh());
})();
