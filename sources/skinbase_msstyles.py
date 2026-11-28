"""Windows visual styles (.msstyles) on skinbase.org (list pages carry JSON-LD)."""
import html, json, re, time
from lib import get

APP = "Windows Visual Styles"
SB = "https://skinbase.org"


def parse(text):
    out = []
    for blk in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text or "", re.S):
        try:
            d = json.loads(blk)
        except ValueError:
            continue
        for el in (d.get("mainEntity") or {}).get("itemListElement", []):
            it = el.get("item") or {}
            m = re.search(r"/art/(\d+)/", it.get("url", ""))
            if m:
                out.append((m.group(1), it))
    return out


def version(title):
    t = title.lower()
    for k, v in (("windows 11", "11"), ("win11", "11"), ("windows 10", "10"), ("win10", "10"), ("windows 8", "8"),
                 ("win8", "8"), ("windows 7", "7"), ("win7", "7"), ("vista", "Vista")):
        if k in t:
            return v
    return "XP"


SORTS = ["newest", "oldest", "popular", "downloads", "top-rated"]


def scrape():
    """Each sort order exposes only its first 69 entries; the union covers the category."""
    items, seen = [], set()
    for sort in SORTS:
        for page in range(1, 40):
            got = [g for g in parse(get(f"{SB}/skins/desktop-shell/msstyles?page={page}&sort={sort}"))]
            if not got:
                break
            for aid, it in got:
                if aid in seen:
                    continue
                seen.add(aid)
                title = html.unescape(it["name"])
                items.append(dict(
                    app=APP, id=f"skinbase-msstyles-{aid}", title=title, date=(it.get("datePublished") or "")[:10],
                    tags=[version(title), "Visual Styles"], page=it["url"], preview=it.get("image"),
                    download=f"{SB}/download/artwork/{aid}",
                    extra={"Author": (it.get("creator") or {}).get("name", "")}))
            time.sleep(1)
    return items
