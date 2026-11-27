// label: deviantART 2005
(() => {
  const crumbs = (h, parts) => `<div class="da-crumbs">${parts.map(([t, u]) => u ? `<a href="${h.esc(u)}">${h.esc(t)}</a>` : `<b>${h.esc(t)}</b>`).join(' &gt; ')}</div>`;

  const header = ctx => {
    const { h, route } = ctx;
    return `<div class="da-top"><div class="da-topin">
      <a class="da-logo" href="${h.url.home()}">customization<span>museum</span></a>
      <nav class="da-nav"><a href="${h.url.home()}">browse</a><a href="${h.url.request()}" target="_blank" rel="noopener">submit</a><a href="${h.url.home()}">home</a></nav>
      <div class="da-search">${h.searchForm(route)}</div>
      <div class="da-theme">${h.themePicker()}</div>
    </div></div><div class="da-sub"><div class="da-subin">Customization Archive &middot; skins, themes, emoticons</div></div>${h.warning()}`;
  };

  const box = (title, body) => `<div class="da-box"><h3>${title}</h3><div class="da-boxb">${body}</div></div>`;

  const side = (ctx, apps, types, tags, cur = {}) => {
    const { h, route: r } = ctx;
    const mk = (list, on, url) => list.map(([k, label, n]) => `<li${k === on ? ' class="on"' : ''}><a href="${h.esc(url(k))}">${h.esc(label)}</a> <i>${n}</i></li>`).join('');
    return `<aside class="da-side">
      ${box('Browse', `<ul class="da-tree"><li class="root"><a href="${h.url.home()}">Customization</a>
        <ul><li class="root">Programs<ul>${mk(apps, cur.app, k => h.url.app(k))}</ul></li>
        <li class="root">Types<ul>${mk(types, cur.type, k => h.url.type(k))}</ul></li></ul></li></ul>`)}
      ${tags && tags.length ? box('Tags', `<div class="da-tags">${tags.map(([t, n]) => `<a${r.tag === t ? ' class="on"' : ''} href="${h.esc(h.link(r, { tag: r.tag === t ? '' : t }))}">${h.esc(t)}</a>`).join(' ')}</div>`) : ''}
    </aside>`;
  };

  const card = (h, e) => `<div class="da-dev">
    <a class="da-th" href="${h.url.item(e)}">${h.img(e)}</a>
    <div class="da-t"><a href="${h.url.item(e)}">${h.esc(e.t)}</a></div>
    <div class="da-by">by <a href="${h.url.app(e.k)}">${h.esc(e.a)}</a>${e.d ? ` <span>${h.esc(e.d)}</span>` : ''}</div>
    <div class="da-lk">${h.file(e) ? `<a href="${h.esc(h.file(e))}" target="_blank" rel="noopener">file</a> | ` : ''}<a href="${h.esc(h.report(e))}" target="_blank" rel="noopener">report</a></div>
  </div>`;

  const pager = (h, r, l) => {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return `<div class="da-pager">${p.prev ? `<a href="${p.prev}">&laquo; Prev</a>` : ''}${p.items.map(i => i.gap ? '<span>...</span>' : i.current ? `<b>${i.n}</b>` : `<a href="${i.url}">${i.n}</a>`).join('')}${p.next ? `<a href="${p.next}">Next &raquo;</a>` : ''}</div>`;
  };

  const page = (ctx, inner) => `${header(ctx)}<div class="da-page">${inner}</div><div class="da-foot">Customization Museum &middot; an archive of old skins, themes and emoticons</div>`;

  THEMES.deviantart = {
    label: 'deviantART 2005',
    home(ctx) {
      const { h, manifest: m } = ctx;
      const apps = m.apps.map(a => [a.slug, a.name, a.count]);
      const types = Object.entries(m.types).map(([t, n]) => [t, t, n]);
      const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
      return page(ctx, `${side(ctx, apps, types, null)}<div class="da-main">
        ${crumbs(h, [['Customization']])}
        <div class="da-tab">Welcome</div>
        <div class="da-panel"><p><b>${m.total.toLocaleString()}</b> deviations from <b>${m.apps.length}</b> programs, <b>${m.archived.toLocaleString()}</b> archived.</p></div>
        <div class="da-tab">Programs</div>
        <div class="da-panel da-cols">${m.apps.map(a => `<div class="da-app"><a href="${h.url.app(a.slug)}">${h.esc(a.name)}</a> <i>${a.count.toLocaleString()}</i><br><small>${Object.entries(a.types).slice(0, 3).map(([t, n]) => `${h.esc(t)} (${n})`).join(', ')}</small></div>`).join('')}</div>
        <div class="da-tab">Sources</div>
        <div class="da-panel da-cols">${sites.map(([s, i]) => `<div class="da-app"><a href="${h.url.site(s)}">${h.esc(i.name)}</a> <i>${i.count}</i></div>`).join('')}</div>
      </div>`);
    },
    list(ctx) {
      const { h, route: r, list: l, about } = ctx;
      const f = l.facets;
      const path = [['Customization', h.url.home()]];
      if (r.app) path.push([h.appName(r.app), l.typeName ? h.url.app(r.app) : '']);
      if (l.typeName) path.push([l.typeName, '']);
      if (!r.app && !l.typeName) path.push([r.site ? h.siteName(r.site) : r.tag || (r.q ? `Search: ${r.q}` : 'All'), '']);
      path[path.length - 1][1] = '';
      return page(ctx, `${side(ctx, f.apps, f.types.map(([t, n]) => [t, t, n]), f.tags, { app: r.app, type: l.typeName })}<div class="da-main">
        ${crumbs(h, path)}
        ${about ? `<div class="da-panel da-about"><div class="da-tools"><a href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a> | <a href="${h.esc(h.link(r, { site: '' }))}">Close</a></div>${about.html}</div>` : ''}
        <div class="da-tab">Deviations <span>${l.total.toLocaleString()} found</span></div>
        <div class="da-ctl"><label>Sort ${h.sortSelect(r)}</label><label>Archived ${h.archSelect(r)}</label></div>
        <div class="da-panel">${l.rows.length ? `<div class="da-grid">${l.rows.map(e => card(h, e)).join('')}</div>` : '<p class="da-empty">No deviations found.</p>'}${pager(h, r, l)}</div>
      </div>`);
    },
    item(ctx) {
      const { h, item: e } = ctx;
      if (!e) return page(ctx, `<div class="da-main full"><div class="da-panel"><p>Deviation not found. <a href="${h.url.home()}">Back to the museum</a></p></div></div>`);
      const a = (href, text) => href ? `<a href="${h.esc(href)}" target="_blank" rel="noopener">${text}</a>` : '';
      const acts = [a(h.file(e), 'Download'), a(h.page(e), 'Original page'), a(h.edit(e), 'Edit'), a(h.report(e), 'Report')].filter(Boolean).join(' | ');
      return page(ctx, `<div class="da-main full">
        ${crumbs(h, [['Customization', h.url.home()], [e.a, h.url.app(e.k)], [e.t, '']])}
        <div class="da-dv">
          <div class="da-dvmain">
            <div class="da-tab">${h.esc(e.t)} <span>by ${h.esc(e.a)}</span></div>
            <div class="da-panel da-big">${h.media(e)}</div>
            ${e.desc ? `<div class="da-tab">Artist's Comments</div><div class="da-panel da-desc">${e.desc}</div>` : ''}
          </div>
          <div class="da-dvside">
            ${box('Deviation Info', `<dl>${h.details(e).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`)}
            ${box('Tools', `<div class="da-acts">${acts}</div>`)}
          </div>
        </div></div>`);
    },
  };
})();
