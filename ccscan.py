"""Find URLs ending in customization file extensions in Common Crawl's URL index.

  python3 ccscan.py CRAWL [MAX_FILES]   -> ccscan-<CRAWL>.tsv (ext, host, url, status, mime)
"""
import gzip, sys, urllib.request
import duckdb

EXTS = [
    "plsk", "plsc", "mct", "mco", "tsz", "ysz", "ipz", "mts", "wmz", "wms", "vlt", "fth",
    "sqinterface", "qsk", "qsf", "msstyles", "themepack", "deskthemepack", "wba", "uis", "iptheme",
    "dxtheme", "dxpack", "rmskin", "lsz", "widget", "nth", "thm", "ptf", "tsk",
    "adiummessagestyle", "adiumemoticonset", "adiumicon", "adiumsoundset", "adiumstatusicons", "listtheme", "listlayout",
]
BASE = "https://data.commoncrawl.org/"

crawl = sys.argv[1]
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 0
with urllib.request.urlopen(f"{BASE}crawl-data/{crawl}/cc-index-table.paths.gz", timeout=120) as r:
    files = [BASE + p for p in gzip.decompress(r.read()).decode().split() if "/subset=warc/" in p]
files = files[:limit] if limit else files
print(crawl, len(files), "index files", flush=True)

con = duckdb.connect()
con.sql("INSTALL httpfs; LOAD httpfs; SET http_retries=8; SET http_retry_wait_ms=2000;")
pattern = r"\.(" + "|".join(EXTS) + r")$"
out = open(f"ccscan-{crawl}.tsv", "w")
hits = 0
for i, f in enumerate(files):
    rows = con.execute(
        "SELECT lower(regexp_extract(url_path, '\\.([A-Za-z0-9]+)$', 1)), url_host_name, url, fetch_status, content_mime_detected "
        "FROM read_parquet(?) WHERE regexp_matches(lower(url_path), ?)", [f, pattern]
    ).fetchall()
    for r in rows:
        out.write("\t".join(str(x) for x in r) + "\n")
    hits += len(rows)
    out.flush()
    print(f"{i + 1}/{len(files)} files, {hits} hits", flush=True)
