// label: WinCustomize 2003
(() => {
  const top = (ctx) => {
    const { h, route } = ctx;
    return `<div class="wc-banner"><a class="wc-logo" href="${h.url.home()}"><b>Customization</b> Museum</a>
      <span class="wc-tag">Skins &middot; Themes &middot; Emoticons</span><span class="wc-pick">${h.themePicker()}</span></div>
      <div class="wc-nav"><a href="${h.url.home()}">Home</a><a href="${h.url.request()}" target="_blank" rel="noopener">Request</a>
      <span class="wc-search">${h.searchForm(route)}</span></div>${h.warning()}`;
  };
  const box = (title, body, cls = '') => `<div class="wc-box ${cls}"><div class="wc-bh">${title}</div><div class="wc-bb">${body}</div></div>`;
  const ul = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  const frame = (ctx, left, right, main) => `${top(ctx)}<div class="wc-page"><aside class="wc-l">${left}</aside><main class="wc-c">${main}</main>${right ? `<aside class="wc-r">${right}</aside>` : ''}</div>
    <div class="wc-foot">Customization Museum &middot; an archive of old skins, themes and emoticons</div>`;

  const sideHome = (ctx) => {
    const { h, manifest: m } = ctx;
    return [
      box('Programs', ul(m.apps.map(a => `<a href="${h.url.app(a.slug)}">${h.esc(a.name)}</a> <i>(${a.count.toLocaleString()})</i>`))),
      box('Categories', ul(Object.entries(m.types).map(([t, n]) => `<a href="${h.url.type(t)}">${h.esc(t)}</a> <i>(${n})</i>`))),
    ].join('');
  };
  const rightHome = (ctx) => {
    const { h, manifest: m } = ctx;
    const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
    return box('Top Sources', `<ol>${sites.slice(0, 15).map(([s, i]) => `<li><a href="${h.url.site(s)}">${h.esc(i.name)}</a> <i>${i.count}</i></li>`).join('')}</ol>`)
      + box('Stats', `<table class="wc-kv"><tr><td>Total items</td><td>${m.total.toLocaleString()}</td></tr><tr><td>Archived</td><td>${m.archived.toLocaleString()}</td></tr><tr><td>Programs</td><td>${m.apps.length}</td></tr><tr><td>Sources</td><td>${sites.length}</td></tr></table>`);
  };

  const pager = (h, r, l) => {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return `<div class="wc-pager">Page: ${p.prev ? `<a href="${p.prev}">&laquo; Prev</a>` : ''}${p.items.map(i => i.gap ? '<span>...</span>' : i.current ? `<b>${i.n}</b>` : `<a href="${i.url}">${i.n}</a>`).join('')}${p.next ? `<a href="${p.next}">Next &raquo;</a>` : ''}</div>`;
  };

  THEMES.wincustomize = {
    label: 'WinCustomize 2003',
    home(ctx) {
      const { h, manifest: m } = ctx;
      const apps = m.apps.map((a, n) => `<tr class="${n % 2 ? 'b' : 'a'}"><td class="n"><a href="${h.url.app(a.slug)}">${h.esc(a.name)}</a></td>
        <td>${Object.entries(a.types).slice(0, 4).map(([t, c]) => `${h.esc(t)} (${c})`).join(', ')}</td><td class="r">${a.count.toLocaleString()}</td></tr>`).join('');
      return frame(ctx, sideHome(ctx), rightHome(ctx), `${box('Welcome', `<p>Browse <b>${m.total.toLocaleString()}</b> skins, themes and emoticons for <b>${m.apps.length}</b> programs. <b>${m.archived.toLocaleString()}</b> items are archived.</p>`)}
        ${box('Browse by Program', `<table class="wc-t"><tr><th>Program</th><th>Contents</th><th class="r">Items</th></tr>${apps}</table>`)}`);
    },
    list(ctx) {
      const { h, route: r, list: l, about } = ctx;
      const f = l.facets;
      const rows = l.rows.map((e, n) => `<tr class="${n % 2 ? 'b' : 'a'}">
        <td class="th"><a href="${h.url.item(e)}">${h.img(e) || '<span class="np">n/a</span>'}</a></td>
        <td><a class="tt" href="${h.url.item(e)}">${h.esc(e.t)}</a></td>
        <td><a href="${h.url.app(e.k)}">${h.esc(e.a)}</a></td>
        <td>${(e.y || []).map(t => h.esc(t)).join(', ')}</td>
        <td>${h.esc(e.s ? h.siteName(e.s) : '')}</td>
        <td class="dt">${h.esc(e.d || '')}</td></tr>`).join('');
      const left = box('Programs', ul([`<a href="${h.link(r, { app: '', type: '', tag: '' })}">${!r.app ? '<b>All programs</b>' : 'All programs'}</a>`, ...f.apps.map(([k, label, n]) => `<a href="${h.link(r, { app: k, type: '', tag: '' })}">${k === r.app ? '<b>' + h.esc(label) + '</b>' : h.esc(label)}</a> <i>(${n})</i>`)]))
        + box('Categories', ul(f.types.map(([t, n]) => `<a href="${h.link(r, { type: r.type && h.slug(r.type) === h.slug(t) ? '' : t, tag: '' })}">${t === l.typeName ? '<b>' + h.esc(t) + '</b>' : h.esc(t)}</a> <i>(${n})</i>`)));
      const right = box('Top Skins', `<ol>${l.rows.slice(0, 10).map(e => `<li><a href="${h.url.item(e)}">${h.esc(e.t)}</a></li>`).join('')}</ol>`)
        + (f.tags.length ? box('Popular Tags', ul(f.tags.slice(0, 20).map(([t, n]) => `<a href="${h.link(r, { tag: r.tag === t ? '' : t })}">${r.tag === t ? '<b>' + h.esc(t) + '</b>' : h.esc(t)}</a> <i>(${n})</i>`))) : '');
      const title = l.typeName || (r.app ? h.appName(r.app) : r.site ? h.siteName(r.site) : r.tag || (r.q ? `Search: ${r.q}` : 'All items'));
      return frame(ctx, left, right, `${about ? box('About this site', `<div class="wc-tools"><a href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a> <a href="${h.link(r, { site: '' })}">Close</a></div><div class="wc-about">${about.html}</div>`) : ''}
        <div class="wc-box"><div class="wc-bh">${h.esc(title)} <span class="cnt">${l.total.toLocaleString()} items</span></div>
        <div class="wc-ctl">Sort: ${h.sortSelect(r)} ${h.archSelect(r)}</div>
        ${l.rows.length ? `<table class="wc-t"><tr><th>Preview</th><th>Title</th><th>Program</th><th>Type</th><th>Source</th><th>Date</th></tr>${rows}</table>` : '<p class="wc-empty">No results.</p>'}
        ${pager(h, r, l)}</div>`);
    },
    item(ctx) {
      const { h, item: e } = ctx;
      if (!e) return frame(ctx, '', '', box('Error', `Item not found. <a href="${h.url.home()}">Back to the museum</a>`));
      const a = (href, text, cls = '') => href ? `<a class="${cls}" href="${h.esc(href)}" target="_blank" rel="noopener">${text}</a>` : '';
      const left = box('Navigation', ul([`<a href="${h.url.app(e.k)}">More ${h.esc(e.a)}</a>`, ...(e.y || []).map(t => `<a href="${h.url.type(t)}">All ${h.esc(t)}</a>`), `<a href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a>`]));
      const right = box('Download', `<div class="wc-dl">${a(h.file(e), 'Download', 'wc-btn') || '<i>No file</i>'}${a(h.page(e), 'Original page', 'wc-btn2')}</div>`)
        + box('Options', ul([a(h.edit(e), 'Edit this entry'), a(h.report(e), 'Report a problem')]));
      return frame(ctx, left, right, `<div class="wc-box"><div class="wc-bh">${h.esc(e.t)}</div>
        <div class="wc-shot">${h.media(e)}</div></div>
        ${box('Details', `<table class="wc-kv">${h.details(e).map(([k, v], n) => `<tr class="${n % 2 ? 'b' : 'a'}"><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`)}
        ${e.desc ? box('Description', `<div class="wc-desc">${e.desc}</div>`) : ''}
        <div class="wc-links">${a(h.edit(e), 'Edit')} | ${a(h.report(e), 'Report')}</div>`);
    },
  };
})();
