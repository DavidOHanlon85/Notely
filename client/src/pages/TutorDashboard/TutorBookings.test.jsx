import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

// Mock axios
vi.mock("axios", () => ({ default: { get: vi.fn(), patch: vi.fn() } }));
import axios from "axios";

// Minimal DataTable shim that renders selectors/cells
vi.mock("react-data-table-component", () => ({
  default: ({ columns, data, noDataComponent }) => (
    <table data-testid="rt-mock">
      <tbody>
        {data.length ? (
          data.map((row, i) => (
            <tr key={i} data-row={i}>
              {columns.map((col, j) => {
                const cell =
                  col.cell?.(row) ??
                  (col.selector ? col.selector(row) : null);
                return <td key={j}>{cell}</td>;
              })}
            </tr>
          ))
        ) : (
          <tr>
            <td>{noDataComponent}</td>
          </tr>
        )}
      </tbody>
    </table>
  ),
}));

import TutorBookings from "./TutorBookings";

// Helpers to build ISO date (YYYY-MM-DD). 
const iso = (d) => d.toISOString().slice(0, 10);
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

describe("TutorBookings (lean)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows 'No lessons found.' when API returns empty", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<TutorBookings />);

    expect(
      await screen.findByText(/No lessons found\./i)
    ).toBeInTheDocument();
  });

  it("renders rows, shows status, join/cancel actions, and filters by text", async () => {
    // Past lesson (Completed): use -2 days (component +1 => -1 day, safely past)
    const past = {
      booking_id: 1,
      student_first_name: "Alex",
      student_last_name: "Smith",
      student_id: 10,
      booking_date: daysFromNow(-2),
      booking_time: "09:00:00",
      booking_link: "/join/1",
      feedback_given: 0,
    };

    // Upcoming within 12h (Join)
    const soon = {
      booking_id: 2,
      student_first_name: "Beth",
      student_last_name: "Jones",
      student_id: 11,
      booking_date: daysFromNow(0),
      booking_time: "01:00:00",
      booking_link: "/join/2",
      feedback_given: 0,
    };

    // Upcoming far future (>24h, Cancel): +5 days
    const future = {
      booking_id: 3,
      student_first_name: "Chris",
      student_last_name: "Lee",
      student_id: 12,
      booking_date: daysFromNow(5),
      booking_time: "10:30:00",
      booking_link: "/join/3",
      feedback_given: 0,
    };

    axios.get.mockResolvedValueOnce({ data: [past, soon, future] });

    render(<TutorBookings />);

    // Rows visible
    expect(await screen.findByText(/Alex Smith/)).toBeInTheDocument();
    expect(screen.getByText(/Beth Jones/)).toBeInTheDocument();
    expect(screen.getByText(/Chris Lee/)).toBeInTheDocument();

    // Status badges (text)
    expect(screen.getAllByText(/Upcoming/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Completed/)).toBeInTheDocument();

    // Join link present for soon booking
    expect(screen.getAllByText(/Join Class/).length).toBeGreaterThanOrEqual(1);

    // Cancel button present for far-future booking
    expect(screen.getAllByText(/^Cancel$/).length).toBeGreaterThanOrEqual(1);

    // Filter by student name
    fireEvent.change(screen.getByPlaceholderText(/Search lessons/i), {
      target: { value: "Chris" },
    });
    expect(screen.getByText(/Chris Lee/)).toBeInTheDocument();
    expect(screen.queryByText(/Alex Smith/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Beth Jones/)).not.toBeInTheDocument();
  });

  it("cancels a future booking when confirmed and calls PATCH", async () => {
    const future = {
      booking_id: 42,
      student_first_name: "Dana",
      student_last_name: "Kim",
      student_id: 99,
      booking_date: daysFromNow(4),
      booking_time: "12:00:00",
      booking_link: "/join/42",
      feedback_given: 0,
    };

    axios.get.mockResolvedValueOnce({ data: [future] });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<TutorBookings />);

    expect(await screen.findByText(/Dana Kim/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/^Cancel$/));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        "http://localhost:3002/api/tutor/booking/42/cancel",
        {},
        expect.objectContaining({ withCredentials: true })
      )
    );

    // Row removed after cancel
    await waitFor(() =>
      expect(screen.queryByText(/Dana Kim/)).not.toBeInTheDocument()
    );

    confirmSpy.mockRestore();
  });

  it("does not cancel when user declines confirm", async () => {
    const future = {
      booking_id: 77,
      student_first_name: "Evan",
      student_last_name: "Ng",
      student_id: 77,
      booking_date: daysFromNow(3),
      booking_time: "15:00:00",
      booking_link: "/join/77",
      feedback_given: 0,
    };

    axios.get.mockResolvedValueOnce({ data: [future] });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<TutorBookings />);

    expect(await screen.findByText(/Evan Ng/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/^Cancel$/));

    expect(axios.patch).not.toHaveBeenCalled();
    expect(screen.getByText(/Evan Ng/)).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});