import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const tasks = new Map<string, Task>();

const app = express();
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  return res.send("Placeholder");
});

app.post("/tasks", (req: Request, res: Response) => {
  const { title, completed = false } = req.body ?? {};
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
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
    return res.status(404).json({ error: "not found" });
  }

  return res.json(task);
});

app.put("/tasks/:id", (req: Request<{ id: string }>, res: Response) => {
  const existing = tasks.get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "not found" });
  }

  const { title, completed } = req.body ?? {};
  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ error: "title must be non-empty string" });
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed must be boolean" });
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
    return res.status(404).json({ error: "not found" });
  }
  
  return res.status(204).send();
});

// Helper to reset store in tests
export function __resetTasks() {
  tasks.clear();
}

export default app;
