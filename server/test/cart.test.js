const request = require('supertest');
const app = require('../server'); // We'll need to export the app from server.js

describe('Cart API', () => {
  let authToken;
  let userId;
  let testGarmentId;
  let testVariantId;

  beforeAll(async () => {
    // This would normally set up a test database
    // For now, these are placeholder tests
  });

  beforeEach(async () => {
    // Setup test user and get auth token
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/cart/add', () => {
    it('should add item to cart with valid data', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          variant_id: 1,
          quantity: 2
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Item added to cart successfully');
      expect(response.body.data).toHaveProperty('quantity', 2);
    });

    it('should return 400 for invalid variant_id', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          variant_id: 'invalid',
          quantity: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .send({
          variant_id: 1,
          quantity: 1
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/cart/update', () => {
    it('should update cart item quantity', async () => {
      // First add an item
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          variant_id: 1,
          quantity: 1
        });

      // Then update it
      const response = await request(app)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          variant_id: 1,
          quantity: 3
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cart item updated successfully');
    });
  });

  describe('GET /api/cart', () => {
    it('should get user cart items', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cart retrieved successfully');
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('summary');
    });
  });

  describe('DELETE /api/cart/remove/:variantId', () => {
    it('should remove specific cart item', async () => {
      // First add an item
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          variant_id: 1,
          quantity: 1
        });

      // Then remove it
      const response = await request(app)
        .delete('/api/cart/remove/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item removed from cart successfully');
    });

    it('should return 400 for invalid variant ID', async () => {
      const response = await request(app)
        .delete('/api/cart/remove/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid variant ID');
    });
  });

  describe('DELETE /api/cart/clear', () => {
    it('should clear entire cart', async () => {
      const response = await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cart cleared successfully');
      expect(response.body.data).toHaveProperty('removedItems');
    });
  });

  describe('GET /api/cart/total', () => {
    it('should get cart summary', async () => {
      const response = await request(app)
        .get('/api/cart/total')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cart summary retrieved successfully');
      expect(response.body.data).toHaveProperty('total_items');
      expect(response.body.data).toHaveProperty('total_quantity');
      expect(response.body.data).toHaveProperty('total_amount');
    });
  });

  afterEach(async () => {
    // Cleanup test data
  });

  afterAll(async () => {
    // Close database connections
  });
});