"""Sonique skins/plugins: official gallery sonique.lycos.com/customize/ (Wayback), plus live skinbase.org Sonique 2."""
import html, json, re, urllib.parse
from lib import get, pmap
from sources.wayback import Blocked, capture, cdx

APP = "Sonique"
GALLERY = "http://sonique.lycos.com/customize/archive.php"
DETAIL = re.compile(r"type=(skin|plugin|wallpaper)&+view=detail&+record=(\d+)")
TAGS = {"skin": ["Skins"], "wallpaper": ["Wallpapers"]}


def norm_date(record):
    d = record[:8]
    return f"{d[:4]}-{d[4:6]}-{d[6:]}" if re.fullmatch(r"(19|20)\d\d(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])", d) else ""


def detail_page(text):
    """title, author, image dir ('skinarchive/Name' or 'plug-ins/visual/Name') of a gallery detail page."""
    t = re.search(r"<title>\s*Customize Sonique - \w+: (.*?)\s*</title>", text, re.S)
    full = html.unescape(t.group(1)) if t else ""
    name, _, author = full.rpartition(" by ")
    img = re.search(r'images\.sonique\.com(?::80)?/((?:skinarchive|plug-ins|wallpaper)[^"]*?)/+mid\.jpg', text)
    return dict(title=(name or full).strip(), author=author.strip() if name else "",
                dir=re.sub(r"/+", "/", img.group(1)) if img else None)


def scrape():
    rows = cdx("sonique.lycos.com/customize/*", "&limit=50000")
    recs = {}
    for ts, orig in rows:
        m = DETAIL.search(orig)
        if m:
            recs.setdefault((m.group(1), m.group(2)), (ts, orig))
    files = {}
    try:
        for ts, orig in cdx("files.sonique.com/*", "&limit=50000"):
            p = urllib.parse.urlsplit(orig).path.lstrip("/")
            if p.lower().endswith((".sgf", ".zip", ".sqinterface")):
                files.setdefault(p.rsplit("/", 1)[0].lower(), p)
    except Blocked as e:
        print("wayback stopped:", e, flush=True)

    out = []
    try:
        for (kind, rid), (ts, orig) in sorted(recs.items(), key=lambda x: x[0][1]):
            d = detail_page(capture(ts, orig) or "")
            if not d["title"]:
                continue
            page = f"{GALLERY}?type={kind}&view=detail&record={rid}"
            dl = files.get((d["dir"] or "").lower())
            tags = TAGS.get(kind) or (["Visualizations"] if "/visual" in (d["dir"] or "") else ["Plugins"])
            out.append(dict(
                app=APP, id=f"sonique-{rid}" if kind == "skin" else f"sonique-{kind}-{rid}", title=d["title"], date=norm_date(rid), tags=tags,
                page=page,
                preview=f"http://images.sonique.com/{d['dir']}/mid.jpg" if d["dir"] else None,
                download=f"http://files.sonique.com/{dl}" if dl else page.replace("view=detail", "view=download"),
            ))
    except Blocked as e:
        print("wayback stopped:", e, flush=True)
    return out + skinbase()


SB = "https://skinbase.org"


def skinbase_list(text):
    m = re.search(r'data-artworks="([^"]*)"', text or "")
    return json.loads(html.unescape(m.group(1))) if m else []


def skinbase_detail(text):
    m = re.search(r'data-page="([^"]*)"', text or "")
    a = json.loads(html.unescape(m.group(1)))["props"]["artwork"] if m else {}
    return (a.get("published_at") or "")[:10]


def skinbase():
    items, page = [], 1
    while True:
        got = skinbase_list(get(f"{SB}/skins/audio/sonique-2?page={page}"))
        if not got or page > 50:
            break
        items += got
        page += 1
    dates = pmap(lambda a: skinbase_detail(get(f"{SB}/art/{a['id']}/{a['slug']}")), items)
    return [dict(app=APP, id=f"sonique-{a['id']}", title=a["name"], date=d, tags=["Skins"],
                 page=f"{SB}/art/{a['id']}/{a['slug']}", preview=a["thumb"], download=f"{SB}/download/artwork/{a['id']}")
            for a, d in zip(items, dates)]


if __name__ == "__main__":
    import sys
    d = detail_page(open(sys.argv[1], encoding="cp1252").read())
    assert d == dict(title="SunBurst", author="Cr@zy Ed", dir="skinarchive/SunBurst"), d
    assert norm_date("20000104192310") == "2000-01-04" and norm_date("201152640") == ""
    p = detail_page(open(sys.argv[2], encoding="cp1252").read())
    assert p["title"] == "Voronoi" and p["dir"] == "plug-ins/visual/Voronoi", p
    sl = skinbase_list(open(sys.argv[3], encoding="utf-8").read())
    assert len(sl) == 19 and sl[1]["id"] == 27847 and sl[1]["slug"] == "radium"
    assert skinbase_detail(open(sys.argv[4], encoding="utf-8").read()) == "2003-09-01"
    print(d, p, len(sl), "ok")
