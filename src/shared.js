// Věci, které používá hlavní stránka i stránka Portfolio
import { site } from './data/site.js';
import { services } from './data/services.js';
import { escapeHtml, icons, projectCards } from './cards.js';

export { escapeHtml, icons };

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;
export const kc = (n) => new Intl.NumberFormat('cs-CZ').format(Math.round(n));

// Kořen webu odvozený od umístění tohoto skriptu (leží ve složce assets/),
// takže web funguje na vlastní doméně i v podsložce na GitHub Pages.
export const siteRoot = new URL('../', import.meta.url).href;

// Obrázky z public/ zadáváme bez lomítka na začátku (portfolio/x.jpg).
// Tady se k nim doplní cesta webu, aby fungovaly na hlavní stránce i na /portfolio/.
export const asset = (src = '') => (/^([a-z]+:|\/)/i.test(src) ? src : siteRoot + src);

/* ---------- Navigace ---------- */
export function initNav() {
  const nav = $('[data-nav]');
  const links = $$('[data-nav-links] a:not(.nav__menu-cta)');
  const toggle = $('[data-nav-toggle]');
  const darkSections = $$('.work, .contact');
  const progress = $('[data-progress]');

  // tmavá varianta nad tmavými sekcemi + ukazatel, kolik stránky je přečteno
  // nejdřív všechno změříme a až potom zapisujeme, jinak by prohlížeč
  // musel stránku přepočítávat několikrát za jeden snímek
  const navHalf = () => nav.offsetHeight / 2;
  let probe = navHalf();
  window.addEventListener('resize', () => { probe = navHalf(); });
  const onScroll = () => {
    const y = window.scrollY;
    const dark = darkSections.some((sec) => {
      const r = sec.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe;
    });
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-dark', dark);
    // přímo na proužek, ne jako proměnná na celou lištu (ta by se pak přepočítávala celá)
    progress.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
  };
  onScroll();
  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; onScroll(); });
  }, { passive: true });

  // na hlavní stránce se podtrhne odkaz sekce, kterou právě čtete
  // (na podstránce je aktivní odkaz pevně daný přes aria-current="page")
  const hashLinks = links.filter((l) => l.getAttribute('href').startsWith('#'));
  if (hashLinks.length && 'IntersectionObserver' in window) {
    const sections = hashLinks.map((l) => $(l.getAttribute('href'))).filter(Boolean);
    let active = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const link = hashLinks.find((l) => l.getAttribute('href') === `#${e.target.id}`);
          if (e.isIntersecting) active = link;
          else if (active === link) active = null;
        }
        hashLinks.forEach((l) => (l === active ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((sec) => io.observe(sec));
  }

  // mobilní menu
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  $('[data-nav-links]').addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

/* ---------- Odhalování nadpisů při scrollu ---------- */
export function initReveal() {
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
        io.unobserve(el);
        // Prvek přichází shora (scroll nahoru, nebo prohlížeč po obnovení stránky vrátil
        // pozici doprostřed): ukážeme ho hned, bez animace. Jinak by obsah nad vámi
        // naskakoval a posouval se proti směru scrollu a stránka by působila, že skáče.
        if (entry.boundingClientRect.top < 0) {
          el.classList.add('is-instant', 'is-in');
          continue;
        }
        // sourozenci se odhalí s malým zpožděním za sebou
        const siblings = $$('[data-reveal]', el.parentElement);
        el.style.transitionDelay = `${Math.max(0, siblings.indexOf(el)) * 90}ms`;
        el.classList.add('is-in');
      }
    },
    // nahoře s rezervou, aby se obsah nad obrazovkou připravil dřív, než na něj dojedete
    { rootMargin: '300px 0px -12% 0px' },
  );
  items.forEach((el) => io.observe(el));
}

/* ---------- Karty projektů ---------- */
// Vykreslí projekty do seznamu; klik na projekt s galerií ji otevře.
// Stejné karty vkládá do HTML už sestavení webu (kvůli vyhledávačům), tady se jen obnoví.
export function renderProjects(list, items, openGallery, extra = '') {
  list.innerHTML = projectCards(items, asset, extra);

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-index]');
    if (btn) openGallery(items[Number(btn.dataset.index)], btn);
  });
}

