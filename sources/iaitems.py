import json, re, urllib.parse
from lib import get, pmap

# (identifier, app, kind tag, file extensions to index)
ITEMS = [
    ("the-msn-windows-live-messenger-winks-archive", "MSN / WLM", "Winks", (".zip",)),
    ("msnpack1", "MSN / WLM", "Winks", (".rar",)),
    ("the-diamond_202511", "MSN / WLM", "Winks", (".mco",)),
    ("ogodance", "MSN / WLM", "Winks", (".mco",)),
    ("mini-andiamo", "MSN / WLM", "Winks", (".mco",)),
    ("adidas-a1-wink_202511", "MSN / WLM", "Winks", (".mco",)),
    ("open-season-youre-funny", "MSN / WLM", "Winks", (".mco",)),
    ("orangina_feu", "MSN / WLM", "Winks", (".mco",)),
    ("w800_ringring_202511", "MSN / WLM", "Winks", (".mco",)),
    ("msn-wink-fart-guy", "MSN / WLM", "Winks", (".mp4",)),
    ("i-station-portable-v-5.0", "PSP", "Themes", (".ptf",)),
    ("collection-of-psp-themes", "PSP", "Themes", (".ptf",)),
    ("windows-xp-ms-signed-themes", "Windows XP", "Themes", (".zip",)),
    ("stargate-sg-1with-media-library", "Quintessential Player", "Skins", (".qsk",)),
    ("cursor-xpfree-130", "CursorXP", "Cursors", (".exe",)),
]
GH = "PSPmodx/psp-theme-archive"
GH_EXT = (".ptf", ".zip", ".rar")
IMG = (".jpg", ".jpeg", ".png", ".gif")
MAX_SIZE = 1_000_000_000


def clean(base):
    return " ".join(re.sub(r"[_]+", " ", base.replace(".ia", "")).split())


def ia_item(job):
    ident, app, tag, exts = job
    meta = json.loads(get(f"https://archive.org/metadata/{ident}") or "{}")
    m = meta.get("metadata", {})
    date = (m.get("date") or m.get("publicdate") or "")[:10]
    files = meta.get("files", [])
    q = lambda n: f"https://archive.org/download/{ident}/{urllib.parse.quote(n)}"
    images = {f["name"].rsplit(".", 1)[0].lower(): f["name"] for f in files
              if f["name"].lower().endswith(IMG) and not f["name"].lower().endswith("_thumb.jpg")}
    thumb = next((f["name"] for f in files if f["name"] == "__ia_thumb.jpg"), None)
    out = []
    for f in files:
        name = f["name"]
        if not name.lower().endswith(exts) or ".ia." in name or int(f.get("size") or 0) > MAX_SIZE:
            continue
        base = name.rsplit("/", 1)[-1].rsplit(".", 1)[0]
        img = images.get(name.rsplit(".", 1)[0].lower()) or thumb
        out.append(dict(
            app=app, id=f"ia-{ident}-{len(out) + 1}", title=clean(base), date=date,
            page=f"https://archive.org/details/{ident}", preview=q(img) if img else None,
            download=q(name), tags=[tag],
        ))
    return out


def github():
    tree = json.loads(get(f"https://api.github.com/repos/{GH}/git/trees/HEAD?recursive=1") or "{}").get("tree", [])
    paths = [t["path"] for t in tree if t["type"] == "blob"]
    images = {p.rsplit(".", 1)[0].lower(): p for p in paths if p.lower().endswith(IMG)}
    raw = lambda p: f"https://raw.githubusercontent.com/{GH}/HEAD/{urllib.parse.quote(p)}"
    out = []
    for p in sorted(paths):
        if not p.lower().endswith(GH_EXT):
            continue
        folder, _, fname = p.rpartition("/")
        img = images.get(p.rsplit(".", 1)[0].lower())
        out.append(dict(
            app="PSP", id=f"psp-gh-{len(out) + 1}", title=clean(fname.rsplit(".", 1)[0]), date="",
            page=f"https://github.com/{GH}/tree/HEAD/{urllib.parse.quote(folder)}" if folder else f"https://github.com/{GH}",
            preview=raw(img) if img else None, download=raw(p), tags=["Themes"],
        ))
    return out


def scrape():
    out = [e for r in pmap(lambda j: ia_item(j), ITEMS, workers=3) for e in r]
    return out + github()
