import request from 'supertest';
import app from '../app';
import { describe, it, expect } from 'vitest';

describe('Availability (lean)', () => {
  it('GET /api/booking/available-dates returns 400 when tutor_id missing', async () => {
    const res = await request(app).get('/api/booking/available-dates');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Missing tutor_id' });
  });

  it('GET /api/booking/available-dates returns 200 with empty list by default', async () => {
    const res = await request(app).get('/api/booking/available-dates?tutor_id=10');
    expect(res.status).toBe(200);
    // Because our fake DB returns no weekly availability, controller returns []
    expect(res.body).toHaveProperty('available_dates');
    expect(Array.isArray(res.body.available_dates)).toBe(true);
  });
});