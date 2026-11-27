"""Compare a theme against a reference capture of the original site.

  python3 devtools/compare.py THEME PATH REFERENCE.png OUT_PREFIX [WIDTH] [HEIGHT]

Renders http://localhost:<port>/<PATH> in THEME with headless Chromium, then writes
OUT_PREFIX-side.png (reference | ours), OUT_PREFIX-diff.png (red = differs) and prints a
mismatch score (0 = identical, 100 = nothing alike) over the compared area.
"""
import functools, http.server, os, subprocess, sys, tempfile, threading
from PIL import Image, ImageChops, ImageOps

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve():
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=REPO))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def render(theme, path, width, height, out):
    httpd = serve()
    port = httpd.server_address[1]
    # same-origin page that selects the theme, dismisses the warning, then navigates
    page = os.path.join(REPO, f"zz-compare-{os.getpid()}.html")
    open(page, "w").write(
        f"<script>localStorage.setItem('theme',{theme!r});localStorage.setItem('warned','1');"
        f"location.replace('/{path.lstrip('/')}')</script>")
    profile = tempfile.mkdtemp()
    try:
        subprocess.run(["chromium-browser", "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                        f"--user-data-dir={profile}", f"--window-size={width},{height}", "--virtual-time-budget=15000",
                        f"--screenshot={out}", f"http://127.0.0.1:{port}/{os.path.basename(page)}"],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120, check=False)
    finally:
        os.remove(page)
        subprocess.run(["rm", "-rf", profile])
        httpd.shutdown()


def compare(ref_png, ours_png, prefix):
    a, b = Image.open(ref_png).convert("RGB"), Image.open(ours_png).convert("RGB")
    w, h = min(a.width, b.width), min(a.height, b.height)
    a, b = a.crop((0, 0, w, h)), b.crop((0, 0, w, h))
    side = Image.new("RGB", (w * 2 + 10, h), "white")
    side.paste(a, (0, 0))
    side.paste(b, (w + 10, 0))
    side.save(prefix + "-side.png")
    d = ImageOps.grayscale(ImageChops.difference(a, b))
    mask = d.point(lambda v: 255 if v > 40 else 0)
    overlay = Image.blend(ImageOps.grayscale(a).convert("RGB"), Image.new("RGB", (w, h), "white"), 0.6)
    overlay.paste(Image.new("RGB", (w, h), (230, 0, 0)), mask=mask)
    overlay.save(prefix + "-diff.png")
    score = 100 * sum(1 for v in mask.getdata() if v) / (w * h)
    return round(score, 1)


if __name__ == "__main__":
    theme, path, ref, prefix = sys.argv[1:5]
    width = int(sys.argv[5]) if len(sys.argv) > 5 else 1024
    height = int(sys.argv[6]) if len(sys.argv) > 6 else Image.open(ref).height
    ours = prefix + "-ours.png"
    render(theme, path, width, height, ours)
    print(f"mismatch {compare(ref, ours, prefix)}%  ->  {prefix}-side.png  {prefix}-diff.png")
