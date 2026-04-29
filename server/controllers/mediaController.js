import { analyzeUrl } from '../services/extractorService.js';
import { proxyMedia } from '../services/downloadService.js';
import { stats } from '../services/statsService.js';
import { assertAllowedUrl } from '../utils/url.js';
import { readJsonBody, sendJson } from '../utils/http.js';

export async function analyzeMedia(req, res) {
  try {
    stats.analyzeRequests += 1;
    const body = await readJsonBody(req);
    const result = await analyzeUrl(body);
    sendJson(res, result);
  } catch (error) {
    stats.errors += 1;
    throw error;
  }
}

export async function downloadMedia(req, res, requestUrl) {
  try {
    stats.downloadRequests += 1;
    const url = assertAllowedUrl(requestUrl.searchParams.get('url'));
    await proxyMedia({ url, req, res, disposition: 'attachment' });
  } catch (error) {
    stats.errors += 1;
    throw error;
  }
}

export async function streamMedia(req, res, requestUrl) {
  try {
    stats.streamRequests += 1;
    const url = assertAllowedUrl(requestUrl.searchParams.get('url'));
    await proxyMedia({ url, req, res, disposition: 'inline' });
  } catch (error) {
    stats.errors += 1;
    throw error;
  }
}
