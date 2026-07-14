import os
import traceback

def start_debug_server(port, error_trace):
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import json
    class ErrorHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "failure", "error_trace": error_trace}).encode())
    print(f"Starting debug server on port {port}")
    httpd = HTTPServer(('0.0.0.0', port), ErrorHandler)
    httpd.serve_forever()

if __name__ == "__main__":
    port_str = os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT", "9000")
    try:
        port = int(port_str)
    except ValueError:
        port = 9000
        
    try:
        import uvicorn
        import main
        uvicorn.run("main:app", host="0.0.0.0", port=port)
    except Exception as e:
        err = traceback.format_exc()
        start_debug_server(port, err)
