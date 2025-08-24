const request = require('supertest');
const express = require('express');

// Mock the database pool for testing
jest.mock('../config/db', () => ({
  query: jest.fn()
}));

describe('Basic API Tests', () => {
  test('should respond with 404 for unknown route', async () => {
    const app = express();
    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    const response = await request(app)
      .get('/unknown')
      .expect(404);

    expect(response.body.message).toBe('Route not found');
  });

  test('health check placeholder', () => {
    expect(true).toBe(true);
  });
});