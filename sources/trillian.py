"""Trillian skins from Cerulean Studios' catalogue, rebuilt from Wayback captures of ceruleanstudios.com (2001-2010).

Two generations share the site: the 2001-2003 skins.php gallery (skID / componentID) and the 2004+ /downloads/ catalogue
(detail.php?item=N). Their ids are separate namespaces, so old ones are "trillian-c<ID>" and new ones "trillian-<item>".
"""
import datetime, html, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

APP = "Trillian"
SITE = "http://www.ceruleanstudios.com"
OLD_BASE = SITE + "/skins/"
JUNK = re.compile(r"%5c|_new|&amp|%22|target=")


def norm_date(s):
    s = " ".join(html.unescape(s or "").replace("\xa0", " ").split())
    for fmt in ("%d %B %Y", "%d %b %Y"):
        try:
            return datetime.datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return ""


def old_cards(text):
    """2001-2003 gallery/listing/single pages: {skID: dict(title, date, preview)}."""
    out = {}
    parts = re.split(r"<b><i>(\d{1,2} \w+ \d{4})</b>\s*-\s*<b>(.*?)</b> by", text)
    for i in range(1, len(parts) - 2, 3):
        date, title, block = parts[i], parts[i + 1], parts[i + 2]
        sid = re.search(r"sk_download\.php\?skID=(\d+)", block)
        if not sid:
            continue
        shot = re.search(r'<a href="([^"]+\.(?:jpg|gif|png))"[^>]*>\s*(?:<b>)?View\s+Screenshot', block, re.I)
        added = re.search(r"Date Added:</b>\s*(\d{1,2} \w+ \d{4})", block)
        out[int(sid.group(1))] = dict(
            title=html.unescape(re.sub(r"<[^>]+>", "", title)).strip(), date=norm_date(added.group(1) if added else date),
            preview=urllib.parse.urljoin(OLD_BASE, shot.group(1)) if shot else None,
        )
    return out


def detail_page(text):
    """2004+ /downloads/detail.php page -> dict(kind, title, date, preview) or None."""
    kind = re.search(r"trillian_(skins|pro_plugins)_(?:gallery|catalog)", text)
    title = re.search(r'<img [^>]*?alt="([^"]*)" style="position: relative; top: -20px;"', text)
    if not (kind and title):
        return None
    date = re.search(r"Last&nbsp;Updated.*?<td class=\"text\">([^<]+)<", text, re.S) or re.search(r"Last&nbsp;Updated[^0-9]*([0-9]{1,2} \w{3} \d{4})", text, re.S)
    return dict(kind=kind.group(1), title=html.unescape(title.group(1)).strip(), date=norm_date(date.group(1)) if date else "")


def browse_rows(text):
    """2004+ browse.php rows: {item: dict(title, date)}."""
    out = {}
    for m in re.finditer(r'<a href="detail\.php\?item=(\d+)"><b>(.*?)</b></a></span>(.*?)</tr>', text, re.S):
        d = re.search(r'class="chart_key_td" align="left">(\d{1,2}&nbsp;\w+&nbsp;\d{4})', m.group(3))
        date = norm_date(d.group(1)) if d else ""
        out[int(m.group(1))] = dict(title=html.unescape(m.group(2)).strip(), date="" if date.startswith("1969") else date)
    return out


def scrape():
    rows = cdx("ceruleanstudios.com/*", "&limit=200000")
    old, details, browse = [], {}, []
    for ts, orig in rows:
        u = urllib.parse.urlsplit(orig.replace("&amp;", "&"))
        q = dict(urllib.parse.parse_qsl(u.query))
        path = u.path
        if JUNK.search(orig):
            continue
        if path in ("/skins.php", "/skins/skins.php", "/skins/index.php") and u.query:
            old.append((ts, orig))
        elif path == "/downloads/detail.php" and q.get("item", "").isdigit():
            details.setdefault(int(q["item"]), (ts, orig))
        elif path == "/downloads/browse.php" and q.get("t") == "s":
            browse.append((ts, orig))

    skins, items = {}, {}
    try:
        for ts, orig in old:
            for sid, c in old_cards(capture(ts, orig) or "").items():
                skins.setdefault(sid, c)
        for item, (ts, orig) in sorted(details.items()):
            d = detail_page(capture(ts, orig) or "")
            if d and d["kind"] == "skins":
                items[item] = d
        for ts, orig in browse:
            for item, r in browse_rows(capture(ts, orig) or "").items():
                items.setdefault(item, r)
    except Blocked as e:
        print("wayback stopped:", e, flush=True)

    out, seen = [], set()
    for item, r in sorted(items.items()):
        seen.add(r["title"].lower())
        out.append(dict(
            app=APP, id=f"trillian-{item}", title=r["title"], date=r["date"], tags=["Skins"],
            page=f"{SITE}/downloads/detail.php?item={item}",
            preview=f"{SITE}/downloads/getimage.php?id={item}&size=detail",
            download=f"{SITE}/downloads/item_download.php?id={item}",
        ))
    for sid, c in sorted(skins.items()):
        if c["title"].lower() in seen:
            continue
        out.append(dict(
            app=APP, id=f"trillian-c{sid}", title=c["title"], date=c["date"], tags=["Skins"],
            page=f"{SITE}/skins/skins.php?componentID={sid}", preview=c["preview"],
            download=f"{SITE}/skins/sk_download.php?skID={sid}",
        ))
    return out


if __name__ == "__main__":
    import sys
    rd = lambda p: open(p, encoding="utf-8", errors="replace").read()
    c = old_cards(rd(sys.argv[1]))
    assert c[22]["title"] == "TP2-Twiggy" and c[22]["date"] == "2002-01-03" and c[22]["preview"] == OLD_BASE + "skins/tp2-twiggy-071shot.jpg", c[22]
    assert c[21]["title"] == "TTTrillian", c[21]
    s = old_cards(rd(sys.argv[2]))
    assert s[63]["title"] == "Windows Me Compact" and s[63]["preview"] == OLD_BASE + "images/mecomp.gif" and s[63]["date"] == "2002-07-25", s
    d = detail_page(rd(sys.argv[3]))
    assert d == dict(kind="skins", title="Specious - Look It Up", date="2003-04-09"), d
    assert detail_page(rd(sys.argv[4]))["kind"] == "pro_plugins"
    b = browse_rows(rd(sys.argv[5]))
    assert b[432] == dict(title="Ubuntu Human", date=""), b
    print(len(c), "listing cards,", "ok")
