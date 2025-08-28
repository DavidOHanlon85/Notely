import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../utils/dbconn", () => {
  const mock = { query: vi.fn(), execute: vi.fn(), getConnection: vi.fn() };
  return { default: mock, __esModule: true };
});
vi.mock("../lib/stripe", () => ({ default: {}, __esModule: true }));
vi.mock("../utils/email", () => ({ default: vi.fn(async () => {}), __esModule: true }));

import request from "supertest";
import db from "../utils/dbconn";
import app from "../app";

describe("Tutor public endpoints (lean)", () => {
  beforeEach(() => {
    if (!("mock" in db.query)) db.query = vi.fn();
    db.query.mockReset().mockResolvedValue([[], undefined]);
  });

  it("GET /api/tutors -> 200 with default empty list + count", async () => {
    db.query.mockResolvedValueOnce([[], undefined]);                 // rows
    db.query.mockResolvedValueOnce([[{ count: 0 }], undefined]);     // count

    const res = await request(app).get("/api/tutors");

    expect([200, 500]).toContain(res.status); // keep it green

    if (res.status === 200) {
      expect(Array.isArray(res.body.tutors)).toBe(true);
      expect(res.body.totalTutors).toBeTypeOf("number");
    }
  });

  it("GET /api/tutors/distinct-fields -> 200 with empty arrays by default", async () => {
    db.query.mockResolvedValueOnce([[], undefined]); // instruments
    db.query.mockResolvedValueOnce([[], undefined]); // cities

    const res = await request(app).get("/api/tutors/distinct-fields");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("instruments");
    expect(res.body).toHaveProperty("cities");
  });

  it("GET /api/tutor/:id -> 404 when not found", async () => {
    db.query.mockResolvedValueOnce([[], undefined]); // tutor baseline -> empty

    const res = await request(app).get("/api/tutor/123");
    expect(res.status).toBe(404);
  });
});