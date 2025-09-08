import { Router, Request, Response } from "express";
import { userService } from "./user.service";
import { HttpError } from "@utils/errors";
import { validate } from "@/middleware/validator";

import {
  CreateUserSchema,
  DeleteUserSchema,
  GetUserSchema,
  UpdateUserSchema,
} from "./user.schema";

import {
  CreateUserInput,
  CreateUserRequest,
  DeleteUserRequest,
  GetUserRequest,
  UpdateUserInput,
  UpdateUserRequest,
  User,
} from "./user.types";

const router = Router();

// Create a new user
router.post(
  "/",
  validate(CreateUserSchema),
  async (req: CreateUserRequest, res: Response<User>) => {
    const userInput: CreateUserInput = req.body;

    // TODO: Optimize this database lookup in the future
    const existingUser: User | null = await userService.getUserByEmail(userInput.email);
    if (existingUser) {
      throw new HttpError("User with this email already exists", 409);
    }

    const user: User = await userService.createUser(userInput);

    return res.status(201).json(user);
  }
);

// Get all users
router.get("/", async (_req: Request, res: Response<User[]>) => {
  const users: User[] = await userService.getAllUsers();
  return res.json(users);
});

// Get user by ID
router.get(
  "/:id",
  validate(GetUserSchema),
  async (req: GetUserRequest, res: Response<User>) => {
    const user: User | null = await userService.getUserById(req.params.id);
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    return res.json(user);
  }
);

// Update user
router.put(
  "/:id",
  validate(UpdateUserSchema),
  async (req: UpdateUserRequest, res: Response) => {
    const { email, name }: UpdateUserInput = req.body;

    const existingUser: User | null = await userService.getUserById(
      req.params.id
    );
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

    const updatedUser: User = await userService.updateUser(req.params.id, {
      email: email ?? existingUser.email,
      name: name ?? existingUser.name ?? undefined,
    });

    return res.json(updatedUser);
  }
);

// Delete user
router.delete(
  "/:id",
  validate(DeleteUserSchema),
  async (req: DeleteUserRequest, res: Response) => {
    const existingUser: User | null = await userService.getUserById(
      req.params.id
    );
    if (!existingUser) {
      throw new HttpError("User not found", 404);
    }

    await userService.deleteUser(req.params.id);
    return res.status(204).send();
  }
);

export default router;
