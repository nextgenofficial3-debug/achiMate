import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleMediaRoute } from './routes/mediaRoutes.js';
import { handleAdminRoute } from './routes/adminRoutes.js';
import { HttpError, sendError } from './utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 3000);
const clientDistDir = path.join(__dirname, '..', 'client', 'dist');
const clientSourceDir = path.join(__dirname, '..', 'client');
const clientPublicDir = path.join(__dirname, '..', 'client', 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

const server = http.createServer(async (req, res) => {
  try {
    applySecurityHeaders(res);
    if (req.method === 'OPTIONS') return sendNoContent(res);
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/media')) return handleMediaRoute(req, res, url);
    if (url.pathname.startsWith('/api/admin')) return handleAdminRoute(req, res, url);
    return serveClient(url.pathname, res);
  } catch (error) {
    sendError(res, error);
  }
});

server.listen(port, () => {
  console.log(`AchiMate running at http://localhost:${port}`);
});

function applySecurityHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Range');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'");
}

function sendNoContent(res) {
  res.writeHead(204);
  res.end();
}

async function serveClient(requestPath, res) {
  const clientDir = await directoryWithIndex();
  const normalized = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = await resolveClientFile(clientDir, normalized);
  if (!filePath) throw new HttpError(404, 'Client asset not found');
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    const body = await readFile(path.join(clientDir, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
  }
}

async function directoryWithIndex() {
  if (process.env.NODE_ENV === 'production') {
    try {
      await readFile(path.join(clientDistDir, 'index.html'));
      return clientDistDir;
    } catch {
      return clientSourceDir;
    }
  }
  return clientSourceDir;
}

async function resolveClientFile(clientDir, normalized) {
  const candidates = [
    path.normalize(path.join(clientDir, normalized)),
    path.normalize(path.join(clientPublicDir, normalized))
  ];
  for (const candidate of candidates) {
    const allowed = candidate.startsWith(clientDir) || candidate.startsWith(clientPublicDir);
    if (!allowed) throw new HttpError(403, 'Forbidden');
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  try {
    await readFile(path.join(clientDistDir, 'index.html'));
    return path.join(clientDistDir, 'index.html');
  } catch {
    return path.join(clientSourceDir, 'index.html');
  }
}
