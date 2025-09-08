import { z } from "zod";

export const CreateTaskSchema = {
  body: z.object({
    title: z.string().trim().min(3),
    description: z.string().trim().optional(),
    completed: z.boolean().optional().default(false),
    userId: z.cuid(),
  }),
};

export const GetTaskSchema = {
  params: z.object({
    id: z.cuid(),
  }),
};

export const GetTasksSchema = {
  query: z.object({
    userId: z.cuid().optional(),
    completed: z.boolean().optional(),
  }),
};

export const UpdateTaskSchema = {
  params: z.object({
    id: z.cuid(),
  }),
  body: CreateTaskSchema.body.partial().omit({ userId: true }),
};

export const DeleteTaskSchema = {
  params: z.object({
    id: z.cuid(),
  }),
};
