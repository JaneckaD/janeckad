// Nová verze webu: stránka se všemi pracemi a filtrem
import './style.css';
import { projects } from '../data/projects.js';
import { $, $$, reduceMotion, escapeHtml, initNav, initReveal, renderProjects, initLightbox, initFooter } from '../shared.js';

const filters = [
  { id: 'vse', label: 'Vše', match: () => true },
  { id: 'web', label: 'Weby', match: (p) => p.type === 'web' },
  { id: 'grafika', label: 'Grafika a identity', match: (p) => p.type === 'grafika' },
];

function initGrid(openGallery) {
  const list = $('[data-projects]');
  renderProjects(list, projects, openGallery);
  const items = $$(':scope > li', list);

  const root = $('[data-filters]');
  const shown = filters.filter((f) => f.id === 'vse' || projects.some(f.match));
  root.innerHTML = shown
    .map((f) => `<button class="filter" type="button" data-filter="${f.id}" aria-pressed="${f.id === 'vse'}">${escapeHtml(f.label)}<small>${projects.filter(f.match).length}</small></button>`)
    .join('');
  // s jediným druhem prací by filtr nedával smysl
  root.hidden = shown.length < 3;

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
    const filter = filters.find((f) => f.id === btn.dataset.filter);
    $$('[data-filter]', root).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    items.forEach((li, i) => {
      const show = filter.match(projects[i]);
      li.hidden = !show;
      // karty, které už byly vidět, krátce naskočí, ať je jasné, že se seznam změnil
      if (show && !reduceMotion && li.classList.contains('is-in')) {
        li.classList.remove('is-shuffled');
        void li.offsetWidth;
        li.classList.add('is-shuffled');
      }
    });
  });
}

initNav();
initGrid(initLightbox());
initFooter();
initReveal();
