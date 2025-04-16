const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});

describe('Product Endpoints', () => {
  it('should fetch products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBeTruthy();
  });
});