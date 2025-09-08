import { prisma } from "@lib/prisma";
import { CreateTaskInput, Task, UpdateTaskInput } from "@types";

export class TaskService {
  async createTask(data: CreateTaskInput): Promise<Task> {
    return prisma.task.create({
      data,
    });
  }

  async getTaskById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllTasks(): Promise<Task[]> {
    return prisma.task.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
    });
  }

  async deleteTask(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id },
    });
  }

  async getTasksByStatus(completed: boolean): Promise<Task[]> {
    return prisma.task.findMany({
      where: { completed },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const taskService = new TaskService();

