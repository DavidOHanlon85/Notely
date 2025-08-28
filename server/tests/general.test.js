import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../app";

describe("General (lean)", () => {
  it("GET /users -> 200 + array (empty by default)", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual([]); // default mock returns empty
  });

  it("GET /api/instruments/all -> 200 + { instruments: [] } (default)", async () => {
    const res = await request(app).get("/api/instruments/all");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("instruments");
    expect(Array.isArray(res.body.instruments)).toBe(true);
    expect(res.body.instruments).toEqual([]);
  });

  it("GET /api/booking/available-dates -> 400 when missing tutor_id", async () => {
    const res = await request(app).get("/api/booking/available-dates");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing tutor_id" });
  });

  it("GET /api/booking/available-dates -> 200 + [] when no availability", async () => {
    // default db mock returns empty arrays for every query
    const res = await request(app).get("/api/booking/available-dates?tutor_id=10");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ available_dates: [] });
  });

  it("GET /api/booking/availability -> 400 when missing params", async () => {
    const res = await request(app).get("/api/booking/availability");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing tutor_id or date" });
  });

  it("GET /api/booking/availability -> 200 + [] when no mapped slots", async () => {
    // We’ll temporarily override the db mock to simulate:
    // 1) availability rows present with labels not in slotMap (so nothing maps)
    // 2) overrides/bookings empty
    const db = (await vi.importMock("../utils/dbconn")).default;

    db.query
      // 1) weekly availability (unknown slot label so it won't map)
      .mockResolvedValueOnce([[{ time_slot: "UnknownLabel" }], undefined])
      // 2) overrides
      .mockResolvedValueOnce([[], undefined])
      // 3) bookings
      .mockResolvedValueOnce([[], undefined]);

    const res = await request(app).get(
      "/api/booking/availability?tutor_id=10&date=2025-12-01"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ available_slots: [] });
  });
});