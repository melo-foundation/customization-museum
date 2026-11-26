import html, re
from lib import get, pmap

BASE = "https://totalcmd.net"
MONTHS = {m: i + 1 for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}


def iso(s):
    m = re.match(r"(\d+) (\w{3}) (\d{4})", s or "")
    return f"{m.group(3)}-{MONTHS[m.group(2)]:02d}-{int(m.group(1)):02d}" if m and m.group(2) in MONTHS else ""


def page(n):
    text = get(f"{BASE}/plugins?category=iconpack&page={n}") or ""
    out = []
    for card in re.findall(r'<article class="card">(.*?)</article>', text, re.S):
        a = re.search(r'<h3 class="card-title"><a href="[^"]*/plugins/([^"/]+)">([^<]+)</a>', card)
        if not a or "tag-iconpack" not in card:
            continue
        slug, title = a.groups()
        img = re.search(r'<img src="([^"]+)"', card)
        foot = re.search(r'class="card-foot">(.*?)</p>', card, re.S)
        date = re.findall(r"<span>(\d+ \w{3} \d{4})</span>", foot.group(1)) if foot else []
        out.append(dict(app="Total Commander", id=f"totalcmd-{slug}", title=html.unescape(title).strip(),
                        date=iso(date[0]) if date else "", page=f"{BASE}/plugins/{slug}",
                        preview=img.group(1) if img else None, download=f"{BASE}/download/{slug}/main", tags=["Icons"]))
    return out


def scrape():
    items = {}
    for chunk in range(1, 33, 3):
        res = pmap(page, range(chunk, min(chunk + 3, 33)), 3)
        for r in res:
            for it in r:
                items[it["id"]] = it
    return sorted(items.values(), key=lambda x: x["date"], reverse=True)
