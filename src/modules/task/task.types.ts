import { z } from "zod";
import { Request } from "express";
import {
  CreateTaskSchema,
  GetTaskSchema,
  GetTasksSchema,
  UpdateTaskSchema,
  DeleteTaskSchema,
} from "./task.schema";

export type CreateTaskRequest = Request<
  {},
  any,
  z.infer<typeof CreateTaskSchema.body>
>;

export type GetTaskRequest = Request<z.infer<typeof GetTaskSchema.params>>;

export type GetTasksRequest = Request<
  {},
  any,
  any,
  z.infer<typeof GetTasksSchema.query>
>;

export type UpdateTaskRequest = Request<
  z.infer<typeof UpdateTaskSchema.params>,
  any,
  z.infer<typeof UpdateTaskSchema.body>
>;

export type DeleteTaskRequest = Request<
  z.infer<typeof DeleteTaskSchema.params>
>;

export type CreateTaskInput = z.infer<typeof CreateTaskSchema.body>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema.body>;
export type { Task } from "@prisma/client";
