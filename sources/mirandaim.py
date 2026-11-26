"""Miranda IM customisation add-ons (skins, icons, emoticons, sounds, ...), rebuilt from Wayback captures of addons.miranda-im.org."""
import datetime, html, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

APP = "Miranda IM"
SITE = "http://addons.miranda-im.org"
CUSTOMISE = "Customise"
TOP_IDS = {2, 5, 34, 35, 41, 67, 82}  # Customise, Sounds, Background Images, Icons, Emoticons, Skins, Themes
LISTING = re.compile(r"/index\.php\?(?:[^#]*&)?action=display&id=(\d+)(?:&|$)")
VIEWFILE = re.compile(r"/details\.php\?action=viewfile&id=(\d+)$")


def norm_date(s):
    m = re.match(r"\s*(\d{2})/(\d{2})/(\d{4})", s or "")
    return f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else ""


def crumbs(text):
    """Breadcrumb trail names after 'File Listing', e.g. ['Customise', 'Icons', 'Others']."""
    i = text.find('id="content"')
    head = text[i:i + 3000]
    head = head.split("<br>", 1)[0]
    names = [html.unescape(re.sub(r"<[^>]+>", "", x)).strip() for x in re.findall(r'<(?:a|span) class="(?:title|header)"[^>]*>(.*?)</(?:a|span)>', head)]
    names = [n.lstrip("> ").strip() for n in names if n.strip() not in (">", "")]
    return names[1:]  # drop "File Listing"


def abs_url(u):
    return urllib.parse.urljoin(SITE + "/", u)


def listing_rows(text):
    """Rows on a category listing page: {id: dict(title, date, preview, sub)}."""
    out = {}
    for block in re.split(r'<tr><td ><div class="indentText">', text)[1:]:
        m = re.match(r'<a class="title" href="details\.php\?action=viewfile&id=(\d+)"[^>]*>(.*?)</a>', block)
        if not m:
            continue
        sub = re.search(r"Subcategory: </span><a [^>]*>([^<]+)</a>", block)
        shot = re.search(r'Screenshot: </span><a class="normal" href="([^"]+)"', block)
        date = re.search(r'align="center">(\d{2}/\d{2}/\d{4})', block)
        out[int(m.group(1))] = dict(
            title=html.unescape(m.group(2)).strip(), date=norm_date(date.group(1)) if date else "",
            preview=abs_url(shot.group(1)) if shot else None, sub=html.unescape(sub.group(1)).strip() if sub else "",
        )
    return out


def detail_page(text):
    """Detail page -> dict(title, date, preview, path) or None."""
    title = re.search(r'<span class="fileNameHeader">(.*?)</span>', text)
    if not title:
        return None
    date = re.search(r'Date added</span></td><td[^>]*>([^<]+)<', text)
    shot = re.search(r'Screenshot</span></td><td[^>]*><a class="normal" href="([^"]+)"', text)
    return dict(
        title=html.unescape(title.group(1)).strip(), date=norm_date(date.group(1)) if date else "",
        preview=abs_url(shot.group(1)) if shot else None, path=crumbs(text),
    )


def tag_of(path):
    return path[1] if len(path) > 1 else CUSTOMISE


def scrape():
    rows = cdx("addons.miranda-im.org/*", "&limit=200000")
    listings, views = [], {}
    for ts, orig in rows:
        orig = orig.replace("&amp;", "&")
        if (m := LISTING.search(orig)):
            if int(m.group(1)) in TOP_IDS and "/images/" not in orig:
                listings.append((int(m.group(1)), ts, orig))
        elif (m := VIEWFILE.search(orig)):
            views.setdefault(int(m.group(1)), (ts, orig))

    found = {}
    try:
        for cid, ts, orig in sorted(listings, key=lambda x: (x[0] == 2, x[1:])):
            text = capture(ts, orig) or ""
            tag = crumbs(text)
            for fid, r in listing_rows(text).items():
                tag_name = tag[1] if len(tag) > 1 else (r["sub"] if r["sub"] and r["sub"] != "Others" else CUSTOMISE)
                found.setdefault(fid, dict(r, tag=tag_name))
        for fid, (ts, orig) in sorted(views.items()):
            if fid in found:
                continue
            d = detail_page(capture(ts, orig) or "")
            if d and d["path"] and d["path"][0] == CUSTOMISE:
                found[fid] = dict(title=d["title"], date=d["date"], preview=d["preview"], tag=tag_of(d["path"]))
    except Blocked as e:
        print("wayback stopped:", e, flush=True)

    return [
        dict(app=APP, id=f"mirandaim-{fid}", title=r["title"], date=r["date"], tags=[r["tag"]],
             page=f"{SITE}/details.php?action=viewfile&id={fid}", preview=r["preview"],
             download=f"{SITE}/feed.php?dlfile={fid}")
        for fid, r in sorted(found.items())
    ]


if __name__ == "__main__":
    import sys
    rows = listing_rows(open(sys.argv[1], encoding="utf-8", errors="replace").read())
    assert rows[3183]["title"] == "olderman ICQ icons 0.0.0.2" and rows[3183]["date"] == "2006-10-09", rows[3183]
    assert rows[3183]["preview"] == "http://addons.miranda-im.org/files/screenshot/81-1-1160342060-olderman.png"
    assert rows[3181]["sub"] == "Others"
    d = detail_page(open(sys.argv[2], encoding="utf-8", errors="replace").read())
    assert d["title"] == "MRA Smiles for IEView 1.5" and d["path"] == ["Customise", "Emoticons", "IEView", "MRA Smiles for IEView"], d
    assert tag_of(d["path"]) == "Emoticons" and d["date"] and d["preview"].endswith("mra_smiles_scrinshot.gif"), d
    p = detail_page(open(sys.argv[3], encoding="utf-8", errors="replace").read())
    assert p["path"][0] == "Plugins", p
    print(len(rows), "rows ok;", d)
