import glob, html, json, os, re, shutil, urllib.parse
from lib import load

state = load("archive_state.json")
DEAD = {"wlm"}  # sources scraped from Wayback captures: link Wayback's nearest snapshot until one is recorded

A = json.load(open("aliases.json", encoding="utf-8"))
TYPE_OF = {t.lower(): ty for ty, tags in A["types"].items() for t in tags}
ALIAS = {k.lower(): v for k, v in A["aliases"].items()}
DROP = {t.lower() for t in A["drop"]}
APP_TAGS = A.get("app_tags", {})
HIDDEN = set(json.load(open("hidden.json", encoding="utf-8")))
# titles that are a site's own page/system name, picked up when a capture redirected to it
JUNK_TITLES = {"pafiledb", "home", "index", "404", "not found", "error", "page not found"}


def junk(title):
    return title.strip().lower() in JUNK_TITLES


def archived(page_ts, download_ts, download):
    """True when a copy of the item survives: a real Wayback snapshot of its page or file,
    a Wayback-derived source (placeholder ts "2"), or a file hosted on archive.org."""
    real = lambda t: bool(t) and t[:14].isdigit() and len(t) >= 14
    return real(page_ts) or real(download_ts) or page_ts == "2" or download_ts == "2" or bool(
        re.match(r"https?://([\w-]+\.)?archive\.org/", download or ""))


def classify(app, tags):
    """(types, subject tags) for one entry's raw tags."""
    types, subjects = [], []
    for raw in tags:
        k = raw.strip().lower()
        if not k or k in DROP:
            continue
        if k in TYPE_OF:
            types.append(TYPE_OF[k])
            continue
        tag = ALIAS.get(k) or (raw.strip()[:1].upper() + raw.strip()[1:])
        if tag.lower() in TYPE_OF:
            types.append(TYPE_OF[tag.lower()])
        else:
            subjects.append(tag)
    types = list(dict.fromkeys(types)) or [A["default_type"].get(app, "Other")]
    return types, list(dict.fromkeys(APP_TAGS.get(app, []) + subjects))


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def front_matter(text):
    """({key: value}, body) from a '---' header of 'key: value' lines."""
    if not text.startswith("---"):
        return {}, text
    head, _, body = text[3:].partition("\n---")
    meta = {}
    for line in head.strip().splitlines():
        k, sep, v = line.partition(":")
        if sep and v.strip():
            meta[k.strip().lower()] = v.strip()
    return meta, body.lstrip("\n")


def item_overrides():
    """items/<id>.md: community edits. Front matter overrides title/date/type/tags."""
    out = {}
    for p in glob.glob("items/*.md"):
        meta, _ = front_matter(open(p, encoding="utf-8").read())
        out[os.path.basename(p)[:-3]] = meta
    return out


def write_section_pages(entries):
    """site/<src>/, app/<slug>/, type/<slug>/: copies of index.html one level down so each section has a real URL."""
    page = open("index.html", encoding="utf-8").read().replace("<head>", '<head>\n<base href="../../">', 1)
    for kind in ("site", "app", "type"):
        shutil.rmtree(kind, ignore_errors=True)
    keys = {("site", e["s"]) for e in entries} | {("app", e["k"]) for e in entries} | {("type", slug(t)) for e in entries for t in e["y"]}
    for kind, key in keys:
        os.makedirs(f"{kind}/{key}", exist_ok=True)
        open(f"{kind}/{key}/index.html", "w", encoding="utf-8").write(page)
    os.makedirs("item", exist_ok=True)
    open("item/index.html", "w", encoding="utf-8").write(page.replace('<base href="../../">', '<base href="../">'))


def host(e):
    try:
        return urllib.parse.urlsplit(e.get("p") or e.get("l") or "").hostname.removeprefix("www.")
    except AttributeError:
        return e["s"]


def write_index(rows):
    """idx/manifest.json (counts for the directory), idx/app/<slug>.json (full rows),
    idx/index.json (compact rows for filtering and search across programs)."""
    shutil.rmtree("idx", ignore_errors=True)
    os.makedirs("idx/app")
    apps, sites, types = {}, {}, {}
    for r in rows:
        a = apps.setdefault(r["k"], {"slug": r["k"], "name": r["a"], "count": 0, "types": {}})
        a["count"] += 1
        for t in r["y"]:
            a["types"][t] = a["types"].get(t, 0) + 1
            types[t] = types.get(t, 0) + 1
        s = sites.setdefault(r["s"], {"name": host(r), "count": 0, "apps": set()})
        s["count"] += 1
        s["apps"].add(r["k"])
    for slug_, a in apps.items():
        dump(f"idx/app/{slug_}.json", [r for r in rows if r["k"] == slug_])
    for s in sites.values():
        s["apps"] = sorted(s["apps"])
    dump("idx/manifest.json", {
        "total": len(rows), "archived": sum(1 for r in rows if r.get("z")),
        "apps": sorted(apps.values(), key=lambda a: -a["count"]),
        "types": dict(sorted(types.items(), key=lambda kv: -kv[1])), "sites": sites,
        "pages": sorted(os.path.basename(p)[:-3] for p in glob.glob("pages/site-*.md")),
    })
    dump("idx/index.json", [[r["i"], r["t"], r["k"], r["s"], r["d"], r["y"], r["g"], r.get("z", 0)] for r in rows])


