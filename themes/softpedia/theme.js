// label: Download Portal 2006
(() => {
  const chrome = (ctx, crumbs = []) => {
    const { h, route } = ctx;
    const trail = [[h.url.home(), 'Home'], ...crumbs].map(([u, t], i, a) => i === a.length - 1 ? `<b>${h.esc(t)}</b>` : `<a href="${u}">${h.esc(t)}</a>`).join(' &gt; ');
    return `<div class="sp-top"><div class="sp-in">
      <a class="sp-logo" href="${h.url.home()}"><span>Customization</span> Museum <small>Downloads</small></a>
      <div class="sp-search">${h.searchForm(route, 'Search programs, skins, themes...')}</div>
      <div class="sp-util">${h.themePicker()} <a href="${h.url.request()}" target="_blank" rel="noopener">Submit</a></div></div></div>
      <div class="sp-tabs"><div class="sp-in"><a href="${h.url.home()}">Home</a><a href="${h.url.type('Skins')}">Skins</a><a href="${h.url.type('Themes')}">Themes</a><a href="${h.url.type('Emoticons')}">Emoticons</a><a href="${h.link(route, { app: '', type: '', site: '', tag: '', q: '', arch: '1' })}">Archived</a></div></div>
      <div class="sp-page">${h.warning()}<div class="sp-crumbs">${trail}</div>`;
  };
  const badge = (cls, t) => `<span class="sp-b ${cls}">${t}</span>`;
  const row = (h, e) => `<div class="sp-row">
    <a class="sp-th" href="${h.url.item(e)}">${h.img(e) || '<span>No preview</span>'}</a>
    <div class="sp-info"><a class="sp-title" href="${h.url.item(e)}">${h.esc(e.t)}</a>
      <div class="sp-meta">${h.esc(e.a)} &middot; ${e.y.map(h.esc).join(', ')}${e.d ? ' &middot; ' + h.esc(e.d) : ''} &middot; ${h.esc(h.siteName(e.s))}</div>
      <div class="sp-badges">${e.y.slice(0, 2).map(t => badge('t', h.esc(t))).join('')}${e.d ? badge('d', h.esc(e.d.slice(0, 4))) : ''}${e.z ? badge('a', 'Archived') : badge('n', 'Not archived')}</div></div>
    <div class="sp-act">${h.file(e) ? `<a class="sp-dl" href="${h.esc(h.file(e))}" target="_blank" rel="noopener">Download</a>` : `<a class="sp-dl alt" href="${h.url.item(e)}">Details</a>`}<a class="sp-more" href="${h.url.item(e)}">More info</a></div></div>`;
  const pager = (h, r, l) => {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return `<div class="sp-pager"><span>Page ${l.page} of ${l.pages}:</span>${p.prev ? `<a href="${p.prev}">&laquo; Prev</a>` : ''}${p.items.map(i => i.gap ? '<em>...</em>' : i.current ? `<b>${i.n}</b>` : `<a href="${i.url}">${i.n}</a>`).join('')}${p.next ? `<a href="${p.next}">Next &raquo;</a>` : ''}</div>`;
  };
  const box = (title, body, cls = '') => `<div class="sp-box ${cls}"><h3>${title}</h3><div class="sp-bd">${body}</div></div>`;

  THEMES.softpedia = {
    label: 'Download Portal 2006',
    home(ctx) {
      const { h, manifest: m } = ctx, E = h.esc;
      const cats = m.apps.map(a => `<div class="sp-cat"><a class="sp-cn" href="${h.url.app(a.slug)}">${E(a.name)}</a> <span>(${a.count.toLocaleString()})</span>
        <div>${Object.entries(a.types).slice(0, 3).map(([t, n]) => `<a href="${h.link({}, { app: a.slug, type: t })}">${E(t)}</a> (${n})`).join(', ')}</div></div>`).join('');
      const top = [...m.apps].sort((a, b) => b.count - a.count).slice(0, 10);
      const types = Object.entries(m.types).sort((a, b) => b[1] - a[1]);
      const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).slice(0, 10);
      return `${chrome(ctx)}<div class="sp-hero"><h1>Free skins, themes and emoticons downloads</h1>
        <p><b>${m.total.toLocaleString()}</b> files in <b>${m.apps.length}</b> programs &middot; <b>${m.archived.toLocaleString()}</b> archived</p></div>
        <div class="sp-cols"><div class="sp-main"><h2 class="sp-h">Browse by program</h2><div class="sp-dir">${cats}</div></div>
        <aside class="sp-side">${box('Popular programs', `<ol>${top.map(a => `<li><a href="${h.url.app(a.slug)}">${E(a.name)}</a> <i>${a.count.toLocaleString()}</i></li>`).join('')}</ol>`)}
        ${box('Popular types', `<ol>${types.map(([t, n]) => `<li><a href="${h.url.type(t)}">${E(t)}</a> <i>${n.toLocaleString()}</i></li>`).join('')}</ol>`)}
        ${box('Top sources', `<ol>${sites.map(([s, i]) => `<li><a href="${h.url.site(s)}">${E(i.name)}</a> <i>${i.count.toLocaleString()}</i></li>`).join('')}</ol>`)}</aside></div></div>`;
    },
    list(ctx) {
      const { h, route: r, list: l, about } = ctx, E = h.esc, f = l.facets;
      const crumbs = [];
      if (r.app) crumbs.push([h.url.app(r.app), h.appName(r.app)]);
      if (r.site) crumbs.push([h.url.site(r.site), h.siteName(r.site)]);
      if (r.type) crumbs.push([h.url.type(r.type), l.typeName]);
      if (r.tag) crumbs.push([h.link(r, {}), 'Tag: ' + r.tag]);
      if (r.q) crumbs.push([h.link(r, {}), `Search: ${r.q}`]);
      if (!crumbs.length) crumbs.push([h.link(r, {}), r.arch === '1' ? 'Archived' : 'All files']);
      const title = crumbs.at(-1)[1];
      const li = (on, href, t, n) => `<li${on ? ' class="on"' : ''}><a href="${href}">${E(t)}</a> <i>${n}</i></li>`;
      return `${chrome(ctx, crumbs)}<div class="sp-cols"><aside class="sp-side">
        ${box('Programs', `<ul>${li(!r.app, h.link(r, { app: '', type: '', tag: '' }), 'All programs', '')}${f.apps.map(([k, n, c]) => li(k === r.app, h.link(r, { app: k, type: '', tag: '' }), n, c)).join('')}</ul>`)}
        ${box('File types', `<ul>${f.types.map(([t, n]) => li(r.type && h.slug(r.type) === h.slug(t), h.link(r, { type: r.type && h.slug(r.type) === h.slug(t) ? '' : t, tag: '' }), t, n)).join('')}</ul>`)}
        ${f.tags.length ? box('Tags', `<p class="sp-tags">${f.tags.slice(0, 40).map(([t, n]) => `<a class="${r.tag === t ? 'on' : ''}" href="${h.link(r, { tag: r.tag === t ? '' : t })}">${E(t)}</a>`).join(' ')}</p>`) : ''}</aside>
        <div class="sp-main"><h1 class="sp-h1">${E(title)} downloads</h1>
        ${about ? `<div class="sp-about"><div class="sp-tools"><a href="${E(about.edit)}" target="_blank" rel="noopener">Edit</a> <a href="${h.link(r, { site: '' })}">Close</a></div>${about.html}</div>` : ''}
        <div class="sp-bar"><b>${l.total.toLocaleString()}</b> files found <span>Sort: ${h.sortSelect(r)} Show: ${h.archSelect(r)}</span></div>
        ${l.rows.length ? l.rows.map(e => row(h, e)).join('') : '<p class="sp-empty">No files found.</p>'}${pager(h, r, l)}</div></div></div>`;
    },
    item(ctx) {
      const { h, item: e } = ctx, E = h.esc;
      if (!e) return `${chrome(ctx, [['', 'Not found']])}<p class="sp-empty">Item not found. <a href="${h.url.home()}">Back to home</a></p></div>`;
      const crumbs = [[h.url.app(e.k), e.a]];
      if (e.y[0]) crumbs.push([h.link({}, { app: e.k, type: e.y[0] }), e.y[0]]);
      crumbs.push(['', e.t]);
      const a = (href, t, c = '') => href ? `<a class="${c}" href="${E(href)}" target="_blank" rel="noopener">${t}</a>` : '';
      return `${chrome(ctx, crumbs)}<div class="sp-item"><h1 class="sp-h1">${E(e.t)}</h1>
        <div class="sp-sub">${E(e.a)} ${e.y.map(E).join(', ')}${e.d ? ' &middot; ' + E(e.d) : ''}</div>
        <div class="sp-cols"><div class="sp-main"><div class="sp-shot">${h.media(e)}</div>
          ${e.desc ? `<h2 class="sp-h">Description</h2><div class="sp-desc">${e.desc}</div>` : ''}</div>
        <aside class="sp-side">${box('Download', `${h.file(e) ? a(h.file(e), 'Download', 'sp-dl big') : '<span class="sp-nofile">No file available</span>'}
          <table class="sp-spec">${h.details(e).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>
          <p class="sp-links">${a(h.page(e), 'Original page')} ${a(h.edit(e), 'Edit')} ${a(h.report(e), 'Report', 'rep')}</p>`)}</aside></div></div></div>`;
    },
  };
})();
