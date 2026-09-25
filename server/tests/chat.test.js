import { jest } from '@jest/globals';
import request from 'supertest';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5002';
process.env.GEMINI_API_KEY = 'test_key';
process.env.CORS_ORIGIN = 'http://localhost:3000';

const mockChatReply = 'Namaste! Manali trip ke liye jackets aur snow boots zaroor leke jana.';
const mockChatWithSafarAI = jest.fn().mockImplementation(async () => mockChatReply);

// Mock chat service
jest.unstable_mockModule('../src/services/chat.service.js', () => ({
  chatWithSafarAI: mockChatWithSafarAI,
}));

// Mock Trip Service so mongoose doesn't need to connect during tests
jest.unstable_mockModule('../src/services/trip.service.js', () => ({
  createTrip: jest.fn(),
  findTripById: jest.fn(),
  findTripByShareId: jest.fn(),
  updateTripWithNewPlan: jest.fn(),
  findUserTrips: jest.fn(),
  saveTripForUser: jest.fn(),
  deleteTripForUser: jest.fn(),
}));

const { default: app } = await import('../src/server.js');

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with reply for a valid conversation', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        messages: [
          { role: 'user', content: 'Manali me Dec me kya kapnu?' },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply');
    expect(res.body.reply).toBe(mockChatReply);
    expect(mockChatWithSafarAI).toHaveBeenCalledWith(
      [{ role: 'user', content: 'Manali me Dec me kya kapnu?' }],
      undefined,
      { apiKey: null }
    );
  });

  it('should allow assistant messages in history longer than 1000 characters without error', async () => {
    const longAssistantReply = 'Namaste! '.repeat(200); // 1800 characters
    const res = await request(app)
      .post('/api/chat')
      .send({
        messages: [
          { role: 'user', content: 'Manali ka plan batao' },
          { role: 'assistant', content: longAssistantReply },
          { role: 'user', content: '10 din ka plan 25000 me manali' },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply');
  });

  it('should pass client API key and tripContext to chat service if provided', async () => {
    const tripContext = { origin: 'Delhi', destination: 'Manali', days: 3, budget: 15000 };
    const res = await request(app)
      .post('/api/chat')
      .set('x-gemini-api-key', 'AIzaSyTestUserCustomKey123456789')
      .send({
        messages: [
          { role: 'user', content: 'Budget kaisa divide karein?' },
        ],
        tripContext,
      });

    expect(res.status).toBe(200);
    expect(mockChatWithSafarAI).toHaveBeenCalledWith(
      [{ role: 'user', content: 'Budget kaisa divide karein?' }],
      tripContext,
      { apiKey: 'AIzaSyTestUserCustomKey123456789' }
    );
  });

  it('should return 400 VALIDATION_FAILED if more than 20 messages are sent', async () => {
    const messages = Array.from({ length: 21 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i + 1}`,
    }));
    // ensure last is user
    messages[20].role = 'user';

    const res = await request(app)
      .post('/api/chat')
      .send({ messages });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('should return 400 VALIDATION_FAILED if last message is not from user', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there' },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('should return 400 VALIDATION_FAILED for empty messages array', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ messages: [] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });
});
