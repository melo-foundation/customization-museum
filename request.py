"""Save the URLs from an approved archive-request issue. Reads ISSUE_BODY, writes result.md."""
import os, re
from archive import keys, spn2

MAX = 50

body = os.environ["ISSUE_BODY"]
section = re.search(r"### URLs\s*\n(.*?)(?:\n### |\Z)", body, re.S)
urls = list(dict.fromkeys(re.findall(r"https?://[^\s<>\"'`]+", section.group(1) if section else "")))[:MAX]

auth = keys()
lines = []
for u in urls:
    ts, err = spn2(u, auth)
    lines.append(f"- [x] [{u}](https://web.archive.org/web/{ts}/{u})" if ts else f"- [ ] {u}: {err}")
    print(lines[-1], flush=True)

ok = sum(1 for l in lines if l.startswith("- [x]"))
open("result.md", "w").write(f"Saved {ok}/{len(urls)}\n\n" + "\n".join(lines) if urls else "No URLs found under **URLs**.")
open(os.environ.get("GITHUB_OUTPUT", os.devnull), "a").write(f"all_ok={'true' if urls and ok == len(urls) else 'false'}\n")
