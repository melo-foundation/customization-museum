"""Apply an approved tag-alias issue (ISSUE_BODY) to aliases.json; writes result.md."""
import json, os, re

body = os.environ.get("ISSUE_BODY", "")


def field(name):
    m = re.search(rf"### {name}\s*\n(.*?)(?:\n### |\Z)", body, re.S)
    v = (m.group(1).strip() if m else "").splitlines()
    v = v[0].strip() if v else ""
    return "" if v == "_No response_" else v


def apply(a, tag, action, target):
    k = tag.lower()
    for tags in a["types"].values():
        tags[:] = [t for t in tags if t.lower() != k]
    a["aliases"].pop(k, None)
    a["drop"] = [t for t in a["drop"] if t.lower() != k]
    if action == "Rename":
        a["aliases"][k] = target
        return f"`{tag}` is now shown as `{target}`."
    if action == "Set type":
        a["types"].setdefault(target, []).append(tag)
        return f"`{tag}` is now type `{target}`."
    a["drop"].append(tag)
    return f"`{tag}` is now hidden."


def valid(s):
    return 0 < len(s) <= 60 and re.fullmatch(r"[^\n`<>]+", s)


if __name__ == "__main__":
    tag, action, target = field("Tag"), field("Action"), field("Target")
    if not valid(tag) or action not in ("Rename", "Set type", "Hide") or (action != "Hide" and not valid(target)):
        msg, ok = "Couldn't read this request: needs a **Tag**, an **Action**, and a **Target** (except for Hide), each under 60 characters.", False
    else:
        a = json.load(open("aliases.json", encoding="utf-8"))
        msg, ok = apply(a, tag, action, target), True
        json.dump(a, open("aliases.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    open("result.md", "w").write(msg)
    open(os.environ.get("GITHUB_OUTPUT", os.devnull), "a").write(f"ok={'true' if ok else 'false'}\n")
