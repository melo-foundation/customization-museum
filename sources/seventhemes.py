"""7themes.su: Windows themes/visual styles gallery (downloads are ad-gated, so download is None)."""
import html, re, time
from lib import get

APP = "Windows Visual Styles"
B = "https://7themes.su"


def slow(url):
    from lib import CACHE
    import hashlib, os
    cached = os.path.exists(os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest()))
    t = get(url)
    if not cached:
        time.sleep(1)
    return t


def parse_list(text):
    out = []
    for m in re.finditer(r'<div id="entryID(\d+)">.*?<img src="([^"]+)"[^>]*alt="([^"]*)".*?class="ent-title" href="([^"]+)"', text, re.S):
        out.append((m.group(1), m.group(2), html.unescape(m.group(3)), m.group(4)))
    return out


def os_tag(text, url):
    m = re.search(r"fa-windows\"></i> OC <span>\s*(.*?)\s*</span>", text, re.S)
    s = (m.group(1) if m else "") + " " + url
    for k, v in (("11", "11"), ("10", "10"), ("8", "8"), ("7", "7"), ("vista", "Vista"), ("xp", "XP")):
        if re.search(rf"(?<![\d.]){k}(?!\d)", s.lower()):
            return v
    return None


def scrape():
    items, seen, p = [], set(), 1
    while p < 200:
        got = [g for g in parse_list(slow(f"{B}/load/?page{p}") or "") if g[0] not in seen]
        if not got:
            break
        for eid, img, title, href in got:
            seen.add(eid)
            d = slow(B + href) or ""
            dm = re.search(r"fa-clock-o\"></i> Дата <span>(\d\d)\.(\d\d)\.(\d{4})", d)
            au = re.search(r"Автор \(разработчик\):</b>\s*([^<]+)", d)
            v = os_tag(d, href)
            extra = {}
            if au and au.group(1).strip():
                extra["Author"] = html.unescape(au.group(1).strip())
            items.append(dict(app=APP, id=f"7themes-{eid}", title=title,
                              date=f"{dm.group(3)}-{dm.group(2)}-{dm.group(1)}" if dm else "",
                              tags=([v] if v else []) + ["Visual Styles"], page=B + href,
                              preview=B + img if img.startswith("/") else img, download=None, extra=extra))
        p += 1
    return items
