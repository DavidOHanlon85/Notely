import { describe, it, expect, beforeEach, vi } from "vitest";

// mock db + email BEFORE app import
vi.mock("../utils/dbconn", () => {
  const mock = { query: vi.fn(), execute: vi.fn() };
  return { default: mock, __esModule: true };
});
vi.mock("../utils/email", () => ({ default: vi.fn(async () => {}), __esModule: true }));

import request from "supertest";
import bcrypt from "bcrypt";
import db from "../utils/dbconn";
import app from "../app";

describe("Student auth (lean)", () => {
  beforeEach(() => {
    db.query.mockReset().mockResolvedValue([[], undefined]);
    db.execute.mockReset?.();
    vi.restoreAllMocks();
  });

  it("POST /api/student/login -> 400 invalid payload", async () => {
    const res = await request(app).post("/api/student/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failure");
  });

  it("POST /api/student/login -> 401 when account not found", async () => {
    db.query.mockResolvedValueOnce([[/* none */]], undefined);
    const res = await request(app)
      .post("/api/student/login")
      .send({ identifier: "nope@example.com", password: "Passw0rd!" });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe("failure");
  });

  it("POST /api/student/login -> 401 wrong password", async () => {
    db.query.mockResolvedValueOnce([
      [{ student_id: 11, student_first_name: "Stu", student_password: "hashed" }],
      undefined,
    ]);
    vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);
    const res = await request(app)
      .post("/api/student/login")
      .send({ identifier: "stu@example.com", password: "Wrong1!" });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe("failure");
  });

  it("POST /api/student/logout -> 200", async () => {
    const res = await request(app).post("/api/student/logout");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("POST /api/student/forgot-password -> 400 invalid email", async () => {
    const res = await request(app).post("/api/student/forgot-password").send({ email: "bad" });
    expect(res.status).toBe(400);
  });

  it("POST /api/student/forgot-password -> 404 not found", async () => {
    db.query.mockResolvedValueOnce([[/* none */]], undefined);
    const res = await request(app)
      .post("/api/student/forgot-password")
      .send({ email: "missing@example.com" });
    expect(res.status).toBe(404);
  });

  it("POST /api/student/reset-password/:token -> 400 invalid body", async () => {
    const res = await request(app)
      .post("/api/student/reset-password/someToken")
      .send({ password: "Passw0rd!", confirmPassword: "" });
    expect(res.status).toBe(400);
  });

  it("POST /api/student/reset-password/:token -> 400 bad token", async () => {
    db.query.mockResolvedValueOnce([[/* none */]], undefined);
    const res = await request(app)
      .post("/api/student/reset-password/someToken")
      .send({ password: "Passw0rd!", confirmPassword: "Passw0rd!" });
    expect(res.status).toBe(400);
  });

});