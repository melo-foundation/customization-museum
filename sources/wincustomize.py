import hashlib, html, os, re, subprocess, time
from lib import CACHE, UA, pmap

BASE = "https://www.wincustomize.com"
# ponytail: sample cap per category; set WINCUSTOMIZE_PAGES=0 for the full ~hours-long crawl
MAX_PAGES = int(os.environ.get("WINCUSTOMIZE_PAGES", "5"))

APPS = {
    "windowblinds": "WindowBlinds", "windowblinds_textures": "WindowBlinds",
    "desktopx_objects": "DesktopX", "desktopx_themes": "DesktopX", "desktopx_widgets": "DesktopX",
    "iconpackager": "IconPackager", "cursorfx": "CursorFX", "logonstudio": "LogonStudio", "logonstudio_xp": "LogonStudio",
    "bootskins": "BootSkin", "bootskins_xp": "BootSkin", "objectdock": "ObjectDock", "objectdock_backgrounds": "ObjectDock",
    "objectbar2": "ObjectBar", "rainmeter": "Rainmeter", "rainlendar": "Rainlendar", "sysmetrix": "SysMetrix",
    "winamp": "Winamp", "winmedia": "Windows Media Player", "winstep": "Winstep", "xion": "XION",
    "maxthon": "Maxthon", "shadowfx": "ShadowFX", "curtains": "Curtains", "start10_menus": "Start10",
    "start11_pages": "Start11", "start_menu_buttons": "Start menu buttons", "sound_schemes": "Sound schemes",
    "desktop_gadgets": "Gadgets", "sidebar_gadgets": "Gadgets", "google_gadgets": "Gadgets",
    "icons": "Icons", "dream": "DeskScapes", "screensavers": "Screensavers", "rightclick": "RightClick",
    "suites": "Suites", "tiles": "Tiles",
}
# wallpapers/screenshots/premium/game mods aren't program customizations
CATS = list(APPS)



def get(url):
    """Cloudflare here challenges Python's urllib but not curl, so fetch with curl into lib's cache."""
    path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest())
    if os.path.exists(path):
        return open(path, encoding="utf-8").read()
    for attempt in range(3):
        r = subprocess.run(["curl", "-sL", "-m", "60", "-A", UA, "-w", "\n%{http_code}", url], capture_output=True, text=True, errors="replace")
        body, _, code = r.stdout.rpartition("\n")
        if code == "200" and "<title>Just a moment" not in body:
            os.makedirs(CACHE, exist_ok=True)
            open(path, "w", encoding="utf-8").write(body)
            return body
        if code == "404":
            return None
        time.sleep(5 * 2 ** attempt)
    raise RuntimeError(f"failed: {url}")


CARD = re.compile(
    r'<div class="explore_listing[^"]*">.*?<a href="/explore/([a-z0-9_]+)/(\d+)/">\s*<img src="([^"]+)"[^>]*alt="([^"]*)"'
    r'.*?<a href="/explore/[a-z0-9_]+">([^<]+)</a>.*?Updated (\d+)/(\d+)/(\d+)',
    re.S,
)


def last_page(cat):
    text = get(f"{BASE}/explore/{cat}") or ""
    pages = [int(p) for p in re.findall(rf'href="/explore/{cat}/page/(\d+)"', text)]
    return max(pages, default=1)


def page_url(cat, n):
    return f"{BASE}/explore/{cat}" + (f"/page/{n}" if n > 1 else "")


def parse(text):
    for cat, iid, img, title, label, m, d, y in CARD.findall(text or ""):
        yield dict(
            app=APPS.get(cat, label.strip()), id=f"wincustomize-{iid}", title=html.unescape(title),
            date=f"{y}-{int(m):02d}-{int(d):02d}", page=f"{BASE}/explore/{cat}/{iid}/",
            preview=html.unescape(img).split("?")[0], download=f"{BASE}/explore/{cat}/{iid}/download",
            tags=[html.unescape(label.strip())],
        )


def scrape():
    urls = []
    for cat in CATS:
        n = last_page(cat)
        urls += [page_url(cat, i) for i in range(1, (min(n, MAX_PAGES) if MAX_PAGES else n) + 1)]
    items = {}
    for text in pmap(get, urls, workers=3):
        for e in parse(text):
            items[e["id"]] = e
    return sorted(items.values(), key=lambda x: x["date"], reverse=True)
