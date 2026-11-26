"""MSN skins section of messentools.com, rebuilt from Wayback captures of the skin detail pages."""
import html, re, urllib.parse
from sources.wayback import Blocked, capture, cdx

APP = "MSN / WLM"
SITE = "http://www.messentools.com"
LANGS = ("en", "es", "de", "fr")
DETAIL = re.compile(r"^/(en|es|de|fr)/msn-skin-details/id/(\d+)/?$")


def parse(text):
    title = re.search(r'<div class="msndl2">([^<]+)</div>', text)
    img = re.search(r'<img[^>]+class="imgemo"[^>]+src="show_image\.php\?filename=([^&"]+)', text)
    dl = re.search(r'href="(includes/dl\.php\?[^"]+)"', text)
    cat = re.search(r'<b>[^<]*:\s*</b>\s*<span[^>]*>[^<]*<a href="[^"]*msn-skins/\d+/"[^>]*><span class="msndl9">([^<]+)', text)
    return dict(
        title=html.unescape(title.group(1)).strip() if title else "",
        preview=f"{SITE}/{img.group(1)}" if img else None,
        download=f"{SITE}/{html.unescape(dl.group(1))}" if dl else None,
        cat=html.unescape(cat.group(1)).strip() if cat else None,
    )


def scrape():
    best = {}
    for lang in LANGS:
        for ts, orig in cdx(f"messentools.com/{lang}/msn-skin-details/*", "&limit=5000"):
            m = DETAIL.match(urllib.parse.urlsplit(orig).path)
            if m and int(m.group(2)) > 0:
                best.setdefault(int(m.group(2)), (ts, orig, lang))
    out = []
    try:
        for sid, (ts, orig, lang) in sorted(best.items()):
            p = parse(capture(ts, orig) or "")
            if not p["title"]:
                continue
            out.append(dict(
                app=APP, id=f"messentools-skin-{sid}", title=p["title"], date="",
                page=f"{SITE}/{lang}/msn-skin-details/id/{sid}/",
                preview=p["preview"], download=p["download"], tags=["Skins"],
            ))
    except Blocked as e:
        print("wayback stopped:", e, flush=True)
    return out


if __name__ == "__main__":
    import sys
    p = parse(open(sys.argv[1], encoding="utf-8", errors="replace").read())
    assert p["title"] == "Design live messenger 1.0 Skin", p
    assert p["preview"] == SITE + "/images/msnskins/design-live-messenger-msn-skin.jpg", p
    assert p["download"] == SITE + "/includes/dl.php?t=msnskins&id=10&f=Design-live-messenger-1.0.plsk&a=i", p
    assert DETAIL.match("/en/msn-skin-details/id/10/")
    print("ok", p)
