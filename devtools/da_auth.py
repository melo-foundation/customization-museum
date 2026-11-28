"""One-time deviantART sign-in: gets a user token so the scraper can fetch download links.

  python3 devtools/da_auth.py

Needs .deviantart-keys (line 1 client id, line 2 client secret) and http://localhost:8765/callback registered
as a redirect URI in the deviantART app settings. Writes .deviantart-token (git-ignored); prints nothing secret.
"""
import http.server, json, os, secrets, sys, threading, urllib.parse, urllib.request, webbrowser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYS = os.path.join(ROOT, ".deviantart-keys")
TOKEN = os.path.join(ROOT, ".deviantart-token")
REDIRECT = "http://localhost:8765/callback"


def token_request(fields):
    req = urllib.request.Request("https://www.deviantart.com/oauth2/token", urllib.parse.urlencode(fields).encode(),
                                 {"User-Agent": "customization-museum/0.1"})
    return json.load(urllib.request.urlopen(req, timeout=60))


def main():
    if not os.path.exists(KEYS):
        sys.exit(".deviantart-keys missing: line 1 client id, line 2 client secret")
    cid, secret = open(KEYS).read().split()[:2]
    state = secrets.token_urlsafe(16)
    got = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
            ok = q.get("state", [""])[0] == state and "code" in q
            if ok:
                got["code"] = q["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(("Signed in. You can close this tab." if ok else "Sign-in failed: " + str(q.get("error_description", q.get("error", ["unknown"])))).encode())
            threading.Thread(target=server.shutdown).start()

        def log_message(self, *a):
            pass

    server = http.server.HTTPServer(("127.0.0.1", 8765), Handler)
    url = "https://www.deviantart.com/oauth2/authorize?" + urllib.parse.urlencode(
        {"response_type": "code", "client_id": cid, "redirect_uri": REDIRECT, "scope": "browse", "state": state})
    print("Opening deviantART to approve the app. If no browser opens, visit:\n" + url, flush=True)
    webbrowser.open(url)
    server.serve_forever()
    if "code" not in got:
        sys.exit("no authorization code received")
    tok = token_request({"grant_type": "authorization_code", "client_id": cid, "client_secret": secret,
                         "code": got["code"], "redirect_uri": REDIRECT})
    if tok.get("status") != "success" or "refresh_token" not in tok:
        sys.exit("token exchange failed: " + str({k: v for k, v in tok.items() if "token" not in k}))
    fd = os.open(TOKEN, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump({"refresh_token": tok["refresh_token"]}, f)
    print("Saved .deviantart-token (refresh token, valid about 3 months).")


if __name__ == "__main__":
    main()
