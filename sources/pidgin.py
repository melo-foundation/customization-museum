import html, re, urllib.parse
from datetime import datetime
from lib import get

WIKI = "https://developer.pidgin.im/wiki/"
APP = "Pidgin"


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def text(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).replace("​", "").strip()


def attachments(page, src):
    """{filename: (raw url, YYYY-MM-DD, description, bytes)} from a Trac page's attachment list."""
    out = {}
    block = src[src.find('<div id="attachments"'):]
    for li in re.findall(r"<li>(.*?)</li>", block, re.S):
        raw = re.search(r'href="\.\./raw-attachment/wiki/[^/]+/([^"]+)"', li)
        if not raw:
            continue
        name = html.unescape(raw.group(1))
        when = re.search(r"See timeline at (\w+ \d+, \d{4})", li)
        size = re.search(r'<span title="(\d+) bytes"', li)
        desc = re.search(r"<q>(.*?)</q>", li, re.S)
        out[name] = (
            f"{WIKI.replace('/wiki/', '/raw-attachment/wiki/')}{page}/{urllib.parse.quote(name)}",
            datetime.strptime(when.group(1), "%b %d, %Y").strftime("%Y-%m-%d") if when else "",
            text(desc.group(1)) if desc else "",
            int(size.group(1)) if size else 0,
        )
    return out


def stem(name):
    return re.sub(r"(\.tar)?\.[a-z0-9]+$", "", name, flags=re.I).lower()


def smileys():
    page = "ThirdPartySmileyThemes"
    src = get(WIKI + page)
    att = attachments(page, src)
    pics = {stem(n): v[0] for n, v in att.items() if n.lower().endswith((".png", ".jpg", ".gif"))}
    out = []
    for row in re.findall(r"<tr>(.*?)</tr>", src, re.S)[1:]:
        cells = re.findall(r"<td>(.*?)</td>", row, re.S)
        if len(cells) < 3:
            continue
        link = re.search(r'<a class="(attachment|ext-link)" href="([^"]+)"', cells[0])
        title = text(cells[0])
        if not title:
            continue
        dl, homepage, date = None, None, ""
        if link and link.group(1) == "attachment":
            name = html.unescape(link.group(2).rsplit("/", 1)[-1])
            dl = urllib.parse.urljoin(WIKI + page, link.group(2))
            date = att.get(name, (None, ""))[1]
            preview = pics.get(stem(name))
        elif link:
            homepage = html.unescape(link.group(2))
            if re.search(r"\.(zip|tar\.gz|tgz|7z|rar)$|/tarball/|download", homepage, re.I):
                dl = homepage
            preview = None
        out.append(dict(
            app=APP, id=f"pidgin-smiley-{slugify(title)}", title=title, date=date,
            page=homepage or f"{WIKI}{page}#{slugify(title)}", preview=preview, download=dl,
            tags=["Smiley Themes"],
        ))
    return out


def from_attachments(page, tag, titles=None):
    src = get(WIKI + page)
    att = attachments(page, src)
    pics = {stem(n): v[0] for n, v in att.items() if n.lower().endswith((".png", ".jpg", ".gif"))}
    out = []
    for name, (url, date, desc, size) in att.items():
        if not re.search(r"\.(zip|tar\.gz|tgz|7z|rar)$", name, re.I) or size < 100:
            continue
        title = (titles or {}).get(name) or desc or stem(name).replace("_", " ")
        out.append(dict(
            app=APP, id=f"pidgin-{slugify(tag)}-{slugify(stem(name))}", title=title, date=date,
            page=f"{WIKI}{page}", preview=pics.get(stem(name)), download=url, tags=[tag],
        ))
    return out


def sound_titles():
    src = get(WIKI + "SoundThemes")
    return {html.unescape(f): text(t) for f, t in re.findall(r"title=\"Attachment '([^']+)' in SoundThemes\">(.*?)</a>", src)}


def scrape():
    items = smileys() + from_attachments("StatusIconThemes", "Status Icon Themes") + from_attachments("SoundThemes", "Sound Themes", sound_titles())
    return list({i["id"]: i for i in items}.values())
