import express, { Request, Response } from "express";
import pinoHttp from "pino-http";
import userRoutes from "@routes/users";
import taskRoutes from "@routes/tasks";
import { logger } from "@utils/logger";
import { errorHandler } from "@middleware/errorHandler";

const app = express();
app.use(express.json());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return `method: ${req.method} url: ${req.url}`;
      },
      res(res) {
        return `statusCode: ${res.statusCode}`;
      },
    },
  })
);

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
