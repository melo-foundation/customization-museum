import html, re, urllib.parse
from lib import get, pmap

BASE = "https://miranda-ng.org"
APP = "Miranda NG"


def listing_urls():
    url, seen = BASE + "/addons/", []
    while url:
        seen.append(url)
        text = get(url)
        m = re.search(r'<a href="([^"]+)" class="older"', text or "")
        url = urllib.parse.urljoin(BASE, m.group(1)) if m else None
    return seen


def parse_listing(text):
    for m in re.finditer(
        r'<h1 class="article-title">\s*<a href="([^"]+)">\s*([^<]+?)\s*</a>\s*</h1>(.*?)<div class="footer">', text, re.S
    ):
        url, title, rest = m.groups()
        aid = re.search(r"/addons/(\d+)/", url)
        if aid:
            date = re.search(r'<span class="date moment">([^<]+)<', rest)
            yield aid.group(1), url, html.unescape(title), date.group(1) if date else ""


def parse_detail(text):
    img = re.search(r'<a href="([^"]+)"[^>]*data-dimbox', text)
    dl = re.search(r'<a href="([^"]*/ADDONS/files/[^"]+)">Download</a>', text)
    tags = re.findall(r'<a href="https://miranda-ng\.org/tags/[^"]+/">([^<]+)</a>', text)
    absolute = lambda u: urllib.parse.urljoin(BASE, u) if u else None
    return absolute(img.group(1) if img else None), absolute(dl.group(1) if dl else None), list(dict.fromkeys(tags))


def scrape():
    items = {}
    for text in pmap(get, listing_urls()):
        for aid, url, title, date in parse_listing(text):
            items[aid] = dict(app=APP, id=f"miranda-{aid}", title=title, date=date, page=url)
    def fill(it):
        it["preview"], it["download"], it["tags"] = parse_detail(get(it["page"]))
        return it
    return sorted(pmap(fill, list(items.values())), key=lambda x: x["date"], reverse=True)
