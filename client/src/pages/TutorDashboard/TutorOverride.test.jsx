import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import TutorTimeOffPage from "./TutorOverride";
import { vi } from "vitest";

// Mock react-datepicker
vi.mock("react-datepicker", () => ({
  __esModule: true,
  default: ({ onChange }) => (
    <button onClick={() => onChange(new Date("2025-01-15"))}>
      MockDatePicker
    </button>
  ),
  registerLocale: vi.fn(),
}));
vi.mock("date-fns/locale/en-GB", () => ({ default: {} }));

vi.mock("axios", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const originalLocation = window.location;

beforeAll(() => {
  // Replace window.location with a mockable object
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...originalLocation, reload: vi.fn() },
  });
});

afterAll(() => {
  // Restore original location
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});

describe("TutorTimeOffPage (lean)", () => {
  const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads, picks date, toggles, saves", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { tutor_id: 42 } }) // /me
      .mockResolvedValueOnce({
        data: { available_dates: ["2025-01-15", "2025-01-20"] },
      }) // available-dates
      .mockResolvedValueOnce({
        data: { available_slots: ["09:00:00", "10:00:00"] },
      }); // availability

    render(<TutorTimeOffPage />);

    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        "http://localhost:3002/api/tutor/me",
        { withCredentials: true }
      )
    );

    fireEvent.click(screen.getByText("MockDatePicker"));

    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        "http://localhost:3002/api/booking/availability",
        expect.objectContaining({
          params: expect.objectContaining({ tutor_id: 42, date: "2025-01-15" }),
        })
      )
    );

    const nine = await screen.findByRole("button", { name: /09:00/i });
    fireEvent.click(nine); // block 09:00

    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/api/tutor/timeoff/set",
        { date: "2025-01-15", blockedSlots: ["09:00:00"] },
        { withCredentials: true }
      )
    );

    expect(alertSpy).toHaveBeenCalledWith("Time off updated.");
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("resets overrides (empty blockedSlots)", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { tutor_id: 77 } })
      .mockResolvedValueOnce({ data: { available_dates: ["2025-02-01"] } })
      .mockResolvedValueOnce({ data: { available_slots: ["07:00:00"] } });

    render(<TutorTimeOffPage />);

    fireEvent.click(await screen.findByText("MockDatePicker"));
    await screen.findByRole("button", { name: /07:00/i });

    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    fireEvent.click(
      screen.getByRole("button", { name: /reset usual availability/i })
    );

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/api/tutor/timeoff/set",
        { date: "2025-01-15", blockedSlots: [] },
        { withCredentials: true }
      )
    );
    expect(window.location.reload).toHaveBeenCalled();
  });
});