"""Legacy Firefox/Thunderbird/Mozilla complete themes, rebuilt from Wayback captures of
update.mozilla.org/themes/ (2004-05) and addons.mozilla.org browse/type:2 listings (2007-10)."""
import datetime, html, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

AMO = "https://addons.mozilla.org"
WB = "https://web.archive.org/web/"
ITEM_AMO = re.compile(
    r'<a href="(/en-US/firefox/downloads/latest/(\d+)/[^"]*?addon-\d+-latest\.(?:jar|xpi))"[^>]*?addonName="([^"]*)"'
    r'(?:.*?<img src="([^"]+)"[^>]*class="icon")?', re.S)


def app_of(url, title=""):
    s = (url + " " + title).lower()
    if "thunderbird" in s:
        return "Thunderbird"
    if "seamonkey" in s:
        return "SeaMonkey"
    if "application=mozilla" in s:
        return "Mozilla Suite"
    return "Firefox"


def norm_date(s):
    s = " ".join(html.unescape(s or "").split())
    for fmt in ("%B %d, %Y %I:%M:%S%p", "%B %d, %Y"):
        try:
            return datetime.datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return ""


def update_page(text, url=""):
    """update.mozilla.org moreinfo page -> dict or None (error/releases pages)."""
    if "Incompatible Theme" in text or "- releases" in text:
        return None
    t = re.search(r'class="title"><A HREF="moreinfo\.php\?id=\d+&vid=(\d+)">([^<]+)</A>', text, re.I)
    if not t:
        return None
    rel = re.search(r"Released on ([A-Z][a-z]+ \d+, \d{4})", text)
    added = re.search(r"Date Added:\s*([A-Z][a-z]+ \d+, \d{4})", text)
    return dict(vid=t.group(1), title=html.unescape(t.group(2)).strip(),
                date=norm_date((added or rel).group(1)) if (added or rel) else "")


def amo_listing(text):
    """addons.mozilla.org browse/type:2 -> {id: dict(title, download, icon)}."""
    out = {}
    for m in re.finditer(r'<a href="(/en-US/firefox/downloads/latest/(\d+)/[^"]*?addon-\d+-latest\.(?:jar|xpi))"[^>]*?addonName="([^"]*)"[^>]*?addonIcon="([^"]*)"', text):
        href, aid, name, icon = m.groups()
        out[int(aid)] = dict(title=html.unescape(name), download=AMO + href, icon=AMO + icon if "theme.png" not in icon else None)
    return out


def scrape():
    amo_rows = cdx("addons.mozilla.org/en-US/firefox/browse/type:2*", "&limit=5000")
    upd_rows = cdx("update.mozilla.org/themes/*", "&limit=20000")
    items, upd = {}, {}
    for ts, orig in upd_rows:
        o = html.unescape(orig).replace("&amp", "")
        m = re.search(r"moreinfo\.php\?(?:application=(\w+)&)?id=(\d+)(&vid=\d+)?$", o)
        if m:
            key = int(m.group(2))
            if key not in upd or (m.group(3) and "vid" not in upd[key][1]):
                upd[key] = (ts, o)
    try:
        for ts, orig in amo_rows:
            for aid, d in amo_listing(capture(ts, orig) or "").items():
                items.setdefault(aid, dict(d, app="Firefox", date="", ts=ts, page=f"{AMO}/en-US/firefox/addon/{aid}"))
        for aid, (ts, o) in sorted(upd.items()):
            p = update_page(capture(ts, o) or "")
            if not p:
                continue
            it = items.setdefault(aid, dict(download=None, icon=None, ts=ts))
            it.update(title=p["title"], date=p["date"] or it.get("date", ""), app=app_of(o, p["title"]),
                      page=it.get("page") or f"http://update.mozilla.org/themes/moreinfo.php?id={aid}&vid={p['vid']}")
            it["ts"] = ts
            it["download"] = it["download"] or f"http://update.mozilla.org/themes/install.php?id={aid}&vid={p['vid']}"
    except Blocked as e:
        print("wayback stopped:", e, flush=True)
    wb = lambda ts, u: f"{WB}{ts}/{u}" if u else None
    return [dict(app=d["app"], id=f"fxtheme-{aid}", title=d["title"], date=d["date"], tags=["Themes"],
                 page=wb(d["ts"], d["page"]), preview=wb(d["ts"], d["icon"]), download=wb(d["ts"], d["download"]))
            for aid, d in sorted(items.items()) if d.get("title")]


if __name__ == "__main__":
    import sys
    D = sys.argv[1]  # dir with s1/ s3/ samples
    r = update_page(open(f"{D}/s3/63a39f24b67731d0", encoding="utf-8", errors="replace").read())
    assert r == dict(vid="509", title="Nautical for Thunderbird 0.1.0", date="2004-08-11"), r
    assert update_page(open(f"{D}/s3/5a5ae88ce4865e2a", encoding="utf-8", errors="replace").read()) is None
    a = amo_listing(open(f"{D}/s1/2654f7cdae21658b", encoding="utf-8", errors="replace").read())
    assert a[3248]["title"] == "BlackJapanMAX" and a[3248]["download"].endswith("/3248/addon-3248-latest.jar"), a.get(3248)
    assert app_of("x?application=thunderbird&id=1") == "Thunderbird" and app_of("x", "Foo for Thunderbird") == "Thunderbird"
    print("ok", len(a), "amo items")
