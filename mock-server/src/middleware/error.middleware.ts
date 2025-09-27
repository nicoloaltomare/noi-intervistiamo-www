import express from 'express';
import { ErrorResponse } from '../models';
import { ValidationError } from './validation.middleware';

// Custom error classes
export class NotFoundError extends Error {
  public statusCode: number = 404;
  public code: string = 'NOT_FOUND';

  constructor(message: string = 'Risorsa non trovata') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  public statusCode: number = 401;
  public code: string = 'UNAUTHORIZED';

  constructor(message: string = 'Accesso non autorizzato') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  public statusCode: number = 403;
  public code: string = 'FORBIDDEN';

  constructor(message: string = 'Accesso vietato') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  public statusCode: number = 409;
  public code: string = 'CONFLICT';

  constructor(message: string = 'Conflitto risorsa') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class BadRequestError extends Error {
  public statusCode: number = 400;
  public code: string = 'BAD_REQUEST';

  constructor(message: string = 'Richiesta non valida') {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class InternalServerError extends Error {
  public statusCode: number = 500;
  public code: string = 'INTERNAL_SERVER_ERROR';

  constructor(message: string = 'Errore interno del server') {
    super(message);
    this.name = 'InternalServerError';
  }
}

// Error logging utility
function logError(error: Error, req: express.Request) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || 'Unknown';

  console.error(`[${timestamp}] ERROR ${method} ${url}`);
  console.error(`User-Agent: ${userAgent}`);
  console.error(`IP: ${ip}`);
  console.error(`Error: ${error.name}: ${error.message}`);

  if (error.stack) {
    console.error(`Stack trace: ${error.stack}`);
  }

  // In production, you might want to send this to a logging service
  // like Winston, LogRocket, Sentry, etc.
}

// Main error handling middleware
export function errorHandler(
  error: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // Log the error
  logError(error, req);

  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'Si è verificato un errore imprevisto';
  let details: any = undefined;

  // Handle different types of errors
  if (error instanceof ValidationError) {
    statusCode = 400;
    errorCode = error.code;
    message = error.message;
    details = { field: error.field };
  } else if (error instanceof NotFoundError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
  } else if (error instanceof UnauthorizedError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
  } else if (error instanceof ForbiddenError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
  } else if (error instanceof BadRequestError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
  } else if (error.name === 'MulterError') {
    // Handle Multer file upload errors
    statusCode = 400;
    errorCode = 'FILE_UPLOAD_ERROR';

    switch ((error as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Dimensione file troppo grande';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Troppi file caricati';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Campo file inaspettato';
        break;
      default:
        message = 'Errore caricamento file';
    }
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    // Handle JSON parsing errors
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'JSON non valido nel corpo della richiesta';
  } else if (error.name === 'CastError') {
    // Handle database casting errors (e.g., invalid ObjectId)
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Formato ID non valido';
  }

  // Create error response
  const errorResponse = {
    error: errorCode,
    message,
    details: process.env.NODE_ENV === 'development' ? details || error.stack : details
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
}

// 404 handler for unmatched routes
export function notFoundHandler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const errorResponse = {
    error: 'NOT_FOUND',
    message: `Rotta ${req.method} ${req.originalUrl} non trovata`
  };

  res.status(404).json(errorResponse);
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Health check for error handling
export function healthCheck(req: express.Request, res: express.Response) {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'OK',
    uptime: `${Math.floor(uptime)}s`,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
}