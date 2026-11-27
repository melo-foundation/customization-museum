// label: Messenger Plus! Gallery
(() => {
  const mark = `<svg class="mp-mark" viewBox="0 0 60 58"><defs><linearGradient id="mpg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4fb3ee"/><stop offset="1" stop-color="#1a6fb5"/></linearGradient><linearGradient id="mpg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#e8641b"/></linearGradient></defs><path d="M2 8C14 0 30 4 38 20L22 34C10 30 3 20 2 8Z" fill="url(#mpg1)"/><path d="M26 4C40 6 54 20 50 40L36 52 28 30Z" fill="url(#mpg2)"/><path d="M12 34 28 24l8 14-12 14z" fill="#8bc34a" opacity=".9"/><rect x="26" y="8" width="9" height="30" rx="4" transform="rotate(28 30 22)" fill="#e9e9e9" stroke="#777"/></svg>`;
  const T = (h, e) => h.esc(e);

  const nav = (ctx) => {
    const { h, route: r } = ctx, s = r.sort || '';
    const listing = !!ctx.list;
    const on = k => k === (!listing ? 'home' : s === 'old' ? 'old' : s === 'az' ? 'az' : 'new');
    const li = (k, label, href) => `<li${on(k) ? ' class="on"' : ''}><a href="${href}">${label}</a></li>`;
    return `<ul class="mp-nav">${li('home', 'home', h.url.home())}${li('new', 'newest', h.link(r, { sort: '', item: '' }))}${li('old', 'oldest', h.link(r, { sort: 'old', item: '' }))}${li('az', 'a-z', h.link(r, { sort: 'az', item: '' }))}<li><a href="${h.url.request()}" target="_blank" rel="noopener">request</a></li></ul>`;
  };

  const shell = (ctx, o) => {
    const { h, route: r } = ctx;
    const btn = (cls, a, b, href, on) => `<a class="${on ? 'on' : ''}" href="${href}"><i></i>${a}<br>${b}</a>`;
    const s = r.sort || '', lst = !!ctx.list;
    const btns = `<div class="mp-btns">${btn('', 'browse by', 'date', h.link(r, { sort: '', item: '', page: 1 }), lst && s === '')}${btn('', 'browse by', 'age', h.link(r, { sort: 'old', item: '', page: 1 }), lst && s === 'old')}${btn('', 'browse by', 'name', h.link(r, { sort: 'az', item: '', page: 1 }), lst && s === 'az')}${btn('', 'browse by', 'category', h.url.home(), !lst && !ctx.item)}</div>`;
    const bc = (o.bc || []).map(([t, u]) => ` &raquo; ${u ? `<a href="${u}">${h.esc(t)}</a>` : h.esc(t)}`).join('');
    const sideBoxes = o.side || '';
    return `<div class="mp-c"><div class="mp-wrap">
      <div class="mp-hd"><a class="mp-logo" href="${h.url.home()}">${mark}<span class="mp-t">Customization <b>Museum</b></span><span class="mp-s">old skins, themes &amp; emoticons</span></a>${nav(ctx)}</div>
      <div class="mp-band"><div class="mp-lang"><label>Theme:&nbsp;</label>${h.themePicker()}</div><h2>${h.esc(o.title)}</h2><h3>${h.esc(o.sub)}</h3><div class="mp-bbox">${o.box || ''}</div></div>
      <div class="mp-content"><div class="mp-left">${h.warning()}${o.home ? '' : btns + `<h4 class="mp-bc">${bc}</h4>`}${o.body}</div>
      <div class="mp-right">${h.searchForm(r).replace('</form>', '<button type="submit">Search</button></form>')}<p class="mp-rss"><i></i>${(o.total || 0).toLocaleString()} items</p>${sideBoxes}</div></div></div>
      <div class="mp-ft"><div class="gf">archived<small>unofficial &middot; non-commercial</small></div><p>Customization Museum &copy; unofficial archive of user-made skins and themes<br><small>Program names and marks belong to their owners.<br>Files are archived as found and are not checked.<br>Report a bad entry with the Report link on its page.</small></p>
      <p class="side"><small><a href="${h.url.request()}" target="_blank" rel="noopener">request an item</a></small></p>
      <p class="links"><a href="${h.url.home()}">home </a>|<a href="${h.link(r, { sort: '', item: '' })}"> newest </a>|<a href="${h.link(r, { sort: 'old', item: '' })}"> oldest </a>|<a href="${h.link(r, { sort: 'az', item: '' })}"> a-z </a>|<a href="${h.url.request()}" target="_blank" rel="noopener"> request</a></p></div></div>`;
  };

  const box = (title, items, cls = '') => `<div class="mp-box ${cls}"><h5>${title}</h5><ul>${items}</ul></div>`;
  const bl = (href, label, sub, on) => `<li${on ? ' class="on"' : ''}><a href="${href}">${label}${sub ? `<span>${sub}</span>` : ''}</a></li>`;

  const row = (h, e, i) => {
    const f = h.file(e), u = h.url.item(e);
    const fld = (k, v) => v ? `<div><i>${k}:</i> <span class="mp-v">${v}</span></div>` : '';
    return `<div class="mp-row${i % 2 ? ' alt' : ''}" onclick="if(!event.target.closest('a'))location.href='${u}'">
      <div class="mp-th">${h.img(e) || '<span class="mp-np">no preview</span>'}<br><a href="${u}"><strong>full screenshot</strong></a></div>
      <div class="mp-info"><div><a href="${u}"><b>${h.esc(e.t)}</b></a></div>
      ${fld('Program', `<a href="${h.url.app(e.k)}">${h.esc(e.a)}</a>`)}${fld('Added', h.esc(e.d))}${fld('Type', e.y.map(t => `<a href="${h.url.type(t)}">${h.esc(t)}</a>`).join(', '))}${fld('Tags', h.esc(e.g.slice(0, 5).join(', ')))}${fld('Source', `<a href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a>`)}${fld('Archived', h.esc(h.archivedLabel(e)))}</div></div>`;
  };

  const pager = (h, r, l) => {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return `<div class="mp-pg">${p.prev ? `<a href="${p.prev}">&lt;&lt; Prev Page</a> ` : ''}${p.items.map(i => i.gap ? '<span>...</span>' : i.current ? `<a href="${h.esc(i.url || '#')}">[ ${i.n} ]</a>` : `<a href="${i.url}">${i.n}</a>`).join(' ')}${p.next ? ` <a href="${p.next}">Next Page &gt;&gt;</a>` : ''}</div>`;
  };

  const sideNav = (ctx, extra = '') => {
    const { h, route: r } = ctx;
    return box('browsing links', bl(h.url.home(), 'Home', 'All programs and types') + bl(h.link({ ...r, app: '', type: '', site: '', tag: '', q: '' }, { sort: '' }), 'Newest', '') + bl(h.link({ ...r, app: '', type: '', site: '', tag: '', q: '' }, { sort: 'old' }), 'Oldest', '') + bl(h.link({ ...r, app: '', type: '', site: '', tag: '', q: '' }, { sort: 'az' }), 'A to Z', '')) + extra;
  };

  THEMES.msgplus = {
    label: 'Messenger Plus! Gallery',
    home(ctx) {
      const { h, manifest: m } = ctx;
      const r = ctx.route;
      const all = { ...r, app: '', type: '', site: '', tag: '', q: '' };
      const snaps = [['Newest Items', h.link(all, { sort: '' })], ['Oldest Items', h.link(all, { sort: 'old' })], ['A to Z', h.link(all, { sort: 'az' })], ['Archived Only', h.link(all, { arch: '1' })]].map(([t, u]) => `<li><a href="${u}">${t}</a></li>`).join('');
      const types = Object.entries(m.types).slice(0, 9).map(([t]) => `<li><a href="${h.url.type(t)}">${h.esc(t)}</a></li>`).join('');
      const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).slice(0, 3).map(([s, i]) => `<li><a href="${h.url.site(s)}">${h.esc(i.name)}</a></li>`).join('');
      const panel = (title, list, more, moreUrl) => `<h3>${title}</h3><div class="mp-feat"><ul>${list.map(a => `<li><a href="${h.url.app(a.slug)}"><b>${h.esc(a.name)}</b></a> <i>Items:</i> ${a.count.toLocaleString()} <i>Types:</i> ${h.esc(Object.keys(a.types).slice(0, 2).join(', '))}</li>`).join('')}</ul><a class="more" href="${moreUrl}">${more} &gt;</a></div>`;
      const apps = m.apps;
      const body = `<div class="mp-hl mp-top"><b>Note:</b> ${m.total.toLocaleString()} items from ${m.apps.length} programs, ${m.archived.toLocaleString()} archived. Files are not checked.</div>
        <div class="mp-intro">${mark.replace('class="mp-mark"', 'class="mp-bigmark"')}<h3>What is this?</h3><p>An index of old skins, themes, emoticons and other customization files for messengers, media players and desktops. Each entry links to its original page and to an archived copy when one exists. Browse by program, type or source, or search for a name.</p></div>
        <h2>Browse the Museum</h2><p>View and download items made by users over the years.</p>
        <div class="mp-two"><div class="a"><h3>Snapshots</h3><div class="mp-fb"><ul>${snaps}</ul></div><h3>Categories</h3><div class="mp-fb"><ul>${types}</ul></div>
          <h3>External Resources</h3><p class="mp-ext">Items come from these sites:</p><ul class="mp-dots">${sites}</ul></div>
        <div class="b">${panel('Largest Collections', apps.slice(0, 4), 'More Programs', h.link(all, { sort: '' }))}${panel('Also Collected', apps.slice(4, 8), 'More Programs', h.link(all, { sort: '' }))}${panel('Smaller Collections', apps.slice(8, 12), 'All Items', h.link(all, { sort: 'az' }))}</div></div>
        <span class="mp-big">Missing something? How can I add it?</span><p>Use <a href="${h.url.request()}" target="_blank" rel="noopener">Request</a> to suggest a page, a file or a whole site, and it will be archived and indexed.</p>`;
      return shell(ctx, { home: true, title: 'Customization Museum', sub: 'Old skins, themes and emoticons', total: m.total, bc: [[ 'Customization Museum', '']], body, box: `<b>${m.total.toLocaleString()}</b> items in the archive`, side: sideNav(ctx) });
    },
    list(ctx) {
      const { h, route: r, list: l, about } = ctx, f = l.facets;
      const sname = (r.sort === 'old' ? 'Browse by Age' : r.sort === 'az' ? 'Browse by Name' : 'Browse by Date');
      const bc = [['Customization Museum', h.url.home()]];
      if (r.app) bc.push([h.appName(r.app), h.url.app(r.app)]);
      if (l.typeName) bc.push([l.typeName, '']);
      if (r.q) bc.push(['Search: ' + r.q, '']);
      bc.push([sname, '']);
      const sel = '';
      const li = (href, label, n, on) => `<li${on ? ' class="on"' : ''}><a href="${href}">${h.esc(label)}<span>${n}</span></a></li>`;
      const side = sideNav(ctx)
        + box('programs', f.apps.slice(0, 12).map(([k, n, c]) => li(h.link(r, { app: k === r.app ? '' : k, type: '', tag: '' }), n, c, k === r.app)).join(''), 'sc')
        + box('types', f.types.slice(0, 14).map(([t, n]) => li(h.link(r, { type: r.type && h.slug(r.type) === h.slug(t) ? '' : t, tag: '' }), t, n, t === l.typeName)).join(''), 'sc')
        + (f.tags.length ? box('tags', f.tags.slice(0, 12).map(([t, n]) => li(h.link(r, { tag: r.tag === t ? '' : t }), t, n, r.tag === t)).join(''), 'sc') : '');
      const body = `${about ? `<div class="mp-about"><div class="mp-tools"><a href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a><a href="${h.link(r, { site: '' })}">Close</a></div>${about.html}</div>` : ''}
        ${sel}${pager(h, r, l)}<div class="mp-sec"></div>
        ${l.rows.length ? l.rows.map((e, i) => row(h, e, i)).join('') : '<p class="mp-empty">No results</p>'}
        <div class="mp-sec"></div>${pager(h, r, l)}`;
      return shell(ctx, { title: r.app ? h.appName(r.app) : 'Customization Museum', sub: `${l.total.toLocaleString()} items`, total: l.total, bc, body, side, box: `<span>${l.total.toLocaleString()} items, page <b>${r.page}</b> of <b>${l.pages}</b></span><span>${h.sortSelect(r)} ${h.archSelect(r)}</span>` });
    },
    item(ctx) {
      const { h, item: e, route: r } = ctx;
      if (!e) return shell(ctx, { title: 'Customization Museum', sub: 'Item not found', bc: [['Customization Museum', h.url.home()]], body: `<p class="mp-empty">Item not found. <a href="${h.url.home()}">Back to the museum</a></p>`, side: sideNav(ctx) });
      const a = (href, text) => href ? `<a href="${h.esc(href)}" target="_blank" rel="noopener">${text}</a>` : '';
      const file = h.file(e);
      const dl = file ? `<a class="mp-dl" href="${h.esc(file)}" target="_blank" rel="noopener">download</a>` : '';
      const rows = h.details(e);
      const top = rows.slice(0, 3), rest = rows.slice(3);
      const trs = top.map(([k, v], i) => `<tr><td class="k">${k}:</td><td class="v">${v}</td>${i === 0 ? `<td class="d" rowspan="${top.length}">${dl}</td>` : ''}</tr>`).join('')
        + rest.map(([k, v]) => `<tr><td class="k">${k}:</td><td class="v" colspan="2">${v}</td></tr>`).join('');
      const links = `<div class="mp-lk">${a(h.page(e), 'Original page')} ${h.page(e) ? '|' : ''} ${a(h.edit(e), 'Edit')} | ${a(h.report(e), 'Report')}</div>`;
      const body = `<table class="mp-view"><tr><th colspan="3">${h.esc(e.t)} <small>${h.esc(e.a)}</small></th></tr>${trs}
        <tr><td class="mp-shot" colspan="3"><div class="in">${h.media(e)}</div>${e.desc ? `<div class="mp-desc">${e.desc}</div>` : ''}${links}</td></tr></table>
        <div class="mp-dlb">${dl}</div>`;
      const side = sideNav(ctx, box('more', bl(h.url.app(e.k), `More ${h.esc(e.a)}`, '') + e.y.map(t => bl(h.url.type(t), `More ${h.esc(t)}`, '')).join('') + bl(h.url.site(e.s), h.esc(h.siteName(e.s)), '')));
      return shell(ctx, { title: 'Customization Museum', sub: h.esc(e.a), total: ctx.manifest ? ctx.manifest.total : 0, bc: [['Customization Museum', h.url.home()], [e.a, h.url.app(e.k)], [e.t, '']], body, side, box: `<b>${h.esc(e.t)}</b>` });
    },
  };
})();