def dump(path, obj):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, separators=(",", ":"), ensure_ascii=False)


OVERRIDES = item_overrides()
PREVIEWS = {os.path.basename(p)[:-4] for p in glob.glob("previews/*.png")}
split = lambda v: [x.strip() for x in v.split(",") if x.strip()]
out = []
for f in sorted(glob.glob("data/*.json")):
    if f.endswith("archive_state.json"):
        continue
    src = os.path.basename(f)[:-5]
    dead = src in DEAD
    for e in json.load(open(f, encoding="utf-8")):
        if HIDDEN & {e.get("page"), e.get("download")} or junk(e["title"]):
            continue
        def ts(k):
            s = state.get(e.get(k) or "") or {}
            if s.get("ts"):
                return s["ts"] + ("|" + s["u"] if s.get("u") else "")
            return "2" if dead and e.get(k) else None
        # some scrapers keep HTML entities ("&amp;"); themes escape on output, so store plain text
        e["title"] = html.unescape(e["title"])
        if e.get("extra"):
            e["extra"] = {html.unescape(k): html.unescape(str(v)) for k, v in e["extra"].items()}
        y, g = classify(e["app"], e.get("tags") or [])
        if (e.get("date") or "")[:4] < "1990":
            e["date"] = ""  # epoch placeholders (1969/1970) from broken source dates
        o = OVERRIDES.get(e["id"], {})
        row = dict(
            i=e["id"], s=src, a=e["app"], k=slug(e["app"]), t=o.get("title", e["title"]), d=o.get("date", e.get("date") or ""),
            y=split(o["type"]) if "type" in o else y, g=split(o["tags"]) if "tags" in o else g,
            p=e.get("page"), v=f"previews/{e['id']}.png" if e["id"] in PREVIEWS else e.get("preview"), l=e.get("download"),
            tp=ts("page"), tv=None if e["id"] in PREVIEWS else ts("preview"), tl=ts("download"),
        )
        if archived(row["tp"], row["tl"], row["l"]):
            row["z"] = 1
        if e.get("description"):
            row["n"] = e["description"]
        if e.get("extra"):
            row["x"] = e["extra"]
        if e["id"] in OVERRIDES:
            row["m"] = 1
        out.append(row)

if __name__ == "__main__":
    assert classify("x", ["Smileys", "varios", "Customise", "anime"]) == (["Emoticons"], ["Misc", "Anime"])
    assert classify("Windows Desktop Themes", ["music"]) == (["Skins & Themes"], ["Windows 9x Classic", "Music"])
    assert classify("x", []) == (["Other"], [])
    assert junk("paFileDB") and junk(" Home ") and not junk("Home Sweet Home") and not junk(":)")
    assert archived("20090101000000", None, None) and archived(None, "20100101000000|http://x/y.zip", "http://x/y.zip")
    assert archived("2", None, None) and archived(None, None, "https://archive.org/download/item/f.wal")
    assert not archived(None, None, "http://example.com/f.zip") and not archived("", "", None)
    assert not archived(None, None, "http://notarchive.org/f.zip") and not archived("2009", None, None)
    assert front_matter("---\ntitle: A: B\ntags: x, y\n---\nbody") == ({"title": "A: B", "tags": "x, y"}, "body")
    write_index(out)
    themes = []
    for p in sorted(glob.glob("themes/*/theme.js")):
        m = re.match(r"// label: (.+)", open(p, encoding="utf-8").readline())
        name = p.split("/")[1]
        themes.append([name, m.group(1).strip() if m else name, os.path.exists(f"themes/{name}/modern.css")])
    dump("themes/index.json", sorted(themes, key=lambda t: t[0] != "default"))
    write_section_pages(out)
    print(len(out), "entries,", sum(os.path.getsize(p) for p in glob.glob("idx/**/*.json", recursive=True)) // 1024, "KB in idx/")
