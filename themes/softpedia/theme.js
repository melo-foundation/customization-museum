// label: Download Portal 2006
// Softpedia as captured in 2006, rebuilt from the original markup, stylesheet (original.css) and UI images (assets/).
// Only content regions are ours; baked-in labels are redrawn over label-free copies of the original images.
(() => {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const ord = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
  // 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM' -> 'November 7th, 2006' / 'November 7th, 2006 13:39 GMT'
  const longDate = d => { const [date, time] = (d || '').split(' '), [y, m, day] = date.split('-').map(Number); return !y ? '' : (m ? `${MONTHS[m - 1]} ${day ? ord(day) + ', ' : ''}${y}` : String(y)) + (time ? ` ${time} GMT` : ''); };
  // first paragraph of an item's note as plain text
  const summary = n => (n || '').split(/\n\s*\n/)[0].replace(/[*_`#>\[\]]|\(https?:[^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const CIRCLES = ['windows2', 'games2', 'drivers2', 'handheld', 'mac2', 'linux2', 'mobile2', 'news2'];
  const HEADS = [['win', '#FFF9F9', 'wins'], ['mac', '#F4FFF4', 'macs'], ['games', '#FFFAFD', 'gamess'], ['linux', '#F5FCFF', 'linuxs'], ['drivers', '#FFFCF4', 'driverss'], ['mobile', '#F7FBFF', 'mobiles']];
  let A = '';
  const img = (name, w, h, extra = '') => `<img src="${A}${name}" width="${w}" height="${h}" border="0"${extra ? ' ' + extra : ''}>`;
  const reset = (h, r, change) => h.link(r, { app: '', type: '', site: '', tag: '', q: '', arch: '', ...change });
  const ext = u => u && u.startsWith('http') && !u.startsWith(location.origin) ? ' target="_blank" rel="noopener"' : '';

  // ---------- header: two navy tables, exactly as in the original ----------
  function header(ctx) {
    const { h, manifest: m, route: r } = ctx, E = h.esc;
    const nav = [['HOME', h.url.home()], ['SUBMIT ITEM', h.url.request()], ['ARCHIVED', reset(h, r, { arch: '1' })], ['NEWEST', reset(h, r, { sort: '' })],
      ['OLDEST', reset(h, r, { sort: 'old' })], ['A-Z', reset(h, r, { sort: 'az' })], ['SOURCE CODE', 'https://github.com/melo-foundation/customization-museum']];
    const types = Object.keys(m.types);
    const circ = [...types.slice(0, 7).map(t => [t.split(/[ &]/)[0], h.url.type(t)]), ['Newest', reset(h, r, { sort: '' })], ['Oldest', reset(h, r, { sort: 'old' })], ['A-Z', reset(h, r, { sort: 'az' })]].slice(0, 7);
    circ.push(['Archived', reset(h, r, { arch: '1' })]);
    const c = (i, hs) => `<a class="spx-circ" href="${circ[i][1]}">${img(`um_${CIRCLES[i]}_blank.png`, 71, 71, hs ? `hspace="${hs}"` : '')}<span>${E(circ[i][0].toUpperCase())}</span></a>`;
    return `<table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#001F5B"><tr>
        <td rowspan="2" valign="top"><a class="spx-logo" href="${h.url.home()}">CUSTOMIZATION MUSEUM<sup>TM</sup></a><table width="214" border="0" cellspacing="0" cellpadding="0"><tr><td width="26"></td><td align="center" class="update">${m.total.toLocaleString()} files online</td></tr></table></td>
        <td width="700" align="right" height="26">${nav.map(([t, u]) => `<a class="spx-nav" href="${u}"${ext(u)}>${t}</a>`).join('')}</td></tr>
        <tr><td align="right" style="padding-right:14px"><div class="spx-ad468">${h.themePicker()}<span>Old skins, themes and emoticons, backed up on the Wayback Machine</span></div></td></tr></table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#001F5B"><tr>
        <td><table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
          <td width="74" height="85" align="center" valign="top" background="${A}um_l_bkg2.jpg" class="spx-io" style="padding-left:18px; padding-top:19px">${c(0)}</td>
          <td width="447" align="center" valign="top" background="${A}um_bkg2.jpg" class="spx-io" style="padding-left:0px; padding-top:19px">${c(1, 1)}${c(2, 2)}${c(3, 2)}${c(4, 1)}${c(5, 1)}${c(6, 1)}</td>
          <td width="195" height="85" align="left" valign="top" background="${A}um_r_bkg3.jpg" class="spx-io" style="padding-left:2px; padding-top:19px">${c(7, 1)}</td></tr></table></td>
        <td width="86" valign="top" background="${A}menu_08_3.jpg" style="padding-top:55px"><form id="spx-search" data-search role="search" style="margin:0"><input name="q" type="text" class="searchfield" size="11" value="${E(r.q)}"></form></td>
        <td width="157"><table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td class="spx-io"><a class="spx-lbl spx-bm" href="${h.url.home()}">${img('menu_009_2_blank.png', 157, 40)}<span>BOOKMARK THIS SITE</span></a></td></tr>
          <tr><td width="162" class="spx-io"><input type="image" form="spx-search" src="${A}menu_09_2.jpg" width="37" height="64" border="0" alt="Go"><a href="${reset(h, r, {})}">${img('menu_10_2.jpg', 120, 64)}</a></td></tr></table></td>
      </tr></table>`;
  }

  // ---------- section title row, "On this page" row, dotted spacer, 728x90 slot ----------
  function sectionBar(ctx, title, titleUrl, cats, links) {
    const { h, route: r } = ctx, E = h.esc;
    const disc = (v, letter, caption, n, w) => `<a class="spx-dm" href="${h.link(r, { arch: v })}">${img(`d_m_0${n}_blank.png`, w, 35)}<b>${letter}</b><i>${caption}</i></a>`;
    return `<table width="780" border="0" cellspacing="0" cellpadding="0"><tr>
        <td width="190"><div class="sect_title_win" style="width:180px"><a href="${titleUrl}">${E(title).replace(/ downloads:$/, '<br>downloads:')}</a></div></td>
        <td width="108" class="spx-io"><a href="${h.url.home()}">${img('programfinder.gif', 108, 35, 'alt="Program Finder"')}</a></td>
        <td align="right" width="152" class="spx-io">${img('under_nav_separator.gif', 21, 35)}${img('sectcat.gif', 131, 35)}</td>
        <td align="right" width="120"><select class="spx-cat" onchange="if(this.value)location.href=this.value"><option value="">Choose...</option>${cats.map(([u, t]) => `<option value="${E(u)}">${E(t)}</option>`).join('')}</select></td>
        <td align="right" width="205" class="spx-io">${img('under_nav_separator.gif', 21, 35)}${img('d_m_01.gif', 78, 35)}${disc('', 'A', 'all', 2, 31)}${disc('1', 'Y', 'archived', 3, 34)}${disc('0', 'N', 'missing', 4, 36)}</td>
      </tr><tr><td colspan="5"><div class="onthispage" style="clear:both;float:left;width:770px;"><table border="0" width="100%"><tr>
        <td width="153" class="celltext_bigger" valign="top"><img src="${A}ugames_onthispage.gif"></td>
        ${links.map(([u, t], i) => `<td class="celltext_bigger"><img src="${A}${['ugames_news.gif', 'ugames_reviews.gif', 'ugames_latest_additions.gif'][i]}" align="absmiddle"> <a href="${u}"${ext(u)}>${E(t)}</a>&nbsp;&nbsp;</td>`).join('')}
      </tr></table></div></td></tr>
      <tr valign="middle"><td colspan="5" valign="top" class="spx-io">${img('770_dot_spacer.gif', 770, 21)}</td></tr></table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td align="center">${ad728(ctx)}</td></tr></table>`;
  }

  // 728x90 ad unit geometry (Google text unit colours), filled with our notice or archive links
  function ad728(ctx) {
    const { h, manifest: m } = ctx;
    const warn = h.warning();
    if (warn) return `<div class="spx-ad728 spx-adwarn">${warn}</div>`;
    const cell = (u, t, d) => `<td><a class="spx-adt" href="${u}"${ext(u)}>${t}</a><div>${d}</div></td>`;
    return `<table class="spx-ad728" cellspacing="0" cellpadding="0"><tr>
      ${cell(h.link({}, { arch: '1' }), 'Archived files', `${m.archived.toLocaleString()} of ${m.total.toLocaleString()} files are backed up on the Wayback Machine.`)}
      ${cell(h.url.request(), 'Request a site', 'Know an old skin or theme site? Ask for it to be archived.')}
      ${cell(h.url.request(), 'Report a file', 'Files are archived automatically and not checked.')}
      ${cell('https://github.com/melo-foundation/customization-museum', 'Source code', 'Scrapers, archive tools and this site are open source.')}
      </tr><tr><td colspan="4" class="spx-adfoot">Customization Museum notes</td></tr></table>`;
  }

  // ---------- right column ----------
  function right(ctx, boxes) {
    const { h } = ctx;
    return `<div class="spx-io"><a class="spx-lbl spx-rbtn" href="${h.url.request()}"${ext(h.url.request())}>${img('download_basket_blank.png', 150, 40)}<span>Submit a file</span></a>${img('download_basket_bottom.jpg', 150, 9)}<a class="spx-lbl spx-rbtn" href="${h.link({}, { arch: '1' })}">${img('softpedia_reviews_blank.png', 150, 40)}<span>Archived files</span></a></div>
      <table width="150" border="0" cellspacing="0" cellpadding="0"><tr><td height="34" class="right_title_bkg">Welcome! </td></tr>
        <tr><td style="padding-left:6px" class="celltext"> Hello, visitor<br><br> <a href="${h.url.request()}"${ext(h.url.request())}>Request</a> a site if you know a lost one.<br> <br> Otherwise, <a href="${h.url.home()}">browse</a> them all. </td></tr></table>
      <br>${boxes}`;
  }
  const liBox = (h, title, items, pb = 15) => `<table width="150" border="0" cellspacing="0" cellpadding="0"><tr><td height="34" class="right_title_bkg">${h.esc(title)} </td></tr>
    <tr><td style="padding-left:6px; padding-bottom:${pb}px">${items.map(([u, t]) => `<li><a href="${u}" title="${h.esc(t)}">${h.esc(t.length > 20 ? t.slice(0, 20) + '...' : t)}</a></li>`).join('')}</td></tr></table>`;

  function page(ctx, centerAttrs, center, rightCol) {
    const { h } = ctx;
    return `<div align="center"><table width="984" border="0" cellspacing="0" cellpadding="0"><tr><td width="5" bgcolor="#C1CCE1">&nbsp;</td><td align="left" valign="top" bgcolor="#FFFFFF">
      ${header(ctx)}
      <table width="100%" border="0" cellpadding="0" cellspacing="0" class="mainbkg"><tr valign="top"><td ${centerAttrs}>${center}</td>
        <td width="1" bgcolor="#CEDEFE" class="dotbkg"></td><td width="150" class="right_col_back">${rightCol}</td></tr></table>
      <table width="100%" border="0" cellpadding="5" cellspacing="0" class="copyrights"><tr bgcolor="#7A87A1"><td height="2" colspan="2"></td></tr>
        <tr><td width="787" bgcolor="#D7E0F1" style="padding-left:31px"> &copy; Customization Museum. Files are archived automatically and not checked.<br> Names and trademarks belong to their respective owners. </td><td rowspan="2" align="center" bgcolor="#CCD8ED"> </td></tr>
        <tr><td bgcolor="#B3C3E1" style="padding-left:31px"> <a href="${h.url.request()}" target="_blank" rel="noopener" style="color:#AA4545">Report a problem</a> | <a href="${h.url.request()}" target="_blank" rel="noopener">Request a site</a> | <a href="https://github.com/melo-foundation/customization-museum" target="_blank" rel="noopener">Source code</a> | <a href="${h.url.home()}">Archive</a> </td></tr>
        <tr bgcolor="#001F5B"><td height="10" colspan="2"></td></tr></table>
    </td><td width="5" bgcolor="#C1CCE1">&nbsp;</td></tr></table></div>`;
  }

  const icon32 = (h, e) => h.img(e, 'border="0" width="32" height="32" hspace="2" class="spx-ico"') || `<span class="spx-noico">${h.esc((e.t || '?')[0].toUpperCase())}</span>`;
  const pages = (h, r, l) => {
    if (l.pages < 2) return '';
    // up to 15 pages: every number, as the original did; beyond that the core's windowed pager
    if (l.pages <= 15) return `Pages: ${Array.from({ length: l.pages }, (_, i) => i + 1 === l.page ? `<b>${i + 1}</b> ` : `<a href="${h.link(r, { page: i + 1 })}">${i + 1}</a> `).join('')}`;
    const p = h.pager(r, l.pages);
    return `Pages: ${p.prev ? `<a href="${p.prev}">&laquo;</a> ` : ''}${p.items.map(i => i.gap ? '... ' : i.current ? `<b>${i.n}</b> ` : `<a href="${i.url}">${i.n}</a> `).join('')}${p.next ? `<a href="${p.next}">&raquo;</a>` : ''}`;
  };
  function related(ctx, e) {
    const { h } = ctx, E = h.esc, rel = (ctx.related || []).filter(x => x.i !== e.i);
    if (!rel.length) return '';
    const newest = [...rel].sort((a, b) => (b.d || '').localeCompare(a.d || '')).slice(0, 7);
    const oldest = [...rel].filter(x => !newest.includes(x)).sort((a, b) => (a.d || '9').localeCompare(b.d || '9')).slice(0, 7);
    const row = (x, i) => `<tr${i % 2 ? '' : ' bgcolor="EFF3FC"'}><td width="564" style="padding-bottom:5px; padding-top:5px"><table width="100%" border="0" cellspacing="0" cellpadding="1">
        <tr><td width="32" height="26" rowspan="3" align="center" valign="top" class="celltitles" style="padding-right:2px"><a href="${h.url.item(x)}" title="${E(x.t)}">${icon32(h, x)}</a></td><td class="celltitles spx-q"><a href="${h.url.item(x)}" title="${E(x.t)}">${E(x.t)}</a></td></tr>
        <tr><td class="celltext_description">${x.n ? E(summary(x.n)) : `${E(x.a)} - ${E(x.y.join(', '))}`}</td></tr>
        <tr><td class="celltext">${E(x.y[0] || '')} | ${E(h.siteName(x.s))}</td></tr></table></td>
      <td width="170" style="padding-bottom:5px; padding-top:5px"><table width="100%" border="0" cellspacing="0" cellpadding="1">
        <tr><td align="right" class="celltext"><a href="${h.url.item(x)}">details</a></td></tr>
        <tr><td class="orizdotsbkg spx-io">${img('oriz_dots.gif', 4, 1, 'vspace="5"')}</td></tr>
        <tr><td align="right" class="celltext">${x.z ? '<span class="celltext_pick">archived</span>' : '<span class="celltext_update">not archived</span>'}</td></tr></table></td></tr>`;
    const box = (title, rows, last) => `<table width="770" border="0" cellpadding="0" cellspacing="0" class="indexcellbkg_2"><tr><td valign="top" style="padding-left:15px; padding-top:15px">
        <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="70%" class="spx-q"><span class="celltitles_categ">${title} ( <a href="${h.url.app(e.k)}">${E(e.a)}</a> ) </span> </td><td width="30%" align="right" class="celltext" style="padding-right:8px">&nbsp;</td></tr></table>
        <span class="celltitles"><br></span><table width="754" border="0" cellspacing="0" cellpadding="5">${rows.map(row).join('')}
        ${last ? `<tr><td colspan="2"><hr size="1"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr class="celltext"><td width="30%" style="padding-left:40px"><a href="#" onclick="scrollTo(0,0);return false">go to top</a> </td><td width="70%" align="right" style="padding-right:3px">&nbsp;</td></tr></table></td></tr>` : ''}</table></td></tr></table>`;
    return box('NEWEST DOWNLOADS FROM THIS PROGRAM', newest, !oldest.length) + (oldest.length ? '<br><br>' + box('OLDEST DOWNLOADS FROM THIS PROGRAM', oldest, true) : '') + '<br><br><br>';
  }
  const setBase = h => { A = h.url.home() + 'themes/softpedia/assets/'; };

  THEMES.softpedia = {
    label: 'Download Portal 2006',
    perPage: 30,

    home(ctx) {
      const { h, manifest: m, route: r } = ctx, E = h.esc;
      setBase(h);
      const types = Object.entries(m.types), srcs = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
      const L = [[h.url.app(m.apps[0].slug), m.apps[0].name + ' Files', 'wins.gif'], [h.url.type(types[0][0]), types[0][0], 'gamess.gif'], [h.url.site(srcs[0][0]), srcs[0][1].name, 'macs.gif'],
        [reset(h, r, { arch: '1' }), 'Archived Files', 'linuxs.gif'], [h.url.type(types[1][0]), types[1][0], 'driverss.gif'], [reset(h, r, { sort: 'old' }), 'Oldest Files', 'mobiles.gif'],
        [h.url.request(), 'Submit a File', 'newss.gif'], [h.url.type(types[2][0]), types[2][0], 'cats.gif'], [reset(h, r, { sort: 'az' }), 'All Files A-Z', 'tops.gif']];
      const link = ([u, t, ic], last) => `<td class="celltext_bigger"><img src="${A}${ic}" align="absmiddle"> <a href="${u}"${ext(u)}>${E(t)}</a>${last ? '' : '&nbsp;&nbsp;'}</td>`;
      const box = ([t, n], i, limit) => {
        const [cls, bg, ic] = HEADS[i % HEADS.length];
        const apps = m.apps.filter(a => a.types[t]).sort((a, b) => b.types[t] - a.types[t]).slice(0, limit);
        return `<table height="100%" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td class="${cls}_heading" style="padding-bottom:5px">
            <div class="mi_heading"><a href="${h.url.type(t)}">${E(t)}</a></div>
            <span class="rssklipbtn"><span class="spx-count">${n.toLocaleString()}</span></span>
            <span class="mi_subheading_l">${apps.length} programs</span>
            <span class="mi_subheading_r"><a href="${h.url.type(t)}">view all files</a></span></td></tr>
          <tr><td bgcolor="${bg}"><table width="100%" cellspacing="0" cellpadding="0" border="0">
            ${apps.map(a => `<tr><td style="padding:5px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="celltext"> <img src="${A}${ic}.gif" align="absmiddle" style="margin-right:7px"> <span class="celltitles"><a href="${h.link({}, { app: a.slug, type: t })}" style="font-size:12px">${E(a.name)}</a></span> | ${a.types[t].toLocaleString()} ${E(t.toLowerCase())}, ${a.count.toLocaleString()} files in total </td></tr></table></td></tr>`).join('')}
          </table></td></tr></table>`;
      };
      const center = `<table width="790" border="0" cellspacing="0" cellpadding="0"><tr valign="middle"><td style="padding-bottom:15px" valign="middle" class="celltext_bigger">
          <h1 class="welcome_hdr" style="float:left;width:450px;">Dear visitor, welcome to the archive of customization downloads!</h1>
          <h2 class="dwlc_hdr" style="float:right;width:190px;">${m.total.toLocaleString()} Items / ${m.archived.toLocaleString()} Archived</h2>
          <div class="onthispage" style="clear:both;float:left;width:780px;"><table border="0" width="100%">
            <tr><td rowspan="3" class="celltext_bigger" width="120" valign="top"><img src="${A}onthispage.gif"></td>${link(L[0])}${link(L[1])}${link(L[2])}</tr>
            <tr>${link(L[3])}${link(L[4])}${link(L[5])}</tr><tr>${link(L[6])}${link(L[7])}${link(L[8], 1)}</tr></table></div></td></tr></table>
        <table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td align="center">${ad728(ctx)}</td></tr></table>
        <br> &nbsp;<table width="780" border="0" cellspacing="0" cellpadding="0"><tr>
          <td width="380" valign="top">${box(types[0], 0, 52)}</td><td width="20"></td>
          <td width="380" valign="top">${types.slice(1, 6).map((t, i) => box(t, i + 1, 14) + '<br>').join('')}</td></tr></table><br><br>`;
      const side = `<div id="first_ad_unit"></div><hr size="1" noshade style="color:#BECEEE"><div align="center" class="spx-ad120" style="margin-left: 15px; border: 1px solid #FFFFFF;width: 120px; height:90px"><b>${Math.round(100 * m.archived / m.total)}%</b><span>of the archive is<br>backed up</span></div><br>
        <table width="150" border="0" cellspacing="0" cellpadding="0"><tr><td height="34" class="right_title_bkg">Largest collection: </td></tr>
          <tr><td class="rightcellcontent" style="padding-bottom:5px"><a href="${h.url.app(m.apps[0].slug)}">${E(m.apps[0].name)}</a><br><br>
            <a class="spx-pick" href="${h.url.app(m.apps[0].slug)}"><b>${m.apps[0].count.toLocaleString()}</b><span>files</span>${Object.entries(m.apps[0].types).slice(0, 4).map(([t, n]) => `<i>${E(t)}: ${n.toLocaleString()}</i>`).join('')}</a><br>
            ${E(m.apps[0].name)} has the most files in the archive, across ${Object.keys(m.apps[0].types).length} file types.</td></tr></table><br>
        ${liBox(h, 'Top sources:', srcs.slice(0, 30).map(([s, i]) => [h.url.site(s), i.name]))}`;
      return page(ctx, 'width="795" style="padding-left:25px"', center, right(ctx, side));
    },

    list(ctx) {
      const { h, route: r, list: l, about } = ctx, E = h.esc, f = l.facets;
      setBase(h);
      const name = r.app ? h.appName(r.app) : r.site ? h.siteName(r.site) : r.type ? l.typeName : r.tag ? r.tag : r.q ? `"${r.q}"` : 'All';
      const crumbs = [r.app && [h.url.app(r.app), h.appName(r.app)], r.type && [h.link(r, { tag: '' }), l.typeName], r.site && [h.url.site(r.site), h.siteName(r.site)], r.tag && [h.link(r, {}), r.tag], r.q && [h.link(r, {}), 'Search: ' + r.q]].filter(Boolean);
      const pg = pages(h, r, l);
      const row = (e, i) => {
        const file = h.file(e), desc = [...e.y, ...e.g.slice(0, 4)].join(', ');
        return `<tr${i % 2 ? '' : ' bgcolor="#EFF3FC"'}><td width="564" style="padding-bottom:5px; padding-top:5px"><table width="100%" border="0" cellspacing="0" cellpadding="1">
          <tr><td width="32" height="26" rowspan="3" align="center" valign="top" class="celltitles" style="padding-right:2px"><a href="${h.url.item(e)}" title="${E(e.t)}">${icon32(h, e)}</a></td><td class="celltitles spx-q"><a href="${h.url.item(e)}" title="${E(e.t)}">${E(e.t)}</a></td></tr>
          <tr><td class="celltext_description">${e.n ? E(summary(e.n)) : `${E(e.a)}${desc ? ' - ' + E(desc) : ''}`}</td></tr>
          <tr><td class="celltext">${E(e.y[0] || '')} | ${E(h.siteName(e.s))} | Archived: ${E(h.archivedLabel(e))}</td></tr></table></td>
          <td width="200" style="padding-bottom:5px; padding-top:5px"><table width="100%" border="0" cellspacing="0" cellpadding="1">
          <tr><td align="right" class="celltext">${e.z ? '<span class="celltext_pick">archived</span> | ' : ''}${file ? `<a href="${E(file)}" target="_blank" rel="noopener">download</a> | ` : ''}<a href="${h.url.item(e)}">details</a>&nbsp;</td></tr>
          <tr><td class="orizdotsbkg spx-io">${img('oriz_dots.gif', 4, 1, 'vspace="5"')}</td></tr>
          <tr><td align="right" class="celltext">${E(longDate(e.d))}&nbsp;</td></tr></table></td></tr>`;
      };
      const center = `${sectionBar(ctx, name + ' downloads:', h.link(r, { tag: '' }), f.apps.map(([k, n, c]) => [h.link(r, { app: k, type: '', tag: '' }), `${n} (${c})`]),
          [[h.link(r, { sort: '' }), 'Newest files'], [h.link(r, { sort: 'old' }), 'Oldest files'], [h.link(r, { arch: '1' }), 'Archived files']])}
        ${about ? `<table width="770" class="spx-about"><tr><td class="celltext_big"><div class="celltext" style="float:right"><a href="${E(about.edit)}" target="_blank" rel="noopener">Edit</a> | <a href="${h.link(r, { site: '' })}">Close</a></div>${about.html}</td></tr></table>` : ''}
        <br><table width="770" border="0" cellpadding="0" cellspacing="0" class="indexcellbkg"><tr><td valign="top" class="indexcellbkg_2" style="padding-left:15px; padding-top:15px">
          <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="70%" class="spx-q"><span class="celltitles_categ"><a href="${h.url.home()}">C:</a>${(crumbs.length ? crumbs : [[h.link(r, {}), name]]).map(([u, t]) => ` \\ <a href="${u}">${E(t)}</a>`).join('')}</span></td>
            <td width="30%" align="right" class="celltext" style="padding-right:8px">${pg}</td></tr></table><br>
          <table width="754" border="0" cellspacing="0" cellpadding="0">${l.rows.length ? l.rows.map((e, i) => row(e, i) + (i === 14 && l.rows.length > 15 ? '<tr><td colspan="2" align="center"><br> <br><br> </td></tr>' : '')).join('') : '<tr><td class="celltext_big" style="padding:20px">No files found.</td></tr>'}</table>
          <hr size="1"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="70%" class="celltext"><a href="#" onclick="scrollTo(0,0);return false">go to top</a></td><td width="30%" align="right" class="celltext" style="padding-right:8px">${pg}</td></tr></table>
          ${f.tags.length ? `<br><div class="celltext" style="width:740px;line-height:16px"><b>Tags:</b> ${f.tags.slice(0, 40).map(([t]) => `<a href="${h.link(r, { tag: r.tag === t ? '' : t })}">${E(t)}</a>`).join(' | ')}</div>` : ''}<br><br></td></tr></table>`;
      const opts = `<form class="spx-opts" onsubmit="location.href='${h.link(r, {})}';return false"><table width="150" border="0" cellspacing="0" cellpadding="0"><tr><td height="34" class="right_title_bkg">Category Options:</td></tr>
        <tr><td style="padding-left:6px; padding-bottom:5px" class="celltext"> Show only:<br> ${h.archSelect(r).replace('<select', '<select class="searchdrop" style="width:140px"')} <br><br> Sort By:<br> ${h.sortSelect(r).replace('<select', '<select class="searchdrop" style="width:140px"')} <br><br>
          <input type="checkbox"${r.arch === '1' ? ' checked' : ''} onchange="location.href=this.checked?'${h.link(r, { arch: '1' })}':'${h.link(r, { arch: '' })}'"> Only archived files <br><br> <input type="submit" class="general_button" value="Continue"> </td></tr></table></form>`;
      const side = `${opts}${liBox(h, 'Main categories:', ctx.manifest.apps.slice(0, 20).map(x => [h.url.app(x.slug), x.name]), 5)}<br>
        ${liBox(h, 'File types:', f.types.slice(0, 30).map(([t]) => [h.link(r, { type: t, tag: "" }), t]))}`;
      return page(ctx, 'width="822" align="center"', center, right(ctx, side));
    },

    item(ctx) {
      const { h, item: e, manifest: m } = ctx, E = h.esc;
      setBase(h);
      if (!e) return page(ctx, 'width="822" align="center"', `<p class="celltext_big" style="padding:40px">Item not found. <a href="${h.url.home()}">Back to the archive</a></p>`, right(ctx, ''));
      const file = h.file(e), pg = h.page(e), a = (u, t) => u ? `<a href="${E(u)}"${ext(u)}>${t}</a>` : t;
      const shot = h.img(e, 'width="160" height="110" border="0" style="border:1px solid #9AACD1;object-fit:contain;background:#EFF3FC;box-sizing:border-box"') || '<div class="spx-noshot">No preview</div>';
      const more = m.apps.find(x => x.slug === e.k);
      const center = `${sectionBar(ctx, e.a + ' downloads:', h.url.app(e.k), m.apps.map(x => [h.url.app(x.slug), x.name]),
          [[h.url.app(e.k), 'More from ' + e.a], [h.url.site(e.s), 'More from ' + h.siteName(e.s)], [h.report(e), 'Report this file']])}
        <br><table width="770" border="0" cellpadding="0" cellspacing="0" class="dwldbkg"><tr><td valign="top" style="padding-left:15px; padding-top:15px">
          <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td class="celltext"><b><font size="4">${E(e.t)}</font></b></td>
            <td class="celltext" align="right"><img src="${A}spy.gif" width="15" height="17" hspace="2" align="absmiddle"> ${a(h.report(e), 'Report this file')}&nbsp;</td></tr></table>
          <br class="celltitles"><table width="754" height="200" border="0" cellpadding="3" cellspacing="2"><tr valign="top">
            <td width="220" style="padding-bottom:5px; padding-top:2px">${file ? a(file, img('bwin_dwld.gif', 64, 66, `alt="Download ${E(e.t)}" hspace="8"`)) : img('bwin_dwld.gif', 64, 66, 'hspace="8" style="opacity:.35"')}
              <table width="200" border="0" cellspacing="0" cellpadding="0">
                <tr><td colspan="2" class="celltext"><img src="${A}add_to_dwld_basket.gif" width="22" height="21" hspace="2" align="absmiddle"> ${a(h.edit(e), 'Edit this entry')}<br>
                  <img src="${A}version_update.gif" width="21" height="22" hspace="2" align="absmiddle"> ${a(h.report(e), 'Report this file')}<br></td></tr>
                <tr><td colspan="2" class="dotsdwld spx-io">${img('dots_dwld.gif', 3, 3, 'vspace="5"')}</td></tr>
                <tr><td colspan="2" align="center"><table width="160" border="0" cellspacing="0" cellpadding="0"><tr><td height="110" bgcolor="EFF3FC">${a(e.v ? h.thumb(e) : '', shot)}</td></tr><tr><td height="1"></td></tr>
                  <tr><td height="23" align="center" bgcolor="EFF3FC" class="celltext"><table border="0" cellspacing="0" cellpadding="0"><tr><td>${img('tb_scope.gif', 20, 19)}</td><td>${a(pg, 'View original page')}</td></tr></table></td></tr><tr><td height="1" bgcolor="CCD5E8"></td></tr></table></td></tr>
                <tr><td colspan="2" class="dotsdwld spx-io">${img('dots_dwld.gif', 3, 3, 'vspace="5"')}</td></tr>
                <tr><td colspan="2" height="20" class="celltext"><b>Archived:</b> ${E(h.archivedLabel(e))}<br><b>Source:</b> ${E(h.siteName(e.s))}</td></tr>
                <tr><td colspan="2" class="dotsdwld spx-io">${img('dots_dwld.gif', 3, 3, 'vspace="5"')}</td></tr>
                <tr><td colspan="2" height="21" class="celltext" valign="top"><b>Type:</b> ${e.y.map(t => `<a href="${h.url.type(t)}">${E(t)}</a>`).join(', ')}</td></tr>
                <tr><td colspan="2" class="dotsdwld spx-io">${img('dots_dwld.gif', 3, 3, 'vspace="5"')}</td></tr>
                <tr><td colspan="2"><a class="spx-badge${e.z ? '' : ' spx-badge-no'}" href="${E(file || pg || h.url.app(e.k))}"${ext(file || pg)}><b>${e.z ? 'ARCHIVED' : 'NOT YET ARCHIVED'}</b><span>${E(h.archivedLabel(e))}</span><i>Wayback Machine</i></a></td></tr>
                <tr><td style="padding-bottom:10px" colspan="2" width="100%" valign="top"></td></tr>
                <tr><td colspan="2" width="100%" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td height="20" bgcolor="#EFF3FC" class="celltitles" style="padding-left:5px"><img src="${A}news.gif" align="absmiddle"> <a style="text-decoration:none" href="${h.url.app(e.k)}">More ${E(e.a)}</a></td><td height="20" bgcolor="#EFF3FC" class="celltitles"></td></tr>
                  <tr><td colspan="2" class="orizdotsbkg spx-io">${img('oriz_dots.gif', 2, 1, 'vspace="5"')}</td></tr>
                  ${e.y.concat(more ? Object.keys(more.types).filter(t => !e.y.includes(t)) : []).slice(0, 7).map(t => `<tr><td colspan="2" height="20" class="celltext" style="padding-left:5px">- <a href="${h.link({}, { app: e.k, type: t })}">${E(e.a + ' ' + t)}</a></td></tr>`).join('')}</table><br></td></tr></table></td>
            <td width="534"><table width="100%" border="0" cellspacing="0" cellpadding="0">${h.details(e).map(([k, v], i) => `<tr${i % 2 ? ' bgcolor="EFF3FC"' : ''}><td width="30%" height="22" class="celltext">&nbsp;<b>${k}:</b></td><td width="70%" height="22" class="celltext">${v}</td></tr>`).join('')}</table>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:7px"><tr bgcolor="EFF3FC" height="28">
                <td valign="center" class="celltext">&nbsp;<img src="${A}read2.gif" align="top" hspace="2">${a(file, 'Download file')}</td>
                <td valign="center" class="celltext"><img src="${A}review2.gif" align="top" hspace="2">${a(pg, 'Original page')}</td>
                <td valign="center" class="celltext"><img src="${A}refer2.gif" align="top" hspace="2">${a(h.edit(e), 'Edit this entry')}</td>
                <td valign="center" class="celltext"><img src="${A}subscribe.gif" align="top" hspace="2">${a(h.report(e), 'Report')}</td></tr></table>
              <br><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td height="20" valign="top" class="celltitles" align="left">${E(e.t)} description</td>
                <td class="celltext" align="right"><img src="${A}download_small.gif" align="top" hspace="2">${a(file, 'Download')}</td></tr>
                <tr><td class="orizdotsbkg spx-io" colspan="2">${img('oriz_dots.gif', 2, 1, 'vspace="5"')}</td></tr>
                <tr><td valign="top" class="celltext_big" colspan="2"><span id="intelliTxt"><div align="justify"><div style="margin:0px 0px 5px 5px; float:right; width:100px;border:1px solid #CCCCCC;">${a(e.v ? h.thumb(e) : '', h.img(e, 'width="100" height="54" border="0" class="spx-ico"') || '<span class="spx-noshot" style="display:block;width:100px;height:54px;line-height:54px"></span>')}<br><div class="ed_box">${a(pg, 'Click to view the original page for ' + E(e.t))}</div></div>${(e.desc || '').replace(/<p>(<b>[^<]*<\/b>)<\/p>\s*<p>(?!<b>[^<]*<\/b><\/p>)/g, '<p>$1<br>').replace(/<\/p>\s*<p>/g, '<br><br>').replace(/<\/?p>/g, '') || `${E(e.t)} is a ${E((e.y[0] || 'customization').toLowerCase())} item for ${E(e.a)}, recovered from ${E(h.siteName(e.s))}.`}</div></span></td></tr></table>
              <br><table style="border:1px solid #D8E2FA" width="100%" border="0" cellspacing="0" cellpadding="5"><tr><td class="celltext">${E(e.t)} was archived automatically and has <b style="color:blue">NOT been checked</b>, which means it may contain malware, including but not limited to: spyware, viruses, trojans and backdoors.<br><br>Scan anything you download from this archive before opening it. If this file is broken, wrong or harmful, report it with the link below and it will be reviewed and removed from the listing if needed.</td></tr></table><br>
              <div class="celltext_big"></div><table bgcolor="#EFF3FC" width="100%" border="0" cellspacing="0" cellpadding="5">
                <tr><td valign="center" align="left" class="celltext"><img src="${A}download2.gif" align="top" hspace="2">${a(file, `<b style="font-size:11px">${E(e.t)} Download</b>`)}</td></tr>
                <tr><td valign="center" align="left" class="celltext"><img src="${A}screenshot2.gif" align="top" hspace="2">${a(pg, `<b style="font-size:11px">${E(e.t)} Original Page</b>`)}</td></tr>
                <tr><td valign="center" align="left" class="celltext"><img src="${A}find.gif" align="top" hspace="2">${a(h.url.app(e.k), '<b style="font-size:11px">Find Related Downloads</b>')}</td></tr>
                <tr><td valign="center" align="left" class="celltext"><img src="${A}version_update.gif" width="24" height="24" align="top" hspace="2">${a(h.report(e), '<b style="font-size:11px">Report this file</b>')}</td></tr></table></td>
          </tr></table><br><br></td></tr></table>${related(ctx, e)}`;
      const side = liBox(h, 'Main categories:', m.apps.slice(0, 20).map(x => [h.url.app(x.slug), x.name]), 5) + '<br>' +
        liBox(h, 'File types:', Object.keys(m.types).slice(0, 30).map(t => [h.url.type(t), t]));
      return page(ctx, 'width="822" align="center"', center, right(ctx, side));
    },
  };
})();
