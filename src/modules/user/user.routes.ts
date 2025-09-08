import { Router, Request, Response } from "express";
import { userService } from "./user.service";
import { HttpError } from "@utils/errors";
import { CreateUserInput, UpdateUserInput } from "@types";

const router = Router();

// Create a new user
router.post("/", async (req: Request, res: Response) => {
  const { email, name }: CreateUserInput = req.body;

  if (!email || typeof email !== "string" || !email.trim()) {
    throw new HttpError("Email is required and must be a string", 400);
  }

  // Check if user already exists
  // TODO: Optimize this database lookup in the future
  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    throw new HttpError("User with this email already exists", 409);
  }

  const user = await userService.createUser({
    email: email.trim(),
    name: name?.trim() ?? null,
  });

  return res.status(201).json(user);
});

// Get all users
router.get("/", async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  return res.json(users);
});

// Get user by ID
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    throw new HttpError("User not found", 404);
  }

  return res.json(user);
});

// Get user with tasks
router.get(
  "/:id/tasks",
  async (req: Request<{ id: string }>, res: Response) => {
    const userWithTasks = await userService.getUserWithTasks(req.params.id);
    if (!userWithTasks) {
      throw new HttpError("User not found", 404);
    }

    return res.json(userWithTasks);
  }
);

// Update user
router.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { email, name }: UpdateUserInput = req.body;

  const existingUser = await userService.getUserById(req.params.id);
  if (!existingUser) {
    throw new HttpError("User not found", 404);
  }

  // Check if email is being updated and if it conflicts with existing user
  if (email && email !== existingUser.email) {
    const userWithEmail = await userService.getUserByEmail(email);
    if (userWithEmail) {
      throw new HttpError("User with this email already exists", 409);
    }
  }

  const updatedUser = await userService.updateUser(req.params.id, {
    email: email?.trim() ?? existingUser.email,
    name: name?.trim() ?? existingUser.name ?? "",
  });

  return res.json(updatedUser);
});

// Delete user
router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const existingUser = await userService.getUserById(req.params.id);
  if (!existingUser) {
    throw new HttpError("User not found", 404);
  }

  await userService.deleteUser(req.params.id);
  return res.status(204).send();
});

export default router;
