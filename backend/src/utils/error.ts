import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  constructor(public message: string, public statusCode = 500) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const apiErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error('[tg-live-backend] Unhandled error', error);
  return res.status(500).json({ error: 'Unexpected server error' });
};
