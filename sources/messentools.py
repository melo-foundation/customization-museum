import html, re
from lib import get, pmap

BASE = "https://www.messentools.com/en/"
APP = "MSN / WLM"
KINDS = (("msn-emoticons", "msn-emoticon-details-and-download", "emo", "Emoticons"),
         ("msn-avatares", "msn-avatares-details-and-download", "av", "Display Pictures"))

ITEM = re.compile(
    r'<a rel="nofollow" href="(https://www\.messentools\.com/en/[a-z-]+/id/(\d+)/)" title="([^"]*)">\s*'
    r'<img class="img-[a-z]+" src="([^"]+)"'
)


def last_page(listing):
    return max(map(int, re.findall(rf"{listing}/all/(\d+)/", get(BASE + listing + "/all/1/") or "")), default=1)


def scrape():
    items = {}
    for listing, _, prefix, tag in KINDS:
        urls = [f"{BASE}{listing}/all/{n}/" for n in range(1, last_page(listing) + 1)]
        for text in pmap(get, urls, workers=4):
            for page, n, title, img in ITEM.findall(text or ""):
                cat = re.search(r"/images/[^/]+/([^/]+)/", img)
                items[f"messentools-{prefix}-{n}"] = dict(
                    app=APP, id=f"messentools-{prefix}-{n}", title=html.unescape(title), date="",
                    page=page, preview=img, download=img,
                    tags=[tag] + ([cat.group(1).replace("-", " ").title()] if cat else []),
                )
    return sorted(items.values(), key=lambda e: e["id"])
