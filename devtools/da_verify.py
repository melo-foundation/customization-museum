"""Local check of deviantART downloads: lists archive contents without downloading the archives.

  python3 devtools/da_verify.py            # verify data/deviantart_api.json, drop non-skins, add extra["Contains"]
  python3 devtools/da_verify.py --selftest

Needs .deviantart-keys and .deviantart-token (devtools/da_auth.py). Results cache in .cache/da_verify.json.
"""
import json, os, re, struct, sys, time, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYS, TOKEN = os.path.join(ROOT, ".deviantart-keys"), os.path.join(ROOT, ".deviantart-token")
CACHE = os.path.join(ROOT, ".cache", "da_verify.json")
DATA = os.path.join(ROOT, "data", "deviantart_api.json")
UA = "customization-museum/0.1"
WANT = {
    "Windows Visual Styles": {"msstyles", "theme", "themepack", "deskthemepack"},
    "Winamp 3/5 (Modern Skins)": {"wal", "wa3"},
    "Windows Media Player": {"wmz", "wms"},
    "MSN / WLM": {"plsk", "plsc", "mct"},
    "Sonique": {"sgf"},
    "CursorXP": {"curxptheme"},
}
TRIVIAL = {"txt", "jpg", "jpeg", "png", "gif", "bmp", "db", "ini", "url", "html", "htm", "nfo", "md", "diz", "rtf", "pdf", "doc", "docx", "ico", "ds_store"}


# ---- archive readers; fetch(offset, length) -> bytes, offset<0 reads from the end; returns (names, complete)
def zip_names(fetch, size):
    tail = fetch(-65536 if size > 65536 else 0, 65536)
    i = tail.rfind(b"PK\x05\x06")
    if i < 0:
        tail = fetch(-1048576 if size > 1048576 else 0, 1048576)
        i = tail.rfind(b"PK\x05\x06")
        if i < 0:
            return [], False
    cd_size, cd_off = struct.unpack_from("<II", tail, i + 12)
    if cd_off == 0xFFFFFFFF or cd_size == 0xFFFFFFFF:
        return [], False
    tail_start = size - len(tail)
    cd = tail[cd_off - tail_start:cd_off - tail_start + cd_size] if cd_off >= tail_start else fetch(cd_off, cd_size)
    names, p = [], 0
    while p + 46 <= len(cd) and cd[p:p + 4] == b"PK\x01\x02":
        nl, el, cl = struct.unpack_from("<HHH", cd, p + 28)
        flags = struct.unpack_from("<H", cd, p + 8)[0]
        raw = cd[p + 46:p + 46 + nl]
        names.append(raw.decode("utf-8" if flags & 0x800 else "cp437", "replace"))
        p += 46 + nl + el + cl
    return names, True


def vint(b, p):
    v = s = 0
    while True:
        c = b[p]; p += 1
        v |= (c & 0x7F) << s; s += 7
        if not c & 0x80:
            return v, p


def rar5_names(fetch, size, maxhops=15):
    pos, names = 8, []
    for _ in range(maxhops):
        if pos >= size:
            return names, True
        buf = fetch(pos, 4096)
        if len(buf) < 8:
            return names, True
        try:
            hsize, p = vint(buf, 4)
            if p + hsize > len(buf):
                buf = fetch(pos, p + hsize + 8)
            htype, q = vint(buf, p)
            flags, q = vint(buf, q)
            if flags & 1:
                _, q = vint(buf, q)
            dsize = 0
            if flags & 2:
                dsize, q = vint(buf, q)
            if htype == 2:
                ff, q = vint(buf, q)
                _, q = vint(buf, q)
                _, q = vint(buf, q)
                if ff & 2: q += 4
                if ff & 4: q += 4
                _, q = vint(buf, q)
                _, q = vint(buf, q)
                nl, q = vint(buf, q)
                names.append(buf[q:q + nl].decode("utf-8", "replace"))
            elif htype == 5:
                return names, True
            pos += p + hsize + dsize
        except IndexError:
            return names, False
    return names, False


