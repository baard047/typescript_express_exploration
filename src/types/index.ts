export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface UserWithTasks extends User {
  tasks: Task[];
}

export interface CreateUserInput {
  email: string;
  name?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  completed?: boolean;
  userId: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

