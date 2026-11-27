// label: Messenger Plus! Gallery
// Markup follows msgpluslive.net/skins (2009-2010) element for element; only content regions are filled from ctx.
(() => {
  const A = 'themes/msgplus/assets/';
  const WLM = 'wlm', MSN = 'msn-wlm';
  // pages of the original site that have no counterpart here open as their archived copies
  const orig = p => `https://web.archive.org/web/2009/http://www.msgpluslive.net/${p}`;
  const ext = 'rel="external noopener" target="_blank"';
  const FEED = 'https://github.com/melo-foundation/customization-museum/commits/main.atom';
  const dataDir = () => { const d = new URLSearchParams(location.search).get('data'); return d && /^[a-z0-9_./-]+\/$/i.test(d) && !d.includes('..') ? d : 'idx/'; };

  const fmtDate = d => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1];
    return mon && day ? `${mon} ${day}&#44; ${y}` : y;
  };
  const num = v => parseFloat(String(v || '').replace(/,/g, '')) || 0;
  const count = v => /^\d+$/.test(String(v)) ? (+v).toLocaleString('en-US') : v;
  const flat = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

  // "Life of Vista 2d" -> name + version, the way the original printed them (the name is in the original page address)
  const title = e => {
    const t = String(e.t).replace(/\\n/g, '').replace(/\s+-\s+Windows Live Messenger Skin$/, '').replace(/\s+/g, ' ').trim();
    const m = e.s === WLM && (e.p || '').match(/view\/\d+-(.+?)\/?$/);
    if (m) {
      const words = t.split(' '), want = flat(m[1]);
      for (let i = 1; i < words.length; i++) if (flat(words.slice(0, i).join(' ')) === want) return [words.slice(0, i).join(' '), words.slice(i).join(' ')];
    }
    return [t, ''];
  };

  const MEDIA = /\.(mp3|wav|ogg|mid|midi|wma|mp4|webm)$/i;
  const isPic = e => !!e.v && !MEDIA.test(e.v);
  // a screenshot that cannot be loaded leaves its cell as it would be without one
  window.cmMsgplusShot = img => {
    const next = (img.dataset.alt || '').split(' ').filter(Boolean);
    if (next.length) { img.dataset.alt = next.slice(1).join(' '); img.src = next[0]; return; }
    const cell = img.closest('td, p');
    cell?.querySelectorAll('br, a.highslide').forEach(n => n.remove());
    img.remove();
  };
  // the original showed <name>_thumb.jpg in lists and <name>_small.jpg on the skin's page; both were archived with it
  const sized = (h, e, size) => e.s === WLM && /\/uploads\/[^/]+\.jpg$/i.test(e.v) ? [`https://web.archive.org/web/2im_/${e.v.replace(/\.jpg$/i, `_${size}.jpg`)}`] : [];
  const shot = (h, e, cls, altText, size) => {
    const [src, ...rest] = [...new Set([...sized(h, e, size), h.thumb(e), h.thumbFallback(e)])];
    return `<img class="frame ${cls}" src="${h.esc(src)}" alt="${h.esc(altText)}" data-alt="${h.esc(rest.join(' '))}" onerror="cmMsgplusShot(this)"/>`;
  };
  const thumbCell = (h, e, name) => isPic(e) ? `${shot(h, e, 'cm-thumb', `${name} screenshot`, 'thumb')}
        <br/><a href="${h.esc(h.thumb(e))}" class="highslide" target="_blank" rel="noopener"><strong>full screenshot</strong></a>` : '';

  // labelled fields of a listing row, the original's five first, then what we have for items from elsewhere
  const fields = (h, e) => {
    const x = e.x || {}, out = [];
    if (x.Creator) out.push(['Creator', h.esc(x.Creator)]);
    if (e.d) out.push(['Added', fmtDate(e.d)]);
    if (x.Downloads) out.push(['Downloads', h.esc(count(x.Downloads))]);
    if (x.Rating) out.push(['Rating', h.esc(x.Rating)]);
    if (x.Compatibility) out.push(['Compatibility', h.esc(x.Compatibility)]);
    for (const f of [['Category', e.y.map(t => `<a href="${h.url.type(t)}">${h.esc(t)}</a>`).join(', ')], ['Program', `<a href="${h.url.app(e.k)}">${h.esc(e.a)}</a>`],
      ['Source', `<a href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a>`], ['Archived', h.esc(h.archivedLabel(e))]]) {
      if (out.length >= 5) break;
      out.push(f);
    }
    return out;
  };

  const clear = r => ({ ...r, app: '', type: '', site: '', tag: '', q: '', arch: '', sort: '', item: '', page: 1 });
  const browsing = () => location.hash === '#browse';
  const urls = ctx => {
    const { h, route: r } = ctx, all = clear(r);
    return {
      home: h.url.home(), browse: h.url.home() + '#browse', newest: h.link(all, {}), request: h.url.request(),
      skins: h.link(all, { site: WLM }), rating: h.link(all, { site: WLM, sort: 'rating' }), downloads: h.link(all, { site: WLM, sort: 'downloads' }),
    };
  };
  const tagline = (h, k) => `Give ${k === MSN ? 'Messenger' : k ? h.appName(k) : 'your programs'} a fresh new look`;

  const nav = u => [['home', u.home], ['news', orig('news/'), ext], ['download', u.newest], ['features', orig('features/'), ext], ['help', orig('help/'), ext], ['more', orig('more/'), ext]];

  const header = (ctx, title, sub) => {
    const { h } = ctx, u = urls(ctx);
    return `<div id="header">
	<h1><a href="${u.home}"><img src="${A}msgpluslive-logo.png" width="309" height="65" alt="Messenger Plus! Live - The Windows Live Messenger Extension"/></a></h1>
	<span class="cm-replica">Customization Museum replica</span>
	<ul id="mainnav">
${nav(u).map(([t, href, a]) => `		<li id="nav${t}"><a href="${href}"${t === 'download' ? ' id="mainnav-link-download"' : ''}${a ? ' ' + a : ''}>${t}</a></li>`).join('\n')}
	</ul>
	<div id="header-toolbar">
	    <a id="header-toolbar-changecolor" href="#" onclick="document.querySelector('.langbox select').focus();return false"><img src="${A}colorize.png" alt="Change color scheme"/></a>
	 </div>
</div>
<div id="contentheaderhelper">
<div id="contentheader">
	<h2>${h.esc(title)}</h2>
<h3>${h.esc(sub)}</h3>
</div>
</div>
<div id="contentheaderright">
	<div class="langbox">
	<label>Viewing site in:&nbsp;</label>
	${h.themePicker()}${h.fidelityToggle()}
</div></div>`;
  };

  const sidebar = (ctx) => {
    const { h, route: r } = ctx, u = urls(ctx);
    const li = (href, label, sub, a) => `				<li><a href="${href}"${a ? ' ' + a : ''}>${label}${sub ? `					<span>${sub}</span>` : ''}</a></li>`;
    return `	<div class="right">
		<form method="get" id="searchform" data-search>
			<div>
				<input type="text" value="${h.esc(r.q)}" name="q" id="q" style="width:130px;"/><br/>
				<input type="submit" id="searchsubmit" value="Search Skins"/>
			</div>
		</form>
		<p align="center">
		<a href="${FEED}" ${ext}><img src="${A}feedicon.gif" width="14" height="14" alt="RSS Feed"/> Skin updates via RSS</a><br/><br/>
		<span class="cm-pick">${h.sortSelect(r)}${h.archSelect(r)}</span>
		</p>
		<div class="box">
			<h5>skinning links</h5>
			<ul>
${li(u.skins, 'Featured Skins', 'Awesome skins you shouldn&#039;t miss')}
${li(orig('skins/resources/'), 'Create a Skin', 'Everything you need to know to get started', ext)}
${li(u.request, 'Submit a Skin', '', ext)}
${li(orig('skins/help/'), 'Skins Help', '', ext)}
${li(orig('skins/stats/'), 'Statistics', '', ext)}
			</ul>
		</div>
		<div class="box">
			<h5>more things you can do</h5>
			<ul>
${li(orig('download/'), 'Download Plus!', '', ext)}
${li(orig('help/'), 'Help &amp; Forums', '', ext)}
			</ul>
		</div>
	</div>`;
  };

  const footer = (ctx) => {
    const u = urls(ctx);
    return `<div id="footer">
	<div id="gfddlogo"><a href="https://web.archive.org/web/2009/http://www.gfddgroup.com/" ${ext}><img src="${A}gfdd.png" alt="Design and Web Development by GFDD Group" width="137" height="35"/></a></div>
	<p>Messenger Plus!&#8482; &amp; MsgPlus &copy;2001-2010 by Yuna Software<br/>
	<small>MSN and Windows Live are registered trademarks of Microsoft Corporation.<br/>
	Other products' names may be trademarked by their respective owners.<br/>
	This replica by Customization Museum is not affiliated in <em>any</em> way with Yuna Software or Microsoft Corporation.</small>
	</p>
	<p class="side"><small><a href="${u.request}" ${ext}> request </a>&amp;<a href="${u.request}" ${ext}> report </a></small></p>
	<p class="links">${nav(u).map(([t, href, a], i, l) => `<a href="${href}"${a ? ' ' + a : ''}>${i ? ' ' : ''}${t}${i < l.length - 1 ? ' ' : ''}</a>`).join('|')}</p>
</div>`;
  };

  const page = (ctx, o) => `<div id="bghelper">
<div id="container">
${header(ctx, o.title, o.sub)}
<div class="content">
	<div class="left">
${o.left}
</div>
${sidebar(ctx)}
</div>
${footer(ctx)}
</div>
</div>`;

  const important = h => h.warning()
    ? `<div class="highlight important cm-warning"><strong>Important:</strong> Files are archived automatically and are not checked. They may contain malware: scan anything you download. <button data-dismiss-warning>OK</button></div>`
    : '';

  const buttons = (ctx) => {
    const { h, route: r } = ctx, u = urls(ctx);
    return ` <table width="100%" align="center" cellpadding="3" cellspacing="0" border="0">
  <tr>
    <td align="right">
    </td>
  </tr>
</table>
<div class="downdbbuttons"><a href="${r.item || browsing() ? u.newest : h.link(r, { sort: '' })}" class="downdbbydate">browse by date</a>
<a href="${u.rating}" class="downdbbyrating">browse by rating</a>
<a href="${u.downloads}" class="downdbbydownloads">browse by downloads</a>
<a href="${u.browse}" class="downdbbycategory">browse by category</a></div>`;
  };

  const crumbs = (h, list) => `<table class="afterdowndbbuttons" width="100%" border="0" align="center" cellpadding="3" cellspacing="0">
  <tr>
    <td><h4>
${list.map(([t, u]) => `                &raquo; ${u ? `<a href="${u}">${h.esc(t)}</a>` : h.esc(t)} `).join('\n')}
          </h4></td>
  </tr>
</table><p/>`;

  // seven page numbers around the current one plus the last, as the original printed them
  const pager = (h, r, l) => {
    if (l.pages < 2) return '<p/>';
    const at = l.page, from = Math.max(1, Math.min(at - 3, l.pages - 6)), nums = [];
    for (let n = from; n <= Math.min(l.pages, from + 6); n++) nums.push(n);
    if (nums[0] > 1) nums.unshift(1);
    if (nums.at(-1) < l.pages) nums.push(l.pages);
    const a = (n, t) => `<a href="${h.link(r, { page: n })}">${t}</a>`;
    const links = [at > 1 ? a(at - 1, '&lt;&lt; Previous Page') : '', ...nums.map(n => a(n, n === at ? `[ ${n} ]` : n)), at < l.pages ? a(at + 1, 'Next Page &gt;&gt;') : ''].filter(Boolean);
    return `<div align="center">\n${links.join('\n')}\n</div><p/>`;
  };

  const row = (h, e, i) => {
    const bg = i % 2 ? '#ebf8ff' : '#f6fcff', u = h.url.item(e), [name, ver] = title(e);
    const f = fields(h, e);
    return `<table onclick="if(!event.target.closest('a'))location.href='${u}'" width="100%" border="0" align="center" cellpadding="3" cellspacing="0" class="border" onmouseover="this.style.backgroundColor='#ffffda';" onmouseout="this.style.backgroundColor='${bg}';" style="background-color:${bg}; cursor:pointer;">
   <tr>
    <td width="35%" rowspan="${f.length + 1}" align="center">
        ${thumbCell(h, e, name)}
            </td>
    <td width="88%" colspan="2">
      <a href="${u}"><b>${h.esc(name)}</b></a> ${h.esc(ver)}
    </td>
  </tr>
${f.map(([k, v], j) => `   <tr>
    <td width="65%" align="left" colspan="2">
    <i>${k}:</i> ${v}${j === f.length - 1 ? '        <br/>&nbsp;' : ''}
    </td>
  </tr>`).join('\n')}
</table>`;
  };
  const rows = (h, list) => list.length ? list.map((e, i) => row(h, e, i)).join('\n') : '<p align="center">No skins found.</p>';

  // ----- the Messenger Plus! skins themselves: rating and download order, front page boxes -----
  let skins;
  const loadSkins = h => skins ??= fetch(`${h.url.home()}${dataDir()}app/${MSN}.json`).then(r => r.json()).then(l => l.filter(e => e.s === WLM));
  const ORDER = {
    rating: (a, b) => num(b.x?.Rating) - num(a.x?.Rating) || num(b.x?.Downloads) - num(a.x?.Downloads),
    downloads: (a, b) => num(b.x?.Downloads) - num(a.x?.Downloads),
  };
  const ownOrder = r => r.site === WLM && !r.app && ORDER[r.sort];

  const fillRows = async (ctx, el) => {
    const box = el.querySelector('[data-cm-rows]');
    if (!box) return;
    const { h, route: r } = ctx, per = THEMES.msgplus.perPage, words = r.q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = (await loadSkins(h)).filter(e => (!r.type || e.y.some(t => h.slug(t) === h.slug(r.type))) && (!r.tag || e.g.includes(r.tag)) && (!r.arch || (r.arch === '1') === !!e.z)
      && words.every(w => (e.t + ' ' + e.g.join(' ') + ' ' + e.y.join(' ')).toLowerCase().includes(w))).sort(ownOrder(r));
    box.innerHTML = rows(h, hits.slice((ctx.list.page - 1) * per, ctx.list.page * per));
  };

  const fillFeatured = async (ctx, el) => {
    const boxes = el.querySelectorAll('table[data-feat]');
    if (!boxes.length) return;
    const { h } = ctx, list = (await loadSkins(h)).filter(isPic);
    if (!list.length) return;
    const used = new Set(), first = l => { const e = l.find(e => !used.has(e.i)); if (e) used.add(e.i); return e; };
    const pick = {};
    pick.new = first([...list].sort((a, b) => b.d.localeCompare(a.d)));
    pick.rating = first([...list].sort(ORDER.rating));
    // a different well-liked skin every day
    const liked = [...list].sort(ORDER.downloads).slice(0, 40).filter(e => !used.has(e.i));
    pick.featured = liked[Math.floor(Date.now() / 864e5) % liked.length];
    for (const t of boxes) {
      const e = pick[t.dataset.feat];
      if (!e) continue;
      const u = h.url.item(e), [name] = title(e), tds = t.querySelectorAll('td');
      t.onclick = ev => { if (!ev.target.closest('a')) location.href = u; };
      t.style.cursor = 'pointer';
      tds[0].innerHTML = thumbCell(h, e, name);
      tds[1].innerHTML = `<strong><a href="${u}">${h.esc(name)}</a></strong>`;
      fields(h, e).filter(([k]) => k !== 'Rating').slice(0, 4).forEach(([k, v], i) => { tds[2 + i].innerHTML = `<em>${k}:</em> ${v}`; });
    }
  };

  const browse = (ctx) => {
    const { h, manifest: m } = ctx;
    const n = v => v.toLocaleString('en-US');
    const block = (name, list) => `<table width="100%" border="0" align="center" cellpadding="3" cellspacing="0" class="border">
  <tr class="sectionheader">
    <td width="85%">${name}</td>
    <td width="15%">Skins</td>
  </tr></table>
${list.map(([href, t, c], i) => { const bg = i % 2 ? '#ebf8ff' : '#f6fcff'; return `<table width="100%" border="0" align="center" cellpadding="3" cellspacing="0" class="border" onmouseover="this.style.backgroundColor='#ffffda';" onmouseout="this.style.backgroundColor='${bg}';" onclick="this.querySelector('a').click()" style="background-color:${bg}; cursor:pointer;">
  <tr>
    <td width="85%">
      <a href="${href}" onclick="event.stopPropagation()">${h.esc(t)}</a><br/>
    </td>
    <td width="15%" align="center">${n(c)}</td>
  </tr></table>`; }).join('\n')}`;
    const left = `${buttons(ctx)}
${crumbs(h, [['Messenger Skins', h.url.home()], ['Browse by Category', h.url.home() + '#browse']])}
${block('Category', Object.entries(m.types).map(([t, c]) => [h.url.type(t), t, c]))}
<p/>
${block('Program', m.apps.map(a => [h.url.app(a.slug), a.name, a.count]))}
<p/>
${block('Source', Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).map(([s, i]) => [h.url.site(s), i.name, i.count]))}
<p>&nbsp;</p>`;
    return page(ctx, { title: 'Skins Database', sub: tagline(h, ''), left });
  };

  THEMES.msgplus = {
    label: 'Messenger Plus! Gallery',
    perPage: 10,
    after(ctx, el) {
      document.body.className = 'skinsdb';
      return Promise.all([fillFeatured(ctx, el), fillRows(ctx, el)]);
    },

    home(ctx) {
      if (browsing()) return browse(ctx);
      const { h, manifest: m } = ctx, u = urls(ctx);
      const cats = Object.keys(m.types).slice(0, 9).map(t => `<li><a href="${h.url.type(t)}">${h.esc(t)}</a></li>`).join('');
      const sources = Object.entries(m.sites).sort((a, b) => b[1].count - a[1].count).slice(0, 3).map(([s, i]) => `	<li><a href="${h.url.site(s)}">${h.esc(i.name)}</a></li>`).join('\n');
      const feat = (heading, key, more, moreUrl) => `<h3>${heading}</h3>
<div class="highlightwidthfix3 subhighlight"><div class="r1"><div class="r2"><div class="r5">

<table width="100%" data-feat="${key}">
	<tr>
    <td rowspan="7" align="center" width="50%">
    </td>
  <td width="50%">&nbsp;</td></tr>
  <tr><td width="50%">&nbsp;</td></tr>
  <tr><td width="50%">&nbsp;</td></tr>
  <tr><td width="50%">&nbsp;</td></tr>
	<tr><td width="50%">&nbsp;</td></tr>
  <tr><td width="50%" align="right"><strong><a href="${moreUrl}">${more} &gt;</a></strong></td></tr>
</table>
</div></div></div></div>`;
      const left = `${important(h) || `<div class="highlight important"><strong>Important:</strong> You need to have <a href="${orig('download/')}" ${ext}>Messenger Plus! Live</a> installed before being able to install Skins.</div>`}

	<img src="${A}skins-bigicon.png" width="138" height="126" alt="Messenger Plus! Live Skins" title="" style="float:left;margin:0 15px 0px -15px"/>
	<h3>What are Skins?</h3>

  <p>Skins change the way your Messenger windows look. We have some awesome designs available for download which will greatly improve the old Live Messenger look, and this museum keeps them next to ${m.total.toLocaleString('en-US')} skins, themes, emoticons and other add-ons made for ${m.apps.length} programs. Just browse the database and download a skin you like: every entry links to its original page and to an archived copy of its file when one exists. Enjoy!</p>

  <h2 style="clear:both"><a href="${u.browse}">Browse the Skins Database</a></h2>
  <p>View and download many skins created by users like you. </p>

<div class="featuredbox clearfix" style="margin-bottom:15px">
		<div class="left2 clearfix">

<h3>Skin Snapshots</h3><div class="subhighlight clearfix"><div class="r1"><div class="r2"><div class="r4">
<ul>
<li><a href="${u.skins}">Featured Skins</a></li>
<li><a href="${u.newest}">New Skins</a></li>
<li><a href="${u.rating}">Top Rated Skins</a></li>
<li><a href="${u.downloads}">Most Downloaded Skins</a></li>
</ul>
</div></div></div></div>
<h3>Categories</h3><div class="subhighlight clearfix"><div class="r1"><div class="r2"><div class="r6"><ul>
${cats}</ul>
</div></div></div></div>

<h3 style="margin-top:10px;">External Resources</h3>
<p>Additional help and skins may be found at these addresses:</p>
<ul>
${sources}
	</ul>

	</div>
		<div class="right2 clearfix">

${feat('Featured Skin', 'featured', 'More Featured Skins', u.skins)}
${feat('Just Added', 'new', 'More New Skins', u.skins)}
${feat('Top Rated', 'rating', 'More Top Rated Skins', u.rating)}

		</div>
</div>

<h2>These are nice and all... but how can I add mine?!</h2>
<p>To add a skin, a whole pack or a forgotten site, all you need to do is fill in a <a href="${u.request}" ${ext}>request</a>. Requested pages are saved on the <a rel="external noopener" target="_blank" href="https://web.archive.org/">Wayback Machine</a> first and then listed here, so nothing has to be uploaded by hand. A wrong or broken entry can be reported from its own page.</p>
`;
      return page(ctx, { title: 'Messenger Skins', sub: tagline(h, MSN), left });
    },

    list(ctx) {
      const { h, route: r, list: l, about } = ctx;
      const own = ownOrder(r);
      const sname = own ? (r.sort === 'rating' ? 'Browse by Rating' : 'Browse by Downloads') : r.sort === 'old' ? 'Oldest First' : r.sort === 'az' ? 'Browse by Name' : 'Browse by Date';
      const bc = [['Messenger Skins', h.url.home()]];
      if (r.app) bc.push([h.appName(r.app), h.url.app(r.app)]);
      if (r.site && r.site !== WLM) bc.push([h.siteName(r.site), h.url.site(r.site)]);
      if (l.typeName) bc.push([l.typeName, h.url.type(l.typeName)]);
      if (r.tag) bc.push([r.tag, h.link(r, {})]);
      if (r.q) bc.push([`Search: ${r.q}`, h.link(r, {})]);
      bc.push([sname, h.link(r, {})]);
      const left = `${important(h)}${buttons(ctx)}
${crumbs(h, bc)}
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
${own ? '<div data-cm-rows></div>' : rows(h, l.rows)}
<table width="100%" border="0" align="center" cellpadding="3" cellspacing="0" class="border">
  <tr class="sectionheader">
    <td width="100%">&nbsp;</td>
  </tr></table>
<p/>
${pager(h, r, l)}
${about && r.site !== WLM ? `<div class="highlight cm-about"><span class="cm-tools"><a href="${h.esc(about.edit)}" target="_blank" rel="noopener">Edit</a></span>${about.html}</div>` : ''}`;
      return page(ctx, { title: 'Skins Database', sub: tagline(h, r.app || (r.site === WLM ? MSN : '')), left });
    },

    item(ctx) {
      const { h, item: e } = ctx;
      if (!e) return page(ctx, { title: 'Skins Database', sub: tagline(h, ''), left: `${buttons(ctx)}
${crumbs(h, [['Messenger Skins', h.url.home()]])}
<p>This skin could not be found.</p>` });
      const x = e.x || {}, file = h.file(e), [name, ver] = title(e);
      const dl = file ? `<a href="${h.esc(file)}" class="downdbdownload" target="_blank" rel="noopener">download</a>` : '';
      const full = Math.max(0, Math.min(5, Math.round(num(x.Rating))));
      const info = e.d ? [['Last Update', fmtDate(e.d)]] : [];
      if (x.Creator) info.push(['Creator', h.esc(x.Creator)]);
      if (x.Downloads) info.push(['Downloads', h.esc(count(x.Downloads))]);
      if (x.Rating) info.push(['Rating', `
${Array.from({ length: 5 }, (_, i) => `              <img src="${A}star_${i < full ? 'full' : 'grey'}.gif" alt="*"/>`).join('\n')}
       <span class="small">(${h.esc(x.Rating)})</span>&nbsp;`]);
      if (x.Compatibility) info.push(['Compatibility', `This skin works with Messenger versions <strong>${h.esc(x.Compatibility)}</strong> (<a href="${orig('skins/help/#compatibility')}" ${ext}>why?</a>)`]);
      if (e.s !== WLM) {
        info.push(['Category', e.y.map(t => `<a href="${h.url.type(t)}">${h.esc(t)}</a>`).join(', ')], ['Program', `<a href="${h.url.app(e.k)}">${h.esc(e.a)}</a>`], ['Source', `<a href="${h.url.site(e.s)}">${h.esc(h.siteName(e.s))}</a>`]);
        for (const [k, v] of Object.entries(x)) if (!['Creator', 'Downloads', 'Rating', 'Compatibility'].includes(k)) info.push([h.esc(k), h.esc(v)]);
      }
      if (e.g.length) info.push(['Tags', e.g.map(t => `<a href="${h.link(clear(ctx.route), { tag: t })}">${h.esc(t)}</a>`).join(', ')]);
      info.push(['Archived', h.esc(h.archivedLabel(e))]);
      while (info.length < 3) info.push(['', '&nbsp;']);
      const links = [h.page(e) && `<a href="${h.esc(h.page(e))}" rel="external noopener" target="_blank">original page</a>`, `<a href="${h.esc(h.edit(e))}" target="_blank" rel="noopener">edit</a>`, `<a href="${h.esc(h.report(e))}" target="_blank" rel="noopener">report</a>`].filter(Boolean).join(' | ');
      const pic = isPic(e) ? `<a href="${h.esc(h.thumb(e))}" class="highslide" target="_blank" rel="noopener">${shot(h, e, 'cm-shot', 'Screenshot', 'small')}</a>` : e.v || MEDIA.test(e.l || '') ? h.media(e) : '';
      const left = `${important(h)}${buttons(ctx)}
${crumbs(h, [['Messenger Skins', h.url.home()], [e.a, h.url.app(e.k)], ...(e.y[0] ? [[e.y[0], h.url.type(e.y[0])]] : []), [name, h.url.item(e)]])}
<table width="100%" border="1" align="center" cellpadding="3" cellspacing="0" class="border">
  <tr>
    <td width="75%" class="fileheader" valign="top" height="100%" colspan="3">
      <span class="largefilename">${h.esc(name)}</span> ${h.esc(ver)}<br/>
    </td>
  </tr>
  <tr>
    <td width="15%">${info[0][0]}:</td>
    <td width="58%">${info[0][1]}</td>
    <td rowspan="3" width="27%" align="center">
        ${dl}
    </td>
  </tr>
${info.slice(1, 3).map(([k, v]) => `    <tr>
      <td width="15%">${k ? k + ':' : '&nbsp;'}</td>
      <td width="55%">${v}</td>
    </tr>`).join('\n')}
${info.slice(3).map(([k, v]) => `  <tr>
    <td width="15%">${k}:</td>
    <td valign="top" width="85%" colspan="2">${v}</td>
  </tr>`).join('\n')}
  <tr>
    <td class="skindetails" colspan="3" width="100%">
				          ${pic ? `<p align="center">${pic}</p>` : ''}
                ${e.desc ? `<div class="cm-desc">${e.desc}</div>` : ''}
                	<p>This entry: ${links}</p>
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
      return page(ctx, { title: 'Skins Database', sub: tagline(h, e.k), left });
    },
  };
})();
