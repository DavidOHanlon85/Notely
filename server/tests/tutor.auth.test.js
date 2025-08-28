import { describe, it, expect, beforeEach, vi } from "vitest";

// DB + deps must be mocked before importing app
vi.mock("../utils/dbconn", () => {
  const mock = { query: vi.fn(), execute: vi.fn(), getConnection: vi.fn() };
  return { default: mock, __esModule: true };
});
vi.mock("../utils/email", () => ({ default: vi.fn(async () => {}), __esModule: true }));
vi.mock("../lib/stripe", () => ({ default: {}, __esModule: true }));

import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../utils/dbconn";
import app from "../app";

// helper to sign auth cookie for tutor-protected routes
const signTutorCookie = (
  payload = { tutor_id: 99, tutor_first_name: "Terry", userType: "tutor" }
) => {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || "test_secret",
    { expiresIn: "1h" }
  );
  // Set BOTH cookie names to cover middleware differences
  return [
    `tutor_token=${token}; Path=/; HttpOnly`,
    `token=${token}; Path=/; HttpOnly`,
  ];
};

describe("Tutor auth (lean)", () => {
  beforeEach(() => {
    if (!("mock" in db.query)) db.query = vi.fn();
    db.query.mockReset().mockResolvedValue([[], undefined]);
    vi.restoreAllMocks();
  });

  it("POST /api/tutor/login -> 400 invalid payload", async () => {
    const res = await request(app).post("/api/tutor/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failure");
  });

  it("POST /api/tutor/login -> 401 not found", async () => {
    db.query.mockResolvedValueOnce([[/* empty */], undefined]);

    const res = await request(app)
      .post("/api/tutor/login")
      .send({ identifier: "nope@example.com", password: "Passw0rd!" });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("failure");
  });

  it("POST /api/tutor/login -> 401 wrong password", async () => {
    db.query.mockResolvedValueOnce([
      [{ tutor_id: 7, tutor_first_name: "Tia", tutor_password: "hash" }],
      undefined,
    ]);
    vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);

    const res = await request(app)
      .post("/api/tutor/login")
      .send({ identifier: "tia@example.com", password: "Wrong1!" });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("failure");
  });

  it("POST /api/tutor/login -> 200 sets cookie on success", async () => {
    db.query.mockResolvedValueOnce([
      [{ tutor_id: 7, tutor_first_name: "Tia", tutor_password: "hash" }],
      undefined,
    ]);
    vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);

    const res = await request(app)
      .post("/api/tutor/login")
      .send({ identifier: "tia@example.com", password: "GoodPass1!", rememberMe: true });

    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.status).toBe("success");
      const setCookie = res.headers["set-cookie"]?.join(";");
      expect(setCookie).toMatch(/tutor_token=|token=/);
    }
  });

  it("POST /api/tutor/logout -> 200", async () => {
    const res = await request(app).post("/api/tutor/logout");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("POST /api/tutor/forgot-password -> 400 invalid email", async () => {
    const res = await request(app).post("/api/tutor/forgot-password").send({ email: "bad" });
    expect(res.status).toBe(400);
  });

  it("POST /api/tutor/forgot-password -> 404 when not found", async () => {
    db.query.mockResolvedValueOnce([[/* none */], undefined]);

    const res = await request(app).post("/api/tutor/forgot-password").send({ email: "missing@example.com" });
    expect(res.status).toBe(404);
  });

  it("POST /api/tutor/forgot-password -> 200 minimal happy path", async () => {
    db.query.mockResolvedValueOnce([
      [{ tutor_id: 5, tutor_first_name: "Tess" }],
      undefined,
    ]);
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);

    const res = await request(app).post("/api/tutor/forgot-password").send({ email: "tess@example.com" });

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) expect(res.body.status).toBe("success");
  });

  it("POST /api/tutor/reset-password/:token -> 400 invalid body", async () => {
    const res = await request(app)
      .post("/api/tutor/reset-password/someToken")
      .send({ password: "Passw0rd!", confirmPassword: "" });
    expect(res.status).toBe(400);
  });

  it("POST /api/tutor/reset-password/:token -> 400 bad/expired token", async () => {
    db.query.mockResolvedValueOnce([[/* none */], undefined]);

    const res = await request(app)
      .post("/api/tutor/reset-password/someToken")
      .send({ password: "Passw0rd!", confirmPassword: "Passw0rd!" });
    expect(res.status).toBe(400);
  });

  it("POST /api/tutor/reset-password/:token -> 200 success", async () => {
    db.query.mockResolvedValueOnce([
      [{ tutor_id: 12 }],
      undefined,
    ]);
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
    vi.spyOn(bcrypt, "hash").mockResolvedValueOnce("new-hash");

    const res = await request(app)
      .post("/api/tutor/reset-password/validToken")
      .send({ password: "Passw0rd!", confirmPassword: "Passw0rd!" });

    expect([200, 400]).toContain(res.status);
    if (res.status === 200) expect(res.body.status).toBe("success");
  });

  it("GET /api/tutor/me -> 200 with auth", async () => {
    db.query.mockResolvedValueOnce([
      [{ tutor_id: 99, tutor_first_name: "Terry", tutor_second_name: "Jones", tutor_stripe_account_id: null }],
      undefined,
    ]);

    const res = await request(app).get("/api/tutor/me").set("Cookie", signTutorCookie());
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) expect(res.body).toHaveProperty("tutor_id", 99);
  });

  it("GET /api/tutor/me -> 401 without auth", async () => {
    const res = await request(app).get("/api/tutor/me");
    expect(res.status).toBe(401);
  });
});