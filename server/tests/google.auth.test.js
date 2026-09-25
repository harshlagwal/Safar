import { jest } from '@jest/globals';
import request from 'supertest';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5003';
process.env.MONGO_URI = 'mongodb://localhost:27017/safar_google_auth_test';
process.env.GEMINI_API_KEY = 'test_key';
process.env.JWT_SECRET = 'test_secret_key_1234567890123456789012345678901234567890123456789012';
process.env.GOOGLE_CLIENT_ID = 'test_google_client_id.apps.googleusercontent.com';
process.env.CORS_ORIGIN = 'http://localhost:3000';

const memoryUsers = [];

// Mock User Model
jest.unstable_mockModule('../src/models/User.js', () => ({
  User: {
    findOne: jest.fn(async (query) => {
      if (query.$or) {
        return (
          memoryUsers.find(
            (u) =>
              (u.googleId && u.googleId === query.$or[0]?.googleId) ||
              (u.email && u.email.toLowerCase() === query.$or[1]?.email?.toLowerCase())
          ) || null
        );
      }
      if (query.email) {
        return memoryUsers.find((u) => u.email.toLowerCase() === query.email.toLowerCase()) || null;
      }
      if (query.googleId) {
        return memoryUsers.find((u) => u.googleId === query.googleId) || null;
      }
      return null;
    }),
    create: jest.fn(async (data) => {
      const newUser = {
        _id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...data,
        save: jest.fn(async function () {
          return this;
        }),
      };
      memoryUsers.push(newUser);
      return newUser;
    }),
    findById: jest.fn(async (id) => {
      return memoryUsers.find((u) => u._id === id) || null;
    }),
  },
}));

// Mock Gemini Service
jest.unstable_mockModule('../src/services/gemini.service.js', () => ({
  generatePlanWithGemini: jest.fn(async () => ({})),
}));

// Mock Google Service
jest.unstable_mockModule('../src/services/google.service.js', () => ({

  verifyGoogleToken: jest.fn(async (credential) => {
    if (credential === 'valid_token_new_user') {
      return {
        sub: 'google_sub_12345',
        email: 'newgoogleuser@example.com',
        name: 'New Google User',
        picture: 'https://lh3.googleusercontent.com/a/photo1',
      };
    }
    if (credential === 'valid_token_existing_user') {
      return {
        sub: 'google_sub_67890',
        email: 'existinguser@example.com',
        name: 'Existing User',
        picture: 'https://lh3.googleusercontent.com/a/photo2',
      };
    }
    const err = new Error('Invalid token');
    err.code = 'INVALID_GOOGLE_TOKEN';
    throw err;
  }),
}));

const { default: app } = await import('../src/server.js');

describe('Google Authentication (POST /api/auth/google)', () => {
  beforeEach(() => {
    memoryUsers.length = 0;
  });

  it('creates new user and returns 200 with JWT for valid new user token', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'valid_token_new_user' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('newgoogleuser@example.com');
    expect(res.body.user.name).toBe('New Google User');

    // Verify stored user attributes
    const storedUser = memoryUsers.find((u) => u.email === 'newgoogleuser@example.com');
    expect(storedUser).toBeDefined();
    expect(storedUser.provider).toBe('google');
    expect(storedUser.isVerified).toBe(true);
    expect(storedUser.passwordHash).toBeUndefined();
  });

  it('links googleId to existing user with matching email without duplicate account', async () => {
    // Seed existing email user
    const existing = {
      _id: 'existing_user_id_1',
      name: 'Existing User',
      email: 'existinguser@example.com',
      passwordHash: 'hashed_password_xyz',
      provider: 'email',
      save: jest.fn(async function () {
        return this;
      }),
    };
    memoryUsers.push(existing);

    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'valid_token_existing_user' });

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('existing_user_id_1');
    expect(existing.googleId).toBe('google_sub_67890');
    expect(existing.isVerified).toBe(true);
    // Ensure no duplicate created
    expect(memoryUsers.length).toBe(1);
  });

  it('rejects garbage token with 401 INVALID_GOOGLE_TOKEN', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'garbage_token_xyz' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_GOOGLE_TOKEN');
  });

  it('rejects missing or empty credential with 400 VALIDATION_FAILED', async () => {
    const res1 = await request(app).post('/api/auth/google').send({});
    expect(res1.status).toBe(400);
    expect(res1.body.error.code).toBe('VALIDATION_FAILED');

    const res2 = await request(app).post('/api/auth/google').send({ credential: '   ' });
    expect(res2.status).toBe(400);
    expect(res2.body.error.code).toBe('VALIDATION_FAILED');
  });
});
