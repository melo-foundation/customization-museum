"""Winamp 3/5 modern skins from the official winamp.com gallery, rebuilt from Wayback captures.

Skin detail pages live at winamp.com/skin/<slug>/<id>. Modern skins have a component image
under download.nullsoft.com/customize/component/3/..., classic ones under .../component/<year>/...
"""
import html, re, urllib.parse
from sources.wayback import capture, cdx, crawl

APP = "Winamp 3/5 (Modern Skins)"
SITE = "http://www.winamp.com"
SKIN = re.compile(r"/skin/([^/?#]+)/(\d+)/?$")
MONTHS = {m: i for i, m in enumerate("jan feb mar apr may jun jul aug sep oct nov dec".split(), 1)}
MODERN_IMG = re.compile(r"download\.nullsoft\.com/customize/component/3/(\d{4})/(\d+)/(\d+)/S/")


def norm_date(s):
    m = re.match(r"\s*([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,\s*(\d{4})", html.unescape(s or ""))
    if not (m and m.group(1).lower() in MONTHS):
        return ""
    return f"{m.group(3)}-{MONTHS[m.group(1).lower()]:02d}-{int(m.group(2)):02d}"


def skin_page(text):
    """Parsed detail page, or None when it is not a skin page. modern is True for Winamp 3/5 skins."""
    canon = re.search(r'<link rel="canonical" href="[^"]*/skin/([^/"]+)/(\d+)', text)
    title = re.search(r"<title>(.*?)(?: - Winamp[^<]*)?</title>", text, re.S)
    big = re.search(r'<img class="screenShot"[^>]*src="([^"]+)"', text)
    if not (canon and title and big):
        return None
    date = re.search(r'<dl class="btm">\s*<dt>\s*([^<]+?)\s*</dt>', text)
    return dict(
        id=int(canon.group(2)), slug=canon.group(1), title=html.unescape(title.group(1)).strip(),
        date=norm_date(date.group(1)) if date else "", modern=bool(MODERN_IMG.search(big.group(1))),
        preview=big.group(1),
    )


def key(url):
    """(y, m, d, basename) of a component file/image URL."""
    m = MODERN_IMG.search(url)
    name = urllib.parse.unquote(url.rsplit("/", 1)[-1]).rsplit(".", 1)[0]
    return (m.group(1), m.group(2), m.group(3), name.lower()) if m else None


def scrape():
    files, images, pages = {}, {}, {}
    for ts, orig in cdx("download.nullsoft.com/customize/component/3/*", "&limit=100000&filter=original:.*(?:\\.wal|/large_image/|/small_image/).*"):
        k = key(orig)
        if not k:
            continue
        ext = orig.rsplit(".", 1)[-1].lower()
        if ext == "wal":
            files[k] = (ts, orig)
        elif ext in ("jpg", "png", "gif") and ("/large_image/" in orig or "/small_image/" in orig):
            if k not in images or "/large_image/" in orig:
                images[k] = (ts, orig)
    for ts, orig in cdx("winamp.com/skin/*", "&limit=50000&filter=mimetype:text/html"):
        m = SKIN.search(urllib.parse.urlsplit(orig).path)
        if m and "?" not in orig and (int(m.group(2)) not in pages or ts > pages[int(m.group(2))][0]):
            pages[int(m.group(2))] = (ts, orig)

    meta = {}
    for _, p in crawl("winampcom", sorted(pages.items()), lambda t: skin_page(capture(*t[1]) or "")):
        if p and p["modern"] and key(p["preview"]):
            meta[key(p["preview"])] = p
    print("winampcom: files", len(files), "images", len(images), "modern skin pages", len(meta), flush=True)

    wb = lambda ts, u: f"https://web.archive.org/web/{ts}id_/{u}"
    out = []
    for k in sorted(set(files) | set(meta)):
        p, f, i = meta.get(k), files.get(k), images.get(k)
        y, mo, d, name = k
        stem = (f[1] if f else p["preview"]).rsplit("/", 1)[-1].rsplit(".", 1)[0]
        out.append(dict(
            app=APP, id=f"winampcom-{p['id']}" if p else f"winampcom-{y}{int(mo):02d}{int(d):02d}-{name}",
            title=p["title"] if p else " ".join(urllib.parse.unquote(stem).replace("_", " ").split()),
            date=p["date"] if p else f"{y}-{int(mo):02d}-{int(d):02d}", tags=["Skins", "Winamp 3/5 Modern"],
            page=f"{SITE}/skin/{p['slug']}/{p['id']}" if p else f"{SITE}/skins/",
            preview=wb(*i) if i else None, download=wb(*f) if f else None,
        ))
    return out


if __name__ == "__main__":
    import sys
    p = skin_page(open(sys.argv[1], encoding="utf-8", errors="replace").read())
    assert p and p["id"] == 125452 and p["title"] == "The KidsWB Winamp 3 Skin" and p["date"] == "2002-12-09" and p["modern"], p
    assert p["preview"].endswith("/large_image/The_KidsWB_Winamp_3_Skin.jpg"), p
    c = skin_page(open(sys.argv[2], encoding="utf-8", errors="replace").read())
    assert c and c["id"] == 112656 and c["title"] == "Rose Tattoo" and c["date"] == "2004-01-17" and not c["modern"], c
    e = skin_page(open(sys.argv[3], encoding="utf-8", errors="replace").read())
    assert e and e["id"] == 222555 and e["date"] == "2012-01-13" and not e["modern"], e
    print("ok", p)
