import express, { NextFunction, Request, Response } from "express";
import pinoHttp from "pino-http";
import { HttpError } from "@utils/errors";
import { logger } from "@utils/logger";
import userRoutes from "@routes/users";
import taskRoutes from "@routes/tasks";

const app = express();
app.use(express.json());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

const errorHandler = (
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

app.get("/", (_req: Request, res: Response) => {
  return res.json({
    message: "Task Manager API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      tasks: "/api/tasks",
    },
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
