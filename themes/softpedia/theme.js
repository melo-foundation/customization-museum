// label: Download Portal 2006
(() => {
  const CIRC = [['red', '#e8202a'], ['pink', '#e0407a'], ['orange', '#f07a14'], ['gold', '#e8b410'], ['green', '#4aa83a'], ['blue', '#2a92c8'], ['purple', '#6a4cc0']];
  const short = t => t.split(/[ &]/)[0].toUpperCase();

  const header = (ctx) => {
    const { h, manifest: m, route } = ctx, E = h.esc;
    const types = Object.entries(m.types).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const circ = [...types.map(([t]) => [short(t), h.url.type(t)]), ['ARCHIVED', h.link(route, { app: '', type: '', site: '', tag: '', q: '', arch: '1' })]];
    return `<div class="sp-head">
      <div class="sp-nav"><a href="${h.url.home()}">HOME</a><a href="${h.url.request()}" target="_blank" rel="noopener">SUBMIT ITEM</a><a href="${h.link(route, { app: '', type: '', site: '', tag: '', q: '', arch: '1' })}">ARCHIVE</a><a href="https://github.com/melo-foundation/customization-museum" target="_blank" rel="noopener">SOURCE</a><span>${h.themePicker()}</span></div>
      <a class="sp-logo" href="${h.url.home()}">CUSTOMIZATION MUSEUM<sup>&trade;</sup></a>
      <div class="sp-upd">${m.total.toLocaleString()} files online</div>
      <div class="sp-wave"></div>
      <div class="sp-circs">${circ.map(([l, u], i) => `<a class="sp-c c${i}" href="${u}" style="--c:${CIRC[i][1]}"><span>${E(l)}</span></a>`).join('')}</div>
      <div class="sp-sbox"><label>Search:</label>${h.searchForm(route, '')}</div>
    </div>${h.warning()}`;
  };

  const sidebar = (ctx, cats, best, extra = '') => {
    const { h } = ctx;
    const ul = a => `<ul>${a.map(([u, t]) => `<li><a href="${u}">${h.esc(t)}</a></li>`).join('')}</ul>`;
    return `<aside class="sp-right">
      <div class="sp-rt">Welcome!</div><div class="sp-rb">Hello, visitor.<br><br><a href="${h.url.request()}" target="_blank" rel="noopener">Submit</a> a file.</div>
      ${extra}
      <div class="sp-rt">Main categories:</div><div class="sp-rb">${ul(cats)}</div>
      <div class="sp-rt">Week's best:</div><div class="sp-rb">${ul(best)}</div></aside>`;
  };
  const homeSide = ctx => {
    const { h, manifest: m } = ctx;
    return sidebar(ctx, [...m.apps].sort((a, b) => b.count - a.count).slice(0, 18).map(a => [h.url.app(a.slug), a.name]),
      Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).slice(0, 14).map(([s, i]) => [h.url.site(s), i.name]));
  };

  const fmtDate = d => { if (!d) return ''; const [y, mo, da] = d.split('-'); const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; return M[+mo - 1] ? `${M[+mo - 1]} ${da ? +da + ', ' : ''}${y}` : d; };

  const subband = (ctx, title, links) => `<div class="sp-sub"><div class="sp-st">${ctx.h.esc(title)}</div>
    <div class="sp-onpage">On this page</div><div class="sp-sl">${links.map(([u, t]) => `<a href="${u}">${ctx.h.esc(t)}</a>`).join('')}</div></div>`;

  const row = (h, e) => `<div class="sp-row">
    <a class="sp-ic" href="${h.url.item(e)}"><b>${h.esc((e.t || '?')[0].toUpperCase())}</b>${h.img(e)}</a>
    <div class="sp-ri"><a class="sp-rt1" href="${h.url.item(e)}">${h.esc(e.t)}</a>
      <div class="sp-d1">${h.esc(e.a)} ${e.y.map(h.esc).join(', ')}${e.g.length ? ' - ' + e.g.slice(0, 5).map(h.esc).join(', ') : ''}</div>
      <div class="sp-d2">${e.y.map(h.esc).join(', ')} | ${h.esc(h.siteName(e.s))} | Archived: ${h.esc(h.archivedLabel(e))}</div></div>
    <div class="sp-rr"><div>${h.file(e) ? `<a href="${h.esc(h.file(e))}" target="_blank" rel="noopener">download</a> | ` : ''}<a href="${h.url.item(e)}">details</a></div><div class="sp-dt">${h.esc(fmtDate(e.d))}</div></div></div>`;

  const pagerLinks = (h, r, l) => {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return `${p.prev ? `<a href="${p.prev}">&laquo;</a> ` : ''}${p.items.map(i => i.gap ? '... ' : i.current ? `<b>${i.n}</b> ` : `<a href="${i.url}">${i.n}</a> `).join('')}${p.next ? `<a href="${p.next}">&raquo;</a>` : ''}`;
  };

  THEMES.softpedia = {
    label: 'Download Portal 2006',
    home(ctx) {
      const { h, manifest: m } = ctx, E = h.esc;
      const types = Object.entries(m.types).sort((a, b) => b[1] - a[1]);
      const boxes = types.slice(0, 6).map(([t, n], i) => {
        const apps = m.apps.filter(a => a.types[t]).sort((a, b) => b.types[t] - a.types[t]).slice(0, 10);
        return `<div class="sp-box b${i}"><div class="sp-bh"><a href="${h.url.type(t)}">${E(t)}</a></div><div class="sp-bs">${n.toLocaleString()} files</div>
          <div class="sp-bb">${apps.map(a => `<div class="sp-bi"><a href="${h.link({}, { app: a.slug, type: t })}">${E(a.name)}</a> <span>| ${E(t)} - ${a.types[t].toLocaleString()} files</span></div>`).join('')}</div></div>`;
      });
      const srcs = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).slice(0, 8);
      return `${header(ctx)}<div class="sp-body"><div class="sp-bg">
        <div class="sp-center"><div class="sp-welcome"><h1>Dear visitor, welcome to the archive of customization downloads!</h1>
          <div class="sp-stat">${m.total.toLocaleString()} Items / ${m.archived.toLocaleString()} Archived</div></div>
        <div class="sp-lk"><div class="sp-onpage">On this page</div><div class="sp-lc">
          <a href="${h.url.app(m.apps[0].slug)}">Biggest Program</a><a href="${h.url.type(types[0][0])}">Skins and Themes</a><a href="${h.link({}, { arch: '1' })}">Archived Files</a>
          <a href="${h.url.type('Emoticons')}">Emoticon Packs</a><a href="${h.url.site(srcs[0][0])}">Top Source</a><a href="${h.url.request()}" target="_blank" rel="noopener">Submit a File</a>
          <a href="${h.url.type('Icons')}">Icon Sets</a><a href="${h.url.type('Sounds')}">Sounds</a><a href="${h.link({}, { sort: 'old' })}">Oldest Files</a></div></div>
        <div class="sp-boxes"><div class="sp-bcol">${boxes.filter((_, i) => i % 2 === 0).join('')}</div><div class="sp-bcol">${boxes.filter((_, i) => i % 2).join('')}</div></div>
        <div class="sp-box b6 wide"><div class="sp-bh"><a href="${h.url.home()}">Programs</a></div><div class="sp-bs">${m.apps.length} programs</div><div class="sp-bb sp-cols2">${[...m.apps].sort((a, b) => b.count - a.count).map(a => `<div class="sp-bi"><a href="${h.url.app(a.slug)}">${E(a.name)}</a> <span>| ${a.count.toLocaleString()} files</span></div>`).join('')}</div></div>
        </div>${homeSide(ctx)}</div></div>${footer(h)}`;
    },
    list(ctx) {
      const { h, route: r, list: l, about } = ctx, E = h.esc, f = l.facets;
      const parts = [];
      if (r.app) parts.push(h.appName(r.app));
      if (r.site) parts.push(h.siteName(r.site));
      if (r.type) parts.push(l.typeName);
      if (r.tag) parts.push(r.tag);
      if (r.q) parts.push(`"${r.q}"`);
      if (!parts.length) parts.push(r.arch === '1' ? 'Archived' : 'All files');
      const secTitle = (r.app ? h.appName(r.app) : parts[0]) + ' downloads:';
      const side = sidebar(ctx, [[h.link(r, { app: '', type: '', tag: '' }), 'All programs'], ...f.apps.map(([k, n, c]) => [h.link(r, { app: k, type: '', tag: '' }), `${n} (${c})`])].slice(0, 30),
        f.types.map(([t, n]) => [h.link(r, { type: r.type && h.slug(r.type) === h.slug(t) ? '' : t, tag: '' }), `${t} (${n})`]),
        `<div class="sp-rt">Category Options:</div><div class="sp-rb sp-opt">Show only:<br>${h.archSelect(r)}<br>Sort by:<br>${h.sortSelect(r)}</div>`);
      const bc = `<a href="${h.url.home()}">C:</a> \\ ${[r.app && [h.url.app(r.app), h.appName(r.app)], r.type && [h.url.type(r.type), l.typeName], r.site && [h.url.site(r.site), h.siteName(r.site)], r.tag && [h.link(r, {}), r.tag], r.q && [h.link(r, {}), `Search: ${r.q}`]].filter(Boolean).map(([u, t]) => `<a href="${u}">${E(t)}</a>`).join(' \\ ') || `<a href="${h.link(r, {})}">${E(parts[0])}</a>`}`;
      const pg = pagerLinks(h, r, l);
      return `${header(ctx)}<div class="sp-body"><div class="sp-bg">
        <div class="sp-center">${subband(ctx, secTitle, [[h.url.home(), 'Home'], [h.link(r, { sort: 'old' }), 'Oldest files'], [h.link(r, { arch: '1' }), 'Archived only']])}
        ${about ? `<div class="sp-about"><div class="sp-tools"><a href="${E(about.edit)}" target="_blank" rel="noopener">Edit</a> | <a href="${h.link(r, { site: '' })}">Close</a></div>${about.html}</div>` : ''}
        <div class="sp-lt"><div class="sp-bcz">${bc} <span>(${l.total.toLocaleString()} files)</span></div><div class="sp-pg">${pg ? 'Pages: ' + pg : ''}</div></div>
        <div class="sp-rows">${l.rows.length ? l.rows.map(e => row(h, e)).join('') : '<p class="sp-empty">No files found.</p>'}</div>
        <div class="sp-lb"><a href="#" onclick="scrollTo(0,0);return false">go to top</a><div class="sp-pg">${pg ? 'Pages: ' + pg : ''}</div></div>
        ${f.tags.length ? `<div class="sp-tg"><b>Tags:</b> ${f.tags.slice(0, 40).map(([t, n]) => `<a href="${h.link(r, { tag: r.tag === t ? '' : t })}">${E(t)}</a>`).join(' | ')}</div>` : ''}
        </div>${side}</div></div>${footer(h)}`;
    },
    item(ctx) {
      const { h, item: e } = ctx, E = h.esc, m = ctx.manifest;
      if (!e) return `${header(ctx)}<div class="sp-body"><div class="sp-bg"><div class="sp-center"><p class="sp-empty">Item not found. <a href="${h.url.home()}">Back to home</a></p></div>${homeSide(ctx)}</div></div>${footer(h)}`;
      const a = (href, t, c = '') => href ? `<a class="${c}" href="${E(href)}" target="_blank" rel="noopener">${t}</a>` : '';
      const file = h.file(e);
      return `${header(ctx)}<div class="sp-body"><div class="sp-bg">
        <div class="sp-center">${subband(ctx, e.a + ' downloads:', [[h.url.app(e.k), e.a], ...(e.y[0] ? [[h.link({}, { app: e.k, type: e.y[0] }), e.y[0]]] : []), [h.url.site(e.s), h.siteName(e.s)]])}
        <div class="sp-it"><div class="sp-ith"><h1>${E(e.t)}</h1><span>${a(h.report(e), 'Report', 'rep')}</span></div>
        <div class="sp-itb"><div class="sp-il">
          ${file ? `<a class="sp-dlb" href="${E(file)}" target="_blank" rel="noopener"><span>DOWNLOAD</span></a>` : '<div class="sp-dlb off"><span>NO FILE</span></div>'}
          <div class="sp-ila">${a(h.page(e), 'Original page')}<br>${a(h.edit(e), 'Edit this entry')}<br>${a(h.report(e), 'Report this file', 'rep')}</div>
          <div class="sp-shot">${h.media(e)}</div></div>
        <div class="sp-ir"><table class="sp-spec">${h.details(e).map(([k, v]) => `<tr><th>${k}:</th><td>${v}</td></tr>`).join('')}</table>
          <div class="sp-links">${a(h.report(e), 'Report', 'rep')} | ${a(h.edit(e), 'Edit')}${h.page(e) ? ' | ' + a(h.page(e), 'Original page') : ''}</div>
          ${e.desc ? `<div class="sp-dh">${E(e.t)} description</div><div class="sp-desc">${e.desc}</div>` : ''}
          ${file ? `<div class="sp-dls">${a(file, E(e.t) + ' Download')}</div>` : ''}
        </div></div></div></div>${sidebar(ctx, [...m.apps].sort((a, b) => b.count - a.count).slice(0, 18).map(x => [h.url.app(x.slug), x.name]), e.y.map(t => [h.link({}, { app: e.k, type: t }), `${e.a} ${t}`]))}</div></div>${footer(h)}`;
    },
  };
  function footer(h) { return `<div class="sp-foot"><div class="sp-f1">Customization Museum. Files are archived automatically and not checked.</div><div class="sp-f2"><a href="${h.url.home()}">Home</a> | <a href="${h.url.request()}" target="_blank" rel="noopener">Submit</a> | <a href="https://github.com/melo-foundation/customization-museum" target="_blank" rel="noopener">Source</a></div><div class="sp-f3"></div></div>`; }
})();
