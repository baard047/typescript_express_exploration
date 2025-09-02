import request from "supertest";
import { prisma } from "../src/lib/prisma";
import app from "../src/app";

describe("Task Routes", () => {
  let testUser: any;

  beforeAll(async () => {
    // Ensure test database is clean
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user for task tests
    const userResponse = await request(app)
      .post("/api/users")
      .send({ email: "test@example.com", name: "Test User" })
      .expect(201);

    testUser = userResponse.body;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up tasks after each test
    await prisma.task.deleteMany();
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        completed: false,
        userId: testUser.id,
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: taskData.title,
        description: taskData.description,
        completed: taskData.completed,
        userId: taskData.userId,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it("should create a task without description", async () => {
      const taskData = {
        title: "Test Task",
        userId: testUser.id,
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: taskData.title,
        description: null,
        completed: false,
        userId: taskData.userId,
      });
    });

    it("should create a completed task", async () => {
      const taskData = {
        title: "Completed Task",
        completed: true,
        userId: testUser.id,
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      expect(response.body.completed).toBe(true);
    });

    it("should return 400 if title is missing", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ userId: testUser.id })
        .expect(400);

      expect(response.body.error).toBe(
        "Title is required and must be a string"
      );
    });

    it("should return 400 if title is empty", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "", userId: testUser.id })
        .expect(400);

      expect(response.body.error).toBe(
        "Title is required and must be a string"
      );
    });

    it("should return 400 if userId is missing", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Test Task" })
        .expect(400);

      expect(response.body.error).toBe("User ID is required");
    });

    it("should return 404 if user not found", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Test Task", userId: "nonexistent-user-id" })
        .expect(404);

      expect(response.body.error).toBe("User not found");
    });
  });

  describe("GET /api/tasks", () => {
    it("should return all tasks", async () => {
      const tasks = [
        { title: "Task 1", userId: testUser.id },
        { title: "Task 2", userId: testUser.id },
      ];

      // Create tasks
      for (const task of tasks) {
        await request(app).post("/api/tasks").send(task).expect(201);
      }

      const response = await request(app).get("/api/tasks").expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe("Task 2");
      expect(response.body[1].title).toBe("Task 1");
    });

    it("should return empty array when no tasks exist", async () => {
      const response = await request(app).get("/api/tasks").expect(200);

      expect(response.body).toEqual([]);
    });

    it("should filter tasks by completion status", async () => {
      const tasks = [
        { title: "Completed Task", completed: true, userId: testUser.id },
        { title: "Incomplete Task", completed: false, userId: testUser.id },
      ];

      // Create tasks
      for (const task of tasks) {
        await request(app).post("/api/tasks").send(task).expect(201);
      }

      // Get completed tasks
      const completedResponse = await request(app)
        .get("/api/tasks?completed=true")
        .expect(200);

      expect(completedResponse.body).toHaveLength(1);
      expect(completedResponse.body[0].title).toBe("Completed Task");

      // Get incomplete tasks
      const incompleteResponse = await request(app)
        .get("/api/tasks?completed=false")
        .expect(200);

      expect(incompleteResponse.body).toHaveLength(1);
      expect(incompleteResponse.body[0].title).toBe("Incomplete Task");
    });

    it("should filter tasks by user ID", async () => {
      // Create another user
      const user2Response = await request(app)
        .post("/api/users")
        .send({ email: "user2@example.com", name: "User 2" })
        .expect(201);

      const tasks = [
        { title: "Task for User 1", userId: testUser.id },
        { title: "Task for User 2", userId: user2Response.body.id },
      ];

      // Create tasks
      for (const task of tasks) {
        await request(app).post("/api/tasks").send(task).expect(201);
      }

      // Get tasks for specific user
      const userTasksResponse = await request(app)
        .get(`/api/tasks?userId=${testUser.id}`)
        .expect(200);

      expect(userTasksResponse.body).toHaveLength(1);
      expect(userTasksResponse.body[0].title).toBe("Task for User 1");
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should return task by id", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        userId: testUser.id,
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      const taskId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toMatchObject(taskData);
      expect(response.body.id).toBe(taskId);
    });

    it("should return 404 if task not found", async () => {
      const response = await request(app)
        .get("/api/tasks/nonexistent-id")
        .expect(404);

      expect(response.body.error).toBe("Task not found");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update task", async () => {
      const taskData = {
        title: "Original Task",
        description: "Original Description",
        userId: testUser.id,
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      const taskId = createResponse.body.id;

      const updateData = {
        title: "Updated Task",
        description: "Updated Description",
        completed: true,
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updateData);
      expect(response.body.id).toBe(taskId);
      expect(response.body.userId).toBe(testUser.id);
    });

    it("should update only provided fields", async () => {
      const taskData = {
        title: "Original Task",
        description: "Original Description",
        userId: testUser.id,
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      const taskId = createResponse.body.id;

      const updateData = {
        title: "Updated Task",
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe("Updated Task");
      expect(response.body.description).toBe("Original Description");
      expect(response.body.completed).toBe(false);
    });

    it("should return 404 if task not found", async () => {
      const response = await request(app)
        .put("/api/tasks/nonexistent-id")
        .send({ title: "Updated Task" })
        .expect(404);

      expect(response.body.error).toBe("Task not found");
    });

    it("should return 400 if title is empty", async () => {
      const taskData = {
        title: "Original Task",
        userId: testUser.id,
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: "" })
        .expect(400);

      expect(response.body.error).toBe("Title must be a non-empty string");
    });

    it("should return 400 if completed is not boolean", async () => {
      const taskData = {
        title: "Original Task",
        userId: testUser.id,
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: "not-a-boolean" })
        .expect(400);

      expect(response.body.error).toBe("Completed must be a boolean");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete task", async () => {
      const taskData = {
        title: "Test Task",
        userId: testUser.id,
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      const taskId = createResponse.body.id;

      await request(app).delete(`/api/tasks/${taskId}`).expect(204);

      // Verify task is deleted
      await request(app).get(`/api/tasks/${taskId}`).expect(404);
    });

    it("should return 404 if task not found", async () => {
      const response = await request(app)
        .delete("/api/tasks/nonexistent-id")
        .expect(404);

      expect(response.body.error).toBe("Task not found");
    });
  });
});
