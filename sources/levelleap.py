"""Messenger Plus! skins, scripts and plugins from the levelleap.com open directory (Escargot community mirror)."""
import html, re, urllib.parse
from lib import get

BASE = "https://storage.levelleap.com/nina/clients/msnp/"
APP = "MSN / WLM"
FOLDERS = {"msgplus/skins/": "Skins", "msgplus/scripts/": "Scripts", "msgplus/plugins/": "Plugins", "winks/": "Winks"}
IMG = (".jpg", ".jpeg", ".png", ".gif")


def listing(url):
    """(name, date) for each file in an Apache 'Index of' page; folders skipped."""
    text = get(url) or ""
    out = []
    for m in re.finditer(r'<a href="([^"?/][^"]*)">[^<]*</a>\s*</td>\s*<td[^>]*>(\d{4}-\d{2}-\d{2})|<a href="([^"?/][^"]*)">[^<]*</a>\s+(\d{4}-\d{2}-\d{2})', text):
        name, date = (m.group(1), m.group(2)) if m.group(1) else (m.group(3), m.group(4))
        if not name.endswith("/"):
            out.append((urllib.parse.unquote(html.unescape(name)), date))
    return out


def base_name(f):
    """'Agaeti-1.01.plsk' -> 'Agaeti' (strip extension and trailing version)."""
    return re.sub(r"[-_ ]?v?\d+(\.\d+)*$", "", f.rsplit(".", 1)[0]).lower()


def scrape():
    items = []
    for folder, kind in FOLDERS.items():
        files = listing(BASE + folder)
        imgs = {base_name(f): f for f, _ in files if f.lower().endswith(IMG)}
        for f, date in files:
            if f.lower().endswith(IMG) or f.lower().endswith(".bak"):
                continue
            title = f.rsplit(".", 1)[0].replace("-", " ").replace("_", " ")
            img = imgs.get(base_name(f))
            q = lambda name: BASE + folder + urllib.parse.quote(name)
            items.append(dict(
                app=APP, id=f"levelleap-{kind.lower()}-{base_name(f)}-{f.rsplit('.', 1)[-1].lower()}",
                title=title, date="", page=BASE + folder, preview=q(img) if img else None,
                download=q(f), tags=[kind], extra={"Mirror date": date},
            ))
    seen, out = set(), []
    for e in items:
        if e["id"] in seen:
            e["id"] += "-" + str(sum(1 for x in out if x["id"].startswith(e["id"])))
        seen.add(e["id"])
        out.append(e)
    return out


if __name__ == "__main__":
    assert base_name("Agaeti-1.01.plsk") == "agaeti" and base_name("Agaeti.jpg") == "agaeti"
    assert base_name("365-Skin-2.60.plsk") == "365-skin" and base_name("365-Skin.jpg") == "365-skin"
    print("ok")
