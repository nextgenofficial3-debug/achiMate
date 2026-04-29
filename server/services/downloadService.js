import { Readable } from 'node:stream';
import { fetchWithTimeout } from '../utils/http.js';
import { safeFilename } from '../utils/url.js';
import { HttpError } from '../utils/errors.js';

export async function proxyMedia({ url, req, res, disposition }) {
  const headers = { Accept: '*/*' };
  if (req.headers.range) headers.Range = req.headers.range;
  const upstream = await fetchWithTimeout(url, { headers, timeoutMs: 30_000 });
  if (!upstream.ok && upstream.status !== 206) {
    throw new HttpError(upstream.status, `Source returned HTTP ${upstream.status}`);
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
  const contentLength = upstream.headers.get('content-length');
  const contentRange = upstream.headers.get('content-range');
  const filename = safeFilename(new URL(url).pathname.split('/').pop() || 'achimate-media', contentType.split('/')[1] || 'bin');

  const headersToSend = {
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Content-Disposition': `${disposition}; filename="${filename}"`
  };
  if (contentLength) headersToSend['Content-Length'] = contentLength;
  if (contentRange) headersToSend['Content-Range'] = contentRange;

  res.writeHead(upstream.status, headersToSend);

  if (!upstream.body) throw new HttpError(502, 'Source response did not include a body');
  Readable.fromWeb(upstream.body).pipe(res);
}
