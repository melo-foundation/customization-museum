import importlib, os, sys
from lib import load, save

for name in sys.argv[1:]:
    items = importlib.import_module(f"sources.{name}").scrape()
    print(name, len(items), "entries,", sum(1 for i in items if i["preview"]), "previews,", sum(1 for i in items if i["download"]), "downloads")
    old = load(f"{name}.json") or []
    if len(items) < len(old) / 2 and not os.environ.get("FORCE"):
        print(f"{name}: kept existing {len(old)} entries (new run found {len(items)}; set FORCE=1 to overwrite)")
        continue
    save(f"{name}.json", items)
