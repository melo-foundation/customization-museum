"""Opera skins and setups: my.opera.com/community/customize/ (Wayback captures)."""
import html, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

APP = "Opera"
BASE = "http://my.opera.com/community/customize"
SKIN_INFO = re.compile(r"/skins/info/\?id=(\d+)")
SETUP_INFO = re.compile(r"/setups/info/\?id=(\d+)")
SKIN_FILE = re.compile(r"/skins/skin\.(?:pl|cgi)\?id=(\d+)")


def info_page(text):
    t = re.search(r'<h2 id="skinname"[^>]*>([^<]*)', text)
    img = re.search(r'<img src="([^"]*img\.pl\?id=\d+)"[^>]*id="skinpic"', text)
    return dict(title=html.unescape(t.group(1)).strip() if t else "", preview=img.group(1) if img else None)


def scrape():
    skins, setups, files = {}, {}, set()
    for ts, orig in cdx("my.opera.com/community/customize/*", "&limit=50000"):
        u = urllib.parse.unquote(orig).replace("&amp;", "&")
        if m := SKIN_INFO.search(u):
            skins.setdefault(m.group(1), (ts, orig))
        elif m := SETUP_INFO.search(u):
            setups.setdefault(m.group(1), (ts, orig))
        elif m := SKIN_FILE.search(u):
            files.add(m.group(1))
    out = []
    try:
        for kind, found in (("skin", skins), ("setup", setups)):
            for sid, (ts, orig) in sorted(found.items(), key=lambda x: int(x[0])):
                d = info_page(capture(ts, orig) or "")
                if not d["title"]:
                    continue
                out.append(dict(
                    app=APP, id=f"opera-{sid}" if kind == "skin" else f"opera-setup-{sid}", title=d["title"], date="",
                    tags=["Skins"] if kind == "skin" else ["Setups"],
                    page=f"{BASE}/{kind}s/info/?id={sid}",
                    preview=f"http://my.opera.com{d['preview']}" if d["preview"] else None,
                    download=f"{BASE}/skins/skin.pl?id={sid}" if kind == "skin" else f"{BASE}/setups/info/?id={sid}",
                ))
    except Blocked as e:
        print("wayback stopped:", e, flush=True)
    seen = {o["id"] for o in out}
    for sid in sorted(files, key=int):
        if f"opera-{sid}" not in seen:
            out.append(dict(app=APP, id=f"opera-{sid}", title=f"Opera skin {sid}", date="", tags=["Skins"],
                            page=f"{BASE}/skins/info/?id={sid}", preview=f"{BASE}/skins/img.pl?id={sid}",
                            download=f"{BASE}/skins/skin.pl?id={sid}"))
    return out


if __name__ == "__main__":
    import sys
    d = info_page(open(sys.argv[1], encoding="utf-8").read())
    assert d == dict(title="Tango CL", preview="/community/customize/skins/img.pl?id=3465"), d
    s = info_page(open(sys.argv[2], encoding="utf-8").read())
    assert s["title"] == "Extrasmall", s
    print(d, s, "ok")
