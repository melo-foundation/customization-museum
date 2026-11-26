import glob, json, os
from lib import load

state = load("archive_state.json")
out = []
for f in sorted(glob.glob("data/*.json")):
    if f.endswith("archive_state.json"):
        continue
    for e in json.load(open(f, encoding="utf-8")):
        def ts(k):
            s = state.get(e.get(k) or "") or {}
            return s.get("ts") and s["ts"] + ("|" + s["u"] if s.get("u") else "")
        out.append(dict(
            a=e["app"], t=e["title"], d=e.get("date") or "", g=e.get("tags") or [],
            p=e.get("page"), v=e.get("preview"), l=e.get("download"),
            tp=ts("page"), tv=ts("preview"), tl=ts("download"),
        ))
json.dump(out, open("entries.json", "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False)
print(len(out), "entries,", os.path.getsize("entries.json") // 1024, "KB")
