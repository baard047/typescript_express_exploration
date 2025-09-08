import { Router, Request, Response } from "express";
import { taskService } from "./task.service";
import { userService } from "@user/user.service";
import { HttpError } from "@utils/errors";
import { validate } from "@/middleware/validator";
import { User } from "@user/user.types";

import {
  CreateTaskSchema,
  DeleteTaskSchema,
  GetTaskSchema,
  GetTasksSchema,
  UpdateTaskSchema,
} from "./task.schema";

import {
  CreateTaskInput,
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTaskRequest,
  GetTasksRequest,
  Task,
  UpdateTaskInput,
  UpdateTaskRequest,
} from "./task.types";

const router = Router();

// Create a new task
router.post(
  "/",
  validate(CreateTaskSchema),
  async (req: CreateTaskRequest, res: Response<Task>) => {
    const userInput: CreateTaskInput = req.body;
    // Verify user exists
    const user: User | null = await userService.getUserById(userInput.userId);
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    const task: Task = await taskService.createTask(userInput);
    return res.status(201).json(task);
  }
);

// Get all tasks
router.get(
  "/",
  validate(GetTasksSchema),
  async (req: GetTasksRequest, res: Response<Task[]>) => {
    const { completed, userId } = req.query;

    //TODO: rework this logic, pass query params to service directly
    if (completed != undefined) {
      const tasks: Task[] = await taskService.getTasksByStatus(completed);
      return res.json(tasks);
    }

    if (userId) {
      const tasks: Task[] = await taskService.getTasksByUserId(userId);
      return res.json(tasks);
    }

    const tasks: Task[] = await taskService.getAllTasks();
    return res.json(tasks);
  }
);

// Get task by ID
router.get(
  "/:id",
  validate(GetTaskSchema),
  async (req: GetTaskRequest, res: Response<Task>) => {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      throw new HttpError("Task not found", 404);
    }

    return res.json(task);
  }
);

// Update task
router.put(
  "/:id",
  validate(UpdateTaskSchema),
  async (req: UpdateTaskRequest, res: Response<Task>) => {
    const { title, description, completed }: UpdateTaskInput = req.body;

    const existingTask: Task | null = await taskService.getTaskById(
      req.params.id
    );
    if (!existingTask) {
      throw new HttpError("Task not found", 404);
    }

    const updatedTask = await taskService.updateTask(req.params.id, {
      title: title ?? existingTask.title,
      description: description ?? existingTask.description ?? undefined,
      completed: completed ?? existingTask.completed,
    });

    return res.json(updatedTask);
  }
);

// Delete task
router.delete(
  "/:id",
  validate(DeleteTaskSchema),
  async (req: DeleteTaskRequest, res: Response<void>) => {
    const existingTask: Task | null = await taskService.getTaskById(
      req.params.id
    );
    if (!existingTask) {
      throw new HttpError("Task not found", 404);
    }

    await taskService.deleteTask(req.params.id);
    return res.status(204).send();
  }
);

export default router;
