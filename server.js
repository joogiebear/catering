// Small static server for the preview site. No customer data is collected.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = fs.realpathSync(path.join(__dirname, "public"));

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function send(req, res, status, body, type = "text/plain; charset=utf-8") {
  const content = Buffer.from(body);
  res.writeHead(status, { "Content-Type": type, "Content-Length": content.length });
  res.end(req.method === "HEAD" ? undefined : content);
}

function isInsidePublic(filePath) {
  const relative = path.relative(PUBLIC_DIR, filePath);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function serveStatic(req, res) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return send(req, res, 400, "Bad request");
  }

  // On Windows, a backslash is a filesystem separator even though it is not a URL separator.
  if (urlPath.includes("\\") || urlPath.includes("\0")) {
    return send(req, res, 400, "Bad request");
  }

  let filePath = path.resolve(PUBLIC_DIR, `.${urlPath}`);
  if (!isInsidePublic(filePath)) return send(req, res, 403, "Forbidden");
  if (urlPath.endsWith("/")) filePath = path.join(filePath, "index.html");

  // Follow filesystem links only if their final target remains in public/.
  fs.realpath(filePath, (realPathError, realPath) => {
    if (realPathError) return send(req, res, 404, "Page not found");
    if (!isInsidePublic(realPath)) return send(req, res, 403, "Forbidden");
    fs.readFile(realPath, (readError, content) => {
      if (readError) return send(req, res, 404, "Page not found");
      const type = MIME_TYPES[path.extname(realPath).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type, "Content-Length": content.length });
      res.end(req.method === "HEAD" ? undefined : content);
    });
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/api/quote" && req.method === "POST") {
    req.resume();
    return send(req, res, 503, JSON.stringify({ ok: false, error: "Enquiries are not enabled on this preview." }), MIME_TYPES[".json"]);
  }
  if (req.url === "/health" && (req.method === "GET" || req.method === "HEAD")) {
    return send(req, res, 200, JSON.stringify({ ok: true }), MIME_TYPES[".json"]);
  }
  if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res);
  res.writeHead(405, { Allow: "GET, HEAD" });
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Catering site running on port ${PORT}`);
});
