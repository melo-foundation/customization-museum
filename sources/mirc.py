# mircscripts.org is down (maintenance, 2026-11); themes come from the mIRC-Scripters MTS-Themes repo.
import json, re, urllib.parse
from lib import get, pmap

REPO = "mIRC-Scripters/MTS-Themes"
RAW = f"https://raw.githubusercontent.com/{REPO}/master/"
TREE = f"https://github.com/{REPO}/tree/master/"
APP = "mIRC"


def themes():
    tree = json.loads(get(f"https://api.github.com/repos/{REPO}/git/trees/master?recursive=1"))["tree"]
    files = [x["path"] for x in tree if x["type"] == "blob"]
    out = {}
    for p in files:
        parts = p.split("/")
        if p.lower().endswith(".mts") and parts[0].startswith("MTS") and len(parts) >= 3:
            out.setdefault("/".join(parts[:2]), p)
    return [(folder, mts, [p for p in files if p.startswith(folder + "/") and re.search(r"\.(png|jpe?g|gif)$", p, re.I)]) for folder, mts in out.items()]


def entry(t):
    folder, mts, imgs = t
    head = {}
    for line in (get(RAW + urllib.parse.quote(mts)) or "").splitlines()[:20]:
        m = re.match(r"﻿?\s*([A-Za-z]+)\s+(.+)", line)
        if m:
            head.setdefault(m.group(1).upper(), m.group(2).strip())
    title = head.get("NAME") or folder.split("/")[1]
    if head.get("VERSION"):
        title += " " + head["VERSION"]
    q = lambda p: urllib.parse.quote(p)
    return dict(
        app=APP, id="mirc-" + re.sub(r"[^a-z0-9]+", "-", folder.lower()).strip("-"), title=title, date="",
        page=TREE + q(folder), preview=RAW + q(imgs[0]) if imgs else None, download=RAW + q(mts),
        tags=["MTS Themes", folder.split("/")[0].replace("MTS1", "MTS 1.")],
    )


def scrape():
    return sorted(pmap(entry, themes(), workers=3), key=lambda e: e["title"].lower())
