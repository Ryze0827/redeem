#!/usr/bin/env python3
import json
import mimetypes
import os
import posixpath
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
DIST_DIR = BASE_DIR / "frontend" / "dist"
UPSTREAM_BASE_URL = os.environ.get("UPSTREAM_BASE_URL", "https://gpt.86gamestore.com/api").rstrip("/")
PORT = int(os.environ.get("PORT", "8090"))
HOST = os.environ.get("HOST", "127.0.0.1")
REQUEST_TIMEOUT = float(os.environ.get("UPSTREAM_TIMEOUT", "25"))
PID_FILE = Path(os.environ.get("PID_FILE", str(BASE_DIR / "run" / "backend.pid")))
LOG_FILE = Path(os.environ.get("LOG_FILE", str(BASE_DIR / "logs" / "backend.log")))
SSL_CONTEXT = None

try:
    import certifi

    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CONTEXT = ssl.create_default_context()


def json_bytes(data):
    return json.dumps(data, ensure_ascii=False).encode("utf-8")


class RedeemHandler(BaseHTTPRequestHandler):
    server_version = "RedeemProxy/1.0"

    def log_message(self, fmt, *args):
        print("%s - - [%s] %s" % (self.client_address[0], self.log_date_time_string(), fmt % args))

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path

        if path == "/health":
            self.write_json({"success": True, "status": "ok"})
            return

        if path == "/api/stock":
            self.forward("GET", "/turkey_stock_count")
            return

        if path == "/api/status":
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            cdkey = (query.get("cdkey") or [""])[0].strip()
            if not cdkey:
                self.write_json({"success": False, "msg": "缺少 cdkey 参数"}, 400)
                return
            self.forward("POST", "/check", {"cdkey": cdkey})
            return

        if path == "/turkey_stock_count":
            self.forward("GET", "/turkey_stock_count")
            return

        self.serve_static(path)

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        body = self.read_json_body()

        route_map = {
            "/api/check": "/check",
            "/api/status": "/check",
            "/api/activate": "/activate",
            "/check": "/check",
            "/activate": "/activate",
        }
        upstream_path = route_map.get(path)
        if not upstream_path:
            self.write_json({"success": False, "msg": "接口不存在"}, 404)
            return

        self.forward("POST", upstream_path, body)

    def read_json_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return {}

        raw = self.rfile.read(length)
        if not raw:
            return {}

        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return {"_raw": raw.decode("utf-8", errors="replace")}

    def forward(self, method, upstream_path, payload=None):
        url = f"{UPSTREAM_BASE_URL}{upstream_path}"
        data = None
        headers = {
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "RedeemProxy/1.0",
        }
        if payload is not None:
            data = json_bytes(payload)
            headers["Content-Type"] = "application/json;charset=UTF-8"

        request = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT, context=SSL_CONTEXT) as response:
                content = response.read()
                content_type = response.headers.get("Content-Type") or "application/json; charset=utf-8"
                self.write_raw(content, response.status, content_type)
        except urllib.error.HTTPError as exc:
            content = exc.read()
            content_type = exc.headers.get("Content-Type") or "application/json; charset=utf-8"
            self.write_raw(content, exc.code, content_type)
        except Exception as exc:
            self.write_json({"success": False, "msg": f"上游服务请求失败：{exc}"}, 502)

    def serve_static(self, path):
        if not DIST_DIR.exists():
            self.write_json({"success": False, "msg": "前端尚未构建，请先执行 npm run build"}, 503)
            return

        safe_path = posixpath.normpath(urllib.parse.unquote(path)).lstrip("/")
        if safe_path in ("", "."):
            safe_path = "index.html"

        file_path = (DIST_DIR / safe_path).resolve()
        if not str(file_path).startswith(str(DIST_DIR.resolve())):
            self.write_json({"success": False, "msg": "非法路径"}, 403)
            return

        if not file_path.exists() or file_path.is_dir():
            file_path = DIST_DIR / "index.html"

        content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        try:
            content = file_path.read_bytes()
        except OSError as exc:
            self.write_json({"success": False, "msg": f"读取静态文件失败：{exc}"}, 500)
            return

        self.write_raw(content, 200, content_type)

    def write_json(self, data, status=200):
        self.write_raw(json_bytes(data), status, "application/json; charset=utf-8")

    def write_raw(self, content, status=200, content_type="application/octet-stream"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def main():
    if "--daemon" in sys.argv:
        daemonize()

    server = ThreadingHTTPServer((HOST, PORT), RedeemHandler)
    print(f"Redeem server listening on http://{HOST}:{PORT}", flush=True)
    print(f"Forwarding API requests to {UPSTREAM_BASE_URL}")
    server.serve_forever()


def daemonize():
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    PID_FILE.parent.mkdir(parents=True, exist_ok=True)

    if os.fork() > 0:
        os._exit(0)

    os.setsid()

    if os.fork() > 0:
        os._exit(0)

    os.chdir(str(BASE_DIR))
    os.umask(0o022)

    sys.stdin.flush()
    sys.stdout.flush()
    sys.stderr.flush()

    with open(os.devnull, "rb", buffering=0) as stdin:
        os.dup2(stdin.fileno(), sys.stdin.fileno())

    log = open(LOG_FILE, "ab", buffering=0)
    os.dup2(log.fileno(), sys.stdout.fileno())
    os.dup2(log.fileno(), sys.stderr.fileno())

    PID_FILE.write_text(str(os.getpid()), encoding="utf-8")


if __name__ == "__main__":
    main()
