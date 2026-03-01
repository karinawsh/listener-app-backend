import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../index.js'; // The exported express app
import prisma from '../../lib/prisma.js';

describe('Auth Integration', () => {
  const testUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john.auth@example.com",
    password: "password123",
    birthYear: "1990",
    birthMonth: "05",
    gender: "MALE"
  };

  it('should sign up a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('should not allow duplicate email signup', async () => {
    await request(app).post('/api/v1/auth/signup').send(testUser);

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send(testUser);

    expect(res.status).toBe(409); // Conflict
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user', async () => {
    await request(app).post('/api/v1/auth/signup').send(testUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/v1/auth/signup').send(testUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: "wrongpassword"
      });

    expect(res.status).toBe(401); // Unauthorized
    expect(res.body.success).toBe(false);
  });
});
