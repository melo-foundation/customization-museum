// label: WinCustomize 2003
// Original WinCustomize "GreenApple" markup (front page 2003-03-15, library listing 2003-09-11),
// with the site's own CSS and UI images from themes/wincustomize/assets/. Only content regions are ours;
// the original logo carries a small "Customization Museum replica" tag beside it.
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
  // original library slugs -> their icon
  const SLUG_ICON = {
    coolplayer: 'coolplayer', cursorxp: 'cursorxp', dashboard: 'dashboard', desktopx: 'desktopx', 'desktopx-objects': 'desktopx',
    'desktopx-themes': 'desktopx', iconpackager: 'iconpackager', litestep: 'litestep', logons: 'logon', nextstart: 'nextstart',
    objectbar: 'objectbar', objectdock: 'objectdock', sysmetrix: 'metrix', wallpapers: 'wallpapers', 'skinstudio-widgets': 'skinstudio',
    winamp: 'winamp', windowblinds: 'windowblinds', windowfx: 'wfx', winmedia: 'winmedia', winstyles: 'conv',
  };
  const icon = (key) => `${A}16-${key}-icon.gif`;
  const typeIcon = t => icon(TYPE_ICON[t] || 'nextstart');
  const appIcon = a => icon(APP_ICON[a.name] || SLUG_ICON[a.slug] || TYPE_ICON[Object.keys(a.types || {})[0]] || 'nextstart');
  const rowIcon = e => icon(APP_ICON[e.a] || SLUG_ICON[e.k] || TYPE_ICON[e.y[0]] || 'nextstart');

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
    // the 468x60 banner slot is empty in every capture; it only holds the malware notice until dismissed
    const ad = h.warning();
    return `<table width="100%" align="center" border="0" cellpadding="0" cellspacing="0">
<tr>
<td height="1" bgcolor="#007236" align="left" valign="top"><a href="${h.url.home()}"><img src="${A}logo_top.gif" border="0" alt="WinCustomize"></a><span class="cm-replica">Customization Museum replica</span></td>
<td height="1" bgcolor="#007236" align="right" class="content">${ad ? `<div class="cm-ad">${ad}</div>` : ''}</td>
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
<td align="right" background="${A}topbarright_bg.gif"><nobr>${h.themePicker()}&nbsp;${h.fidelityToggle()}</nobr></td>
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
<td class="columns" valign="bottom" width="100%"><nobr class="cm-lib"><a class="columns" href="${h.url.app(a.slug)}">${cut(h, a.name, 14)}</a></nobr></td>
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
  // original product box: picture, one caption line, BUY IT! button; the product is one of our items with a preview
  const goodies = (ctx) => {
    const { h, manifest: m } = ctx;
    const pool = (ctx.recent || ctx.list?.rows || (ctx.related || []).filter(e => e !== ctx.item)).filter(e => e.v);
    const g = pool.length ? pool[new Date().getDate() % Math.min(pool.length, 15)] : ctx.item?.v ? ctx.item : null;
    const href = g ? h.url.item(g) : h.url.request();
    return frame('Museum&nbsp;Goodies', `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">
