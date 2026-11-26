"""Serial, throttled, fail-fast access to web.archive.org (shared IP gets blocked easily)."""
import hashlib, json, os, time, urllib.error, urllib.parse, urllib.request
from lib import CACHE, UA

GAP = 2.0
_last = [0.0]
_fails = [0]


class Blocked(Exception):
    pass


def fetch(url, timeout=120):
    path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest())
    if os.path.exists(path):
        return open(path, encoding="utf-8").read()
    if _fails[0] >= 2:
        raise Blocked("stopped after repeated failures")
    wait = _last[0] + GAP - time.time()
    if wait > 0:
        time.sleep(wait)
    _last[0] = time.time()
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=timeout) as r:
            text = r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        if e.code in (404, 410):
            return None
        return _fail(url, f"http {e.code}")
    except Exception as e:
        return _fail(url, type(e).__name__)
    os.makedirs(CACHE, exist_ok=True)
    open(path, "w", encoding="utf-8").write(text)
    return text


def _fail(url, why):
    _fails[0] += 1
    print(f"wayback failure {_fails[0]}: {why} on {url}", flush=True)
    if _fails[0] >= 2:
        raise Blocked(why)
    time.sleep(600)
    return fetch(url)


def cdx(pattern, extra=""):
    """[(timestamp, original)] of 200 captures, one per url."""
    q = "https://web.archive.org/cdx/search/cdx?url=" + urllib.parse.quote(pattern, safe="/*:?&=") + "&filter=statuscode:200&collapse=urlkey&fl=timestamp,original&output=json" + extra
    rows = json.loads(fetch(q) or "[]")
    return [tuple(r) for r in rows[1:]]


def capture(ts, url):
    return fetch(f"https://web.archive.org/web/{ts}id_/{url}")
