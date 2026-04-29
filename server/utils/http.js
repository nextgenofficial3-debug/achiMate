import { HttpError } from './errors.js';

export function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

export async function readJsonBody(req, limit = 65_536) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, 'Request body is too large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON');
  }
}

export async function fetchWithTimeout(url, options = {}) {
  const { timeoutMs = 12_000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: 'follow',
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'User-Agent': 'AchiMate/1.0 (+public-media-downloader)',
        ...(fetchOptions.headers || {})
      }
    });
  } catch (error) {
    if (error.name === 'AbortError') throw new HttpError(408, 'Source request timed out');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function readTextLimited(response, maxBytes) {
  const reader = response.body?.getReader();
  if (!reader) return response.text();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) throw new HttpError(413, 'Source HTML is too large to analyze');
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}
