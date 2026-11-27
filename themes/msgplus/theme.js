// label: Messenger Plus! Gallery
(() => {
  const tabs = (ctx) => {
    const { h, route: r } = ctx;
    const home = !r.app && !r.type && !r.site && !r.q && !r.item;
    const t = (label, href, on) => `<li${on ? ' class="on"' : ''}><a href="${href}">${label}</a></li>`;
    const listing = !!ctx.list;
    const s = r.sort || '';
    return `<ul class="mp-tabs">${t('Browse', h.url.home(), home && !ctx.item)}${t('By Date', h.link(r, { sort: '', item: '' }), listing && s === '')}${t('By Age', h.link(r, { sort: 'old', item: '' }), listing && s === 'old')}${t('A to Z', h.link(r, { sort: 'az', item: '' }), listing && s === 'az')}${t('Featured', h.url.site('wlm'), r.site === 'wlm')}</ul>`;
  };
  const header = (ctx) => {
    const { h, route } = ctx;
    return `<div class="mp-page"><div class="mp-header">
      <a class="mp-logo" href="${h.url.home()}"><span class="mp-orb"></span><b>Customization</b> Gallery<small>skins &amp; themes</small></a>
      <div class="mp-hr">${h.themePicker()}<a href="${h.url.request()}" target="_blank" rel="noopener">Request</a></div>
      ${tabs(ctx)}</div>${h.warning()}
      <div class="mp-search">${h.searchForm(route)}</div>`;
  };
  const foot = '<div class="mp-foot">Customization Museum &middot; unofficial archive</div></div>';
  const field = (k, v) => v ? `<div class="mp-f"><i>${k}:</i> ${v}</div>` : '';
  const row = (h, e) => {
    const f = h.file(e);
    return `<div class="mp-row" onclick="if(!event.target.closest('a'))location.href='${h.url.item(e)}'">
      <div class="mp-th"><a href="${h.url.item(e)}">${h.img(e) || '<span>No preview</span>'}</a></div>
      <div class="mp-info"><a class="mp-name" href="${h.url.item(e)}">${h.esc(e.t)}</a>
        ${field('Program', `<a href="${h.url.app(e.k)}">${h.esc(e.a)}</a>`)}${field('Added', h.esc(e.d))}${field('Type', e.y.map(t => `<a href="${h.url.type(t)}">${h.esc(t)}</a>`).join(', '))}${field('Tags', h.esc(e.g.slice(0, 6).join(', ')))}${field('Source', `<a href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a>`)}${field('Archived', h.esc(h.archivedLabel(e)))}
        <div class="mp-lk"><a href="${h.url.item(e)}">full screenshot</a>${f ? ` &middot; <a href="${h.esc(f)}" target="_blank" rel="noopener">download</a>` : ''} &middot; <a href="${h.esc(h.report(e))}" target="_blank" rel="noopener">report</a></div></div></div>`;
  };
  const pager = (h, r, l) => {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return `<div class="mp-pager">Page: ${p.prev ? `<a href="${p.prev}">&laquo; previous</a>` : ''}${p.items.map(i => i.gap ? '<span>&hellip;</span>' : i.current ? `<b>${i.n}</b>` : `<a href="${i.url}">${i.n}</a>`).join('')}${p.next ? `<a href="${p.next}">next &raquo;</a>` : ''}</div>`;
  };
  const side = (h, title, items) => `<div class="mp-box"><h3>${title}</h3><ul>${items}</ul></div>`;

  THEMES.msgplus = {
    label: 'Messenger Plus! Gallery',
    home(ctx) {
      const { h, manifest: m } = ctx;
      const apps = m.apps.map(a => `<li><a href="${h.url.app(a.slug)}">${h.esc(a.name)}</a> <span>${a.count.toLocaleString()}</span></li>`).join('');
      const types = Object.entries(m.types).map(([t, n]) => `<li><a href="${h.url.type(t)}">${h.esc(t)}</a> <span>${n}</span></li>`).join('');
      const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).map(([s, i]) => `<li><a href="${h.url.site(s)}">${h.esc(i.name)}</a> <span>${i.count}</span></li>`).join('');
      return `${header(ctx)}<div class="mp-body"><div class="mp-main">
        <div class="mp-sh">Browse the gallery</div>
        <p class="mp-lead">${m.total.toLocaleString()} items from ${m.apps.length} programs, ${m.archived.toLocaleString()} archived.</p>
        <div class="mp-sh">Programs</div><ul class="mp-cols">${apps}</ul></div>
        <div class="mp-side">${side(h, 'Categories', types)}${side(h, 'Sources', sites)}</div></div>${foot}`;
    },
    list(ctx) {
      const { h, route: r, list: l, about } = ctx, f = l.facets;
      const on = (c) => c ? ' class="on"' : '';
      const li = (href, label, n, c) => `<li${on(c)}><a href="${href}">${h.esc(label)}</a> <span>${n}</span></li>`;
      return `${header(ctx)}<div class="mp-body"><div class="mp-main">
        ${about ? `<div class="mp-about"><div class="mp-tools"><a href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a><a href="${h.link(r, { site: '' })}">Close</a></div>${about.html}</div>` : ''}
        <div class="mp-sh">${h.esc(l.typeName || (r.app ? h.appName(r.app) : r.q ? 'Search results' : 'All skins'))}</div>
        <div class="mp-ctl"><span>${l.total.toLocaleString()} items</span>${h.sortSelect(r)}${h.archSelect(r)}</div>
        ${l.rows.length ? l.rows.map(e => row(h, e)).join('') : '<p class="mp-empty">No results</p>'}
        ${pager(h, r, l)}</div>
        <div class="mp-side">
          ${side(h, 'Programs', `<li${on(!r.app)}><a href="${h.link(r, { app: '', type: '', tag: '' })}">All programs</a></li>` + f.apps.map(([k, n, c]) => li(h.link(r, { app: k, type: '', tag: '' }), n, c, k === r.app)).join(''))}
          ${side(h, 'Categories', f.types.map(([t, n]) => li(h.link(r, { type: r.type && h.slug(r.type) === h.slug(t) ? '' : t, tag: '' }), t, n, t === l.typeName)).join(''))}
          ${f.tags.length ? side(h, 'Tags', f.tags.map(([t, n]) => li(h.link(r, { tag: r.tag === t ? '' : t }), t, n, r.tag === t)).join('')) : ''}
        </div></div>${foot}`;
    },
    item(ctx) {
      const { h, item: e } = ctx;
      if (!e) return `${header(ctx)}<div class="mp-body"><div class="mp-main"><p class="mp-empty">Item not found. <a href="${h.url.home()}">Back to the gallery</a></p></div></div>${foot}`;
      const a = (href, text, cls = '') => href ? `<a class="mp-btn ${cls}" href="${h.esc(href)}" target="_blank" rel="noopener">${text}</a>` : '';
      return `${header(ctx)}<div class="mp-body"><div class="mp-main">
        <div class="mp-sh">${h.esc(e.t)}</div>
        <div class="mp-view"><div class="mp-shot">${h.media(e)}</div>
          <div class="mp-det"><dl>${h.details(e).map(([k, v]) => `<dt>${k}:</dt><dd>${v}</dd>`).join('')}</dl>
          <div class="mp-acts">${a(h.file(e), 'Download', 'dl')}${a(h.page(e), 'Original page')}${a(h.edit(e), 'Edit')}${a(h.report(e), 'Report')}</div></div></div>
        ${e.desc ? `<div class="mp-sh">Description</div><div class="mp-desc">${e.desc}</div>` : ''}
        </div><div class="mp-side">${side(h, 'More', `<li><a href="${h.url.app(e.k)}">More ${h.esc(e.a)}</a></li>${e.y.map(t => `<li><a href="${h.url.type(t)}">More ${h.esc(t)}</a></li>`).join('')}<li><a href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a></li>`)}</div></div>${foot}`;
    },
  };
})();
