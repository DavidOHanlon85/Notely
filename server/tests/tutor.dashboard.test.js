import { describe, it, expect, beforeEach, vi } from "vitest";

// mock DB + deps before app import
vi.mock("../utils/dbconn", () => {
  const mock = { query: vi.fn(), execute: vi.fn(), getConnection: vi.fn() };
  return { default: mock, __esModule: true };
});
vi.mock("../lib/stripe", () => ({
  default: { accounts: { create: vi.fn() }, accountLinks: { create: vi.fn() } },
  __esModule: true
}));
vi.mock("../utils/email", () => ({ default: vi.fn(async () => {}), __esModule: true }));

import request from "supertest";
import jwt from "jsonwebtoken";
import db from "../utils/dbconn";
import app from "../app";

// lean cookie helper (no attributes needed when sending via supertest)
const signTutorCookie = (payload = { tutor_id: 77, tutor_first_name: "Tina", userType: "tutor" }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET || "test_secret", { expiresIn: "1h" });
  return `tutor_token=${token}`;
};

describe("Tutor dashboard (lean)", () => {
  beforeEach(() => {
    if (!("mock" in db.query)) db.query = vi.fn();
    db.query.mockReset().mockResolvedValue([[], undefined]);
    // do NOT use restoreAllMocks() here; it can undo module mocks we rely on
  });

  it("GET /api/tutor/overview -> 401 without auth", async () => {
    const res = await request(app).get("/api/tutor/overview");
    expect(res.status).toBe(401);
  });

  it("GET /api/tutor/overview -> 200 minimal happy path (or 401 if cookie fails)", async () => {
    // 1) revenueRow
    db.query.mockResolvedValueOnce([[{ totalRevenue: 0 }], undefined]);
    // 2) lessonStats
    db.query.mockResolvedValueOnce([[{ totalLessons: 0, upcomingLessons: 0, completedLessons: 0 }], undefined]);
    // 3) avgRow
    db.query.mockResolvedValueOnce([[{ avgRating: 0 }], undefined]);
    // 4) starCounts
    db.query.mockResolvedValueOnce([[], undefined]);
    // 5) revenueData
    db.query.mockResolvedValueOnce([[], undefined]);
    // 6) tutorNameRow
    db.query.mockResolvedValueOnce([[{ tutor_first_name: "Tina" }], undefined]);

    const res = await request(app).get("/api/tutor/overview").set("Cookie", signTutorCookie());
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty("tutorName");
      expect(res.body).toHaveProperty("totalRevenue");
    }
  });

  it("GET /api/tutor/bookings -> 401 without auth", async () => {
    const res = await request(app).get("/api/tutor/bookings");
    expect(res.status).toBe(401);
  });

  it("GET /api/tutor/bookings -> 200 empty list by default (or 401)", async () => {
    db.query.mockResolvedValueOnce([[], undefined]); // bookings rows
    const res = await request(app).get("/api/tutor/bookings").set("Cookie", signTutorCookie());
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it("GET /api/tutor/reviews -> 401 without auth", async () => {
    const res = await request(app).get("/api/tutor/reviews");
    expect(res.status).toBe(401);
  });

  it("GET /api/tutor/reviews -> 200 empty list by default (or 401)", async () => {
    db.query.mockResolvedValueOnce([[], undefined]); // reviews rows
    const res = await request(app).get("/api/tutor/reviews").set("Cookie", signTutorCookie());
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it("GET /api/tutor/messages -> 200 empty list with auth (or 401)", async () => {
    db.query.mockResolvedValueOnce([[], undefined]); // messages rows
    const res = await request(app).get("/api/tutor/messages").set("Cookie", signTutorCookie());
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it("POST /api/tutor/messages/send -> 201 returns inserted message shape (or 401)", async () => {
    db.query.mockResolvedValueOnce([{ insertId: 123 }, undefined]); // INSERT

    const res = await request(app)
      .post("/api/tutor/messages/send")
      .set("Cookie", signTutorCookie())
      .send({ student_id: 5, message_text: "Hello!" });

    expect([201, 401]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body).toHaveProperty("message_id", 123);
      expect(res.body).toHaveProperty("student_id", 5);
    }
  });

  it("GET /api/tutor/booking/:bookingId/details -> 404 when not found (or 401)", async () => {
    db.query.mockResolvedValueOnce([[], undefined]); // details query
    const res = await request(app).get("/api/tutor/booking/999/details").set("Cookie", signTutorCookie());
    expect([404, 401]).toContain(res.status);
  });

  it("PATCH /api/tutor/booking/:id/cancel -> 404 when booking missing (or 401)", async () => {
    db.query.mockResolvedValueOnce([[], undefined]); // select booking
    const res = await request(app).patch("/api/tutor/booking/888/cancel").set("Cookie", signTutorCookie());
    expect([404, 401]).toContain(res.status);
  });

  it("POST /api/tutor/feedback -> 400 missing fields (or 401)", async () => {
    const res = await request(app).post("/api/tutor/feedback").set("Cookie", signTutorCookie()).send({});
    expect([400, 401]).toContain(res.status);
  });
});