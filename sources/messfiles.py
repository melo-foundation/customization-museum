"""mess.be file database (paFileDB 3.0), rebuilt from Wayback captures of /pafiledb/pafiledb.php?action=file&id=N."""
import datetime, html, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

APP = "MSN / WLM"
SITE = "http://mess.be/pafiledb/pafiledb.php"
# category -> kind; None = not customization (clients, DLLs, security)
CATEGORIES = [
    (r"clients|necessary dll|security", None),
    (r"skins", "Skins"),
    (r"emoticon fonts|emoticon packs", "Emoticons"),
    (r"emoticons & display pictures", "Emoticons"),
    (r"add-?ons|bots|multiple msn|polygamy|tools|tweaks|plus! extension|various|msn messenger 6 downloads", "Tools"),
]
BY_TEXT = [("Display Pictures", r"display pic(?:ture)?s?|\bdps?\b|avatars?"), ("Winks", r"winks?"),
           ("Sounds", r"sounds?|wavs?\b"), ("Backgrounds", r"backgrounds?|wallpapers?"),
           ("Emoticons", r"emoticons?|smileys?"), ("Skins", r"\bskins?\b")]


def clean(s):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", s or "")).split())


def norm_date(s):
    m = re.search(r"(\d{1,2})/(\d{1,2})/(\d{2,4})\s*$", clean(s))
    if not m:
        return ""
    mo, d, y = map(int, m.groups())
    y += 2000 if y < 100 else 0
    try:
        return datetime.date(y, mo, d).isoformat()
    except ValueError:
        return ""


def kind(category, title, desc):
    cat = (category or "").lower()
    for rx, k in CATEGORIES:
        if re.search(rx, cat):
            break
    else:
        k = None if cat else "?"
    if k is None:
        return None
    text = title if k in ("Tools", "?") else f"{title} {desc}"
    for name, rx in BY_TEXT:
        if re.search(r"\b(?:" + rx + r")\b", text, re.I) and (k in ("Tools", "?") or name in ("Display Pictures", "Winks", "Sounds", "Backgrounds") and k == "Emoticons"):
            return name
    return None if k == "?" else k


def post(text, fid):
    """Entry fields of one file page, or None when it is not a customization item."""
    title = re.search(r'class="headercell"><center><b>(.*?)</b>', text, re.S)
    if not title:
        return None
    cell = lambda label: (re.search(r'datacell">' + label + r':</td><td[^>]*>(.*?)</td></tr>', text, re.S) or [None, ""])[1]
    desc, added = clean(cell("Description")), cell("Date Added")
    shot = re.search(r'Screenshot:</td><td[^>]*><a href="([^"]+)"', text)
    cats = re.findall(r'action=category&(?:amp;)?id=\d+[^"]*" class="small">([^<]*)</a>', text)
    k = kind(html.unescape(cats[-1]) if cats else "", clean(title.group(1)), desc)
    if not k:
        return None
    prev = re.sub(r"\s+", "", html.unescape(shot.group(1))) if shot else None
    if prev and prev.startswith("/"):
        prev = "http://mess.be" + prev
    return dict(title=clean(title.group(1)), date=norm_date(added), kind=k, desc=desc, preview=prev or None,
                page=f"{SITE}?action=file&id={fid}", download=f"{SITE}?action=download&id={fid}")


def scrape():
    best = {}
    for ts, orig in cdx("mess.be/pafiledb/*", "&limit=100000"):
        m = re.search(r"[?&]action=file&(?:amp;)?id=[+ ]*(?:%20)*(\d+)(?:&|$)", orig)
        if not m:
            continue
        key = ("PHPSESSID" in orig, "-" + ts)
        fid = int(m.group(1))
        if fid not in best or key < best[fid][0]:
            best[fid] = (key, ts, orig)
    out = []
    try:
        for fid, (_, ts, orig) in sorted(best.items()):
            p = post(capture(ts, orig) or "", fid)
            if p:
                out.append(dict(app=APP, id=f"messfiles-{fid}", title=p["title"], date=p["date"], tags=[p["kind"]],
                                page=p["page"], preview=p["preview"], download=p["download"]))
    except Blocked as e:
        print("wayback stopped:", e, flush=True)
    return out


if __name__ == "__main__":
    import sys
    rd = lambda p: open(p, encoding="utf-8", errors="replace").read()
    p = post(rd(sys.argv[1]), 3)
    assert p["title"] == "Missy Eliott MS(ki)N" and p["date"] == "2002-05-02" and p["kind"] == "Skins", p
    assert p["preview"] == "http://mess.be/_pictures/m(s)kin-missyeliott.jpg", p
    assert p["download"] == SITE + "?action=download&id=3", p
    print(p)
