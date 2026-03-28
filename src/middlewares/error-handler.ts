import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/common.types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    } as ApiResponse);
    return;
  }

  // Handle generic errors
  logger.error(`${req.method} ${req.url} - Error: ${error.message}`, {
    stack: error.stack,
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errorCode: 'INTERNAL_SERVER_ERROR',
  } as ApiResponse);
};
