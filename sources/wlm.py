import datetime, html, json, os, re
from sources.wayback import Blocked, capture, cdx

APP = "MSN / WLM"
VIEW = re.compile(r"https?://(?:www\.)?msgpluslive\.net(?::80)?/skins/view/(\d+)-([^/?]+)/$")
SEED = "/tmp/wlm_view.json"


def listing():
    rows = json.load(open(SEED))[1:] if os.path.exists(SEED) else cdx("msgpluslive.net/skins/view/*")
    best = {}
    for ts, orig in rows:
        m = VIEW.match(orig)
        if m:
            best.setdefault(int(m.group(1)), (ts, orig))
    return sorted(best.items())


def parse(sid, ts, orig, text):
    canon = f"http://www.msgpluslive.net/skins/view/{orig.rstrip('/').rsplit('/', 1)[-1]}/"
    title = re.search(r"<title>([^<]*?)(?: - Live Messenger Skin)?</title>", text)
    date = re.search(r"Last Update:</td>\s*<td[^>]*>([^<]+)</td>", text)
    try:
        d = datetime.datetime.strptime(html.unescape(date.group(1)).strip(), "%b %d, %Y %I:%M %p").strftime("%Y-%m-%d") if date else ""
    except ValueError:
        d = ""
    shot = re.search(r'href="(http://www\.msgpluslive\.net/skins/uploads/[^"]+)" rel="lightbox"', text)
    dl = re.search(r'href="(http://www\.msgpluslive\.net/skins/download/\d+/)"', text)
    creator = re.search(r"Creator:</td>\s*<td[^>]*>(?:<[^>]+>)*([^<]+)", text)
    tags = ["Skins"] + ([html.unescape(creator.group(1)).strip()] if creator and creator.group(1).strip() else [])
    return dict(
        app=APP, id=f"wlm-{sid}", title=html.unescape(title.group(1)).strip() if title else orig, date=d,
        page=canon, preview=shot.group(1) if shot else None, download=dl.group(1) if dl else None, tags=tags[:1],
    )


def scrape():
    out = []
    for sid, (ts, orig) in listing():
        if sid == 0:
            continue
        try:
            text = capture(ts, orig)
        except Blocked as e:
            print("stopped at skin", sid, e, flush=True)
            break
        if text and "<title>" in text:
            out.append(parse(sid, ts, orig, text))
    return out
