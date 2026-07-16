export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  res.status(500).json({ success: false, message: 'Internal server error' });
}

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
