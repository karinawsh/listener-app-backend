import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import prisma from '../../lib/prisma.js';

describe('User Integration', { timeout: 15000 }, () => {
  let userToken: string;
  let userId: string;

  beforeEach(async () => {
    // Generate a user to authenticate requests
    const res = await request(app).post('/api/v1/auth/signup').send({
      firstName: "User",
      lastName: "Test",
      email: "user@test.com",
      password: "password123",
      birthYear: "1998",
      birthMonth: "02",
      gender: "MALE"
    });
    userToken = res.body.data.accessToken;
    userId = res.body.data.userId;
  });

  it('should get current user profile', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe(userId);
    expect(res.body.data.firstName).toBe("User");
    expect(res.body.data.email).toBe("user@test.com");
  });

  it('should update current user profile', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        firstName: "UpdatedName",
        lastName: "UpdatedLast",
        displayName: "CoolUser",
        bio: "This is a new bio"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe(userId);

    const updated = await prisma.user.findUnique({
      where: { id: userId }
    });

    expect(updated?.displayName).toBe("CoolUser");
    expect(updated?.bio).toBe("This is a new bio");
  });

  it('should prevent unauthenticated users from accessing profile', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });
});
