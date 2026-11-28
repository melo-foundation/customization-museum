"""deviantART customization deviations via the official API (client-credentials OAuth2)."""
import json, os, re, time, urllib.error, urllib.parse, urllib.request
from lib import UA, ROOT

API = "https://www.deviantart.com/api/v1/oauth2"
# tag/query -> default app
TAGS = {
    "msstyles": "VS", "visualstyle": "VS", "visualstyles": "VS", "uxtheme": "VS", "windowsxptheme": "VS",
    "xptheme": "VS", "vistatheme": "VS", "windows7theme": "VS", "win7theme": "VS", "windowsvisualstyle": "VS",
    "winampskin": "Winamp", "winampmodern": "Winamp3", "wmpskin": "Windows Media Player",
    "msnskin": "MSN / WLM", "messengerplus": "MSN / WLM", "msgplus": "MSN / WLM", "wlmskin": "MSN / WLM",
    "trillianskin": "Trillian", "mirandaim": "Miranda NG", "mirandaskin": "Miranda NG", "sonique": "Sonique",
    "cursorxp": "CursorXP", "aimskin": "AIM", "icqskin": "ICQ", "yahoomessenger": "Yahoo! Messenger",
    "pidginskin": "Pidgin", "adiumicons": "Adium", "adiumxtra": "Adium", "operaskin": "Opera",
}
VS = "Windows Visual Styles (uxtheme)"
MAXPAGES = int(os.environ.get("DA_MAXPAGES", "60"))
_tok = {}


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


def classify(code, text):
    """Return app name or None, from a default code plus tags/title text."""
    t = text.lower()
    if code == "VS":
        if any(w in t for w in ("rainmeter", "bootskin", "wallpaper", "icon pack")) and "msstyles" not in t:
            return None
        return VS
    if code == "Winamp":
        return "Winamp 3/5 (Modern Skins)" if "modern" in t else "Winamp"
    if code == "Winamp3":
        return "Winamp 3/5 (Modern Skins)"
    return code


def scrape():
    token()
    found = {}
    for tag, code in TAGS.items():
        offset, pages = 0, 0
        while pages < MAXPAGES:
            j = api("/browse/tags", tag=tag, offset=offset, limit=50, mature_content="false")
            if "_error" in j:
                print(f"{tag}: error {j['_error']}", flush=True)
                break
            for d in j.get("results", []):
                if d.get("deviationid") and d.get("url") and not d.get("is_mature"):
                    found.setdefault(d["deviationid"], (code, tag, d))
            pages += 1
            if not j.get("has_more"):
                break
            offset = j.get("next_offset", offset + 50)
        print(f"{tag}: {len(found)} unique so far", flush=True)

    ids = list(found)
    tags = {}
    for i in range(0, len(ids), 50):
        j = api("/deviation/metadata", deviationids=ids[i:i + 50], ext_submission="false", ext_camera="false", ext_stats="false", ext_collection="false")
        for m in j.get("metadata", []):
            tags[m["deviationid"]] = [t["tag_name"] for t in m.get("tags", []) if t.get("tag_name")]
        if i % 500 == 0:
            print(f"metadata {i}/{len(ids)}", flush=True)

    out = []
    for did, (code, tag, d) in found.items():
        dt = tags.get(did, [])
        app = classify(code, " ".join([d.get("title", ""), tag] + dt))
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
            tags=sorted({"deviantART", "Skins"} | {t for t in dt[:15]}), extra=extra,
        ))
    from collections import Counter
    print("per app:", dict(Counter(o["app"] for o in out)), flush=True)
    return out
