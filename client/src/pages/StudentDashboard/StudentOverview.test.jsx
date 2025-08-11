// pages/StudentDashboard/StudentOverview.test.jsx
import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";
import StudentOverview from "./StudentOverview";

// Polyfill for Recharts' <ResponsiveContainer />
if (!global.ResizeObserver) {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock axios
vi.mock("axios", () => ({ default: { get: vi.fn() } }));
import axios from "axios";

describe("StudentOverview (lean)", () => {
  afterEach(() => vi.clearAllMocks());

  it("loads and shows headline stats, two tables, a future lesson row, and chart sections", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        totalLessons: 12,
        upcomingLessons: [
          {
            tutor_name: "Future Tutor",
            booking_date: "2099-12-25",
            booking_time: "12:30:00",
            formatted_date: "25/12/2099",
            formatted_time: "12:30",
          },
          {
            tutor_name: "Past Tutor",
            booking_date: "2001-01-01",
            booking_time: "09:00:00",
            formatted_date: "01/01/2001",
            formatted_time: "09:00",
          },
        ],
        completedLessons: 5,
        feedbackGiven: 3,
        bookingBreakdown: [
          { tutor_name: "Alice Smith", lesson_count: 7, avg_rating: 4.5 },
          { tutor_name: "Bob Jones", lesson_count: 5, avg_rating: null },
        ],
        lessonsPerMonth: [
          { date: "2025-01", totalLessons: 1 },
          { date: "2025-02", totalLessons: 2 },
          { date: "2025-03", totalLessons: 3 },
          { date: "2025-04", totalLessons: 2 },
          { date: "2025-05", totalLessons: 1 },
          { date: "2025-06", totalLessons: 3 },
        ],
        feedbackStars: [
          { label: "★ 5", count: 2 },
          { label: "★ 4", count: 1 },
          { label: "★ 3", count: 0 },
          { label: "★ 2", count: 0 },
          { label: "★ 1", count: 0 },
        ],
      },
    });

    render(<StudentOverview />);

    // Loading disappears
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );

    // Headline stats
    expect(screen.getByText("Total Lessons")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText(/Tutor Feedback/i)).toBeInTheDocument();
    const completed = screen.getByText("Completed").parentElement; // stat card
    expect(within(completed).getByText(/^5$/)).toBeInTheDocument();

    // We rendered at least two tables (Breakdown + Upcoming)
    const tables = screen.getAllByRole("table");
    expect(tables.length).toBeGreaterThanOrEqual(2);

    // Upcoming has the future lesson, not the past one
    expect(screen.getByText("Future Tutor")).toBeInTheDocument();
    expect(screen.getByText("25/12/2099")).toBeInTheDocument();
    expect(screen.getByText("12:30")).toBeInTheDocument();
    expect(screen.queryByText("Past Tutor")).not.toBeInTheDocument();

    // Chart section headings present (don’t assert internals)
    expect(
      screen.getByText(/Lessons Over Last 6 Months/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Feedback Summary/i)).toBeInTheDocument();
  });
});