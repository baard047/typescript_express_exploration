import { z } from "zod";

export const CreateUserSchema = {
  body: z.object({
    email: z.email().trim().toLowerCase(),
    name: z.string().trim().min(3).optional(),
  }),
};

export const GetUserSchema = {
  params: z.object({
    id: z.cuid(),
  }),
};

export const UpdateUserSchema = {
  params: z.object({
    id: z.cuid(),
  }),
  body: CreateUserSchema.body.partial(),
};

export const DeleteUserSchema = {
  params: z.object({
    id: z.cuid(),
  }),
};
