import { HttpError } from './errors.js';

export function assertAllowedUrl(value) {
  if (!value || typeof value !== 'string') throw new HttpError(400, 'URL is required');
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new HttpError(400, 'Invalid URL');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new HttpError(400, 'Only HTTP and HTTPS URLs are supported');
  }
  if (isPrivateHostname(parsed.hostname)) {
    throw new HttpError(400, 'Private and local network URLs are blocked');
  }
  return parsed.href;
}

export function resolveUrl(base, value) {
  if (!value) return null;
  try {
    return assertAllowedUrl(new URL(value, base).href);
  } catch {
    return null;
  }
}

export function safeFilename(name, extension = 'bin') {
  const clean = decodeURIComponent(String(name || 'achimate-media'))
    .replace(/\.[a-z0-9]{2,5}$/i, '')
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'achimate-media';
  const ext = String(extension || 'bin').replace(/[^a-z0-9]/gi, '').slice(0, 8) || 'bin';
  return `${clean}.${ext}`;
}

function isPrivateHostname(hostname) {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local')) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const parts = host.split('.').map(Number);
    return parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 169 && parts[1] === 254) ||
      parts[0] === 0;
  }
  return false;
}
