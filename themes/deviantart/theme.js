// label: deviantART 2006
// Layout of deviantART v5 (late 2006): dark top bar, login strip, ad slot, rounded content panel, footer.
(() => {
  const ico = {
    browse: '<svg viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#d9b25a" stroke="#6b4e1c"/><rect x="4" y="4" width="8" height="8" fill="#fff6dc"/></svg>',
    archive: '<svg viewBox="0 0 16 16"><path d="M2 4h12v9H2z" fill="#c9d8d0" stroke="#41514b"/><path d="M1 2h14v3H1z" fill="#8fa89b" stroke="#41514b"/></svg>',
    request: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="#e2d35b" stroke="#6a5f16"/><path d="M5 9c1 2 5 2 6 0" stroke="#4a4210" fill="none"/><circle cx="6" cy="6.5" r="1" fill="#4a4210"/><circle cx="10" cy="6.5" r="1" fill="#4a4210"/></svg>',
    about: '<svg viewBox="0 0 16 16"><path d="M2 3h12v8H7l-3 3v-3H2z" fill="#dde7e3" stroke="#41514b"/></svg>',
  };
  const ext = 'target="_blank" rel="noopener"';
  const REPO_URL = 'https://github.com/melo-foundation/customization-museum';

  const searchForm = (h, r, cls, label, ph = '') => `<form data-search role="search" class="${cls}"><input type="search" name="q" value="${h.esc(r.q)}" placeholder="${ph}" aria-label="Search"><button type="submit">${label}</button></form>`;

  const top = ctx => {
    const { h, route: r, manifest: m } = ctx;
    return `<div class="dv-top">
      <a class="dv-logo" href="${h.url.home()}">customization<b>museum</b></a>
      <ul class="dv-nav">
        <li class="on"><a href="${h.url.home()}">${ico.browse}Browse</a></li>
        <li><a href="${h.link({}, { arch: '1' })}">${ico.archive}Archived</a></li>
        <li><a href="${h.url.request()}" ${ext}>${ico.request}Request</a></li>
        <li><a href="${REPO_URL}" ${ext}>${ico.about}About</a></li>
      </ul>
      ${searchForm(h, r, 'dv-search', 'Search Art')}
    </div>
    <div class="dv-login"><span>Theme: ${h.themePicker()}</span><span class="dv-count">${m.total.toLocaleString()} items &middot; ${m.archived.toLocaleString()} archived</span><a href="${h.url.request()}" ${ext}>Request an item</a></div>`;
  };

  const adslot = h => `<div class="dv-ad">${h.warning() || '<div class="dv-adtext">An archive of themes, skins and add-ons for old customizable programs.</div>'}</div>
      <div class="dv-noads">Missing something? <a href="${h.url.request()}" ${ext}>Request it</a></div>`;

  const foot = h => `<div class="dv-foot">
      <div class="dv-f1"><a href="${h.url.home()}">Browse</a> | <a href="${h.link({}, { arch: '1' })}">Archived</a> | <a href="${h.url.request()}" ${ext}>Request</a></div>
      <div class="dv-f2">Customization Museum | <a href="${REPO_URL}" ${ext}>Source</a> | <a href="${REPO_URL}/issues" ${ext}>Reports</a></div>
    </div>`;

  const wrap = (ctx, inner, ad = true) => `<div class="dv-world">${top(ctx)}${ad ? adslot(ctx.h) : ''}${inner}${foot(ctx.h)}</div>`;

  const thumb = (h, e, cap) => `<div class="dv-tt"><a class="dv-th" href="${h.url.item(e)}" title="${h.esc(e.t)}">${h.img(e) || '<span class="dv-ph"></span>'}</a>${cap}</div>`;

  const catButton = label => `<span class="dv-cats">${label}<i></i></span>`;

  THEMES.deviantart = {
    label: 'deviantART 2006',

    home(ctx) {
      const { h, manifest: m } = ctx;
      const progs = m.apps.slice(0, 14).map(a => `<li><a href="${h.url.app(a.slug)}">${h.esc(a.name)}</a> <i>${a.count.toLocaleString()}</i></li>`).join('');
      const types = Object.entries(m.types).slice(0, 8).map(([t, n]) => `<li><a href="${h.url.type(t)}">${h.esc(t)}</a> <i>${n.toLocaleString()}</i></li>`).join('');
      return wrap(ctx, `<div class="dv-panel dv-front">
        <div class="dv-fmain">
          <div class="dv-fbar">${catButton('Categories')}<span>${m.total.toLocaleString()} deviations</span></div>
          ${m.apps.filter(a => a.count >= 100 && a.count <= 1500).slice(0, 8).map(a => `<div class="dv-frow" hidden data-app="${h.esc(a.slug)}"><a class="dv-fh" href="${h.url.app(a.slug)}">${h.esc(a.name)}</a><div class="dv-frowin"></div></div>`).join('')}
        </div>
        <div class="dv-fside">
          <h2>Customization Museum</h2>
          <p>${m.total.toLocaleString()} themes, skins and add-ons from ${m.apps.length} programs. ${m.archived.toLocaleString()} are archived.</p>
          <h4>Search the museum</h4>
          ${searchForm(h, ctx.route, 'dv-join', 'Search!')}
          <h4>Programs</h4><ul class="dv-flist">${progs}</ul>
          <h4>Types</h4><ul class="dv-flist">${types}</ul>
        </div>
      </div>`, false);
    },

    // front-page rows: four thumbnails from mid-sized programs (small data files load fast)
    after(ctx, el) {
      if (ctx.item || ctx.list) return;
      const rows = [...el.querySelectorAll('.dv-frow[data-app]')];
      // fill candidates in order; show the first four that actually have thumbnails
      (async () => {
        let shown = 0;
        for (const row of rows) {
          if (shown === 4) break;
          const data = await fetch(`idx/app/${row.dataset.app}.json`).then(r => r.ok ? r.json() : []).catch(() => []);
          const picks = data.filter(e => e.v).slice(0, 4);
          if (!picks.length) continue;
          row.querySelector('.dv-frowin').innerHTML = picks.map(e => thumb(ctx.h, e, '')).join('');
          row.hidden = false;
          shown++;
        }
      })();
    },

    list(ctx) {
      const { h, route: r, list: l, about } = ctx;
      const f = l.facets;
      const title = r.app ? h.appName(r.app) : l.typeName || (r.site ? h.siteName(r.site) : r.tag || (r.q ? `“${r.q}”` : 'All Deviations'));
      const crumbs = [['Customization', h.url.home()]];
      if (r.app) crumbs.push([h.appName(r.app), h.url.app(r.app)]);
      if (l.typeName) crumbs.push([l.typeName, h.link(r, { tag: '' })]);
      if (r.site) crumbs.push([h.siteName(r.site), h.url.site(r.site)]);
      if (r.tag) crumbs.push([r.tag, h.link(r, {})]);
      if (r.q) crumbs.push([`Search: ${r.q}`, h.link(r, {})]);
      const opt = (cur, list, key) => list.map(([v, t]) => cur === v ? `<b>${t}</b>` : `<a href="${h.link(r, { [key]: v })}">${t}</a>`).join('');
      const range = f.types.map(([t]) => (l.typeName && h.slug(l.typeName) === h.slug(t)) ? `<b>${h.esc(t)}</b>` : `<a href="${h.link(r, { type: t, tag: '' })}">${h.esc(t)}</a>`).join('');
      const p = h.pager(r, l.pages);
      const side = `<div class="dv-rcol">
        <h4>Programs</h4><ul>${f.apps.map(([k, name, n]) => `<li${k === r.app ? ' class="on"' : ''}><a href="${h.link(r, { app: k, type: '', tag: '' })}">${h.esc(name)}</a> <i>${n}</i></li>`).join('')}</ul>
        ${f.tags.length ? `<h4>Tags</h4><ul>${f.tags.slice(0, 30).map(([t, n]) => `<li${t === r.tag ? ' class="on"' : ''}><a href="${h.link(r, { tag: t === r.tag ? '' : t })}">${h.esc(t)}</a> <i>${n}</i></li>`).join('')}</ul>` : ''}
      </div>`;
      return wrap(ctx, `<div class="dv-panel">
        <div class="dv-head">
          <h1>${h.esc(title)}</h1>
          <div class="dv-crumbrow">${catButton('Categories')}<span class="dv-crumbs">${crumbs.map(([t, u]) => `<a href="${h.esc(u)}">${h.esc(t)}</a>`).join(' &gt; ')}</span>${searchForm(h, r, 'dv-within', '', 'search these results')}</div>
        </div>
        ${about ? `<div class="dv-about"><div class="dv-tools"><a href="${h.esc(about.edit)}" ${ext}>Edit</a> | <a href="${h.esc(h.link(r, { site: '' }))}">Close</a></div>${about.html}</div>` : ''}
        <div class="dv-tabs"><span class="dv-sorts">${opt(r.sort, [['', 'Newest'], ['az', 'A&ndash;Z'], ['old', 'Way back']], 'sort')}</span><span class="dv-show">Show ${opt(r.arch, [['', 'All'], ['1', 'Archived'], ['0', 'Not archived']], 'arch')}</span></div>
        <div class="dv-range"><span>Types</span>${range}</div>
        <div class="dv-body">
          <div class="dv-grid">${l.rows.length ? l.rows.map(e => thumb(h, e, `<div class="dv-cap">in <a href="${h.url.app(e.k)}">${h.esc(e.a)}</a></div>`)).join('') : '<p class="dv-empty">No deviations found.</p>'}</div>
          ${side}
        </div>
        ${l.pages > 1 ? `<div class="dv-pager">${p.prev ? `<a href="${p.prev}">Previous Page</a>` : '<span>Previous Page</span>'}<em>Page ${l.page} of ${l.pages}</em>${p.next ? `<a href="${p.next}">Next Page</a>` : '<span>Next Page</span>'}</div>` : ''}
      </div>`);
    },

    item(ctx) {
      const { h, item: e } = ctx;
      if (!e) return wrap(ctx, `<div class="dv-panel dv-dev"><p class="dv-empty">Deviation not found. <a href="${h.url.home()}">Back to the museum</a></p></div>`);
      const a = (href, text) => href ? `<a href="${h.esc(href)}" ${ext}>${text}</a>` : '';
      const year = (e.d || '').slice(0, 4);
      return wrap(ctx, `<div class="dv-panel dv-dev">
        <div class="dv-dhead">
          <span class="dv-av">${h.img(e)}</span>
          <h1>${h.esc(e.t)} <small>by <a href="${h.url.app(e.k)}">${h.esc(e.a)}</a></small></h1>
          <div class="dv-dcat"><a href="${h.url.home()}">Customization</a> &gt; <a href="${h.url.app(e.k)}">${h.esc(e.a)}</a> &gt; ${e.y.map(t => `<a href="${h.url.type(t)}">${h.esc(t)}</a>`).join(' &gt; ')}</div>
        </div>
        <div class="dv-dmid">
          <div class="dv-dleft">
            <p>${a(h.file(e), 'Download') || '<span>Download Not Available</span>'}</p>
            <p>${a(h.page(e), 'Original page') || '<span>No original page</span>'}</p>
            <p>${a(h.edit(e), 'Edit Details')}</p>
            <h5>Also</h5>
            <p><a href="${h.url.app(e.k)}">${h.esc(e.a)} gallery</a></p>
            <p><a href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a></p>
            <p>${a(h.report(e), 'Report')}</p>
          </div>
          <div class="dv-dimg">${h.media(e)}</div>
        </div>
        <div class="dv-copy">${year ? `&copy;${h.esc(year)} ` : ''}${h.esc(h.siteName(e.s))}</div>
        <div class="dv-comments">
          <div class="dv-ctext"><h4>Artist's Comments</h4>${e.desc || `<p>${e.g.length ? h.esc(e.g.join(', ')) : 'No comments.'}</p>`}</div>
          <div class="dv-details"><h4>Details</h4><dl>${h.details(e).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><p class="dv-arch">Archived: ${h.esc(h.archivedLabel(e))}</p></div>
        </div>
      </div>`);
    },
  };
})();
