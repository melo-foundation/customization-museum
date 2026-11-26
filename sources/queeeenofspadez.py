import html, re, urllib.parse
from lib import get, pmap

BASE = "http://queeeenofspadez.50webs.com/"
APP = "Yahoo! Messenger"


def popups():
    urls = []
    for page in ("Skins.html", "Skins2.html"):
        urls += re.findall(r"window\.open\('(http://queeeenofspadez\.50webs\.com/[^']+\.html)'", get(BASE + page) or "")
    return list(dict.fromkeys(urls))


def parse(url):
    text = get(url) or ""
    title = re.search(r"<title>([^<]*)", text, re.I)
    imgs = [s for s in re.findall(r'<img[^>]+src="([^"]+)"', text, re.I) if not re.search(r"counter|sep(long)?\.png|dl\.png|queeeenlink", s, re.I)]
    imgs.sort(key=lambda s: not re.search(r"full|preview", s, re.I))
    files = [urllib.parse.unquote(f) for f in re.findall(r"[?&]url=([^\"&]+\.(?:zip|exe))", text, re.I)]
    files = ["http://" + f if not f.startswith("http") else f for f in files]
    dl = next((f for f in files if f.lower().endswith(".zip")), files[0] if files else None)
    slug = url.rsplit("/", 1)[-1][:-5].lower()
    return dict(
        app=APP, id=f"queeeenofspadez-{slug}", title=html.unescape(title.group(1).strip()) if title else slug,
        date="", page=url, preview=urllib.parse.urljoin(url, imgs[0]) if imgs else None, download=dl, tags=["Skins"],
    )


def scrape():
    return pmap(parse, popups(), workers=2)
