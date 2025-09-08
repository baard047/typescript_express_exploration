import { prisma } from "@lib/prisma";
import { CreateUserInput, UpdateUserInput, User } from "./user.types";

export class UserService {
  async createUser(userInput: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        email: userInput.email,
        name: userInput.name ?? null,
      },
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

  async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.name !== undefined ? { name: data.name ?? null } : {}),
      },
    });
  }

  async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userService = new UserService();
