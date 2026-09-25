import { jest } from '@jest/globals';
import request from 'supertest';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGO_URI = 'mongodb://localhost:27017/safar_test';
process.env.GEMINI_API_KEY = 'test_key';
process.env.CORS_ORIGIN = 'http://localhost:3000';

const mockAiResult = {
  summary: 'Scenic 3-day road trip from Delhi to Manali by bus',
  modeRecommendation: {
    chosen: 'bus',
    reason: 'Best fit for ₹12,000 for 4 people with comfortable overnight Volvo',
  },
  route: [
    {
      from: 'Delhi',
      to: 'Chandigarh',
      state: 'Delhi → Haryana → Punjab',
      km: 245,
      hours: 5,
      note: 'Halt for breakfast at Murthal',
    },
    {
      from: 'Chandigarh',
      to: 'Manali',
      state: 'Punjab → Himachal Pradesh',
      km: 310,
      hours: 8,
      note: 'Scenic mountain climb along Beas river',
    },
  ],
  costs: [
    { item: 'Bus tickets (onward+return)', min: 2400, max: 3200 },
    { item: 'Hotel stays (2 nights)', min: 4000, max: 6000 },
    { item: 'Food & local transit', min: 2000, max: 3000 },
  ],
  totalCost: { min: 8400, max: 12200 },
  perPersonCost: { min: 2100, max: 3050 },
  dayPlan: [
    { day: 1, title: 'Delhi to Manali Overnight', details: 'Board Volvo bus at Kashmiri Gate.' },
    { day: 2, title: 'Old Manali & Hadimba Temple', details: 'Check in, explore cafes and local market.' },
    { day: 3, title: 'Solang Valley & Return', details: 'Visit Solang Valley, board evening return bus.' },
  ],
  checklist: ['Warm jacket', 'ID proofs', 'Power bank', 'Motion sickness tablets'],
  tips: ['Book HRTC or HPTDC Volvos in advance for reliable timing.'],
};

const mockGenerate = jest.fn().mockImplementation(async () => mockAiResult);

// Mock Gemini Service
jest.unstable_mockModule('../src/services/gemini.service.js', () => ({
  generatePlanWithGemini: mockGenerate,
}));

// Mock Trip Service
jest.unstable_mockModule('../src/services/trip.service.js', () => ({
  createTrip: jest.fn(async (form, plan) => ({
    tripId: '67f0a1b2c3d4e5f6a7b8c9d0',
    ...plan,
    shareId: 'aB3xKm9Q',
    form,
  })),
  findTripById: jest.fn(async (id) => {
    if (id === '67f0a1b2c3d4e5f6a7b8c9d0') {
      return {
        tripId: '67f0a1b2c3d4e5f6a7b8c9d0',
        ...mockAiResult,
        shareId: 'aB3xKm9Q',
      };
    }
    return null;
  }),
  findTripByShareId: jest.fn(async (shareId) => {
    if (shareId === 'aB3xKm9Q') {
      return {
        tripId: '67f0a1b2c3d4e5f6a7b8c9d0',
        ...mockAiResult,
        shareId: 'aB3xKm9Q',
      };
    }
    return null;
  }),
  updateTripWithNewPlan: jest.fn(async (id, newPlan) => ({
    tripId: id,
    ...newPlan,
    shareId: 'aB3xKm9Q',
  })),
  findUserTrips: jest.fn(async () => []),
  saveTripForUser: jest.fn(async (id, userId) => ({
    tripId: id,
    userId,
    ...mockAiResult,
    shareId: 'aB3xKm9Q',
  })),
  deleteTripForUser: jest.fn(async () => true),
}));

// Dynamically import app after mocks
const { default: app } = await import('../src/server.js');

describe('Safar API Test Suite', () => {
  const validPlanBody = {
    tripType: 'friends',
    origin: 'Delhi',
    destination: 'Manali',
    days: 3,
    travellers: 4,
    luggage: 'medium',
    budget: 12000,
    transportMode: 'bus',
  };

  describe('GET /api/health', () => {
    it('returns status ok and db state', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('db');
    });
  });

  describe('POST /api/plan', () => {
    it('returns 200 with valid body and exact frontend contract', async () => {
      const res = await request(app)
        .post('/api/plan')
        .send(validPlanBody);

      expect(res.status).toBe(200);
      // Key-by-key frontend contract assertion
      expect(res.body).toHaveProperty('tripId');
      expect(res.body).toHaveProperty('summary');
      expect(res.body).toHaveProperty('modeRecommendation');
      expect(res.body.modeRecommendation).toHaveProperty('chosen');
      expect(res.body.modeRecommendation).toHaveProperty('reason');
      expect(res.body).toHaveProperty('route');
      expect(Array.isArray(res.body.route)).toBe(true);
      expect(res.body).toHaveProperty('costs');
      expect(Array.isArray(res.body.costs)).toBe(true);
      expect(res.body).toHaveProperty('totalCost');
      expect(res.body).toHaveProperty('perPersonCost');
      expect(res.body).toHaveProperty('dayPlan');
      expect(Array.isArray(res.body.dayPlan)).toBe(true);
      expect(res.body).toHaveProperty('checklist');
      expect(Array.isArray(res.body.checklist)).toBe(true);
      expect(res.body).toHaveProperty('tips');
      expect(Array.isArray(res.body.tips)).toBe(true);
      expect(res.body).toHaveProperty('shareId');
    });

    it('rejects invalid budget (e.g. 50 < 500) with 400 VALIDATION_FAILED', async () => {
      const res = await request(app)
        .post('/api/plan')
        .send({ ...validPlanBody, budget: 50 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('rejects days = 0 with 400 VALIDATION_FAILED', async () => {
      const res = await request(app)
        .post('/api/plan')
        .send({ ...validPlanBody, days: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('rejects identical origin and destination with 400 VALIDATION_FAILED', async () => {
      const res = await request(app)
        .post('/api/plan')
        .send({ ...validPlanBody, destination: 'Delhi' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('returns 502 AI_BAD_OUTPUT if Gemini returns garbage', async () => {
      const err = new Error('AI output failed schema validation after retry');
      err.code = 'AI_BAD_OUTPUT';
      mockGenerate.mockRejectedValueOnce(err);

      const res = await request(app)
        .post('/api/plan')
        .send(validPlanBody);

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('AI_BAD_OUTPUT');
    });
  });

  describe('GET /api/share/:shareId', () => {
    it('returns 200 with saved trip for valid shareId', async () => {
      const res = await request(app).get('/api/share/aB3xKm9Q');
      expect(res.status).toBe(200);
      expect(res.body.shareId).toBe('aB3xKm9Q');
      expect(res.body.tripId).toBe('67f0a1b2c3d4e5f6a7b8c9d0');
    });

    it('returns 404 NOT_FOUND for unknown shareId', async () => {
      const res = await request(app).get('/api/share/nonExistent');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/trips/:id', () => {
    it('returns 200 with saved trip', async () => {
      const res = await request(app).get('/api/trips/67f0a1b2c3d4e5f6a7b8c9d0');
      expect(res.status).toBe(200);
      expect(res.body.tripId).toBe('67f0a1b2c3d4e5f6a7b8c9d0');
    });

    it('returns 404 NOT_FOUND for unknown id', async () => {
      const res = await request(app).get('/api/trips/unknownId');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
