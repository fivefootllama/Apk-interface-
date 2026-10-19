#!/usr/bin/env python3
"""
HTTP IPC server to accept commands from a local UI and write them to the APK sandbox directory.
Runs under Chaquopy inside the APK and listens on 127.0.0.1:8765.

Endpoints:
- POST /command  (JSON body) -> writes sandbox/command.json atomically and returns {status: 'ok'}
- GET /last_result -> returns contents of sandbox/last_result.json if present

Security note: this server binds to localhost only. The APK must ensure only trusted local UIs can call it.
"""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import threading

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SANDBOX_DIR = os.path.join(BASE_DIR, "sandbox")
os.makedirs(SANDBOX_DIR, exist_ok=True)
COMMAND_PATH = os.path.join(SANDBOX_DIR, "command.json")
PROCESSING_PATH = os.path.join(SANDBOX_DIR, "command.processing.json")
RESULT_PATH = os.path.join(SANDBOX_DIR, "last_result.json")

HOST = '127.0.0.1'
PORT = 8765

class IPCHandler(BaseHTTPRequestHandler):
    def _set_json_headers(self, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != '/command':
            self._set_json_headers(404)
            self.wfile.write(json.dumps({'error': 'not_found'}).encode('utf-8'))
            return

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        try:
            payload = json.loads(body.decode('utf-8'))
        except Exception as e:
            self._set_json_headers(400)
            self.wfile.write(json.dumps({'status': 'error', 'message': 'invalid_json', 'detail': str(e)}).encode('utf-8'))
            return

        # Atomic write: write to temp then rename
        tmp_path = COMMAND_PATH + '.tmp'
        try:
            with open(tmp_path, 'w', encoding='utf-8') as f:
                json.dump(payload, f)
            os.replace(tmp_path, COMMAND_PATH)
            self._set_json_headers(200)
            self.wfile.write(json.dumps({'status': 'ok'}).encode('utf-8'))
        except Exception as e:
            self._set_json_headers(500)
            self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/last_result':
            if os.path.exists(RESULT_PATH):
                try:
                    with open(RESULT_PATH, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    self._set_json_headers(200)
                    self.wfile.write(json.dumps({'status': 'ok', 'result': data}).encode('utf-8'))
                except Exception as e:
                    self._set_json_headers(500)
                    self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            else:
                self._set_json_headers(404)
                self.wfile.write(json.dumps({'status': 'not_found'}).encode('utf-8'))
            return

        self._set_json_headers(404)
        self.wfile.write(json.dumps({'error': 'not_found'}).encode('utf-8'))

def run_server():
    server = HTTPServer((HOST, PORT), IPCHandler)
    print(f"IPC HTTP server listening on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()

def start_in_thread():
    t = threading.Thread(target=run_server, daemon=True)
    t.start()
    return t

if __name__ == '__main__':
    run_server()
