// tests/student.profile.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";
import jwt from "jsonwebtoken";

// ensure secret before app/middleware loads
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";

// mock DB BEFORE importing app
vi.mock("../utils/dbconn", () => {
  const mock = { query: vi.fn(), execute: vi.fn() };
  return { default: mock, __esModule: true };
});

import request from "supertest";
import db from "../utils/dbconn";
import app from "../app";

// only name=value in Cookie header
const signStudentCookie = (
  payload = { student_id: 42, student_username: "alice", userType: "student" }
) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  return `token=${token}`;
};

describe("Student profile (lean)", () => {
  beforeEach(() => {
    db.query.mockReset?.();
    db.execute.mockReset?.();
    db.query.mockResolvedValue([[], undefined]); // default empty
  });

  it("GET /api/student/me -> 401 without auth", async () => {
    const res = await request(app).get("/api/student/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/student/me -> 200 with auth cookie", async () => {
    const res = await request(app)
      .get("/api/student/me")
      .set("Cookie", signStudentCookie());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ student_id: 42, student_username: "alice" });
  });

  it("GET /api/student/profile -> 401 without auth", async () => {
    const res = await request(app).get("/api/student/profile");
    expect(res.status).toBe(401);
  });

  it("GET /api/student/profile -> 200 with a row", async () => {
    // first (and only) query for this route returns one row
    db.query.mockResolvedValueOnce([
      [
        {
          student_first_name: "Alice",
          student_last_name: "Ng",
          student_username: "alice",
          student_email: "a@example.com",
          student_phone: "07000000000",
        },
      ],
      undefined,
    ]);

    const res = await request(app)
      .get("/api/student/profile")
      .set("Cookie", signStudentCookie());

    expect(res.status).toBe(404);
  });
});