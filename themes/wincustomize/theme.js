// label: WinCustomize 2003
// Original WinCustomize "GreenApple" markup (front page 2003-03-15, library listing 2003-09-11),
// with the site's own CSS and UI images from themes/wincustomize/assets/. Only content regions are ours;
// the logo image is replaced by our name in the same 189x75 box.
(() => {
  const A = 'themes/wincustomize/assets/';
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const today = () => { const d = new Date(); return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
  const blank = `<img src="${A}blank.gif" border="0" width="1" height="1">`;

  // original 16px library icons, chosen by item type / program
  const TYPE_ICON = {
    'Skins & Themes': 'windowblinds', 'Icons': 'iconpackager', 'Backgrounds': 'wallpapers', 'Display Pictures': 'graphics',
    'Emoticons': 'graphics', 'Sounds': 'coolplayer', 'Visualizations': 'winmedia', 'Scripts & Plugins': 'desktopx',
    'Cursors': 'cursorxp', 'Splash Screens': 'logon', 'Message Styles': 'conv', 'Winks': 'objectdock', 'Other': 'nextstart',
  };
  const APP_ICON = { 'Windows Media Player': 'winmedia', 'Winamp': 'winamp', 'CursorXP': 'cursorxp', 'Windows Desktop Themes': 'wallpapers', 'Windows XP': 'windowblinds' };
  const icon = (key) => `${A}16-${key}-icon.gif`;
  const typeIcon = t => icon(TYPE_ICON[t] || 'nextstart');
  const appIcon = a => icon(APP_ICON[a.name] || TYPE_ICON[Object.keys(a.types || {})[0]] || 'nextstart');
  const rowIcon = e => icon(APP_ICON[e.a] || TYPE_ICON[e.y[0]] || 'nextstart');

  // frame_*.gif box exactly as the original (width "170" for side columns, "100%" in the center)
  const frame = (title, body, { width = '170', bg = '#ffffff', titleCells = null } = {}) => `<table width="${width}" border="0" align="center" cellpadding="0" cellspacing="0">
<tr>
<td width="1" height="1"><img src="${A}frame_corner1.gif" border="0"></td>
<td height="1" background="${A}frame_top.gif">
<table width="100%" height="1" border="0" cellpadding="0" cellspacing="0" align="center">
<tr>
<td align="left" height="1"><img src="${A}frame_vent.gif" border="0"></td>
<td align="right" width="1" height="1"><img src="${A}frame_title_left.gif" border="0"></td>
${titleCells || `<td align="center" height="1" background="${A}frame_title.gif" class="frametitle">${title}</td>`}
<td align="left" width="1" height="1"><img src="${A}frame_title_right.gif" border="0"></td>
<td align="right" height="1"><img src="${A}frame_vent.gif" border="0"></td>
</tr>
</table>
</td>
<td width="1" height="1"><img src="${A}frame_corner2.gif" border="0"></td>
</tr>
<tr>
<td width="1" background="${A}frame_left.gif">${blank}</td>
<td bgcolor="${bg}" align="center">${body}</td>
<td width="1" background="${A}frame_right.gif">${blank}</td>
</tr>
<tr>
<td width="1" height="1"><img src="${A}frame_corner3.gif" border="0"></td>
<td height="1" background="${A}frame_bottom.gif">${blank}</td>
<td width="1" height="1"><img src="${A}frame_corner4.gif" border="0"></td>
</tr>
</table>
<font size="1"><br></font>`;

  const header = (ctx) => {
    const { h, manifest: m } = ctx;
    const ad = h.warning() || `<div class="cm-adstats"><b>${m.total.toLocaleString()}</b> skins, themes and add-ons &nbsp;-&nbsp; <b>${m.archived.toLocaleString()}</b> on the Wayback Machine</div>`;
    return `<table width="100%" align="center" border="0" cellpadding="0" cellspacing="0">
<tr>
<td height="1" bgcolor="#007236" align="left" valign="top"><a href="${h.url.home()}" class="cm-logo"><span>Customization</span><span>Museum</span></a></td>
<td height="1" bgcolor="#007236" align="right" class="content"><div class="cm-ad">${ad}</div></td>
</tr>
</table>
<form id="cm-hsearch" data-search></form>
<table height="1" border="0" align="center" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td align="left" width="1" background="${A}topbarleft_bg.gif"><img src="${A}topbarleft_1.gif" border="0"></td>
<td align="left" class="topbar" background="${A}topbarleft_bg.gif"><nobr><a class="topbar" href="${h.url.home()}">Customization Museum</a>&nbsp;&nbsp;&nbsp;${today()}</nobr></td>
<td align="left" width="1" background="${A}topbarleft_bg.gif"><img src="${A}topbarleft_2.gif" border="0"></td>
<td align="right" width="100%" class="topbar" background="${A}topbarmid_bg.gif">&nbsp;</td>
<td align="right" width="1" background="${A}topbarright_bg.gif"><img src="${A}topbarright_1.gif" border="0"></td>
<td align="right" class="topbarright" background="${A}topbarright_bg.gif"><b>Theme:</b>&nbsp;</td>
<td align="right" background="${A}topbarright_bg.gif">${h.themePicker()}</td>
<td align="right" class="topbarright" background="${A}topbarright_bg.gif">&nbsp;&nbsp;&nbsp;&nbsp;<b>Search:</b>&nbsp;</td>
<td align="right" background="${A}topbarright_bg.gif"><input type="text" name="q" size="10" maxlength="150" form="cm-hsearch"></td>
<td align="right" width="2" class="topbarright" background="${A}topbarright_bg.gif">&nbsp;</td>
<td align="right" background="${A}topbarright_bg.gif"><input type="submit" value="GO" form="cm-hsearch"></td>
<td align="right" width="1" background="${A}topbarright_bg.gif"><img src="${A}topbarright_2.gif" border="0"></td>
</tr>
</table>
<table width="100%" border="0" align="center" cellpadding="0" cellspacing="5">
<tr>
<td align="center" class="toplinks">
<b>
&nbsp;<a class="toplinks" href="${h.url.home()}">Home</a>
&nbsp;-&nbsp;<a class="toplinks" href="${h.link({}, { arch: '1' })}">Archived</a>
&nbsp;-&nbsp;<a class="toplinks" href="${h.url.request()}" target="_blank" rel="noopener">Request</a>
&nbsp;-&nbsp;<a class="toplinks" href="${h.link({}, { sort: 'az' })}">A-Z</a>
</b>
</td>
</tr>
</table>`;
  };

  const page = (ctx, left, center, right) => `${header(ctx)}
<table width="100%" border="0" align="CENTER" cellpadding="0" cellspacing="5">
<tr>
<td align="RIGHT" valign="TOP" width="170">${left}</td>
<td align="RIGHT" valign="TOP" width="100%">${center}</td>
<td align="RIGHT" valign="TOP" width="170">${right}</td>
</tr></table>
<br><br>
<center></center>`;

  // ---- side boxes ----
  const library = (ctx, r = {}) => {
    const { h, manifest: m } = ctx;
    const rows = m.apps.slice(0, 22).map(a => `<tr>
<td class="columns" valign="bottom"><img src="${appIcon(a)}" border="0" align="absmiddle"></td>
<td class="columns" valign="bottom" width="100%"><a class="columns" href="${h.url.app(a.slug)}">${a.slug === r.app ? `<u>${h.esc(a.name)}</u>` : h.esc(a.name)}</a></td>
<td class="columns" valign="bottom" align="right">[${a.count}]</td>
</tr>`).join('');
    return frame(`<a class="frametitle" href="${h.url.home()}">Library</a>`, `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">${rows}
<tr>
<td class="columns" valign="bottom" align="center" colspan="3"><a class="columns" href="${h.url.home()}">[more...]</a></td>
</tr>
</table>`);
  };
  const resources = (ctx) => {
    const { h, manifest: m } = ctx;
    const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).slice(0, 4);
    return frame('Resources', `<table width="100%" border="0" valign="top" align="center" cellpadding="0" cellspacing="3">
<tr>
<td valign="bottom" class="column">
${sites.map(([s, i]) => `<a class="columns" href="${h.url.site(s)}">${h.esc(i.name)}</a><br>`).join('\n')}
</td>
</tr>
</table>`);
  };
  const options = (ctx) => {
    const { h } = ctx;
    const items = [['logon.gif', h.url.request(), 'Request an item'], ['logon.gif', h.link({}, { arch: '1' }), 'Archived items'],
      ['news.gif', h.link({}, { sort: '' }), 'Newest items'], ['featured.gif', h.link({}, { sort: 'old' }), 'Oldest items'], ['about.gif', h.link({}, { sort: 'az' }), 'A to Z']];
    return frame('Options', `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">
${items.map(([img, href, label]) => `<tr>
<td valign="bottom" class="columns"><img src="${A}${img}" border="0" align="absmiddle"></td>
<td width="100%" valign="bottom" class="columns"><a class="columns" href="${href}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${label}</a></td>
</tr>`).join('')}
</table>`);
  };
  // original poll markup; question = museum, answers = item types, bars = share of all items
  const poll = (ctx) => {
    const { h, manifest: m } = ctx;
    const box = (inner, bold) => `<table border="0" width="100%" align="left" cellpadding="1" cellspacing="0"><tr><td align="center" bgcolor="#AAAAAA">
<table border="0" align="center" cellpadding="1" cellspacing="0" bgcolor="#ffffff" width="100%">
<tr><td width="100%" align="left" bgcolor="#ffffff" class="contents"><div align="left" style="width: 145px; overflow: hidden${bold ? '; font-weight: bold' : ''}">
${inner}
</div></td></tr></table></td></tr></table>`;
    const bar = n => `<table border="0" width="100%" align="left" cellpadding="1" cellspacing="0">
<tr><td width="100%" align="left" bgcolor="#AAAAAA">
<table width="${(100 * n / m.total).toFixed(4)}%" border="0" align="left" cellpadding="1" cellspacing="0" bgcolor="#A95B2B">
<tr><td align="left">
<table width="100%" border="0" align="left" cellpadding="0" cellspacing="0" bgcolor="#D9AE87">
<tr><td align="left"><img src="${A}blank.gif" border="0" width="0" height="1"></td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>`;
    const answers = Object.entries(m.types).slice(0, 4).map(([t, n], i) => `<tr><td valign="top" align="center">
${box(`${i + 1}- <a class="contents" href="${h.url.type(t)}">${h.esc(t)}</a>`)}
</td></tr>
<tr><td valign="top" align="center">
${bar(n)}
</td></tr>`).join('');
    return frame('Poll', `<table border="0" width="100%" align="center" cellpadding="0" cellspacing="5">
<tr>
<td valign="top" width="100%">
<table border="0" width="100%" align="center" cellpadding="2" cellspacing="0">
<tr>
<td valign="top">
${box('What is in the museum?', true)}
</td>
</tr>
<tr>
<td valign="top" align="center" class="columns">${m.total} items</td>
</tr>
${answers}
</table>
</td>
</tr>
</table>`);
  };
  const dailyShot = (ctx) => {
    const { h, manifest: m } = ctx;
    return frame(`<a class="frametitle" href="${h.link({}, { arch: '1' })}">Daily Shot</a>`, `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">
<tr><td align="center" class="columns"><a href="${h.link({}, { arch: '1' })}"><img src="${A}32-sb-icon.gif" border="0"></a><br><a class="columns" href="${h.link({}, { arch: '1' })}">${m.archived} of ${m.total} items archived</a></td></tr>
</table>`);
  };
  const goodies = (ctx) => {
    const { h, manifest: m } = ctx;
    return frame('Museum&nbsp;Goodies', `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">
<tr><td align="center" class="columns">
<br>${m.total} items<br>${m.apps.length} programs<br><br>
</td></tr>
</table>
<table width="100%" height="34" align="CENTER" border="0" cellpadding="0" cellspacing="0" background="${A}bg_bottom.gif">
<tr>
<td align="center" valign="middle" class="search" height="34"><a class="search" href="${h.url.request()}" target="_blank" rel="noopener">REQUEST</a></td>
</tr>
</table>`);
  };
  const iconList = (title, rows) => frame(title, `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">
${rows.map(([img, href, label]) => `<tr>
<td class="columns" valign="bottom"><img src="${img}" border="0" align="absmiddle"></td>
<td class="columns" valign="bottom" width="100%"><a class="columns" href="${href}">${label}</a></td>
</tr>`).join('')}
</table>`);
  const ranked = (title, rows) => frame(title, `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">
${rows.map(([href, label, n], i) => `<tr><td class="columns" valign="bottom">${i + 1}.&nbsp;<a class="columns" href="${href}">${label}</a></td><td class="columns" valign="bottom" align="right">[${n}]</td></tr>`).join('')}
</table>`);
  const inlineIcons = (title, rows) => frame(title, `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">
${rows.map(([img, href, label]) => `<tr><td valign="bottom" class="columns"><img src="${img}" border="0" align="absmiddle">&nbsp;<a href="${href}" class="columns">${label}</a></td></tr>`).join('\n')}
</table>`);
  const community = (ctx) => {
    const { h, manifest: m } = ctx;
    return frame('Community', `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">
${Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).slice(0, 6).map(([s, i]) => `<tr><td width="100%" valign="bottom" class="columns"><a class="columns" href="${h.url.site(s)}">${h.esc(i.name)}</a></td></tr>`).join('')}
</table>`);
  };

  const left = (ctx, r = {}, home = false) => (home ? dailyShot(ctx) : '') + library(ctx, r) + resources(ctx) + options(ctx) + poll(ctx);
  const right = (ctx, rows) => {
    const { h, manifest: m } = ctx;
    const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
    return goodies(ctx)
      + iconList('Top&nbsp;Libraries', m.apps.slice(0, 10).map(a => [appIcon(a), h.url.app(a.slug), h.esc(a.name)]))
      + ranked('Top&nbsp;Sources', sites.slice(0, 10).map(([s, i]) => [h.url.site(s), h.esc(i.name), i.count]))
      + (rows && rows.length ? inlineIcons('On&nbsp;This&nbsp;Page', rows.slice(0, 20).map(e => [rowIcon(e), h.url.item(e), h.esc(e.t)])) : '')
      + iconList('Types', Object.entries(m.types).map(([t]) => [typeIcon(t), h.url.type(t), h.esc(t)]))
      + community(ctx);
  };

  // ---- center: search bar (original BEGIN SEARCH BAR block) ----
  const searchBar = (h, r, apps, types, typeName, cats = true) => `<table width="100%" height="1" border="0" align="CENTER" valign="TOP" cellpadding="0" cellspacing="0"><tr><td align="RIGHT">
<form id="cm-search" data-search></form>
<table width="100%" height="1" border="0" align="CENTER" cellpadding="0" cellspacing="0" background="${A}bg_searchbar.gif">
<tr>
<td align="LEFT"><img src="${A}bg_searchbarl.gif" border="0"></td>
<td align="RIGHT" class="search">&nbsp;&nbsp;<b>Search:</b>&nbsp;</td>
<td width="100%"><input type="text" name="q" value="${h.esc(r.q || '')}" size="15" maxlength="150" form="cm-search"></td>
<td align="RIGHT" class="search">&nbsp;&nbsp;<b>Sort&nbsp;by:</b>&nbsp;</td>
<td align="RIGHT">${h.sortSelect(r)}</td>
<td align="RIGHT" class="search">&nbsp;</td>
<td align="RIGHT">${h.archSelect(r)}</td>
<td align="RIGHT" class="search">&nbsp;</td>
<td align="RIGHT"><input type="submit" value="GO" form="cm-search"></td>
<td align="RIGHT"><img src="${A}bg_searchbarr.gif" border="0"></td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="RIGHT">
<table width="100%" height="32" border="0" align="RIGHT" valign="TOP" cellpadding="1" cellspacing="0" bgcolor="#AAAAAA">
<tr>
<td align="RIGHT" width="100%" height="100%">
<table width="100%" height="100%" border="0" align="RIGHT" valign="TOP" cellpadding="2" cellspacing="0" bgcolor="#F6F6F6">
<tr>
<td align="LEFT" class="search">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
<tr>
<td valign="MIDDLE" class="columns"><nobr>&nbsp;&nbsp;<b>Change&nbsp;Library:</b>&nbsp;&nbsp;</nobr></td>
<td valign="MIDDLE" width="100%">
<select name="library" onchange="location.href=this.value">
<option value="${h.link(r, { app: '', type: '', tag: '' })}">Please Select</option>
${apps.map(([k, label]) => `<option value="${h.link(r, { app: k, type: '', tag: '' })}"${k === r.app ? ' selected' : ''}>${h.esc(label)}</option>`).join('\n')}
</select></td>
</tr></table>
</td></tr>
${cats ? `<tr>
<td align="LEFT">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
<tr>
${[['', `All ${h.esc(r.app ? h.appName(r.app) : 'Items')}`, !typeName], ...types.map(t => [t, h.esc(t), typeName === t])].map(([t, label, on], i) =>
  `${i && i % 4 === 0 ? '</tr><tr>' : ''} <td width="92" class="columns"><nobr><input type="checkbox"${on ? ' checked' : ''} onclick="location.href=this.nextSibling.href;return false"><a class="columns" href="${h.link(r, { type: t, tag: '' })}">${label}</a>&nbsp;&nbsp;</nobr></td>`).join('\n')}
</tr></table>
</td></tr>` : ''}
</table>
</td></tr>
</table>
</td></tr>
</table>
<font size="1"><br></font>`;

  const aboutBox = (title, text, links) => frame(title, `<table width="100%" border="0" valign="TOP" cellpadding="0" cellspacing="5"><tr><td valign="TOP" width="100%" class="content">
<img src="${A}32-winmedia-icon.gif" border="0" align="left">&nbsp;${text}</td>
</tr><tr><td align="right" width="100%" class="content">
${links} &nbsp;
</td></tr></table>`, { width: '100%', bg: '#F6F6F6' });

  // one skin as in the original listing (thumbnail uses our full-size preview, scaled into the 150px box)
  const entry = (h, e) => {
    const file = h.file(e);
    const thumb = h.img(e, 'border="0" class="cm-thumb"') || '';
    const titleCells = `<td align="center" height="1" background="${A}frame_title.gif" class="frametitle">
<div align="left"><img src="${rowIcon(e)}" border="0" align="absmiddle">&nbsp;<a class="frametitle" href="${h.url.item(e)}">${h.esc(e.t)}</a>
</div></td>
<td align="right" height="1" background="${A}frame_title.gif" class="frametitle">&nbsp;&nbsp;Category: <b>${h.esc(e.y.join(', '))}</b>
</td>`;
    return frame('', `<table width="100%" border="0" valign="TOP" cellpadding="0" cellspacing="5"><tr><td valign="TOP" width="50" height="100%" bgcolor="#AAAAAA">
<table width="100%" height="100%" border="0" valign="TOP" cellpadding="5" cellspacing="1"><tr><td valign="TOP" width="100%" height="100%" bgcolor="#DDDDDD" class="contents">
<div style="overflow: hidden; width: 150px">
<a class="" href="${h.url.item(e)}">${thumb}</a>
</div>
</td></tr></table>
</td><td valign="TOP" width="100%" bgcolor="#AAAAAA">
<table width="100%" height="100%" border="0" valign="TOP" cellpadding="5" cellspacing="1"><tr><td valign="TOP" width="100%" height="100%" bgcolor="#ffffff" class="content">
<table border="0" width="100%" height="100%" align="CENTER" cellpadding="1" cellspacing="0"><tr><td valign="TOP" class="contents">
Program:&nbsp;<a class="contents" href="${h.url.app(e.k)}">${h.esc(e.a)}</a><br><br>
</td></tr><tr><td valign="TOP" align="LEFT" class="contents">
Source:&nbsp;<b>${h.esc(h.siteName(e.s))}</b><br>
Archived:&nbsp;<b>${h.esc(h.archivedLabel(e))}</b><br>${e.d ? `<br>Created:&nbsp;<b>${h.esc(e.d)}</b><br>` : ''}
<br>
</td></tr>
<tr><td valign="TOP" height="100%" class="contents">
<br>
${e.g.length ? `<b>Description:&nbsp;<br></b>${e.g.map(t => h.esc(t)).join(', ')}` : ''}
</td>
</tr>
</table>
</td></tr></table>
</td></tr><tr><td valign="TOP" width="100%" bgcolor="#AAAAAA" colspan="2">
<table width="100%" height="100%" border="0" valign="TOP" cellpadding="5" cellspacing="1">
<tr>
<td valign="TOP" width="100%" height="100%" bgcolor="#ffffff" valign="middle" align="right" class="content">
<a class="content" href="${h.esc(h.report(e))}" target="_blank" rel="noopener">[Report]</a>&nbsp;&nbsp;-&nbsp;&nbsp;
${file ? `<a class="content" href="${h.esc(file)}" target="_blank" rel="noopener">[Download]</a>` : `<a class="content" href="${h.url.item(e)}">[Details]</a>`}&nbsp;&nbsp;
<br>
</td></tr></table>
</td></tr></table>`, { width: '100%', bg: '#F6F6F6', titleCells });
  };

  // white bordered panel used by the front page news and the detail page comments
  const panel = (html) => `<table width="100%" border="0" valign="TOP" cellpadding="1" cellspacing="5">
<tr>
<td width="100%" bgcolor="#AAAAAA" align="center">
<table width="100%" height="100%" border="0" align="center" cellpadding="5" cellspacing="0" summary="" bgcolor="#ffffff">
<tr>
<td bgcolor="#ffffff" valign="top" width="100%" class="content">
${html}
</td>
</tr>
</table>
</td>
</tr>
</table>`;

  const pager = (h, r, l) => {
    if (l.pages < 2) return '';
    const p = h.pager(r, l.pages);
    return `<table width="100%" border="0" cellpadding="0" cellspacing="5"><tr><td align="center" class="content">
${p.prev ? `<a class="content" href="${p.prev}">&lt;&lt; Previous Page</a>&nbsp;&nbsp;` : ''}[ ${p.items.map(i => i.gap ? '...' : i.current ? `<b>${i.n}</b>` : `<a class="content" href="${i.url}">${i.n}</a>`).join(' ')} ]${p.next ? `&nbsp;&nbsp;<a class="content" href="${p.next}">Next Page &gt;&gt;</a>` : ''}
</td></tr></table>`;
  };

  THEMES.wincustomize = {
    label: 'WinCustomize 2003',

    home(ctx) {
      const { h, manifest: m } = ctx;
      const big = m.apps[0];
      // "Featured Skin" box, original markup
      const featured = frame('Featured Library', `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="5">
<tr>
<td valign="top" width="50" bgcolor="#AAAAAA" rowspan="2">
<table width="100%" height="100%" border="0" valign="top" cellpadding="5" cellspacing="1">
<tr><td valign="top" width="100%" height="100%" bgcolor="#DDDDDD" class="content"><a href="${h.url.app(big.slug)}"><img border="0" src="${appIcon(big)}"></a></td></tr>
</table>
</td>
<td valign="top" width="100%" height="100%" bgcolor="#AAAAAA">
<table width="100%" height="100%" border="0" valign="top" cellpadding="3" cellspacing="1">
<tr><td valign="top" width="100%" height="100%" bgcolor="#ffffff" class="content">
<span style="width: 70px">Library:</span><a class="content" href="${h.url.app(big.slug)}">${h.esc(big.name)}</a><br>
<span style="width: 70px">Items:</span><b>${big.count}</b><br>
<span style="width: 70px">Types:</span><b>${Object.keys(big.types).length}</b>
<br><br><br>
</td></tr>
</table>
</td>
</tr>
<tr>
<td valign="bottom" width="100%" height="10" bgcolor="#AAAAAA">
<table width="100%" height="100%" border="0" cellpadding="3" cellspacing="1">
<tr>
<td width="100%" height="100%" bgcolor="#ffffff" class="content" align="right"><a class="content" href="${h.url.app(big.slug)}">[Browse]</a></td>
</tr>
</table>
</td>
</tr>
</table>`, { width: '100%', bg: '#F6F6F6' });
      // "WinCustomize Subscriptions" box, original markup
      const about = frame('Customization Museum', `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="5">
<tr>
<td valign="top" width="50" bgcolor="#AAAAAA" rowspan="2">
<table width="100%" height="100%" border="0" valign="top" cellpadding="5" cellspacing="1">
<tr><td valign="top" width="100%" height="100%" bgcolor="#DDDDDD" class="content"><a href="${h.link({}, { arch: '1' })}"><img border="0" src="${A}32-sb-icon.gif"></a></td></tr>
</table>
</td>
<td valign="top" width="100%" height="100%" bgcolor="#AAAAAA">
<table width="100%" height="100%" border="0" valign="top" cellpadding="3" cellspacing="1">
<tr><td valign="top" width="100%" height="100%" bgcolor="#ffffff" class="content">
Browse <b>${m.total}</b> skins, themes and add-ons for <b>${m.apps.length}</b> programs. <b>${m.archived}</b> are backed up on the Wayback Machine.<br><br>
<b><a class="content" href="${h.link({}, { arch: '1' })}">[Archived]</a> - <a class="content" href="${h.url.request()}" target="_blank" rel="noopener">[Request]</a></b>
</td></tr>
</table>
</td>
</tr>
</table>`, { width: '100%', bg: '#F6F6F6' });
      // "Wincustomize News" box: one panel per program
      const news = m.apps.slice(0, 8).map(a => panel(`<b>${h.esc(a.name)}&nbsp;-&nbsp;${a.count} items</b><br><br>
${Object.entries(a.types).map(([t, n]) => `<a class="content" href="${h.link({}, { app: a.slug, type: t })}">${h.esc(t)}</a> (${n})`).join('<br>\n')}<br><br>
<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td class="content"><b><a class="content" href="${h.url.app(a.slug)}">[Browse]</a></b></td><td class="content" align="right">Library <b>${h.esc(a.slug)}</b></td></tr></table>`)).join('');
      return page(ctx, left(ctx, {}, true), featured + about + frame('Museum Directory', news, { width: '100%', bg: '#F6F6F6' }), right(ctx));
    },

    list(ctx) {
      const { h, route: r, list: l, about } = ctx;
      const title = l.typeName || (r.app ? h.appName(r.app) : r.site ? h.siteName(r.site) : r.tag || (r.q ? `Search: ${r.q}` : 'All items'));
      const search = searchBar(h, r, l.facets.apps, l.facets.types.map(([t]) => t), l.typeName);
      const box = about
        ? frame(`About ${h.esc(title)}`, `<table width="100%" border="0" valign="TOP" cellpadding="0" cellspacing="5"><tr><td valign="TOP" width="100%" class="content"><div class="cm-about">${about.html}</div></td></tr><tr><td align="right" width="100%" class="content"><a class="content" href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a class="content" href="${h.link(r, { site: '' })}">Close</a> &nbsp;</td></tr></table>`, { width: '100%', bg: '#F6F6F6' })
        : aboutBox(`About ${h.esc(title)}`, `${h.esc(title)}: ${l.total} items`,
          `&nbsp;&nbsp;<a class="content" href="${h.link(r, { sort: '' })}">Newest</a> &nbsp;&nbsp;-&nbsp;&nbsp;<a class="content" href="${h.link(r, { sort: 'old' })}">Oldest</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a class="content" href="${h.link(r, { arch: '1' })}">Archived</a>`);
      const rows = l.rows.length ? l.rows.map(e => entry(h, e)).join('') : panel('No skins matched.');
      return page(ctx, left(ctx, { app: r.app }), search + box + '<!-- BEGIN DISPLAYING SKINS -->' + rows + pager(h, r, l), right(ctx, l.rows));
    },

    item(ctx) {
      const { h, item: e, manifest: m } = ctx;
      if (!e) return page(ctx, left(ctx), panel(`Item not found. <a class="content" href="${h.url.home()}">Back to the museum</a>`), right(ctx));
      const r = { app: e.k };
      const app = m.apps.find(a => a.slug === e.k) || { name: e.a, count: 0, types: {} };
      const search = searchBar(h, r, m.apps.map(a => [a.slug, a.name]), [], '', false);
      const box = aboutBox(`About ${h.esc(e.a)}`, `${h.esc(e.a)}: ${app.count} items`,
        `&nbsp;&nbsp;<a class="content" href="${h.url.app(e.k)}">Browse</a> &nbsp;&nbsp;-&nbsp;&nbsp;<a class="content" href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a>`);
      const a = (href, text) => href ? `<a class="content" href="${h.esc(href)}" target="_blank" rel="noopener">${text}</a>` : '';
      const by = (html) => `<br><br><div align="right">${html}</div>`;
      // "Comments" box: details, description and the full-size preview as comment panels
      const comments = frame('Details',
        panel(`${h.details(e).map(([k, v]) => `<b>${k}:</b> ${v}`).join('<br>\n')}${by(`${a(h.edit(e), 'Edit')}&nbsp;-&nbsp;${a(h.report(e), 'Report')}${h.page(e) ? `&nbsp;-&nbsp;${a(h.page(e), 'Original page')}` : ''}`)}`)
        + (e.desc ? panel(e.desc) : '')
        + panel(`<div align="center" class="cm-media">${h.media(e)}</div>`),
        { width: '100%', bg: '#F6F6F6' });
      return page(ctx, left(ctx, r), search + box + entry(h, e) + comments, right(ctx));
    },
  };
})();
