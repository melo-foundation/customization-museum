import html, re, urllib.parse
from lib import get, pmap

BASE = "https://www.adiumxtras.com/"
APP = "Adium"
LIST = BASE + "index.php?a=search&cat_id=all&sort=ranking&user_id=0&s=&start={}"
ROW = re.compile(
    r'<img src="([^"]+)" alt="" /></a>\s*</td>\s*<td[^>]*>\s*<a href="index\.php\?a=xtras&amp;xtra_id=(\d+)" class="singleName">(.*?)</a>'
    r'\s*<span class="itemDesc">\([^)]*\) - ([^<]*?)\s*</span>', re.S)


def parse(text):
    for img, xid, title, cat in ROW.findall(text or ""):
        preview = None if "/images/thumbs/" not in img else urllib.parse.urljoin(BASE, img)
        yield dict(app=APP, id=f"adium-{xid}", title=html.unescape(title).strip(), date="",
                   page=f"{BASE}index.php?a=xtras&xtra_id={xid}", preview=preview,
                   download=f"{BASE}download/{xid}", tags=[html.unescape(cat).strip()])


def scrape():
    items, start = {}, 0
    while True:
        batch = pmap(lambda s: get(LIST.format(s)), range(start, start + 20 * 4, 20), workers=4)
        rows = [r for t in batch for r in parse(t)]
        if not rows:
            break
        for r in rows:
            items[r["id"]] = r
        start += 20 * 4
    return list(items.values())
