// label: Museum
// Reference theme. Every theme registers home(ctx), list(ctx), item(ctx) returning HTML for #app; after(ctx, el) is optional.
(() => {
  const header = (ctx, active = '') => {
    const { h, route } = ctx;
    return `<header class="top">
      <a class="logo" href="${h.url.home()}">Customization Museum</a>
      ${h.searchForm(route)}
      <nav>${h.themePicker()}<a href="${h.url.request()}" target="_blank" rel="noopener">Request</a></nav>
    </header>${h.warning()}`;
  };

  const card = (h, e) => `<article class="card">
    <a class="thumb" href="${h.url.item(e)}">${h.img(e)}</a>
    <div class="body">
      <a class="title" href="${h.url.item(e)}">${h.esc(e.t)}</a>
      <div class="meta">${h.esc(e.a)}${e.d ? ' · ' + h.esc(e.d) : ''}</div>
      <div class="links">${h.file(e) ? `<a href="${h.esc(h.file(e))}" target="_blank" rel="noopener">File</a>` : ''}<a class="dim" href="${h.esc(h.report(e))}" target="_blank" rel="noopener">Report</a></div>
    </div></article>`;

  const chips = (h, items, current, url) => items.map(([k, label, n]) => `<a class="chip${k === current ? ' on' : ''}" href="${url(k)}">${h.esc(label)}<i>${n}</i></a>`).join('');

  const pager = (h, r, l) => {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return `<nav class="pager">${p.prev ? `<a href="${p.prev}">‹ Prev</a>` : ''}${p.items.map(i => i.gap ? '<span>…</span>' : i.current ? `<b>${i.n}</b>` : `<a href="${i.url}">${i.n}</a>`).join('')}${p.next ? `<a href="${p.next}">Next ›</a>` : ''}</nav>`;
  };

  THEMES.default = {
    label: 'Museum',
    home(ctx) {
      const { h, manifest: m } = ctx;
      const apps = m.apps.map(a => `<a class="app" href="${h.url.app(a.slug)}"><b>${h.esc(a.name)}</b><span>${a.count.toLocaleString()}</span>
        <small>${Object.entries(a.types).slice(0, 3).map(([t, n]) => `${h.esc(t)} ${n}`).join(' · ')}</small></a>`).join('');
      const types = Object.entries(m.types).map(([t, n]) => `<a class="chip" href="${h.url.type(t)}">${h.esc(t)}<i>${n}</i></a>`).join('');
      const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).map(([s, i]) => `<a href="${h.url.site(s)}">${h.esc(i.name)} <i>${i.count}</i></a>`).join('');
      return `${header(ctx)}<main class="home">
        <p class="lead">${m.total.toLocaleString()} items from ${m.apps.length} programs, ${m.archived.toLocaleString()} archived.</p>
        <h2>Programs</h2><div class="apps">${apps}</div>
        <h2>Types</h2><div class="chips">${types}</div>
        <h2>Sources</h2><div class="sites">${sites}</div></main>`;
    },
    list(ctx) {
      const { h, route: r, list: l, about } = ctx;
      const f = l.facets;
      return `${header(ctx)}
        <div class="bar"><a class="chip${!r.app ? ' on' : ''}" href="${h.link(r, { app: '', type: '', tag: '' })}">All programs</a>${chips(h, f.apps, r.app, k => h.link(r, { app: k, type: '', tag: '' }))}</div>
        <div class="bar types">${chips(h, f.types.map(([t, n]) => [t, t, n]), l.typeName, t => h.link(r, { type: r.type && h.slug(r.type) === h.slug(t) ? '' : t, tag: '' }))}</div>
        ${f.tags.length ? `<div class="bar tags">${chips(h, f.tags.map(([t, n]) => [t, t, n]), r.tag, t => h.link(r, { tag: r.tag === t ? '' : t }))}</div>` : ''}
        ${about ? `<section class="about"><div class="tools"><a href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a><a href="${h.link(r, { site: '' })}">Close</a></div>${about.html}</section>` : ''}
        <div class="controls"><span>${l.total.toLocaleString()} items</span>${h.sortSelect(r)}${h.archSelect(r)}</div>
        <main>${l.rows.length ? `<div class="grid">${l.rows.map(e => card(h, e)).join('')}</div>` : '<p class="empty">No results</p>'}${pager(h, r, l)}</main>`;
    },
    item(ctx) {
      const { h, item: e } = ctx;
      if (!e) return `${header(ctx)}<main><p class="empty">Item not found. <a href="${h.url.home()}">Back to the museum</a></p></main>`;
      const a = (href, text, cls = '') => href ? `<a class="${cls}" href="${h.esc(href)}" target="_blank" rel="noopener">${text}</a>` : '';
      return `${header(ctx)}<main class="itemview"><div class="wrap">
        <div class="big">${h.media(e)}</div>
        <div><h1>${h.esc(e.t)}</h1>
          <dl>${h.details(e).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
          <div class="acts">${a(h.file(e), 'Download', 'primary')}${a(h.page(e), 'Original page')}${a(h.edit(e), 'Edit')}${a(h.report(e), 'Report', 'dim')}</div>
          ${e.desc ? `<div class="desc">${e.desc}</div>` : ''}
        </div></div></main>`;
    },
  };
})();
