import request from 'supertest';
import app from '../app';
import { describe, it, expect } from 'vitest';

describe('Sanity routes (lean)', () => {
  it('GET /users returns 200 with an array (empty by default in test DB)', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0); // our test DB mock returns []
  });
});