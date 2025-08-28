// tests/admin.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import { createRequire } from "module";
const requireCJS = createRequire(import.meta.url);

// Mock the email util as a CJS module that exports a function (module.exports = fn)
vi.mock("../utils/email", () => {
  const fn = vi.fn().mockResolvedValue(undefined);
  return fn; // <- not { default: fn }, controller calls it directly
});

// Import app after mocks so routes/controllers see our mocks
import app from "../app";

// Access the CJS exports used by controllers so we can control them
const db = requireCJS("../utils/dbconn");          // controllers use require("../utils/dbconn")
const sendEmail = requireCJS("../utils/email");     // our vi.mock above

beforeEach(() => {
    process.env.JWT_SECRET = "test_secret";
  
    if (!("mock" in db.query)) db.query = vi.fn();
    db.query.mockReset();
    db.query.mockResolvedValue([[], undefined]);
    
    vi.clearAllMocks();
  
    vi.spyOn(bcrypt, "compare").mockReset();
  });

describe("Admin auth (lean)", () => {
  it("POST /api/admin/login -> 400 on bad payload", async () => {
    const res = await request(app).post("/api/admin/login").send({});
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      status: "failure",
      message: "Invalid username or password.",
    });
  });

  it("POST /api/admin/login -> 404 when admin not found", async () => {
    // SELECT admin ... returns empty
    db.query.mockResolvedValueOnce([[], undefined]);

    const res = await request(app)
      .post("/api/admin/login")
      .send({ identifier: "admin@example.com", password: "whatever" });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      status: "failure",
      message: "No admin found with that email or username.",
    });
  });

  it("POST /api/admin/login -> 401 on wrong password", async () => {
    // SELECT admin ... single row
    db.query.mockResolvedValueOnce([
      [
        {
          admin_id: 1,
          admin_first_name: "Ada",
          admin_email: "admin@example.com",
          admin_username: "admin",
          admin_password: "hashed",
        },
      ],
      undefined,
    ]);

    vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);

    const res = await request(app)
      .post("/api/admin/login")
      .send({ identifier: "admin@example.com", password: "nope" });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: "failure",
      message: "Incorrect password.",
    });
  });

  it("POST /api/admin/login -> 200 sets cookie on success", async () => {
    // SELECT admin ... single row
    db.query.mockResolvedValueOnce([
      [
        {
          admin_id: 1,
          admin_first_name: "Ada",
          admin_email: "admin@example.com",
          admin_username: "admin",
          admin_password: "hashed",
        },
      ],
      undefined,
    ]);

    vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);

    const res = await request(app)
      .post("/api/admin/login")
      .send({ identifier: "admin@example.com", password: "correct" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "success",
      admin_id: 1,
    });
    // cookie was set
    const setCookie = res.headers["set-cookie"]?.join(";") || "";
    expect(setCookie).toMatch(/admin_token=/);
  });

  it("POST /api/admin/logout -> 200", async () => {
    const res = await request(app).post("/api/admin/logout");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "success" });
  });
});

describe("Admin forgot password (lean)", () => {
  it("POST /api/admin/forgot-password -> 400 on invalid email", async () => {
    const res = await request(app)
      .post("/api/admin/forgot-password")
      .send({ email: "not-an-email" });

    expect(res.status).toBe(400);
  });

  it("POST /api/admin/forgot-password -> 404 when admin not found", async () => {
    // SELECT admin by email => empty
    db.query.mockResolvedValueOnce([[], undefined]);

    const res = await request(app)
      .post("/api/admin/forgot-password")
      .send({ email: "missing@example.com" });

    expect(res.status).toBe(404);
  });
});