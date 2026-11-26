import html, re
from lib import get

URL = "https://www.videolan.org/vlc/skins.php"
Q = r"'((?:[^'\\]|\\.)*)'"


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def scrape():
    text = get(URL)
    items, seen = [], set()
    pat = re.compile(r"showSkinBox\((\d+),%s,%s,%s,%s,%s,%s,[^,]*,[^,]*,%s" % ((Q,) * 6 + (Q,)))
    for m in pat.finditer(text):
        sid, title, author, date, _dl, fname, _size, shot = m.groups()[:8] if False else (m.group(1), m.group(2), m.group(3), m.group(4), m.group(5), m.group(6), m.group(7), m.group(8))
        un = lambda s: html.unescape(s.replace("\\'", "'"))
        title, fname = un(title), un(fname)
        s = slug(title) or sid
        if s in seen:
            s = f"{s}-{sid}"
        seen.add(s)
        thumb = re.search(r'<img src="([^"]*/tm_[^"]*)"', text[m.end():m.end() + 400])
        items.append(dict(
            app="VLC", id=f"vlc-{s}", title=title, date=date if re.match(r"\d{4}-\d\d-\d\d$", date) else "",
            page=URL, preview=un(shot).replace(" ", "%20") if shot else (thumb.group(1) if thumb else None),
            download="https://www.videolan.org/vlc/download-skins2-go.php?url=" + fname.replace(" ", "%20"),
            tags=["Skins"]))
    return items
