"""Firefox Personas / lightweight themes, rebuilt from Wayback captures of getpersonas.com (2008-11)
and addons.mozilla.org/en-US/firefox/themes/<category> persona grids (2011-18)."""
import datetime, html, json, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

APP = "Firefox"
WB = "https://web.archive.org/web/"
CDN = "http://getpersonas-cdn.mozilla.net/static"
GALLERY = re.compile(r"getpersonas\.com(?::80)?/en-US/gallery/([^/?]+)/([^/?]+)/(\d+)$")
PERSONA = re.compile(r"getpersonas\.com(?::80)?/en-US/persona/(\d+)$")


def cdn(pid, name):
    s = str(pid).zfill(2)
    return f"{CDN}/{s[-2]}/{s[-1]}/{pid}/{name}"


def mdy(s):
    try:
        return datetime.datetime.strptime(s.strip(), "%m/%d/%Y").strftime("%Y-%m-%d")
    except ValueError:
        return ""


def gallery_cards(text):
    """getpersonas gallery listing -> {id: dict(title, date, header)}."""
    out = {}
    for m in re.finditer(r'class="preview" persona="([^"]+)"(.*?)(?=class="preview" persona=|\Z)', text, re.S):
        try:
            j = json.loads(html.unescape(m.group(1)))
        except ValueError:
            continue
        d = re.search(r'class="designer">.*? on (\d+/\d+/\d{4})', m.group(2), re.S)
        out[int(j["id"])] = dict(title=j["name"], date=mdy(d.group(1)) if d else "", header=j.get("headerURL") or j.get("header"))
    return out


def amo_cards(text):
    """AMO persona grid -> {id: dict(title, date, header, preview, page)}."""
    out = {}
    for m in re.finditer(r"data-browsertheme=\"([^\"]+)\"(.*?)</li>", text, re.S):
        try:
            j = json.loads(html.unescape(m.group(1)))
        except ValueError:
            continue
        d = re.search(r" on (\d{4}-\d\d-\d\d)", m.group(2))
        out[int(j["id"])] = dict(title=j["name"], date=d.group(1) if d else "", header=j.get("headerURL"),
                                 preview=j.get("previewURL"), page=j.get("detailURL"))
    return out


def scrape():
    gal, per, themes = {}, {}, []
    for ts, o in cdx("getpersonas.com/en-US/gallery/*", "&limit=200000"):
        if (m := GALLERY.search(o)):
            gal.setdefault(m.groups(), (ts, o))
    for ts, o in cdx("getpersonas.com/en-US/persona/*", "&limit=300000"):
        if (m := PERSONA.search(o)):
            per.setdefault(int(m.group(1)), ts)
    for ts, o in cdx("addons.mozilla.org/en-US/firefox/themes/*", "&limit=100000"):
        if "page=" in o and "sort=created" in o or re.search(r"/themes/[^/?]+/?$", o):
            themes.append((ts, o))
    got = {}
    try:
        for (cat, sort, n), (ts, o) in sorted(gal.items(), key=lambda kv: (kv[0][0] != "All", kv[0][1] != "All", int(kv[0][2]))):
            for pid, c in gallery_cards(capture(ts, o) or "").items():
                got.setdefault(pid, dict(c, ts=ts, src="gp"))
        for ts, o in themes:
            for pid, c in amo_cards(capture(ts, o) or "").items():
                got.setdefault(pid, dict(c, ts=ts, src="amo"))
    except Blocked as e:
        print("wayback stopped:", e, flush=True)
    for pid, ts in per.items():
        got.setdefault(pid, dict(title=f"Persona {pid}", date="", header=None, ts=ts, src="gp"))
    out = []
    for pid, c in sorted(got.items()):
        gp = c["src"] == "gp"
        page = f"{WB}{c['ts']}/http://www.getpersonas.com/en-US/persona/{pid}" if gp else f"{WB}{c['ts']}/{c['page']}"
        prev = cdn(pid, "preview.jpg") if gp else c["preview"]
        out.append(dict(app=APP, id=f"persona-{pid}", title=c["title"], date=c["date"], tags=["Personas"], page=page,
                        preview=f"{WB}{c['ts']}im_/{prev}", download=f"{WB}{c['ts']}im_/{c['header']}" if c["header"] else None))
    return out


if __name__ == "__main__":
    import sys
    D = sys.argv[1]  # dir with s1/ s2/ samples
    g = gallery_cards(open(f"{D}/s2/" + sys.argv[2], encoding="utf-8", errors="replace").read())
    assert g[6444]["title"] == "Dark Vista" and g[6444]["date"] == "2009-04-15" and g[6444]["header"].endswith("vista1.JPG?1260925626"), g[6444]
    a = amo_cards(open(f"{D}/s1/dc9d93d8762c6b8f", encoding="utf-8", errors="replace").read())
    assert a[448920]["title"] == "Wiggles 3a" and a[448920]["date"] == "2013-06-23", a[448920]
    assert cdn(137582, "preview.jpg") == CDN + "/8/2/137582/preview.jpg" and cdn(6444, "x") == CDN + "/4/4/6444/x"
    assert GALLERY.search("http://www.getpersonas.com:80/en-US/gallery/All/All/1193").groups() == ("All", "All", "1193")
    print("ok", len(g), len(a))
