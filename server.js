// Minimal static file server with a quote-request endpoint. No dependencies.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

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

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": MIME_TYPES[".json"] });
  res.end(JSON.stringify(body));
}

function handleQuote(req, res) {
  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 1e5) req.destroy();
  });
  req.on("end", () => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return sendJson(res, 400, { ok: false, error: "Invalid request." });
    }
    if (!data.name || !data.email) {
      return sendJson(res, 400, { ok: false, error: "Name and email are required." });
    }
    // Demo only: requests are logged. Hook up email or a database here later.
    console.log("New quote request:", JSON.stringify(data));
    sendJson(res, 200, { ok: true });
  });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  let filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  if (urlPath.endsWith("/")) filePath = path.join(filePath, "index.html");

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": MIME_TYPES[".html"] });
      return res.end("<h1>Page not found</h1><p><a href='/'>Back home</a></p>");
    }
    const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/quote") return handleQuote(req, res);
  if (req.method === "GET" && req.url === "/health") return sendJson(res, 200, { ok: true });
  if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res);
  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Catering site running on port ${PORT}`);
});
