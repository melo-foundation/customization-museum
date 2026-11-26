"""msnfans.net (Portuguese MSN fan site, 2004-2008): skin and emoticon-pack listings, rebuilt from Wayback captures.

msnfanatic.com is not scraped: its captures are news, tutorials and forum threads, no item listings.
"""
import html, re
from sources.wayback import Blocked, capture, cdx

APP = "MSN / WLM"
SITE = "http://msnfans.net"
GET = r"msnfans\.net/\?(?:p|func)=get&(?:amp;)?id=(\d+)"
LISTINGS = re.compile(r"^http://(?:www\.)?msnfans\.net(?::80)?/\?(p|func)=(skins|emoticons|emoticonsbase)$")


def clean(s):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", s or "")).split())


def items(text):
    """[(id, title, kind, preview path or None)] on one listing page; handles the 2005 and 2006 layouts."""
    out = {}
    # 2006 skins: optional image, ":: Title", ..., Download link
    for chunk in re.split(r"(?=<B><I>::)", text)[1:]:
        t = re.match(r"<B><I>::\s*(.*?)\s*(?:<span|<br>|</I>)", chunk, re.S)
        g = re.search(GET, chunk)
        img = re.findall(r"<img src=(?:\.\./)?(imagens/[^ >]+)", text[max(0, text.find(chunk) - 200):text.find(chunk)])
        if t and g:
            out.setdefault(int(g.group(1)), (clean(t.group(1)).rstrip("!").strip(), "Skins", img[-1] if img else None))
    # emoticon packs: thumbnail link then "PackN, Download" (2006) or bare thumbnail (2005)
    for m in re.finditer(GET + r"""["']?>\s*<img src=["']?(imagens/[^ "'>]+)[^>]*?(?:alt=["']([^"']*)["'])?[^>]*></a>(?:</[^>]+>)*(?:<br>\s*([^<,]+),)?""", text):
        title = clean(m.group(4)) or clean(m.group(3)) or "Emoticon Pack"
        out.setdefault(int(m.group(1)), (title, "Emoticons", m.group(2)))
    # 2005 skins: names in one cell, download links in the next
    names = re.search(r'<span class="style104">((?:[^<]+<br\s*/?>\s*)+[^<]*)</span>', text)
    ids = re.findall(r'func=get&id=(\d+)"', text)
    if names and "skin" in text.lower():
        ns = [clean(n) for n in re.split(r"<br\s*/?>", names.group(1)) if clean(n)]
        if len(ns) == len(ids):
            for i, n in zip(ids, ns):
                out.setdefault(int(i), (n, "Skins", None))
    return [(i, *v) for i, v in sorted(out.items())]


def scrape():
    pages = {}
    for ts, orig in cdx("msnfans.net/*", "&limit=100000"):
        m = LISTINGS.match(orig)
        if m:
            pages.setdefault(m.group(2), []).append((ts, orig))
    seen, out = {}, []
    try:
        for name, caps in sorted(pages.items()):
            for ts, orig in sorted(caps, reverse=True):
                for fid, title, k, prev in items(capture(ts, orig) or ""):
                    if fid not in seen:
                        seen[fid] = 1
                        out.append(dict(app=APP, id=f"msnfans-{fid}", title=("MsnFans " + title if k == "Emoticons" else title), date=f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}", tags=[k],
                                        page=re.sub(r":80/", "/", orig.replace("www.", "")), preview=f"{SITE}/{prev}" if prev else None,
                                        download=f"{SITE}/download.php?id={fid}"))
    except Blocked as e:
        print("wayback stopped:", e, flush=True)
    return out


if __name__ == "__main__":
    import sys
    rd = lambda p: open(p, encoding="utf-8", errors="replace").read()
    s06, e06, s05 = (items(rd(p)) for p in sys.argv[1:4])
    d = {i: (t, k, p) for i, t, k, p in s06}
    assert d[120] == ("Urban Skin", "Skins", "imagens/urbanmsn.gif"), d
    assert d[119][0] == "MSN Slate" and len(d) >= 5, d
    e = {i: (t, k, p) for i, t, k, p in e06}
    assert e[89][:2] == ("Pack 4", "Emoticons") and e[79][0] == "Pack 2" and len(e) >= 10, e
    assert [t for i, t, k, p in s05][:3] == ["Msn Cannabis", "Gant", "Neon"] and len(s05) == 7, s05
    print(s06, e06, s05, sep="\n")
