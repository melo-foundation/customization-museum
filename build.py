import glob, json, os, re, shutil
from lib import load

state = load("archive_state.json")
DEAD = {"wlm"}  # sources scraped from Wayback captures: link Wayback's nearest snapshot until one is recorded

A = json.load(open("aliases.json", encoding="utf-8"))
TYPE_OF = {t.lower(): ty for ty, tags in A["types"].items() for t in tags}
ALIAS = {k.lower(): v for k, v in A["aliases"].items()}
DROP = {t.lower() for t in A["drop"]}
APP_TAGS = A.get("app_tags", {})
HIDDEN = set(json.load(open("hidden.json", encoding="utf-8")))


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
    keys = {("site", e["s"]) for e in entries} | {("app", slug(e["a"])) for e in entries} | {("type", slug(t)) for e in entries for t in e["y"]}
    for kind, key in keys:
        os.makedirs(f"{kind}/{key}", exist_ok=True)
        open(f"{kind}/{key}/index.html", "w", encoding="utf-8").write(page)
    os.makedirs("item", exist_ok=True)
    open("item/index.html", "w", encoding="utf-8").write(page.replace('<base href="../../">', '<base href="../">'))


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
        if HIDDEN & {e.get("page"), e.get("download")}:
            continue
        def ts(k):
            s = state.get(e.get(k) or "") or {}
            if s.get("ts"):
                return s["ts"] + ("|" + s["u"] if s.get("u") else "")
            return "2" if dead and e.get(k) else None
        y, g = classify(e["app"], e.get("tags") or [])
        if (e.get("date") or "")[:4] < "1990":
            e["date"] = ""  # epoch placeholders (1969/1970) from broken source dates
        o = OVERRIDES.get(e["id"], {})
        row = dict(
            i=e["id"], s=src, a=e["app"], t=o.get("title", e["title"]), d=o.get("date", e.get("date") or ""),
            y=split(o["type"]) if "type" in o else y, g=split(o["tags"]) if "tags" in o else g,
            p=e.get("page"), v=f"previews/{e['id']}.png" if e["id"] in PREVIEWS else e.get("preview"), l=e.get("download"),
            tp=ts("page"), tv=None if e["id"] in PREVIEWS else ts("preview"), tl=ts("download"),
        )
        if e.get("extra"):
            row["x"] = e["extra"]
        if e["id"] in OVERRIDES:
            row["m"] = 1
        out.append(row)

if __name__ == "__main__":
    assert classify("x", ["Smileys", "varios", "Customise", "anime"]) == (["Emoticons"], ["Misc", "Anime"])
    assert classify("Windows Desktop Themes", ["music"]) == (["Skins & Themes"], ["Windows 9x Classic", "Music"])
    assert classify("x", []) == (["Other"], [])
    assert front_matter("---\ntitle: A: B\ntags: x, y\n---\nbody") == ({"title": "A: B", "tags": "x, y"}, "body")
    json.dump(out, open("entries.json", "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False)
    write_section_pages(out)
    json.dump(sorted(os.path.basename(p)[:-3] for p in glob.glob("pages/site-*.md")), open("pages.json", "w"))
    print(len(out), "entries,", os.path.getsize("entries.json") // 1024, "KB")