def rar4_names(fetch, size, maxhops=15):
    pos, names = 7, []
    for _ in range(maxhops):
        if pos >= size:
            return names, True
        buf = fetch(pos, 4096)
        if len(buf) < 7:
            return names, True
        _, t, fl, hs = struct.unpack_from("<HBHH", buf, 0)
        add = 0
        if t == 0x74:
            if hs + 8 > len(buf):
                buf = fetch(pos, hs + 8)
            add, = struct.unpack_from("<I", buf, 7)
            nl, = struct.unpack_from("<H", buf, 26)
            off = 32 + (8 if fl & 0x100 else 0)
            raw = buf[off:off + nl]
            names.append((raw.split(b"\0")[0] if fl & 0x200 else raw).decode("utf-8", "replace"))
        elif t == 0x7B:
            return names, True
        elif fl & 0x8000:
            add, = struct.unpack_from("<I", buf, 7)
        pos += hs + add
        if hs == 0:
            break
    return names, False


def list_archive(fetch, size, filename):
    head = fetch(0, 8)
    if head[:4] == b"PK\x03\x04" or head[:4] == b"PK\x05\x06":
        return zip_names(fetch, size)
    if head[:8] == b"Rar!\x1a\x07\x01\x00":
        return rar5_names(fetch, size)
    if head[:7] == b"Rar!\x1a\x07\x00":
        return rar4_names(fetch, size)
    return None, False


def exts(names):
    return sorted({n.rsplit(".", 1)[-1].lower() for n in names if "." in n.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]})


# ---- network
def post(url, fields):
    r = urllib.request.Request(url, urllib.parse.urlencode(fields).encode(), {"User-Agent": UA})
    return json.load(urllib.request.urlopen(r, timeout=60))


