import { analyzeMedia, downloadMedia, streamMedia } from '../controllers/mediaController.js';
import { HttpError } from '../utils/errors.js';

export async function handleMediaRoute(req, res, url) {
  if (req.method === 'POST' && url.pathname === '/api/media/analyze') return analyzeMedia(req, res);
  if (req.method === 'GET' && url.pathname === '/api/media/download') return downloadMedia(req, res, url);
  if (req.method === 'GET' && url.pathname === '/api/media/stream') return streamMedia(req, res, url);
  throw new HttpError(404, 'Media API route not found');
}
