import request from 'supertest';
import app, { __resetTasks } from '../src/app';

describe('Tasks API', () => {
  beforeEach(() => {
    __resetTasks();
  });

  test('creates a task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Learn TS', completed: false });
    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({ id: expect.any(String), title: 'Learn TS', completed: false })
    );
  });

  test('lists tasks', async () => {
    await request(app).post('/tasks').send({ title: 'A' });
    await request(app).post('/tasks').send({ title: 'B' });
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test('reads a single task', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Single' });
    const id = created.body.id as string;
    const res = await request(app).get(`/tasks/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  test('returns 404 for missing task', async () => {
    const res = await request(app).get('/tasks/does-not-exist');
    expect(res.status).toBe(404);
  });

  test('updates a task', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Old' });
    const id = created.body.id as string;
    const res = await request(app).put(`/tasks/${id}`).send({ title: 'New', completed: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({ id, title: 'New', completed: true })
    );
  });

  test('validates update payload', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Keep' });
    const id = created.body.id as string;
    const badTitle = await request(app).put(`/tasks/${id}`).send({ title: '' });
    expect(badTitle.status).toBe(400);
    const badCompleted = await request(app).put(`/tasks/${id}`).send({ completed: 'yes' });
    expect(badCompleted.status).toBe(400);
  });

  test('deletes a task', async () => {
    const created = await request(app).post('/tasks').send({ title: 'To delete' });
    const id = created.body.id as string;
    const del = await request(app).delete(`/tasks/${id}`);
    expect(del.status).toBe(204);
    const getAfter = await request(app).get(`/tasks/${id}`);
    expect(getAfter.status).toBe(404);
  });
});


