import importlib, sys
from lib import save

for name in sys.argv[1:]:
    items = importlib.import_module(f"sources.{name}").scrape()
    save(f"{name}.json", items)
    print(name, len(items), "entries,", sum(1 for i in items if i["preview"]), "previews,", sum(1 for i in items if i["download"]), "downloads")
