import { prisma } from "@lib/prisma";
import { CreateUserInput, UpdateUserInput, User, UserWithTasks } from "@types";

export class UserService {
  async createUser(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserWithTasks(id: string): Promise<UserWithTasks | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userService = new UserService();

