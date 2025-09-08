import { z } from "zod";
import { Request } from "express";
import {
  CreateUserSchema,
  DeleteUserSchema,
  GetUserSchema,
  UpdateUserSchema,
} from "./user.schema";

export type CreateUserRequest = Request<
  {},
  any,
  z.infer<typeof CreateUserSchema.body>
>;

export type GetUserRequest = Request<z.infer<typeof GetUserSchema.params>>;

export type UpdateUserRequest = Request<
  z.infer<typeof UpdateUserSchema.params>,
  any,
  z.infer<typeof UpdateUserSchema.body>
>;

export type DeleteUserRequest = Request<
  z.infer<typeof DeleteUserSchema.params>
>;

export type CreateUserInput = z.infer<typeof CreateUserSchema.body>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema.body>;

export type { User } from "@prisma/client";
