"""Messenger Plus! Live skins, rebuilt from Wayback captures of msgpluslive.net/skins/."""
import datetime, html, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

APP = "MSN / WLM"
SITE = "http://www.msgpluslive.net"
VIEW = re.compile(r"/skins/view/(\d+)-([^/?#]+)/?$")
LISTING = re.compile(r"/skins/(browse|by-date|by-downloads|by-rating|featured)(/|\?|$)")


def norm_date(s):
    s = " ".join(html.unescape(s or "").split())
    for fmt in ("%b %d, %Y", "%b %d, %Y %I:%M %p"):
        try:
            return datetime.datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return ""


def cards(text):
    """Skin cards on a listing page: {id: dict(slug, title, date, base)}."""
    out = {}
    for block in re.split(r"<script[^>]*>okclick\d+=true</script>", text)[1:]:
        m = re.search(r"location\.href='/skins/view/(\d+)-([^/']+)/'", block)
        t = re.search(r'<a href="/skins/view/\d+-[^"]+/"><b>([^<]+)</b></a>\s*([^<]*)', block)
        if not (m and t):
            continue
        thumb = re.search(r'src="/skins/uploads/([^"]+?)_thumb\.\w+"', block)
        added = re.search(r"Added:</i>\s*([^<]+?)\s*</td>", block)
        version = t.group(2).strip()
        fields = {k: " ".join(html.unescape(v).split()) for k, v in re.findall(r"<i>(Creator|Downloads|Rating|Compatibility):</i>\s*([^<]+)", block)}
        out[int(m.group(1))] = dict(
            slug=m.group(2), title=html.unescape(t.group(1)).strip() + (f" {version}" if version else ""),
            date=norm_date(added.group(1) if added else ""), base=thumb.group(1) if thumb else None,
            extra={k: v for k, v in fields.items() if v},
        )
    return out


def view_page(text):
    title = re.search(r"<title>([^<]*?)(?: - Live Messenger Skin)?</title>", text)
    date = re.search(r"(?:Added|Last Update):</td>\s*<td[^>]*>([^<]+)</td>", text)
    shot = re.search(r'/skins/uploads/([^"/]+?)(?:_thumb|_small)?\.(?:jpg|png|gif)"', text)
    cell = lambda label: re.search(rf"<td[^>]*>{label}:</td>\s*<td[^>]*>(.*?)</td>", text, re.S)
    plain = lambda h: " ".join(html.unescape(re.sub(r"<[^>]+>", " ", h)).split())
    extra = {}
    for label in ("Creator", "Downloads"):
        if (m := cell(label)) and plain(m.group(1)):
            extra[label] = plain(m.group(1))
    if (m := re.search(r"Messenger versions\s*<strong>([^<]+)</strong>", text)):
        extra["Compatibility"] = m.group(1).strip()
    desc = ""
    if (m := re.search(r'<td class="skindetails"[^>]*>(.*?)</td>', text, re.S)):
        paras = [p for p in re.findall(r"<p[^>]*>(.*?)</p>", m.group(1), re.S) if "<img" not in p]
        lines = lambda p: "\n".join(" ".join(html.unescape(re.sub(r"<[^>]+>", " ", l)).split()) for l in re.split(r"<br\s*/?>", p))
        desc = "\n\n".join(re.sub(r"\n{2,}", "\n\n", lines(p)).strip() for p in paras if plain(p))
    return dict(
        title=html.unescape(title.group(1)).strip() if title else "",
        date=norm_date(date.group(1)) if date else "",
        base=shot.group(1) if shot else None, extra=extra, description=desc,
    )


def scrape():
    rows = cdx("msgpluslive.net/skins/*", "&limit=200000")
    views, listings, uploads, seen_listing = {}, [], {}, set()
    for ts, orig in rows:
        u = urllib.parse.urlsplit(orig)
        p = u.path + ("?" + u.query if u.query else "")
        if (m := VIEW.search(u.path)):
            views.setdefault(int(m.group(1)), (ts, orig, m.group(2)))
        elif LISTING.search(p) and u.path not in seen_listing:
            seen_listing.add(u.path)
            listings.append((ts, orig))
        elif u.path.startswith("/skins/uploads/"):
            uploads[u.path[len("/skins/uploads/"):]] = ts

    skins = {}
    try:
        for ts, orig in listings:
            for sid, c in cards(capture(ts, orig) or "").items():
                skins.setdefault(sid, c)
        for sid, (ts, orig, slug) in sorted(views.items()):
            v = view_page(capture(ts, orig) or "")
            if sid not in skins:
                skins[sid] = dict(slug=slug, title=v["title"] or slug.replace("-", " "), date=v["date"], base=v["base"], extra={})
            skins[sid]["extra"] = {**v["extra"], **skins[sid]["extra"]}
            skins[sid]["description"] = v["description"]
    except Blocked as e:
        print("wayback stopped:", e, flush=True)

    out = []
    for sid, s in sorted(skins.items()):
        if sid == 0:
            continue
        base = s["base"] or s["slug"]
        shot = next((base + suf for suf in (".jpg", ".png", "_small.jpg", "_thumb.jpg") if base + suf in uploads), None)
        files = sorted(f for f in uploads if f.startswith(base) and f.lower().endswith((".plsk", ".zip")))
        out.append(dict(
            app=APP, id=f"wlm-{sid}", title=s["title"], date=s["date"], tags=["Skins"],
            page=f"{SITE}/skins/view/{sid}-{s['slug']}/",
            preview=f"{SITE}/skins/uploads/{shot}" if shot else None,
            download=f"{SITE}/skins/uploads/{files[-1]}" if files else f"{SITE}/skins/download/{sid}/",
            extra=s.get("extra") or {}, description=s.get("description", ""),
        ))
    return out


if __name__ == "__main__":
    import sys
    c = cards(open(sys.argv[1], encoding="utf-8", errors="replace").read())
    assert c[5]["title"] == "Ev0 4.0.3" and c[5]["base"] == "Ev0" and c[5]["date"] == "2009-05-19", c[5]
    assert c[5]["extra"]["Creator"] == 'Will "Willz" Ingles' and re.fullmatch(r"[\d,]+", c[5]["extra"]["Downloads"]), c[5]["extra"]
    if len(sys.argv) > 2:
        v = view_page(open(sys.argv[2], encoding="utf-8", errors="replace").read())
        assert v["extra"]["Creator"] == "Ethan Li (aka Nagamasa)" and v["extra"]["Compatibility"] == "8.5", v["extra"]
        assert v["description"].startswith("Presenting the history of Windows Vista") and "More Info" in v["description"], v["description"][:200]
    print(len(c), "cards ok:", sorted(c))
