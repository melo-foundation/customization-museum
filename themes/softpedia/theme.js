// label: Download Portal 2006
// Recreates the 2006 Softpedia page structure (984px table, navy header, circle row, 822px main column,
// 157px right column) with our own name and data. Measurements come from Wayback captures of softpedia.com.
(() => {
  const COLORS = ['#e8232b', '#d93f7c', '#ec7d1c', '#3fa63f', '#1f9bb5', '#3376cf', '#6a4fc4'];
  const HOMECOL = ['#ec2e36', '#3fae3f', '#e0457f', '#2aa6c4', '#3a7ad6', '#ec7d1c', '#6a4fc4'];  // front-page box order
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const ord = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
  const longDate = d => {
    const [y, m, day] = (d || '').split('-').map(Number);
    if (!y) return '';
    return m ? `${MONTHS[m - 1]} ${day ? ord(day) + ', ' : ''}${y}` : String(y);
  };
  const resetLink = (h, r, change) => h.link(r, { app: '', type: '', site: '', tag: '', q: '', arch: '', ...change });

  // ---------- header ----------
  function header(ctx) {
    const { h, manifest: m, route: r } = ctx, E = h.esc;
    const nav = [['HOME', h.url.home()], ['SUBMIT ITEM', h.url.request(), 1], ['ARCHIVED', resetLink(h, r, { arch: '1' })], ['NEWEST', resetLink(h, r, { sort: '' })],
      ['OLDEST', resetLink(h, r, { sort: 'old' })], ['A-Z', resetLink(h, r, { sort: 'az' })], ['SOURCE CODE', 'https://github.com/melo-foundation/customization-museum', 1]];
    const types = Object.keys(m.types).slice(0, 6);
    const circles = [...types.map(t => [t.split(/[ &]/)[0], h.url.type(t)]), ['Archived', resetLink(h, r, { arch: '1' })]];
    // measured sphere centres in the original circle row (x within the 974px page)
    const CX = [55, 130, 204, 277, 351, 424, 498];
    const circle = ([label, url], i) => `<a class="sp-circ" href="${url}" style="--c:${COLORS[i]};left:${CX[i] - 29}px"><span>${E(label.toUpperCase())}</span></a>`;
    return `<table class="sp-top" cellspacing="0" cellpadding="0"><tr>
        <td class="sp-logocell" rowspan="2"><a class="sp-logo" href="${h.url.home()}">CUSTOMIZATION MUSEUM<sup>TM</sup></a><div class="update">${m.total.toLocaleString()} files online</div></td>
        <td class="sp-nav">${nav.map(([t, u, ext]) => `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`).join('')}</td></tr>
        <tr><td class="sp-adrow">${h.themePicker()}</td></tr></table>
      <table class="sp-circles" cellspacing="0" cellpadding="0"><tr>
        <td class="sp-c1">${circle(circles[0], 0)}</td>
        <td class="sp-c2">${circles.slice(1, 6).map((c, i) => circle(c, i + 1)).join('')}</td>
        <td class="sp-c3">${circles[6] ? circle(circles[6], 6) : ''}</td>
        <td class="sp-m7"><span class="sp-lens"></span><b>Search:</b></td>
        <td class="sp-m8">${h.searchForm(r, '')}</td>
        <td class="sp-m9"><a class="sp-bm" href="${h.url.home()}"><i>+</i>BOOKMARK THIS SITE</a><span class="sp-go">GO</span><a class="sp-adv" href="${resetLink(h, r, {})}">ADVANCED SEARCH &raquo;</a></td>
      </tr></table>`;
  }

  // ---------- ad slots: same geometry as the original's ad units, filled with our own content ----------
  function ad728(ctx) {
    const { h, manifest: m } = ctx;
    const warn = h.warning();
    if (warn) return `<div class="sp-ad728 sp-adwarn">${warn}</div>`;
    const cell = (u, t, d, ext) => `<td><a class="sp-adt" href="${u}"${ext ? ' target="_blank" rel="noopener"' : ''}>${t}</a><div>${d}</div></td>`;
    return `<table class="sp-ad728" cellspacing="0" cellpadding="0"><tr>
      ${cell(h.link({}, { arch: '1' }), 'Archived files', `${m.archived.toLocaleString()} of ${m.total.toLocaleString()} files are backed up on the Wayback Machine.`)}
      ${cell(h.url.request(), 'Request a site', 'Know an old skin or theme site? Ask for it to be archived.', 1)}
      ${cell(h.url.request(), 'Report a file', 'Broken, wrong or harmful? Files are not checked, report them.', 1)}
      ${cell('https://github.com/melo-foundation/customization-museum', 'Source code', 'Scrapers, archive tools and this site are open source.', 1)}
    </tr><tr><td colspan="4" class="sp-adfoot">Customization Museum notes</td></tr></table>`;
  }
  // "Special Deal" slot of the list pages' right column: header, three text lines, a 140x150 picture area
  const dealBox = ctx => {
    const { h, manifest: m } = ctx;
    const pct = Math.round(100 * m.archived / m.total);
    return `<div class="right_title_bkg">Archive status</div>
      <div class="rightcellcontent sp-rbox sp-deal"><a href="${h.link({}, { arch: '1' })}">Browse archived files</a><br><a href="${h.link({}, { arch: '0' })}">Files waiting for backup</a><br><a href="${h.url.request()}" target="_blank" rel="noopener">Request a site</a>
        <div class="sp-dealpic"><b>${pct}%</b><span>archived</span><i style="width:${pct}%"></i><em>${m.archived.toLocaleString()} / ${m.total.toLocaleString()}</em></div></div>`;
  };

  // ---------- right column ----------
  function right(ctx, boxes) {
    const { h } = ctx;
    return `<td class="sp-right">
      <a class="sp-rbtn sp-basket" href="${h.url.request()}" target="_blank" rel="noopener"><i></i>Submit a file</a>
      <a class="sp-rbtn sp-reviews" href="${resetLink(h, ctx.route, { arch: '1' })}"><i></i>Archived files</a>
      <div class="right_title_bkg">Welcome!</div>
      <div class="rightcellcontent sp-rbox sp-welcomebox">Hello, visitor<br><br><a href="${h.url.request()}" target="_blank" rel="noopener">Request</a> a site if you know a lost one.<br><br>Otherwise, <a href="${h.url.home()}">browse</a>.</div>
      ${boxes}</td>`;
  }
  const bulletBox = (h, title, items) => `<div class="right_title_bkg">${h.esc(title)}</div>
    <div class="rightcellcontent sp-rbox"><ul class="sp-bul">${items.map(([u, t]) => `<li><a href="${u}">${h.esc(t.length > 22 ? t.slice(0, 20) + '...' : t)}</a></li>`).join('')}</ul></div>`;

  // ---------- section title row (title, program finder, categories select, display mode) ----------
  function sectionBar(ctx, title, titleUrl, cats, links) {
    const { h, route: r } = ctx, E = h.esc;
    return `<table class="sp-sect" cellspacing="0" cellpadding="0"><tr>
        <td class="sp-st"><div class="sect_title_win"><a href="${titleUrl}">${E(title)}</a></div></td>
        <td class="sp-pf"><a href="${h.url.home()}"><i></i>Program finder</a></td>
        <td class="sp-cs"><span class="sp-sep"></span><b>Categories in this section:</b></td>
        <td class="sp-csel"><select class="quickcategory" onchange="if(this.value)location.href=this.value"><option value="">Choose...</option>${cats.map(([u, t]) => `<option value="${E(u)}">${E(t)}</option>`).join('')}</select></td>
        <td class="sp-dm"><span class="sp-sep"></span><b>Display mode:</b>${[['A', 'all', ''], ['Y', 'archived', '1'], ['N', 'missing', '0']].map(([c, t, v]) => `<a href="${h.link(r, { arch: v })}"><i>${c}</i>${t}</a>`).join('')}</td>
      </tr><tr><td colspan="5"><div class="onthispage"><table cellspacing="0" cellpadding="0" width="100%"><tr>
        <td class="sp-otp"><span>On this page</span></td>
        ${links.map(([u, t], i) => `<td class="celltext_bigger"><i class="sp-li l${i}"></i><a href="${u}">${E(t)}</a></td>`).join('')}
      </tr></table></div></td></tr>
      <tr><td colspan="5" class="sp-dotrow"><div></div></td></tr></table>`;
  }

  function page(ctx, center, rightCol) {
    const { h } = ctx;
    return `<div class="sp-wrap"><table class="sp-frame" cellspacing="0" cellpadding="0"><tr><td class="sp-edge"></td><td class="sp-white">
      ${header(ctx)}
      <table class="mainbkg sp-main" cellspacing="0" cellpadding="0"><tr valign="top"><td class="sp-center">${center}</td>${rightCol}</tr></table>
      <table class="sp-foot" cellspacing="0" cellpadding="0"><tr><td class="sp-fbar" colspan="2"></td></tr>
        <tr><td class="copyrights sp-fcopy">&copy; Customization Museum. Files are archived automatically and not checked.<br>Names and trademarks belong to their respective owners.</td><td class="sp-fside"></td></tr>
        <tr><td class="copyrights sp-flinks"><a href="${h.url.home()}">Home</a> | <a href="${h.url.request()}" target="_blank" rel="noopener">Submit</a> | <a href="https://github.com/melo-foundation/customization-museum" target="_blank" rel="noopener">Source</a> | <a href="${h.url.request()}" target="_blank" rel="noopener">Report a problem</a></td><td class="sp-fside"></td></tr>
        <tr><td class="sp-fnavy" colspan="2"></td></tr></table>
    </td><td class="sp-edge"></td></tr></table></div>`;
  }

  // ---------- list rows ----------
  function row(h, e) {
    const file = h.file(e), desc = [...e.y, ...e.g.slice(0, 4)].join(', ');
    return `<tr><td class="sp-rl"><table width="100%" cellspacing="0" cellpadding="1"><tr>
        <td class="sp-ico" rowspan="3"><a href="${h.url.item(e)}"><b>${h.esc((e.t || '?')[0].toUpperCase())}</b>${h.img(e)}</a></td>
        <td class="celltitles"><a href="${h.url.item(e)}">${h.esc(e.t)}</a></td></tr>
        <tr><td class="celltext_description">${h.esc(e.a)}${desc ? ' - ' + h.esc(desc) : ''}</td></tr>
        <tr><td class="celltext">${h.esc(e.y[0] || '')} | ${h.esc(h.siteName(e.s))} | Archived: ${h.esc(h.archivedLabel(e))}</td></tr></table></td>
      <td class="sp-rr"><table width="100%" cellspacing="0" cellpadding="1">
        <tr><td class="celltext" align="right">${e.z ? '<span class="celltext_pick">archived</span> | ' : ''}${file ? `<a href="${h.esc(file)}" target="_blank" rel="noopener">download</a> | ` : ''}<a href="${h.url.item(e)}">details</a>&nbsp;</td></tr>
        <tr><td class="orizdotsbkg"></td></tr>
        <tr><td class="celltext" align="right">${h.esc(longDate(e.d))}&nbsp;</td></tr></table></td></tr>`;
  }
  function pages(h, r, l) {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return `Pages: ${p.prev ? `<a href="${p.prev}">&laquo;</a> ` : ''}${p.items.map(i => i.gap ? '... ' : i.current ? `<b>${i.n}</b> ` : `<a href="${i.url}">${i.n}</a> `).join('')}${p.next ? `<a href="${p.next}">&raquo;</a>` : ''}`;
  }

  THEMES.softpedia = {
    label: 'Download Portal 2006',

    home(ctx) {
      const { h, manifest: m, route: r } = ctx, E = h.esc;
      const types = Object.entries(m.types);
      const box = ([t, n], i, limit) => {
        const apps = m.apps.filter(a => a.types[t]).sort((a, b) => b.types[t] - a.types[t]).slice(0, limit);
        return `<div class="sp-hbox" style="--c:${HOMECOL[i % HOMECOL.length]}">
          <div class="sp-hbh"><a href="${h.url.type(t)}">${E(t)}</a><span class="sp-pill">${n.toLocaleString()}</span><span class="sp-pill">FILES</span></div>
          <div class="sp-hbs celltext"><span>${apps.length} programs</span><a href="${h.url.type(t)}">view all files</a></div>
          <div class="sp-hbb">${apps.map(a => `<div class="sp-he"><i class="sp-hi"></i><a class="sp-ht" href="${h.link({}, { app: a.slug, type: t })}">${E(a.name)} ${E(t)}</a> <span class="sp-hd">| ${a.types[t].toLocaleString()} ${E(t.toLowerCase())} from ${E(a.name)}, ${a.count.toLocaleString()} files in total</span></div>`).join('')}</div></div>`;
      };
      const srcs = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
      const links = [[h.url.app(m.apps[0].slug), m.apps[0].name + ' Files'], [h.url.type(types[0][0]), types[0][0]], [h.url.site(srcs[0][0]), srcs[0][1].name],
        [resetLink(h, r, { arch: '1' }), 'Archived Files'], [h.url.type(types[1][0]), types[1][0]], [resetLink(h, r, { sort: 'old' }), 'Oldest Files'],
        [h.url.request(), 'Submit a File'], [h.url.type(types[2][0]), types[2][0]], [resetLink(h, r, { sort: 'az' }), 'All Files A-Z']];
      const center = `<table class="sp-hwel" cellspacing="0" cellpadding="0"><tr><td class="sp-hh1">Dear visitor, welcome to the archive of customization downloads!</td>
          <td class="sp-hstat">${m.total.toLocaleString()} Items /<br>${m.archived.toLocaleString()} Archived</td></tr></table>
        <table class="sp-hotp" cellspacing="0" cellpadding="0"><tr><td class="sp-hotb" rowspan="3"><span>On this page<i>&#8680;&#8680;&#8680;&#8680;</i></span></td>
          ${[0, 1, 2].map(row => `${row ? '<tr>' : ''}${[0, 1, 2].map(col => { const [u, txt] = links[row + col * 3]; return `<td class="celltext_bigger"><i class="sp-li l${col}"></i><a href="${u}"${u.startsWith('https://github') ? ' target="_blank" rel="noopener"' : ''}>${E(txt)}</a></td>`; }).join('')}</tr>`).join('')}
        </table>
        <div class="sp-hgap">${ad728(ctx)}</div>
        <table class="sp-hcols" cellspacing="0" cellpadding="0"><tr valign="top">
          <td class="sp-hcol">${box(types[0], 0, 40)}</td>
          <td class="sp-hcol">${types.slice(1, 5).map((t, i) => box(t, i + 1, 9)).join('')}</td></tr></table>`;
      const side = `<div class="sp-adbox"></div>${bulletBox(h, "Top sources:", srcs.slice(0, 30).map(([s, i]) => [h.url.site(s), i.name]))}`;
      return page(ctx, center, right(ctx, side));
    },

    list(ctx) {
      const { h, route: r, list: l, about } = ctx, E = h.esc, f = l.facets;
      const name = r.app ? h.appName(r.app) : r.site ? h.siteName(r.site) : r.type ? l.typeName : r.tag ? r.tag : r.q ? `"${r.q}"` : 'All';
      const crumbs = [r.app && [h.url.app(r.app), h.appName(r.app)], r.type && [h.link(r, { tag: '' }), l.typeName], r.site && [h.url.site(r.site), h.siteName(r.site)],
        r.tag && [h.link(r, {}), r.tag], r.q && [h.link(r, {}), 'Search: ' + r.q]].filter(Boolean);
      const pg = pages(h, r, l);
      const center = `${sectionBar(ctx, name + ' downloads:', h.link(r, { tag: '', page: 1 }), f.apps.map(([k, n, c]) => [h.link(r, { app: k, type: '', tag: '' }), `${n} (${c})`]),
          [[h.link(r, { sort: '' }), 'Newest files'], [h.link(r, { sort: 'old' }), 'Oldest files'], [h.link(r, { arch: '1' }), 'Archived files']])}
        ${ad728(ctx)}
        ${about ? `<div class="sp-about celltext_big"><div class="sp-tools celltext"><a href="${E(about.edit)}" target="_blank" rel="noopener">Edit</a> | <a href="${h.link(r, { site: '' })}">Close</a></div>${about.html}</div>` : ''}
        <table class="indexcellbkg_2 sp-box" cellspacing="0" cellpadding="0"><tr><td class="sp-boxin">
          <table width="100%" cellspacing="0" cellpadding="0"><tr><td width="70%"><span class="celltitles_categ"><a href="${h.url.home()}">C:</a>${(crumbs.length ? crumbs : [[h.link(r, {}), name]]).map(([u, t]) => ` \\ <a href="${u}">${E(t)}</a>`).join('')}</span> <span class="celltext">(${l.total.toLocaleString()} files)</span></td>
            <td width="30%" align="right" class="celltext sp-pgs">${pg}</td></tr></table><br>
          ${l.rows.length ? `<table class="sp-rows" cellspacing="0" cellpadding="0">${l.rows.map(e => row(h, e)).join('')}</table>` : '<p class="celltext_big sp-empty">No files found.</p>'}
          <table class="sp-bottom" cellspacing="0" cellpadding="0"><tr><td class="celltext"><a href="#" onclick="scrollTo(0,0);return false">go to top</a></td><td class="celltext" align="right">${pg}</td></tr></table>
          ${f.tags.length ? `<div class="celltext sp-tags"><b>Tags:</b> ${f.tags.slice(0, 40).map(([t]) => `<a href="${h.link(r, { tag: r.tag === t ? '' : t })}">${E(t)}</a>`).join(' | ')}</div>` : ''}
        </td></tr></table>`;
      const side = `${dealBox(ctx)}<div class="right_title_bkg">Category Options:</div>
        <div class="rightcellcontent sp-rbox sp-opts">Show only:<br>${h.archSelect(r)}<br><br>Sort By:<br>${h.sortSelect(r)}</div>
        ${bulletBox(h, 'Programs:', [[h.link(r, { app: '', type: '', tag: '' }), 'All programs'], ...f.apps.map(([k, n, c]) => [h.link(r, { app: k, type: '', tag: '' }), `${n} (${c})`])].slice(0, 30))}
        ${bulletBox(h, 'File types:', f.types.map(([t, n]) => [h.link(r, { type: t, tag: '' }), `${t} (${n})`]))}`;
      return page(ctx, center, right(ctx, side));
    },

    item(ctx) {
      const { h, item: e, manifest: m } = ctx, E = h.esc;
      if (!e) return page(ctx, `<p class="celltext_big sp-empty">Item not found. <a href="${h.url.home()}">Back to the archive</a></p>`, right(ctx, ''));
      const file = h.file(e), a = (u, t) => u ? `<a href="${E(u)}" target="_blank" rel="noopener">${t}</a>` : '';
      const center = `${sectionBar(ctx, e.a + ' downloads:', h.url.app(e.k), m.apps.map(x => [h.url.app(x.slug), x.name]),
          [[h.url.app(e.k), 'More from ' + e.a], [h.url.site(e.s), 'More from ' + h.siteName(e.s)], [h.report(e), 'Report this file']])}
        ${ad728(ctx)}
        <table class="dwldbkg sp-box" cellspacing="0" cellpadding="0"><tr><td class="sp-boxin">
          <table width="100%" cellspacing="0" cellpadding="0"><tr><td class="celltitles_categ_ptitle">${E(e.t)}</td><td align="right" class="celltext">${a(h.report(e), 'Report')}&nbsp;</td></tr></table>
          <table class="sp-itm" cellspacing="0" cellpadding="0"><tr valign="top">
            <td class="sp-itl">${file ? `<a class="sp-dl" href="${E(file)}" target="_blank" rel="noopener"><span>DOWNLOAD</span></a>` : '<span class="sp-dl off"><span>NO FILE</span></span>'}
              <div class="celltext sp-ila">${a(h.edit(e), 'Edit this entry')}<br>${a(h.report(e), 'Report this file')}</div>
              <div class="sp-shot">${h.media(e)}</div></td>
            <td class="sp-itr"><table class="sp-spec" cellspacing="0" cellpadding="0">${h.details(e).map(([k, v], i) => `<tr${i % 2 ? ' class="sp-odd"' : ''}><td class="celltext_n sp-k"><b>${k}:</b></td><td class="celltext_n">${v}</td></tr>`).join('')}</table>
              <table class="sp-actions" cellspacing="0" cellpadding="0"><tr>
                <td class="celltext_big"><i class="sp-li l0"></i>${a(file, 'Download') || 'No file'}</td><td class="celltext_big"><i class="sp-li l1"></i>${a(h.page(e), 'Original page') || 'No page'}</td><td class="celltext_big"><i class="sp-li l2"></i>${a(h.edit(e), 'Edit this entry')}</td><td class="celltext_big"><i class="sp-li l3"></i>${a(h.report(e), 'Report')}</td></tr></table>
              ${e.desc ? `<div class="subtitles sp-dh">${E(e.t)} description</div><div class="celltext_big sp-desc">${e.desc}</div>` : ''}</td></tr></table>
        </td></tr></table>`;
      const side = `<div class="sp-itemside">${bulletBox(h, `More ${e.a}:`, e.y.map(t => [h.link({}, { app: e.k, type: t }), `${e.a} ${t}`]).concat([[h.url.app(e.k), 'All ' + e.a]]))}</div>`;
      return page(ctx, center, right(ctx, side));
    },
  };
  function chunk(a, n) { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }
})();
