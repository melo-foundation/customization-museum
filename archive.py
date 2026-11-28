"""Resumable Wayback Machine archiver.

  python3 archive.py check          # record existing snapshots (availability API)
  python3 archive.py save [N] [W] [S]  # Save Page Now for what is still missing: at most N urls, W parallel, only urls containing S
  python3 archive.py stats
"""
import glob, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
from lib import ROOT, UA, load, pmap, save

STATE = "archive_state.json"
SPN_DELAY = 6  # seconds between anonymous saves
TRANSIENT = ("http 429", "http 502", "http 503", "URLError", "TimeoutError")
is_transient = lambda err: bool(err) and err.startswith(TRANSIENT)


def all_urls():
    urls = {}
    for f in sorted(glob.glob("data/*.json")):
        if f.endswith(STATE):
            continue
        for e in json.load(open(f, encoding="utf-8")):
            for k in ("page", "download", "preview"):
                # files already hosted on archive.org (Wayback copies, archive.org items) need no snapshot
                if e.get(k) and not host_of(e[k]).endswith("archive.org"):
                    urls[e[k]] = None
    return list(urls)


def call(url, timeout=120):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=timeout)


def snapshot_ts(url):
    m = re.search(r"/web/(\d{14})", url)
    return m.group(1) if m else None


def spn(url):
    """Anonymous Save Page Now. Returns (timestamp|None, error|None)."""
    try:
        with call("https://web.archive.org/save/" + url) as r:
            ts = snapshot_ts(r.headers.get("Content-Location", "")) or snapshot_ts(r.geturl())
            return (ts, None) if ts else (None, "no snapshot header")
    except urllib.error.HTTPError as e:
        return None, f"http {e.code}"
    except Exception as e:
        return None, type(e).__name__


def norm(url):
    u = urllib.parse.urlsplit(url)
    host = (u.hostname or "").lower().removeprefix("www.")
    return host + u.path.lower().rstrip("/") + ("?" + u.query if u.query else "")


def host_of(url):
    return (urllib.parse.urlsplit(url).hostname or "").lower().removeprefix("www.")


def cdx_host(host):
    """{normalized url: (timestamp, original url)}: first 2xx/3xx capture of every URL on a host (download links are redirects)."""
    found, key = {}, None
    while True:
        q = f"https://web.archive.org/cdx/search/cdx?url={host}/*&output=json&fl=timestamp,original&filter=statuscode:[23]..&collapse=urlkey&limit=50000&showResumeKey=true"
        if key:
            q += "&resumeKey=" + urllib.parse.quote(key)
        for attempt in range(6):
            try:
                with call(q, 180) as r:
                    rows = json.load(r)
                break
            except Exception:
                time.sleep(10 * 2 ** attempt)
        else:
            raise RuntimeError("cdx failed for " + host)
        key = None
        if len(rows) > 1 and rows[-2] == []:
            key = rows[-1][0]
            rows = rows[:-2]
        for ts, orig in rows[1:]:
            found.setdefault(norm(orig), (ts, orig))
        print(host, len(found), flush=True)
        if not key:
            return found


def cdx_urls(urls):
    """Same result shape as cdx_host, one lookup per url: for shared hosts (image CDNs, GitHub, Google Drive) where
    listing every capture of the host would take hours for a handful of our urls."""
    found = {}
    for u in urls:
        q = f"https://web.archive.org/cdx/search/cdx?url={urllib.parse.quote(u, safe='')}&output=json&fl=timestamp,original&filter=statuscode:[23]..&limit=1"
        for attempt in range(4):
            try:
                with call(q, 60) as r:
                    rows = json.load(r) if r.length != 0 else []
                break
            except json.JSONDecodeError:
                rows = []
                break
            except Exception:
                time.sleep(5 * 2 ** attempt)
        else:
            rows = []
        for ts, orig in rows[1:2]:
            found[norm(u)] = (ts, orig)
        time.sleep(0.5)
    return found


# hosts we have this many urls on or more are listed whole; below it, each url is looked up on its own.
# Shared hosts (CDNs, code and file hosts) are always looked up per url: their full listings run to millions.
HOST_LISTING = 300
SHARED = re.compile(r"(^|\.)(google|googleusercontent|githubusercontent|github|gstatic|imgur|dropbox|mediafire|sourceforge|deviantart|photobucket|tinypic|imageshack|blogspot|wordpress|wikia|fandom|archive)\.(com|org|net|io|us)$")


