import hashlib, json, os, time, urllib.error, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

UA = "customization-museum/0.1 (+https://github.com/melo-foundation/customization-museum)"
ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, ".cache")


def get(url, cache=True, retries=3, timeout=60):
    """Return page text, or None on 404/410. Disk-cached."""
    path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest())
    if cache and os.path.exists(path):
        return open(path, encoding="utf-8").read()
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                text = r.read().decode("utf-8", "replace")
            os.makedirs(CACHE, exist_ok=True)
            open(path, "w", encoding="utf-8").write(text)
            return text
        except urllib.error.HTTPError as e:
            if e.code in (404, 410):
                return None
            time.sleep(2 ** attempt)
        except Exception:
            time.sleep(2 ** attempt)
    raise RuntimeError(f"failed: {url}")


def pmap(fn, items, workers=8):
    with ThreadPoolExecutor(workers) as ex:
        return list(ex.map(fn, items))


def load(name):
    p = os.path.join(ROOT, "data", name)
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {}


def save(name, obj):
    with open(os.path.join(ROOT, "data", name), "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=1, ensure_ascii=False, sort_keys=True)
