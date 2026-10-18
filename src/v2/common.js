// Náklon vrstev v úvodu za kurzorem
import { reduceMotion, finePointer } from '../shared.js';

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
