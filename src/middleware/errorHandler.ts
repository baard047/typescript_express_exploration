import { HttpError } from "@utils/errors";
import { logger } from "@utils/logger";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

interface ErrorResponse {
  statusCode: number;
  error: string;
  issues?: any;
}

const prepareErrorResponse = (err: Error): ErrorResponse => {
  if (err instanceof HttpError) {
    return {
      statusCode: err.statusCode,
      error: err.message,
    };
  }

  if (err instanceof z.ZodError) {
    return {
      statusCode: 400,
      error: "Validation error",
      issues: z.treeifyError(err),
    };
  }

  return {
    statusCode: 500,
    error: "Internal Server Error",
  };
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  const errorResponse = prepareErrorResponse(err);

  logger.error(
    `received an error while processing ${req.method} "${req.url}": ${
      errorResponse.error
    }
    ${
      errorResponse.issues
        ? `\nissues: ${JSON.stringify(errorResponse.issues, null, 2)}`
        : ""
    }`
  );

  const { statusCode, ...responseBody } = errorResponse;
  res.status(statusCode).json(responseBody);
};
