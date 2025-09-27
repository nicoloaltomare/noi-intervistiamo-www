import express from 'express';
import { ErrorResponse } from '../models';

// Custom validation error class
export class ValidationError extends Error {
  public field: string;
  public code: string;

  constructor(field: string, message: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.field = field;
    this.code = code;
    this.name = 'ValidationError';
  }
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (Italian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+39|0039|39)?[ -]?([0-9]{2,4})[ -]?([0-9]{6,8})$/;
  return phoneRegex.test(phone);
}

// Password strength validation
export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// Date validation
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// File type validation
export function isValidFileType(mimetype: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimetype);
}

// Generic field validators
export const validators = {
  required: (value: any, fieldName: string) => {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(fieldName, `${fieldName} è obbligatorio`);
    }
  },

  email: (email: string, fieldName: string = 'email') => {
    if (email && !isValidEmail(email)) {
      throw new ValidationError(fieldName, 'Formato email non valido');
    }
  },

  phone: (phone: string, fieldName: string = 'phone') => {
    if (phone && !isValidPhone(phone)) {
      throw new ValidationError(fieldName, 'Formato numero di telefono non valido');
    }
  },

  password: (password: string, fieldName: string = 'password') => {
    if (password && !isValidPassword(password)) {
      throw new ValidationError(
        fieldName,
        'La password deve essere di almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola e un numero'
      );
    }
  },

  date: (dateString: string, fieldName: string) => {
    if (dateString && !isValidDate(dateString)) {
      throw new ValidationError(fieldName, 'Formato data non valido');
    }
  },

  minLength: (value: string, minLength: number, fieldName: string) => {
    if (value && value.length < minLength) {
      throw new ValidationError(fieldName, `${fieldName} deve essere di almeno ${minLength} caratteri`);
    }
  },

  maxLength: (value: string, maxLength: number, fieldName: string) => {
    if (value && value.length > maxLength) {
      throw new ValidationError(fieldName, `${fieldName} non deve superare i ${maxLength} caratteri`);
    }
  },

  oneOf: (value: any, options: any[], fieldName: string) => {
    if (value && !options.includes(value)) {
      throw new ValidationError(fieldName, `${fieldName} deve essere uno tra: ${options.join(', ')}`);
    }
  },

  arrayNotEmpty: (array: any[], fieldName: string) => {
    if (!Array.isArray(array) || array.length === 0) {
      throw new ValidationError(fieldName, `${fieldName} deve essere un array non vuoto`);
    }
  },

  positiveNumber: (value: number, fieldName: string) => {
    if (typeof value === 'number' && value <= 0) {
      throw new ValidationError(fieldName, `${fieldName} deve essere un numero positivo`);
    }
  },

  fileSize: (size: number, maxSize: number, fieldName: string = 'file') => {
    if (size > maxSize) {
      throw new ValidationError(fieldName, `La dimensione del file non deve superare i ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
  }
};

// Validation middleware factory
export function validateBody(validationRules: { [key: string]: ((value: any, fieldName: string) => void)[] }) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const errors: { field: string; message: string }[] = [];

      Object.keys(validationRules).forEach(fieldName => {
        const rules = validationRules[fieldName];
        const fieldValue = req.body[fieldName];

        rules.forEach(rule => {
          try {
            rule(fieldValue, fieldName);
          } catch (error) {
            if (error instanceof ValidationError) {
              errors.push({
                field: error.field,
                message: error.message
              });
            }
          }
        });
      });

      if (errors.length > 0) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Validazione fallita',
          details: errors
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Query parameter validation middleware
export function validateQuery(validationRules: { [key: string]: ((value: any, fieldName: string) => void)[] }) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const errors: { field: string; message: string }[] = [];

      Object.keys(validationRules).forEach(fieldName => {
        const rules = validationRules[fieldName];
        const fieldValue = req.query[fieldName];

        rules.forEach(rule => {
          try {
            rule(fieldValue, fieldName);
          } catch (error) {
            if (error instanceof ValidationError) {
              errors.push({
                field: error.field,
                message: error.message
              });
            }
          }
        });
      });

      if (errors.length > 0) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Validazione parametri query fallita',
          details: errors
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Authentication middleware
export function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: 'MISSING_TOKEN',
      message: 'Token di autorizzazione richiesto'
    });
  }

  // In a real app, validate the token here
  // For now, just check if it starts with 'mock_token_'
  if (!token.startsWith('mock_token_')) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token di autorizzazione non valido'
    });
  }

  // Add user info to request object
  (req as any).user = {
    id: '1', // Mock user ID
    role: 'admin'
  };

  next();
}

// Rate limiting middleware (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    const clientData = requestCounts.get(clientId);

    if (!clientData || clientData.resetTime < windowStart) {
      requestCounts.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Troppe richieste, riprova più tardi'
      });
    }

    clientData.count++;
    next();
  };
}