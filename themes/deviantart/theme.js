// label: deviantART 2005
(() => {
  const head = (t, extra = '') => `<div class="da-sh"><span>${t}</span>${extra ? `<em>${extra}</em>` : ''}</div>`;
  const crumbs = (h, parts) => parts.map(([t, u]) => u ? `<a href="${h.esc(u)}">${h.esc(t)}</a>` : h.esc(t)).join(' &gt; ');

  const header = ctx => {
    const { h, route } = ctx;
    const nav = (href, label, ico, ext) => `<a href="${h.esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}><i class="${ico}"></i>${label}</a>`;
    return `<div class="da-head"><a class="da-logo" href="${h.url.home()}">Customization<b>Museum</b></a><div class="da-search">${h.searchForm(route)}</div></div>
    <div class="da-bar"><span>${h.themePicker()}</span><span class="r"><a href="${h.url.request()}" target="_blank" rel="noopener">Request</a> | <a href="${h.url.home()}">Home</a></span></div>
    <div class="da-nav">${nav(h.url.home(), 'Browse', 'i1')}${nav(h.url.request(), 'Request', 'i2', 1)}<span class="sep"></span>${nav(h.url.home(), 'Programs', 'i3')}${nav(h.link(route, { app: '', type: '', tag: '', site: '', q: '', page: 1 }) , 'All items', 'i4')}</div>
    <div class="da-wrapw">${h.warning()}</div>`;
  };

  const tree = (ctx, apps, types, cur = {}) => {
    const { h } = ctx;
    const mk = (list, on, url) => list.map(([k, label, n]) => `<li${k === on ? ' class="on"' : ''}><a href="${h.esc(url(k))}">${h.esc(label)}</a> <i>${n}</i></li>`).join('');
    return `<ul class="da-tree"><li class="r"><a href="${h.url.home()}">Customization</a><ul>
      <li class="r">Skins &amp; Themes &ndash; Programs<ul>${mk(apps, cur.app, k => h.url.app(k))}</ul></li>
      <li class="r">Types<ul>${mk(types, cur.type, k => h.url.type(k))}</ul></li></ul></li></ul>`;
  };

  const side = (ctx, apps, types, tags, cur, sites) => {
    const { h, route: r } = ctx;
    return `<div class="da-side">
      ${head('Browse')}<div class="da-sb">${tree(ctx, apps, types, cur)}</div>
      ${tags && tags.length ? `${head('Tags')}<div class="da-sb da-tags">${tags.map(([t]) => `<a${r.tag === t ? ' class="on"' : ''} href="${h.esc(h.link(r, { tag: r.tag === t ? '' : t }))}">${h.esc(t)}</a>`).join(', ')}</div>` : ''}
      ${sites && sites.length ? `${head('Sources')}<div class="da-sb">${sites.map(([s, i]) => `<div><a href="${h.url.site(s)}">${h.esc(i.name)}</a> <i>${i.count}</i></div>`).join('')}</div>` : ''}
    </div>`;
  };

  const card = (h, e) => `<div class="da-dev">
    <a class="da-th" href="${h.url.item(e)}">${h.img(e)}</a>
    <div class="da-t"><a href="${h.url.item(e)}">${h.esc(e.t)}</a></div>
    <div class="da-by">by <a href="${h.url.app(e.k)}">${h.esc(e.a)}</a></div>
    <div class="da-in">in ${e.y.map(t => `<a href="${h.url.type(t)}">${h.esc(t)}</a>`).join(', ')}${e.d ? ` &middot; ${h.esc(e.d)}` : ''}</div>
    <div class="da-lk">${h.file(e) ? `<a href="${h.esc(h.file(e))}" target="_blank" rel="noopener">Download</a> | ` : ''}<a href="${h.esc(h.report(e))}" target="_blank" rel="noopener">Report</a></div>
  </div>`;

  const pager = (h, r, l) => {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return `<div class="da-pager"><span class="pv">${p.prev ? `<a href="${p.prev}">Previous Page</a>` : 'Previous Page'}</span><span class="nums">${p.items.map(i => i.gap ? '<u>...</u>' : i.current ? `<b>${i.n}</b>` : `<a href="${i.url}">${i.n}</a>`).join('')}</span><span class="nx">${p.next ? `<a href="${p.next}">Next Page</a>` : 'Next Page'}</span></div>`;
  };

  const page = (ctx, main, sidebar) => `${header(ctx)}<div class="da-body"><div class="da-main">${main}</div>${sidebar}</div>
    <div class="da-foot"><a href="${ctx.h.url.home()}">Customization Museum</a> | <a href="${ctx.h.url.request()}" target="_blank" rel="noopener">Request</a><br>Old skins, themes and emoticons, indexed.</div>`;

  THEMES.deviantart = {
    label: 'deviantART 2005',
    home(ctx) {
      const { h, manifest: m } = ctx;
      const apps = m.apps.map(a => [a.slug, a.name, a.count]);
      const types = Object.entries(m.types).map(([t, n]) => [t, t, n]);
      const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
      const col = (title, items) => `<div class="da-dc"><h4>${title}</h4>${items}</div>`;
      const appBlk = m.apps.slice(0, 12).map(a => `<div class="da-di"><a href="${h.url.app(a.slug)}"><b>${h.esc(a.name)}</b></a><br><span>${Object.entries(a.types).slice(0, 3).map(([t, n]) => `${h.esc(t)}`).join(', ')}...</span></div>`).join('');
      const appBlk2 = m.apps.slice(12, 24).map(a => `<div class="da-di"><a href="${h.url.app(a.slug)}"><b>${h.esc(a.name)}</b></a><br><span>${Object.keys(a.types).slice(0, 3).map(t => h.esc(t)).join(', ')}...</span></div>`).join('');
      const typeBlk = Object.entries(m.types).slice(0, 12).map(([t, n]) => `<div class="da-di"><a href="${h.url.type(t)}"><b>${h.esc(t)}</b></a><br><span>${n.toLocaleString()} deviations</span></div>`).join('');
      return page(ctx, `
        <div class="da-tabs"><span class="on">Welcome</span><em>${m.total.toLocaleString()} deviations</em></div>
        <div class="da-blk">
          ${head('Browse Programs', 'Customization')}
          <div class="da-dir">${col('Programs', appBlk)}${col('More Programs', appBlk2)}${col('Types', typeBlk)}</div>
        </div>
        <div class="da-blk">${head('Sources')}
          <div class="da-src">${sites.map(([s, i]) => `<div><a href="${h.url.site(s)}">${h.esc(i.name)}</a> <i>${i.count.toLocaleString()}</i></div>`).join('')}</div>
        </div>
        <div class="da-blk da-love">${head('Archive')}<div class="da-lb">${m.total.toLocaleString()} items from ${m.apps.length} programs, ${m.archived.toLocaleString()} archived.</div></div>`,
        side(ctx, apps, types, null, {}, null));
    },
    list(ctx) {
      const { h, route: r, list: l, about } = ctx;
      const f = l.facets;
      const path = [['Customization', h.url.home()]];
      if (r.app) path.push([h.appName(r.app), l.typeName ? h.url.app(r.app) : '']);
      if (l.typeName) path.push([l.typeName, '']);
      if (!r.app && !l.typeName) path.push([r.site ? h.siteName(r.site) : r.tag || (r.q ? `Search: ${r.q}` : 'All'), '']);
      const title = path[path.length - 1][0];
      return page(ctx, `
        <div class="da-tabs"><span class="on">${h.esc(title)}</span><em>${l.total.toLocaleString()} deviations</em></div>
        <div class="da-crumb">${crumbs(h, path)}</div>
        ${about ? `<div class="da-blk da-about">${head('About', `<a href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a> | <a href="${h.esc(h.link(r, { site: '' }))}">Close</a>`)}<div class="da-lb">${about.html}</div></div>` : ''}
        <div class="da-blk">
          ${head('Deviations', `Sort ${h.sortSelect(r)} Archived ${h.archSelect(r)}`)}
          <div class="da-gridw">${l.rows.length ? `<div class="da-grid">${l.rows.map(e => card(h, e)).join('')}</div>` : '<p class="da-empty">No deviations found.</p>'}${pager(h, r, l)}</div>
        </div>`,
        side(ctx, f.apps, f.types.map(([t, n]) => [t, t, n]), f.tags, { app: r.app, type: l.typeName }, null));
    },
    item(ctx) {
      const { h, item: e } = ctx;
      if (!e) return page(ctx, `<div class="da-blk">${head('Not found')}<div class="da-lb">Deviation not found. <a href="${h.url.home()}">Back to the museum</a></div></div>`, '');
      const a = (href, text, ico) => href ? `<a href="${h.esc(href)}" target="_blank" rel="noopener"><i class="${ico}"></i>${text}</a>` : '';
      const m = ctx.manifest;
      const apps = m ? m.apps.map(x => [x.slug, x.name, x.count]) : [];
      const types = m ? Object.entries(m.types).map(([t, n]) => [t, t, n]) : [];
      return page(ctx, `
        <div class="da-blk da-ititle">${head(h.esc(e.t))}<div class="da-isub">A deviation by <a href="${h.url.app(e.k)}">${h.esc(e.a)}</a>${e.d ? ` (${h.esc(e.d)})` : ''}</div></div>
        <div class="da-blk da-view"><div class="da-big">${h.media(e)}</div>
          <div class="da-vf">${a(h.file(e), 'Download to Desktop', 'i5')}${a(h.page(e), 'Original page', 'i6')}${a(h.edit(e), 'Edit', 'i7')}${a(h.report(e), 'Report', 'i8')}</div></div>
        <div class="da-blk da-ititle">${head('Artist\'s Comments')}<div class="da-isub">${h.esc(e.a)}</div>
          <div class="da-cm"><div class="da-cmt">${e.desc || ''}</div>
          <div class="da-det"><b>Details:</b><dl>${h.details(e).map(([k, v]) => `<dt>${k}:</dt><dd>${v}</dd>`).join('')}</dl></div></div></div>`,
        side(ctx, apps, types, null, { app: e.k }, null));
    },
  };
})();
