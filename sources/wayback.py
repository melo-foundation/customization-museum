"""Throttled, disk-cached access to web.archive.org.

Locally (shared IP, blocked easily) it is fail-fast; on GitHub Actions it retries and skips bad URLs.
"""
import hashlib, json, os, threading, time, urllib.error, urllib.parse, urllib.request
from lib import CACHE, UA

CI = bool(os.environ.get("GITHUB_ACTIONS"))
GAP = 0.4 if CI else 2.0  # global gap between requests across all threads (~2.5 req/s)
BUDGET = float(os.environ.get("WAYBACK_BUDGET", 4.5 * 3600))  # seconds after import before crawl() stops fetching new pages
START = time.time()
RETRIES = (5, 30, 120) if CI else ()
MAX_STRAIGHT_FAILS = 25 if CI else 2
_last = [0.0]
_lock = threading.Lock()
_straight = [0]


class Blocked(Exception):
    pass


_KEYS = os.path.join(os.path.dirname(CACHE), ".archive-keys")
HEADERS = {"User-Agent": UA}
if os.path.exists(_KEYS):
    HEADERS["Authorization"] = "LOW " + open(_KEYS).read().strip()


def decode(data):
    """UTF-8 if valid, else Windows-1252 (most 2000s pages)."""
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("cp1252", "replace")


def _get(url, timeout):
    with _lock:
        slot = max(time.time(), _last[0] + GAP)
        _last[0] = slot
    wait = slot - time.time()
    if wait > 0:
        time.sleep(wait)
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=timeout) as r:
        return decode(r.read())


def fetch(url, timeout=120):
    path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest())
    if os.path.exists(path):
        return open(path, encoding="utf-8").read()
    if _straight[0] >= MAX_STRAIGHT_FAILS:
        raise Blocked(f"{_straight[0]} failures in a row")
    for delay in (*RETRIES, None):
        try:
            text = _get(url, timeout)
            break
        except urllib.error.HTTPError as e:
            if e.code in (404, 410):
                return None
            why = f"http {e.code}"
        except Exception as e:
            why = f"{type(e).__name__} {getattr(e, 'reason', e)}"
        if delay is None:
            _straight[0] += 1
            print(f"wayback failure ({_straight[0]} in a row): {why} on {url}", flush=True)
            if _straight[0] >= MAX_STRAIGHT_FAILS:
                raise Blocked(why)
            return None
        time.sleep(delay)
    _straight[0] = 0
    os.makedirs(CACHE, exist_ok=True)
    open(path, "w", encoding="utf-8").write(text)
    return text


assert decode("café".encode("cp1252")) == "café" and decode("café".encode()) == "café"


def cdx(pattern, extra=""):
    """[(timestamp, original)] of 200 captures, one per url."""
    q = "https://web.archive.org/cdx/search/cdx?url=" + urllib.parse.quote(pattern, safe="/*:?&=") + "&filter=statuscode:200&collapse=urlkey&fl=timestamp,original&output=json" + extra
    rows = json.loads(fetch(q, timeout=600) or "[]")
    return [tuple(r) for r in rows[1:]]


def capture(ts, url):
    return fetch(f"https://web.archive.org/web/{ts}id_/{url}")


def crawl(label, items, fn, workers=4):
    """[(item, fn(item))] for as many items as the time budget allows; fn may raise Blocked. Progress every 100."""
    from concurrent.futures import ThreadPoolExecutor
    items = list(items)
    print(f"{label}: {len(items)} pages to fetch", flush=True)
    done, res, stop = [0], [], threading.Event()

    def one(it):
        if stop.is_set():
            return
        if time.time() - START > BUDGET:
            if not stop.is_set():
                print(f"{label}: time budget reached, stopping", flush=True)
            stop.set()
            return
        try:
            r = fn(it)
        except Blocked as e:
            print(f"{label}: wayback stopped:", e, flush=True)
            stop.set()
            return
        with _lock:
            res.append((it, r))
            done[0] += 1
            if done[0] % 100 == 0:
                print(f"{label}: {done[0]}/{len(items)} pages, {sum(1 for _, x in res if x)} usable", flush=True)

    with ThreadPoolExecutor(workers) as ex:
        list(ex.map(one, items))
    print(f"{label}: finished {done[0]}/{len(items)}", flush=True)
    return res
