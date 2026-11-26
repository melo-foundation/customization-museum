import html, re
from lib import get, pmap

BASE = "https://www.themeworld.com"
APP = "Windows Desktop Themes"
CATS = ["art", "automotive", "cartoons", "computers", "education", "games", "anime", "misc", "movies",
        "music", "nature", "people", "places", "products", "scifi", "sports", "tv", "utilities"]


def category_pages(cat):
    first = f"{BASE}/themes/{cat}.html"
    text = get(first) or ""
    n = [int(x) for x in re.findall(rf'href="/themes/{cat}(\d+)\.html"', text)]
    return [first] + [f"{BASE}/themes/{cat}{i}.html" for i in range(1, max(n, default=-1) + 1)]


def parse_listing(text):
    for m in re.finditer(
        r'<tr[^>]*><td><a href="/cgi-bin/preview\.pl/themes/([^"/]+)\.zip">[^<]*</a>\s*</td><td[^>]*>[^<]*</td>'
        r'<td[^>]*>([^<]*)</td><td>(.*?)</td></tr>', text, re.S):
        name, date, desc = m.groups()
        yield name, date.strip(), html.unescape(re.sub(r"<[^>]+>", "", desc)).strip()


def scrape():
    pages = [(c, u) for c in CATS for u in category_pages(c)]
    items = {}
    for (cat, url), text in zip(pages, pmap(lambda p: get(p[1]), pages, 3)):
        for name, date, desc in parse_listing(text or ""):
            if name in items:
                continue
            items[name] = dict(app=APP, id=f"themeworld-{name}", title=desc or name, date=date, page=url,
                               preview=f"{BASE}/themes/previews/{name}.1.jpg",
                               download=f"{BASE}/cgi-bin/dl.pl/themes/{name}.zip", tags=[cat])
    return sorted(items.values(), key=lambda x: x["date"], reverse=True)
