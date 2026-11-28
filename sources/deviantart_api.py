"""deviantART customization deviations via the official API (client-credentials OAuth2)."""
import json, os, re, time, urllib.error, urllib.parse, urllib.request
from lib import UA, ROOT

API = "https://www.deviantart.com/api/v1/oauth2"
TAGS = """msstyles visualstyle visualstyles visual_style visual_styles xpvisualstyle vistavisualstyle windowsvisualstyle
uxtheme windowsxptheme xptheme vistatheme windows7theme win7theme windows10theme windows11theme styleXP
windowsxp windowsvista windows7 windows10 windows11 winxp theme windowstheme
winampskin winamp winamp3 winamp5 winampmodern wasabi wmpskin wmp11skin wmp11 wmpskins
msnskin messengerplus msgplus msgpluslive wlmskin wlm messenger msn msnmessenger livemessenger
trillianskin trillian mirandaim mirandaskin miranda sonique cursorxp iconpackager objectdock rocketdock
aimskin icqskin yahoomessenger pidginskin adiumicons adiumxtra operaskin""".split()
QUERIES = ["visual style", "msstyles", "windows xp theme", "vista visual style", "windows 7 visual style",
           "windows 10 theme msstyles", "messenger plus skin", "msn skin", "wmp skin", "winamp3 skin",
           "winamp 5 modern skin", "trillian skin", "miranda skin", "sonique skin", "windows live messenger skin"]
VS = "Windows Visual Styles"
RULES = [  # (app, regex over lowercase title + tags + matched tag/query)
    (VS, r"msstyles|visual[ _-]?styles?|uxtheme|(xp|vista|win(dows)?[ _]?(7|8|10|11)|windows)[ _-]?(theme|style)|(theme|style)[ _-]?(for )?(windows|win)[ _]?(xp|vista|7|8|10|11)"),
    ("Winamp 3/5 (Modern Skins)", r"winamp ?3|winamp ?5 ?modern|winamp ?modern|modern skin|wasabi"),
    ("Windows Media Player", r"wmp ?(11|10|12)? ?skins?|windows media player ?(skin|theme)|wmpskin"),
    ("MSN / WLM", r"messenger ?plus|msg ?plus|msn ?(skin|theme|messenger)|wlm ?(skin|theme)|(live|msn) messenger ?(skin|theme)|messenger skin"),
    ("Trillian", r"trillian"), ("Miranda NG", r"miranda ?(im|ng)?[ _]?(skin|theme|icons?)?"),
    ("Sonique", r"sonique"), ("CursorXP", r"cursorxp"), ("Yahoo! Messenger", r"yahoo ?messenger"),
    ("Pidgin", r"pidgin"), ("Adium", r"adium"), ("Opera", r"opera ?(skin|theme)"),
]
BAD = re.compile(r"rainmeter|bootskin|wallpaper|\bicon ?pack|cursors? set|\bsuite\b|stardock|windowblinds|\bwb\b|winamp ?(classic|2)")
MAXPAGES = int(os.environ.get("DA_MAXPAGES", "100"))
_tok = {}
T0 = time.time()
BUDGET = int(os.environ.get('DA_BUDGET', '10000'))


def _req(url, data=None, retries=6, auth=None):
    for attempt in range(retries):
        try:
            r = urllib.request.Request(url, data=data, headers={"User-Agent": UA, **({"Authorization": "Bearer " + auth} if auth else {})})
            with urllib.request.urlopen(r, timeout=60) as resp:
                time.sleep(1)
                return json.load(resp)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504):
                wait = min(120, 5 * 2 ** attempt)
                print(f"  http {e.code}, backing off {wait}s", flush=True)
                time.sleep(wait)
                continue
            if e.code == 401 and data is None:
                print("  401:", e.read()[:300].decode("utf-8", "replace"), flush=True)
                return {"_error": 401}
            print(f"  http {e.code}", flush=True)
            return {"_error": e.code}
        except Exception as e:
            print(f"  request error {type(e).__name__}: {str(e)[:80].replace(chr(10),' ')}", flush=True)
            time.sleep(3)
    return {"_error": "failed"}


def token():
    cid, sec = os.environ.get("DA_CLIENT_ID", ""), os.environ.get("DA_CLIENT_SECRET", "")
    if not (cid and sec):
        p = os.path.join(ROOT, ".deviantart-keys")
        if os.path.exists(p):
            cid, sec = open(p).read().split()[:2]
    if not (cid and sec):
        raise SystemExit("deviantart_api: DA_CLIENT_ID / DA_CLIENT_SECRET not set")
    body = urllib.parse.urlencode(dict(grant_type="client_credentials", client_id=cid, client_secret=sec)).encode()
    j = _req("https://www.deviantart.com/oauth2/token", body)
    if "access_token" not in j:
        raise SystemExit(f"deviantart_api: token request failed ({j.get('_error') or j.get('error')})")
    _tok["t"] = j["access_token"]


def api(path, **params):
    if "t" not in _tok:
        token()
    q = urllib.parse.urlencode(params, doseq=True)
    return _req(f"{API}{path}?{q}", auth=_tok["t"])


