import express, { NextFunction, Request, Response } from "express";
import pinoHttp from "pino-http";
import { v4 as uuidv4 } from "uuid";
import { HttpError } from "@utils/errors";
import { logger } from "@utils/logger";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const tasks = new Map<string, Task>();

const app = express();
app.use(express.json());
app.use(pinoHttp({ logger }));

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
    err,
    `received an error while processing %s %s`,
    req.method,
    req.url
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
  return res.send("Placeholder");
});

app.post("/tasks", (req: Request, res: Response) => {
  const { title, completed = false } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    throw new HttpError("title is required", 400);
  }

  const id = uuidv4();
  const task: Task = { id, title: title.trim(), completed: Boolean(completed) };
  tasks.set(id, task);

  return res.status(201).json(task);
});

app.get("/tasks", (_req: Request, res: Response) => {
  return res.json(Array.from(tasks.values()));
});

app.get("/tasks/:id", (req: Request<{ id: string }>, res: Response) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    throw new HttpError("Task not found", 404);
  }

  return res.json(task);
});

app.put("/tasks/:id", (req: Request<{ id: string }>, res: Response) => {
  const existing = tasks.get(req.params.id);
  if (!existing) {
    throw new HttpError("Task not found", 404);
  }

  const { title, completed } = req.body ?? {};
  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    throw new HttpError("title must be non-empty string", 400);
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    throw new HttpError("completed must be boolean", 400);
  }

  const updated: Task = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    completed: completed !== undefined ? completed : existing.completed,
  };

  tasks.set(existing.id, updated);
  return res.json(updated);
});

app.delete("/tasks/:id", (req: Request<{ id: string }>, res: Response) => {
  const deleted = tasks.delete(req.params.id);
  if (!deleted) {
    throw new HttpError("Task not found", 404);
  }

  return res.status(204).send();
});

// Helper to reset store in tests
export function __resetTasks() {
  tasks.clear();
}

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
