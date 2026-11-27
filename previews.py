"""Extract a preview image from inside zip-based skin files.

  python3 previews.py SOURCE [SOURCE...]   -> previews/<id>.png for entries without a real preview

build.py uses previews/<id>.png when it exists.
"""
import io, json, os, re, sys, urllib.request, zipfile
from PIL import Image
from lib import UA

ZIPLIKE = (".qsk", ".qsf", ".wal", ".wba", ".zip", ".plsk", ".sqinterface", ".rmskin", ".lsz", ".nth", ".themepack")
GENERIC = re.compile(r"__ia_thumb|/services/img/")
PREFER = [r"thumbnail", r"preview", r"screenshot", r"screen", r"body", r"main", r"player"]
IMG = (".bmp", ".png", ".jpg", ".jpeg", ".gif")


def pick(names):
    imgs = [n for n in names if n.lower().endswith(IMG)]
    for p in PREFER:
        hit = [n for n in imgs if re.search(p, os.path.basename(n), re.I)]
        if hit:
            return hit[0]
    return None


def best_image(data):
    """Preferred named image, else the largest image (by pixels) in the zip, recursing into nested skins."""
    z = zipfile.ZipFile(io.BytesIO(data))
    names = z.namelist()
    chosen = pick(names)
    if chosen:
        return Image.open(io.BytesIO(z.read(chosen)))
    best = None
    for n in names:
        if n.lower().endswith(IMG):
            try:
                im = Image.open(io.BytesIO(z.read(n)))
            except Exception:
                continue
            if not best or im.size[0] * im.size[1] > best.size[0] * best.size[1]:
                best = im
        elif n.lower().endswith(ZIPLIKE) and not best:
            try:
                best = best_image(z.read(n))
            except Exception:
                pass
    return best


def needs(e):
    return (not e.get("preview") or GENERIC.search(e["preview"])) and (e.get("download") or "").lower().split("?")[0].endswith(ZIPLIKE)


def make(e, out):
    req = urllib.request.Request(e["download"], headers={"User-Agent": UA})
    data = urllib.request.urlopen(req, timeout=120).read()
    im = best_image(data)
    if not im:
        return False
    im = im.convert("RGBA") if im.mode in ("P", "LA") else im.convert("RGB")
    im.thumbnail((480, 480))
    im.save(out, optimize=True)
    return True


if __name__ == "__main__":
    os.makedirs("previews", exist_ok=True)
    for src in sys.argv[1:]:
        done = fail = 0
        for e in json.load(open(f"data/{src}.json", encoding="utf-8")):
            out = f"previews/{e['id']}.png"
            if os.path.exists(out) or not needs(e):
                continue
            try:
                ok = make(e, out)
            except Exception as ex:
                ok = False
                print("fail", e["id"], type(ex).__name__, flush=True)
            done += ok
            fail += not ok
        print(src, done, "previews made,", fail, "without an image", flush=True)
