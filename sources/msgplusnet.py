"""Messenger Plus! skins, scripts, sounds and pictures, rebuilt from Wayback captures of msgplus.net."""
import datetime, html, re, urllib.parse
from sources.wayback import capture, cdx, crawl
from sources.wlm import APP, LISTING, VIEW, cards, norm_date, view_page

SITE = "http://www.msgplus.net"
HOST = re.compile(r"https?://(?:www\.)?msgplus(?:live)?\.net(?::80)?")
DETAILS = re.compile(r"/Downloads/Download-Details/DocumentID/(\d+)", re.I)
SCRIPT = re.compile(r"/scripts/view/(\d+)|/scripts/\?act=view&id=(\d+)")
LOCALE = re.compile(r"^/[a-z]{2}-[A-Z]{2}/")
KIND = {"plsk": "Skins", "plks": "Skins", "plsc": "Scripts", "plp": "Sounds",
        "png": "Display Pictures", "gif": "Display Pictures", "jpg": "Display Pictures"}


def local(text):
    """Make the absolute self-links of 2008-era pages site-relative so the wlm.py parsers apply."""
    return HOST.sub("", text)


def span(text, name):
    m = re.search(r'DocumentViewer_' + name + r'"[^>]*>([^<]*)<', text)
    return html.unescape(m.group(1)).strip() if m else ""


def doc_date(s):
    try:
        return datetime.datetime.strptime(s.split()[0], "%m/%d/%Y").strftime("%Y-%m-%d")
    except (ValueError, IndexError):
        return ""


def skin_view(text):
    v = view_page(local(text))
    v["title"] = re.sub(r"\s*-\s*(?:Windows )?Live Messenger Skin$", "", v["title"])
    return v


def details(text):
    """Download-Details page of the 2011+ site."""
    dl = re.search(r'href="/DownloadManager\.(\w+)\?DocumentID=(\d+)&amp;Download=true"', text)
    files = list(dict.fromkeys(re.findall(r"""(?:href|src)=["'](/Documents/[^"']+)["']""", text)))
    shots = [f for f in files if "thumbnail" not in f.lower()] or files
    ext = dl.group(1).lower() if dl else ""
    title = span(text, "lblShortName") or re.sub(r"^Messenger Plus! - ", "", (re.search(r"<title>\s*([^<]*?)\s*</title>", text) or [0, ""])[1]).strip()
    return dict(title=title, date=doc_date(span(text, "lblLastUpdated")), ext=ext,
                download=f"{SITE}{dl.group(0)[6:-1].replace('&amp;', '&')}" if dl else None,
                preview=SITE + html.unescape(shots[0]) if shots else None)


def script_page(text):
    t = re.search(r'class="largefilename">([^<]+)</span>\s*([^<]*)', text)
    date = re.search(r"Last Update:</td>\s*<td[^>]*>([^<]+)</td>", text)
    shot = re.search(r'src="(?:https?://[^/"]+)?(/scripts/uploads/[^"]+)"', text)
    title = html.unescape(t.group(1)).strip() + (" " + t.group(2).strip() if t and t.group(2).strip() else "") if t else ""
    return dict(title=title, date=norm_date(date.group(1)) if date else "",
                preview=SITE + html.unescape(shot.group(1)) if shot else None)


