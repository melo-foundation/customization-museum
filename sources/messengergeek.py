import json, re, urllib.parse
from lib import get, pmap

BASE = "https://wink.messengergeek.com"
CATEGORIES = {"customization": 19, "msgplus": 23, "concepts-designs": 26}
FILE = re.compile(r"\.(zip|rar|7z|exe|msi|plsk|plsc|plsc2|mez|ytf|cab)(\?|$)", re.I)
HOSTS = re.compile(r"(mediafire\.com|mega\.nz|drive\.google\.com|dropbox\.com|archive\.org/(details|download)|github\.com/[^/]+/[^/]+/releases|sourceforge\.net)", re.I)
KINDS = [
    ("Emoticons", r"emoticon|smiley|smilie|emoji"), ("Skins", r"skin|plsk|style"), ("Themes", r"theme"),
    ("Wallpapers", r"wallpaper|background"), ("Display Pictures", r"display pic|avatar|buddy icon|\bdp\b"),
    ("Scripts", r"script|plsc"), ("Sounds", r"sound"), ("Winks", r"wink"), ("Icons", r"icon"),
]


def jget(url):
    text = get(url)
    return json.loads(text) if text else None


def topics(slug, cid):
    out, page = [], 0
    while True:
        d = jget(f"{BASE}/c/{slug}/{cid}.json?page={page}")
        ts = d["topic_list"]["topics"] if d else []
        out += [(slug, t) for t in ts]
        if not ts or not d["topic_list"].get("more_topics_url"):
            return out
        page += 1


def links(cooked):
    hrefs = re.findall(r'<a[^>]+href="([^"]+)"', cooked)
    return [urllib.parse.urljoin(BASE, h) for h in hrefs]


def parse(item):
    slug, t = item
    if t["title"].startswith("About the "):
        return None
    d = jget(f"{BASE}/t/{t['id']}.json")
    if not d:
        return None
    posts = d["post_stream"]["posts"]
    first = posts[0]["cooked"] if posts else ""
    attach = [urllib.parse.urljoin(BASE, h) for p in posts
              for h, name in re.findall(r'<a class="attachment" href="([^"]+)"[^>]*>([^<]*)', p["cooked"]) if FILE.search(name.strip())]
    files = [u for p in posts for u in links(p["cooked"]) if FILE.search(urllib.parse.urlsplit(u).path) or HOSTS.search(u)]
    download = (attach + files or [None])[0]
    imgs = [urllib.parse.urljoin(BASE, s) for s in re.findall(r'<img[^>]+src="([^"]+)"', first)
            if "emoji" not in s and "avatar" not in s and "user_avatar" not in s]
    preview = urllib.parse.urljoin(BASE, t["image_url"]) if t.get("image_url") else (imgs[0] if imgs else None)
    title = t["title"]
    blob = title + " " + re.sub(r"<[^>]+>", " ", first)
    kinds = [k for k, rx in KINDS if re.search(rx, blob, re.I)]
    title_kinds = [k for k, rx in KINDS if re.search(rx, title, re.I)]
    helpish = "?" in title or re.search(r"\b(help|error|problem|issue|question|anyone|looking for|request|need|give me)\b", title, re.I)
    if helpish:
        keep = title_kinds and download
    elif slug == "concepts-designs":
        keep = download and kinds
    else:
        keep = (title_kinds and (download or preview)) or (download and kinds)
    if not keep:
        return None
    app = "MSN / WLM"
    if not re.search(r"msn|wlm|live messenger|windows messenger", title, re.I):
        for name, rx in (("Yahoo! Messenger", r"yahoo"), ("AIM", r"\baim\b"), ("ICQ", r"\bicq\b")):
            if re.search(rx, title, re.I):
                app = name
    return dict(
        app=app, id=f"messengergeek-{t['id']}", title=title, date=t["created_at"][:10],
        page=f"{BASE}/t/{t['slug']}/{t['id']}", preview=preview, download=download,
        tags=["MessengerGeek", slug] + kinds[:2],
    )


def scrape():
    items = [x for slug, cid in CATEGORIES.items() for x in topics(slug, cid)]
    return sorted([e for e in pmap(parse, items, workers=3) if e], key=lambda e: e["date"], reverse=True)
