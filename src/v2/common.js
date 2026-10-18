// Společné věci obou stránek nové verze: barevná varianta a náklon karet v úvodu
import { $, $$, reduceMotion, finePointer } from '../shared.js';

/* ---------- Přepínač barevné varianty: tlačítko vpravo dole otevře seznam ---------- */
export function initSwatch() {
  const root = document.documentElement;
  const box = $('[data-swatch]');
  if (!box) return;
  const toggle = $('[data-swatch-toggle]', box);
  const list = $('[data-swatch-list]', box);
  const name = $('[data-swatch-name]', box);
  const buttons = $$('[data-barvy-set]', box);
  const setOpen = (open) => {
    box.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  const sync = () =>
    buttons.forEach((b) => {
      const on = b.dataset.barvySet === root.dataset.barvy;
      b.setAttribute('aria-pressed', String(on));
      if (on) name.textContent = b.textContent.trim();
    });
  toggle.addEventListener('click', () => setOpen(!box.classList.contains('is-open')));
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      root.dataset.barvy = b.dataset.barvySet;
      try { localStorage.setItem('dj-barvy', b.dataset.barvySet); } catch {}
      sync();
    }),
  );
  document.addEventListener('click', (e) => { if (!box.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && box.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
  list.hidden = false;
  sync();
}

/* ---------- Jemný náklon karet za kurzorem (jen transform) ---------- */
export function initTilt(area, layers) {
  if (!area || reduceMotion || !finePointer) return;
  let frame = 0;
  let x = 0;
  let y = 0;
  const apply = () => {
    frame = 0;
    layers.forEach(([el, depth]) => { el.style.translate = `${(x * depth).toFixed(1)}px ${(y * depth).toFixed(1)}px`; });
  };
  area.addEventListener('pointermove', (e) => {
    const r = area.getBoundingClientRect();
    x = (e.clientX - r.left) / r.width - 0.5;
    y = (e.clientY - r.top) / r.height - 0.5;
    if (!frame) frame = requestAnimationFrame(apply);
  });
  area.addEventListener('pointerleave', () => { x = 0; y = 0; if (!frame) frame = requestAnimationFrame(apply); });
}
