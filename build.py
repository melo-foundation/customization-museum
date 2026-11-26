import glob, json, os, re, shutil
from lib import load

state = load("archive_state.json")
DEAD = {"wlm"}  # sources scraped from Wayback captures: link Wayback's nearest snapshot until one is recorded

A = json.load(open("aliases.json", encoding="utf-8"))
TYPE_OF = {t.lower(): ty for ty, tags in A["types"].items() for t in tags}
ALIAS = {k.lower(): v for k, v in A["aliases"].items()}
DROP = {t.lower() for t in A["drop"]}
APP_TAGS = A.get("app_tags", {})


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


def write_section_pages(entries):
    """site/<src>/, app/<slug>/, type/<slug>/: copies of index.html one level down so each section has a real URL."""
    page = open("index.html", encoding="utf-8").read().replace("<head>", '<head>\n<base href="../../">', 1)
    for kind in ("site", "app", "type"):
        shutil.rmtree(kind, ignore_errors=True)
    keys = {("site", e["s"]) for e in entries} | {("app", slug(e["a"])) for e in entries} | {("type", slug(t)) for e in entries for t in e["y"]}
    for kind, key in keys:
        os.makedirs(f"{kind}/{key}", exist_ok=True)
        open(f"{kind}/{key}/index.html", "w", encoding="utf-8").write(page)


out = []
for f in sorted(glob.glob("data/*.json")):
    if f.endswith("archive_state.json"):
        continue
    src = os.path.basename(f)[:-5]
    dead = src in DEAD
    for e in json.load(open(f, encoding="utf-8")):
        def ts(k):
            s = state.get(e.get(k) or "") or {}
            if s.get("ts"):
                return s["ts"] + ("|" + s["u"] if s.get("u") else "")
            return "2" if dead and e.get(k) else None
        y, g = classify(e["app"], e.get("tags") or [])
        out.append(dict(
            s=src, a=e["app"], t=e["title"], d=e.get("date") or "", y=y, g=g,
            p=e.get("page"), v=e.get("preview"), l=e.get("download"),
            tp=ts("page"), tv=ts("preview"), tl=ts("download"),
        ))

if __name__ == "__main__":
    assert classify("x", ["Smileys", "varios", "Customise", "anime"]) == (["Emoticons"], ["Misc", "Anime"])
    assert classify("Windows Desktop Themes", ["music"]) == (["Skins & Themes"], ["Windows 9x Classic", "Music"])
    assert classify("x", []) == (["Other"], [])
    json.dump(out, open("entries.json", "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False)
    pages = sorted(os.path.basename(p)[:-3] for p in glob.glob("pages/*.md"))
    write_section_pages(out)
    json.dump(pages, open("pages.json", "w", encoding="utf-8"))
    print(len(out), "entries,", os.path.getsize("entries.json") // 1024, "KB")
