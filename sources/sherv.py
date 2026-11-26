"""sherv.net animated MSN emoticons, rebuilt from Wayback captures of the category listing pages."""
import html, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

APP = "MSN / WLM"
SITE = "http://www.sherv.net"
LISTING = re.compile(r"^/([a-z0-9._-]+?)-(?:icons|emoticons)(?:-(\d+))?\.html$", re.I)
DETAIL = re.compile(r"^/([a-z0-9._-]+)-emoticon-(\d+)\.html$", re.I)
CARD = re.compile(
    r'<td><a href="([^"]+?-emoticon-(\d+)\.html)"><img alt="[^"]*" src="([^"]+)"[^>]*><br>([^<]*)</a>', re.I)
SKIP = {"facebook", "hidden-msn", "hidden-skype", "msn", "free-msn", "animated-msn"}


def cat_name(slug):
    return slug.replace(".", " ").replace("-", " ").replace("_", " ").title()


def cards(text):
    """Cards on a category listing page: {id: dict(title, thumb)}."""
    return {int(i): dict(title=html.unescape(t).strip(), thumb=src)
            for _, i, src, t in CARD.findall(text)}


def scrape():
    rows = []
    for c in "abcdefghijklmnopqrstuvwxyz0123456789":
        rows += cdx(f"sherv.net/{c}*", "&limit=100000")
    listings, details = {}, {}
    for ts, orig in rows:
        u = urllib.parse.urlsplit(orig)
        if u.query:
            continue
        if (m := DETAIL.match(u.path)):
            details.setdefault(int(m.group(2)), (m.group(1), ts, orig))
        elif (m := LISTING.match(u.path)) and m.group(1) not in SKIP:
            listings.setdefault(u.path, (ts, orig, m.group(1)))

    found = {}
    try:
        for path, (ts, orig, slug) in sorted(listings.items()):
            for sid, c in cards(capture(ts, orig) or "").items():
                found.setdefault(sid, dict(c, cat=cat_name(slug)))
    except Blocked as e:
        print("wayback stopped:", e, flush=True)

    out = []
    for sid in sorted(set(found) | set(details)):
        f = found.get(sid)
        slug = details[sid][0] if sid in details else None
        title = f["title"] if f else cat_name(slug).title()
        tags = ["Emoticons"] + ([f["cat"]] if f else [])
        thumb = f["thumb"] if f else None
        img = urllib.parse.urljoin(SITE + "/", thumb) if thumb else None
        page = f"{SITE}/{slug}-emoticon-{sid}.html" if slug else None
        if not page:
            continue
        out.append(dict(app=APP, id=f"sherv-{sid}", title=title, date="", page=page,
                        preview=img, download=img, tags=tags))
    return out


if __name__ == "__main__":
    import sys
    c = cards(open(sys.argv[1], encoding="utf-8", errors="replace").read())
    assert c[2294]["title"] == "Kitten Sorry" and c[2294]["thumb"].endswith("kitten-sorry-smiley-emoticon.gif"), c[2294]
    assert len(c) >= 10, len(c)
    assert LISTING.match("/animals-icons-3.html") and LISTING.match("/angry-emoticons.html") and not LISTING.match("/a/b-icons.html")
    assert DETAIL.match("/birthday.cake-emoticon-6.html")
    print(len(c), "cards ok")
