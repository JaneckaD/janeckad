// Značky karet projektů bez závislosti na prohlížeči.
// Používá je stránka v prohlížeči i sestavení webu (vite.seo.js), které karty vloží
// rovnou do HTML, aby je viděly i vyhledávače a náhledy odkazů bez JavaScriptu.

export const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const icons = {
  gallery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
};

// asset – převede cestu obrázku (portfolio/x.jpg) na adresu platnou pro danou stránku
export function projectCards(items, asset, extra = '') {
  return (
    items
      .map((p, i) => {
        const hasGallery = Array.isArray(p.gallery) && p.gallery.length > 0;
        const tag = hasGallery ? `${icons.gallery} Zobrazit galerii` : `${icons.link} Navštívit web`;
        const inner = `
        <div class="project__media">
          <img src="${escapeHtml(asset(p.cover))}" alt="${escapeHtml(`Náhled projektu ${p.title}`)}" width="1800" height="1200" loading="lazy" decoding="async" />
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
        return `<li data-reveal data-type="${escapeHtml(p.type || '')}">${el}</li>`;
      })
      .join('') + extra
  );
}

// Poslední dlaždice na hlavní stránce, vede na stránku se všemi pracemi
export function moreTile(count) {
  const word = count === 1 ? 'projekt' : count < 5 ? 'projekty' : 'projektů';
  return `
    <li data-reveal>
      <a class="work__more" href="portfolio/">
        <span class="work__more-kicker">${count} ${word} na jednom místě</span>
        <span class="work__more-title">Celé portfolio</span>
        <span class="work__more-text">Weby, loga i celé vizuální identity.</span>
        <span class="work__more-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>
    </li>`;
}