/* ---------- Galerie ---------- */
export function initLightbox() {
  const dialog = $('[data-lightbox]');
  const img = $('[data-lb-img]', dialog);
  const caption = $('[data-lb-caption]', dialog);
  const thumbs = $('[data-lb-thumbs]', dialog);
  const link = $('[data-lb-link]', dialog);
  const chapters = $('[data-lb-chapters]', dialog);
  const caseBox = $('[data-lb-case]', dialog);
  const body = $('[data-lb-body]', dialog);
  let current = null;
  let index = 0;
  let opener = null;

  const show = (i, dir = 1) => {
    const items = current.gallery;
    index = (i + items.length) % items.length;
    const item = items[index];
    img.src = asset(item.src);
    img.alt = item.alt || current.title;
    // u fotek od jiných autorů je pod popiskem odkaz na originál
    const credit = item.credit
      ? `<small class="lightbox__credit">${item.creditUrl ? `<a href="${escapeHtml(item.creditUrl)}" target="_blank" rel="noopener">${escapeHtml(item.credit)}</a>` : escapeHtml(item.credit)}</small>`
      : '';
    caption.innerHTML = escapeHtml(item.alt || '') + credit;
    img.style.setProperty('--dir', dir);
    img.classList.remove('is-swapping');
    void img.offsetWidth; // restart animace
    img.classList.add('is-swapping');
    $$('button', thumbs).forEach((b, bi) => b.setAttribute('aria-current', String(bi === index)));
    // u projektu s postupem se zvýrazní krok, ke kterému obrázek patří
    if (current.steps) {
      const step = current.steps.reduce((acc, st, si) => (st.from <= index ? si : acc), 0);
      $$('[data-goto]', dialog).forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.step) === step)));
      const chip = chapters.children[step];
      if (chip && chapters.scrollWidth > chapters.clientWidth) {
        chapters.scrollTo({ left: chip.offsetLeft - (chapters.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
      }
    }
    // na mobilu jsou náhledy v posuvném řádku, aktivní ať je vždy vidět
    const active = thumbs.children[index];
    if (active && thumbs.scrollWidth > thumbs.clientWidth) {
      thumbs.scrollTo({ left: active.offsetLeft - (thumbs.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' });
    }
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
      .map((g, i) => `<button type="button" data-thumb="${i}" aria-label="Obrázek ${i + 1}"><img src="${escapeHtml(asset(g.src))}" alt="" /></button>`)
      .join('');
    project.gallery.forEach((g) => { const pre = new Image(); pre.decoding = 'async'; pre.src = asset(g.src); });
    renderCase(project);
    body.scrollTop = 0;
    show(0);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('lb-open');
  };

  // Postup, co klient dostane a obsah prezentace (jen u projektů, které mají steps)
  const renderCase = (project) => {
    const steps = project.steps || [];
    const has = steps.length > 0;
    dialog.classList.toggle('lightbox--case', has);
    chapters.hidden = !has;
    caseBox.hidden = !has;
    if (!has) return;
    const num = (i) => String(i + 1).padStart(2, '0');
    chapters.innerHTML = steps
      .map((st, i) => `<button type="button" data-goto="${st.from}" data-step="${i}"><span>${num(i)}</span>${escapeHtml(st.title)}</button>`)
      .join('') + '<button class="lightbox__jump" type="button" data-jump-case>Detail projektu ↓</button>';
    $('[data-lb-steps]', caseBox).innerHTML = steps
      .map((st, i) => `
        <li><button type="button" data-goto="${st.from}" data-step="${i}" data-scroll-up>
          <span class="case__num">${num(i)}</span>
          <span class="case__title">${escapeHtml(st.title)}</span>
          <span class="case__text">${escapeHtml(st.text)}</span>
        </button></li>`)
      .join('');
    $('[data-lb-steps-title]', caseBox).textContent = project.stepsTitle || 'Jak to probíhalo';
    $('[data-lb-includes-title]', caseBox).textContent = project.includesTitle || 'Co klient dostane';
    $('[data-lb-includes]', caseBox).innerHTML = (project.includes || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('');
    // ke kterému balíčku z nabídky projekt patří, s odkazem na skládačku služeb
    const svc = services.find((x) => x.id === project.service);
    const svcBox = $('[data-lb-service]', caseBox);
    svcBox.hidden = !svc;
    if (svc) {
      // stránka si může určit vlastní adresu ceníku (data-pricing na <body>)
      const pricing = document.body.dataset.pricing || `${siteRoot}#sluzby`;
      svcBox.innerHTML = `Odpovídá službě <strong>${escapeHtml(svc.name)}</strong> z nabídky. <a href="${escapeHtml(pricing)}">Spočítat cenu</a>`;
    }
    const pdf = project.presentation;
    const pdfBox = $('[data-lb-pdf]', caseBox);
    pdfBox.hidden = !pdf;
    if (pdf) {
      pdfBox.innerHTML = `
        <h4>${escapeHtml(pdf.title)}</h4>
        <p>${escapeHtml(pdf.text)}</p>
        ${pdf.pages ? `<ul class="case__pages">${pdf.pages.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
        ${pdf.link ? `<a class="btn btn--light btn--small btn--arrow case__link" href="${escapeHtml(pdf.link.url)}" target="_blank" rel="noopener">${escapeHtml(pdf.link.label)} ${icons.link}</a>` : ''}`;
    }
  };
  dialog.addEventListener('click', (e) => {
    // odkaz na ceník: nejdřív zavřít galerii, pak teprve přejít
    const pkgLink = e.target.closest('.case__pkg a');
    if (pkgLink) {
      e.preventDefault();
      dialog.addEventListener('close', () => { location.href = pkgLink.href; }, { once: true });
      close();
      return;
    }
    if (e.target.closest('[data-jump-case]')) {
      body.scrollTo({ top: caseBox.offsetTop - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    const b = e.target.closest('[data-goto]');
    if (!b) return;
    const to = Number(b.dataset.goto);
    show(to, to < index ? -1 : 1);
    // z popisu postupu dole vyjedeme nahoru k obrázku
    if (b.hasAttribute('data-scroll-up')) body.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

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
    document.documentElement.classList.remove('lb-open');
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

/* ---------- Patička ---------- */
export function initFooter() {
  $('[data-year]').textContent = new Date().getFullYear();
  $('[data-socials]').innerHTML = site.socials
    .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`)
    .join('');
}
