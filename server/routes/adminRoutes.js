import { getStats } from '../controllers/adminController.js';
import { HttpError } from '../utils/errors.js';

export async function handleAdminRoute(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/admin/stats') return getStats(req, res);
  throw new HttpError(404, 'Admin API route not found');
}
