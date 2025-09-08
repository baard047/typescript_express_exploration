import { z, ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

type Schemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate<T extends Schemas>(schema: T) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as any;
      }

      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as any;
      }

      next();
    } catch (err) {
      // forward error to centralized error handler
      next(err);
    }
  };
}
