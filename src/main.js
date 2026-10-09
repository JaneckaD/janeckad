import './style.css';
import { site } from './data/site.js';
import { projects } from './data/projects.js';
import { services, bundles, discount } from './data/services.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const kc = (n) => new Intl.NumberFormat('cs-CZ').format(Math.round(n));
const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

document.documentElement.classList.add('js');

/* ---------- Hero: písmena jména reagují na kurzor ---------- */
function initHero() {
  const nameEl = $('[data-name]');
  const letters = [...nameEl.textContent.trim()];
  nameEl.innerHTML = letters
    .map((ch, i) => `<span class="ch" style="--i:${i}" aria-hidden="true">${escapeHtml(ch)}</span>`)
    .join('');

  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

  if (reduceMotion || !finePointer) return;
  const chars = $$('.ch', nameEl);
  let frame = 0;
  let mouse = null;

  const update = () => {
    frame = 0;
    for (const ch of chars) {
      if (!mouse) {
        ch.style.fontVariationSettings = '';
        continue;
      }
      const r = ch.getBoundingClientRect();
      const dx = mouse.x - (r.left + r.width / 2);
      const dy = mouse.y - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const t = Math.max(0, 1 - dist / 520); // 1 = kurzor přímo nad písmenem
      const wght = 800 - t * 580;
      const wdth = 100 - t * 25;
      ch.style.fontVariationSettings = `'wght' ${wght.toFixed(0)}, 'wdth' ${wdth.toFixed(1)}, 'opsz' 96`;
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

  const hero = $('.hero');
  hero.addEventListener('pointermove', (e) => { mouse = { x: e.clientX, y: e.clientY }; schedule(); });
  hero.addEventListener('pointerleave', () => { mouse = null; schedule(); });
}

/* ---------- Navigace: pozadí po odscrollování, tmavá nad tmavými sekcemi ---------- */
function initNav() {
  const nav = $('[data-nav]');
  const darkSections = $$('.work, .contact');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
    const probe = nav.offsetHeight / 2;
    const overDark = darkSections.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe;
    });
    nav.classList.toggle('is-dark', overDark);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Odhalování nadpisů při scrollu ---------- */
function initReveal() {
  const items = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        // sourozenci se odhalí s malým zpožděním za sebou
        const siblings = $$('[data-reveal]', el.parentElement);
        el.style.transitionDelay = `${Math.max(0, siblings.indexOf(el)) * 90}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  items.forEach((el) => io.observe(el));
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

/* ---------- Portfolio ---------- */
const icons = {
  gallery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
};

function initPortfolio(openGallery) {
  const list = $('[data-projects]');
  list.innerHTML = projects
    .map((p, i) => {
      const hasGallery = Array.isArray(p.gallery) && p.gallery.length > 0;
      const tag = hasGallery ? `${icons.gallery} Zobrazit galerii` : `${icons.link} Navštívit web`;
      const inner = `
        <div class="project__media">
          <img src="${escapeHtml(p.cover)}" alt="" loading="lazy" />
          <span class="project__tag">${tag}</span>
        </div>
        <div class="project__info">
          <h3 class="project__title">${escapeHtml(p.title)}</h3>
          <span class="project__meta">${escapeHtml(p.category)}, ${escapeHtml(p.year)}</span>
        </div>
        <p class="project__desc">${escapeHtml(p.description)}</p>`;
      const el = hasGallery
        ? `<button class="project" type="button" data-index="${i}" aria-haspopup="dialog">${inner}</button>`
        : p.link
          ? `<a class="project" href="${escapeHtml(p.link)}" target="_blank" rel="noopener">${inner}</a>`
          : `<div class="project">${inner}</div>`;
      return `<li data-reveal>${el}</li>`;
    })
    .join('');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-index]');
    if (btn) openGallery(projects[Number(btn.dataset.index)], btn);
  });

  // jemné naklonění karty podle kurzoru
  if (reduceMotion || !finePointer) return;
  $$('.project', list).forEach((card) => {
    const media = $('.project__media', card);
    card.addEventListener('pointermove', (e) => {
      const r = media.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      media.style.setProperty('--ry', `${px * 6}deg`);
      media.style.setProperty('--rx', `${-py * 6}deg`);
    });
    card.addEventListener('pointerleave', () => {
      media.style.setProperty('--ry', '0deg');
      media.style.setProperty('--rx', '0deg');
    });
  });
}

/* ---------- Galerie ---------- */
function initLightbox() {
  const dialog = $('[data-lightbox]');
  const img = $('[data-lb-img]', dialog);
  const caption = $('[data-lb-caption]', dialog);
  const thumbs = $('[data-lb-thumbs]', dialog);
  const link = $('[data-lb-link]', dialog);
  let current = null;
  let index = 0;
  let opener = null;

  const show = (i, dir = 1) => {
    const items = current.gallery;
    index = (i + items.length) % items.length;
    const item = items[index];
    img.src = item.src;
    img.alt = item.alt || current.title;
    caption.textContent = item.alt || '';
    img.style.setProperty('--dir', dir);
    img.classList.remove('is-swapping');
    void img.offsetWidth; // restart animace
    img.classList.add('is-swapping');
    $$('button', thumbs).forEach((b, bi) => b.setAttribute('aria-current', String(bi === index)));
  };

  const open = (project, trigger) => {
    current = project;
    opener = trigger;
    $('[data-lb-title]', dialog).textContent = project.title;
    $('[data-lb-meta]', dialog).textContent = project.description;
    link.hidden = !project.link;
    if (project.link) link.href = project.link;
    dialog.classList.toggle('lightbox--single', project.gallery.length < 2);
    thumbs.innerHTML = project.gallery
      .map((g, i) => `<button type="button" data-thumb="${i}" aria-label="Obrázek ${i + 1}"><img src="${escapeHtml(g.src)}" alt="" /></button>`)
      .join('');
    show(0);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    const finish = () => {
      dialog.classList.remove('is-closing');
      dialog.close();
    };
    if (reduceMotion) return finish();
    dialog.classList.add('is-closing');
    setTimeout(finish, 280);
  };

  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    opener?.focus();
  });
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); }); // klik mimo obsah
  $('[data-lb-close]', dialog).addEventListener('click', close);
  $('[data-lb-prev]', dialog).addEventListener('click', () => show(index - 1, -1));
  $('[data-lb-next]', dialog).addEventListener('click', () => show(index + 1, 1));
  thumbs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-thumb]');
    if (b) { const i = Number(b.dataset.thumb); show(i, i < index ? -1 : 1); }
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1, -1);
    if (e.key === 'ArrowRight') show(index + 1, 1);
  });

  // swipe na mobilu
  let startX = null;
  img.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  img.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    startX = null;
  });

  return open;
}

/* ---------- Skládačka služeb ---------- */
function initBuilder() {
  const root = $('[data-services]');
  const groups = [...new Set(services.map((s) => s.group))];
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17 19 7"/></svg>';

  root.innerHTML = groups
    .map(
      (g, gi) => `
      <div class="svc-group" role="group" aria-labelledby="svc-group-${gi}">
        <h3 id="svc-group-${gi}">${escapeHtml(g)}</h3>
        <div class="svc-list">
          ${services
            .filter((s) => s.group === g)
            .map(
              (s) => `
            <div class="svc">
              <input type="checkbox" id="svc-${s.id}" value="${s.id}" />
              <label for="svc-${s.id}">
                <span class="svc__name">${escapeHtml(s.name)}</span>
                <span class="svc__check">${check}</span>
                <span class="svc__desc">${escapeHtml(s.desc)}</span>
                <span class="svc__price">od ${kc(s.price)} Kč${s.monthly ? ' / měsíc' : ''}</span>
              </label>
            </div>`,
            )
            .join('')}
        </div>
      </div>`,
    )
    .join('');

  const bundleRoot = $('[data-bundles]');
  bundleRoot.innerHTML = bundles
    .map((b, i) => `<button class="bundle" type="button" data-bundle="${i}" aria-pressed="false">${escapeHtml(b.name)}<small>${escapeHtml(b.desc)}</small></button>`)
    .join('');

  const inputs = $$('input[type=checkbox]', root);
  const list = $('[data-summary-list]');
  const empty = $('[data-summary-empty]');
  const totalEl = $('[data-total]');
  const monthlyEl = $('[data-monthly]');
  const discountEl = $('[data-discount]');
  const discountRow = $('[data-discount-row]');
  const monthlyRow = $('[data-monthly-row]');
  const hint = $('[data-discount-hint]');
  $('[data-discount-label]').textContent = `Sleva ${discount.percent} % za kombinaci`;

  const animated = new Map();
  const countTo = (el, target) => {
    const from = animated.get(el) ?? 0;
    animated.set(el, target);
    if (reduceMotion) { el.textContent = kc(target); return; }
    const start = performance.now();
    const dur = 650;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = kc(from + (target - from) * eased);
      if (t < 1 && animated.get(el) === target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  let previous = new Set();
  const selected = () => services.filter((s) => inputs.find((i) => i.value === s.id)?.checked);

  const render = () => {
    const chosen = selected();
    const ids = new Set(chosen.map((s) => s.id));
    const oneOff = chosen.filter((s) => !s.monthly);
    const monthly = chosen.filter((s) => s.monthly);
    const base = oneOff.reduce((sum, s) => sum + s.price, 0);
    const hasDiscount = oneOff.length >= discount.minItems;
    const saved = hasDiscount ? (base * discount.percent) / 100 : 0;
    const monthlySum = monthly.reduce((sum, s) => sum + s.price, 0);

    // seznam: nové položky dostanou animaci, staré zůstanou v klidu
    list.innerHTML = chosen
      .map((s) => `<li${previous.has(s.id) ? ' style="animation:none"' : ''}><span>${escapeHtml(s.name)}</span><span>${kc(s.price)} Kč${s.monthly ? ' / měs.' : ''}</span></li>`)
      .join('');
    previous = ids;
    empty.hidden = chosen.length > 0;

    discountRow.hidden = !hasDiscount;
    discountEl.textContent = `−${kc(saved)} Kč`;
    monthlyRow.hidden = monthly.length === 0;
    countTo(totalEl, base - saved);
    countTo(monthlyEl, monthlySum);

    const missing = discount.minItems - oneOff.length;
    hint.textContent =
      oneOff.length > 0 && missing > 0
        ? `Přidejte ještě ${missing === 1 ? 'jednu službu' : `${missing} služby`} a dostanete slevu ${discount.percent} %.`
        : hasDiscount
          ? `Kombinace se vyplatí: ušetříte ${kc(saved)} Kč.`
          : '';

    $$('[data-bundle]', bundleRoot).forEach((b) => {
      const items = bundles[Number(b.dataset.bundle)].items;
      const match = items.length === ids.size && items.every((id) => ids.has(id));
      b.setAttribute('aria-pressed', String(match));
    });
  };

  root.addEventListener('change', render);
  bundleRoot.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bundle]');
    if (!b) return;
    const items = bundles[Number(b.dataset.bundle)].items;
    inputs.forEach((i) => { i.checked = items.includes(i.value); });
    render();
  });

  // „Poslat poptávku“ předvyplní zprávu ve formuláři
  $('[data-send-selection]').addEventListener('click', () => {
    const chosen = selected();
    if (!chosen.length) return;
    const msg = $('[data-message]');
    const lines = chosen.map((s) => `• ${s.name}`).join('\n');
    msg.value = `Dobrý den, zajímá mě:\n${lines}\n\nOrientační cena z webu: od ${totalEl.textContent} Kč.\n\nO projektu: `;
  });

  render();
}

/* ---------- Kontaktní formulář ---------- */
function initContact() {
  const form = $('[data-form]');
  const error = $('[data-form-error]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = $$('input, textarea', form);
    let firstInvalid = null;
    fields.forEach((f) => {
      const ok = f.checkValidity() && f.value.trim() !== '';
      f.setAttribute('aria-invalid', String(!ok));
      if (!ok && !firstInvalid) firstInvalid = f;
    });
    if (firstInvalid) {
      error.textContent =
        firstInvalid.type === 'email' && firstInvalid.value
          ? 'E-mail nevypadá správně. Zkontrolujte, jestli v něm je zavináč a doména.'
          : 'Vyplňte prosím všechna pole, ať vím, komu a co odpovědět.';
      firstInvalid.focus();
      return;
    }
    error.textContent = '';
    const data = new FormData(form);
    const subject = `Poptávka z webu od ${data.get('name')}`;
    const body = `${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`;
    // Zatím otevře e-mailového klienta. Později lze napojit např. na Formspree nebo Netlify Forms.
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'false');
  });

  $('[data-year]').textContent = new Date().getFullYear();
  $('[data-socials]').innerHTML = site.socials
    .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`)
    .join('');
}

initHero();
initNav();
const openGallery = initLightbox();
initPortfolio(openGallery);
initBuilder();
initContact();
initReveal();
initMagnet();
