import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import prisma from '../../lib/prisma.js';

describe('Listener Integration', { timeout: 15000 }, () => {
  let userToken: string;
  let userId: string;

  beforeEach(async () => {
    // Generate a user to authenticate requests
    const res = await request(app).post('/api/v1/auth/signup').send({
      firstName: "Listener",
      lastName: "Test",
      email: "listener@test.com",
      password: "password123",
      birthYear: "1995",
      birthMonth: "08",
      gender: "FEMALE"
    });
    userToken = res.body.data.accessToken;
    userId = res.body.data.userId;
  });

  it('should list all listeners', async () => {
    const res = await request(app).get('/api/v1/listeners');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.listeners)).toBe(true);
  });

  it('should onboard a user to becoming a listener', async () => {
    const res = await request(app)
      .post('/api/v1/listeners/onboard')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: "Test Listener",
        title: "Empathy Guide",
        bio: "Test listener bio setup. Helping you overcome things.",
        categories: ["General Check-in"],
        pricePerHour: 20,
        price30Min: 10,
        price60Min: 20,
        price120Min: 35,
        tone: ["Supportive"],
        relationalEnergy: ["Calm"],
        approach: ["Listening"]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('listenerId');
    expect(res.body.data).toHaveProperty('status');

    // The user role must have been updated to LISTENER
    const updatedUser = await prisma.user.findUnique({
      where: { email: "listener@test.com" }
    });
    expect(updatedUser?.role).toBe('LISTENER');
  });

  it('should fail onboarding if token missing', async () => {
    const res = await request(app)
      .post('/api/v1/listeners/onboard')
      .send({
        name: "Test Listener",
        title: "Empathy Guide",
        bio: "Test bio."
      });
    expect(res.status).toBe(401);
  });

  const onboardListener = async () => {
    const res = await request(app)
      .post('/api/v1/listeners/onboard')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: "Test Listener Details",
        title: "Empathy Guide",
        bio: "Test bio that meets the 50 characters minimum requirement for listener onboard validation.",
        categories: ["General Check-in"],
        pricePerHour: 20,
        price30Min: 10,
        price60Min: 20,
        price120Min: 35
      });
    return res.body.data.listenerId;
  };

  it('should get listener details', async () => {
    const listenerId = await onboardListener();
    const res = await request(app).get(`/api/v1/listeners/${listenerId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(listenerId);
    expect(res.body.data.name).toBe("Test Listener Details");
  });

  it('should return 404 for unknown listener details', async () => {
    // use a fake uuid
    const res = await request(app).get(`/api/v1/listeners/123e4567-e89b-12d3-a456-426614174000`);
    expect(res.status).toBe(404);
  });

  it('should get listener reviews', async () => {
    const listenerId = await onboardListener();
    const res = await request(app).get(`/api/v1/listeners/${listenerId}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.reviews)).toBe(true);
  });

  it('should update listener profile', async () => {
    await onboardListener();

    // Login again to get a token with the updated LISTENER role
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: "listener@test.com",
      password: "password123"
    });
    const listenerToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .patch('/api/v1/listeners/me')
      .set('Authorization', `Bearer ${listenerToken}`)
      .send({
        title: "Updated Guide Title",
        bio: "An updated bio description that is completely long enough to pass fifty characters rule."
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe("Profile updated successfully");

    // verify update
    const profile = await prisma.listenerProfile.findUnique({
      where: { userId }
    });
    expect(profile?.title).toBe("Updated Guide Title");
    expect(profile?.bio).toBe("An updated bio description that is completely long enough to pass fifty characters rule.");
  });
});
