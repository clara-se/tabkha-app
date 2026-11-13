import 'dotenv/config';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect } from 'vitest';
import app from '../app.js';

const token = jwt.sign({ sub: 'u1' }, process.env.JWT_SECRET);

describe('/api/recipes', () => {
  it('rejects a missing token', async () => {
    const res = await request(app).get('/api/recipes');
    expect(res.status).toBe(401);
  });

  it('rejects an empty title', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '' });
    expect(res.status).toBe(400);
  });
});

describe('/api/auth/login', () => {
  it('rejects an injection object as the email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: 'anything' });
    expect(res.status).toBe(400);
  });
});

  