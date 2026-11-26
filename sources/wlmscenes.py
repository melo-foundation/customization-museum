import html, json, re, urllib.parse
from lib import get

APP = "MSN / WLM"
WIKI = "https://windowswallpaper.miraheze.org"
API = WIKI + "/w/api.php?action=parse&page=Windows_Live_Messenger&prop=text&format=json"


def kind_version(sec):
    s = sec.replace("_", " ")
    kind = "Display Pictures" if "Display" in s else "Scenes" if "Scenes" in s or "Windows Live Messenger 20" in s else "Backgrounds"
    ver = re.search(r"Windows Live Messenger 2009|2011 and 2012|6\.1 to 8\.5", s)
    ver = {"2011 and 2012": "WLM 2011/2012", "6.1 to 8.5": "MSN 6.1-8.5"}.get(ver.group(0) if ver else "", "WLM 2009" if ver else None)
    return kind, ver


def scrape():
    text = json.loads(get(API))["parse"]["text"]["*"]
    items, sec, kind = {}, "Backgrounds", None
    toks = re.finditer(r'<h([23]) id="([^"]+)"|<a href="(/wiki/File:[^"#?]+)"[^>]*><img src="([^"]+)"', text)
    for m in toks:
        if m.group(1):
            if m.group(1) == "2":
                top = m.group(2)
            sec = m.group(2)
            continue
        fpath, thumb = m.group(3), m.group(4)
        name = urllib.parse.unquote(fpath.split("File:", 1)[1])
        base = html.unescape(thumb)
        if base.startswith("//"):
            base = "https:" + base
        full = re.sub(r"/thumb/(.+?)/[^/]+$", r"/\1", base) if "/thumb/" in base else base
        k, v = kind_version(sec)
        k = kind_version(top)[0]
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        if slug in items:
            continue
        title = re.sub(r"\.\w+$", "", name).replace("_", " ")
        items[slug] = dict(app=APP, id=f"wlmscenes-{slug}", title=title, date="", page=WIKI + fpath,
                           preview=base, download=full, tags=[k] + ([v] if v else []))
    return list(items.values())
