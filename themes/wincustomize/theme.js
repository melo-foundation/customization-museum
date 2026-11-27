// label: WinCustomize 2003
(() => {
  const top = (ctx) => {
    const { h, route } = ctx;
    return `<div class="wc-banner"><a class="wc-logo" href="${h.url.home()}">Customization<br>Museum</a></div>
      <div class="wc-bar"><span class="wc-site"><b>Customization Museum</b> &nbsp; Skins, themes, emoticons</span><span class="wc-search">${h.searchForm(route)}</span></div>
      <div class="wc-links2"><a href="${h.url.home()}">Home</a> - <a href="${h.url.request()}" target="_blank" rel="noopener">Request</a> - <span class="wc-pick">${h.themePicker()}</span></div>${h.warning()}`;
  };
  const box = (title, body, cls = '') => `<div class="wc-box ${cls}"><div class="wc-bh">${title}</div><div class="wc-bb">${body}</div></div>`;
  const ul = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  const cnt = n => `<span class="c">[${n}]</span>`;
  const frame = (ctx, left, right, main) => `${top(ctx)}<div class="wc-page"><aside class="wc-l">${left}</aside><main class="wc-c">${main}</main>${right ? `<aside class="wc-r">${right}</aside>` : ''}</div>
    <div class="wc-foot"></div>`;

  const sideHome = (ctx) => {
    const { h, manifest: m } = ctx;
    return [
      box('Library', ul(m.apps.map(a => `<a href="${h.url.app(a.slug)}">${h.esc(a.name)}</a> ${cnt(a.count.toLocaleString())}`))),
      box('Types', ul(Object.entries(m.types).map(([t, n]) => `<a href="${h.url.type(t)}">${h.esc(t)}</a> ${cnt(n)}`))),
    ].join('');
  };
  const rightHome = (ctx) => {
    const { h, manifest: m } = ctx;
    const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
    return box('Top Sources', `<ol>${sites.slice(0, 15).map(([s, i]) => `<li><a href="${h.url.site(s)}">${h.esc(i.name)}</a> ${cnt(i.count)}</li>`).join('')}</ol>`)
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
      const f = m.apps[0];
      const news = m.apps.slice(0, 12).map(a => `<div class="wc-news"><div class="nt"><a href="${h.url.app(a.slug)}">${h.esc(a.name)}: ${a.count.toLocaleString()} items</a></div>
        <p>${Object.entries(a.types).slice(0, 5).map(([t, c]) => `<a href="${h.url.type(t)}">${h.esc(t)}</a> (${c})`).join('<br>')}</p>
        <div class="nf"><a href="${h.url.app(a.slug)}">[Browse ${h.esc(a.name)}]</a></div></div>`).join('');
      return frame(ctx, sideHome(ctx), rightHome(ctx), `${box('Featured Library', `<div class="wc-feat"><div class="ft">Library: <b><a href="${h.url.app(f.slug)}">${h.esc(f.name)}</a></b></div><div class="ft">Items: <b>${f.count.toLocaleString()}</b></div><div class="fb"><a href="${h.url.app(f.slug)}">[Browse]</a></div></div>`)}
        ${box('Museum Totals', `<div class="wc-feat"><div class="ft">${m.total.toLocaleString()} items in ${m.apps.length} programs, ${m.archived.toLocaleString()} archived.</div></div>`)}
        <div class="wc-box wc-newsbox"><div class="wc-bh">Museum Directory</div>${news}</div>`);
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
      const left = box('Library', ul([`<a href="${h.link(r, { app: '', type: '', tag: '' })}">${!r.app ? '<b>All programs</b>' : 'All programs'}</a>`, ...f.apps.map(([k, label, n]) => `<a href="${h.link(r, { app: k, type: '', tag: '' })}">${k === r.app ? '<b>' + h.esc(label) + '</b>' : h.esc(label)}</a> ${cnt(n)}`)]))
        + box('Types', ul(f.types.map(([t, n]) => `<a href="${h.link(r, { type: r.type && h.slug(r.type) === h.slug(t) ? '' : t, tag: '' })}">${t === l.typeName ? '<b>' + h.esc(t) + '</b>' : h.esc(t)}</a> ${cnt(n)}`)));
      const right = box('Top Skins', `<ol>${l.rows.slice(0, 10).map(e => `<li><a href="${h.url.item(e)}">${h.esc(e.t)}</a></li>`).join('')}</ol>`)
        + (f.tags.length ? box('Popular Tags', ul(f.tags.slice(0, 20).map(([t, n]) => `<a href="${h.link(r, { tag: r.tag === t ? '' : t })}">${r.tag === t ? '<b>' + h.esc(t) + '</b>' : h.esc(t)}</a> ${cnt(n)}`))) : '');
      const title = l.typeName || (r.app ? h.appName(r.app) : r.site ? h.siteName(r.site) : r.tag || (r.q ? `Search: ${r.q}` : 'All items'));
      return frame(ctx, left, right, `${about ? box('About this site', `<div class="wc-tools"><a href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a> <a href="${h.link(r, { site: '' })}">Close</a></div><div class="wc-about">${about.html}</div>`) : ''}
        <div class="wc-box"><div class="wc-bh">${h.esc(title)} - ${l.total.toLocaleString()} items</div>
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
      return frame(ctx, left, right, `<div class="wc-box"><div class="wc-bh">Skin Details</div>
        <div class="wc-shot">${h.media(e)}</div>
        <div class="wc-fi"><div class="wc-fib">Skin: <b>${h.esc(e.t)}</b><br>Program: <b>${h.esc(e.a)}</b><br>Source: <b>${h.esc(h.siteName(e.s))}</b></div>
        <div class="wc-dlbar">${a(h.file(e), '[Download]') || ''} ${a(h.page(e), '[Original page]')}</div></div></div>
        ${box('Details', `<table class="wc-kv">${h.details(e).map(([k, v], n) => `<tr class="${n % 2 ? 'b' : 'a'}"><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`)}
        ${e.desc ? box('Description', `<div class="wc-desc">${e.desc}</div>`) : ''}
        <div class="wc-links">${a(h.edit(e), 'Edit')} | ${a(h.report(e), 'Report')}</div>`);
    },
  };
})();
