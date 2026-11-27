// Customization Museum core: data loading, routing, filtering, paging. Themes (themes/<name>/theme.js) only render.
const ROOT = new URL('.', document.baseURI).href;
const REPO = 'melo-foundation/customization-museum';
const PER_PAGE = 48;
const THEMES = window.THEMES = {};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const real = f => !!f && /^\d{14}/.test(f);
const wb = (f, url, mode = '') => { const [ts, u] = f.split('|'); return `https://web.archive.org/web/${ts}${mode}/${u || url}`; };
const ext = u => ((u || '').split(/[?#]/)[0].match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';
const tally = list => Object.entries(list.reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]);

// ---------- data ----------
const cache = {};
const once = (key, fn) => cache[key] ??= fn();
// ?data=<folder>/ swaps the archive for a fixture with the same layout as idx/ (used to render a theme
// with an original page's own content when checking it 1:1)
const dataParam = new URLSearchParams(location.search).get('data');
const DATA = dataParam && /^[a-z0-9_./-]+\/$/i.test(dataParam) && !dataParam.includes('..') ? dataParam : 'idx/';
const getJSON = p => fetch(ROOT + p).then(r => { if (!r.ok) throw new Error(p); return r.json(); });
const manifest = () => once('manifest', () => getJSON(DATA + 'manifest.json'));
const shard = k => once('app:' + k, () => getJSON(`${DATA}app/${k}.json`));
const index = () => once('index', () => getJSON(DATA + 'index.json').then(rows => rows.map(([i, t, k, s, d, y, g, z]) => ({ i, t, k, s, d, y, g, z }))));

// ---------- routes ----------
// Path holds at most one of app/type/site (canonical section URL); everything else is in the query string.
const FILTERS = ['app', 'type', 'site', 'tag', 'q', 'sort', 'arch', 'page'];
function parseRoute(href = location.href) {
  const u = new URL(href), rest = u.href.slice(ROOT.length).split(/[?#]/)[0];
  const r = Object.fromEntries(FILTERS.map(k => [k, u.searchParams.get(k) || '']));
  const m = rest.match(/^(app|type|site)\/([^/]+)\/?$/);
  if (m) r[m[1]] = decodeURIComponent(m[2]);
  // legacy hash links (#site=wlm&tag=x)
  if (u.hash.length > 1) for (const [k, v] of new URLSearchParams(u.hash.slice(1))) if (FILTERS.includes(k) && !r[k]) r[k] = v;
  r.item = rest.startsWith('item/') ? u.searchParams.get('id') || '' : '';
  r.page = Math.max(1, parseInt(r.page) || 1);
  return r;
}
function routeUrl(r) {
  if (r.item) return `${ROOT}item/?id=${encodeURIComponent(r.item)}`;
  const primary = ['app', 'type', 'site'].filter(k => r[k]);
  let path = '', q = new URLSearchParams();
  if (primary.length === 1) path = `${primary[0]}/${primary[0] === 'type' ? slug(r.type) : r[primary[0]]}/`;
  for (const k of FILTERS) {
    if (!r[k] || (k === 'page' && r[k] === 1) || (primary.length === 1 && k === primary[0])) continue;
    q.set(k, r[k]);
  }
  const qs = q.toString();
  return ROOT + path + (qs ? '?' + qs : '');
}
const withRoute = (cur, change) => routeUrl({ ...cur, page: 1, item: '', ...change });

// ---------- helpers given to themes ----------
const h = {
  esc, slug, ext,
  appName: k => cache.names?.[k] || k,
  siteName: s => cache.sites?.[s]?.name || s,
  url: {
    home: () => ROOT,
    app: k => `${ROOT}app/${k}/`,
    type: t => `${ROOT}type/${slug(t)}/`,
    site: s => `${ROOT}site/${s}/`,
    item: e => `${ROOT}item/?id=${encodeURIComponent(e.i)}`,
    request: () => `https://github.com/${REPO}/issues/new/choose`,
  },
  thumb: e => e.v ? (e.tv ? wb(e.tv, e.v, 'im_') : e.v) : '',
  thumbFallback: e => e.v ? (e.tv ? e.v : wb('2', e.v, 'im_')) : '',
  // <img> with fallback to the live/Wayback copy, then removal. Themes can pass extra attributes.
  img: (e, attrs = '') => {
    const src = h.thumb(e);
    return src ? `<img src="${esc(src)}" loading="lazy" alt="${esc(e.t)}" data-alt="${esc(h.thumbFallback(e))}" onerror="if(!this.dataset.f){this.dataset.f=1;this.src=this.dataset.alt}else{this.remove()}" ${attrs}>` : '';
  },
  file: e => e.l ? (real(e.tl) ? wb(e.tl, e.l, 'id_') : e.l) : '',
  page: e => e.p ? (real(e.tp) ? wb(e.tp, e.p) : e.p) : '',
  archivedOn: f => real(f) ? `${f.slice(0, 4)}-${f.slice(4, 6)}-${f.slice(6, 8)}` : '',
  // one-line archive status for list views, consistent with the tested build flag (e.z)
  archivedLabel: e => !e.z ? 'Not yet' : h.archivedOn(e.tl) || h.archivedOn(e.tp) || (e.tp === '2' || e.tl === '2' ? 'Recovered from the Wayback Machine' : 'Hosted on archive.org'),
  report: e => `https://github.com/${REPO}/issues/new?template=report.yml&title=${encodeURIComponent('Report: ' + e.t)}&item=${encodeURIComponent(e.t + ' (' + e.a + ')')}&link=${encodeURIComponent(e.l || e.p || '')}`,
  edit: e => {
    const key = encodeURIComponent(e.i);
    const tpl = `---\ntitle: ${e.t}\ndate: ${e.d}\ntype: ${e.y.join(', ')}\ntags: ${e.g.join(', ')}\n---\n\n`;
    return e.m ? `https://github.com/${REPO}/edit/main/items/${key}.md` : `https://github.com/${REPO}/new/main?filename=items/${key}.md&value=${encodeURIComponent(tpl)}`;
  },
  // big preview / player for the item page
  media: e => {
    const file = h.file(e), x = ext(e.l), poster = h.thumb(e);
    if (['mp4', 'webm'].includes(x)) return `<video src="${esc(file)}" controls loop ${poster ? `poster="${esc(poster)}"` : ''}></video>`;
    const pic = h.img(e, `onload="if(this.naturalWidth&&this.naturalWidth<160){this.style.width=Math.min(this.naturalWidth*3,480)+'px';this.style.imageRendering='pixelated'}"`) || '<span class="nopreview">No preview</span>';
    if (['mp3', 'wav', 'ogg', 'mid', 'midi', 'wma'].includes(x)) return `${pic}<audio src="${esc(file)}" controls></audio>`;
    return pic;
  },
  // details as [label, html] rows; themes lay them out
  details: e => [
    ['Program', `<a href="${h.url.app(e.k)}">${esc(e.a)}</a>`],
    ['Type', e.y.map(t => `<a href="${h.url.type(t)}">${esc(t)}</a>`).join(', ')],
    e.g.length && ['Tags', e.g.map(t => `<a href="${esc(withRoute({}, { tag: t }))}">${esc(t)}</a>`).join(', ')],
    e.d && ['Date', esc(e.d)],
    ['Source', `<a href="${h.url.site(e.s)}">${esc(h.siteName(e.s))}</a>`],
    ...Object.entries(e.x || {}).map(([k, v]) => [esc(k), esc(v)]),
    ['Page archived', h.archivedOn(e.tp) || (e.tp === '2' ? 'Recovered from the Wayback Machine' : e.p ? 'Not yet' : '')],
    e.l && ['File archived', h.archivedOn(e.tl) || (e.tl === '2' ? 'Recovered from the Wayback Machine' : /archive\.org\//.test(e.l) ? 'Hosted on archive.org' : 'Not yet')],
  ].filter(r => r && r[1]),
  md(src) {
    const inline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>');
    let out = '', list = false, para = [];
    const flushP = () => { if (para.length) out += `<p>${inline(para.join(' '))}</p>`; para = []; };
    const flushL = () => { if (list) out += '</ul>'; list = false; };
    for (const line of src.split('\n')) {
      const hd = line.match(/^(#{1,3})\s+(.*)/), li = line.match(/^\s*[-*]\s+(.*)/);
      if (hd) { flushP(); flushL(); out += `<h${hd[1].length}>${inline(hd[2])}</h${hd[1].length}>`; }
      else if (li) { flushP(); if (!list) { out += '<ul>'; list = true; } out += `<li>${inline(li[1])}</li>`; }
      else if (!line.trim()) { flushP(); flushL(); }
      else { flushL(); para.push(line.trim()); }
    }
    flushP(); flushL();
    return out;
  },
  // shared bits every theme should place somewhere
  warning: () => localStorage.getItem('warned') ? '' : `<div class="cm-warning">Files are archived automatically and not checked. They may contain malware: scan anything you download. <button data-dismiss-warning>OK</button></div>`,
  // shown only for themes that ship a modern.css
  fidelityToggle: () => THEMES[currentTheme]?.modern ? `<select data-fidelity aria-label="Fidelity"><option value="readable"${readable() ? ' selected' : ''}>Readable</option><option value="exact"${readable() ? '' : ' selected'}>1:1</option></select>` : '',
  themePicker: () => `<select data-theme aria-label="Theme">${Object.entries(THEMES).map(([k, t]) => `<option value="${k}"${k === currentTheme ? ' selected' : ''}>${esc(t.label)}</option>`).join('')}</select>`,
  searchForm: (r, placeholder = 'Search') => `<form data-search role="search"><input type="search" name="q" value="${esc(r.q)}" placeholder="${esc(placeholder)}"></form>`,
  sortSelect: r => `<select data-sort aria-label="Sort">${[['', 'Newest'], ['old', 'Oldest'], ['az', 'A–Z']].map(([v, l]) => `<option value="${v}"${r.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`,
  archSelect: r => `<select data-arch aria-label="Archived">${[['', 'All'], ['1', 'Archived'], ['0', 'Not archived']].map(([v, l]) => `<option value="${v}"${r.arch === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`,
  // numbered pager: [{n, url, current}] plus prev/next
  pager: (r, pages) => {
    const near = new Set([1, pages, r.page - 2, r.page - 1, r.page, r.page + 1, r.page + 2].filter(n => n >= 1 && n <= pages));
    const nums = [...near].sort((a, b) => a - b);
    return {
      prev: r.page > 1 ? withRoute(r, { page: r.page - 1 }) : '', next: r.page < pages ? withRoute(r, { page: r.page + 1 }) : '',
      items: nums.flatMap((n, i) => [...(i && n - nums[i - 1] > 1 ? [{ gap: true }] : []), { n, url: withRoute(r, { page: n }), current: n === r.page }]),
    };
  },
  link: (r, change) => withRoute(r, change),
};

// ---------- query ----------
function matches(e, r) {
  if (r.app && e.k !== r.app) return false;
  if (r.site && e.s !== r.site) return false;
  if (r.type && !e.y.some(t => slug(t) === slug(r.type))) return false;
  if (r.tag && !e.g.includes(r.tag)) return false;
  if (r.arch && (r.arch === '1') !== !!e.z) return false;
  if (r.q) {
    const words = r.q.toLowerCase().split(/\s+/).filter(Boolean), hay = (e.t + ' ' + e.g.join(' ') + ' ' + e.y.join(' ')).toLowerCase();
    if (!words.every(w => hay.includes(w))) return false;
  }
  return true;
}
const SORTS = {
  '': (a, b) => (b.d || '').localeCompare(a.d || ''),
  old: (a, b) => (a.d || '9').localeCompare(b.d || '9'),
  az: (a, b) => a.t.localeCompare(b.t),
};

async function list(r, perPage = PER_PAGE) {
  // one program needs only its own file; anything else filters the compact index
  const rows = r.app ? await shard(r.app) : await index();
  const typeName = r.type && Object.keys(cache.types).find(t => slug(t) === slug(r.type));
  const base = rows.filter(e => matches(e, { ...r, app: r.app, type: '', tag: '' }));
  const inType = base.filter(e => !r.type || e.y.some(t => slug(t) === slug(r.type)));
  const hits = inType.filter(e => !r.tag || e.g.includes(r.tag)).sort(SORTS[r.sort] || SORTS['']);
  const pages = Math.max(1, Math.ceil(hits.length / perPage));
  const page = Math.min(r.page, pages);
  const slice = hits.slice((page - 1) * perPage, page * perPage);
  // page rows need full data: fetch the program files that appear on this page
  const full = {};
  await Promise.all([...new Set(slice.map(e => e.k))].map(async k => (await shard(k)).forEach(e => full[e.i] = e)));
  return {
    rows: slice.map(e => full[e.i] || e), total: hits.length, page, pages,
    typeName: typeName || r.type,
    facets: {
      apps: tally(base.map(e => e.k)).map(([k, n]) => [k, h.appName(k), n]),
      types: tally(base.flatMap(e => e.y)),
      tags: tally(inType.flatMap(e => e.g)).slice(0, 60),
    },
  };
}

async function siteAbout(s) {
  const m = await manifest(), info = m.sites[s];
  if (!info) return null;
  const items = (await Promise.all(info.apps.map(shard))).flat().filter(e => e.s === s);
  const dates = items.map(e => e.d).filter(Boolean).sort();
  const top = arr => tally(arr).slice(0, 8).map(([k, n]) => `${k} (${n})`).join(', ');
  const auto = `# ${info.name}\n\n${items.length} items${dates.length ? `, ${dates[0].slice(0, 4)} to ${dates.at(-1).slice(0, 4)}` : ''}.\n\n- Programs: ${top(items.map(e => e.a))}\n- Types: ${top(items.flatMap(e => e.y))}\n- Archived: ${items.filter(e => e.z).length} of ${items.length}\n- Site: https://${info.name}\n`;
  const key = `site-${s}`, has = m.pages.includes(key);
  const text = has ? await fetch(`${ROOT}pages/${key}.md`).then(r => r.ok ? r.text() : auto) : auto;
  return {
    name: info.name, html: h.md(text),
    edit: has ? `https://github.com/${REPO}/edit/main/pages/${key}.md` : `https://github.com/${REPO}/new/main?filename=pages/${key}.md&value=${encodeURIComponent(auto)}`,
  };
}

async function findItem(id) {
  const hit = (await index()).find(e => e.i === id);
  if (!hit) return null;
  const row = (await shard(hit.k)).find(e => e.i === id);
  if (row?.n && !row.m) row.desc = h.md(row.n);
  if (row?.m) row.desc = h.md((await fetch(`${ROOT}items/${encodeURIComponent(id)}.md`).then(r => r.ok ? r.text() : '')).replace(/^---[\s\S]*?\n---\n?/, ''));
  return row;
}

// ---------- render ----------
// ?theme=<name> selects a theme (shareable links, screenshot tooling); it is remembered like the picker
const themeParam = new URLSearchParams(location.search).get('theme');
if (themeParam && /^[a-z0-9-]+$/.test(themeParam)) localStorage.setItem('theme', themeParam);
if (new URLSearchParams(location.search).get('warned') === '1') localStorage.setItem('warned', '1');
const fidelityParam = new URLSearchParams(location.search).get('fidelity');
if (['exact', 'readable'].includes(fidelityParam)) localStorage.setItem('fidelity', fidelityParam);
let currentTheme = localStorage.getItem('theme') || 'default', renderToken = 0;
function loadTheme(name) {
  if (THEMES[name]?.home) return Promise.resolve(THEMES[name]);
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = `${ROOT}themes/${name}/theme.js`;
    const modern = THEMES[name]?.modern;
    s.onload = () => THEMES[name]?.home ? (THEMES[name].modern ??= modern, ok(THEMES[name])) : fail(new Error('theme did not register: ' + name));
    s.onerror = fail;
    document.head.append(s);
  });
}
// Readable mode layers themes/<name>/modern.css (legibility for modern displays) over the untouched
// original stylesheet; "1:1" shows the original exactly. Themes without modern.css are unaffected.
const readable = () => localStorage.getItem('fidelity') !== 'exact';
function useCss(name) {
  const link = (id, href) => {
    let l = document.getElementById(id);
    if (!href) { l?.remove(); return; }
    if (!l) { l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; document.head.append(l); }
    if (l.getAttribute('href') !== href) l.href = href;
  };
  link('theme-css', `${ROOT}themes/${name}/style.css`);
  link('theme-modern', readable() && THEMES[name]?.modern ? `${ROOT}themes/${name}/modern.css` : '');
  document.documentElement.dataset.theme = name;
  document.documentElement.dataset.fidelity = readable() ? 'readable' : 'exact';
}

async function render() {
  const mine = ++renderToken, r = parseRoute();
  let theme;
  try { theme = await loadTheme(currentTheme); } catch { currentTheme = 'default'; theme = await loadTheme('default'); }
  useCss(currentTheme);
  const m = await manifest();
  cache.names ??= Object.fromEntries(m.apps.map(a => [a.slug, a.name]));
  cache.sites ??= m.sites;
  cache.types ??= m.types;
  const ctx = { route: r, manifest: m, h };
  let html;
  if (r.item) {
    ctx.item = await findItem(r.item);
    // the item's program, so item pages can show related files (themes filter out the item itself)
    ctx.related = ctx.item ? await shard(ctx.item.k) : [];
    document.title = `${ctx.item?.t || 'Not found'} · Customization Museum`;
    html = theme.item(ctx);
  } else if (!['app', 'type', 'site', 'tag', 'q', 'arch'].some(k => r[k])) {
    document.title = 'Customization Museum';
    // themes whose original front page listed items set `recent: N` to get the newest N full rows
    if (theme.recent) ctx.recent = (await list({ ...r, sort: '', page: 1 }, theme.recent)).rows;
    html = theme.home(ctx);
  } else {
    // themes may reproduce their original site's page size (THEMES[x].perPage)
    ctx.list = await list(r, theme.perPage || PER_PAGE);
    if (r.site) ctx.about = await siteAbout(r.site);
    const name = r.app ? h.appName(r.app) : r.site ? h.siteName(r.site) : r.type ? ctx.list.typeName : r.tag || `“${r.q}”`;
    document.title = `${name} · Customization Museum`;
    html = theme.list(ctx);
  }
  if (mine !== renderToken) return;
  document.getElementById('app').innerHTML = html;
  theme.after?.(ctx, document.getElementById('app'));
}

// ---------- events (themes emit plain markup with these hooks) ----------
const go = (url, push = true) => { if (push) history.pushState(null, '', url); render().then(() => scrollTo(0, 0)); };
document.addEventListener('click', ev => {
  if (ev.target.closest('[data-dismiss-warning]')) { localStorage.setItem('warned', '1'); ev.target.closest('.cm-warning')?.remove(); return; }
  const a = ev.target.closest('a[href]');
  if (!a || a.target || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || !u.href.startsWith(ROOT) || /\.(json|md|png|jpg|zip)$/i.test(u.pathname)) return;
  ev.preventDefault();
  go(u.href);
});
document.addEventListener('submit', ev => {
  const f = ev.target.closest('form[data-search]');
  if (!f) return;
  ev.preventDefault();
  const r = parseRoute();
  go(withRoute(r, { q: new FormData(f).get('q').trim() }));
});
document.addEventListener('change', ev => {
  const t = ev.target, r = parseRoute();
  if (t.matches('[data-theme]')) { currentTheme = t.value; localStorage.setItem('theme', t.value); render(); }
  else if (t.matches('[data-fidelity]')) { localStorage.setItem('fidelity', t.value); render(); }
  else if (t.matches('[data-sort]')) go(withRoute(r, { sort: t.value }));
  else if (t.matches('[data-arch]')) go(withRoute(r, { arch: t.value }));
});
addEventListener('popstate', () => render());

// themes are listed in themes/index.json (written by build.py); register them lazily on first picker render
fetch(ROOT + 'themes/index.json').then(r => r.json()).then(list => list.forEach(([k, label, modern]) => { THEMES[k] ??= { label, lazy: true }; THEMES[k].modern = !!modern; })).catch(() => {}).finally(render);
