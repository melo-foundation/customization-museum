import json
from lib import get, pmap

API = "https://api.pling.com/ocs/v1/content/data?categories={}&format=json&pagesize=100&page={}"
CATEGORIES = {
    "229": "Kopete",    # Kopete Styles
    "113": "Kopete",    # KDE emoticon themes (Kopete is the main consumer)
    "449": "Pidgin",
    "473": "aMSN",
    "405": "Konversation",  # nicklist themes
}


def pages(cat):
    out, page = [], 0
    while True:
        d = json.loads(get(API.format(cat, page), cache=False))
        out += d.get("data") or []
        if len(out) >= int(d.get("totalitems") or 0) or not d.get("data"):
            return out
        page += 1


def entry(it, app):
    # downloadlink1 is signed and expires in 48h; the store page lists the files
    return dict(
        app=app, id=f"ocs-{it['id']}", title=it["name"], date=(it.get("created") or "")[:10],
        page=it.get("detailpage") or f"https://www.pling.com/p/{it['id']}",
        preview=it.get("previewpic1") or None, download=None,
        tags=[it.get("typename") or "Themes"],
    )


def scrape():
    out = {}
    for cat, items in zip(CATEGORIES, pmap(pages, list(CATEGORIES), workers=4)):
        for it in items:
            out.setdefault(it["id"], entry(it, CATEGORIES[cat]))
    return sorted(out.values(), key=lambda x: x["date"], reverse=True)
