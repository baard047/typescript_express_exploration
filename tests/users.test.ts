import request from "supertest";
import { prisma } from "../src/lib/prisma";
import app from "../src/app";

describe("User Routes", () => {
  beforeAll(async () => {
    // Ensure test database is clean
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        email: userData.email,
        name: userData.name,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it("should create a user without name", async () => {
      const userData = {
        email: "test@example.com",
      };

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        email: userData.email,
        name: null,
      });
    });

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({ name: "Test User" })
        .expect(400);

      expect(response.body.error).toBe(
        "Email is required and must be a string"
      );
    });

    it("should return 400 if email is empty", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({ email: "", name: "Test User" })
        .expect(400);

      expect(response.body.error).toBe(
        "Email is required and must be a string"
      );
    });

    it("should return 409 if user with email already exists", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      // Create first user
      await request(app).post("/api/users").send(userData).expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe("User with this email already exists");
    });
  });

  describe("GET /api/users", () => {
    it("should return all users", async () => {
      const users = [
        { email: "user1@example.com", name: "User 1" },
        { email: "user2@example.com", name: "User 2" },
      ];

      // Create users
      for (const user of users) {
        await request(app).post("/api/users").send(user);
      }

      const response = await request(app).get("/api/users").expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]!.email).toBe(users[0]!.email);
      expect(response.body[1]!.email).toBe(users[1]!.email);
    });

    it("should return empty array when no users exist", async () => {
      const response = await request(app).get("/api/users").expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return user by id", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      const createResponse = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      const userId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body).toMatchObject(userData);
      expect(response.body.id).toBe(userId);
    });

    it("should return 404 if user not found", async () => {
      const response = await request(app)
        .get("/api/users/nonexistent-id")
        .expect(404);

      expect(response.body.error).toBe("User not found");
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update user", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      const createResponse = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      const userId = createResponse.body.id;

      const updateData = {
        email: "updated@example.com",
        name: "Updated User",
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updateData);
      expect(response.body.id).toBe(userId);
    });

    it("should update only provided fields", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      const createResponse = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      const userId = createResponse.body.id;

      const updateData = {
        name: "Updated User",
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe("Updated User");
      expect(response.body.email).toBe("test@example.com");
    });

    it("should return 404 if user not found", async () => {
      const response = await request(app)
        .put("/api/users/nonexistent-id")
        .send({ name: "Updated User" })
        .expect(404);

      expect(response.body.error).toBe("User not found");
    });

    it("should return 409 if email conflicts with existing user", async () => {
      // Create first user
      await request(app)
        .post("/api/users")
        .send({ email: "user1@example.com", name: "User 1" })
        .expect(201);

      // Create second user
      const user2Response = await request(app)
        .post("/api/users")
        .send({ email: "user2@example.com", name: "User 2" })
        .expect(201);

      const user2Id = user2Response.body.id;

      // Try to update second user with first user's email
      const response = await request(app)
        .put(`/api/users/${user2Id}`)
        .send({ email: "user1@example.com" })
        .expect(409);

      expect(response.body.error).toBe("User with this email already exists");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete user", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      const createResponse = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(201);

      const userId = createResponse.body.id;

      await request(app).delete(`/api/users/${userId}`).expect(204);

      // Verify user is deleted
      await request(app).get(`/api/users/${userId}`).expect(404);
    });

    it("should return 404 if user not found", async () => {
      const response = await request(app)
        .delete("/api/users/nonexistent-id")
        .expect(404);

      expect(response.body.error).toBe("User not found");
    });

    it("should cascade delete user's tasks", async () => {
      // Create user
      const userResponse = await request(app)
        .post("/api/users")
        .send({ email: "test@example.com", name: "Test User" })
        .expect(201);

      const userId = userResponse.body.id;

      // Create tasks for user
      const tasks = [
        { title: "Task 1", userId },
        { title: "Task 2", userId },
      ];

      for (const task of tasks) {
        await request(app).post("/api/tasks").send(task).expect(201);
      }

      // Delete user
      await request(app).delete(`/api/users/${userId}`).expect(204);

      // Verify tasks are also deleted
      const allTasksResponse = await request(app).get("/api/tasks").expect(200);
      expect(allTasksResponse.body).toHaveLength(0);
    });
  });
});
