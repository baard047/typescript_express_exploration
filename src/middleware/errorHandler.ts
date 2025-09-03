import { HttpError } from "@utils/errors";
import { logger } from "@utils/logger";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.error(
    `received an error ${err.message} while processing ${req.method} ${req.url}`
  );

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Default error response
  res.status(500).json({
    error: "Internal Server Error",
    statusCode: 500,
  });
};
