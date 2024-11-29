const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();

// Mock express-rate-limit
jest.mock('express-rate-limit', () => {
  return jest.fn(() => (req, res, next) => next());
});

// Store the original setInterval
const originalSetInterval = global.setInterval;
let app;

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Mock setInterval before requiring the app
    global.setInterval = jest.fn();
    
    // Now require the app
    app = require('../server');
    
    // Connect to a test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/auth-test');
  });

  afterAll(async () => {
    // Restore original setInterval
    global.setInterval = originalSetInterval;
    
    // Cleanup
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    
    // Close the server if it's running
    if (app.listen && typeof app.listen().close === 'function') {
      await new Promise(resolve => {
        app.listen().close(resolve);
      });
    }
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should not create user with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Test User'
        });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      // First create a user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'Password123!',
          name: 'Login Test'
        });

      // Then try to login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });
}); 