import html, io, json, os, re, urllib.parse, urllib.request
from lib import ROOT, UA, get, pmap

APP = "Windows Media Player"
SITE = "https://sites.google.com/view/wmpgoodies/"
IA = "windowsmediaplayerskinscollection"


def text(s):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", s)).split())


def site_pages(section):
    found, queue = [SITE + section], [SITE + section]
    while queue:
        page = get(queue.pop(), cache=False) or ""
        for s in re.findall(rf'href="/view/wmpgoodies/{section}/([^"#?/]+)"', page):
            u = f"{SITE}{section}/{s}"
            if u not in found:
                found.append(u)
                queue.append(u)
    # some numbered pages aren't linked from anywhere
    for n in range(2, 30):
        u = f"{SITE}{section}/{section}-{n}"
        if u not in found:
            if get(u, cache=False) is None:
                break
            found.append(u)
    return found


def keep_image(img_url, item_id):
    """Google Sites image URLs expire within minutes: save the image as previews/<id>.png right away."""
    out = os.path.join(ROOT, "previews", f"{item_id}.png")
    if os.path.exists(out):
        return
    from PIL import Image
    try:
        data = urllib.request.urlopen(urllib.request.Request(img_url, headers={"User-Agent": UA}), timeout=60).read()
        im = Image.open(io.BytesIO(data))
        im = im.convert("RGBA") if im.mode in ("P", "LA", "RGBA") else im.convert("RGB")
        im.thumbnail((480, 480))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im.save(out, optimize=True)
    except Exception as e:
        print("preview not saved:", item_id, type(e).__name__, flush=True)


def parse_site_page(url, tag):
    t = re.sub(r"<style.*?</style>|<script.*?</script>", "", get(url, cache=False) or "", flags=re.S)
    # each item is a content image (=w1280) followed by "N. Title", "Created By: X", "Size: Y"
    pieces = re.split(r'<img[^>]+src="([^"]+=w1280)"[^>]*>', t)
    out = []
    for img, chunk in zip(pieces[1::2], pieces[2::2]):
        lines = html.unescape(re.sub(r"<(?:/p|br|/div|/h\d)[^>]*>", "\n", chunk)).split("\n")
        lines = [" ".join(re.sub(r"<[^>]+>", "", l).split()) for l in lines]
        lines = [l for l in lines if l]
        title = next((m.group(1) for l in lines[:3] if (m := re.match(r"^\d+\.\s*(.+)", l))), lines[0] if lines else "")
        if not title:
            continue
        by = next((l[11:].strip() for l in lines[:5] if l.startswith("Created By:")), "")
        link = re.search(r'href="(https?://(?:drive\.google\.com|www\.mediafire\.com)[^"]+)"', chunk)
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        keep_image(img, f"wmp-{tag.lower()}-{slug}")
        out.append(dict(
            app=APP, id=f"wmp-{tag.lower()}-{slug}", title=title, date="",
            page=url, preview=img, download=html.unescape(link.group(1)) if link else None,
            tags=[tag] + ([by] if by else []),
        ))
    return out


def archive_org():
    meta = json.loads(get(f"https://archive.org/metadata/{IA}") or "{}")
    date = (meta.get("metadata", {}).get("date") or "")[:10]
    files = meta.get("files", [])
    images = {f["name"].rsplit(".", 1)[0].lower(): f["name"] for f in files if f["name"].lower().endswith((".jpg", ".png", ".gif"))}
    out = []
    for f in files:
        name = f["name"]
        if not name.lower().endswith((".wmz", ".zip", ".exe", ".wms")):
            continue
        base = name.rsplit(".", 1)[0]
        q = urllib.parse.quote(name)
        img = images.get(base.lower())
        out.append(dict(
            app=APP, id=f"wmp-ia-{re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-')}",
            title=base.rsplit("/", 1)[-1], date=date,
            page=f"https://archive.org/details/{IA}/{q}", preview=f"https://archive.org/download/{IA}/{urllib.parse.quote(img)}" if img else None,
            download=f"https://archive.org/download/{IA}/{q}", tags=["Skins", "archive.org"],
        ))
    return out


def scrape():
    jobs = [(u, "Skins") for u in site_pages("skins")] + [(u, "Visualizations") for u in site_pages("visualizations")]
    items = [e for page in pmap(lambda j: parse_site_page(*j), jobs, workers=3) for e in page]
    items += archive_org()
    seen, out = set(), []
    for e in items:
        if e["id"] not in seen:
            seen.add(e["id"])
            out.append(e)
    return out
