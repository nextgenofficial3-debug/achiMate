import { assertAllowedUrl, resolveUrl, safeFilename } from '../utils/url.js';
import { fetchWithTimeout, readTextLimited } from '../utils/http.js';
import { HttpError } from '../utils/errors.js';

const mediaTypes = {
  video: ['mp4', 'webm', 'mov', 'm4v', 'm3u8'],
  audio: ['mp3', 'm4a', 'wav', 'ogg', 'aac'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']
};

const contentTypeMap = [
  ['video/', 'video'],
  ['audio/', 'audio'],
  ['image/', 'image']
];

export async function analyzeUrl({ url, preferredType = 'auto', quality = 'auto' } = {}) {
  const sourceUrl = assertAllowedUrl(url);
  const head = await fetchHeadOrGet(sourceUrl);
  const contentType = head.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() || '';
  const title = new URL(sourceUrl).hostname;

  if (isMediaContentType(contentType) || mediaTypeFromExtension(sourceUrl)) {
    const type = typeFromContentType(contentType) || mediaTypeFromExtension(sourceUrl) || normalizePreferred(preferredType);
    return {
      id: createId(),
      sourceUrl,
      title,
      extractor: 'direct-file',
      options: [buildOption({ url: sourceUrl, type, contentType, quality, title })]
    };
  }

  if (!contentType.includes('text/html') && contentType) {
    throw new HttpError(415, `Unsupported content type: ${contentType}`);
  }

  const page = await fetchWithTimeout(sourceUrl, { headers: { Accept: 'text/html,*/*' } });
  if (!page.ok) throw new HttpError(page.status, `Source returned HTTP ${page.status}`);
  const html = await readTextLimited(page, 2_000_000);
  const extracted = extractFromHtml(html, sourceUrl, preferredType, quality);
  if (!extracted.options.length) {
    throw new HttpError(422, 'No downloadable public media was discovered on this page.');
  }
  return extracted;
}

async function fetchHeadOrGet(url) {
  const head = await fetchWithTimeout(url, { method: 'HEAD' }).catch(() => null);
  if (head?.ok || (head && head.status < 500)) return head;
  return fetchWithTimeout(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
}

function extractFromHtml(html, sourceUrl, preferredType, quality) {
  const pageTitle = firstMatch(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)?.trim() ||
    new URL(sourceUrl).hostname;
  const candidates = [];

  findMetaContent(html, ['og:video', 'og:video:url', 'twitter:player:stream']).forEach(value => addCandidate(candidates, sourceUrl, value, 'video', pageTitle, quality));
  findMetaContent(html, ['og:audio']).forEach(value => addCandidate(candidates, sourceUrl, value, 'audio', pageTitle, quality));
  findMetaContent(html, ['og:image', 'twitter:image']).forEach(value => addCandidate(candidates, sourceUrl, value, 'image', pageTitle, quality));

  findAttributeValues(html, ['video', 'source'], 'src').forEach(value => addCandidate(candidates, sourceUrl, value, 'video', pageTitle, quality));
  findAttributeValues(html, ['audio', 'source'], 'src').forEach(value => addCandidate(candidates, sourceUrl, value, 'audio', pageTitle, quality));
  findAttributeValues(html, ['img'], 'src').slice(0, 20).forEach(value => addCandidate(candidates, sourceUrl, value, 'image', pageTitle, quality));
  findAttributeValues(html, ['a'], 'href').forEach(href => {
    const absolute = resolveUrl(sourceUrl, href);
    const type = absolute ? mediaTypeFromExtension(absolute) : null;
    if (type) addCandidate(candidates, sourceUrl, href, type, pageTitle, quality);
  });

  const preferred = normalizePreferred(preferredType);
  const options = dedupe(candidates)
    .filter(option => preferred === 'auto' || option.type === preferred)
    .slice(0, 24);

  return {
    id: createId(),
    sourceUrl,
    title: pageTitle,
    extractor: 'html-media-tags',
    options
  };
}

function addCandidate(candidates, baseUrl, rawUrl, type, title, quality, contentType = '') {
  const url = resolveUrl(baseUrl, rawUrl);
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return;
  candidates.push(buildOption({ url, type, contentType, quality, title }));
}

function buildOption({ url, type, contentType = '', quality = 'auto', title = '' }) {
  const extension = extensionFromUrl(url);
  return {
    id: createId(),
    url,
    type,
    title,
    filename: safeFilename(title || new URL(url).hostname, extension || type),
    format: extension || contentType.split('/')[1] || 'source',
    quality: quality === 'auto' ? inferQuality(url, type) : quality,
    contentType
  };
}

function firstMatch(text, regex) {
  const match = text.match(regex);
  return match ? decodeHtml(match[1]) : '';
}

function findMetaContent(html, names) {
  const values = [];
  const metaRegex = /<meta\b[^>]*>/gi;
  for (const [tag] of html.matchAll(metaRegex)) {
    const key = getAttr(tag, 'property') || getAttr(tag, 'name');
    if (key && names.includes(key.toLowerCase())) {
      const content = getAttr(tag, 'content');
      if (content) values.push(content);
    }
  }
  return values;
}

function findAttributeValues(html, tags, attr) {
  const values = [];
  const tagRegex = new RegExp(`<(${tags.join('|')})\\b[^>]*>`, 'gi');
  for (const [tag] of html.matchAll(tagRegex)) {
    const value = getAttr(tag, attr);
    if (value) values.push(value);
  }
  return values;
}

function getAttr(tag, name) {
  const regex = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i');
  return decodeHtml(tag.match(regex)?.[1] || '');
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function dedupe(options) {
  const seen = new Set();
  return options.filter(option => {
    if (seen.has(option.url)) return false;
    seen.add(option.url);
    return true;
  });
}

function isMediaContentType(contentType) {
  return contentTypeMap.some(([prefix]) => contentType.startsWith(prefix));
}

function typeFromContentType(contentType) {
  return contentTypeMap.find(([prefix]) => contentType.startsWith(prefix))?.[1] || null;
}

function extensionFromUrl(url) {
  return (new URL(url).pathname.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
}

function mediaTypeFromExtension(url) {
  const ext = extensionFromUrl(url);
  return Object.entries(mediaTypes).find(([_type, exts]) => exts.includes(ext))?.[0] || null;
}

function normalizePreferred(value) {
  return ['video', 'audio', 'image'].includes(value) ? value : 'auto';
}

function inferQuality(url, type) {
  if (type === 'image') return 'source';
  const path = new URL(url).pathname;
  return path.match(/(2160p|1440p|1080p|720p|480p|360p)/i)?.[1] || 'source';
}
