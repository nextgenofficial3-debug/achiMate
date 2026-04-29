export class HttpError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function sendError(res, error) {
  const status = Number(error.status || 500);
  if (res.headersSent) {
    res.end();
    return;
  }
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    error: {
      message: error.message || 'Internal server error',
      status,
      details: error.details
    }
  }));
}
