import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5002';
process.env.MONGO_URI = 'mongodb://localhost:27017/safar_auth_test';
process.env.GEMINI_API_KEY = 'test_key';
process.env.JWT_SECRET = 'test_secret_key_1234567890123456789012345678901234567890123456789012';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// In-memory mock store for users and trips
const memoryUsers = [];
const memoryTrips = [];

// Mock User Model
jest.unstable_mockModule('../src/models/User.js', () => ({
  User: {
    findOne: jest.fn(async ({ email }) => {
      const user = memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }),
    create: jest.fn(async ({ name, email, passwordHash }) => {
      const newUser = {
        _id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name,
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryUsers.push(newUser);
      return newUser;
    }),
    findById: jest.fn(async (id) => {
      const user = memoryUsers.find((u) => u._id === id);
      return user || null;
    }),
    findByIdAndDelete: jest.fn(async (id) => {
      const idx = memoryUsers.findIndex((u) => u._id === id);
      if (idx >= 0) return memoryUsers.splice(idx, 1)[0];
      return null;
    }),
  },
}));

// Mock Trip Model
jest.unstable_mockModule('../src/models/Trip.js', () => ({
  Trip: {
    find: jest.fn(({ userId }) => ({
      sort: jest.fn(async () => {
        return memoryTrips.filter((t) => t.userId === userId);
      }),
    })),
    findById: jest.fn(async (id) => {
      const trip = memoryTrips.find((t) => t._id === id);
      return trip || null;
    }),
    findOneAndDelete: jest.fn(async ({ _id, userId }) => {
      const idx = memoryTrips.findIndex((t) => t._id === _id && t.userId === userId);
      if (idx >= 0) {
        return memoryTrips.splice(idx, 1)[0];
      }
      return null;
    }),
    deleteMany: jest.fn(async ({ userId }) => {
      let count = 0;
      for (let i = memoryTrips.length - 1; i >= 0; i--) {
        if (memoryTrips[i].userId === userId) {
          memoryTrips.splice(i, 1);
          count++;
        }
      }
      return { deletedCount: count };
    }),
  },
}));

// Mock Gemini Service
jest.unstable_mockModule('../src/services/gemini.service.js', () => ({
  generatePlanWithGemini: jest.fn(async () => ({
    summary: 'Test summary',
    modeRecommendation: { chosen: 'bus', reason: 'Fits budget' },
    route: [{ from: 'Delhi', to: 'Manali', state: 'HP', km: 550, hours: 12, note: '' }],
    costs: [{ item: 'Bus', min: 1000, max: 2000 }],
    totalCost: { min: 1000, max: 2000 },
    perPersonCost: { min: 1000, max: 2000 },
    dayPlan: [{ day: 1, title: 'Day 1', details: 'Travel' }],
    checklist: ['ID'],
    tips: ['Book early'],
  })),
}));

// Dynamically import server app after setting up mocks
const { default: app } = await import('../src/server.js');

describe('Auth & Authenticated Trips Test Suite', () => {
  let authToken = '';
  let testUserId = '';

  const testUserPayload = {
    name: 'Harsh Vardhan',
    email: 'harsh@example.com',
    password: 'Password123',
  };

  describe('POST /api/auth/signup', () => {
    it('creates a new user and returns 201 with JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUserPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.name).toBe(testUserPayload.name);
      expect(res.body.user.email).toBe(testUserPayload.email.toLowerCase());
      // Crucial: never return passwordHash
      expect(res.body.user).not.toHaveProperty('passwordHash');

      authToken = res.body.token;
      testUserId = res.body.user.id;
    });

    it('rejects duplicate email with 409 EMAIL_TAKEN', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUserPayload);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('EMAIL_TAKEN');
    });

    it('rejects weak password without numbers with 400 VALIDATION_FAILED', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'onlylettershere',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserPayload.email,
          password: testUserPayload.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUserPayload.email);
    });

    it('rejects incorrect password with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserPayload.email,
          password: 'WrongPassword999',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('rejects non-existent email with 401 INVALID_CREDENTIALS (same message)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current user profile with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.id).toBe(testUserId);
      expect(res.body.user.email).toBe(testUserPayload.email);
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('rejects request without token with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects request with invalid token with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_fake_token_abc');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/trips (User Trips)', () => {
    beforeAll(() => {
      // Seed two trips for testUser and one trip for another user
      memoryTrips.push(
        {
          _id: 'trip_1',
          userId: testUserId,
          form: { destination: 'Goa', tripType: 'vacation', transportMode: 'flight' },
          plan: { perPersonCost: { min: 5000, max: 8000 } },
          shareId: 'share_1',
          createdAt: new Date('2026-09-01'),
        },
        {
          _id: 'trip_2',
          userId: testUserId,
          form: { destination: 'Shimla', tripType: 'friends', transportMode: 'bus' },
          plan: { perPersonCost: { min: 2000, max: 3500 } },
          shareId: 'share_2',
          createdAt: new Date('2026-09-10'),
        },
        {
          _id: 'trip_3_other',
          userId: 'other_user_id_999',
          form: { destination: 'Jaipur', tripType: 'college', transportMode: 'train' },
          plan: { perPersonCost: { min: 1500, max: 2500 } },
          shareId: 'share_3',
          createdAt: new Date('2026-09-15'),
        }
      );
    });

    it('rejects GET /api/trips without token with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/trips');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns only own trips for authenticated user', async () => {
      const res = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);

      // Verify only summary fields returned
      const firstTrip = res.body[0];
      expect(firstTrip).toHaveProperty('tripId');
      expect(firstTrip).toHaveProperty('destination');
      expect(firstTrip).toHaveProperty('tripType');
      expect(firstTrip).toHaveProperty('transportMode');
      expect(firstTrip).toHaveProperty('perPersonCost');
      expect(firstTrip).toHaveProperty('shareId');
      expect(firstTrip).toHaveProperty('createdAt');

      // None of the trips should belong to other users
      const hasOtherUserTrip = res.body.some((t) => t.tripId === 'trip_3_other');
      expect(hasOtherUserTrip).toBe(false);
    });

    it('allows GET /api/trips/:id for own trip', async () => {
      const res = await request(app)
        .get('/api/trips/trip_1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tripId).toBe('trip_1');
    });

    it('rejects GET /api/trips/:id for another user trip with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/trips/trip_3_other')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/auth/account', () => {
    it('rejects unauthenticated request with 401 UNAUTHORIZED', async () => {
      const res = await request(app).delete('/api/auth/account');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('permanently deletes user and associated trips', async () => {
      const res = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify user trips are deleted
      const remainingUserTrips = memoryTrips.filter((t) => t.userId === testUserId);
      expect(remainingUserTrips.length).toBe(0);

      // Verify other user trip is intact
      const otherUserTrips = memoryTrips.filter((t) => t.userId === 'other_user_id_999');
      expect(otherUserTrips.length).toBe(1);
    });
  });
});
