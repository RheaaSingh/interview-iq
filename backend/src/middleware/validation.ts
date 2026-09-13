import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({
        field: (e as any).path,
        message: e.msg,
      })),
    });
  };
}

export const authValidation = {
  register: (body: { name: string; email: string; password: string }) => {
    const errors: string[] = [];
    if (!body.name || body.name.trim().length < 2) errors.push('Name must be at least 2 characters');
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('Valid email is required');
    if (!body.password || body.password.length < 6) errors.push('Password must be at least 6 characters');
    return errors;
  },
  login: (body: { email: string; password: string }) => {
    const errors: string[] = [];
    if (!body.email) errors.push('Email is required');
    if (!body.password) errors.push('Password is required');
    return errors;
  },
};