def check():
    state = load(STATE)
    urls = all_urls()
    # urls never looked up come first; then missing urls that saw a failed save (a save that timed out
    # on our side sometimes finished on archive.org's side). Each host is saved as it completes, so a
    # run cut short by the step timeout still keeps what it found.
    new = [u for u in urls if u not in state]
    retry = [u for u in urls if u in state and not state[u].get("ts") and state[u].get("err")]
    print(len(new), "new urls,", len(retry), "to recheck", flush=True)
    for todo in (new, retry):
        hosts = {}
        for u in todo:
            hosts.setdefault(host_of(u), []).append(u)
        for host, us in sorted(hosts.items(), key=lambda kv: len(kv[1])):
            found = cdx_host(host) if len(us) >= HOST_LISTING and not SHARED.search(host) else cdx_urls(us)
            print(host, len(us), "urls,", sum(1 for u in us if norm(u) in found), "captured", flush=True)
            for u in us:
                if norm(u) in found:
                    ts, orig = found[norm(u)]
                    state[u] = {"ts": ts, **({"u": orig} if orig != u else {})}
                else:
                    state.setdefault(u, {"ts": None})
            save(STATE, state)
    stats()


def keys():
    p = os.path.join(ROOT, ".archive-keys")
    return open(p).read().strip() if os.path.exists(p) else None


def spn2(url, auth):
    """Authenticated Save Page Now. Returns (timestamp|None, error|None)."""
    h = {"User-Agent": UA, "Accept": "application/json", "Authorization": "LOW " + auth}
    try:
        req = urllib.request.Request("https://web.archive.org/save", urllib.parse.urlencode({"url": url, "skip_first_archive": 1}).encode(), h)
        job = json.load(urllib.request.urlopen(req, timeout=30)).get("job_id")
        if not job:
            return None, "no job"
        for _ in range(60):
            time.sleep(5)
            st = json.load(urllib.request.urlopen(urllib.request.Request("https://web.archive.org/save/status/" + job, headers=h), timeout=60))
            if st.get("status") == "success":
                return st.get("timestamp"), None
            if st.get("status") == "error":
                return None, st.get("status_ext") or "error"
        return None, "timeout"
    except urllib.error.HTTPError as e:
        return None, f"http {e.code}"
    except urllib.error.URLError as e:
        return None, f"URLError {e.reason}"
    except Exception as e:
        return None, f"{type(e).__name__} {e}"[:120]


def merge(path):
    """Copy snapshots found in another state file into ours (CI: ours is fresh from origin)."""
    state, theirs = load(STATE), json.load(open(path, encoding="utf-8"))
    for u, s in theirs.items():
        if not state.get(u, {}).get("ts"):
            state[u] = s
    save(STATE, state)


def save_missing(limit, workers=4, match=""):
    state = load(STATE)
    auth = keys()
    want = [u for u in all_urls() if state.get(u, {}).get("ts") is None and state.get(u, {}).get("fails", 0) < 3 and match in u]
    # one host at a time, in turn, untried urls before ones that already failed: a slow or throttled host
    # can't hold the whole queue
    queues = {}
    for u in sorted(want, key=lambda u: (bool(state.get(u, {}).get("err")), state.get(u, {}).get("fails", 0))):
        queues.setdefault(host_of(u), []).append(u)
    todo = [q[i] for i in range(max(map(len, queues.values()), default=0)) for q in queues.values() if i < len(q)][:limit]
    print(len(todo), "urls this run,", "authenticated" if auth else "anonymous", flush=True)

    def one(u):
        ts, err = spn2(u, auth) if auth else spn(u)
        if not auth:
            time.sleep(SPN_DELAY)
        # successful submits answer in ~1s; 429s and dropped connections (timeout/reset after 130s+) are archive.org
        # throttling us, so both get the long back-off and a short connect timeout above
        if is_transient(err):
            time.sleep(90)
        return u, ts, err

    for i in range(0, len(todo), workers * 5):
        for u, ts, err in pmap(one, todo[i : i + workers * 5], workers=workers if auth else 1):
            s = state.setdefault(u, {"ts": None})
            if ts:
                s.update(ts=ts, saved=int(time.time()))
                s.pop("err", None)
            else:
                s["err"] = err
                s["fails"] = s.get("fails", 0) + (0 if is_transient(err) else 1)
            print(ts or err, u, flush=True)
        save(STATE, state)


def stats():
    state = load(STATE)
    have = sum(1 for s in state.values() if s.get("ts"))
    print(f"{have}/{len(state)} urls have a snapshot, {len(all_urls()) - len(state)} unchecked")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "stats"
    {"check": check, "save": lambda: save_missing(int(sys.argv[2]) if len(sys.argv) > 2 else 10**9, int(sys.argv[3]) if len(sys.argv) > 3 else 4, sys.argv[4] if len(sys.argv) > 4 else ""), "stats": stats, "merge": lambda: merge(sys.argv[2])}[cmd]()