def user_token():
    cid, secret = open(KEYS).read().split()[:2]
    tok = json.load(open(TOKEN))
    j = post("https://www.deviantart.com/oauth2/token", dict(grant_type="refresh_token", client_id=cid, client_secret=secret, refresh_token=tok["refresh_token"]))
    tok["refresh_token"] = j.get("refresh_token", tok["refresh_token"])
    fd = os.open(TOKEN, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump(tok, f)
    return j["access_token"]


def api_get(path, access, **q):
    r = urllib.request.Request(f"https://www.deviantart.com/api/v1/oauth2{path}?{urllib.parse.urlencode(q)}",
                               headers={"User-Agent": UA, "Authorization": "Bearer " + access})
    return json.load(urllib.request.urlopen(r, timeout=60))


def make_fetch(src):
    def fetch(off, n):
        rng = f"bytes=-{n}" if off < 0 else f"bytes={off}-{off + n - 1}"
        r = urllib.request.Request(src, headers={"User-Agent": UA, "Range": rng})
        with urllib.request.urlopen(r, timeout=60) as resp:
            return resp.read()
    return fetch


def total_size(src):
    r = urllib.request.Request(src, headers={"User-Agent": UA, "Range": "bytes=0-0"})
    with urllib.request.urlopen(r, timeout=60) as resp:
        cr = resp.headers.get("Content-Range", "")
        return int(cr.rsplit("/", 1)[-1]) if "/" in cr else int(resp.headers.get("Content-Length", 0))


def check(did, access):
    j = api_get(f"/deviation/download/{did}", access)
    time.sleep(1)
    src, fn = j.get("src"), j.get("filename", "")
    if not src:
        return dict(status="unchecked")
    ext = fn.rsplit(".", 1)[-1].lower() if "." in fn else ""
    if ext in ("zip", "rar", "7z", "msstyles", "theme", "wal", "wmz", "wms", "plsk", "sgf", "curxptheme", "themepack", "deskthemepack", "wa3"):
        pass
    if ext in ("7z",):
        return dict(status="unchecked", file=fn)
    if ext not in ("zip", "rar"):
        return dict(status="ok", contains=[ext] if ext else [], file=fn)
    size = total_size(src)
    names, complete = list_archive(make_fetch(src), size, fn)
    if names is None:
        return dict(status="unchecked", file=fn)
    return dict(status="ok" if complete or names else "unchecked", contains=exts(names), complete=complete, file=fn)


def main():
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    items = json.load(open(DATA))
    if not (os.path.exists(KEYS) and os.path.exists(TOKEN)):
        sys.exit(".deviantart-keys / .deviantart-token missing (run devtools/da_auth.py)")
    access = user_token()
    out = []
    for n, it in enumerate(items):
        did = it["id"][3:]
        if did not in cache:
            try:
                cache[did] = check(did, access)
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    time.sleep(60)
                cache[did] = dict(status="unchecked", error=e.code) if e.code != 429 else None
                if cache[did] is None:
                    del cache[did]
                    continue
            except Exception as e:
                cache[did] = dict(status="unchecked", error=type(e).__name__)
            os.makedirs(os.path.dirname(CACHE), exist_ok=True)
            json.dump(cache, open(CACHE, "w"))
            time.sleep(1)
        r = cache[did]
        if r["status"] == "ok":
            have = set(r.get("contains", []))
            if WANT.get(it["app"]) and not (have & WANT[it["app"]]):
                print("drop", it["app"], "|", it["title"][:50], "|", sorted(have)[:6], flush=True)
                continue
            shown = sorted(have - TRIVIAL)
            if shown:
                it.setdefault("extra", {})["Contains"] = ", ".join("." + e for e in shown[:8])
        out.append(it)
        if n % 50 == 0:
            print(f"{n}/{len(items)} kept {len(out)}", flush=True)
    json.dump(out, open(DATA, "w"), indent=1, ensure_ascii=False, sort_keys=True)
    print("kept", len(out), "of", len(items))


# ---- selftest
def selftest():
    import io, zipfile
    z = io.BytesIO()
    with zipfile.ZipFile(z, "w") as zf:
        zf.writestr("Skin/a.msstyles", b"x" * 10000)
        zf.writestr("Skin/readme.txt", "hi")
    zb = z.getvalue()

    def fetcher(buf):
        return lambda off, n: buf[off:off + n] if off >= 0 else buf[off:]
    names, ok = list_archive(fetcher(zb), len(zb), "a.zip")
    assert ok and exts(names) == ["msstyles", "txt"], names

    def v(n):
        out = b""
        while True:
            c = n & 0x7F; n >>= 7
            out += bytes([c | (0x80 if n else 0)])
            if not n:
                return out
    def r5file(name, data):
        body = v(2) + v(2) + v(len(data)) + v(0) + v(len(data)) + v(0) + v(0) + v(1) + v(len(name)) + name.encode()
        return b"\0\0\0\0" + v(len(body)) + body + data
    r5 = b"Rar!\x1a\x07\x01\x00" + b"\0\0\0\0" + v(3) + v(1) + v(0) + v(0) + r5file("a.wal", b"d" * 20000) + r5file("b.txt", b"hello")
    names, ok = list_archive(fetcher(r5), len(r5), "a.rar")
    assert exts(names) == ["txt", "wal"], names

    def r4file(name, data):
        nb = name.encode()
        hs = 32 + len(nb)
        return struct.pack("<HBHH", 0, 0x74, 0x8000, hs) + struct.pack("<IIBIIBBHI", len(data), len(data), 2, 0, 0, 29, 0x30, len(nb), 0) + nb + data
    r4 = b"Rar!\x1a\x07\x00" + struct.pack("<HBHH", 0, 0x73, 0, 13) + b"\0" * 6 + r4file("skin.plsk", b"q" * 5000) + r4file("x.txt", b"zz")
    names, ok = list_archive(fetcher(r4), len(r4), "a.rar")
    assert exts(names) == ["plsk", "txt"], names
    print("selftest ok")


if __name__ == "__main__":
    selftest() if "--selftest" in sys.argv else main()
