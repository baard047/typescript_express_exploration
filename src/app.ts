import express, { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const tasks = new Map<string, Task>();

const app = express();
app.use(express.json());

class ApplicationError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};

const errorHandler = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err.stack);
  
  if (err instanceof ApplicationError) {
    return res.status(err.statusCode).json({ 
      error: err.message,
      statusCode: err.statusCode 
    });
  }
  
  // Default error response
  res.status(500).json({ 
    error: 'Internal Server Error',
    statusCode: 500 
  });
};


app.get("/", (_req: Request, res: Response) => {
  return res.send("Placeholder");
});

app.post("/tasks", (req: Request, res: Response) => {
  const { title, completed = false } = req.body ?? {};
  if (typeof title !== "string" || !title.trim()) {
    throw new ApplicationError("title is required", 400);
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
    throw new ApplicationError("Task not found", 404);
  }

  return res.json(task);
});

app.put("/tasks/:id", (req: Request<{ id: string }>, res: Response) => {
  const existing = tasks.get(req.params.id);
  if (!existing) {
    throw new ApplicationError("Task not found", 404);
  }

  const { title, completed } = req.body ?? {};
  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    throw new ApplicationError("title must be non-empty string", 400);
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    throw new ApplicationError("completed must be boolean", 400);
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
    throw new ApplicationError("Task not found", 404);
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
