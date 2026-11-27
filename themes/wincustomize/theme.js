// label: WinCustomize 2003
// Rebuilt on the original GreenApple markup (Sept 2003 listing, March 2003 front page): same table
// structure, widths, cellspacing and colors. Logo spot carries our name; no WinCustomize artwork.
(() => {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const today = () => { const d = new Date(); return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
  const ic = '<span class="ic"></span>';

  // framed box: 1px #806733 border, 25px #ffcc46 title bar (title may be any HTML)
  const frame = (title, body, { bg = '#ffffff', cls = '', titleCls = 'center' } = {}) =>
    `<table class="fr ${cls}" cellpadding="0" cellspacing="0"><tr><td class="frt ${titleCls}">${title}</td></tr><tr><td class="frb" style="background:${bg}">${body}</td></tr></table>`;
  const gap = '<div class="gap"></div>';

  const header = (ctx) => {
    const { h } = ctx;
    return `<table class="hd" cellpadding="0" cellspacing="0"><tr><td class="logo"><a href="${h.url.home()}"><span>Customization</span><span>Museum</span></a></td><td class="ad"><div class="adslot">${h.warning() || `<div class="adstats"><b>${ctx.manifest.total.toLocaleString()}</b> skins, themes and add-ons &nbsp;-&nbsp; <b>${ctx.manifest.archived.toLocaleString()}</b> on the Wayback Machine</div>`}</div></td></tr></table>
      <table class="tb" cellpadding="0" cellspacing="0"><tr>
        <td class="tbl"><div></div></td>
        <td class="tbtext"><nobr><a href="${h.url.home()}">Customization Museum</a>&nbsp;&nbsp;&nbsp;${today()}</nobr></td>
        <td class="tbmid">&nbsp;</td>
        <td class="tbr"><b>Theme:</b>&nbsp;</td><td class="tbr">${h.themePicker()}</td>
        <td class="tbr">&nbsp;&nbsp;&nbsp;&nbsp;<b><a href="${h.url.request()}" target="_blank" rel="noopener">Request</a></b>&nbsp;</td>
      </tr></table>
      <table class="tl" cellpadding="0" cellspacing="5"><tr><td><b>&nbsp;<a href="${h.url.home()}">Home</a> &nbsp;-&nbsp;<a href="${h.link({}, { arch: '1' })}">Archived</a> &nbsp;-&nbsp;<a href="${h.url.request()}" target="_blank" rel="noopener">Request</a> &nbsp;-&nbsp;<a href="${h.link({}, { q: '' })}">Search</a></b></td></tr></table>
`;
  };

  const libraryList = (rows) => `<table class="lib" cellpadding="0" cellspacing="3">${rows.map(([href, label, n, on]) =>
    `<tr><td>${ic}</td><td class="w"><a href="${href}"${on ? ' class="on"' : ''}>${label}</a></td><td class="n">${n == null ? '' : `[${n}]`}</td></tr>`).join('')}</table>`;
  const linkList = (rows) => `<table class="lib" cellpadding="0" cellspacing="3">${rows.map(([href, label]) => `<tr><td>${ic}</td><td class="w"><a href="${href}">${label}</a></td></tr>`).join('')}</table>`;
  const ranked = (rows) => `<table class="rank" cellpadding="0" cellspacing="3">${rows.map(([href, label, n], i) =>
    `<tr><td class="w">${i + 1}. <a href="${href}">${label}</a></td><td class="n">[${n}]</td></tr>`).join('')}</table>`;
  const plainLinks = (rows) => `<div class="plain">${rows.map(([href, label]) => `<a href="${href}">${label}</a>`).join('<br>')}</div>`;

  const poll = (ctx) => {
    const { h, manifest: m } = ctx;
    const types = Object.entries(m.types).slice(0, 4), total = m.total;
    const box = (inner, bold) => `<table class="pb" cellpadding="1" cellspacing="0"><tr><td><table cellpadding="1" cellspacing="0"><tr><td><div class="pq${bold ? ' b' : ''}">${inner}</div></td></tr></table></td></tr></table>`;
    const bar = n => `<table class="pbar" cellpadding="1" cellspacing="0"><tr><td><div style="width:${(100 * n / total).toFixed(1)}%"></div></td></tr></table>`;
    return frame('Poll', `<table class="poll" cellpadding="0" cellspacing="5"><tr><td><table cellpadding="2" cellspacing="0">
      <tr><td>${box('What is in the museum?', true)}</td></tr>
      <tr><td class="votes">${total.toLocaleString()} items</td></tr>
      ${types.map(([t, n], i) => `<tr><td>${box(`${i + 1}- <a href="${h.url.type(t)}">${h.esc(t)}</a>`)}</td></tr><tr><td>${bar(n)}</td></tr>`).join('')}
    </table></td></tr></table>`);
  };
  const dailyShot = (ctx) => {
    const { h, manifest: m } = ctx;
    return frame('Daily Shot', `<table class="ds" cellpadding="0" cellspacing="3"><tr><td>${ic}<br><a href="${h.link({}, { arch: '1' })}">${m.archived.toLocaleString()} of ${m.total.toLocaleString()} items archived</a></td></tr></table>`);
  };

  const page = (ctx, left, center, right) => `${header(ctx)}
    <table class="main" cellpadding="0" cellspacing="5"><tr>
      <td class="side" valign="top">${left}</td>
      <td class="center" valign="top">${center}</td>
      <td class="side" valign="top">${right}</td>
    </tr></table>`;

  const leftCommon = (ctx, r = {}, home = false) => {
    const { h, manifest: m } = ctx;
    const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
    return (home ? dailyShot(ctx) + gap : '')
      + frame('Library', libraryList([...m.apps.slice(0, 22).map(a => [h.url.app(a.slug), h.esc(a.name), a.count.toLocaleString(), a.slug === r.app]),
        ...(m.apps.length > 22 ? [[h.url.home(), '[more...]', null]] : [])]))
      + gap + frame('Resources', plainLinks(sites.slice(0, 4).map(([s, i]) => [h.url.site(s), h.esc(i.name)])))
      + gap + frame('Options', linkList([[h.url.request(), 'Request an item'], [h.link({}, { arch: '1' }), 'Archived items'], [h.link({}, { sort: 'old' }), 'Oldest first'], [h.link({}, { sort: 'az' }), 'A to Z']]))
      + gap + poll(ctx);
  };

  const rightCommon = (ctx) => {
    const { h, manifest: m } = ctx;
    const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
    return frame('Museum Totals', `<div class="goodies">${m.total.toLocaleString()} items<br>${m.archived.toLocaleString()} archived<br>${m.apps.length} programs</div>`)
      + gap + frame('Top Sources', ranked(sites.slice(0, 10).map(([s, i]) => [h.url.site(s), h.esc(i.name), i.count.toLocaleString()])))
      + gap + frame('Newest Libraries', linkList(m.apps.slice(-12).reverse().map(a => [h.url.app(a.slug), h.esc(a.name)])))
      + gap + frame('Community', plainLinks(sites.slice(0, 8).map(([s, i]) => [h.url.site(s), h.esc(i.name)])));
  };

  // one skin entry, as in the original library listing
  const entry = (h, e) => {
    const file = h.file(e);
    const shot = h.img(e, 'alt="Click to Enlarge"') || '<span class="np">Click to Enlarge</span>';
    return frame(
      `<table class="ttl" cellpadding="0" cellspacing="0"><tr><td class="l">${ic}&nbsp;<a href="${h.url.item(e)}">${h.esc(e.t)}</a></td><td class="r">&nbsp;&nbsp;Category: <b>${h.esc(e.y.join(', '))}</b></td></tr></table>`,
      `<table class="sk" cellpadding="0" cellspacing="5"><tr>
        <td class="shotcell" valign="top"><table cellpadding="5" cellspacing="1"><tr><td class="shot" valign="top"><div><a href="${h.url.item(e)}">${shot}</a></div></td></tr></table></td>
        <td class="infocell" valign="top"><table cellpadding="5" cellspacing="1"><tr><td class="info" valign="top">
          Program:&nbsp;<a href="${h.url.app(e.k)}">${h.esc(e.a)}</a><br><br>
          Source:&nbsp;<b>${h.esc(h.siteName(e.s))}</b><br>Archived:&nbsp;<b>${h.esc(h.archivedLabel(e))}</b><br><br>
          ${e.d ? `Created:&nbsp;<b>${h.esc(e.d)}</b><br><br>` : ''}
          ${e.g.length ? `<b>Description:&nbsp;<br></b>${e.g.map(t => h.esc(t)).join(', ')}` : ''}
        </td></tr></table></td></tr>
        <tr><td colspan="2" class="foot"><a href="${h.esc(h.report(e))}" target="_blank" rel="noopener">[Report]</a>&nbsp;&nbsp;-&nbsp;&nbsp;${file ? `<a href="${h.esc(file)}" target="_blank" rel="noopener">[Download]</a>` : '<a href="' + h.url.item(e) + '">[Details]</a>'}</td></tr></table>`,
      { bg: '#F6F6F6', titleCls: 'title-row' });
  };

  const searchFrame = (h, r, apps, types, typeName) => frame(
        `<form data-search class="sf"><table cellpadding="0" cellspacing="0"><tr>
          <td class="l">&nbsp;<b>Search:</b>&nbsp;<input type="search" name="q" value="${h.esc(r.q)}" size="16"></td>
          <td class="r"><b>Sort by:</b>&nbsp;${h.sortSelect(r)}&nbsp;${h.archSelect(r)}&nbsp;<button type="submit">GO</button>&nbsp;</td></tr></table></form>`,
        `<table class="chg" cellpadding="0" cellspacing="5"><tr><td><b>Change Library:</b>&nbsp;<select onchange="location.href=this.value">
            <option value="${h.link(r, { app: '', type: '', tag: '' })}">All programs</option>
            ${apps.map(([k, label]) => `<option value="${h.link(r, { app: k, type: '', tag: '' })}"${k === r.app ? ' selected' : ''}>${h.esc(label)}</option>`).join('')}</select></td></tr></table>
          <table class="cats" cellpadding="0" cellspacing="5"><tr>${[['', `All ${h.esc(r.app ? h.appName(r.app) : 'items')}`, !r.type], ...types.map(t => [t, h.esc(t), typeName === t])]
            .map(([t, label, on], i) => `${i && i % 4 === 0 ? '</tr><tr>' : ''}<td><a href="${h.link(r, { type: t, tag: '' })}"><input type="checkbox" tabindex="-1" onclick="return false"${on ? ' checked' : ''}>${label}</a></td>`).join('')}</tr></table>`,
        { bg: '#F6F6F6', titleCls: 'title-row' });

  const pager = (h, r, l) => {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return gap + frame(`Page ${l.page} of ${l.pages}`, `<div class="pg">${p.prev ? `<a href="${p.prev}">&lt;&lt; Previous</a>&nbsp; ` : ''}${p.items.map(i => i.gap ? '...' : i.current ? `<b>[${i.n}]</b>` : `<a href="${i.url}">${i.n}</a>`).join(' ')}${p.next ? ` &nbsp;<a href="${p.next}">Next &gt;&gt;</a>` : ''}</div>`, { bg: '#F6F6F6' });
  };

  THEMES.wincustomize = {
    label: 'WinCustomize 2003',

    home(ctx) {
      const { h, manifest: m } = ctx;
      const big = m.apps[0];
      const featured = frame('Featured Library', `<table class="sk" cellpadding="0" cellspacing="5"><tr>
          <td class="shotcell narrow" valign="top"><table cellpadding="5" cellspacing="1"><tr><td class="shot" valign="top">${ic}</td></tr></table></td>
          <td class="infocell" valign="top"><table cellpadding="5" cellspacing="1"><tr><td class="info big" valign="top">Library:<a href="${h.url.app(big.slug)}">${h.esc(big.name)}</a><br>Items:<b>${big.count.toLocaleString()}</b><br>Types:<b>${Object.keys(big.types).length}</b></td></tr></table></td></tr>
          <tr><td colspan="2" class="foot"><a href="${h.url.app(big.slug)}">[Browse]</a></td></tr></table>`, { bg: '#F6F6F6' });
      const about = frame('Customization Museum', `<table class="sk" cellpadding="0" cellspacing="5"><tr>
          <td class="shotcell" valign="top"><table cellpadding="5" cellspacing="1"><tr><td class="shot small" valign="top"><b>${m.total.toLocaleString()}<br>items</b></td></tr></table></td>
          <td class="infocell" valign="top"><table cellpadding="5" cellspacing="1"><tr><td class="info big" valign="top">Browse <b>${m.total.toLocaleString()}</b> skins, themes and add-ons for <b>${m.apps.length}</b> programs. <b>${m.archived.toLocaleString()}</b> are backed up on the Wayback Machine.<br><br><b><a href="${h.link({}, { arch: '1' })}">[Archived]</a> - <a href="${h.url.request()}" target="_blank" rel="noopener">[Request]</a></b></td></tr></table></td></tr></table>`, { bg: '#F6F6F6' });
      const news = m.apps.slice(0, 8).map(a => `<div class="news"><div class="nt">${h.esc(a.name)} - ${a.count.toLocaleString()} items</div>
          <p>${Object.entries(a.types).map(([t, n]) => `<a href="${h.link({}, { app: a.slug, type: t })}">${h.esc(t)}</a> (${n.toLocaleString()})`).join('<br>')}</p>
          <table class="nf" cellpadding="0" cellspacing="0"><tr><td><b><a href="${h.url.app(a.slug)}">[Browse ${h.esc(a.name)}]</a></b></td><td class="r">Library: <b>${h.esc(a.slug)}</b></td></tr></table></div>`).join('');
      return page(ctx, leftCommon(ctx, {}, true), featured + gap + about + gap + frame('Museum Directory', news, { bg: '#ffffff' }), rightCommon(ctx));
    },

    list(ctx) {
      const { h, route: r, list: l, about, manifest: m } = ctx;
      const title = l.typeName || (r.app ? h.appName(r.app) : r.site ? h.siteName(r.site) : r.tag || (r.q ? `Search: ${r.q}` : 'All items'));
      const search = searchFrame(h, r, l.facets.apps, l.facets.types.map(([x]) => x), l.typeName);
      const aboutBox = frame(`About ${h.esc(title)}`,
        about ? `<div class="aboutx">${about.html}</div><table class="al" cellpadding="0" cellspacing="5"><tr><td class="r"><a href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="${h.link(r, { site: '' })}">Close</a>&nbsp;</td></tr></table>`
          : `<table class="al" cellpadding="0" cellspacing="5"><tr><td class="c">${ic}&nbsp;${h.esc(title)}: ${l.total.toLocaleString()} items</td></tr><tr><td class="r"><a href="${h.link(r, { sort: '' })}">Newest</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="${h.link(r, { sort: 'old' })}">Oldest</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="${h.link(r, { arch: '1' })}">Archived</a>&nbsp;</td></tr></table>`,
        { bg: '#F6F6F6' });
      const rows = l.rows.length ? l.rows.map(e => entry(h, e)).join(gap) : frame('No results', '<div class="plain">Nothing matched.</div>');
      const right = frame('Museum Totals', `<div class="goodies">${l.total.toLocaleString()} items<br>page ${l.page} of ${l.pages}</div>`)
        + gap + frame('On This Page', linkList(l.rows.slice(0, 10).map(e => [h.url.item(e), h.esc(e.t)])))
        + (l.facets.tags.length ? gap + frame('Popular Tags', ranked(l.facets.tags.slice(0, 10).map(([t, n]) => [h.link(r, { tag: r.tag === t ? '' : t }), h.esc(t), n.toLocaleString()]))) : '')
        + gap + frame('Community', plainLinks(Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).slice(0, 8).map(([s, i]) => [h.url.site(s), h.esc(i.name)])));
      return page(ctx, leftCommon(ctx, { app: r.app, type: l.typeName }), search + gap + aboutBox + gap + rows + pager(h, r, l), right);
    },

    item(ctx) {
      const { h, item: e, manifest: m } = ctx;
      if (!e) return page(ctx, leftCommon(ctx), frame('Error', `<div class="plain">Item not found. <a href="${h.url.home()}">Back to the museum</a></div>`), rightCommon(ctx));
      const r = { app: e.k };
      const app = m.apps.find(a => a.slug === e.k) || { name: e.a, count: 0, types: {} };
      const search = searchFrame(h, r, m.apps.map(a => [a.slug, a.name]), Object.keys(app.types), '');
      const aboutBox = frame(`About ${h.esc(e.a)}`, `<table class="al" cellpadding="0" cellspacing="5"><tr><td class="c">${ic}&nbsp;${h.esc(e.a)}: ${app.count.toLocaleString()} items</td></tr><tr><td class="r"><a href="${h.url.app(e.k)}">Browse</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a>&nbsp;</td></tr></table>`, { bg: '#F6F6F6' });
      const a = (href, text) => href ? `<a href="${h.esc(href)}" target="_blank" rel="noopener">${text}</a>` : '';
      const panel = (body, by) => `<table class="cm" cellpadding="0" cellspacing="5"><tr><td><div class="cmb">${body}</div>${by ? `<div class="cmby">${by}</div>` : ''}</td></tr></table>`;
      const panels = [
        panel(`<table class="dl" cellpadding="0" cellspacing="0">${h.details(e).map(([k, v]) => `<tr><td class="k">${k}:</td><td>${v}</td></tr>`).join('')}</table>`, `${a(h.edit(e), 'Edit')} - ${a(h.report(e), 'Report')}${h.page(e) ? ` - ${a(h.page(e), 'Original page')}` : ''}`),
        e.desc ? panel(e.desc, '') : '',
        panel(`<div class="bigshot">${h.media(e)}</div>`, ''),
      ].join('');
      return page(ctx, leftCommon(ctx, { app: e.k }), search + gap + aboutBox + gap + entry(h, e) + gap + frame('Details', panels, { bg: '#F6F6F6' }), rightCommon(ctx));
    },
  };
})();
