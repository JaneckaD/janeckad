// Nová verze webu: hlavní stránka
import './style.css';
import { projects } from '../data/projects.js';
import { moreTile } from '../cards.js';
import { $, $$, initNav, initReveal, renderProjects, initLightbox, initFooter } from '../shared.js';
import { initBuilder } from '../builder.js';
import { initContact } from '../contact.js';
import { initSwatch, initTilt } from './common.js';

/* ---------- Co ode mě dostanete: záložky ---------- */
function initHandover() {
  const tabs = $$('.seg__btn');
  const panels = $$('.ho__panel');
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
  $('.seg').addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0 || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    select((i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length, true);
  });
}

initSwatch();
initNav();
const openGallery = initLightbox();
renderProjects($('[data-projects]'), projects.filter((p) => p.featured), openGallery, moreTile(projects.length));
initHandover();
initBuilder();
initContact();
initFooter();
initReveal();
initTilt($('.hero__visual'), [
  ...$$('.stack__card').map((el, i) => [el, 6 + i * 5]),
  [$('.sticker--a'), -14],
  [$('.sticker--b'), 18],
]);
