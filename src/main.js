import './style.css';
import { projects } from './data/projects.js';
import { moreTile } from './cards.js';
import { $, $$, reduceMotion, finePointer, escapeHtml, initNav, initReveal, renderProjects, initLightbox, initFooter } from './shared.js';
import { initBuilder } from './builder.js';
import { initContact } from './contact.js';

document.documentElement.classList.add('js');

/* ---------- Hero: písmena jména reagují na kurzor ---------- */
function initHero() {
  const nameEl = $('[data-name]');
  const letters = [...nameEl.textContent.trim()];
  // Písmena se kreslí přes CSS (data-ch), takže v textu stránky zůstane jméno jen jednou
  // a vyhledávače i čtečky ho dostanou celé z neviditelného textu
  nameEl.innerHTML = letters
    .map((ch, i) => `<span class="ch" style="--i:${i}" data-ch="${escapeHtml(ch)}" aria-hidden="true"></span>`)
    .join('');
  nameEl.nextElementSibling.prepend(letters.join(''));

  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

  // animace v hero běží jen, když je hero vidět
  if ('IntersectionObserver' in window) {
    const heroEl = $('.hero');
    new IntersectionObserver(([e]) => heroEl.classList.toggle('is-paused', !e.isIntersecting)).observe(heroEl);
  }

  if (reduceMotion || !finePointer) return;
  const chars = $$('.ch', nameEl).map((el) => ({ el, cx: 0, cy: 0, wght: 900, wdth: 100, tw: 900, td: 100 }));
  const hero = $('.hero');
  let mouse = null;
  let frame = 0;

  // Středy písmen měříme jen v klidu (při načtení a změně velikosti okna).
  // Kdybychom je měřili každý snímek, měnící se šířka písmen by je posouvala a efekt by škubal.
  const measure = () => {
    const prev = chars.map((c) => c.el.style.fontVariationSettings);
    chars.forEach((c) => { c.el.style.fontVariationSettings = ''; });
    const heroTop = hero.getBoundingClientRect().top;
    chars.forEach((c) => {
      const r = c.el.getBoundingClientRect();
      c.cx = r.left + r.width / 2;
      c.cy = r.top - heroTop + r.height / 2; // vůči hero, ať nevadí scroll
    });
    chars.forEach((c, i) => { c.el.style.fontVariationSettings = prev[i]; });
    chars.forEach((c) => { c.fvs = null; });
  };

  const tick = () => {
    frame = 0;
    const heroTop = hero.getBoundingClientRect().top;
    let moving = false;
    for (const c of chars) {
      if (mouse) {
        const dist = Math.hypot(mouse.x - c.cx, mouse.y - (c.cy + heroTop));
        const t = Math.max(0, 1 - dist / 520); // 1 = kurzor přímo nad písmenem
        const ease = t * t * (3 - 2 * t);
        c.tw = 900 - ease * 700;
        c.td = 100 - ease * 45;
      } else {
        c.tw = 900;
        c.td = 100;
      }
      // plynulé dojíždění k cílové hodnotě
      c.wght += (c.tw - c.wght) * 0.14;
      c.wdth += (c.td - c.wdth) * 0.14;
      if (Math.abs(c.tw - c.wght) > 0.5 || Math.abs(c.td - c.wdth) > 0.05) moving = true;
      else { c.wght = c.tw; c.wdth = c.td; }
      // Hodnoty zaokrouhlujeme na kroky: každá nová kombinace tloušťky a šířky znamená,
      // že prohlížeč musí písmo znovu připravit. S kroky si připravené verze pamatuje.
      const w = Math.round(c.wght / 8) * 8;
      const d = Math.round(c.wdth * 2) / 2;
      const fvs = `'wght' ${w}, 'wdth' ${d}`;
      if (fvs !== c.fvs) { c.fvs = fvs; c.el.style.fontVariationSettings = fvs; }
    }
    if (moving) frame = requestAnimationFrame(tick);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };

  // měření až po dojetí úvodní animace a načtení písma
  document.fonts.ready.then(() => setTimeout(measure, 2000));
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 150); });
  hero.addEventListener('pointermove', (e) => { mouse = { x: e.clientX, y: e.clientY }; schedule(); });
  hero.addEventListener('pointerleave', () => { mouse = null; schedule(); });
}

/* ---------- Magnetické tlačítko ---------- */
function initMagnet() {
  if (reduceMotion || !finePointer) return;
  $$('[data-magnet]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

/* ---------- Portfolio: na hlavní stránce jen vybrané projekty ---------- */
function initPortfolio(openGallery) {
  const featured = projects.filter((p) => p.featured);
  renderProjects($('[data-projects]'), featured, openGallery, moreTile(projects.length));
}

/* ---------- Co ode mě dostanete: záložky ---------- */
function initHandover() {
  const tabs = $$('.handover__tab');
  const panels = $$('.handover__panel');
  if (!tabs.length) return;
  const select = (i, focus = false) => {
    tabs.forEach((t, n) => {
      t.setAttribute('aria-selected', String(n === i));
      t.tabIndex = n === i ? 0 : -1;
      panels[n].classList.toggle('is-active', n === i);
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  // šipkami doleva a doprava se dá přepínat i z klávesnice
  $('.handover__tabs').addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0 || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    select((i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length, true);
  });
}

initHero();
initNav();
const openGallery = initLightbox();
initPortfolio(openGallery);
initHandover();
initBuilder();
initContact();
initFooter();
initReveal();
initMagnet();
