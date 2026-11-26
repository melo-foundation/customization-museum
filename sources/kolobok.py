import html, re
from lib import get, pmap

BASE = "https://kolobok.us"
# download category -> client
CATS = {7: "QIP", 8: "QIP", 10: "Miranda IM", 11: "R&Q", 12: "Pidgin", 13: "Gajim", 14: "Kopete", 15: "Jabber",
        26: "Jimm", 27: "Digsby", 28: "qutIM", 29: "Trillian", 30: "Instantbird", 16: "Mobile"}


def iso(s):
    m = re.match(r"(\d\d)\.(\d\d)\.(\d\d)", s or "")
    return f"{2000 + int(m.group(3)) if int(m.group(3)) < 70 else 1900 + int(m.group(3))}-{m.group(2)}-{m.group(1)}" if m else ""


def category(cid):
    text = get(f"{BASE}/download.php?list.{cid}") or ""
    name = re.search(r"<a href='download\.php\?list\.%d'>([^<]*)</a>" % cid, get(BASE + "/download.php") or "")
    gname = html.unescape(name.group(1)) if name else str(cid)
    out = []
    for row in re.findall(r"<tr>\s*<td class='forumheader2' style='text-align:left;'>(.*?)</tr>", text, re.S):
        a = re.search(r"download\.php\?view\.(\d+)'>([^<]+)<", row)
        if not a:
            continue
        d = re.search(r"class='defaulttext' style='text-align:center;'>\s*(\d\d\.\d\d\.\d\d)", row)
        out.append((a.group(1), html.unescape(a.group(2)).strip(), iso(d.group(1)) if d else "", cid, gname))
    return out


def detail(t):
    n, title, date, cid, gname = t
    page = f"{BASE}/download.php?view.{n}"
    text = get(page) or ""
    img = re.search(r"<img class='dl_image' src='([^']+)'", text)
    req = re.search(r"href='(request\.php\?\d+)'", text)
    app = CATS[cid]
    if app == "QIP" and re.search(r"Miranda|Pidgin|Jimm|qutIM", title, re.I):
        app = re.search(r"Miranda|Pidgin|Jimm|qutIM", title, re.I).group(0)
    return dict(app=app, id=f"kolobok-{n}", title=title, date=date, page=page,
                preview=f"{BASE}/{img.group(1).lstrip('/')}" if img else None,
                download=f"{BASE}/{req.group(1)}" if req else None, tags=["Emoticons", gname])


def scrape():
    rows = {}
    for res in pmap(category, list(CATS), 3):
        for r in res:
            rows.setdefault(r[0], r)
    return sorted(pmap(detail, list(rows.values()), 3), key=lambda x: x["date"], reverse=True)
