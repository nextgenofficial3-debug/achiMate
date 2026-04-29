import { stats } from '../services/statsService.js';
import { HttpError } from '../utils/errors.js';
import { sendJson } from '../utils/http.js';

export function getStats(req, res) {
  const expected = process.env.ADMIN_PASSWORD || 'admin123';
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (token !== expected) throw new HttpError(401, 'Invalid admin password');
  sendJson(res, {
    ...stats,
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: stats.startedAt
  });
}
