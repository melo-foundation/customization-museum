"""Winamp 3 / Winamp 5 modern skins (.wal) from archive.org."""
import json, urllib.parse
from lib import get, pmap

APP = "Winamp 3/5 (Modern Skins)"
TAGS = ["Skins", "Winamp 3/5 Modern"]
EXTS = (".wal", ".zip", ".wa3", ".wsz")
IMG = (".jpg", ".jpeg", ".png", ".gif")
SEARCH = ("https://archive.org/advancedsearch.php?q=collection:winampskinsmodern"
          "&fl[]=identifier&fl[]=title&fl[]=date&rows=2000&output=json")
BUNDLE = "winamp3-5skins"


def q(ident, name):
    return f"https://archive.org/download/{ident}/{urllib.parse.quote(name)}"


def title_of(t, ident):
    t = (t or ident).strip()
    return t.removeprefix("Winamp Skin:").strip() or ident


def item(job):
    ident, title = job
    meta = json.loads(get(f"https://archive.org/metadata/{ident}") or "{}")
    date = ((meta.get("metadata") or {}).get("date") or (meta.get("metadata") or {}).get("publicdate") or "")[:10]
    files = [f for f in meta.get("files", []) if f.get("source") == "original"]
    shot = next((f["name"] for f in files if f["name"].lower().endswith(IMG) and not f["name"].startswith("__ia")), None)
    page = f"https://archive.org/details/{ident}"
    prev = q(ident, shot) if shot else f"https://archive.org/services/img/{ident}"
    if ident == BUNDLE:
        return [dict(app=APP, id=f"wamodern-{ident}-{n+1}", title=f["name"].rsplit(".", 1)[0].replace("_", " "),
                     date=date, page=page, preview=prev, download=q(ident, f["name"]), tags=TAGS)
                for n, f in enumerate(f for f in files if f["name"].lower().endswith(".zip"))]
    wals = [f["name"] for f in files if f["name"].lower().endswith(EXTS)]
    if not wals:
        return []
    return [dict(app=APP, id=f"wamodern-{ident}", title=title_of(title, ident), date=date,
                 page=page, preview=prev, download=q(ident, wals[0]), tags=TAGS)]


def scrape():
    docs = json.loads(get(SEARCH))["response"]["docs"]
    jobs = [(d["identifier"], d.get("title")) for d in docs] + [(BUNDLE, "")]
    return [e for r in pmap(item, jobs) for e in r]
