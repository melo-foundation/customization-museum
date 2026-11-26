"""Resumable Wayback Machine archiver.

  python3 archive.py check          # record existing snapshots (availability API)
  python3 archive.py save [N]       # Save Page Now for what is still missing, at most N urls
  python3 archive.py stats
"""
import glob, json, re, sys, time, urllib.error, urllib.parse, urllib.request
from lib import UA, load, pmap, save

STATE = "archive_state.json"
SPN_DELAY = 6  # seconds between anonymous saves


def all_urls():
    urls = {}
    for f in sorted(glob.glob("data/*.json")):
        if f.endswith(STATE):
            continue
        for e in json.load(open(f, encoding="utf-8")):
            for k in ("page", "download", "preview"):
                if e.get(k):
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
    """{normalized url: (timestamp, original url)}: first 200-status capture of every URL on a host."""
    found, key = {}, None
    while True:
        q = f"https://web.archive.org/cdx/search/cdx?url={host}/*&output=json&fl=timestamp,original&filter=statuscode:200&collapse=urlkey&limit=50000&showResumeKey=true"
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


def check():
    state = load(STATE)
    todo = [u for u in all_urls() if u not in state]
    print(len(todo), "urls to check", flush=True)
    for host in sorted({host_of(u) for u in todo}):
        found = cdx_host(host)
        for u in todo:
            if host_of(u) == host and norm(u) in found:
                ts, orig = found[norm(u)]
                state[u] = {"ts": ts, **({"u": orig} if orig != u else {})}
            elif host_of(u) == host:
                state[u] = {"ts": None}
        save(STATE, state)
    stats()


def save_missing(limit):
    state = load(STATE)
    todo = [u for u in all_urls() if state.get(u, {}).get("ts") is None and state.get(u, {}).get("fails", 0) < 3]
    print(len(todo), "urls missing,", min(limit, len(todo)), "this run", flush=True)
    backoff = 60
    for u in todo[:limit]:
        ts, err = spn(u)
        s = state.setdefault(u, {"ts": None})
        if ts:
            s.update(ts=ts, saved=int(time.time()))
            s.pop("err", None)
            backoff = 60
        else:
            s["err"] = err
            if err == "http 429":
                print("rate limited, sleeping", backoff, flush=True)
                time.sleep(backoff)
                backoff = min(backoff * 2, 900)
            else:
                s["fails"] = s.get("fails", 0) + 1
        save(STATE, state)
        print(ts or err, u, flush=True)
        time.sleep(SPN_DELAY)


def stats():
    state = load(STATE)
    have = sum(1 for s in state.values() if s.get("ts"))
    print(f"{have}/{len(state)} urls have a snapshot, {len(all_urls()) - len(state)} unchecked")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "stats"
    {"check": check, "save": lambda: save_missing(int(sys.argv[2]) if len(sys.argv) > 2 else 10**9), "stats": stats}[cmd]()
