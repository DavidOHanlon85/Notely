import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import StudentBookings from "./StudentBookings";

//  Mock axios 
vi.mock("axios", () => ({ default: { get: vi.fn(), patch: vi.fn() } }));
import axios from "axios";

// Mock react-data-table-component to a simple renderer 
vi.mock("react-data-table-component", () => {
  return {
    default: ({ columns = [], data = [], noDataComponent = null }) => {
      if (!data || data.length === 0) {
        return <div>{noDataComponent}</div>;
      }
      return (
        <div data-testid="mock-table">
          {data.map((row, i) => (
            <div role="row" key={i}>
              {columns.map((col, j) => {
                const cell =
                  col.cell ? col.cell(row) : col.selector ? col.selector(row) : null;
                return (
                  <div role="cell" key={j}>
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    },
  };
});

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

// Build dates 
const fmt = (d) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

function makeSourceDateTime(target) {
  const dateOnly = fmt(target); // YYYY-MM-DD
  const bookingDate = new Date(target);
  bookingDate.setDate(bookingDate.getDate() - 1); 
  const booking_date = fmt(bookingDate);
  const hh = String(target.getHours()).padStart(2, "0");
  const mm = String(target.getMinutes()).padStart(2, "0");
  const ss = String(target.getSeconds()).padStart(2, "0");
  return { booking_date, booking_time: `${hh}:${mm}:${ss}` };
}

describe("StudentBookings", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows 'no bookings' when API returns empty", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    renderWithRouter(<StudentBookings />);

    expect(
      await screen.findByText(/you have no bookings yet\./i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search bookings/i)).toBeInTheDocument();
  });

  it("renders rows, status badges, feedback/cancel cells, and filters", async () => {
    const now = new Date();

    // Past booking (Completed) and no feedback => should show "Leave Feedback"
    const past = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    past.setHours(10, 0, 0, 0);
    const pastSrc = makeSourceDateTime(past);

    // Future booking far enough (>24h) => Upcoming + Cancel button
    const future = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    future.setHours(15, 0, 0, 0);
    const futureSrc = makeSourceDateTime(future);

    axios.get.mockResolvedValueOnce({
      data: [
        {
          booking_id: 1,
          tutor_id: 101,
          tutor_first_name: "Alice",
          tutor_second_name: "Smith",
          booking_date: pastSrc.booking_date,
          booking_time: pastSrc.booking_time,
          booking_link: "link-1",
          feedback_given: 0,
        },
        {
          booking_id: 2,
          tutor_id: 102,
          tutor_first_name: "Bob",
          tutor_second_name: "Jones",
          booking_date: futureSrc.booking_date,
          booking_time: futureSrc.booking_time,
          booking_link: "link-2",
          feedback_given: 1,
        },
      ],
    });

    renderWithRouter(<StudentBookings />);

    // Names appear
    expect(await screen.findByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();

    // Status badges (text)
    expect(screen.getAllByText(/upcoming/i)).toHaveLength(1);
    expect(screen.getAllByText(/completed/i)).toHaveLength(1);

    // Feedback for past row
    expect(
      screen.getByRole("button", { name: /leave feedback/i })
    ).toBeInTheDocument();

    // Cancel for future row
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    // Filtering by last name
    fireEvent.change(screen.getByPlaceholderText(/search bookings/i), {
      target: { value: "jones" },
    });

    await waitFor(() => {
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
      expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
    });
  });

  it("cancels a future booking when confirmed and removes the row", async () => {
    const now = new Date();
    const future = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    future.setHours(18, 0, 0, 0);
    const src = makeSourceDateTime(future);

    axios.get.mockResolvedValueOnce({
      data: [
        {
          booking_id: 9,
          tutor_id: 222,
          tutor_first_name: "Derek",
          tutor_second_name: "ONeil",
          booking_date: src.booking_date,
          booking_time: src.booking_time,
          booking_link: "link-9",
          feedback_given: 1,
        },
      ],
    });
    axios.patch.mockResolvedValueOnce({ data: { ok: true } });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithRouter(<StudentBookings />);

    expect(await screen.findByText(/Derek ONeil/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        "http://localhost:3002/api/booking/9/cancel",
        {},
        expect.objectContaining({ withCredentials: true })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText(/Derek ONeil/i)).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it("does not cancel when user declines confirm", async () => {
    const now = new Date();
    const future = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    future.setHours(18, 0, 0, 0);
    const src = makeSourceDateTime(future);

    axios.get.mockResolvedValueOnce({
      data: [
        {
          booking_id: 10,
          tutor_id: 333,
          tutor_first_name: "Eva",
          tutor_second_name: "Ng",
          booking_date: src.booking_date,
          booking_time: src.booking_time,
          booking_link: "link-10",
          feedback_given: 1,
        },
      ],
    });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    renderWithRouter(<StudentBookings />);

    expect(await screen.findByText(/Eva Ng/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(axios.patch).not.toHaveBeenCalled();
    });
    expect(screen.getByText(/Eva Ng/i)).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});