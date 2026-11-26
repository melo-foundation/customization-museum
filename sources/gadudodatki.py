"""Gadu-Gadu add-ons (skins, avatars, sounds) from gadudodatki.pl, rebuilt from Wayback captures."""
import html, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

APP = "Gadu-Gadu"
SITE = "http://www.gadudodatki.pl"
KINDS = {"skiny": "Skins", "awatary": "Avatars", "dzwonki": "Sounds"}
MAX_DETAIL = 800  # serial Wayback fetches for ids missing from the listings
CARD = re.compile(
    r'<li class="clearfix">\s*<div class="photo">\s*<a href="/(skiny|awatary|dzwonki)/show/id/(\d+)">'
    r'<img src="([^"]+)"[^>]*/></a>.*?<h3><a href="[^"]+">([^<]*)</a>.*?'
    r'<span class="date grayText">(\d{4}-\d\d-\d\d)', re.S)


def full_image(src):
    if "blank" in src:
        return None
    return SITE + src.replace("/thumb2/", "/").replace("/thumb1/", "/")


def cards(text):
    """Listing cards: {(kind, id): dict(title, date, preview)}."""
    return {(k, int(i)): dict(title=html.unescape(t).strip(), date=d, preview=full_image(src))
            for k, i, src, t, d in CARD.findall(text)}


def detail(text):
    h2 = re.search(r'<div class="desc">\s*<h2>\s*([^<]*?)\s*(?:<span[^>]*>[^<]*</span>\s*)?</h2>', text)
    img = re.search(r'<a href="(/uploads/produkty/galerie/[^"]+)" class="lightwindow', text)
    return dict(title=html.unescape(h2.group(1)).strip() if h2 else "",
                preview=SITE + img.group(1) if img else None)


def scrape():
    listings, details = [], {}
    for kind in KINDS:
        listings += cdx(f"gadudodatki.pl/{kind}/wszystkie*", "&limit=20000")
        for ts, orig in cdx(f"gadudodatki.pl/{kind}/show/id/*", "&limit=60000"):
            m = re.search(rf"/{kind}/show/id/(\d+)(?:/\w+/\d+)?$", urllib.parse.urlsplit(orig).path)
            if m:
                details.setdefault((kind, int(m.group(1))), (ts, orig))
    found = {}
    try:
        for ts, orig in sorted(listings):
            for key, c in cards(capture(ts, orig) or "").items():
                found.setdefault(key, c)
        todo = [k for k in sorted(details) if k not in found][:MAX_DETAIL]
        for key in todo:
            d = detail(capture(*details[key]) or "")
            if d["title"]:
                found[key] = dict(d, date="")
    except Blocked as e:
        print("wayback stopped:", e, flush=True)
    out = []
    for (kind, i), c in sorted(found.items()):
        out.append(dict(
            app=APP, id=f"gadudodatki-{i}", title=c["title"], date=c["date"], tags=[KINDS[kind]],
            page=f"{SITE}/{kind}/show/id/{i}", preview=c["preview"],
            download=f"{SITE}/dodatki/pobierzDodatek/id/{i}/kategoria/{kind}",
        ))
    return out


if __name__ == "__main__":
    import sys
    c = cards(open(sys.argv[1], encoding="utf-8", errors="replace").read())
    assert len(c) == 10 or len(c) > 5, len(c)
    k = c[("skiny", 32270)]
    assert k["title"] == "Misio i didl" and k["date"] == "2009-02-06", k
    assert k["preview"] == SITE + "/uploads/produkty/galerie/d9/d94afc8781a622b74bab1fcfa97eb16d79f0caaa.png", k
    d = detail(open(sys.argv[2], encoding="utf-8", errors="replace").read())
    assert d["title"] == "Naruto Uzumaki" and d["preview"].endswith("35e01f57b5b3dc0b0495f4648f201c724735fff5.jpg"), d
    print(len(c), "cards ok;", d)