<tr><td align="center" class="columns">
${g ? `<a href="${href}">${h.img(g, 'border="0" class="cm-goodie"')}</a><br>
<a class="columns" href="${href}">${cut(h, g.t, 22)}</a>` : `<br>${m.total} items<br>${m.apps.length} programs<br><br>`}
</td></tr>
</table>
<table width="100%" height="34" align="CENTER" border="0" cellpadding="0" cellspacing="0" background="${A}bg_bottom.gif">
<tr>
<td align="center" valign="middle" class="search" height="34"><a href="${href}"${g ? '' : ' target="_blank" rel="noopener"'}><img src="${A}button_buy.gif" border="0" align="middle"></a></td>
</tr>
</table>`);
  };
  // the original cut side-column names at 18 characters ("Windows XP Media C")
  const cut = (h, s, n = 18) => `<span title="${h.esc(s)}">${h.esc(s.length > n ? s.slice(0, n) : s)}</span>`;
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
  const right = (ctx, rows, sort) => {
    const { h, manifest: m } = ctx;
    const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
    return goodies(ctx)
      + iconList('Top&nbsp;Libraries', m.apps.slice(0, 10).map(a => [appIcon(a), h.url.app(a.slug), cut(h, a.name)]))
      + ranked('Top&nbsp;Sources', sites.slice(0, 10).map(([s, i]) => [h.url.site(s), cut(h, i.name, 16), i.count]))
      + (rows && rows.length ? inlineIcons(sort ? 'On&nbsp;This&nbsp;Page' : 'Newest&nbsp;Additions', rows.slice(0, 20).map(e => [rowIcon(e), h.url.item(e), cut(h, e.t)])) : '')
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

  // description as the original printed it: plain text, line breaks kept, each URL as globe icon + "Link"
  const describe = (h, e) => {
    const link = u => `<a target="_blank" rel="noopener" href="${u}"><img src="${A}url.gif" border="0" alt="${u}" align="absmiddle"></a>&nbsp;<a target="_blank" rel="noopener" href="${u}">Link</a>`;
    return e.m && e.desc ? e.desc.replace(/^<p>|<\/p>$/g, '').replace(/<\/p><p>/g, '<br><br>')
      : e.n ? h.esc(e.n).replace(/https?:\/\/[^\s<]+/g, link).replace(/\n/g, '<br>') : e.g.map(t => h.esc(t)).join(', ');
  };
  const longDate = iso => { const d = new Date(iso + 'T00:00:00'); return isNaN(d) ? iso : `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };

  // front page from the newest items (ctx.recent): Daily Shot, Featured Skin, News and Newest Additions as the original laid them out
  const homeRecent = (ctx) => {
    const { h, manifest: m, recent } = ctx;
    // Daily Shot: the newest picture not already shown in the news
    const shot = recent.slice(8).find(e => e.v) || recent.find(e => e.v);
    const daily = shot ? frame(`<a class="frametitle" href="${h.url.item(shot)}">Daily Shot</a>`, `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">
<tr><td align="center" class="columns"><a href="${h.url.item(shot)}">${h.img(shot, 'border="0" class="cm-shot"')}</a><br><a class="columns" href="${h.url.item(shot)}">${h.esc(shot.t)}</a></td></tr>
</table>`) : dailyShot(ctx);
    const sites = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
    const articles = frame(`<a class="frametitle" href="${h.url.home()}">Sources</a>`, `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="3">
${sites.map(([s, i]) => `<tr><td valign="bottom" class="columns"><img src="${A}articles.gif" border="0" align="absmiddle"></td><td width="100%" valign="bottom" class="columns"><a class="columns" href="${h.url.site(s)}">${h.esc(i.name)}</a></td></tr>`).join('')}
</table>`);
    const f = recent[0], fx = f.x || {}, file = h.file(f);
    const field = (label, html) => `<span style="width: 70px">${label}</span>${html}<br>`;
    const featured = frame(`<a class="frametitle" href="${h.url.item(f)}">Featured Skin</a>`, `<table width="100%" border="0" valign="top" cellpadding="0" cellspacing="5" class="cm-feat">
<tr>
<td valign="top" width="50" bgcolor="#AAAAAA" rowspan="2">
<table width="100%" height="100%" border="0" valign="top" cellpadding="5" cellspacing="1">
<tr><td valign="top" width="100%" height="100%" bgcolor="#DDDDDD" class="content"><a href="${h.url.item(f)}">${h.img(f, 'border="0" class="cm-thumb"') || `<img border="0" src="${A}blank.gif">`}</a></td></tr>
</table>
</td>
<td valign="top" width="100%" height="100%" bgcolor="#AAAAAA">
<table width="100%" height="100%" border="0" valign="top" cellpadding="3" cellspacing="1">
<tr><td valign="top" width="100%" height="100%" bgcolor="#ffffff" class="content">
${field('Skin:', `<a class="content" href="${h.url.item(f)}">${h.esc(f.t)}</a> for <a class="content" href="${h.url.app(f.k)}">${h.esc(f.a)}</a>`)}${field('Author:', (fx.Author || fx.Creator) ? `<a class="content" href="${h.url.site(f.s)}">${h.esc(fx.Author || fx.Creator)}</a>` : `<a class="content" href="${h.url.site(f.s)}">${h.esc(h.siteName(f.s))}</a>`)}${fx['File size'] ? `<span style="width: 70px">File&nbsp;size:</span><b>${h.esc(fx['File size'])}</b>` : `<span style="width: 70px">Type:</span><b>${h.esc(f.y.join(', '))}</b>`}
<br><br><br>
</td></tr>
</table>
</td>
</tr>
<tr>
<td valign="bottom" width="100%" height="10" bgcolor="#AAAAAA">
<table width="100%" height="100%" border="0" cellpadding="3" cellspacing="1">
<tr>
<td width="100%" height="100%" bgcolor="#ffffff" class="content" align="right">${file ? `<a class="content" href="${h.esc(file)}" target="_blank" rel="noopener">[Download]</a>` : `<a class="content" href="${h.url.item(f)}">[Details]</a>`}</td>
</tr>
</table>
</td>
</tr>
</table>`, { width: '100%', bg: '#F6F6F6' });
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
Browse <b>${m.total}</b> skins, themes and add-ons for <b>${m.apps.length}</b> programs...<br><br>
<b><a class="content" href="${h.link({}, { arch: '1' })}">[Archived]</a> - <a class="content" href="${h.url.request()}" target="_blank" rel="noopener">[Request]</a></b>
</td></tr>
</table>
</td>
</tr>
</table>`, { width: '100%', bg: '#F6F6F6' });
    const story = e => {
      const x = e.x || {}, page = h.page(e);
      return `<tr>
<td width="100%" bgcolor="#AAAAAA" align="center">
<table width="100%" height="100%" border="0" align="center" cellpadding="5" cellspacing="0" summary="" bgcolor="#ffffff">
<tr>
<td bgcolor="#ffffff" valign="top" width="100%" class="content">
<b>${e.d ? `${longDate(e.d)}&nbsp;-&nbsp;` : ''}${h.esc(e.t)}</b><br><br>
${describe(h, e) || `${h.esc(e.y.join(', '))} for ${h.esc(e.a)}`}
<br>
</td>
${e.v ? `<td bgcolor="#ffffff" valign="top"><table border="0" cellpadding="1" cellspacing="0" style="background: #AAAAAA"><tr><td><table border="0" cellpadding="1" cellspacing="0" style="background: #DDDDDD"><tr><td><a href="${h.url.item(e)}">${h.img(e, 'border="0" class="cm-newsthumb"')}</a></td></tr></table></td></tr></table></td>` : ''}
</tr>
<tr>
<td${e.v ? ' colspan="2"' : ''} bgcolor="#ffffff" valign="top" width="100%">
<table width="100%" border="0" align="center" cellpadding="1" cellspacing="0" summary="">
<tr>
<td align="left">${page ? `<br><br>&nbsp;&nbsp;&nbsp;<img src="${A}visit-now.gif" border="0">&nbsp;<a class="contents" target="_blank" rel="noopener" href="${h.esc(page)}">Visit Now!</a><br><br>` : '<br><br>'}</td>
<td align="right">&nbsp;</td>
</tr>
<tr>
<td align="left">
<a class="contents" href="${h.url.item(e)}">[Full&nbsp;Story]</a>&nbsp;-&nbsp;
<a class="contents" href="${h.esc(h.report(e))}" target="_blank" rel="noopener">[Report]</a>
</td>
<td class="contents" align="right">Reported by&nbsp;<a class="contents" href="${h.url.site(e.s)}">${h.esc(x.Author || x.Creator || h.siteName(e.s))}</a>&nbsp;</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>`;
    };
    const news = frame('Museum News', `<table width="100%" border="0" valign="TOP" cellpadding="1" cellspacing="5">
${recent.slice(1, 8).map(story).join('\n')}
</table>`, { width: '100%', bg: '#F6F6F6' });
    const leftCol = daily + library(ctx) + resources(ctx) + options(ctx) + articles + poll(ctx);
    const sitesAll = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count);
    const rightCol = goodies(ctx)
      + iconList('Top&nbsp;Libraries', m.apps.slice(0, 10).map(a => [appIcon(a), h.url.app(a.slug), cut(h, a.name)]))
      + ranked('Top&nbsp;Sources', sitesAll.slice(0, 10).map(([s, i]) => [h.url.site(s), cut(h, i.name, 16), i.count]))
      + inlineIcons('Newest&nbsp;Additions', recent.slice(0, 20).map(e => [rowIcon(e), h.url.item(e), cut(h, e.t)]))
      + iconList('Types', Object.entries(m.types).map(([t]) => [typeIcon(t), h.url.type(t), h.esc(t)]))
      + community(ctx);
    return page(ctx, leftCol, featured + about + ' .' + news, rightCol);
  };

  // field labels exactly as the original listing printed them
  const LABEL = { 'File size': 'File&nbsp;size:&nbsp;<b> ', 'Downloads today': 'Downloads today:<b> ', Created: 'Created: <b>', Updated: 'Updated: <b>' };
  // one skin as in the original listing (thumbnail uses our full-size preview, scaled into the 150px box)
  const entry = (h, e) => {
    const file = h.file(e);
    const thumb = h.img(e, 'border="0" class="cm-thumb"') || '';
    // original site records (e.x with Created) show their own fields; others show source and archive state
    const x = e.x || {}, author = x.Author || x.Creator;
    const info = Object.entries(x).filter(([k]) => !['Author', 'Creator', 'Compatibility'].includes(k));
    if (!x.Created) info.unshift(['Source', h.siteName(e.s)], ['Archived', h.archivedLabel(e)], ...(e.d ? [['Created', e.d]] : []));
    const desc = describe(h, e);
    const xp = /xp/i.test(x.Compatibility || '');
    const titleCells = `<td align="center" height="1" background="${A}frame_title.gif" class="frametitle">
<div align="left"><img src="${xp ? `${A}16-winxp-icon.gif` : rowIcon(e)}" border="0" align="absmiddle">&nbsp;<a class="frametitle" href="${h.url.item(e)}">${h.esc(e.t)}</a>
</div></td>
<td align="right" height="1" background="${A}frame_title.gif" class="frametitle">&nbsp;&nbsp;Category: <b>${h.esc(e.y.join(', '))}</b>
</td>`;
    return frame('', `<table width="100%" border="0" valign="TOP" cellpadding="0" cellspacing="5"><tr><td valign="TOP" width="50" height="100%" bgcolor="#AAAAAA" class="cm-fill">
<table width="100%" height="100%" border="0" valign="TOP" cellpadding="5" cellspacing="1"><tr><td valign="TOP" width="100%" height="100%" bgcolor="#DDDDDD" class="contents">
${thumb ? `<div class="cm-tw" style="overflow: hidden; width: 150px">
<a class="" href="${h.url.item(e)}">${thumb}</a>
</div>` : `<img alt="" border="0" src="${A}blank.gif">`}
</td></tr></table>
</td><td valign="TOP" width="100%" height="100%" bgcolor="#AAAAAA" class="cm-fill">
<table width="100%" height="100%" border="0" valign="TOP" cellpadding="5" cellspacing="1"><tr><td valign="TOP" width="100%" height="100%" bgcolor="#ffffff" class="content">
<table border="0" width="100%" height="100%" align="CENTER" cellpadding="1" cellspacing="0"><tr><td valign="TOP" class="contents">
${author ? `Author:&nbsp;<a class="contents" href="${h.url.site(e.s)}">${h.esc(author)}</a>` : `Program:&nbsp;<a class="contents" href="${h.url.app(e.k)}">${h.esc(e.a)}</a>`}<br><br>
</td></tr><tr><td valign="TOP" align="LEFT" class="contents">
${info.map(([k, v]) => `${k === 'Created' ? '<br>' : ''}${LABEL[k] || `${h.esc(k)}:&nbsp;<b>`}${h.esc(v)}</b><br>`).join('')}
<br>
</td></tr>
${x.Compatibility ? `<tr><td valign="bottom" class="contents">${xp ? `<img src="${A}16-winxp-icon.gif" border="0" align="absmiddle">&nbsp;` : ''}<b>${h.esc(x.Compatibility).replace(/ /g, '&nbsp;')}</b></td></tr>` : ''}
${desc ? `<tr><td valign="TOP" height="100%" class="contents">
<br>
<b>Description:&nbsp;<br></b>${desc}
</td>
</tr>` : ''}
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

  // original pager: [<< BACK] numbers [NEXT >>], current page unlinked; up to 15 numbers around the current page
  const pager = (h, r, l) => {
    if (l.pages < 2) return '';
    const from = Math.max(1, Math.min(l.page - 7, l.pages - 14)), to = Math.min(l.pages, from + 14);
    const go = n => h.link(r, { page: n });
    const nums = [];
    for (let n = from; n <= to; n++) nums.push(n === l.page ? `${n}&nbsp;&nbsp;` : `<a class="toplinks" href="${go(n)}">${n}</a>&nbsp;&nbsp;&nbsp;`);
    return `<table border="0" width="100%" valign="TOP" cellpadding="3" cellspacing="0"><tr><td class="selected"><a class="toplinks" href="${go(Math.max(1, l.page - 1))}">[&lt;&lt;&nbsp;BACK]</a></td><td align="center" class="selected">&nbsp;
${nums.join('\n')}</td><td align="right" class="selected"><a class="toplinks" href="${go(Math.min(l.pages, l.page + 1))}">[NEXT &gt;&gt;]</a></td></tr></table>`;
  };

  THEMES.wincustomize = {
    label: 'WinCustomize 2003',
    perPage: 15,
    recent: 30,

    home(ctx) {
      if (ctx.recent?.length) return homeRecent(ctx);
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
      // a library's checkbox row lists all of its categories, as the original did
      const lib = r.app && ctx.manifest.apps.find(a => a.slug === r.app);
      const search = searchBar(h, r, ctx.manifest.apps.map(a => [a.slug, a.name]), lib ? Object.keys(lib.types) : l.facets.types.map(([t]) => t), l.typeName);
      const box = about
        ? frame(`About ${h.esc(title)}`, `<table width="100%" border="0" valign="TOP" cellpadding="0" cellspacing="5"><tr><td valign="TOP" width="100%" class="content"><div class="cm-about">${about.html}</div></td></tr><tr><td align="right" width="100%" class="content"><a class="content" href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a class="content" href="${h.link(r, { site: '' })}">Close</a> &nbsp;</td></tr></table>`, { width: '100%', bg: '#F6F6F6' })
        : aboutBox(`About ${h.esc(title)}`, `${h.esc(title)}: ${l.total} items`,
          `&nbsp;&nbsp;<a class="content" href="${h.link(r, { sort: '' })}">Newest</a> &nbsp;&nbsp;-&nbsp;&nbsp;<a class="content" href="${h.link(r, { sort: 'old' })}">Oldest</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a class="content" href="${h.link(r, { arch: '1' })}">Archived</a>`);
      const rows = l.rows.length ? l.rows.map(e => entry(h, e)).join('') : panel('No skins matched.');
      return page(ctx, left(ctx, { app: r.app }), search + box + '<!-- BEGIN DISPLAYING SKINS -->' + rows + pager(h, r, l), right(ctx, l.rows, r.sort));
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
        + (h.media(e) ? panel(`<div align="center" class="cm-media">${h.media(e)}</div>`) : ''),
        { width: '100%', bg: '#F6F6F6' });
      return page(ctx, left(ctx, r), search + box + entry(h, e) + comments, right(ctx));
    },
  };
})();