BLOCK = re.compile(r"activat|loader|\bkms|crack|keygen|serial|\bpatch|wallpaper|screenshot|my desktop|desktop shot|fan ?art|anime|manga|pin ?-?up|rainmeter|bootskin|icon ?pack|\bwb\b|windowblinds|photoshop|brush|\bstock\b|render")
VSX = re.compile(r"msstyles|visual ?_?styles?|uxtheme")
SKINW = r"skins?|themes?|style|icons?"
APPS = [  # (app, regex that must match the title)
    ("Winamp 3/5 (Modern Skins)", r"(winamp ?3|winamp ?5 modern|winamp modern|wasabi|\.wal\b)"),
    ("Windows Media Player", r"(wmp ?(9|10|11|12)? ?skins?|wmpskin|windows media player (skins?|themes?))"),
    ("MSN / WLM", r"(messenger ?plus|msg ?plus|msgplus|msn (skin|theme)|wlm (skin|theme)|(live|msn) messenger (skin|theme))"),
    ("Trillian", r"trillian"), ("Miranda NG", r"miranda"), ("Sonique", r"sonique"),
    ("Yahoo! Messenger", r"yahoo ?messenger"), ("Pidgin", r"pidgin"), ("Adium", r"adium"),
    ("Opera", r"opera (skin|theme)"), ("CursorXP", r"cursorxp"),
]


def classify(title, taglist, downloadable):
    """Strict: needs a downloadable file and the program/format named in the title (VS: title or tags)."""
    if not downloadable:
        return None
    t = title.lower()
    tg = " ".join(taglist).lower()
    if BLOCK.search(t) or BLOCK.search(tg):
        return None
    if VSX.search(t) or (VSX.search(tg) and re.search(r"theme|style|skin|xp|vista|windows|win ?(7|8|10|11)|\bw(7|8|10|11)\b", t)):
        return VS
    for app, rx in APPS:
        if re.search(rx, t) and (re.search(SKINW, t) or app in ("Winamp 3/5 (Modern Skins)", "Windows Media Player", "MSN / WLM", "CursorXP")):
            return app
    return None


def paged(path, label, maxpages=None, **p):
    offset, n = 0, 0
    maxpages = maxpages or MAXPAGES
    limit = p.pop("limit", 24)
    while n < maxpages:
        j = api(path, offset=offset, limit=limit, mature_content="false", **p)
        if "_error" in j:
            print(f"{label}: error {j['_error']}", flush=True)
            return
        for d in j.get("results", []):
            if d.get("deviationid") and d.get("url") and not d.get("is_mature"):
                yield d
        n += 1
        if not j.get("has_more"):
            return
        offset = j.get("next_offset", offset + limit)


def scrape():
    token()
    found = {}  # id -> (hint, d)

    def add(d, hint):
        found.setdefault(d["deviationid"], (hint, d))

    for tag in TAGS:
        for d in paged("/browse/tags", tag, tag=tag, limit=50):
            add(d, tag)
        print(f"tag {tag}: {len(found)} candidates", flush=True)
    for q in QUERIES:
        for ep in ("newest", "popular"):
            for d in paged(f"/browse/{ep}", q, q=q, limit=50):
                add(d, q)
        print(f"query {q!r}: {len(found)} candidates", flush=True)

    tags = {}

    def fetch_tags(ids):
        ids = [i for i in ids if i not in tags]
        for i in range(0, len(ids), 50):
            j = api("/deviation/metadata", deviationids=ids[i:i + 50], ext_submission="false", ext_camera="false", ext_stats="false", ext_collection="false")
            for m in j.get("metadata", []):
                tags[m["deviationid"]] = [t["tag_name"] for t in m.get("tags", []) if t.get("tag_name")]
            if (i // 50) % 20 == 0:
                print(f"  metadata {i}/{len(ids)}", flush=True)

    def cls(did):
        d = found[did][1]
        return classify(d.get("title", ""), tags.get(did, []), d.get("is_downloadable"))

    fetch_tags([i for i, (h, d) in found.items() if d.get("is_downloadable")])
    # author expansion
    done = set()
    for rnd in range(2):
        authors = {}
        for did, (h, d) in found.items():
            if cls(did):
                u = (d.get("author") or {}).get("username")
                if u and u not in done:
                    authors[u] = authors.get(u, 0) + 1
        print(f"author round {rnd}: {len(authors)} authors", flush=True)
        for k, u in enumerate(sorted(authors, key=lambda a: -authors[a])):
            if time.time() - T0 > BUDGET:
                print('author budget reached', flush=True)
                break
            done.add(u)
            new = []
            for d in paged("/gallery/all", u, maxpages=12, username=u, limit=24):
                if d["deviationid"] not in found:
                    add(d, "")
                    new.append(d["deviationid"])
            fetch_tags([i for i in new if found[i][1].get('is_downloadable')])
            if k % 20 == 0:
                print(f"  author {k}/{len(authors)} {u}: {len(found)} candidates", flush=True)
        break

    out = []
    for did, (hint, d) in found.items():
        dt = tags.get(did, [])
        app = cls(did)
        if not app:
            continue
        ts = d.get("published_time")
        date = time.strftime("%Y-%m-%d", time.gmtime(int(ts))) if ts and str(ts).isdigit() else ""
        thumbs = d.get("thumbs") or []
        mid = sorted(thumbs, key=lambda x: abs(x.get("width", 0) - 300))
        prev = (mid[0]["src"] if mid else None) or (d.get("preview") or {}).get("src")
        extra = {"Author": (d.get("author") or {}).get("username", "")}
        fav = (d.get("stats") or {}).get("favourites")
        if fav is not None:
            extra["Favourites"] = str(fav)
        extra = {k: v for k, v in extra.items() if v}
        out.append(dict(
            app=app, id=f"da-{did}", title=d.get("title") or "Untitled", date=date, page=d["url"],
            preview=prev, download=None,
            tags=sorted({"deviantART", "Skins"} | set(dt[:15])), extra=extra,
        ))
    from collections import Counter
    import random
    for o in random.sample(out, min(40, len(out))):
        print("SAMPLE", o["app"], "|", o["title"][:60], "|", o["page"], flush=True)
    print("per app:", dict(Counter(o["app"] for o in out)), flush=True)
    return out
