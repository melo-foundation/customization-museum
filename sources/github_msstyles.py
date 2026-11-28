"""Windows visual styles on GitHub: repos found by search whose tree or releases contain .msstyles."""
import json, os, re, subprocess, time, urllib.error, urllib.parse, urllib.request
from lib import UA

APP = "Windows Visual Styles"
QUERIES = ["topic:msstyles", "msstyles in:name,description,readme", "topic:visual-style windows",
           "topic:uxtheme", "topic:windows-theme", "topic:windows-11-theme", "topic:windows-10-theme",
           "topic:windows-theme msstyles", "uxtheme msstyles in:readme", "\"visual style\" windows in:name,description"]


def token():
    t = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not t:
        try:
            t = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True).stdout.strip()
        except OSError:
            t = ""
    return t


def api(url, tok, params=None):
    if params:
        url += "?" + urllib.parse.urlencode(params)
    h = {"User-Agent": UA, "Accept": "application/vnd.github+json"}
    if tok:
        h["Authorization"] = "Bearer " + tok
    for a in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=60) as r:
                time.sleep(0.7)
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (404, 409, 451):
                return None
            if e.code in (403, 429):
                time.sleep(20 * (a + 1))
            else:
                time.sleep(2 ** a)
        except Exception:
            time.sleep(2 ** a)
    return None


def version(text):
    t = text.lower()
    for k, v in (("windows 11", "11"), ("win11", "11"), ("windows 10", "10"), ("win10", "10"), ("windows 8", "8"),
                 ("win8", "8"), ("windows 7", "7"), ("win7", "7"), ("vista", "Vista"), ("xp", "XP")):
        if k in t:
            return v
    return None


def first_image(readme, owner, repo, branch):
    for m in re.finditer(r'!\[[^\]]*\]\(([^)\s]+)|<img[^>]+src="([^"]+)"', readme or ""):
        u = m.group(1) or m.group(2)
        if "shields.io" in u or "badge" in u or u.endswith(".svg"):
            continue
        if not u.startswith("http"):
            u = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{u.lstrip('./')}"
        return u
    return None


def scrape():
    tok = token()
    repos = {}
    for q in QUERIES:
        for p in (1, 2, 3):
            d = api("https://api.github.com/search/repositories", tok, dict(q=q, per_page=100, page=p))
            if not d or not d.get("items"):
                break
            for r in d["items"]:
                repos.setdefault(r["full_name"], r)
            if len(d["items"]) < 100:
                break
        time.sleep(3)
    out = []
    for name, r in sorted(repos.items()):
        if r.get("fork") or r.get("size", 0) == 0:
            continue
        br = r.get("default_branch", "main")
        tree = api(f"https://api.github.com/repos/{name}/git/trees/{br}", tok, {"recursive": 1}) or {}
        rel = api(f"https://api.github.com/repos/{name}/releases/latest", tok) or {}
        assets = [a for a in rel.get("assets", []) if re.search(r"\.(zip|msstyles|7z|rar|theme|themepack)$", a["name"], re.I)]
        in_tree = any(t["path"].lower().endswith(".msstyles") for t in tree.get("tree", []))
        in_rel = any(re.search(r"msstyles|theme|style|skin", a["name"], re.I) for a in assets)
        if not (in_tree or in_rel):
            continue
        rd = api(f"https://api.github.com/repos/{name}/readme", tok, None)
        readme = ""
        if rd and rd.get("download_url"):
            try:
                readme = urllib.request.urlopen(urllib.request.Request(rd["download_url"], headers={"User-Agent": UA}), timeout=60).read().decode("utf-8", "replace")
            except Exception:
                pass
        owner, repo = name.split("/")
        if re.search(r"cve-|poc|themebleed", repo, re.I):
            continue
        v = version(" ".join([repo, r.get("description") or "", " ".join(r.get("topics", []))])) or version(readme[:3000])
        extra = {"Author": owner, "Stars": str(r["stargazers_count"])}
        if r.get("license") and r["license"].get("spdx_id") not in (None, "NOASSERTION"):
            extra["License"] = r["license"]["spdx_id"]
        out.append(dict(
            app=APP, id=f"github-msstyles-{owner}-{repo}".lower(), title=repo.replace("-", " ").replace("_", " ") if repo.islower() else repo,
            date=r["created_at"][:10], tags=([v] if v else []) + ["Visual Styles"], page=r["html_url"],
            preview=first_image(readme, owner, repo, br) or f"https://opengraph.githubassets.com/1/{name}",
            download=assets[0]["browser_download_url"] if assets else f"https://github.com/{name}/archive/refs/heads/{br}.zip",
            extra=extra, description=r.get("description") or ""))
    return out