def scrape():
    # one narrow prefix query per page family; a whole-domain regex scan times out (504)
    rows = []
    for pat in ("msgplus.net/Downloads/Download-Details/*", "msgplus.net/skins/view/*", "msgplus.net/skins/uploads/*",
                "msgplus.net/skins/browse*", "msgplus.net/skins/by-*", "msgplus.net/skins/featured*",
                "msgplus.net/scripts/view/*", "msgplus.net/scripts/?act=view*"):
        r = cdx(pat, "&limit=100000")
        print("msgplusnet cdx", pat, len(r), flush=True)
        rows += r
    print("msgplusnet: cdx rows", len(rows), flush=True)
    views, listings, uploads, seen = {}, [], {}, set()
    docs, scripts = {}, {}
    for ts, orig in rows:
        u = urllib.parse.urlsplit(orig)
        path = u.path
        if (m := DETAILS.search(path)):
            did = int(m.group(1))
            key = (bool(LOCALE.match(path)), bool(u.query), -int(ts))
            if did not in docs or key < docs[did][0]:
                docs[did] = (key, ts, orig)
        elif (m := SCRIPT.search(path + "?" + u.query)) and "rate" not in path:
            sid = int(m.group(1) or m.group(2))
            if sid not in scripts or (path.startswith("/scripts/") and "act=view" in u.query):
                scripts[sid] = (ts, orig)
        elif (m := VIEW.search(path)):
            sid = int(m.group(1))
            if sid not in views or (views[sid][3] and not u.query):
                views[sid] = (ts, orig, m.group(2), bool(u.query))
        elif LISTING.search(path) and not path.endswith("rss.php") and path not in seen:
            seen.add(path)
            listings.append((ts, orig))
        elif path.startswith("/skins/uploads/"):
            uploads[urllib.parse.unquote(path[len("/skins/uploads/"):])] = ts

    skins, out = {}, []
    got = crawl("msgplusnet listings", listings, lambda t: cards(local(capture(*t) or "")))
    for _, c_ in got:
        for sid, c in c_.items():
            skins.setdefault(sid, c)
    todo = [(sid, v) for sid, v in sorted(views.items()) if sid not in skins]
    for (sid, (ts, orig, slug, _)), v in crawl("msgplusnet skins", todo, lambda t: skin_view(capture(*t[1][:2]) or "")):
        skins[sid] = dict(slug=slug, title=v["title"] or slug.replace("-", " "), date=v["date"], base=v["base"])

    for sid, s in sorted(skins.items()):
        base = s["base"] or s["slug"]
        shot = next((base + suf for suf in (".jpg", ".png", "_small.jpg", "_thumb.jpg") if base + suf in uploads), None)
        files = sorted(f for f in uploads if f.startswith(base) and f.lower().endswith((".plsk", ".zip")))
        out.append(dict(
            app=APP, id=f"msgplusnet-{sid}", title=s["title"], date=s["date"], tags=["Skins"],
            page=f"{SITE}/skins/view/{sid}-{s['slug']}/",
            preview=f"{SITE}/skins/uploads/{shot}" if shot else (f"{SITE}/skins/uploads/{base}_thumb.jpg" if s["base"] else None),
            download=f"{SITE}/skins/uploads/{files[-1]}" if files else f"{SITE}/skins/download/{sid}/",
        ))

    for (sid, _), r in crawl("msgplusnet scripts", sorted(scripts.items()), lambda t: script_page(capture(*t[1]) or "")):
        if r["title"]:
            out.append(dict(app=APP, id=f"msgplusnet-script-{sid}", title=r["title"], date=r["date"], tags=["Scripts"],
                            page=f"{SITE}/scripts/?act=view&id={sid}", preview=r["preview"], download=f"{SITE}/scripts/download/{sid}/"))
    for (did, _), d in crawl("msgplusnet downloads", sorted(docs.items()), lambda t: details(capture(*t[1][1:]) or "")):
        if d["title"] and d["ext"]:
            out.append(dict(app=APP, id=f"msgplusnet-d{did}", title=d["title"], date=d["date"],
                            tags=[KIND.get(d["ext"], "Skins")], page=f"{SITE}/Downloads/Download-Details/DocumentID/{did}/",
                            preview=d["preview"], download=d["download"]))
    return out


if __name__ == "__main__":
    import sys
    rd = lambda p: open(p, encoding="utf-8", errors="replace").read()
    listing, view, doc, plp, png, script = (rd(p) for p in sys.argv[1:7])
    c = cards(local(listing))
    assert c[7]["title"] == "Apple Live Messenger 0.1.0" and c[7]["base"] == "Apple-Live-Messenger" and c[7]["date"] == "2007-12-05", c[7]
    v = skin_view(view)
    assert v["title"] == "Asiatique Live 2009" and v["date"] == "2009-02-23" and v["base"] == "Asiatique-Live-2009", v
    d = details(doc)
    assert d["title"] == "Metro" and d["date"] == "2011-05-25" and d["ext"] == "plsk", d
    assert d["download"] == SITE + "/DownloadManager.plsk?DocumentID=13203&Download=true" and d["preview"].endswith("/Metro-02.png"), d
    assert details(plp)["ext"] == "plp" and details(png)["ext"] == "png" and details(png)["preview"].endswith("pokerface.png")
    s = script_page(script)
    assert s["title"] == "Background Changer 2.5" and s["date"] == "2010-02-27" and s["preview"].endswith("/scripts/uploads/Background-Changer.jpg"), s
    print(len(c), "cards;", v, d, s)
