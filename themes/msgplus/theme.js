// label: Messenger Plus! Gallery
// Markup follows msgpluslive.net/skins (2009-2010) element for element; only content regions are filled from ctx.
(() => {
  const mark = (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 60 58" aria-hidden="true"><path d="M2 8C14 0 30 4 38 20L22 34C10 30 3 20 2 8Z" fill="#2a91d8"/><path d="M26 4C40 6 54 20 50 40L36 52 28 30Z" fill="#f7941d"/><path d="M12 34 28 24l8 14-12 14z" fill="#8bc34a"/></svg>`;
  const fmtDate = d => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1];
    return mon && day ? `${mon} ${day}&#44; ${y}` : y;
  };

  // five labelled fields per listing row, like the original: real scraped ones first, then ours to keep the geometry
  const fields = (h, e) => {
    const x = e.x || {}, out = [];
    if (x.Creator) out.push(['Creator', h.esc(x.Creator)]);
    out.push(['Added', fmtDate(e.d) || 'Unknown']);
    if (x.Downloads) out.push(['Downloads', h.esc(x.Downloads)]);
    if (x.Rating) out.push(['Rating', h.esc(x.Rating)]);
    if (x.Compatibility) out.push(['Compatibility', h.esc(x.Compatibility)]);
    for (const f of [['Program', `<a href="${h.url.app(e.k)}">${h.esc(e.a)}</a>`], ['Type', e.y.map(t => `<a href="${h.url.type(t)}">${h.esc(t)}</a>`).join(', ')],
      ['Source', `<a href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a>`], ['Archived', h.esc(h.archivedLabel(e))]]) {
      if (out.length >= 5) break;
      out.push(f);
    }
    return out.slice(0, 5);
  };

  const header = (ctx, title, sub) => {
    const { h, route: r } = ctx;
    const all = { ...r, app: '', type: '', site: '', tag: '', q: '', item: '' };
    return `<div id="header">
	<h1><a href="${h.url.home()}" class="cm-logo"><span class="cm-logo-mark">${mark(62, 60)}</span><span class="cm-logo-t">Customization <b>Museum</b></span><span class="cm-logo-s">old skins, themes &amp; emoticons</span></a></h1>
	<ul id="mainnav">
		<li id="navhome"><a href="${h.url.home()}">home</a></li>
		<li id="navnews"><a href="${h.link(all, { sort: '' })}">newest</a></li>
		<li id="navdownload"><a href="${h.link(all, { sort: '' })}" id="mainnav-link-download">browse</a></li>
		<li id="navfeatures"><a href="${h.link(all, { sort: 'old' })}">oldest</a></li>
		<li id="navhelp"><a href="${h.link(all, { sort: 'az' })}">a-z</a></li>
		<li id="navmore"><a href="${h.url.request()}" target="_blank" rel="noopener">request</a></li>
	</ul>
	<div id="header-toolbar"><a id="header-toolbar-changecolor" href="#theme"><img src="themes/msgplus/assets/colorize.png" alt="Change theme"/></a></div>
</div>
<div id="contentheaderhelper">
<div id="contentheader">
	<h2>${h.esc(title)}</h2>
<h3>${h.esc(sub)}</h3>
</div>
</div>
<div id="contentheaderright">
	<div class="langbox"><label>Theme:&nbsp;</label>${h.themePicker()}</div>
</div>`;
  };

  const sidebar = (ctx) => {
    const { h, route: r, manifest: m } = ctx;
    const all = { ...r, app: '', type: '', site: '', tag: '', q: '', item: '' };
    const box = (title, items) => `<div class="box">
			<h5>${title}</h5>
			<ul>
${items.map(([href, label, sub]) => `				<li><a href="${href}">${h.esc(label)}${sub ? `					<span>${h.esc(sub)}</span>` : ''}</a></li>`).join('\n')}
			</ul>
		</div>`;
    return `	<div class="right">
		<form method="get" id="searchform" data-search>
			<div>
				<input type="text" value="${h.esc(r.q)}" name="q" id="q" style="width:130px;"/><br/>
				<input type="submit" id="searchsubmit" value="Search Items"/>
			</div>
		</form>
		<p align="center">
		<a href="${h.url.request()}" target="_blank" rel="noopener"><img src="themes/msgplus/assets/feedicon.gif" width="14" height="14" alt=""/> Request an item</a><br/><br/>
		<a class="cm-badge" href="${h.link(all, { arch: '1' })}">${m.archived.toLocaleString()} archived</a>
		</p>
		${box('browsing links', [[h.link(all, { sort: '' }), 'Newest Items', 'Everything, latest first'], [h.link(all, { sort: 'old' }), 'Oldest Items', 'From the very beginning'], [h.link(all, { sort: 'az' }), 'A to Z'], [h.link(all, { arch: '1' }), 'Archived Only'], [h.url.home(), 'All Programs']])}
		${box('more things you can do', [[h.url.home(), 'Browse by Program'], [h.url.request(), 'Request an Item']])}
	</div>`;
  };

  const footer = (ctx) => {
    const { h, route: r } = ctx;
    const all = { ...r, app: '', type: '', site: '', tag: '', q: '', item: '' };
    return `<div id="footer">
	<div id="gfddlogo"><a href="${h.url.request()}" class="cm-gfdd" target="_blank" rel="noopener">customization<br/><b>museum</b></a></div>
	<p>Customization Museum &copy; an unofficial archive of user-made customization<br/>
	<small>Program names and marks belong to their respective owners.<br/>
	Files are archived automatically and are not checked.<br/>
	Report a bad entry with the <em>Report</em> link on its page.</small>
	</p>
	<p class="side"><small><a href="${h.url.request()}" target="_blank" rel="noopener"> request </a>&amp;<a href="${h.url.request()}" target="_blank" rel="noopener"> report </a></small></p>
	<p class="links"><a href="${h.url.home()}">home </a>|<a href="${h.link(all, { sort: '' })}"> newest </a>|<a href="${h.link(all, { sort: '' })}"> browse </a>|<a href="${h.link(all, { sort: 'old' })}"> oldest </a>|<a href="${h.link(all, { sort: 'az' })}"> a-z </a>|<a href="${h.url.request()}" target="_blank" rel="noopener"> request</a></p>
</div>`;
  };

  const page = (ctx, o) => `<div id="bghelper">
<div id="container">
${header(ctx, o.title, o.sub)}
${o.banner ? `<div class="cm-banner">${o.banner}</div>` : ''}
<div class="content">
<div class="left">
${o.left}
</div>
${sidebar(ctx)}
</div>
${footer(ctx)}
</div>
</div>`;

  const warning = h => h.warning() ? `<div class="highlight important cm-warning"><strong>Important:</strong> Files are archived automatically and are not checked. They may contain malware: scan anything you download. <button data-dismiss-warning>OK</button></div>` : '';

  const buttons = (ctx) => {
    const { h, route: r } = ctx;
    const base = { ...r, item: '', page: 1 };
    return ` <table width="100%" align="center" cellpadding="3" cellspacing="0" border="0">
  <tr>
    <td align="right">
    </td>
  </tr>
</table>
<div class="downdbbuttons"><a href="${h.link(base, { sort: '' })}" class="downdbbydate">browse by date</a>
<a href="${h.link(base, { sort: 'old' })}" class="downdbbyrating">browse by age</a>
<a href="${h.link(base, { sort: 'az' })}" class="downdbbydownloads">browse by name</a>
<a href="${h.url.home()}" class="downdbbycategory">browse by category</a></div>`;
  };

  const crumbs = (h, list) => `<table class="afterdowndbbuttons" width="100%" border="0" align="center" cellpadding="3" cellspacing="0">
  <tr>
    <td><h4>
${list.map(([t, u]) => `                &raquo; ${u ? `<a href="${u}">${h.esc(t)}</a>` : h.esc(t)} `).join('\n')}
          </h4></td>
  </tr>
</table><p/>`;

  const pager = (h, r, l) => {
    if (l.pages < 2) return '<p/>';
    const p = h.pager(r, l.pages);
    const links = [p.prev ? `<a href="${p.prev}">&lt;&lt; Previous Page</a>` : '',
      ...p.items.filter(i => !i.gap).map(i => `<a href="${i.url}">${i.current ? `[ ${i.n} ]` : i.n}</a>`),
      p.next ? `<a href="${p.next}">Next Page &gt;&gt;</a>` : ''].filter(Boolean);
    return `<div align="center">\n${links.join('\n')}\n</div><p/>`;
  };

  const row = (h, e, i) => {
    const bg = i % 2 ? '#ebf8ff' : '#f6fcff', u = h.url.item(e), img = h.thumb(e);
    const f = fields(h, e);
    return `<table onclick="if(!event.target.closest('a'))location.href='${u}'" width="100%" border="0" align="center" cellpadding="3" cellspacing="0" class="border" onmouseover="this.style.backgroundColor='#ffffda';" onmouseout="this.style.backgroundColor='${bg}';" style="background-color:${bg}; cursor:pointer;">
   <tr>
    <td width="35%" rowspan="6" align="center">
        ${img ? `<img class="frame cm-thumb" src="${h.esc(img)}" alt="${h.esc(e.t)} screenshot" data-alt="${h.esc(h.thumbFallback(e))}" onerror="if(!this.dataset.f){this.dataset.f=1;this.src=this.dataset.alt}else{this.replaceWith(Object.assign(document.createElement('span'),{className:'frame cm-nothumb',textContent:'no preview'}))}"/>` : '<span class="frame cm-nothumb">no preview</span>'}
        <br/><a href="${u}" class="highslide"><strong>full screenshot</strong></a>
            </td>
    <td width="88%" colspan="2">
      <a href="${u}"><b>${h.esc(e.t)}</b></a>
    </td>
  </tr>
${f.map(([k, v], j) => `   <tr>
    <td width="65%" align="left" colspan="2">
    <i>${k}:</i> ${v}${j === 4 ? '        <br/>&nbsp;' : ''}
    </td>
  </tr>`).join('\n')}
</table>`;
  };

  const fillFeatured = async (ctx, el) => {
    const boxes = el.querySelectorAll('table[data-feat]');
    if (!boxes.length) return;
    const { h } = ctx;
    const rows = (await fetch(h.url.home() + 'idx/app/msn-wlm.json').then(r => r.json())).filter(e => e.s === 'wlm' && e.v);
    const num = v => parseFloat(String(v || '').replace(/,/g, '')) || 0;
    const used = new Set(), first = list => { const e = list.find(e => !used.has(e.i)); if (e) used.add(e.i); return e; };
    const pick = {};
    pick.new = first([...rows].sort((a, b) => b.d.localeCompare(a.d)));
    pick.top = first([...rows].sort((a, b) => num(b.x?.Downloads) - num(a.x?.Downloads) || a.d.localeCompare(b.d)));
    pick.featured = first([...rows].sort((a, b) => num(b.x?.Rating) - num(a.x?.Rating) || b.d.localeCompare(a.d)));
    for (const t of boxes) {
      const e = pick[t.dataset.feat];
      if (!e) continue;
      const u = h.url.item(e), f = fields(h, e).slice(0, 4), tds = t.querySelectorAll('td');
      tds[0].innerHTML = `<img class="frame cm-thumb" src="${h.esc(h.thumb(e))}" alt="${h.esc(e.t)} screenshot"/>\n    	<br/><a href="${u}" class="highslide"><strong>full screenshot</strong></a>`;
      tds[1].innerHTML = `<strong><a href="${u}">${h.esc(e.t)}</a></strong>`;
      f.forEach(([k, v], i) => { tds[2 + i].innerHTML = `<em>${k}:</em> ${v}`; });
    }
  };

  THEMES.msgplus = {
    label: 'Messenger Plus! Gallery',
    after(ctx, el) { document.body.className = 'skinsdb'; return fillFeatured(ctx, el); },

    home(ctx) {
      const { h, manifest: m, route: r } = ctx;
      const all = { ...r, app: '', type: '', site: '', tag: '', q: '', item: '' };
      const li = list => list.map(([href, t]) => `<li><a href="${href}">${h.esc(t)}</a></li>`).join('\n');
      const snaps = li([[h.link(all, { sort: '' }), 'Newest Items'], [h.link(all, { sort: 'old' }), 'Oldest Items'], [h.link(all, { sort: 'az' }), 'A to Z'], [h.link(all, { arch: '1' }), 'Archived Items']]);
      const cats = Object.keys(m.types).slice(0, 9).map(t => `<li><a href="${h.url.type(t)}">${h.esc(t)}</a></li>`).join('');
      const ext = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).slice(0, 3).map(([s, i]) => `	<li><a href="${h.url.site(s)}">${h.esc(i.name)}</a></li>`).join('\n');
      const feat = (title, key, more, moreUrl) => `<h3>${title}</h3>
<div class="highlightwidthfix3 subhighlight"><div class="r1"><div class="r2"><div class="r5">
<table width="100%" data-feat="${key}">
	<tr>
    <td rowspan="7" align="center" width="50%"><span class="frame cm-nothumb">&nbsp;</span>
    	<br/><a class="highslide"><strong>full screenshot</strong></a>
    </td>
  <td width="50%"><strong><a>&nbsp;</a></strong></td></tr>
  <tr><td width="50%">&nbsp;</td></tr>
  <tr><td width="50%">&nbsp;</td></tr>
  <tr><td width="50%">&nbsp;</td></tr>
	<tr><td width="50%">&nbsp;</td></tr>
  <tr><td width="50%" align="right"><strong><a href="${moreUrl}">${more} &gt;</a></strong></td></tr>
</table>
</div></div></div></div>`;
      const left = `${warning(h) || `<div class="highlight important"><strong>Important:</strong> Files are archived automatically and are not checked: scan anything you download.</div>`}
	<span class="cm-bigicon" style="float:left;margin:0 15px 0px -15px">${mark(138, 126)}</span>
	<h3>What is this?</h3>
  <p>An index of old skins, themes, emoticons and other customization files for messengers, media players and desktops: ${m.total.toLocaleString()} items from ${m.apps.length} programs, ${m.archived.toLocaleString()} of them archived. Each entry links to its original page and to an archived copy when one exists. Browse by program, type or source, or search for a name.</p>
  <h2 style="clear:both"><a href="${h.link(all, { sort: '' })}">Browse the Museum</a></h2>
  <p>View and download items made by users over the years. </p>
<div class="featuredbox clearfix" style="margin-bottom:15px">
		<div class="left2 clearfix">
<h3>Snapshots</h3><div class="subhighlight clearfix"><div class="r1"><div class="r2"><div class="r4">
<ul>
${snaps}
</ul>
</div></div></div></div>
<h3>Categories</h3><div class="subhighlight clearfix"><div class="r1"><div class="r2"><div class="r6"><ul>
${cats}</ul>
</div></div></div></div>
<h3 style="margin-top:10px;">External Resources</h3>
<p>Items in the museum come from these sites, among others:</p>
<ul>
${ext}
	</ul>
	</div>
		<div class="right2 clearfix">
${feat('Featured Item', 'featured', 'More Messenger Plus! Skins', h.url.site('wlm'))}
${feat('Just Added', 'new', 'More New Items', h.link(all, { sort: '' }))}
${feat('Most Downloaded', 'top', 'More Skins', h.url.site('wlm'))}
		</div>
</div>
<h2>Missing something... how can I add it?!</h2>
<p>Anything we have not found yet can be suggested with a <a href="${h.url.request()}" target="_blank" rel="noopener">request</a>: a single page or file, or a whole site. Requests are archived on the Wayback Machine first and then indexed here, so nothing has to be uploaded by hand.</p>`;
      return page(ctx, { title: 'Customization Museum', sub: 'Old skins, themes and emoticons', left });
    },

    list(ctx) {
      const { h, route: r, list: l, about } = ctx;
      const sname = r.sort === 'old' ? 'Browse by Age' : r.sort === 'az' ? 'Browse by Name' : 'Browse by Date';
      const bc = [['Customization Museum', h.url.home()]];
      if (r.app) bc.push([h.appName(r.app), h.url.app(r.app)]);
      if (r.site) bc.push([h.siteName(r.site), h.url.site(r.site)]);
      if (l.typeName) bc.push([l.typeName, h.url.type(l.typeName)]);
      if (r.tag) bc.push([r.tag, '']);
      if (r.q) bc.push([`Search: ${r.q}`, '']);
      bc.push([sname, '']);
      const title = r.app ? h.appName(r.app) : r.site ? h.siteName(r.site) : l.typeName || (r.q ? 'Search Results' : 'All Items');
      const left = `${warning(h)}${buttons(ctx)}
${crumbs(h, bc)}
${about ? `<div class="highlight cm-about"><span class="cm-tools"><a href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a> | <a href="${h.link(r, { site: '' })}">Close</a></span>${about.html}</div>` : ''}
<p/>
${pager(h, r, l)}
<table width="100%" border="0" align="center" cellpadding="3" cellspacing="0" class="border">
  <tr class="sectionheader">
    <td width="12%">&nbsp;</td>
    <td width="22%">&nbsp;</td>
    <td width="22%">&nbsp;</td>
    <td width="22%">&nbsp;</td>
    <td width="22%">&nbsp;</td>
  </tr></table>
${l.rows.length ? l.rows.map((e, i) => row(h, e, i)).join('\n') : '<p align="center">No items match.</p>'}
<table width="100%" border="0" align="center" cellpadding="3" cellspacing="0" class="border">
  <tr class="sectionheader">
    <td width="100%">&nbsp;</td>
  </tr></table>
<p/>
${pager(h, r, l)}`;
      const banner = `<b>${l.total.toLocaleString()}</b> items &middot; page <b>${Math.min(r.page, l.pages)}</b> of <b>${l.pages}</b> <span>${h.sortSelect(r)} ${h.archSelect(r)}</span>`;
      return page(ctx, { title, sub: `${l.total.toLocaleString()} items`, left, banner });
    },

    item(ctx) {
      const { h, item: e } = ctx;
      if (!e) return page(ctx, { title: 'Customization Museum', sub: 'Item not found', left: `${buttons(ctx)}<p>Item not found. <a href="${h.url.home()}">Back to the museum</a></p>` });
      const x = e.x || {}, file = h.file(e), img = h.thumb(e);
      const dl = file ? `<a href="${h.esc(file)}" class="downdbdownload" target="_blank" rel="noopener">download</a>` : '<span class="downdbdownload cm-nodl">no file</span>';
      const top = [['Last Update', fmtDate(e.d) || 'Unknown'], x.Creator ? ['Creator', h.esc(x.Creator)] : ['Program', `<a href="${h.url.app(e.k)}">${h.esc(e.a)}</a>`],
        x.Downloads ? ['Downloads', h.esc(x.Downloads)] : ['Type', e.y.map(t => `<a href="${h.url.type(t)}">${h.esc(t)}</a>`).join(', ')]];
      const rating = x.Rating ? `<span class="small">${h.esc(x.Rating)}</span>` : `<a href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a> &middot; ${h.esc(h.archivedLabel(e))}`;
      const compat = x.Compatibility ? `This skin works with Messenger versions <strong>${h.esc(x.Compatibility)}</strong>` : h.esc(e.g.join(', ') || e.y.join(', '));
      const links = [h.page(e) && `<a href="${h.esc(h.page(e))}" rel="external" target="_blank">Original page</a>`, `<a href="${h.esc(h.edit(e))}" target="_blank" rel="noopener">Edit</a>`, `<a href="${h.esc(h.report(e))}" target="_blank" rel="noopener">Report</a>`].filter(Boolean).join(' | ');
      const left = `${warning(h)}${buttons(ctx)}
${crumbs(h, [['Customization Museum', h.url.home()], [e.a, h.url.app(e.k)], [e.t, h.url.item(e)]])}
<table width="100%" border="1" align="center" cellpadding="3" cellspacing="0" class="border">
  <tr>
    <td width="75%" class="fileheader" valign="top" height="100%" colspan="3">
      <span class="largefilename">${h.esc(e.t)}</span> ${h.esc(e.a)}<br/>
    </td>
  </tr>
  <tr>
    <td width="15%">${top[0][0]}:</td>
    <td width="58%">${top[0][1]}</td>
    <td rowspan="3" width="27%" align="center">
        ${dl}
    </td>
  </tr>
      <tr>
      <td width="15%">${top[1][0]}:</td>
      <td width="55%">${top[1][1]}</td>
    </tr>
    <tr>
    <td width="15%">${top[2][0]}:</td>
    <td width="55%">${top[2][1]}</td>
  </tr>
  <tr>
    <td width="15%">${x.Rating ? 'Rating' : 'Source'}:</td>
    <td valign="top" width="85%" colspan="2">${rating}</td>
  </tr>
   <tr>
    <td width="15%">${x.Compatibility ? 'Compatibility' : 'Tags'}:</td>
    <td valign="top" width="85%" colspan="2">${compat}</td>
  </tr>
  <tr>
    <td class="skindetails" colspan="3" width="100%">
				          <p align="center">${img && !/\.(mp3|wav|ogg|mid|midi|wma|mp4|webm)$/i.test(e.l || '') ? `<a href="${h.esc(img)}" class="highslide" target="_blank" rel="noopener"><img class="frame cm-shot" src="${h.esc(img)}" alt="Screenshot" data-alt="${h.esc(h.thumbFallback(e))}" onerror="if(!this.dataset.f){this.dataset.f=1;this.src=this.dataset.alt}else{this.replaceWith(Object.assign(document.createElement('span'),{className:'frame cm-noshot',textContent:'no preview'}))}"/></a>` : img ? h.media(e) : '<span class="frame cm-noshot">no preview</span>'}</p>
                ${e.desc ? `<div class="cm-desc">${e.desc}</div>` : ''}
                	<p>More Info: ${links}</p>
            </td>
  </tr>
</table>
<table width="100%" border="0" align="center" cellpadding="3" cellspacing="0">
  <tr>
    <td width="100%" align="center">
        ${dl}
    </td>
  </tr>
</table>
<p>&nbsp;</p>`;
      return page(ctx, { title: 'Customization Museum', sub: e.a, left });
    },
  };
})();
