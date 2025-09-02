import { Router, Request, Response } from "express";
import { taskService } from "@services/taskService";
import { userService } from "@services/userService";
import { HttpError } from "@utils/errors";
import { CreateTaskInput, UpdateTaskInput } from "@types";

const router = Router();

// Create a new task
router.post("/", async (req: Request, res: Response) => {
  const { title, description, completed = false, userId }: CreateTaskInput = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new HttpError("Title is required and must be a string", 400);
  }

  if (!userId || typeof userId !== "string") {
    throw new HttpError("User ID is required", 400);
  }

  // Verify user exists
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new HttpError("User not found", 404);
  }

  const task = await taskService.createTask({
    title: title.trim(),
    description: description?.trim() || null,
    completed: Boolean(completed),
    userId,
  });

  return res.status(201).json(task);
});

// Get all tasks
router.get("/", async (req: Request, res: Response) => {
  const { completed, userId } = req.query;

  if (completed !== undefined) {
    const isCompleted = completed === "true";
    const tasks = await taskService.getTasksByStatus(isCompleted);
    return res.json(tasks);
  }

  if (userId && typeof userId === "string") {
    const tasks = await taskService.getTasksByUserId(userId);
    return res.json(tasks);
  }

  const tasks = await taskService.getAllTasks();
  return res.json(tasks);
});

// Get task by ID
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const task = await taskService.getTaskById(req.params.id);
  if (!task) {
    throw new HttpError("Task not found", 404);
  }

  return res.json(task);
});

// Update task
router.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { title, description, completed }: UpdateTaskInput = req.body;

  const existingTask = await taskService.getTaskById(req.params.id);
  if (!existingTask) {
    throw new HttpError("Task not found", 404);
  }

  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    throw new HttpError("Title must be a non-empty string", 400);
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    throw new HttpError("Completed must be a boolean", 400);
  }

  const updatedTask = await taskService.updateTask(req.params.id, {
    title: title?.trim() || existingTask.title,
    description: description !== undefined ? (description ? description.trim() : null) : existingTask.description,
    completed: completed ?? existingTask.completed,
  });

  return res.json(updatedTask);
});

// Delete task
router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const existingTask = await taskService.getTaskById(req.params.id);
  if (!existingTask) {
    throw new HttpError("Task not found", 404);
  }

  await taskService.deleteTask(req.params.id);
  return res.status(204).send();
});

export default router;

