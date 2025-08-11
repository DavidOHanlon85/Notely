import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminOverview from "./AdminOverview";
import { vi } from "vitest";
import React from "react";

// Mock axios
import axios from "axios";
vi.mock("axios", () => ({ default: { get: vi.fn() } }));

// Keep Recharts simple: make ResponsiveContainer a pass-through
vi.mock("recharts", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div data-testid="rc">{children}</div>,
  };
});

// Polyfill to silence charts in JSDOM (extra safety)
beforeAll(() => {
  // @ts-ignore
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("AdminOverview (lean)", () => {
  it("loads data, shows stats, renders chart headings, and refetches when range changes", async () => {
    // First payload (last_month)
    axios.get.mockResolvedValueOnce({
      data: {
        totalRevenue: 1234.56,
        totalBookings: 42,
        newUsers: { students: 7, tutors: 3 },
        studentGrowthOverTime: [{ month: "Jan", count: 5 }],
        tutorGrowthOverTime: [{ month: "Jan", count: 2 }],
      },
    });

    render(<AdminOverview />);

    // Wait past loading
    await screen.findByText(/admin overview/i);

    // Core stats appear
    expect(screen.getByText("£1234.56")).toBeInTheDocument();
    expect(screen.getByText("£987.65")).toBeInTheDocument(); // 80% of 1234.56
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument(); // 7 + 3

    // Chart headings visible
    expect(screen.getByText(/new students over time/i)).toBeInTheDocument();
    expect(screen.getByText(/new tutors over time/i)).toBeInTheDocument();

    // Change the range -> triggers refetch with new payload
    axios.get.mockResolvedValueOnce({
      data: {
        totalRevenue: 5000,
        totalBookings: 100,
        newUsers: { students: 20, tutors: 10 },
        studentGrowthOverTime: [{ month: "Feb", count: 10 }],
        tutorGrowthOverTime: [{ month: "Feb", count: 6 }],
      },
    });

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "all_time" } });

    await waitFor(() =>
      expect(axios.get).toHaveBeenLastCalledWith(
        expect.stringMatching(/\/admin\/overview\?range=all_time$/),
        expect.any(Object)
      )
    );

    // New stats rendered
    await screen.findByText("£5000.00");
    expect(screen.getByText("£4000.00")).toBeInTheDocument(); // 80% of 5000
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument(); // 20 + 10
  });
});