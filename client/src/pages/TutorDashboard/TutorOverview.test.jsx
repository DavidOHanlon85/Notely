import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import axios from "axios";
import TutorOverview from "./TutorOverview";

// Mock axios
vi.mock("axios", () => ({
  default: { get: vi.fn() },
}));

// Mock recharts to avoid ResizeObserver and heavy SVG work
vi.mock("recharts", () => ({
  __esModule: true,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive">{children}</div>
  ),
  LineChart: ({ data, children }) => (
    <div
      data-testid="linechart"
      data-count={Array.isArray(data) ? data.length : 0}
    >
      {children}
    </div>
  ),
  BarChart: ({ data, children }) => (
    <div
      data-testid="barchart"
      data-count={Array.isArray(data) ? data.length : 0}
    >
      {children}
    </div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

describe("TutorOverview (lean)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads last_month, shows stats, renders charts, then switches range and refetches", async () => {
    // First response: last_month
    const monthPayload = {
      tutorName: "Alice",
      totalRevenue: 1234.5,
      totalLessons: 20,
      completedLessons: 18,
      averageRating: 4.6,
      revenueOverTime: [{ date: "2025-01", revenue: 200 }],
      feedbackStars: [
        { label: "★★★★★", count: 3 },
        { label: "★★★★", count: 2 },
      ],
    };
    // Second response: last_year (no revenue data)
    const yearPayload = {
      tutorName: "Alice",
      totalRevenue: 4321.0,
      totalLessons: 50,
      completedLessons: 47,
      averageRating: 4.8,
      revenueOverTime: [],
      feedbackStars: [{ label: "★★★★★", count: 10 }],
    };

    axios.get
      .mockResolvedValueOnce({ data: monthPayload }) // initial load (last_month)
      .mockResolvedValueOnce({ data: yearPayload }); // after changing select

    render(<TutorOverview />);

    // Loading first
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // After first fetch
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        "http://localhost:3002/api/tutor/overview?range=last_month",
        { withCredentials: true }
      )
    );

    // Core stats appear
    await screen.findByText("£1234.50");
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/alice!/i)).toBeInTheDocument();

    // Charts render (mocked)
    expect(screen.getByTestId("linechart")).toHaveAttribute("data-count", "1");
    expect(screen.getByTestId("barchart")).toHaveAttribute("data-count", "2");

    // Change the range → triggers re-fetch
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "last_year" } });

    await waitFor(() =>
      expect(axios.get).toHaveBeenLastCalledWith(
        "http://localhost:3002/api/tutor/overview?range=last_year",
        { withCredentials: true }
      )
    );

    // Updated stats for last_year (spot-check a couple)
    expect(screen.getByText("£4321.00")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();

    // No revenue data message appears when data array is empty
    expect(screen.getByText(/no revenue data found/i)).toBeInTheDocument();

    // Feedback bar chart still renders with 1 datum
    expect(screen.getByTestId("barchart")).toHaveAttribute("data-count", "1");
  });
});
