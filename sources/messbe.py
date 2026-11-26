"""mess.be (MSN Messenger fan blog, 2001+): posts presenting a skin/theme/background/scene/emoticon/display picture."""
import datetime, html, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

APP = "MSN / WLM"
SLUG = re.compile(r"^/([a-z0-9][a-z0-9-]*)/$")
KINDS = [("Skins", r"skins?"), ("Themes", r"themes?(?: packs?)?"), ("Backgrounds", r"backgrounds?|wallpapers?"),
         ("Scenes", r"scenes?"), ("Emoticons", r"emoticons?"), ("Display Pictures", r"display pic(?:ture)?s?|avatars?")]
NOT_ITEM = re.compile(r"tutorial|interview|forum|\bnews\b|poll", re.I)
IMG = re.compile(r"\.(?:jpe?g|png|gif|bmp)(?:$|\?)", re.I)


def kind(text):
    for name, rx in KINDS:
        if re.search(r"\b(?:" + rx + r")\b", text, re.I):
            return name


def unwrap(href):
    href = html.unescape(href).strip()
    m = re.search(r"(?:click\.php|odtrack\.php3)\?url=(.+)$", href)
    return re.sub(r"\s+", "", urllib.parse.unquote(m.group(1)) if m else href)


def post(text):
    """Entry fields of one post page, or None when it is not a customization item."""
    pid = re.search(r'class="post-(\d+) post ', text)
    title = re.search(r'<h1 class="entry-title">(.*?)</h1>', text, re.S)
    if not (pid and title):
        return None
    title = html.unescape(re.sub(r"<[^>]+>", "", title.group(1))).strip()
    date = re.search(r'<abbr class="published" title="(\d{4}-\d\d-\d\d)', text)
    page = re.search(r'<link rel="canonical" href="([^"]+)"', text)
    start = text.find('entry-content')
    body = text[start:text.find('post_tags', start)]
    plain = html.unescape(re.sub(r"<[^>]+>", " ", body))
    shots = [html.unescape(h) for h in re.findall(r"""(?:href|src)=["']([^"']*_pictures/screenshots/[^"']+)""", body)]
    imgs = [unwrap(h) for h in re.findall(r"""href=["']([^"']+)["']""", body) if IMG.search(unwrap(h))]
    k = kind(title) or (kind(plain[:300]) if shots else None)
    if not k or NOT_ITEM.search(title):
        return None
    links = [unwrap(h) for h in re.findall(r"""href=["']([^"']+)["']""", body)]
    links = [h for h in links if h.startswith("http") and "_pictures/" not in h and not IMG.search(h)
             and not re.match(r"https?://(?:www\.)?mess\.be/(?:tag|category)/|https?://(?:www\.)?mess\.be/[^/?]+/?$", h)]
    dl = next((h for h in links if re.search(r"pafiledb\.php\?action=(?:file|download)", h)), links[0] if links else None)
    if not dl:
        return None
    prev = (shots or imgs or [None])[0]
    if prev and prev.startswith("//"):
        prev = "http:" + prev
    return dict(pid=int(pid.group(1)), title=title, date=date.group(1) if date else "", kind=k,
                page=page.group(1) if page else "", preview=prev, download=re.sub(r"^https://(www\.)?mess\.be", r"http://\1mess.be", dl))


def scrape():
    rows = cdx("mess.be/*", "&limit=200000")
    slugs = {}
    for ts, orig in rows:
        u = urllib.parse.urlsplit(orig)
        if (m := SLUG.match(u.path)) and not u.query and u.hostname in ("mess.be", "www.mess.be") and ts > "2026":
            slugs.setdefault(m.group(1), (ts, orig))
    out = []
    try:
        for slug, (ts, orig) in sorted(slugs.items()):
            p = post(capture(ts, orig) or "")
            if p:
                out.append(dict(app=APP, id=f"messbe-{p['pid']}", title=p["title"], date=p["date"], tags=[p["kind"]],
                                page=p["page"] or f"http://www.mess.be/{slug}/", preview=p["preview"], download=p["download"]))
    except Blocked as e:
        print("wayback stopped:", e, flush=True)
    return out


if __name__ == "__main__":
    import sys
    rd = lambda p: open(p, encoding="utf-8", errors="replace").read()
    skin, skins2, plain = (rd(p) for p in sys.argv[1:4])
    p = post(skin)
    assert p["title"] == "Mess.be Skin" and p["date"] == "2002-10-07" and p["kind"] == "Skins" and p["pid"], p
    assert p["preview"] == "http://mess.be/_pictures/screenshots/ms(ki)n-messwithmsnmessenger.gif", p
    assert p["download"] == "http://mess.be/pafiledb/pafiledb.php?action=file&id=173", p
    p2 = post(skins2)
    assert p2["title"] == "new msn 5.0 skins added" and p2["download"].endswith("action=file&id=205") and p2["preview"] is None, p2
    assert post(plain) is None
    print(p, p2, sep="\n")
